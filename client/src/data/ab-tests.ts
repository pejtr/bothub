/**
 * A/B Test Configurations for iBots
 * 
 * Test: pricing_v2 (3-way split)
 * Control: Original pricing (GOLD 990 Kč, DIAMOND 2 490 Kč)
 * Variant B: Anchor pricing with higher original + discount (Hormozi price anchoring)
 * Variant C: Feature-focused with ROI highlights and social proof badges
 * 
 * Hormozi principles: 
 * - Control: Clean baseline
 * - Variant B: Price anchoring makes actual price feel like a steal
 * - Variant C: Value stacking - emphasize what they GET, not what they pay
 */

export interface PricingVariant {
  goldPrice: string;
  goldOriginalPrice: string | null;
  goldPeriod: string;
  goldDiscount: string | null;
  diamondPrice: string;
  diamondOriginalPrice: string | null;
  diamondPeriod: string;
  diamondDiscount: string | null;
  goldCta: string;
  diamondCta: string;
  showUrgency: boolean;
  urgencyText: string | null;
  // Variant C specific - feature highlights
  goldHighlights: string[] | null;
  diamondHighlights: string[] | null;
  goldRoiBadge: string | null;
  diamondRoiBadge: string | null;
  goldSocialProof: string | null;
  diamondSocialProof: string | null;
  showFeatureComparison: boolean;
}

export const PRICING_AB_TEST = {
  testName: "pricing_v2",
  variants: {
    control: {
      goldPrice: "990",
      goldOriginalPrice: null,
      goldPeriod: "měsíčně",
      goldDiscount: null,
      diamondPrice: "2 490",
      diamondOriginalPrice: null,
      diamondPeriod: "měsíčně",
      diamondDiscount: null,
      goldCta: "Získat GOLD",
      diamondCta: "Kontaktovat sales",
      showUrgency: false,
      urgencyText: null,
      goldHighlights: null,
      diamondHighlights: null,
      goldRoiBadge: null,
      diamondRoiBadge: null,
      goldSocialProof: null,
      diamondSocialProof: null,
      showFeatureComparison: false,
    } as PricingVariant,
    variant_b: {
      goldPrice: "990",
      goldOriginalPrice: "1 490",
      goldPeriod: "měsíčně",
      goldDiscount: "Ušetřete 33%",
      diamondPrice: "2 490",
      diamondOriginalPrice: "3 990",
      diamondPeriod: "měsíčně",
      diamondDiscount: "Ušetřete 38%",
      goldCta: "Získat GOLD se slevou",
      diamondCta: "Získat DIAMOND se slevou",
      showUrgency: true,
      urgencyText: "Akce končí za 48 hodin",
      goldHighlights: null,
      diamondHighlights: null,
      goldRoiBadge: null,
      diamondRoiBadge: null,
      goldSocialProof: null,
      diamondSocialProof: null,
      showFeatureComparison: false,
    } as PricingVariant,
    variant_c: {
      goldPrice: "990",
      goldOriginalPrice: null,
      goldPeriod: "měsíčně",
      goldDiscount: null,
      diamondPrice: "2 490",
      diamondOriginalPrice: null,
      diamondPeriod: "měsíčně",
      diamondDiscount: null,
      goldCta: "Odemknout 77 AI expertů",
      diamondCta: "Získat VIP přístup",
      showUrgency: false,
      urgencyText: null,
      goldHighlights: [
        "77 AI expertů = hodnota 77 konzultantů",
        "Neomezené konverzace 24/7",
        "ROI průměrně +327% za 90 dní",
      ],
      diamondHighlights: [
        "Vlastní AI chatboti na míru",
        "White-label pro vaši značku",
        "Dedikovaný account manager",
      ],
      goldRoiBadge: "+327% ROI",
      diamondRoiBadge: "Nejlepší hodnota",
      goldSocialProof: "2,847+ aktivních uživatelů",
      diamondSocialProof: "Pro top 1% podnikatelů",
      showFeatureComparison: true,
    } as PricingVariant,
  },
};
