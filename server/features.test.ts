import { describe, expect, it } from "vitest";
import { PLANS, getPlanById, getAllPlans } from "./stripe/products";

describe("Stripe Products Configuration", () => {
  it("should have gold, diamond, and heritage_addon plans defined", () => {
    expect(PLANS.gold).toBeDefined();
    expect(PLANS.diamond).toBeDefined();
    expect(PLANS.heritage_addon).toBeDefined();
  });

  it("gold plan should have correct pricing (990 CZK = 99000 haléřů)", () => {
    expect(PLANS.gold.priceAmount).toBe(99000);
    expect(PLANS.gold.currency).toBe("czk");
    expect(PLANS.gold.interval).toBe("month");
  });

  it("diamond plan should have correct pricing (2490 CZK = 249000 haléřů)", () => {
    expect(PLANS.diamond.priceAmount).toBe(249000);
    expect(PLANS.diamond.currency).toBe("czk");
    expect(PLANS.diamond.interval).toBe("month");
  });

  it("heritage addon should have correct pricing (490 CZK = 49000 haléřů)", () => {
    expect(PLANS.heritage_addon.priceAmount).toBe(49000);
    expect(PLANS.heritage_addon.currency).toBe("czk");
    expect(PLANS.heritage_addon.interval).toBe("month");
  });

  it("all plans should have name, description, and features", () => {
    Object.values(PLANS).forEach((plan) => {
      expect(plan.name).toBeTruthy();
      expect(plan.description).toBeTruthy();
      expect(plan.features.length).toBeGreaterThan(0);
    });
  });

  it("all plans should have metadata with plan_type", () => {
    Object.values(PLANS).forEach((plan) => {
      expect(plan.metadata.plan_type).toBeTruthy();
    });
  });

  it("getPlanById should return correct plan", () => {
    const gold = getPlanById("gold");
    expect(gold).toBeDefined();
    expect(gold?.name).toBe("iBots GOLD");

    const diamond = getPlanById("diamond");
    expect(diamond).toBeDefined();
    expect(diamond?.name).toBe("iBots DIAMOND");
  });

  it("getPlanById should return undefined for unknown plan", () => {
    const unknown = getPlanById("nonexistent");
    expect(unknown).toBeUndefined();
  });

  it("getAllPlans should return all 3 plans", () => {
    const plans = getAllPlans();
    expect(plans).toHaveLength(3);
  });

  it("gold plan features should include key selling points", () => {
    expect(PLANS.gold.features).toContain("Všech 77 iBotů");
    expect(PLANS.gold.features).toContain("Neomezené zprávy");
    expect(PLANS.gold.features).toContain("Pokročilá analytika");
  });

  it("diamond plan features should include premium features", () => {
    expect(PLANS.diamond.features).toContain("Vše z GOLD plánu");
    expect(PLANS.diamond.features).toContain("Vlastní iBoti na míru");
    expect(PLANS.diamond.features).toContain("White-label řešení");
    expect(PLANS.diamond.features).toContain("Heritage Collection ZDARMA");
  });

  it("heritage addon should reference both Heroworld and Villainworld", () => {
    const hasHeroworld = PLANS.heritage_addon.features.some(f => f.includes("Heroworld"));
    const hasVillainworld = PLANS.heritage_addon.features.some(f => f.includes("Villainworld"));
    expect(hasHeroworld).toBe(true);
    expect(hasVillainworld).toBe(true);
  });

  it("diamond should be more expensive than gold", () => {
    expect(PLANS.diamond.priceAmount).toBeGreaterThan(PLANS.gold.priceAmount);
  });

  it("gold should be more expensive than heritage addon", () => {
    expect(PLANS.gold.priceAmount).toBeGreaterThan(PLANS.heritage_addon.priceAmount);
  });
});

describe("Router - Public Procedures", () => {
  it("stripe.getPlans should be accessible and return plan data", async () => {
    // Import appRouter to test the procedure
    const { appRouter } = await import("./routers");
    
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: () => {} } as any,
    });

    const plans = await caller.stripe.getPlans();
    expect(plans).toHaveLength(3);
    expect(plans[0]).toHaveProperty("id");
    expect(plans[0]).toHaveProperty("name");
    expect(plans[0]).toHaveProperty("priceAmount");
    expect(plans[0]).toHaveProperty("currency");
    expect(plans[0]).toHaveProperty("features");
  });
});
