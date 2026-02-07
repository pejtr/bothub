import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  captureEmail, trackAbTestEvent, trackAffiliateClick,
  createRegistration, getRegistrationByEmail, activateRegistration,
  createAffiliateRegistration, getAffiliateByEmail,
  getDashboardStats, getRegistrationsByPlan, getAbTestResults,
  getRecentRegistrations, getRecentEmailCaptures, getAffiliatePartners,
  getRecentAffiliateClicks, getRegistrationsByDay, getEmailCapturesByDay,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { sendConfirmationEmail } from "./email";

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
        }

        // Send confirmation email
        await sendConfirmationEmail({
          email: input.email,
          name: input.name ?? undefined,
          plan: input.plan,
          registrationId: id,
          isAutoActivated: input.plan === "free",
        }).catch((err) => console.warn("[Email] Failed to send confirmation:", err));

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
  }),
});

export type AppRouter = typeof appRouter;
