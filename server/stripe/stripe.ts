/**
 * Stripe Service for iBots
 * Handles checkout session creation and webhook processing
 */

import Stripe from "stripe";
import { PLANS, type PlanConfig } from "./products";

// Lazy-init Stripe instance
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return _stripe;
}

export interface CreateCheckoutParams {
  planId: string;
  userId: number;
  userEmail?: string | null;
  userName?: string | null;
  origin: string;
  successPath?: string;
  cancelPath?: string;
}

/**
 * Create a Stripe Checkout Session for a subscription plan
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<string> {
  const { planId, userId, userEmail, userName, origin, successPath = "/payment/success", cancelPath = "/payment/cancel" } = params;

  const plan = PLANS[planId];
  if (!plan) {
    throw new Error(`Unknown plan: ${planId}`);
  }

  const stripe = getStripe();

  // Create or find the product + price dynamically
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    allow_promotion_codes: true,
    customer_email: userEmail || undefined,
    client_reference_id: userId.toString(),
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail || "",
      customer_name: userName || "",
      plan_id: planId,
    },
    line_items: [
      {
        price_data: {
          currency: plan.currency,
          product_data: {
            name: plan.name,
            description: plan.description,
            metadata: plan.metadata,
          },
          unit_amount: plan.priceAmount,
          recurring: {
            interval: plan.interval,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${cancelPath}`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return session.url;
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  });
}

/**
 * Get customer's active subscriptions
 */
export async function getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
  });
  return subscriptions.data;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Create a billing portal session for customer self-service
 */
export async function createBillingPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

/**
 * Verify and construct webhook event
 */
export function constructWebhookEvent(
  payload: Buffer,
  signature: string,
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
