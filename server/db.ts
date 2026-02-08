import { eq, sql, desc, and, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, emailCaptures, abTestResults, affiliateClicks,
  registrations, affiliateRegistrations, userNotifications, blogPosts
} from "../drizzle/schema";
import type {
  InsertEmailCapture, InsertAbTestResult, InsertAffiliateClick,
  InsertRegistration, InsertAffiliateRegistration, InsertUserNotification,
  InsertBlogPost
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== Email capture =====
export async function captureEmail(data: InsertEmailCapture) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(emailCaptures).values(data);
}

// ===== A/B test tracking =====
export async function trackAbTestEvent(testName: string, variant: string, type: "impression" | "click" | "conversion") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const field = type === "impression" ? "impressions" : type === "click" ? "clicks" : "conversions";
  await db.insert(abTestResults).values({
    testName, variant,
    impressions: type === "impression" ? 1 : 0,
    clicks: type === "click" ? 1 : 0,
    conversions: type === "conversion" ? 1 : 0,
  }).onDuplicateKeyUpdate({
    set: { [field]: sql`${abTestResults[field as keyof typeof abTestResults]} + 1` },
  });
}

// ===== Affiliate click tracking =====
export async function trackAffiliateClick(data: InsertAffiliateClick) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(affiliateClicks).values(data);
}

// ===== Counts =====
export async function getEmailCaptureCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(emailCaptures);
  return result[0]?.count ?? 0;
}

export async function getRegistrationCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(registrations);
  return result[0]?.count ?? 0;
}

// ===== Registration =====
export async function createRegistration(data: InsertRegistration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(registrations).values(data);
  return { id: result[0].insertId };
}

export async function getRegistrationByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(registrations).where(eq(registrations.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function activateRegistration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(registrations).set({ status: "activated" }).where(eq(registrations.id, id));
}

/** Update registration with Stripe IDs after successful payment */
export async function updateRegistrationStripe(id: number, stripeCustomerId: string, stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(registrations).set({ stripeCustomerId, stripeSubscriptionId }).where(eq(registrations.id, id));
}

// ===== Affiliate Registrations =====
function generateAffiliateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BH-";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export async function createAffiliateRegistration(data: Omit<InsertAffiliateRegistration, "affiliateCode">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const affiliateCode = generateAffiliateCode();
  const result = await db.insert(affiliateRegistrations).values({ ...data, affiliateCode });
  return { id: result[0].insertId, affiliateCode };
}

export async function getAffiliateByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliateRegistrations).where(eq(affiliateRegistrations.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== ADMIN DASHBOARD QUERIES =====

/** Get dashboard overview stats */
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { registrations: 0, affiliates: 0, emails: 0, affiliateClicks: 0 };

  const [regCount, affCount, emailCount, clickCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(registrations),
    db.select({ count: sql<number>`count(*)` }).from(affiliateRegistrations),
    db.select({ count: sql<number>`count(*)` }).from(emailCaptures),
    db.select({ count: sql<number>`count(*)` }).from(affiliateClicks),
  ]);

  return {
    registrations: regCount[0]?.count ?? 0,
    affiliates: affCount[0]?.count ?? 0,
    emails: emailCount[0]?.count ?? 0,
    affiliateClicks: clickCount[0]?.count ?? 0,
  };
}

/** Get registration stats by plan */
export async function getRegistrationsByPlan() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    plan: registrations.plan,
    count: sql<number>`count(*)`,
    activated: sql<number>`SUM(CASE WHEN status = 'activated' THEN 1 ELSE 0 END)`,
    pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
  }).from(registrations).groupBy(registrations.plan);
}

/** Get A/B test results */
export async function getAbTestResults() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(abTestResults).orderBy(desc(abTestResults.updatedAt));
}

/** Get recent registrations (last 50) */
export async function getRecentRegistrations(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(registrations).orderBy(desc(registrations.createdAt)).limit(limit);
}

/** Get recent email captures (last 50) */
export async function getRecentEmailCaptures(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailCaptures).orderBy(desc(emailCaptures.capturedAt)).limit(limit);
}

/** Get affiliate partners list */
export async function getAffiliatePartners() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliateRegistrations).orderBy(desc(affiliateRegistrations.createdAt));
}

/** Get recent affiliate clicks (last 50) */
export async function getRecentAffiliateClicks(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliateClicks).orderBy(desc(affiliateClicks.clickedAt)).limit(limit);
}

/** Get registrations by day (last 30 days) */
export async function getRegistrationsByDay() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    date: sql<string>`DATE(createdAt)`.as("date"),
    count: sql<number>`count(*)`,
  }).from(registrations)
    .where(sql`createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`)
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);
}

/** Get email captures by day (last 30 days) */
export async function getEmailCapturesByDay() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    date: sql<string>`DATE(capturedAt)`.as("date"),
    count: sql<number>`count(*)`,
  }).from(emailCaptures)
    .where(sql`capturedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`)
    .groupBy(sql`DATE(capturedAt)`)
    .orderBy(sql`DATE(capturedAt)`);
}

/** Get registrations for a specific user email */
export async function getUserRegistrations(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(registrations)
    .where(eq(registrations.email, email))
    .orderBy(sql`createdAt DESC`);
}

