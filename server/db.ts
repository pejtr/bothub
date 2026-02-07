import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, emailCaptures, abTestResults, affiliateClicks } from "../drizzle/schema";
import type { InsertEmailCapture, InsertAbTestResult, InsertAffiliateClick } from "../drizzle/schema";
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
    const values: InsertUser = {
      openId: user.openId,
    };
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

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

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

  // Upsert: increment the counter
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
