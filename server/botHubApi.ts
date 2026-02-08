/**
 * BotHub API Integration Layer
 * 
 * Abstraction layer for communicating with api.bothub.cz.
 * Currently the API is not live, so all operations fall back to local DB.
 * When the API goes live, simply update BOTHUB_API_URL env var and
 * the integration will automatically start syncing.
 */

import { ENV } from "./_core/env";

// Configuration
const BOTHUB_API_URL = process.env.BOTHUB_API_URL || "https://api.bothub.cz";
const BOTHUB_API_KEY = process.env.BOTHUB_API_KEY || "";
const BOTHUB_API_TIMEOUT = 10000; // 10 seconds

export interface BotHubApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  isEnabled: boolean;
}

export function getApiConfig(): BotHubApiConfig {
  return {
    baseUrl: BOTHUB_API_URL,
    apiKey: BOTHUB_API_KEY,
    timeout: BOTHUB_API_TIMEOUT,
    isEnabled: !!BOTHUB_API_KEY && BOTHUB_API_URL !== "https://api.bothub.cz",
  };
}

// ===== API Health Check =====

export interface HealthCheckResult {
  status: "online" | "offline" | "degraded" | "not_configured";
  latency?: number;
  version?: string;
  message: string;
  checkedAt: Date;
}

export async function checkApiHealth(): Promise<HealthCheckResult> {
  const config = getApiConfig();
  
  if (!config.isEnabled) {
    return {
      status: "not_configured",
      message: "BotHub API není nakonfigurováno. Používá se lokální databáze.",
      checkedAt: new Date(),
    };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    const response = await fetch(`${config.baseUrl}/health`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        status: "online",
        latency,
        version: data.version,
        message: `API je online (${latency}ms)`,
        checkedAt: new Date(),
      };
    }

    return {
      status: "degraded",
      latency,
      message: `API odpovědělo s chybou: ${response.status} ${response.statusText}`,
      checkedAt: new Date(),
    };
  } catch (error: any) {
    return {
      status: "offline",
      latency: Date.now() - start,
      message: error.name === "AbortError" 
        ? `API timeout po ${config.timeout}ms`
        : `API nedostupné: ${error.message}`,
      checkedAt: new Date(),
    };
  }
}

// ===== Registration Sync =====

export interface SyncRegistrationPayload {
  email: string;
  name?: string;
  company?: string;
  plan: "free" | "gold" | "diamond";
  affiliateCode?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface SyncResult {
  success: boolean;
  synced: boolean;
  externalId?: string;
  error?: string;
}

/**
 * Sync a registration to BotHub API.
 * Falls back gracefully if API is not available.
 */
export async function syncRegistration(payload: SyncRegistrationPayload): Promise<SyncResult> {
  const config = getApiConfig();
  
  if (!config.isEnabled) {
    return { success: true, synced: false, error: "API not configured — using local DB" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(`${config.baseUrl}/v1/registrations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return { success: true, synced: true, externalId: data.id };
    }

    const errorText = await response.text().catch(() => "Unknown error");
    return { success: false, synced: false, error: `API error ${response.status}: ${errorText}` };
  } catch (error: any) {
    console.error("[BotHub API] Sync registration failed:", error.message);
    return { success: false, synced: false, error: error.message };
  }
}

// ===== iBot Catalog Sync =====

export interface IBot {
  id: string;
  name: string;
  category: string;
  description: string;
  personality: string;
  capabilities: string[];
  platforms: string[];
}

/**
 * Fetch iBot catalog from BotHub API.
 * Falls back to local static data if API is not available.
 */
export async function fetchIBotCatalog(): Promise<{ source: "api" | "local"; bots: IBot[] }> {
  const config = getApiConfig();
  
  if (!config.isEnabled) {
    return { source: "local", bots: [] };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(`${config.baseUrl}/v1/bots`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return { source: "api", bots: data.bots || data };
    }

    return { source: "local", bots: [] };
  } catch (error: any) {
    console.error("[BotHub API] Fetch catalog failed:", error.message);
    return { source: "local", bots: [] };
  }
}

// ===== User iBot Status =====

export interface UserBotStatus {
  botId: string;
  status: "active" | "inactive" | "pending";
  activatedAt?: string;
  expiresAt?: string;
}

/**
 * Get user's active iBots from BotHub API.
 */
export async function getUserBots(email: string): Promise<{ source: "api" | "local"; bots: UserBotStatus[] }> {
  const config = getApiConfig();
  
  if (!config.isEnabled) {
    return { source: "local", bots: [] };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(`${config.baseUrl}/v1/users/${encodeURIComponent(email)}/bots`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return { source: "api", bots: data.bots || data };
    }

    return { source: "local", bots: [] };
  } catch (error: any) {
    console.error("[BotHub API] Get user bots failed:", error.message);
    return { source: "local", bots: [] };
  }
}
