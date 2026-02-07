import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Email captures from unlock modal and newsletter forms.
 */
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

/**
 * A/B test results for CTA buttons and other conversion elements.
 */
export const abTestResults = mysqlTable("ab_test_results", {
  id: int("id").autoincrement().primaryKey(),
  testName: varchar("testName", { length: 100 }).notNull(),
  variant: varchar("variant", { length: 50 }).notNull(),
  impressions: int("impressions").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  conversions: int("conversions").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AbTestResult = typeof abTestResults.$inferSelect;
export type InsertAbTestResult = typeof abTestResults.$inferInsert;

/**
 * Affiliate click tracking.
 */
export const affiliateClicks = mysqlTable("affiliate_clicks", {
  id: int("id").autoincrement().primaryKey(),
  partner: varchar("partner", { length: 50 }).notNull(),
  plan: varchar("plan", { length: 50 }),
  referrer: varchar("referrer", { length: 500 }),
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
});

export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertAffiliateClick = typeof affiliateClicks.$inferInsert;

/**
 * iBot registrations — user sign-ups for specific plans.
 * When BotHub API (api.bothub.cz) goes live, these records will be
 * synced/forwarded to the external API. Until then, this table serves
 * as the primary registration store.
 */
export const registrations = mysqlTable("registrations", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 200 }),
  company: varchar("company", { length: 200 }),
  plan: mysqlEnum("plan", ["free", "gold", "diamond"]).default("free").notNull(),
  source: varchar("source", { length: 100 }).default("hero_cta"),
  /** Status of the registration flow */
  status: mysqlEnum("status", ["pending", "activated", "synced"]).default("pending").notNull(),
  /** CTA variant that led to this registration (A/B test) */
  ctaVariant: varchar("ctaVariant", { length: 50 }),
  /** Affiliate partner code if referred */
  affiliateCode: varchar("affiliateCode", { length: 100 }),
  /** Stripe customer ID after successful payment */
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  /** Stripe subscription ID for recurring billing */
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  gdprConsent: int("gdprConsent").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;

/**
 * Affiliate partner registrations.
 */
export const affiliateRegistrations = mysqlTable("affiliate_registrations", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 200 }),
  company: varchar("company", { length: 200 }),
  website: varchar("website", { length: 500 }),
  /** Unique affiliate code assigned to this partner */
  affiliateCode: varchar("affiliateCode", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "active"]).default("pending").notNull(),
  gdprConsent: int("gdprConsent").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateRegistration = typeof affiliateRegistrations.$inferSelect;
export type InsertAffiliateRegistration = typeof affiliateRegistrations.$inferInsert;
