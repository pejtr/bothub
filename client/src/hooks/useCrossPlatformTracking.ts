/**
 * Cross-Platform Tracking Hook
 * Detects referral source (BotHub vs iBots) and preserves affiliate codes
 * across platforms using URL params and localStorage
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "ibots_referral";
const SOURCE_KEY = "ibots_source";

export interface ReferralData {
  affiliateCode: string | null;
  source: "ibots" | "bothub" | "direct";
  referrerUrl: string | null;
  timestamp: number;
}

/**
 * Parses affiliate code from URL params
 * Supports both BotHub (BH-XXXXXX, ?ref=BH-XXXXXX) and iBots (ib-XXXXXX, ?ref=ib-XXXXXX) formats
 */
function parseAffiliateFromUrl(): { code: string | null; source: "ibots" | "bothub" | "direct" } {
  const params = new URLSearchParams(window.location.search);
  
  // Check for affiliate code in URL params
  const ref = params.get("ref") || params.get("aff") || params.get("affiliate");
  
  if (ref) {
    if (ref.startsWith("BH-") || ref.startsWith("bh-")) {
      return { code: ref.toUpperCase(), source: "bothub" };
    }
    if (ref.startsWith("ib-")) {
      return { code: ref, source: "ibots" };
    }
    // Generic code - check referrer to determine source
    return { code: ref, source: detectSource() };
  }

  return { code: null, source: detectSource() };
}

/**
 * Detects if user came from BotHub based on referrer or UTM params
 */
function detectSource(): "ibots" | "bothub" | "direct" {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  
  if (utmSource === "bothub" || utmSource === "bothub.cz") {
    return "bothub";
  }

  const referrer = document.referrer;
  if (referrer.includes("bothub.cz") || referrer.includes("bothub.com")) {
    return "bothub";
  }

  return "direct";
}

/**
 * Save referral data to localStorage
 */
function saveReferral(data: ReferralData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(SOURCE_KEY, data.source);
  } catch {
    // localStorage not available
  }
}

/**
 * Load referral data from localStorage
 */
function loadReferral(): ReferralData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored) as ReferralData;
    
    // Expire after 30 days (cookie window)
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > thirtyDays) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SOURCE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

/**
 * Hook for cross-platform affiliate tracking
 */
export function useCrossPlatformTracking() {
  const [referral, setReferral] = useState<ReferralData | null>(null);

  useEffect(() => {
    // First check URL for new referral
    const urlData = parseAffiliateFromUrl();
    
    if (urlData.code) {
      // New referral from URL - save it
      const newReferral: ReferralData = {
        affiliateCode: urlData.code,
        source: urlData.source,
        referrerUrl: document.referrer || null,
        timestamp: Date.now(),
      };
      saveReferral(newReferral);
      setReferral(newReferral);
      
      // Clean URL params (remove ref/aff without reload)
      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      url.searchParams.delete("aff");
      url.searchParams.delete("affiliate");
      window.history.replaceState({}, "", url.toString());
    } else {
      // No URL referral - check localStorage
      const stored = loadReferral();
      if (stored) {
        setReferral(stored);
      } else {
        // Track direct visit source
        const source = detectSource();
        if (source !== "direct") {
          const directReferral: ReferralData = {
            affiliateCode: null,
            source,
            referrerUrl: document.referrer || null,
            timestamp: Date.now(),
          };
          saveReferral(directReferral);
          setReferral(directReferral);
        }
      }
    }
  }, []);

  return {
    referral,
    affiliateCode: referral?.affiliateCode || null,
    source: referral?.source || "direct",
    isFromBotHub: referral?.source === "bothub",
    isFromAffiliate: !!referral?.affiliateCode,
  };
}

/**
 * Generate cross-platform affiliate link
 */
export function generateAffiliateLink(
  affiliateCode: string,
  targetPlatform: "ibots" | "bothub" = "ibots"
): string {
  const baseUrl = targetPlatform === "bothub" ? "https://bothub.cz" : window.location.origin;
  return `${baseUrl}?ref=${affiliateCode}&utm_source=${targetPlatform === "bothub" ? "ibots" : "bothub"}`;
}

/**
 * Get stored source for API calls
 */
export function getStoredSource(): string {
  try {
    return localStorage.getItem(SOURCE_KEY) || "direct";
  } catch {
    return "direct";
  }
}
