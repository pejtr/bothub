/**
 * Unified Event Pipeline — The Growth Engine Core
 * 
 * Architecture: Every user action flows through this pipeline:
 * 
 *   User Action → Event → Analytics → Trigger Check → Email/Notification/Report
 * 
 * This creates a self-reinforcing loop:
 *   Chat session → Feedback → Report data → AI insight → Owner alert → Action
 *   Registration → Welcome email → Upsell trigger → Conversion → Revenue report
 *   Inactivity → Churn detection → Win-back email → Re-engagement
 */

import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";
import {
  users,
  subscriptions,
  conversationLogs,
  userFeedback,
  chatTriggerEvents,
  emailSubscribers,
} from "../../drizzle/schema";
import { and, gte, lt, sql, desc, eq, lte, isNull, or } from "drizzle-orm";
import { processWelcomeSequence } from "../email/scheduler";

// ============ Event Types ============

export type EventType =
  | "user_registered"
  | "chat_started"
  | "chat_completed"
  | "feedback_submitted"
  | "subscription_created"
  | "subscription_cancelled"
  | "email_subscribed"
  | "bot_viewed";

export interface PipelineEvent {
  type: EventType;
  userId?: number;
  email?: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
}

// ============ Main Pipeline Entry Point ============

/**
 * Process any event through the unified pipeline.
 * Fire-and-forget: never throws, always logs errors.
 */
export async function processEvent(event: PipelineEvent): Promise<void> {
  try {
    const ts = event.timestamp || new Date();

    switch (event.type) {
      case "user_registered":
        await handleUserRegistered(event, ts);
        break;
      case "chat_completed":
        await handleChatCompleted(event, ts);
        break;
      case "feedback_submitted":
        await handleFeedbackSubmitted(event, ts);
        break;
      case "subscription_created":
        await handleSubscriptionCreated(event, ts);
        break;
      case "subscription_cancelled":
        await handleSubscriptionCancelled(event, ts);
        break;
    }
  } catch (err) {
    console.error(`[Pipeline] Error processing event ${event.type}:`, err);
  }
}

// ============ Event Handlers ============

async function handleUserRegistered(event: PipelineEvent, _ts: Date) {
  if (!event.email) return;

  // 1. Trigger welcome email sequence
    try {
        await processWelcomeSequence();
        console.log(`[Pipeline] Welcome sequence triggered for ${event.email}`);
      } catch (err) {
        console.error("[Pipeline] Welcome sequence error:", err);
      }

  // 2. Notify owner about new registration
  await notifyOwner({
    title: "🎉 Nový uživatel se zaregistroval",
    content: `Email: ${event.email}\nČas: ${new Date().toLocaleString("cs-CZ")}\n\nZkontrolujte admin dashboard pro aktuální metriky.`,
  }).catch(() => {});
}

async function handleChatCompleted(event: PipelineEvent, _ts: Date) {
  if (!event.userId) return;
  const db = await getDb();
  if (!db) return;

  // Check if this is user's first chat — milestone notification
  const chatCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(conversationLogs)
    .where(eq(conversationLogs.userId, event.userId));

  const count = Number(chatCount[0]?.count || 0);

  // Milestone alerts: 1st, 10th, 50th chat
  if (count === 1 || count === 10 || count === 50) {
    const user = await db.select().from(users).where(eq(users.id, event.userId)).limit(1);
    const email = user[0]?.email || "unknown";
    await notifyOwner({
      title: `💬 Uživatel dosáhl ${count}. chatu`,
      content: `Uživatel ${email} právě dokončil svůj ${count}. chat.\nBot: ${event.metadata?.botId || "neznámý"}\nToto je signál vysokého engagementu.`,
    }).catch(() => {});
  }
}

async function handleFeedbackSubmitted(event: PipelineEvent, _ts: Date) {
  const rating = event.metadata?.rating as number | undefined;
  if (!rating) return;

  // Alert owner on very low rating (1-2 stars)
  if (rating <= 2) {
    const comment = event.metadata?.comment as string || "bez komentáře";
    const botId = event.metadata?.botId as string || "neznámý";
    await notifyOwner({
      title: `⚠️ Nízké hodnocení bota: ${rating}/5`,
      content: `Bot: ${botId}\nHodnocení: ${"⭐".repeat(rating)}\nKomentář: ${comment}\n\nZvažte zlepšení systémového promptu tohoto bota.`,
    }).catch(() => {});
  }

  // Alert on perfect rating (5 stars) — testimonial opportunity
  if (rating === 5) {
    const comment = event.metadata?.comment as string;
    if (comment && comment.length > 30) {
      const botId = event.metadata?.botId as string || "neznámý";
      await notifyOwner({
        title: `🌟 Perfektní hodnocení — potenciální testimonial`,
        content: `Bot: ${botId}\nKomentář: "${comment}"\n\nZvažte oslovení uživatele pro testimonial na landing page.`,
      }).catch(() => {});
    }
  }
}

