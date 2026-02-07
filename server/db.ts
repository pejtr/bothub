import { eq, sql } from "drizzle-orm";
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
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

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

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

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

// Email capture
export async function captureEmail(data: InsertEmailCapture) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(emailCaptures).values(data);
}

// A/B test tracking
export async function trackAbTestEvent(testName: string, variant: string, type: "impression" | "click" | "conversion") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const field = type === "impression" ? "impressions" : type === "click" ? "clicks" : "conversions";

  await db.insert(abTestResults).values({
    testName,
    variant,
    impressions: type === "impression" ? 1 : 0,
    clicks: type === "click" ? 1 : 0,
    conversions: type === "conversion" ? 1 : 0,
  }).onDuplicateKeyUpdate({
    set: {
      [field]: sql`${abTestResults[field as keyof typeof abTestResults]} + 1`,
    },
  });
}

// Affiliate click tracking
export async function trackAffiliateClick(data: InsertAffiliateClick) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(affiliateClicks).values(data);
}

// Get email capture count
export async function getEmailCaptureCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(emailCaptures);
  return result[0]?.count ?? 0;
}

// ===== Registration (iBot plan sign-ups) =====

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

export async function getRegistrationCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(registrations);
  return result[0]?.count ?? 0;
}

// ===== Affiliate Registrations =====

function generateAffiliateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BH-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
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
