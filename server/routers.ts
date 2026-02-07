import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { captureEmail, trackAbTestEvent, trackAffiliateClick } from "./db";

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
});

export type AppRouter = typeof appRouter;
