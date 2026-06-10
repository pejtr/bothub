import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createCheckoutSession, getCheckoutSession, createBillingPortalSession } from "./stripe/stripe";
import { PLANS } from "./stripe/products";
import { chat } from "./bothub/bothub";
import { generateSSOToken, buildSSORedirectUrl } from "./sso/sso";
import { getSequenceSummary, getSequenceStatus, processWelcomeSequence } from "./email/scheduler";
import { WELCOME_SEQUENCE } from "./email/welcome-sequence";
import { getDb } from "./db";
import {
  getUserNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead,
  getAllBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost,
  getPublishedBlogPosts, getBlogPostBySlug,
  getUserPreferences, updateUserPreferences,
  addToWishlist, removeFromWishlist, getUserWishlist, isInWishlist, getWishlistCount,
} from "./db";
import {
  subscriptions,
  emailSubscribers, 
  affiliatePartners, 
  affiliateClicks, 
  affiliateConversions,
  abTestAssignments,
  chatTriggerEvents,
  conversationLogs,
  userFeedback,
  dailyReports,
  users
} from "../drizzle/schema";
import { eq, and, gte, lte, lt, desc, sql } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Stripe subscription procedures
  stripe: router({
    getPlans: publicProcedure.query(() => {
      return Object.entries(PLANS).map(([key, plan]) => ({
        id: key,
        name: plan.name,
        description: plan.description,
        priceAmount: plan.priceAmount,
        currency: plan.currency,
        interval: plan.interval,
        features: plan.features,
      }));
    }),

    createCheckout: protectedProcedure
      .input(z.object({
        planId: z.string(),
        origin: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const url = await createCheckoutSession({
          planId: input.planId,
          userId: ctx.user.id,
          userEmail: ctx.user.email,
          userName: ctx.user.name,
          origin: input.origin,
        });
        return { url };
      }),

    getSession: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const session = await getCheckoutSession(input.sessionId);
        return {
          id: session.id,
          status: session.status,
          customerEmail: session.customer_email,
          planId: session.metadata?.plan_id,
        };
      }),

    getSubscription: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);

      if (result.length === 0) return null;

      return {
        id: result[0].id,
        planId: result[0].planId,
        status: result[0].status,
        createdAt: result[0].createdAt,
      };
    }),

    createPortalSession: protectedProcedure
      .input(z.object({ origin: z.string() }))
      .mutation(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, ctx.user.id))
          .limit(1);

        if (result.length === 0) {
          throw new Error("No active subscription found");
        }

        const url = await createBillingPortalSession(
          result[0].stripeCustomerId,
          `${ctx.req.headers.origin || ""}/#cenik`
        );
        return { url };
      }),
  }),

  // Chat with iBots (BotHub API)
  chat: router({
    send: publicProcedure
      .input(z.object({
        botId: z.string(),
        botName: z.string(),
        botSpecialty: z.string(),
        botPersonality: z.string().optional(),
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const response = await chat({
          botId: input.botId,
          botName: input.botName,
          botSpecialty: input.botSpecialty,
          botPersonality: input.botPersonality,
          messages: input.messages,
        });
        return response;
      }),
  }),

  // Email capture for lead magnet
  email: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          console.warn("[Email] Database not available");
          return { success: true };
        }

        try {
          await db.insert(emailSubscribers).values({
            email: input.email,
            name: input.name || null,
            source: input.source || "landing_page",
          }).onDuplicateKeyUpdate({
            set: { name: input.name || null },
          });
        } catch (err) {
          console.error("[Email] Failed to save subscriber:", err);
        }

        return { success: true };
      }),
  }),

  // Affiliate partner dashboard
  affiliate: router({
    getMyStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(affiliatePartners)
        .where(eq(affiliatePartners.userId, ctx.user.id))
        .limit(1);

      if (result.length === 0) return null;

      return {
        id: result[0].id,
        affiliateCode: result[0].affiliateCode,
        status: result[0].status,
        totalEarnings: result[0].totalEarnings,
        totalPaidOut: result[0].totalPaidOut,
        createdAt: result[0].createdAt,
      };
    }),

    getConversions: protectedProcedure
      .input(z.object({
        range: z.enum(["7d", "30d", "90d", "all"]),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];

        // Get affiliate partner
        const partner = await db
          .select()
          .from(affiliatePartners)
          .where(eq(affiliatePartners.userId, ctx.user.id))
          .limit(1);

        if (partner.length === 0) return [];

        const now = new Date();
        const rangeMap: Record<string, number> = {
          "7d": 7,
          "30d": 30,
          "90d": 90,
        };

        const days = rangeMap[input.range];
        let conditions = [eq(affiliateConversions.affiliateId, partner[0].id)];

        if (days) {
          const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          conditions.push(gte(affiliateConversions.createdAt, startDate));
        }

        const result = await db
          .select()
          .from(affiliateConversions)
          .where(and(...conditions))
          .orderBy(desc(affiliateConversions.createdAt));

        return result.map(r => ({
          id: r.id,
          planId: r.planId,
          saleAmount: r.saleAmount,
          commissionRate: r.commissionRate,
          commissionAmount: r.commissionAmount,
          status: r.status,
          createdAt: r.createdAt,
        }));
      }),

    getClicks: protectedProcedure
      .input(z.object({
        range: z.enum(["7d", "30d", "90d", "all"]),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];

        const partner = await db
          .select()
          .from(affiliatePartners)
          .where(eq(affiliatePartners.userId, ctx.user.id))
          .limit(1);

        if (partner.length === 0) return [];

        const now = new Date();
        const rangeMap: Record<string, number> = {
          "7d": 7,
          "30d": 30,
          "90d": 90,
        };

        const days = rangeMap[input.range];
        let conditions = [eq(affiliateClicks.affiliateId, partner[0].id)];

        if (days) {
          const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          conditions.push(gte(affiliateClicks.createdAt, startDate));
        }

        const result = await db
          .select()
          .from(affiliateClicks)
          .where(and(...conditions))
          .orderBy(desc(affiliateClicks.createdAt));

        return result.map(r => ({
          id: r.id,
          referrerUrl: r.referrerUrl,
          createdAt: r.createdAt,
        }));
      }),

    // Leaderboard - public anonymized ranking of top affiliates
    getLeaderboard: publicProcedure
      .input(z.object({
        period: z.enum(["monthly", "alltime"]).default("alltime"),
        limit: z.number().min(1).max(50).default(10),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        // For monthly, we need to aggregate conversions from this month
        if (input.period === "monthly") {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const monthlyData = await db
            .select({
              affiliateId: affiliateConversions.affiliateId,
              totalSales: sql<number>`COUNT(*)`.as("totalSales"),
              totalEarnings: sql<number>`SUM(${affiliateConversions.commissionAmount})`.as("totalEarnings"),
              totalRevenue: sql<number>`SUM(${affiliateConversions.saleAmount})`.as("totalRevenue"),
            })
            .from(affiliateConversions)
            .where(
              and(
                gte(affiliateConversions.createdAt, startOfMonth),
                eq(affiliateConversions.status, "confirmed")
              )
            )
            .groupBy(affiliateConversions.affiliateId)
            .orderBy(sql`totalEarnings DESC`)
            .limit(input.limit);

          // Get partner names
          const results = [];
          for (const entry of monthlyData) {
            const partner = await db
              .select({ userId: affiliatePartners.userId })
              .from(affiliatePartners)
              .where(eq(affiliatePartners.id, entry.affiliateId))
              .limit(1);

            if (partner.length > 0) {
              const user = await db
                .select({ name: users.name })
                .from(users)
                .where(eq(users.id, partner[0].userId))
                .limit(1);

              results.push({
                rank: results.length + 1,
                displayName: anonymizeName(user[0]?.name || "Partner"),
                totalSales: entry.totalSales || 0,
                totalEarnings: entry.totalEarnings || 0,
                totalRevenue: entry.totalRevenue || 0,
              });
            }
          }
          return results;
        }

        // All-time leaderboard from affiliate_partners table
        const partners = await db
          .select({
            id: affiliatePartners.id,
            userId: affiliatePartners.userId,
            totalEarnings: affiliatePartners.totalEarnings,
          })
          .from(affiliatePartners)
          .where(eq(affiliatePartners.status, "active"))
          .orderBy(desc(affiliatePartners.totalEarnings))
          .limit(input.limit);

        const results = [];
        for (const partner of partners) {
          if (partner.totalEarnings <= 0) continue;

          const user = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, partner.userId))
            .limit(1);

          // Count total conversions
          const convCount = await db
            .select({ count: sql<number>`COUNT(*)`.as("count") })
            .from(affiliateConversions)
            .where(eq(affiliateConversions.affiliateId, partner.id));

          results.push({
            rank: results.length + 1,
            displayName: anonymizeName(user[0]?.name || "Partner"),
            totalSales: convCount[0]?.count || 0,
            totalEarnings: partner.totalEarnings,
            totalRevenue: 0, // not tracked in alltime summary
          });
        }
        return results;
      }),

    // Track affiliate click with cross-platform source
    trackClick: publicProcedure
      .input(z.object({
        affiliateCode: z.string(),
        source: z.enum(["ibots", "bothub", "direct"]).default("ibots"),
        referrerUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        // Find affiliate by code (supports both BH- and ib- prefixes)
        const partner = await db
          .select()
          .from(affiliatePartners)
          .where(eq(affiliatePartners.affiliateCode, input.affiliateCode))
          .limit(1);

        if (partner.length === 0) return { success: false, error: "Invalid affiliate code" };

        await db.insert(affiliateClicks).values({
          affiliateId: partner[0].id,
          referrerUrl: input.referrerUrl || null,
          userAgent: ctx.req.headers["user-agent"] || null,
          source: input.source,
        });

        return { success: true, affiliateId: partner[0].id };
      }),

    // Get cross-platform stats (for affiliate dashboard)
    getCrossPlatformStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const partner = await db
        .select()
        .from(affiliatePartners)
        .where(eq(affiliatePartners.userId, ctx.user.id))
        .limit(1);

      if (partner.length === 0) return null;

      // Get clicks by source
      const clicksBySource = await db
        .select({
          source: affiliateClicks.source,
          count: sql<number>`COUNT(*)`.as("count"),
        })
        .from(affiliateClicks)
        .where(eq(affiliateClicks.affiliateId, partner[0].id))
        .groupBy(affiliateClicks.source);

      // Get conversions by source
      const conversionsBySource = await db
        .select({
          source: affiliateConversions.source,
          count: sql<number>`COUNT(*)`.as("count"),
          totalAmount: sql<number>`SUM(${affiliateConversions.commissionAmount})`.as("totalAmount"),
        })
        .from(affiliateConversions)
        .where(eq(affiliateConversions.affiliateId, partner[0].id))
        .groupBy(affiliateConversions.source);

      return {
        clicks: {
          ibots: clicksBySource.find(c => c.source === "ibots")?.count || 0,
          bothub: clicksBySource.find(c => c.source === "bothub")?.count || 0,
          total: clicksBySource.reduce((sum, c) => sum + (c.count || 0), 0),
        },
        conversions: {
          ibots: {
            count: conversionsBySource.find(c => c.source === "ibots")?.count || 0,
            amount: conversionsBySource.find(c => c.source === "ibots")?.totalAmount || 0,
          },
          bothub: {
            count: conversionsBySource.find(c => c.source === "bothub")?.count || 0,
            amount: conversionsBySource.find(c => c.source === "bothub")?.totalAmount || 0,
          },
        },
      };
    }),

    register: protectedProcedure
      .input(z.object({
        paymentEmail: z.string().email().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Check if already registered
        const existing = await db
          .select()
          .from(affiliatePartners)
          .where(eq(affiliatePartners.userId, ctx.user.id))
          .limit(1);

        if (existing.length > 0) {
          return { affiliateCode: existing[0].affiliateCode, alreadyRegistered: true };
        }

        // Generate unique affiliate code
        const code = `ib-${ctx.user.id}-${Math.random().toString(36).substring(2, 8)}`;

        await db.insert(affiliatePartners).values({
          userId: ctx.user.id,
          affiliateCode: code,
          paymentEmail: input.paymentEmail || ctx.user.email || null,
          status: "active",
        });

        return { affiliateCode: code, alreadyRegistered: false };
      }),
  }),

  // Email Welcome Sequence
  emailSequence: router({
    getSummary: publicProcedure.query(() => {
      return getSequenceSummary();
    }),

    getSubscriberStatus: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;

        const subscriber = await db
          .select()
          .from(emailSubscribers)
          .where(eq(emailSubscribers.email, input.email))
          .limit(1);

        if (subscriber.length === 0) return null;

        return getSequenceStatus(
          subscriber[0].email,
          subscriber[0].createdAt,
          [] // In production, track sent emails in DB
        );
      }),

    // Admin: trigger sequence processing
    processSequence: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      return processWelcomeSequence();
    }),
  }),

  // SSO Cross-Platform
  sso: router({
    generateToken: protectedProcedure
      .input(z.object({
        targetPlatform: z.enum(["ibots", "bothub"]),
        returnPath: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ssoToken = await generateSSOToken({
          openId: ctx.user.openId,
          name: ctx.user.name || "",
          email: ctx.user.email || null,
          sourcePlatform: "ibots",
          targetPlatform: input.targetPlatform,
        });

        // Use origin from request for dynamic base URL
        const targetBaseUrl = input.targetPlatform === "bothub"
          ? "https://bothub.cz"
          : ctx.req.headers.origin || "https://ibots.manus.space";

        const redirectUrl = buildSSORedirectUrl(
          targetBaseUrl,
          ssoToken,
          input.returnPath || "/"
        );

        return { ssoToken, redirectUrl };
      }),
  }),

  // A/B Testing
  abtest: router({
    getVariant: publicProcedure
      .input(z.object({
        testName: z.string(),
        visitorId: z.string(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          // Default variant when DB unavailable
          return { variant: "control", testName: input.testName };
        }

        // Check existing assignment
        const existing = await db
          .select()
          .from(abTestAssignments)
          .where(
            and(
              eq(abTestAssignments.testName, input.testName),
              eq(abTestAssignments.visitorId, input.visitorId)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          return { variant: existing[0].variant, testName: input.testName };
        }

        // Assign new variant (3-way split: 33/33/34)
        const rand = Math.random();
        const variant = rand < 0.33 ? "control" : rand < 0.66 ? "variant_b" : "variant_c";

        await db.insert(abTestAssignments).values({
          testName: input.testName,
          variant,
          visitorId: input.visitorId,
        });

        return { variant, testName: input.testName };
      }),

    recordConversion: publicProcedure
      .input(z.object({
        testName: z.string(),
        visitorId: z.string(),
        conversionValue: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        await db
          .update(abTestAssignments)
          .set({ 
            converted: true,
            conversionValue: input.conversionValue,
          })
          .where(
            and(
              eq(abTestAssignments.testName, input.testName),
              eq(abTestAssignments.visitorId, input.visitorId)
            )
          );

        return { success: true };
      }),
  }),

  // Admin Analytics Dashboard
  adminAnalytics: router({
    // A/B Test Results
    abTestResults: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const db = await getDb();
      if (!db) return { tests: [] };

      const results = await db
        .select({
          testName: abTestAssignments.testName,
          variant: abTestAssignments.variant,
          total: sql<number>`COUNT(*)`,
          converted: sql<number>`SUM(CASE WHEN ${abTestAssignments.converted} = true THEN 1 ELSE 0 END)`,
          totalValue: sql<number>`COALESCE(SUM(${abTestAssignments.conversionValue}), 0)`,
        })
        .from(abTestAssignments)
        .groupBy(abTestAssignments.testName, abTestAssignments.variant);

      // Group by test name
      const testsMap = new Map<string, Array<{
        variant: string;
        total: number;
        converted: number;
        conversionRate: number;
        totalValue: number;
      }>>();

      for (const row of results) {
        const testName = row.testName;
        if (!testsMap.has(testName)) testsMap.set(testName, []);
        testsMap.get(testName)!.push({
          variant: row.variant,
          total: Number(row.total),
          converted: Number(row.converted),
          conversionRate: Number(row.total) > 0 ? Number(row.converted) / Number(row.total) * 100 : 0,
          totalValue: Number(row.totalValue),
        });
      }

      return {
        tests: Array.from(testsMap.entries()).map(([name, variants]) => ({
          testName: name,
          variants,
          totalVisitors: variants.reduce((sum, v) => sum + v.total, 0),
          totalConversions: variants.reduce((sum, v) => sum + v.converted, 0),
        })),
      };
    }),

    // Affiliate Performance Overview
    affiliatePerformance: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const db = await getDb();
      if (!db) return { partners: [], totals: { totalPartners: 0, totalClicks: 0, totalConversions: 0, totalCommissions: 0 } };

      // Get all partners with their stats
      const partners = await db
        .select({
          id: affiliatePartners.id,
          affiliateCode: affiliatePartners.affiliateCode,
          status: affiliatePartners.status,
          totalEarnings: affiliatePartners.totalEarnings,
          totalPaidOut: affiliatePartners.totalPaidOut,
          createdAt: affiliatePartners.createdAt,
        })
        .from(affiliatePartners)
        .orderBy(desc(affiliatePartners.totalEarnings));

      // Get click counts per affiliate
      const clickCounts = await db
        .select({
          affiliateId: affiliateClicks.affiliateId,
          clicks: sql<number>`COUNT(*)`,
        })
        .from(affiliateClicks)
        .groupBy(affiliateClicks.affiliateId);

      const clickMap = new Map(clickCounts.map(c => [c.affiliateId, Number(c.clicks)]));

      // Get conversion counts per affiliate
      const conversionCounts = await db
        .select({
          affiliateId: affiliateConversions.affiliateId,
          conversions: sql<number>`COUNT(*)`,
          totalSales: sql<number>`COALESCE(SUM(${affiliateConversions.saleAmount}), 0)`,
        })
        .from(affiliateConversions)
        .groupBy(affiliateConversions.affiliateId);

      const conversionMap = new Map(conversionCounts.map(c => [c.affiliateId, { conversions: Number(c.conversions), totalSales: Number(c.totalSales) }]));

      const enrichedPartners = partners.map(p => ({
        ...p,
        clicks: clickMap.get(p.id) || 0,
        conversions: conversionMap.get(p.id)?.conversions || 0,
        totalSales: conversionMap.get(p.id)?.totalSales || 0,
        conversionRate: (clickMap.get(p.id) || 0) > 0
          ? ((conversionMap.get(p.id)?.conversions || 0) / (clickMap.get(p.id) || 1)) * 100
          : 0,
      }));

      return {
        partners: enrichedPartners,
        totals: {
          totalPartners: partners.length,
          totalClicks: clickCounts.reduce((sum, c) => sum + Number(c.clicks), 0),
          totalConversions: conversionCounts.reduce((sum, c) => sum + Number(c.conversions), 0),
          totalCommissions: partners.reduce((sum, p) => sum + Number(p.totalEarnings), 0),
        },
      };
    }),

    // Chatbot Engagement Metrics
    chatbotEngagement: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const db = await getDb();
      if (!db) return { triggers: [], totals: { totalEvents: 0, totalInteractions: 0, interactionRate: 0 } };

      const triggerStats = await db
        .select({
          eventType: chatTriggerEvents.eventType,
          botTriggered: chatTriggerEvents.botTriggered,
          total: sql<number>`COUNT(*)`,
          interacted: sql<number>`SUM(CASE WHEN ${chatTriggerEvents.interacted} = true THEN 1 ELSE 0 END)`,
        })
        .from(chatTriggerEvents)
        .groupBy(chatTriggerEvents.eventType, chatTriggerEvents.botTriggered);

      const triggers = triggerStats.map(t => ({
        eventType: t.eventType,
        botTriggered: t.botTriggered,
        total: Number(t.total),
        interacted: Number(t.interacted),
        interactionRate: Number(t.total) > 0 ? (Number(t.interacted) / Number(t.total)) * 100 : 0,
      }));

      const totalEvents = triggers.reduce((sum, t) => sum + t.total, 0);
      const totalInteractions = triggers.reduce((sum, t) => sum + t.interacted, 0);

      return {
        triggers,
        totals: {
          totalEvents,
          totalInteractions,
          interactionRate: totalEvents > 0 ? (totalInteractions / totalEvents) * 100 : 0,
        },
      };
    }),

    // Email Sequence Stats
    emailStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const db = await getDb();
      if (!db) return { totalSubscribers: 0, recentSubscribers: [], sequenceSummary: getSequenceSummary() };

      const totalResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(emailSubscribers);

      const recent = await db
        .select()
        .from(emailSubscribers)
        .orderBy(desc(emailSubscribers.createdAt))
        .limit(10);

      return {
        totalSubscribers: Number(totalResult[0]?.count || 0),
        recentSubscribers: recent.map(s => ({
          email: s.email,
          name: s.name,
          source: s.source,
          createdAt: s.createdAt,
        })),
        sequenceSummary: getSequenceSummary(),
      };
    }),

    // Overview KPIs
    overview: protectedProcedure
      .input(z.object({
        days: z.number().min(7).max(365).default(30),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Admin access required");
        const db = await getDb();
        if (!db) return {
          totalUsers: 0, totalSubscribers: 0, totalAffiliates: 0,
          totalChatEvents: 0, totalAbTests: 0, totalSubscriptions: 0,
          userGrowth: [], subscriberGrowth: [], chatEventsTrend: [],
          revenueEstimate: 0,
        };

        const days = input?.days || 30;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const [userCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
        const [subCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(emailSubscribers);
        const [affCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(affiliatePartners);
        const [chatCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(chatTriggerEvents);
        const [abCount] = await db.select({ count: sql<number>`COUNT(DISTINCT ${abTestAssignments.testName})` }).from(abTestAssignments);
        const [subActiveCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(subscriptions).where(eq(subscriptions.status, "active"));

        // User growth time series
        const userGrowth = await db
          .select({
            date: sql<string>`DATE(${users.createdAt})`.as("date"),
            count: sql<number>`COUNT(*)`.as("count"),
          })
          .from(users)
          .where(gte(users.createdAt, startDate))
          .groupBy(sql`DATE(${users.createdAt})`)
          .orderBy(sql`DATE(${users.createdAt})`);

        // Subscriber growth time series
        const subscriberGrowth = await db
          .select({
            date: sql<string>`DATE(${emailSubscribers.createdAt})`.as("date"),
            count: sql<number>`COUNT(*)`.as("count"),
          })
          .from(emailSubscribers)
          .where(gte(emailSubscribers.createdAt, startDate))
          .groupBy(sql`DATE(${emailSubscribers.createdAt})`)
          .orderBy(sql`DATE(${emailSubscribers.createdAt})`);

        // Chat events trend
        const chatEventsTrend = await db
          .select({
            date: sql<string>`DATE(${chatTriggerEvents.createdAt})`.as("date"),
            count: sql<number>`COUNT(*)`.as("count"),
            interacted: sql<number>`SUM(CASE WHEN ${chatTriggerEvents.interacted} = true THEN 1 ELSE 0 END)`.as("interacted"),
          })
          .from(chatTriggerEvents)
          .where(gte(chatTriggerEvents.createdAt, startDate))
          .groupBy(sql`DATE(${chatTriggerEvents.createdAt})`)
          .orderBy(sql`DATE(${chatTriggerEvents.createdAt})`);

        // Revenue estimate from active subscriptions
        const activeGold = await db.select({ count: sql<number>`COUNT(*)` }).from(subscriptions).where(and(eq(subscriptions.status, "active"), eq(subscriptions.planId, "gold")));
        const activeDiamond = await db.select({ count: sql<number>`COUNT(*)` }).from(subscriptions).where(and(eq(subscriptions.status, "active"), eq(subscriptions.planId, "diamond")));
        const activeHeritage = await db.select({ count: sql<number>`COUNT(*)` }).from(subscriptions).where(and(eq(subscriptions.status, "active"), eq(subscriptions.planId, "heritage_addon")));
        const revenueEstimate = (Number(activeGold[0]?.count || 0) * 990 + Number(activeDiamond[0]?.count || 0) * 2490 + Number(activeHeritage[0]?.count || 0) * 490);

        return {
          totalUsers: Number(userCount?.count || 0),
          totalSubscribers: Number(subCount?.count || 0),
          totalAffiliates: Number(affCount?.count || 0),
          totalChatEvents: Number(chatCount?.count || 0),
          totalAbTests: Number(abCount?.count || 0),
          totalSubscriptions: Number(subActiveCount?.count || 0),
          revenueEstimate,
          userGrowth: userGrowth.map(r => ({ date: String(r.date), count: Number(r.count) })),
          subscriberGrowth: subscriberGrowth.map(r => ({ date: String(r.date), count: Number(r.count) })),
          chatEventsTrend: chatEventsTrend.map(r => ({ date: String(r.date), count: Number(r.count), interacted: Number(r.interacted) })),
        };
      }),

    // Subscription breakdown for pie chart
    subscriptionBreakdown: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const db = await getDb();
      if (!db) return { plans: [] };

      const breakdown = await db
        .select({
          planId: subscriptions.planId,
          count: sql<number>`COUNT(*)`.as("count"),
        })
        .from(subscriptions)
        .where(eq(subscriptions.status, "active"))
        .groupBy(subscriptions.planId);

      return {
        plans: breakdown.map(b => ({ planId: b.planId, count: Number(b.count) })),
      };
    }),

    // Chatbot Performance Comparison - detailed per-bot metrics
    chatbotComparison: protectedProcedure
      .input(z.object({
        botIds: z.array(z.string()).min(1).max(10),
        dateRange: z.enum(["7d", "30d", "90d", "all"]).default("30d"),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Admin access required");
        const db = await getDb();
        if (!db) return { bots: [] };

        const daysMap = { "7d": 7, "30d": 30, "90d": 90, "all": 365 };
        const days = daysMap[input.dateRange];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        // Get per-bot metrics from chatTriggerEvents
        const allBotStats = await db
          .select({
            botTriggered: chatTriggerEvents.botTriggered,
            total: sql<number>`COUNT(*)`.as("total"),
            interacted: sql<number>`SUM(CASE WHEN ${chatTriggerEvents.interacted} = true THEN 1 ELSE 0 END)`.as("interacted"),
          })
          .from(chatTriggerEvents)
          .where(
            and(
              gte(chatTriggerEvents.createdAt, startDate),
              sql`${chatTriggerEvents.botTriggered} IN (${sql.join(input.botIds.map(id => sql`${id}`), sql`, `)})`
            )
          )
          .groupBy(chatTriggerEvents.botTriggered);

        // Get daily trend per bot
        const dailyTrends = await db
          .select({
            botTriggered: chatTriggerEvents.botTriggered,
            date: sql<string>`DATE(${chatTriggerEvents.createdAt})`.as("date"),
            count: sql<number>`COUNT(*)`.as("count"),
            interacted: sql<number>`SUM(CASE WHEN ${chatTriggerEvents.interacted} = true THEN 1 ELSE 0 END)`.as("interacted"),
          })
          .from(chatTriggerEvents)
          .where(
            and(
              gte(chatTriggerEvents.createdAt, startDate),
              sql`${chatTriggerEvents.botTriggered} IN (${sql.join(input.botIds.map(id => sql`${id}`), sql`, `)})`
            )
          )
          .groupBy(chatTriggerEvents.botTriggered, sql`DATE(${chatTriggerEvents.createdAt})`)
          .orderBy(sql`DATE(${chatTriggerEvents.createdAt})`);

        // Get trigger type breakdown per bot
        const triggerBreakdown = await db
          .select({
            botTriggered: chatTriggerEvents.botTriggered,
            eventType: chatTriggerEvents.eventType,
            count: sql<number>`COUNT(*)`.as("count"),
            interacted: sql<number>`SUM(CASE WHEN ${chatTriggerEvents.interacted} = true THEN 1 ELSE 0 END)`.as("interacted"),
          })
          .from(chatTriggerEvents)
          .where(
            and(
              gte(chatTriggerEvents.createdAt, startDate),
              sql`${chatTriggerEvents.botTriggered} IN (${sql.join(input.botIds.map(id => sql`${id}`), sql`, `)})`
            )
          )
          .groupBy(chatTriggerEvents.botTriggered, chatTriggerEvents.eventType);

        // Assemble per-bot comparison data
        const statsMap = new Map(allBotStats.map(s => [s.botTriggered, s]));
        const trendsMap = new Map<string, Array<{ date: string; count: number; interacted: number; interactionRate: number; performanceScore: number }>>();
        for (const row of dailyTrends) {
          const botId = row.botTriggered || "unknown";
          if (!trendsMap.has(botId)) trendsMap.set(botId, []);
          const count = Number(row.count);
          const interacted = Number(row.interacted);
          const interactionRate = count > 0 ? (interacted / count) * 100 : 0;
          // Performance score = interaction_rate * log(volume + 1) to balance quality and quantity
          const performanceScore = interactionRate * Math.log(count + 1);
          trendsMap.get(botId)!.push({ date: String(row.date), count, interacted, interactionRate, performanceScore });
        }
        const breakdownMap = new Map<string, Array<{ eventType: string; count: number; interacted: number }>>();
        for (const row of triggerBreakdown) {
          const botId = row.botTriggered || "unknown";
          if (!breakdownMap.has(botId)) breakdownMap.set(botId, []);
          breakdownMap.get(botId)!.push({ eventType: row.eventType, count: Number(row.count), interacted: Number(row.interacted) });
        }

        const bots = input.botIds.map(botId => {
          const stats = statsMap.get(botId);
          const total = Number(stats?.total || 0);
          const interacted = Number(stats?.interacted || 0);
          const trends = trendsMap.get(botId) || [];
          
          // Calculate week-over-week comparison (last 7 days vs previous 7 days)
          const now = new Date();
          const last7Days = trends.filter(t => {
            const tDate = new Date(t.date);
            const diffDays = (now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
          });
          const prev7Days = trends.filter(t => {
            const tDate = new Date(t.date);
            const diffDays = (now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays > 7 && diffDays <= 14;
          });
          const lastWeekTriggers = last7Days.reduce((sum, t) => sum + t.count, 0);
          const prevWeekTriggers = prev7Days.reduce((sum, t) => sum + t.count, 0);
          const lastWeekInteractions = last7Days.reduce((sum, t) => sum + t.interacted, 0);
          const prevWeekInteractions = prev7Days.reduce((sum, t) => sum + t.interacted, 0);
          const lastWeekRate = lastWeekTriggers > 0 ? (lastWeekInteractions / lastWeekTriggers) * 100 : 0;
          const prevWeekRate = prevWeekTriggers > 0 ? (prevWeekInteractions / prevWeekTriggers) * 100 : 0;
          
          return {
            botId,
            totalTriggers: total,
            totalInteractions: interacted,
            interactionRate: total > 0 ? (interacted / total) * 100 : 0,
            dailyTrend: trends,
            triggerBreakdown: breakdownMap.get(botId) || [],
            weekOverWeek: {
              lastWeek: { triggers: lastWeekTriggers, interactions: lastWeekInteractions, rate: lastWeekRate },
              prevWeek: { triggers: prevWeekTriggers, interactions: prevWeekInteractions, rate: prevWeekRate },
              triggerChange: prevWeekTriggers > 0 ? ((lastWeekTriggers - prevWeekTriggers) / prevWeekTriggers) * 100 : 0,
              rateChange: prevWeekRate > 0 ? ((lastWeekRate - prevWeekRate) / prevWeekRate) * 100 : 0,
            },
          };
        });

        return { bots };
      }),

    // Get list of all bots that have been triggered (for selection dropdown)
    chatbotList: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const db = await getDb();
      if (!db) return { bots: [] };

      const botList = await db
        .select({
          botTriggered: chatTriggerEvents.botTriggered,
          total: sql<number>`COUNT(*)`.as("total"),
          interacted: sql<number>`SUM(CASE WHEN ${chatTriggerEvents.interacted} = true THEN 1 ELSE 0 END)`.as("interacted"),
        })
        .from(chatTriggerEvents)
        .groupBy(chatTriggerEvents.botTriggered)
        .orderBy(sql`total DESC`);

      return {
        bots: botList
          .filter(b => b.botTriggered)
          .map(b => ({
            botId: b.botTriggered!,
            totalTriggers: Number(b.total),
            totalInteractions: Number(b.interacted),
            interactionRate: Number(b.total) > 0 ? (Number(b.interacted) / Number(b.total)) * 100 : 0,
          })),
      };
    }),

    // Affiliate clicks time series
    affiliateClicksTrend: protectedProcedure
      .input(z.object({ days: z.number().min(7).max(365).default(30) }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Admin access required");
        const db = await getDb();
        if (!db) return { trend: [], sourceBreakdown: [] };

        const days = input?.days || 30;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const trend = await db
          .select({
            date: sql<string>`DATE(${affiliateClicks.createdAt})`.as("date"),
            count: sql<number>`COUNT(*)`.as("count"),
          })
          .from(affiliateClicks)
          .where(gte(affiliateClicks.createdAt, startDate))
          .groupBy(sql`DATE(${affiliateClicks.createdAt})`)
          .orderBy(sql`DATE(${affiliateClicks.createdAt})`);

        const sourceBreakdown = await db
          .select({
            source: affiliateClicks.source,
            count: sql<number>`COUNT(*)`.as("count"),
          })
          .from(affiliateClicks)
          .where(gte(affiliateClicks.createdAt, startDate))
          .groupBy(affiliateClicks.source);

        return {
          trend: trend.map(r => ({ date: String(r.date), count: Number(r.count) })),
          sourceBreakdown: sourceBreakdown.map(r => ({ source: r.source || "unknown", count: Number(r.count) })),
        };
      }),
  }),

  // Proactive chat triggers
  proactiveChat: router({
    logEvent: publicProcedure
      .input(z.object({
        visitorId: z.string(),
        eventType: z.string(),
        eventData: z.string().optional(),
        pageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { shouldTrigger: false, botId: null };

        // Determine if we should trigger a proactive chat
        const triggerConfig = getProactiveTrigger(input.eventType, input.eventData);

        await db.insert(chatTriggerEvents).values({
          visitorId: input.visitorId,
          eventType: input.eventType,
          eventData: input.eventData || null,
          pageUrl: input.pageUrl || null,
          botTriggered: triggerConfig.botId,
          interacted: false,
        });

        return {
          shouldTrigger: triggerConfig.shouldTrigger,
          botId: triggerConfig.botId,
          message: triggerConfig.message,
        };
      }),

    markInteracted: publicProcedure
      .input(z.object({
        visitorId: z.string(),
        eventType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        await db
          .update(chatTriggerEvents)
          .set({ interacted: true })
          .where(
            and(
              eq(chatTriggerEvents.visitorId, input.visitorId),
              eq(chatTriggerEvents.eventType, input.eventType)
            )
          );

        return { success: true };
      }),
  }),

  // Conversation logging & feedback
  conversations: router({
    // Log a chat session start/end
    logSession: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        botId: z.string(),
        visitorId: z.string().optional(),
        messageCount: z.number().default(0),
        firstMessage: z.string().optional(),
        durationSeconds: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        const userId = ctx.user?.id || null;
        const planAtTime = ctx.user ? "authenticated" : "free";

        await db.insert(conversationLogs).values({
          sessionId: input.sessionId,
          botId: input.botId,
          userId,
          visitorId: input.visitorId || null,
          messageCount: input.messageCount,
          firstMessage: input.firstMessage || null,
          durationSeconds: input.durationSeconds,
          planAtTime,
        }).onDuplicateKeyUpdate({
          set: {
            messageCount: input.messageCount,
            durationSeconds: input.durationSeconds,
          },
        });

        return { success: true };
      }),

    // Submit feedback after a conversation
    submitFeedback: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        botId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        wouldRecommend: z.boolean().optional(),
        visitorId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        const userId = ctx.user?.id || null;

        await db.insert(userFeedback).values({
          sessionId: input.sessionId,
          botId: input.botId,
          userId,
          visitorId: input.visitorId || null,
          rating: input.rating,
          comment: input.comment || null,
          wouldRecommend: input.wouldRecommend ?? null,
        });

        return { success: true };
      }),

    // Get feedback stats for admin
    getFeedbackStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const db = await getDb();
      if (!db) return { bots: [], overall: { avgRating: 0, totalFeedback: 0, wouldRecommend: 0 } };

      const botStats = await db
        .select({
          botId: userFeedback.botId,
          avgRating: sql<number>`AVG(${userFeedback.rating})`,
          count: sql<number>`COUNT(*)`,
          recommended: sql<number>`SUM(CASE WHEN ${userFeedback.wouldRecommend} = true THEN 1 ELSE 0 END)`,
        })
        .from(userFeedback)
        .groupBy(userFeedback.botId)
        .orderBy(desc(sql`AVG(${userFeedback.rating})`));

      const overall = await db
        .select({
          avgRating: sql<number>`AVG(${userFeedback.rating})`,
          total: sql<number>`COUNT(*)`,
          recommended: sql<number>`SUM(CASE WHEN ${userFeedback.wouldRecommend} = true THEN 1 ELSE 0 END)`,
        })
        .from(userFeedback);

      const recentComments = await db
        .select({
          botId: userFeedback.botId,
          rating: userFeedback.rating,
          comment: userFeedback.comment,
          createdAt: userFeedback.createdAt,
        })
        .from(userFeedback)
        .where(sql`${userFeedback.comment} IS NOT NULL AND ${userFeedback.comment} != ''`)
        .orderBy(desc(userFeedback.createdAt))
        .limit(20);

      return {
        bots: botStats.map(b => ({
          botId: b.botId,
          avgRating: Number(b.avgRating || 0),
          count: Number(b.count),
          recommendRate: b.count > 0 ? (Number(b.recommended) / Number(b.count)) * 100 : 0,
        })),
        overall: {
          avgRating: Number(overall[0]?.avgRating || 0),
          totalFeedback: Number(overall[0]?.total || 0),
          wouldRecommend: overall[0]?.total > 0
            ? (Number(overall[0]?.recommended) / Number(overall[0]?.total)) * 100
            : 0,
        },
        recentComments,
      };
    }),

    // Get conversation analytics for admin
    getConversationAnalytics: protectedProcedure
      .input(z.object({ dateRange: z.enum(["7d", "30d", "90d", "all"]).default("30d") }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Admin access required");
        const db = await getDb();
        if (!db) return { topBots: [], topTopics: [], dailyVolume: [] };

        const daysMap = { "7d": 7, "30d": 30, "90d": 90, "all": 365 };
        const startDate = new Date(Date.now() - daysMap[input.dateRange] * 24 * 60 * 60 * 1000);

        const topBots = await db
          .select({
            botId: conversationLogs.botId,
            sessions: sql<number>`COUNT(*)`,
            avgMessages: sql<number>`AVG(${conversationLogs.messageCount})`,
            avgDuration: sql<number>`AVG(${conversationLogs.durationSeconds})`,
          })
          .from(conversationLogs)
          .where(gte(conversationLogs.createdAt, startDate))
          .groupBy(conversationLogs.botId)
          .orderBy(desc(sql`COUNT(*)`));

        const dailyVolume = await db
          .select({
            date: sql<string>`DATE(${conversationLogs.createdAt})`,
            sessions: sql<number>`COUNT(*)`,
            avgMessages: sql<number>`AVG(${conversationLogs.messageCount})`,
          })
          .from(conversationLogs)
          .where(gte(conversationLogs.createdAt, startDate))
          .groupBy(sql`DATE(${conversationLogs.createdAt})`)
          .orderBy(sql`DATE(${conversationLogs.createdAt})`);

        return {
          topBots: topBots.map(b => ({
            botId: b.botId,
            sessions: Number(b.sessions),
            avgMessages: Number(b.avgMessages || 0),
            avgDuration: Number(b.avgDuration || 0),
          })),
          dailyVolume: dailyVolume.map(d => ({
            date: String(d.date),
            sessions: Number(d.sessions),
            avgMessages: Number(d.avgMessages || 0),
          })),
        };
      }),
  }),

  // Automated reports
  reports: router({
    // Get report history
    getHistory: protectedProcedure
      .input(z.object({
        reportType: z.enum(["daily", "weekly", "all"]).default("all"),
        limit: z.number().default(30),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Admin access required");
        const db = await getDb();
        if (!db) return { reports: [] };

        const query = db
          .select()
          .from(dailyReports)
          .orderBy(desc(dailyReports.reportDate))
          .limit(input.limit);

        const reports = input.reportType === "all"
          ? await query
          : await db
              .select()
              .from(dailyReports)
              .where(eq(dailyReports.reportType, input.reportType))
              .orderBy(desc(dailyReports.reportDate))
              .limit(input.limit);

        return { reports };
      }),

    // Manually trigger report generation
    generateReport: protectedProcedure
      .input(z.object({
        reportType: z.enum(["daily", "weekly"]).default("daily"),
        forceRegenerate: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Admin access required");

        const { generateDailyReport, generateWeeklyReport } = await import("./analytics/reportGenerator");

        if (input.reportType === "daily") {
          await generateDailyReport();
        } else {
          await generateWeeklyReport();
        }

        return { success: true, message: `${input.reportType} report generated` };
      }),

    // Get latest report
    getLatest: protectedProcedure
      .input(z.object({ reportType: z.enum(["daily", "weekly"]).default("daily") }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Admin access required");
        const db = await getDb();
        if (!db) return { report: null };

        const reports = await db
          .select()
          .from(dailyReports)
          .where(eq(dailyReports.reportType, input.reportType))
          .orderBy(desc(dailyReports.reportDate))
          .limit(1);

        return { report: reports[0] || null };
      }),
  }),

  // ============ Intelligence Hub ============
  // Unified synthesis of all analytics systems
  intelligence: router({
    // Revenue forecast + MRR trend
    revenueForecast: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const { forecastRevenue } = await import("./analytics/eventPipeline");
      return forecastRevenue();
    }),

    // Conversion path analysis — which bots lead to subscriptions
    conversionPaths: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const { analyzeConversionPaths } = await import("./analytics/eventPipeline");
      const paths = await analyzeConversionPaths();
      return { paths };
    }),

    // Churn risk users
    churnRisk: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const db = await getDb();
      if (!db) return { users: [], total: 0 };

      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const atRiskUsers = await db
        .select({ id: users.id, email: users.email, name: users.name, lastSignedIn: users.lastSignedIn, createdAt: users.createdAt })
        .from(users)
        .where(lte(users.lastSignedIn, fourteenDaysAgo))
        .orderBy(users.lastSignedIn)
        .limit(20);

      return { users: atRiskUsers, total: atRiskUsers.length };
    }),

    // Run churn detection + upsell triggers manually
    runAutomations: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const { runChurnDetection, runUpsellTriggers } = await import("./analytics/eventPipeline");
      const [churn, upsell] = await Promise.all([runChurnDetection(), runUpsellTriggers()]);
      return { churn, upsell, ranAt: new Date() };
    }),

    // Full intelligence summary for dashboard
    summary: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      const db = await getDb();
      if (!db) return null;

      const { forecastRevenue, analyzeConversionPaths } = await import("./analytics/eventPipeline");

      const [forecast, paths] = await Promise.all([
        forecastRevenue(),
        analyzeConversionPaths(),
      ]);

      // Churn risk count
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const churnRiskResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(lte(users.lastSignedIn, fourteenDaysAgo));
      const churnRiskCount = Number(churnRiskResult[0]?.count || 0);

      // Total active subscriptions
      const activeSubsResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(subscriptions)
        .where(eq(subscriptions.status, "active"));
      const activeSubs = Number(activeSubsResult[0]?.count || 0);

      // Recent feedback avg
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentFeedback = await db
        .select({ avg: sql<number>`AVG(rating)`, count: sql<number>`COUNT(*)` })
        .from(userFeedback)
        .where(gte(userFeedback.createdAt, sevenDaysAgo));
      const avgRating = Number(recentFeedback[0]?.avg || 0) / 10;
      const feedbackCount = Number(recentFeedback[0]?.count || 0);

      return {
        forecast,
        topConversionBots: paths.slice(0, 5),
        churnRiskCount,
        activeSubs,
        avgRating: Math.round(avgRating * 10) / 10,
        feedbackCount,
        healthScore: calculateHealthScore({
          growthRate: forecast.growthRate,
          churnRisk: churnRiskCount,
          activeSubs,
          avgRating,
        }),
      };
    }),
  }),

  // ─── Ported from BOTHUB: notifications, blog, preferences, wishlist ──────────────
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
      .query(async ({ ctx, input }) => getUserNotifications(ctx.user.id, input?.limit ?? 20)),
    unreadCount: protectedProcedure.query(async ({ ctx }) => ({
      count: await getUnreadNotificationCount(ctx.user.id),
    })),
    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.notificationId, ctx.user.id);
        return { success: true };
      }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  blogAdmin: router({
    list: adminProcedure.query(async () => getAllBlogPosts()),
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getBlogPostById(input.id)),
    create: adminProcedure
      .input(z.object({
        slug: z.string().min(1).max(200),
        titleCs: z.string().min(1).max(300),
        titleEn: z.string().max(300).optional(),
        contentCs: z.string().min(1),
        contentEn: z.string().optional(),
        excerptCs: z.string().optional(),
        excerptEn: z.string().optional(),
        metaDescriptionCs: z.string().max(300).optional(),
        metaDescriptionEn: z.string().max(300).optional(),
        category: z.string().max(100).optional(),
        coverImage: z.string().max(500).optional(),
        author: z.string().max(200).optional(),
        status: z.enum(["draft", "published"]).default("draft"),
        readingTime: z.number().min(1).max(60).optional(),
      }))
      .mutation(async ({ input }) => {
        const publishedAt = input.status === "published" ? new Date() : undefined;
        const result = await createBlogPost({ ...input, publishedAt });
        return { success: true, id: result.id };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().min(1).max(200).optional(),
        titleCs: z.string().min(1).max(300).optional(),
        titleEn: z.string().max(300).optional(),
        contentCs: z.string().optional(),
        contentEn: z.string().optional(),
        excerptCs: z.string().optional(),
        excerptEn: z.string().optional(),
        metaDescriptionCs: z.string().max(300).optional(),
        metaDescriptionEn: z.string().max(300).optional(),
        category: z.string().max(100).optional(),
        coverImage: z.string().max(500).optional(),
        author: z.string().max(200).optional(),
        status: z.enum(["draft", "published"]).optional(),
        readingTime: z.number().min(1).max(60).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        if (data.status === "published") {
          const existing = await getBlogPostById(id);
          if (existing && !existing.publishedAt) {
            (data as any).publishedAt = new Date();
          }
        }
        await updateBlogPost(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBlogPost(input.id);
        return { success: true };
      }),
  }),

  blogPublic: router({
    published: publicProcedure.query(async () => getPublishedBlogPosts()),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => getBlogPostBySlug(input.slug)),
  }),

  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => getUserPreferences(ctx.user.id)),
    update: protectedProcedure
      .input(z.object({
        weeklyDigest: z.number().min(0).max(1).optional(),
        marketingEmails: z.number().min(0).max(1).optional(),
      }))
      .mutation(async ({ ctx, input }) => ({
        success: await updateUserPreferences(ctx.user.id, input),
      })),
  }),

  wishlist: router({
    add: protectedProcedure
      .input(z.object({ ibotId: z.string() }))
      .mutation(async ({ ctx, input }) => addToWishlist(ctx.user.id, input.ibotId)),
    remove: protectedProcedure
      .input(z.object({ ibotId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await removeFromWishlist(ctx.user.id, input.ibotId);
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => getUserWishlist(ctx.user.id)),
    isInWishlist: protectedProcedure
      .input(z.object({ ibotId: z.string() }))
      .query(async ({ ctx, input }) => isInWishlist(ctx.user.id, input.ibotId)),
    count: protectedProcedure.query(async ({ ctx }) => getWishlistCount(ctx.user.id)),
  }),
});

