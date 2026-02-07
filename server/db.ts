import { eq, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, emailCaptures, abTestResults, affiliateClicks,
  registrations, affiliateRegistrations
} from "../drizzle/schema";
import type {
  InsertEmailCapture, InsertAbTestResult, InsertAffiliateClick,
  InsertRegistration, InsertAffiliateRegistration
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
