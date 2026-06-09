/**
 * Admin login pro BotHub (náhrada za Manus OAuth).
 * Normální uživatelé se registrují přes RegistrationModal (email flow) — beze změny.
 * Pouze admin přístup k /admin dashboardu prochází přes tento login.
 *
 * POST /api/auth/login  { email, password } → JWT cookie
 * POST /api/auth/logout                     → clear cookie
 */
import type { Express, Request, Response } from "express";
import { SignJWT } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(ENV.cookieSecret);
  const msgData = encoder.encode(plain);
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, msgData);
  return Buffer.from(sig).toString("hex") === hash;
}

export function registerAdminAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email a heslo jsou povinné" });
    }
    if (email !== ENV.adminEmail) {
      return res.status(401).json({ error: "Neplatné přihlašovací údaje" });
    }
    const valid = await verifyPassword(password, ENV.adminPasswordHash);
    if (!valid) {
      return res.status(401).json({ error: "Neplatné přihlašovací údaje" });
    }

    const secretKey = new TextEncoder().encode(ENV.cookieSecret);
    const token = await new SignJWT({
      openId: ENV.ownerOpenId,
      appId:  "bothub",
      name:   "Admin",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
      .sign(secretKey);

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    return res.json({ ok: true });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    return res.json({ ok: true });
  });
}
