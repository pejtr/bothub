/**
 * Stripe Webhook Handler for iBots
 * Processes subscription events and updates user records
 */

import type { Express, Request, Response } from "express";
import express from "express";
import { constructWebhookEvent } from "./stripe";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { subscriptions } from "../../drizzle/schema";

/**
 * Register Stripe webhook route
 * MUST be called BEFORE express.json() middleware
 */
export function registerStripeWebhook(app: Express): void {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const signature = req.headers["stripe-signature"] as string;

      if (!signature) {
        console.warn("[Stripe Webhook] Missing stripe-signature header");
        res.status(400).json({ error: "Missing signature" });
        return;
      }

      let event;
      try {
        event = constructWebhookEvent(req.body, signature);
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
        return;
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected, returning verification response");
        res.json({ verified: true });
        return;
      }

      console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as any;
            const userId = session.metadata?.user_id;
            const planId = session.metadata?.plan_id;
            const customerId = session.customer;
            const subscriptionId = session.subscription;

            if (userId && planId && customerId && subscriptionId) {
              await handleSubscriptionCreated(
                parseInt(userId),
                planId,
                customerId as string,
                subscriptionId as string
              );
            }
            break;
          }

          case "customer.subscription.updated": {
            const subscription = event.data.object as any;
            await handleSubscriptionUpdated(subscription);
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as any;
            await handleSubscriptionCanceled(subscription);
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as any;
            console.warn(`[Stripe Webhook] Payment failed for invoice ${invoice.id}, customer ${invoice.customer}`);
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (err: any) {
        console.error(`[Stripe Webhook] Error processing ${event.type}:`, err);
        res.status(500).json({ error: "Webhook processing failed" });
      }
    }
  );
}

async function handleSubscriptionCreated(
  userId: number,
  planId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Stripe] Database not available for subscription creation");
    return;
  }

  // Update user with Stripe customer ID
  await db
    .update(users)
    .set({ stripeCustomerId })
    .where(eq(users.id, userId));

  // Create subscription record
  await db.insert(subscriptions).values({
    userId,
    planId,
    stripeCustomerId,
    stripeSubscriptionId,
    status: "active",
  });

  console.log(`[Stripe] Subscription created: user=${userId}, plan=${planId}, subscription=${stripeSubscriptionId}`);
}

async function handleSubscriptionUpdated(subscription: any): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const subscriptionId = subscription.id;
  const status = subscription.status;

  await db
    .update(subscriptions)
    .set({ status })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  console.log(`[Stripe] Subscription updated: ${subscriptionId} → ${status}`);
}

async function handleSubscriptionCanceled(subscription: any): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const subscriptionId = subscription.id;

  await db
    .update(subscriptions)
    .set({ status: "canceled" })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  console.log(`[Stripe] Subscription canceled: ${subscriptionId}`);
}