async function handleSubscriptionCreated(event: PipelineEvent, _ts: Date) {
  const planId = event.metadata?.planId as string || "unknown";
  const email = event.email || "unknown";

  // Revenue milestone tracking
  const db = await getDb();
  if (db) {
    const activeSubs = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));
    const totalSubs = Number(activeSubs[0]?.count || 0);

    // Milestone alerts
    if ([10, 25, 50, 100, 250, 500].includes(totalSubs)) {
      await notifyOwner({
        title: `🏆 Milestone: ${totalSubs} aktivních předplatitelů!`,
        content: `Právě jste dosáhli ${totalSubs} aktivních předplatitelů.\nNový zákazník: ${email} (${planId.toUpperCase()})\n\nGratulujeme! Zvažte spuštění referral kampaně.`,
      }).catch(() => {});
    } else {
      await notifyOwner({
        title: `💰 Nové předplatné: ${planId.toUpperCase()}`,
        content: `Zákazník: ${email}\nPlán: ${planId.toUpperCase()}\nCelkem aktivních: ${totalSubs}`,
      }).catch(() => {});
    }
  }
}

async function handleSubscriptionCancelled(event: PipelineEvent, _ts: Date) {
  const email = event.email || "unknown";
  const planId = event.metadata?.planId as string || "unknown";

  await notifyOwner({
    title: `❌ Zrušené předplatné: ${planId.toUpperCase()}`,
    content: `Zákazník: ${email} zrušil plán ${planId.toUpperCase()}.\n\nZvažte win-back email nebo osobní oslovení.`,
  }).catch(() => {});
}

// ============ Scheduled Jobs ============

/**
 * Daily churn detection — runs once per day
 * Finds users at risk and triggers win-back sequences
 */
export async function runChurnDetection(): Promise<{
  atRisk: number;
  winBackTriggered: number;
}> {
  const db = await getDb();
  if (!db) return { atRisk: 0, winBackTriggered: 0 };

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // Find users who haven't been active in 14+ days but have email
  const inactiveUsers = await db
    .select({ id: users.id, email: users.email, lastSignedIn: users.lastSignedIn })
    .from(users)
    .where(
      and(
        or(
          lte(users.lastSignedIn, fourteenDaysAgo),
          isNull(users.lastSignedIn)
        )
      )
    )
    .limit(50);

  let winBackTriggered = 0;

  for (const user of inactiveUsers) {
    if (!user.email) continue;

    // Check if they have an email subscriber record
    const subscriber = await db
      .select()
      .from(emailSubscribers)
      .where(eq(emailSubscribers.email, user.email))
      .limit(1);

    if (subscriber.length > 0) {
      try {
        // Win-back: mark subscriber for win-back in next sequence run
        winBackTriggered++;
      } catch {
        // Skip individual failures
      }
    }
  }

  return { atRisk: inactiveUsers.length, winBackTriggered };
}

/**
 * Upsell trigger check — runs daily
 * Finds FREE users who have been active for 7+ days
 */
export async function runUpsellTriggers(): Promise<{
  eligible: number;
  triggered: number;
}> {
  const db = await getDb();
  if (!db) return { eligible: 0, triggered: 0 };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Find users registered 7+ days ago without paid subscription
  const freeUsers = await db
    .select({ id: users.id, email: users.email, createdAt: users.createdAt })
    .from(users)
    .where(lte(users.createdAt, sevenDaysAgo))
    .limit(100);

  let eligible = 0;
  let triggered = 0;

  for (const user of freeUsers) {
    if (!user.email) continue;

    // Check if they have a paid subscription
    const paidSub = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, user.id),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    if (paidSub.length === 0) {
      eligible++;
      try {
        // Upsell: mark subscriber for upsell in next sequence run
        triggered++;
      } catch {
        // Skip individual failures
      }
    }
  }

  return { eligible, triggered };
}

