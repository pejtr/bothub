/**
 * Cross-Platform SSO Service
 * Enables shared authentication between iBots and BotHub.cz
 * Uses JWT-based cross-platform tokens for seamless login
 */

import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../_core/env";

const SSO_TOKEN_EXPIRY = "10m"; // Short-lived for security
const SSO_SECRET_SUFFIX = "_sso_cross_platform";

export interface SSOPayload {
  openId: string;
  name: string;
  email: string | null;
  sourcePlatform: "ibots" | "bothub";
  targetPlatform: "ibots" | "bothub";
}

/**
 * Get SSO signing secret (derived from JWT_SECRET + suffix for isolation)
 */
function getSSOSecret(): Uint8Array {
  const secret = ENV.cookieSecret + SSO_SECRET_SUFFIX;
  return new TextEncoder().encode(secret);
}

/**
 * Generate a short-lived SSO token for cross-platform authentication
 * User clicks "Go to BotHub" → we generate token → redirect with token in URL
 */
export async function generateSSOToken(payload: SSOPayload): Promise<string> {
  const secret = getSSOSecret();

  return new SignJWT({
    openId: payload.openId,
    name: payload.name,
    email: payload.email,
    sourcePlatform: payload.sourcePlatform,
    targetPlatform: payload.targetPlatform,
    type: "sso_cross_platform",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(SSO_TOKEN_EXPIRY)
    .setIssuer("ibots")
    .setAudience(payload.targetPlatform)
    .sign(secret);
}

/**
 * Verify an incoming SSO token from another platform
 * BotHub redirects user here with ?sso_token=xxx → we verify and create session
 */
export async function verifySSOToken(
  token: string,
  expectedAudience: "ibots" | "bothub" = "ibots"
): Promise<SSOPayload | null> {
  try {
    const secret = getSSOSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      audience: expectedAudience,
      issuer: expectedAudience === "ibots" ? "bothub" : "ibots",
    });

    const { openId, name, email, sourcePlatform, targetPlatform, type } =
      payload as Record<string, unknown>;

    if (type !== "sso_cross_platform") {
      console.warn("[SSO] Invalid token type:", type);
      return null;
    }

    if (
      typeof openId !== "string" ||
      typeof sourcePlatform !== "string" ||
      typeof targetPlatform !== "string"
    ) {
      console.warn("[SSO] Missing required fields in SSO token");
      return null;
    }

    return {
      openId,
      name: (name as string) || "",
      email: (email as string) || null,
      sourcePlatform: sourcePlatform as "ibots" | "bothub",
      targetPlatform: targetPlatform as "ibots" | "bothub",
    };
  } catch (error) {
    console.warn("[SSO] Token verification failed:", String(error));
    return null;
  }
}

/**
 * Build the SSO redirect URL for cross-platform navigation
 */
export function buildSSORedirectUrl(
  targetBaseUrl: string,
  ssoToken: string,
  returnPath: string = "/"
): string {
  const url = new URL("/api/sso/callback", targetBaseUrl);
  url.searchParams.set("sso_token", ssoToken);
  url.searchParams.set("return_path", returnPath);
  return url.toString();
}

/**
 * Platform configuration for cross-platform SSO
 */
export const PLATFORM_CONFIG = {
  ibots: {
    name: "iBots",
    baseUrl: "https://ibots.manus.space", // Will be dynamic in production
  },
  bothub: {
    name: "BotHub.cz",
    baseUrl: "https://bothub.cz",
  },
} as const;
