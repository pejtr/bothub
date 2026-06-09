import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscriptions table - tracks active/canceled Stripe subscriptions
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: varchar("planId", { length: 64 }).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }).notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }).notNull().unique(),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Email subscribers from lead magnet capture
 */
export const emailSubscribers = mysqlTable("email_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name"),
  source: varchar("source", { length: 64 }).default("landing_page"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = typeof emailSubscribers.$inferInsert;

/**
 * Affiliate partners - registered affiliate users
 */
export const affiliatePartners = mysqlTable("affiliate_partners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  affiliateCode: varchar("affiliateCode", { length: 32 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "active", "suspended"]).default("pending").notNull(),
  paymentEmail: varchar("paymentEmail", { length: 320 }),
  totalEarnings: bigint("totalEarnings", { mode: "number" }).default(0).notNull(), // in haléře
  totalPaidOut: bigint("totalPaidOut", { mode: "number" }).default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliatePartner = typeof affiliatePartners.$inferSelect;
export type InsertAffiliatePartner = typeof affiliatePartners.$inferInsert;

/**
 * Affiliate clicks - tracks link clicks
 */
export const affiliateClicks = mysqlTable("affiliate_clicks", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  referrerUrl: text("referrerUrl"),
  userAgent: text("userAgent"),
  ipHash: varchar("ipHash", { length: 64 }), // hashed for privacy
  source: varchar("source", { length: 32 }).default("ibots"), // cross-platform: 'ibots' | 'bothub'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliateClick = typeof affiliateClicks.$inferSelect;

/**
 * Affiliate conversions - tracks successful referral purchases
 */
export const affiliateConversions = mysqlTable("affiliate_conversions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  referredUserId: int("referredUserId").notNull(),
  planId: varchar("planId", { length: 64 }).notNull(),
  saleAmount: bigint("saleAmount", { mode: "number" }).notNull(), // in haléře
  commissionRate: int("commissionRate").notNull(), // percentage (66 or 77)
  commissionAmount: bigint("commissionAmount", { mode: "number" }).notNull(), // in haléře
  status: mysqlEnum("conversionStatus", ["pending", "confirmed", "paid", "refunded"]).default("pending").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  source: varchar("conversionSource", { length: 32 }).default("ibots"), // cross-platform: 'ibots' | 'bothub'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateConversion = typeof affiliateConversions.$inferSelect;

/**
 * A/B test variants - stores which variant a user sees
 */
export const abTestAssignments = mysqlTable("ab_test_assignments", {
  id: int("id").autoincrement().primaryKey(),
  testName: varchar("testName", { length: 64 }).notNull(),
  variant: varchar("variant", { length: 32 }).notNull(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(), // anonymous visitor hash
  converted: boolean("converted").default(false).notNull(),
  conversionValue: bigint("conversionValue", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ABTestAssignment = typeof abTestAssignments.$inferSelect;

/**
 * Proactive chat triggers - tracks user behavior events
 */
export const chatTriggerEvents = mysqlTable("chat_trigger_events", {
  id: int("id").autoincrement().primaryKey(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(), // scroll_depth, time_on_page, exit_intent, etc.
  eventData: text("eventData"), // JSON string with event details
  pageUrl: text("pageUrl"),
  botTriggered: varchar("botTriggered", { length: 64 }), // which bot was suggested
  interacted: boolean("interacted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatTriggerEvent = typeof chatTriggerEvents.$inferSelect;

/**
 * Conversation logs - stores chat sessions with iBots
 */
export const conversationLogs = mysqlTable("conversation_logs", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  botId: varchar("botId", { length: 64 }).notNull(),
  userId: int("userId"), // null for anonymous
  visitorId: varchar("visitorId", { length: 64 }), // anonymous visitor hash
  messageCount: int("messageCount").default(0).notNull(),
  firstMessage: text("firstMessage"), // first user message for topic analysis
  topicsJson: text("topicsJson"), // JSON array of detected topics
  durationSeconds: int("durationSeconds").default(0),
  planAtTime: varchar("planAtTime", { length: 32 }).default("free"), // user plan during chat
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConversationLog = typeof conversationLogs.$inferSelect;
export type InsertConversationLog = typeof conversationLogs.$inferInsert;

/**
 * User feedback - ratings and comments after bot conversations
 */
export const userFeedback = mysqlTable("user_feedback", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  botId: varchar("botId", { length: 64 }).notNull(),
  userId: int("userId"), // null for anonymous
  visitorId: varchar("visitorId", { length: 64 }),
  rating: int("rating").notNull(), // 1-5 stars
  comment: text("comment"), // optional text feedback
  wouldRecommend: boolean("wouldRecommend"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = typeof userFeedback.$inferInsert;

/**
 * Daily reports - automated daily/weekly analytics snapshots
 */
export const dailyReports = mysqlTable("daily_reports", {
  id: int("id").autoincrement().primaryKey(),
  reportDate: varchar("reportDate", { length: 10 }).notNull(), // YYYY-MM-DD
  reportType: mysqlEnum("reportType", ["daily", "weekly"]).default("daily").notNull(),
  newUsers: int("newUsers").default(0).notNull(),
  activeUsers: int("activeUsers").default(0).notNull(),
  newSubscriptions: int("newSubscriptions").default(0).notNull(),
  revenue: bigint("revenue", { mode: "number" }).default(0).notNull(), // in haléře
  chatSessions: int("chatSessions").default(0).notNull(),
  avgRating: int("avgRating").default(0), // stored as 10x (e.g. 45 = 4.5 stars)
  topBotsJson: text("topBotsJson"), // JSON array of top performing bots
  aiSummary: text("aiSummary"), // AI-generated strategic summary
  strategicRecommendations: text("strategicRecommendations"), // AI recommendations
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyReport = typeof dailyReports.$inferSelect;
export type InsertDailyReport = typeof dailyReports.$inferInsert;

// ─── Ported from BOTHUB: blog, wishlist, preferences, notifications, email capture ─

export const emailCaptures = mysqlTable("email_captures", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  source: varchar("source", { length: 50 }).default("unlock_modal"),
  variant: varchar("variant", { length: 50 }),
  gdprConsent: int("gdprConsent").default(0).notNull(),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
});
export type EmailCapture = typeof emailCaptures.$inferSelect;
export type InsertEmailCapture = typeof emailCaptures.$inferInsert;

export const userNotifications = mysqlTable("user_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["registration", "affiliate", "milestone", "system", "payment"]).default("system").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(),
  actionUrl: varchar("actionUrl", { length: 500 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = typeof userNotifications.$inferInsert;

export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  titleCs: varchar("titleCs", { length: 300 }).notNull(),
  titleEn: varchar("titleEn", { length: 300 }),
  contentCs: text("contentCs").notNull(),
  contentEn: text("contentEn"),
  excerptCs: text("excerptCs"),
  excerptEn: text("excerptEn"),
  metaDescriptionCs: varchar("metaDescriptionCs", { length: 300 }),
  metaDescriptionEn: varchar("metaDescriptionEn", { length: 300 }),
  category: varchar("category", { length: 100 }),
  coverImage: varchar("coverImage", { length: 500 }),
  author: varchar("author", { length: 200 }).default("BOTHUB Team"),
  status: mysqlEnum("blogStatus", ["draft", "published"]).default("draft").notNull(),
  readingTime: int("readingTime").default(5),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

export const userWishlist = mysqlTable("user_wishlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ibotId: varchar("ibotId", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type WishlistItem = typeof userWishlist.$inferSelect;
export type InsertWishlistItem = typeof userWishlist.$inferInsert;

export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  weeklyDigest: int("weeklyDigest").default(1).notNull(),
  marketingEmails: int("marketingEmails").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;
