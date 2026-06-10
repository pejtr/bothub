/**
 * SSO Express Routes
 * Handles cross-platform authentication callbacks and token generation
 */

import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import * as db from "../db";
import { verifySSOToken } from "./sso";

/**
 * Register SSO routes on the Express app
 * Must be called after body parsers are set up
 */
export function registerSSORoutes(app: Express) {
  /**
   * SSO Callback - receives token from another platform and creates local session
   * GET /api/sso/callback?sso_token=xxx&return_path=/
   */
  app.get("/api/sso/callback", async (req: Request, res: Response) => {
    const ssoToken = req.query.sso_token as string | undefined;
    const returnPath = (req.query.return_path as string) || "/";

    if (!ssoToken) {
      console.warn("[SSO] Missing sso_token in callback");
      res.redirect(302, "/?sso_error=missing_token");
      return;
    }

    try {
      // Verify the SSO token (audience = "ibots" since we're receiving on iBots)
      const ssoPayload = await verifySSOToken(ssoToken, "ibots");

      if (!ssoPayload) {
        console.warn("[SSO] Invalid or expired SSO token");
        res.redirect(302, "/?sso_error=invalid_token");
        return;
      }

      console.log(
        `[SSO] Cross-platform login from ${ssoPayload.sourcePlatform}: ${ssoPayload.openId}`
      );

      // Upsert user in our database
      await db.upsertUser({
        openId: ssoPayload.openId,
        name: ssoPayload.name || null,
        email: ssoPayload.email || null,
        loginMethod: `sso_${ssoPayload.sourcePlatform}`,
        lastSignedIn: new Date(),
      });

      // Create a local session token
      const sessionToken = await sdk.createSessionToken(ssoPayload.openId, {
        name: ssoPayload.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Redirect to the requested path
      const safePath = returnPath.startsWith("/") ? returnPath : "/";
      res.redirect(302, safePath);
    } catch (error) {
      console.error("[SSO] Callback failed:", error);
      res.redirect(302, "/?sso_error=callback_failed");
    }
  });

  /**
   * SSO Health check - verifies SSO service is operational
   * GET /api/sso/health
   */
  app.get("/api/sso/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "ibots-sso",
      platforms: ["ibots", "bothub"],
      timestamp: new Date().toISOString(),
    });
  });
}
