import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  captureEmail, trackAbTestEvent, trackAffiliateClick,
  createRegistration, getRegistrationByEmail, activateRegistration,
  createAffiliateRegistration, getAffiliateByEmail,
  getDashboardStats, getRegistrationsByPlan, getAbTestResults,
  getRecentRegistrations, getRecentEmailCaptures, getAffiliatePartners,
  getRecentAffiliateClicks, getRegistrationsByDay, getEmailCapturesByDay,
  getRegistrationCount, getUserRegistrations, getAffiliateStats,
  getAffiliateReferrals,
  // Notifications
  createNotification, getUserNotifications, getUnreadNotificationCount,
  markNotificationRead, markAllNotificationsRead,
  notifyRegistrationChange,
  // Blog CRUD
  createBlogPost, updateBlogPost, deleteBlogPost,
  getBlogPostById, getBlogPostBySlug, getAllBlogPosts, getPublishedBlogPosts,
  // Wishlist
  addToWishlist, removeFromWishlist, getUserWishlist, isInWishlist, getWishlistCount,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { sendConfirmationEmail, sendPlanActivatedEmail, sendNewReferralEmail, sendAffiliateMilestoneEmail } from "./email";
import { sendDailyReport, generateDailyReport, formatReportContent, sendWeeklyReport, generateWeeklyReport, formatWeeklyReportContent, generateStrategicRecommendations } from "./dailyReport";
import { invokeLLM } from "./_core/llm";
import { createCheckoutSession } from "./stripe";
import { checkApiHealth, syncRegistration, getApiConfig } from "./botHubApi";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  tracking: router({
    captureEmail: publicProcedure
      .input(z.object({
        email: z.string().email(),
        source: z.string().default("unlock_modal"),
        variant: z.string().optional(),
        gdprConsent: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await captureEmail({
          email: input.email,
          source: input.source,
          variant: input.variant ?? null,
          gdprConsent: input.gdprConsent ? 1 : 0,
        });
        return { success: true };
      }),

    ctaClick: publicProcedure
      .input(z.object({ variant: z.string(), targetUrl: z.string() }))
      .mutation(async ({ input }) => {
        await trackAbTestEvent("cta_hero", input.variant, "click");
        return { success: true };
      }),

    ctaImpression: publicProcedure
      .input(z.object({ variant: z.string() }))
      .mutation(async ({ input }) => {
        await trackAbTestEvent("cta_hero", input.variant, "impression");
        return { success: true };
      }),

    affiliateClick: publicProcedure
      .input(z.object({
        partner: z.string(),
        plan: z.string().optional(),
        referrer: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await trackAffiliateClick({
          partner: input.partner,
          plan: input.plan ?? null,
          referrer: input.referrer ?? null,
        });
        return { success: true };
      }),
  }),

  registration: router({
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().min(1).optional(),
        company: z.string().optional(),
        plan: z.enum(["free", "gold", "diamond"]).default("free"),
        source: z.string().default("hero_cta"),
        ctaVariant: z.string().optional(),
        affiliateCode: z.string().optional(),
        gdprConsent: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const existing = await getRegistrationByEmail(input.email);
        if (existing) {
          return {
            success: true, alreadyRegistered: true,
            registrationId: existing.id, plan: existing.plan, status: existing.status,
            message: "Tento e-mail je již registrován. Zkontrolujte svou e-mailovou schránku.",
          };
        }

        const { id } = await createRegistration({
          email: input.email, name: input.name ?? null, company: input.company ?? null,
          plan: input.plan, source: input.source,
          ctaVariant: input.ctaVariant ?? null, affiliateCode: input.affiliateCode ?? null,
          gdprConsent: input.gdprConsent ? 1 : 0,
        });

        if (input.ctaVariant) {
          await trackAbTestEvent("cta_hero", input.ctaVariant, "conversion").catch(() => {});
        }

        await captureEmail({
          email: input.email, source: `registration_${input.plan}`,
          variant: input.ctaVariant ?? null, gdprConsent: input.gdprConsent ? 1 : 0,
        }).catch(() => {});

        // Auto-activate for FREE plan
        if (input.plan === "free") {
          await activateRegistration(id).catch(() => {});
          // Send plan activated email for auto-activated FREE plans
          await sendPlanActivatedEmail({
            email: input.email,
            name: input.name ?? undefined,
            plan: input.plan,
          }).catch((err) => console.warn("[Email] Failed to send plan activated email:", err));
        }

        // Send confirmation email
        await sendConfirmationEmail({
          email: input.email,
          name: input.name ?? undefined,
          plan: input.plan,
          registrationId: id,
          isAutoActivated: input.plan === "free",
        }).catch((err) => console.warn("[Email] Failed to send confirmation:", err));

        // If registered via affiliate, send new referral email to affiliate partner
        if (input.affiliateCode) {
          // Look up affiliate partner by code to send them a notification
          const { getAffiliateByCode } = await import("./db");
          const partner = await getAffiliateByCode(input.affiliateCode).catch(() => null);
          if (partner) {
            const { getAffiliateStats: getStats } = await import("./db");
            const stats = await getStats(input.affiliateCode).catch(() => ({ totalReferrals: 1, pendingCommission: 0, totalClicks: 0 }));
            await sendNewReferralEmail({
              email: partner.email,
              name: partner.name ?? undefined,
              referralEmail: input.email,
              referralPlan: input.plan,
              totalReferrals: stats.totalReferrals,
            }).catch((err) => console.warn("[Email] Failed to send referral email:", err));

            // Check affiliate milestones (5, 10, 25, 50)
            const milestones = [5, 10, 25, 50];
            if (milestones.includes(stats.totalReferrals)) {
              await sendAffiliateMilestoneEmail({
                email: partner.email,
                name: partner.name ?? undefined,
                milestone: stats.totalReferrals,
                totalCommission: (stats as any).pendingCommission ?? 0,
              }).catch((err) => console.warn("[Email] Failed to send milestone email:", err));
            }
          }
        }

        // Notify owner
        await notifyOwner({
          title: `Nová registrace: ${input.plan.toUpperCase()} plán`,
          content: `E-mail: ${input.email}\nPlán: ${input.plan.toUpperCase()}\nZdroj: ${input.source}\n${input.company ? `Firma: ${input.company}` : ""}${input.affiliateCode ? `\nAffiliate: ${input.affiliateCode}` : ""}`,
        }).catch(() => {});

        return {
          success: true, alreadyRegistered: false, registrationId: id,
          plan: input.plan,
          status: input.plan === "free" ? "activated" : "pending",
          message: input.plan === "free"
            ? "Registrace dokončena! Váš FREE plán je aktivní. Potvrzovací e-mail byl odeslán."
            : `Registrace dokončena! Brzy vás budeme kontaktovat ohledně aktivace plánu ${input.plan.toUpperCase()}. Potvrzovací e-mail byl odeslán.`,
        };
      }),

    checkEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const existing = await getRegistrationByEmail(input.email);
        return { registered: !!existing, plan: existing?.plan ?? null };
      }),

    /** Activate a registration via activation link (GOLD/DIAMOND) */
    activate: publicProcedure
      .input(z.object({ registrationId: z.number(), token: z.string() }))
      .mutation(async ({ input }) => {
        // Simple token validation: base64 of "registrationId:bothub-activate"
        const expectedToken = Buffer.from(`${input.registrationId}:bothub-activate`).toString("base64url");
        if (input.token !== expectedToken) {
          return { success: false, message: "Neplatný aktivační odkaz." };
        }
        await activateRegistration(input.registrationId);

        // Send plan activated email for manually activated plans (GOLD/DIAMOND)
        const { getRegistrationById } = await import("./db");
        const reg = await getRegistrationById(input.registrationId).catch(() => null);
        if (reg) {
          await sendPlanActivatedEmail({
            email: reg.email,
            name: reg.name ?? undefined,
            plan: reg.plan,
          }).catch((err) => console.warn("[Email] Failed to send plan activated email:", err));
        }

        return { success: true, message: "Váš plán byl úspěšně aktivován!" };
      }),
  }),

  affiliate: router({
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().min(1),
        company: z.string().optional(),
        website: z.string().optional(),
        gdprConsent: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const existing = await getAffiliateByEmail(input.email);
        if (existing) {
          return {
            success: true, alreadyRegistered: true,
            affiliateCode: existing.affiliateCode,
            message: "Tento e-mail je již registrován jako affiliate partner.",
          };
        }

        const { affiliateCode } = await createAffiliateRegistration({
          email: input.email, name: input.name,
          company: input.company ?? null, website: input.website ?? null,
          gdprConsent: input.gdprConsent ? 1 : 0,
        });

        await notifyOwner({
          title: "Nový affiliate partner",
          content: `E-mail: ${input.email}\nJméno: ${input.name}\nKód: ${affiliateCode}\n${input.website ? `Web: ${input.website}` : ""}`,
        }).catch(() => {});

        return {
          success: true, alreadyRegistered: false, affiliateCode,
          message: `Registrace dokončena! Váš affiliate kód je ${affiliateCode}.`,
        };
      }),
  }),

  // ===== ADMIN DASHBOARD =====
  admin: router({
    /** Dashboard overview stats */
    stats: adminProcedure.query(async () => {
      return getDashboardStats();
    }),

    /** Registration breakdown by plan */
    registrationsByPlan: adminProcedure.query(async () => {
      return getRegistrationsByPlan();
    }),

    /** A/B test results */
    abTestResults: adminProcedure.query(async () => {
      return getAbTestResults();
    }),

    /** Recent registrations */
    recentRegistrations: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
      .query(async ({ input }) => {
        return getRecentRegistrations(input?.limit ?? 50);
      }),

    /** Recent email captures */
    recentEmails: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
      .query(async ({ input }) => {
        return getRecentEmailCaptures(input?.limit ?? 50);
      }),

    /** Affiliate partners */
    affiliatePartners: adminProcedure.query(async () => {
      return getAffiliatePartners();
    }),

    /** Recent affiliate clicks */
    recentAffiliateClicks: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
      .query(async ({ input }) => {
        return getRecentAffiliateClicks(input?.limit ?? 50);
      }),

    /** Registration trend (last 30 days) */
    registrationTrend: adminProcedure.query(async () => {
      return getRegistrationsByDay();
    }),

    /** Email capture trend (last 30 days) */
    emailTrend: adminProcedure.query(async () => {
      return getEmailCapturesByDay();
    }),

    /** Trigger daily report manually */
    sendDailyReport: adminProcedure.mutation(async () => {
      const success = await sendDailyReport();
      return { success };
    }),

    /** Get daily report data */
    dailyReportPreview: adminProcedure.query(async () => {
      const data = await generateDailyReport();
      if (!data) return { content: "Databáze není dostupná." };
      return { content: formatReportContent(data) };
    }),

    /** Trigger weekly report manually */
    sendWeeklyReport: adminProcedure.mutation(async () => {
      const success = await sendWeeklyReport();
      return { success };
    }),

    /** Get weekly report preview with AI recommendations */
    weeklyReportPreview: adminProcedure.query(async () => {
      const data = await generateWeeklyReport();
      if (!data) return { content: "Databáze není dostupná.", recommendations: "" };
      const recommendations = await generateStrategicRecommendations(data);
      return {
        content: formatWeeklyReportContent(data, recommendations),
        recommendations,
      };
    }),

    /** GSC verification status */
    gscStatus: adminProcedure.query(async () => {
      const code = process.env.VITE_GSC_VERIFICATION || "";
      return {
        isConfigured: !!code,
        verificationCode: code ? `${code.substring(0, 8)}...` : null,
        metaTag: code ? `<meta name="google-site-verification" content="${code}" />` : null,
      };
    }),
  }),

  // ===== STRIPE CHECKOUT =====
  stripe: router({
    createCheckout: publicProcedure
      .input(z.object({
        plan: z.enum(["gold", "diamond"]),
        email: z.string().email(),
        registrationId: z.number(),
        name: z.string().optional(),
        origin: z.string(),
        affiliateCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { url, sessionId } = await createCheckoutSession({
          plan: input.plan,
          email: input.email,
          registrationId: input.registrationId,
          name: input.name,
          origin: input.origin,
          affiliateCode: input.affiliateCode,
        });
        return { url, sessionId };
      }),
  }),

  // ===== COUNTDOWN / PROMO =====
  promo: router({
    /** Get remaining spots for limited offer */
    remainingSpots: publicProcedure.query(async () => {
      const totalRegistrations = await getRegistrationCount();
      const limit = 100;
      const remaining = Math.max(0, limit - totalRegistrations);
      return { remaining, total: limit, taken: totalRegistrations, isActive: remaining > 0 };
    }),
  }),

  // ===== LIVE CHAT DEMO =====
  chat: router({
    send: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = {
          role: "system" as const,
          content: `Jsi Alex Hormozi iBot — AI obchodní poradce na platformě BOTHUB.cz. Jsi jeden ze 77 unikátních AI osobností (iBotů).

Tvůj styl:
- Přímý, energický, orientovaný na výsledky
- Používáš Hormozi principy: Value Equation, Grand Slam Offer
- Mluvíš česky, občas použiješ anglický business termín
- Jsi přátelský ale profesionální
- Odpovídáš stručně (max 3-4 věty)

Tvůj cíl:
- Ukázat hodnotu iBotů pro podnikání
- Vysvětlit jak iBoti zvyšují konverze (+42%) a ROI (+327%)
- Zmínit že BOTHUB má 77 iBotů ve 7 kategoriích
- Pokud se ptají na ceny: FREE (0 Kč), GOLD (990 Kč/měs), DIAMOND (2490 Kč/měs)
- Motivovat k registraci (je zdarma)
- Zmínit affiliate program (až 77% provize)

Platformy: Web widget, Telegram, Discord, API (api.bothub.cz)
Kategorie iBotů: Prodej & Marketing, Zákaznická podpora, Osobní rozvoj, Business & Finance, Vzdělávání, Kreativita, Zdraví & Wellness

Nikdy nepřiznávej že jsi jen demo. Chovej se jako plnohodnotný iBot.`,
        };

        const allMessages = [systemPrompt, ...input.messages.filter(m => m.role !== "system")];

        try {
          const response = await invokeLLM({ messages: allMessages });
          const rawContent = response.choices?.[0]?.message?.content;
          const content = typeof rawContent === "string" ? rawContent : "Omlouvám se, zkuste to prosím znovu.";
          return { role: "assistant" as const, content };
        } catch (error) {
          console.error("[Chat] LLM error:", error);
          return {
            role: "assistant" as const,
            content: "Momentálně mám technické potíže. Zkuste to prosím za chvíli nebo se rovnou zaregistrujte — je to zdarma!",
          };
        }
      }),
  }),

  // User dashboard
  userDashboard: router({
    myRegistrations: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.email) return [];
      return getUserRegistrations(ctx.user.email);
    }),
    myProfile: protectedProcedure.query(async ({ ctx }) => {
      return {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        role: ctx.user.role,
        createdAt: ctx.user.createdAt,
      };
    }),
  }),

  // Affiliate dashboard
  affiliateDashboard: router({
    myStats: protectedProcedure
      .input(z.object({ affiliateCode: z.string() }))
      .query(async ({ input }) => {
        return getAffiliateStats(input.affiliateCode);
      }),
    myReferrals: protectedProcedure
      .input(z.object({ affiliateCode: z.string() }))
      .query(async ({ input }) => {
        return getAffiliateReferrals(input.affiliateCode);
      }),
    myPartnerInfo: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.email) return null;
      return getAffiliateByEmail(ctx.user.email);
    }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
      .query(async ({ ctx, input }) => {
        return getUserNotifications(ctx.user.id, input?.limit ?? 20);
      }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return { count: await getUnreadNotificationCount(ctx.user.id) };
    }),
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

  // Blog admin CRUD
  blogAdmin: router({
    list: adminProcedure.query(async () => {
      return getAllBlogPosts();
    }),
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getBlogPostById(input.id);
      }),
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

  // API Integration
  apiIntegration: router({
    healthCheck: adminProcedure.query(async () => {
      return checkApiHealth();
    }),
    config: adminProcedure.query(async () => {
      const config = getApiConfig();
      return {
        baseUrl: config.baseUrl,
        isEnabled: config.isEnabled,
        hasApiKey: !!config.apiKey,
      };
    }),
  }),

  // Blog public (for frontend)
  blogPublic: router({
    published: publicProcedure.query(async () => {
      return getPublishedBlogPosts();
    }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getBlogPostBySlug(input.slug);
      }),
  }),

  wishlist: router({
    add: protectedProcedure
      .input(z.object({ ibotId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return addToWishlist(ctx.user.id, input.ibotId);
      }),
    remove: protectedProcedure
      .input(z.object({ ibotId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await removeFromWishlist(ctx.user.id, input.ibotId);
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserWishlist(ctx.user.id);
    }),
    isInWishlist: protectedProcedure
      .input(z.object({ ibotId: z.string() }))
      .query(async ({ ctx, input }) => {
        return isInWishlist(ctx.user.id, input.ibotId);
      }),
    count: protectedProcedure.query(async ({ ctx }) => {
      return getWishlistCount(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