/**
 * Calculate overall system health score (0-100)
 */
function calculateHealthScore(params: {
  growthRate: number;
  churnRisk: number;
  activeSubs: number;
  avgRating: number;
}): number {
  let score = 50; // baseline

  // Growth rate contribution (+/- 20 points)
  score += Math.min(20, Math.max(-20, params.growthRate / 5));

  // Churn risk penalty (-1 per at-risk user, max -20)
  score -= Math.min(20, params.churnRisk);

  // Active subscribers bonus (+1 per 10 subs, max +15)
  score += Math.min(15, Math.floor(params.activeSubs / 10));

  // Rating contribution (5 stars = +15, 1 star = -15)
  score += (params.avgRating - 3) * 7.5;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Anonymize a name for leaderboard display (e.g., "Martin Kovář" → "M. K.")
 */
function anonymizeName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "Partner";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + ".";
  return parts[0].charAt(0).toUpperCase() + ". " + parts[parts.length - 1].charAt(0).toUpperCase() + ".";
}

/**
 * Determine which bot to trigger based on user behavior
 */
function getProactiveTrigger(eventType: string, eventData?: string | null): {
  shouldTrigger: boolean;
  botId: string | null;
  message: string | null;
} {
  switch (eventType) {
    case "scroll_pricing":
      return {
        shouldTrigger: true,
        botId: "alex-hormozi",
        message: "Vidím, že si prohlížíte naše plány. Chcete, abych vám pomohl vybrat ten správný pro vaše podnikání?",
      };
    case "time_on_page_60s":
      return {
        shouldTrigger: true,
        botId: "tony-robbins",
        message: "Už jste tu chvíli! Máte otázky ohledně toho, jak AI chatboti mohou transformovat váš byznys?",
      };
    case "exit_intent":
      return {
        shouldTrigger: true,
        botId: "russell-brunson",
        message: "Počkejte! Než odejdete - víte, že můžete vyzkoušet 3 iBoty zdarma? Žádná kreditní karta.",
      };
    case "scroll_catalog":
      return {
        shouldTrigger: true,
        botId: "warren-buffett",
        message: "Hledáte konkrétního experta? Řekněte mi, jaký problém řešíte, a doporučím vám toho správného iBota.",
      };
    case "catalog_comparison":
      return {
        shouldTrigger: true,
        botId: "alex-hormozi",
        message: "Vidím, že porovnáváte několik iBotů. Chcete, abych vám pomohl vybrat toho nejlepšího pro váš konkrétní cíl? Řekněte mi, co řešíte.",
      };
    case "revisit":
      return {
        shouldTrigger: true,
        botId: "robin-sharma",
        message: "Vítejte zpět! Rád vás znovu vidím. Mohu vám s něčím pomoci?",
      };
    default:
      return { shouldTrigger: false, botId: null, message: null };
  }
}

export type AppRouter = typeof appRouter;
