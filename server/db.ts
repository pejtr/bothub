import { eq, sql, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  emailCaptures, userNotifications, blogPosts, userWishlist, userPreferences,
} from "../drizzle/schema";
import type {
  InsertEmailCapture, InsertUserNotification, InsertBlogPost,
  InsertUserPreferences, UserPreferences,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

// ─── Email capture (gated unlock) ──────────────────────────────────────────────

export async function captureEmail(data: InsertEmailCapture) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(emailCaptures).values(data);
}

export async function getEmailCaptureCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(emailCaptures);
  return result[0]?.count ?? 0;
}

export async function getRecentEmailCaptures(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailCaptures).orderBy(desc(emailCaptures.capturedAt)).limit(limit);
}

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

// ─── User notifications ────────────────────────────────────────────────────────

export async function createNotification(data: InsertUserNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userNotifications).values(data);
}

export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userNotifications)
    .where(eq(userNotifications.userId, userId))
    .orderBy(desc(userNotifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(userNotifications)
    .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, 0)));
  return result[0]?.count ?? 0;
}

export async function markNotificationRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userNotifications)
    .set({ isRead: 1 })
    .where(and(eq(userNotifications.id, notificationId), eq(userNotifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userNotifications)
    .set({ isRead: 1 })
    .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, 0)));
}

// ─── Blog posts ────────────────────────────────────────────────────────────────

export async function createBlogPost(data: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blogPosts).values(data);
  return { id: result[0].insertId };
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
}

export async function getPublishedBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt));
}

// ─── Wishlist ──────────────────────────────────────────────────────────────────

export async function addToWishlist(userId: number, ibotId: string) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(userWishlist).where(
    and(eq(userWishlist.userId, userId), eq(userWishlist.ibotId, ibotId))
  );
  if (existing.length > 0) return existing[0];
  const result = await db.insert(userWishlist).values({ userId, ibotId });
  return { id: Number(result[0].insertId), userId, ibotId, createdAt: new Date() };
}

export async function removeFromWishlist(userId: number, ibotId: string) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(userWishlist).where(
    and(eq(userWishlist.userId, userId), eq(userWishlist.ibotId, ibotId))
  );
  return true;
}

export async function getUserWishlist(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userWishlist).where(eq(userWishlist.userId, userId)).orderBy(desc(userWishlist.createdAt));
}

export async function isInWishlist(userId: number, ibotId: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(userWishlist).where(
    and(eq(userWishlist.userId, userId), eq(userWishlist.ibotId, ibotId))
  );
  return result.length > 0;
}

export async function getWishlistCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(userWishlist).where(eq(userWishlist.userId, userId));
  return result[0]?.count || 0;
}

// ─── User preferences ──────────────────────────────────────────────────────────

export async function getUserPreferences(userId: number): Promise<UserPreferences | null> {
  const db = await getDb();
  if (!db) return null;
  let [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  if (!prefs) {
    await db.insert(userPreferences).values({ userId, weeklyDigest: 1, marketingEmails: 1 });
    [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  }
  return prefs || null;
}

export async function updateUserPreferences(userId: number, data: Partial<InsertUserPreferences>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await getUserPreferences(userId);
  await db.update(userPreferences).set(data).where(eq(userPreferences.userId, userId));
  return true;
}
