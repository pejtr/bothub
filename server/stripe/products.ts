/**
 * iBots Stripe Products & Prices Configuration
 * Centralized product definitions for GOLD and DIAMOND subscription plans
 */

export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  priceAmount: number; // in CZK (smallest unit = haléře, so 990 CZK = 99000)
  currency: string;
  interval: "month" | "year";
  features: string[];
  metadata: Record<string, string>;
}

export const PLANS: Record<string, PlanConfig> = {
  gold: {
    id: "gold",
    name: "iBots GOLD",
    description: "Pro seriózní podnikatele a profesionály - všech 77 iBotů, neomezené zprávy, pokročilá analytika",
    priceAmount: 99000, // 990 CZK in haléře
    currency: "czk",
    interval: "month",
    features: [
      "Všech 77 iBotů",
      "Neomezené zprávy",
      "Pokročilá analytika",
      "Priority podpora 24/7",
      "API přístup",
      "Telegram & Discord integrace",
      "Export konverzací",
    ],
    metadata: {
      plan_type: "gold",
      bot_access: "all_77",
      heritage_access: "addon",
    },
  },
  diamond: {
    id: "diamond",
    name: "iBots DIAMOND",
    description: "Pro lídry, influencery a agentury - vše z GOLD + vlastní iBoti, white-label, Heritage Collection zdarma",
    priceAmount: 249000, // 2,490 CZK in haléře
    currency: "czk",
    interval: "month",
    features: [
      "Vše z GOLD plánu",
      "Vlastní iBoti na míru",
      "White-label řešení",
      "Dedikovaný account manager",
      "Heritage Collection ZDARMA",
      "Exkluzivní mastermind skupina",
      "Premium affiliate program",
    ],
    metadata: {
      plan_type: "diamond",
      bot_access: "all_77_plus_custom",
      heritage_access: "included",
    },
  },
  heritage_addon: {
    id: "heritage_addon",
    name: "Heritage Collection Add-on",
    description: "33 historických AI osobností z Heroworld a Villainworld - doplněk ke GOLD plánu",
    priceAmount: 49000, // 490 CZK in haléře
    currency: "czk",
    interval: "month",
    features: [
      "21 Heroworld osobností",
      "12 Villainworld osobností",
      "Historické perspektivy",
      "Dark Side Advisors",
    ],
    metadata: {
      plan_type: "heritage_addon",
      heritage_access: "full",
    },
  },
};

export const getPlanById = (planId: string): PlanConfig | undefined => {
  return PLANS[planId];
};

export const getAllPlans = (): PlanConfig[] => {
  return Object.values(PLANS);
};
