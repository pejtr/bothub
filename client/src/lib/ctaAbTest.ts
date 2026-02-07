export type CTAVariant = "variant_a" | "variant_b" | "variant_c";

export const CTA_VARIANTS: Record<CTAVariant, { text: string; description: string }> = {
  variant_a: {
    text: "Vyzkoušet ZDARMA",
    description: "Benefit-oriented, low commitment",
  },
  variant_b: {
    text: "Začít prodávat s AI",
    description: "Action-oriented, direct",
  },
  variant_c: {
    text: "Získat 3 iBoty zdarma",
    description: "Specific value, curiosity-driven",
  },
};

const STORAGE_KEY = "cta_variant";
const CLICKS_KEY = "cta_clicks";

export function getUserCTAVariant(): CTAVariant {
  if (typeof window === "undefined") return "variant_a";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in CTA_VARIANTS) {
    return stored as CTAVariant;
  }

  const variants = Object.keys(CTA_VARIANTS) as CTAVariant[];
  const randomIndex = Math.floor(Math.random() * variants.length);
  const selected = variants[randomIndex];
  localStorage.setItem(STORAGE_KEY, selected);
  return selected;
}

export function getCTAText(): string {
  const variant = getUserCTAVariant();
  return CTA_VARIANTS[variant].text;
}

export function trackCTAClick(targetUrl: string): void {
  if (typeof window === "undefined") return;

  const variant = getUserCTAVariant();
  const clicks = JSON.parse(localStorage.getItem(CLICKS_KEY) || "{}");
  const key = `${variant}_${targetUrl}`;
  clicks[key] = (clicks[key] || 0) + 1;
  localStorage.setItem(CLICKS_KEY, JSON.stringify(clicks));

  // Also send to server for persistent tracking
  fetch("/api/trpc/tracking.ctaClick", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json: { variant, targetUrl } }),
  }).catch(() => {});
}

export function getCTAClicks(): Record<string, number> {
  if (typeof window === "undefined") return {};
  return JSON.parse(localStorage.getItem(CLICKS_KEY) || "{}");
}