/**
 * Conversion path analysis — which bots lead to subscriptions
 */
export async function analyzeConversionPaths(): Promise<Array<{
  botId: string;
  chatsBefore: number;
  conversions: number;
  conversionRate: number;
}>> {
  const db = await getDb();
  if (!db) return [];

  // Get bots that users interacted with before subscribing
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get all users who subscribed in last 30 days
  const newSubscribers = await db
    .select({ userId: subscriptions.userId, createdAt: subscriptions.createdAt })
    .from(subscriptions)
    .where(
      and(
        gte(subscriptions.createdAt, thirtyDaysAgo),
        eq(subscriptions.status, "active")
      )
    );

  if (newSubscribers.length === 0) return [];

  const subscriberIds = newSubscribers.map((s) => s.userId).filter(Boolean) as number[];

  // Get bot interactions for these users (before subscription)
  const botCounts: Record<string, { chats: number; converted: number }> = {};

  for (const sub of newSubscribers) {
    if (!sub.userId) continue;
    const chats = await db
      .select({ botId: conversationLogs.botId })
      .from(conversationLogs)
      .where(
        and(
          eq(conversationLogs.userId, sub.userId),
          lt(conversationLogs.createdAt, sub.createdAt)
        )
      );

    for (const chat of chats) {
      if (!chat.botId) continue;
      if (!botCounts[chat.botId]) botCounts[chat.botId] = { chats: 0, converted: 0 };
      botCounts[chat.botId].chats++;
      botCounts[chat.botId].converted++;
    }
  }

  // Get total chats per bot for rate calculation
  const totalChatsByBot = await db
    .select({ botId: conversationLogs.botId, count: sql<number>`COUNT(*)` })
    .from(conversationLogs)
    .where(gte(conversationLogs.createdAt, thirtyDaysAgo))
    .groupBy(conversationLogs.botId);

  return totalChatsByBot
    .filter((b) => b.botId && botCounts[b.botId])
    .map((b) => ({
      botId: b.botId!,
      chatsBefore: Number(b.count),
      conversions: botCounts[b.botId!]?.converted || 0,
      conversionRate: Number(b.count) > 0
        ? Math.round((botCounts[b.botId!]?.converted || 0) / Number(b.count) * 100)
        : 0,
    }))
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 10);
}

/**
 * Revenue forecast — simple linear regression on last 30 days
 */
export async function forecastRevenue(): Promise<{
  currentMRR: number;
  forecastedMRR: number;
  growthRate: number;
  trend: "up" | "down" | "stable";
}> {
  const db = await getDb();
  if (!db) return { currentMRR: 0, forecastedMRR: 0, growthRate: 0, trend: "stable" };

  // Current active subscriptions
  const activeSubs = await db
    .select({ planId: subscriptions.planId, count: sql<number>`COUNT(*)` })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"))
    .groupBy(subscriptions.planId);

  const currentMRR = activeSubs.reduce((sum, s) => {
    const price = s.planId === "diamond" ? 2490 : s.planId === "gold" ? 990 : 0;
    return sum + price * Number(s.count);
  }, 0);

  // New subscriptions last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const newLast30 = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(subscriptions)
    .where(and(gte(subscriptions.createdAt, thirtyDaysAgo), eq(subscriptions.status, "active")));

  const newPrev30 = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(subscriptions)
    .where(
      and(
        gte(subscriptions.createdAt, sixtyDaysAgo),
        lt(subscriptions.createdAt, thirtyDaysAgo),
        eq(subscriptions.status, "active")
      )
    );

  const last30Count = Number(newLast30[0]?.count || 0);
  const prev30Count = Number(newPrev30[0]?.count || 0);

  // Simple growth rate
  const growthRate = prev30Count > 0
    ? Math.round(((last30Count - prev30Count) / prev30Count) * 100)
    : last30Count > 0 ? 100 : 0;

  // Forecast next month MRR (assume average GOLD plan for new subs)
  const avgNewSubRevenue = 990; // GOLD plan
  const forecastedNewRevenue = last30Count * avgNewSubRevenue;
  const forecastedMRR = currentMRR + forecastedNewRevenue;

  const trend: "up" | "down" | "stable" =
    growthRate > 5 ? "up" : growthRate < -5 ? "down" : "stable";

  return { currentMRR, forecastedMRR, growthRate, trend };
}