/** Get affiliate stats for a specific partner code */
export async function getAffiliateStats(affiliateCode: string) {
  const db = await getDb();
  if (!db) return { totalClicks: 0, totalReferrals: 0, pendingCommission: 0 };

  const clicks = await db.select({
    count: sql<number>`count(*)`,
  }).from(affiliateClicks)
    .where(eq(affiliateClicks.partner, affiliateCode));

  const referrals = await db.select({
    count: sql<number>`count(*)`,
    goldCount: sql<number>`SUM(CASE WHEN plan = 'gold' THEN 1 ELSE 0 END)`,
    diamondCount: sql<number>`SUM(CASE WHEN plan = 'diamond' THEN 1 ELSE 0 END)`,
  }).from(registrations)
    .where(eq(registrations.affiliateCode, affiliateCode));

  const goldCount = referrals[0]?.goldCount ?? 0;
  const diamondCount = referrals[0]?.diamondCount ?? 0;
  const pendingCommission = (goldCount * 990 * 0.66) + (diamondCount * 2490 * 0.77);

  return {
    totalClicks: clicks[0]?.count ?? 0,
    totalReferrals: referrals[0]?.count ?? 0,
    goldReferrals: goldCount,
    diamondReferrals: diamondCount,
    pendingCommission: Math.round(pendingCommission),
  };
}

/** Get referral registrations for a specific affiliate code */
export async function getAffiliateReferrals(affiliateCode: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: registrations.id,
    email: registrations.email,
    plan: registrations.plan,
    status: registrations.status,
    createdAt: registrations.createdAt,
  }).from(registrations)
    .where(eq(registrations.affiliateCode, affiliateCode))
    .orderBy(sql`createdAt DESC`)
    .limit(50);
}

// ===== USER NOTIFICATIONS =====

/** Create a notification for a user */
export async function createNotification(data: InsertUserNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userNotifications).values(data);
}

/** Get notifications for a user (newest first) */
export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userNotifications)
    .where(eq(userNotifications.userId, userId))
    .orderBy(desc(userNotifications.createdAt))
    .limit(limit);
}

/** Count unread notifications for a user */
export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(userNotifications)
    .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, 0)));
  return result[0]?.count ?? 0;
}

/** Mark a single notification as read */
export async function markNotificationRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userNotifications)
    .set({ isRead: 1 })
    .where(and(eq(userNotifications.id, notificationId), eq(userNotifications.userId, userId)));
}

/** Mark all notifications as read for a user */
export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userNotifications)
    .set({ isRead: 1 })
    .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, 0)));
}

/** Create notification for registration status change */
export async function notifyRegistrationChange(userId: number, plan: string, status: string) {
  const titles: Record<string, string> = {
    activated: `Plán ${plan.toUpperCase()} aktivován!`,
    pending: `Registrace ${plan.toUpperCase()} přijata`,
    synced: `Plán ${plan.toUpperCase()} synchronizován`,
  };
  const messages: Record<string, string> = {
    activated: `Váš plán ${plan.toUpperCase()} byl úspěšně aktivován. Můžete začít používat iBoty!`,
    pending: `Vaše registrace pro plán ${plan.toUpperCase()} byla přijata a čeká na aktivaci.`,
    synced: `Váš plán ${plan.toUpperCase()} byl synchronizován s BotHub API.`,
  };
  await createNotification({
    userId,
    type: "registration",
    title: titles[status] || `Registrace aktualizována`,
    message: messages[status] || `Stav vaší registrace se změnil na: ${status}`,
    actionUrl: "/dashboard",
  });
}

/** Create notification for new affiliate referral */
export async function notifyNewReferral(userId: number, referralEmail: string, plan: string) {
  const commission = plan === "diamond" ? "1 917 Kč (77%)" : plan === "gold" ? "653 Kč (66%)" : "0 Kč";
  await createNotification({
    userId,
    type: "affiliate",
    title: `Nový referral: ${plan.toUpperCase()}`,
    message: `Nový zákazník se zaregistroval přes váš odkaz (${plan.toUpperCase()}). Provize: ${commission}/měs.`,
    actionUrl: "/affiliate-dashboard",
  });
}

/** Create notification for affiliate milestone */
export async function notifyAffiliateMilestone(userId: number, milestone: number, totalCommission: number) {
  await createNotification({
    userId,
    type: "milestone",
    title: `Milník dosažen: ${milestone} referralů!`,
    message: `Gratulujeme! Dosáhli jste ${milestone} referralů. Celková provize: ${totalCommission} Kč/měs.`,
    actionUrl: "/affiliate-dashboard",
  });
}

// ===== BLOG POSTS (ADMIN CRUD) =====

/** Create a new blog post */
export async function createBlogPost(data: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blogPosts).values(data);
  return { id: result[0].insertId };
}

/** Update an existing blog post */
export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

/** Delete a blog post */
export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

/** Get a single blog post by ID */
export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/** Get a single blog post by slug */
export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/** Get all blog posts (admin - includes drafts) */
export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
}

/** Get published blog posts only (public) */
export async function getPublishedBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt));
}

/** Get affiliate partner by affiliate code */
export async function getAffiliateByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliateRegistrations)
    .where(eq(affiliateRegistrations.affiliateCode, code)).limit(1);
  return result[0];
}

/** Get registration by ID */
export async function getRegistrationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(registrations)
    .where(eq(registrations.id, id)).limit(1);
  return result[0];
}
