import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  captureEmail, trackAbTestEvent, trackAffiliateClick,
  createRegistration, getRegistrationByEmail, activateRegistration,
  createAffiliateRegistration, getAffiliateByEmail
} from "./db";
import { notifyOwner } from "./_core/notification";

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
      .input(z.object({
        variant: z.string(),
        targetUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        await trackAbTestEvent("cta_hero", input.variant, "click");
        return { success: true };
      }),

    ctaImpression: publicProcedure
      .input(z.object({
        variant: z.string(),
      }))
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
    /**
     * Register a new user for an iBot plan.
     * This is the main conversion endpoint — all CTA buttons lead here.
     * When BotHub API (api.bothub.cz) goes live, this procedure will
     * also forward the registration to the external API.
     */
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
        // Check if already registered
        const existing = await getRegistrationByEmail(input.email);
        if (existing) {
          return {
            success: true,
            alreadyRegistered: true,
            registrationId: existing.id,
            plan: existing.plan,
            status: existing.status,
            message: "Tento e-mail je již registrován. Zkontrolujte svou e-mailovou schránku.",
          };
        }

        // Create registration
        const { id } = await createRegistration({
          email: input.email,
          name: input.name ?? null,
          company: input.company ?? null,
          plan: input.plan,
          source: input.source,
          ctaVariant: input.ctaVariant ?? null,
          affiliateCode: input.affiliateCode ?? null,
          gdprConsent: input.gdprConsent ? 1 : 0,
        });

        // Track conversion in A/B test
        if (input.ctaVariant) {
          await trackAbTestEvent("cta_hero", input.ctaVariant, "conversion").catch(() => {});
        }

        // Also capture email for marketing
        await captureEmail({
          email: input.email,
          source: `registration_${input.plan}`,
          variant: input.ctaVariant ?? null,
          gdprConsent: input.gdprConsent ? 1 : 0,
        }).catch(() => {});

        // Notify owner about new registration
        await notifyOwner({
          title: `Nová registrace: ${input.plan.toUpperCase()} plán`,
          content: `E-mail: ${input.email}\nPlán: ${input.plan.toUpperCase()}\nZdroj: ${input.source}\n${input.company ? `Firma: ${input.company}` : ""}${input.affiliateCode ? `\nAffiliate: ${input.affiliateCode}` : ""}`,
        }).catch(() => {});

        // Auto-activate for FREE plan
        if (input.plan === "free") {
          await activateRegistration(id).catch(() => {});
        }

        return {
          success: true,
          alreadyRegistered: false,
          registrationId: id,
          plan: input.plan,
          status: input.plan === "free" ? "activated" : "pending",
          message: input.plan === "free"
            ? "Registrace dokončena! Váš FREE plán je aktivní."
            : `Registrace dokončena! Brzy vás budeme kontaktovat ohledně aktivace plánu ${input.plan.toUpperCase()}.`,
        };
      }),

    /** Check if an email is already registered */
    checkEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const existing = await getRegistrationByEmail(input.email);
        return { registered: !!existing, plan: existing?.plan ?? null };
      }),
  }),

  affiliate: router({
    /**
     * Register as an affiliate partner.
     * Generates a unique affiliate code (BH-XXXXXX).
     */
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().min(1),
        company: z.string().optional(),
        website: z.string().optional(),
        gdprConsent: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        // Check if already registered
        const existing = await getAffiliateByEmail(input.email);
        if (existing) {
          return {
            success: true,
            alreadyRegistered: true,
            affiliateCode: existing.affiliateCode,
            message: "Tento e-mail je již registrován jako affiliate partner.",
          };
        }

        const { affiliateCode } = await createAffiliateRegistration({
          email: input.email,
          name: input.name,
          company: input.company ?? null,
          website: input.website ?? null,
          gdprConsent: input.gdprConsent ? 1 : 0,
        });

        // Notify owner
        await notifyOwner({
          title: "Nový affiliate partner",
          content: `E-mail: ${input.email}\nJméno: ${input.name}\nKód: ${affiliateCode}\n${input.website ? `Web: ${input.website}` : ""}`,
        }).catch(() => {});

        return {
          success: true,
          alreadyRegistered: false,
          affiliateCode,
          message: `Registrace dokončena! Váš affiliate kód je ${affiliateCode}.`,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
