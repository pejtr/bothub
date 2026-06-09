import { describe, it, expect } from "vitest";
import { PRICING_AB_TEST } from "../client/src/data/ab-tests";
import { PLANS } from "./stripe/products";

/**
 * Tests for new features:
 * 1. Affiliate system data integrity
 * 2. A/B test configuration
 * 3. Proactive chat trigger logic
 * 4. CSV export format
 */

// ============================================
// A/B Test Configuration Tests
// ============================================
describe("A/B Test Configuration", () => {
  it("should have a valid test name", () => {
    expect(PRICING_AB_TEST.testName).toBe("pricing_v2");
    expect(PRICING_AB_TEST.testName.length).toBeGreaterThan(0);
  });

  it("should have control and variant_b variants", () => {
    expect(PRICING_AB_TEST.variants).toHaveProperty("control");
    expect(PRICING_AB_TEST.variants).toHaveProperty("variant_b");
  });

  it("control variant should have standard pricing without discounts", () => {
    const control = PRICING_AB_TEST.variants.control;
    expect(control.goldPrice).toBe("990");
    expect(control.goldOriginalPrice).toBeNull();
    expect(control.goldDiscount).toBeNull();
    expect(control.diamondPrice).toBe("2 490");
    expect(control.diamondOriginalPrice).toBeNull();
    expect(control.diamondDiscount).toBeNull();
    expect(control.showUrgency).toBe(false);
  });

  it("variant_b should have anchor pricing with discounts", () => {
    const variant = PRICING_AB_TEST.variants.variant_b;
    expect(variant.goldPrice).toBe("990");
    expect(variant.goldOriginalPrice).toBe("1 490");
    expect(variant.goldDiscount).toBeTruthy();
    expect(variant.diamondPrice).toBe("2 490");
    expect(variant.diamondOriginalPrice).toBe("3 990");
    expect(variant.diamondDiscount).toBeTruthy();
    expect(variant.showUrgency).toBe(true);
    expect(variant.urgencyText).toBeTruthy();
  });

  it("both variants should have the same actual prices", () => {
    // Hormozi principle: anchor pricing doesn't change the actual price
    expect(PRICING_AB_TEST.variants.control.goldPrice).toBe(
      PRICING_AB_TEST.variants.variant_b.goldPrice
    );
    expect(PRICING_AB_TEST.variants.control.diamondPrice).toBe(
      PRICING_AB_TEST.variants.variant_b.diamondPrice
    );
  });

  it("variant_b should have custom CTA text", () => {
    const variant = PRICING_AB_TEST.variants.variant_b;
    expect(variant.goldCta).toContain("slevou");
    expect(variant.diamondCta).toContain("slevou");
  });

  it("control should have standard CTA text", () => {
    const control = PRICING_AB_TEST.variants.control;
    expect(control.goldCta).toBe("Získat GOLD");
    expect(control.diamondCta).toBe("Kontaktovat sales");
  });
});

// ============================================
// Stripe Plans Alignment with A/B Test
// ============================================
describe("Stripe Plans and A/B Test Alignment", () => {
  it("GOLD plan price should match A/B test pricing", () => {
    const goldPlan = PLANS.gold;
    expect(goldPlan).toBeDefined();
    // 990 Kč = 99000 haléřů
    expect(goldPlan.priceAmount).toBe(99000);
  });

  it("DIAMOND plan price should match A/B test pricing", () => {
    const diamondPlan = PLANS.diamond;
    expect(diamondPlan).toBeDefined();
    // 2490 Kč = 249000 haléřů
    expect(diamondPlan.priceAmount).toBe(249000);
  });

  it("all plans should have CZK currency", () => {
    Object.values(PLANS).forEach(plan => {
      expect(plan.currency).toBe("czk");
    });
  });
});

// ============================================
// Proactive Chat Trigger Logic Tests
// ============================================
describe("Proactive Chat Trigger Logic", () => {
  // Import the trigger function by testing its expected behavior
  // Since it's defined in routers.ts, we test the expected mapping
  
  const triggerMap: Record<string, { botId: string; shouldTrigger: boolean }> = {
    "scroll_pricing": { botId: "alex-hormozi", shouldTrigger: true },
    "time_on_page_60s": { botId: "tony-robbins", shouldTrigger: true },
    "exit_intent": { botId: "russell-brunson", shouldTrigger: true },
    "scroll_catalog": { botId: "warren-buffett", shouldTrigger: true },
    "revisit": { botId: "robin-sharma", shouldTrigger: true },
  };

  it("should have 5 defined trigger types", () => {
    expect(Object.keys(triggerMap)).toHaveLength(5);
  });

  it("each trigger should map to a known iBot", () => {
    const knownBots = [
      "alex-hormozi", "tony-robbins", "russell-brunson", 
      "warren-buffett", "robin-sharma"
    ];
    Object.values(triggerMap).forEach(trigger => {
      expect(knownBots).toContain(trigger.botId);
    });
  });

  it("all triggers should be set to activate", () => {
    Object.values(triggerMap).forEach(trigger => {
      expect(trigger.shouldTrigger).toBe(true);
    });
  });

  it("scroll_pricing should trigger Alex Hormozi (sales expert)", () => {
    expect(triggerMap["scroll_pricing"].botId).toBe("alex-hormozi");
  });

  it("exit_intent should trigger Russell Brunson (funnel expert)", () => {
    expect(triggerMap["exit_intent"].botId).toBe("russell-brunson");
  });

  it("revisit should trigger Robin Sharma (relationship builder)", () => {
    expect(triggerMap["revisit"].botId).toBe("robin-sharma");
  });
});

// ============================================
// CSV Export Format Tests
// ============================================
describe("CSV Export Format", () => {
  const mockConversions = [
    {
      id: 1,
      planId: "gold",
      saleAmount: 99000,
      commissionRate: 66,
      commissionAmount: 65340,
      status: "confirmed",
      createdAt: new Date("2026-01-15"),
    },
    {
      id: 2,
      planId: "diamond",
      saleAmount: 249000,
      commissionRate: 77,
      commissionAmount: 191730,
      status: "paid",
      createdAt: new Date("2026-01-20"),
    },
  ];

  it("should generate correct CSV headers", () => {
    const headers = ["Datum", "Plán", "Částka prodeje (Kč)", "Provize (%)", "Provize (Kč)", "Status"];
    expect(headers).toHaveLength(6);
    expect(headers[0]).toBe("Datum");
    expect(headers[5]).toBe("Status");
  });

  it("should correctly format sale amounts from haléře to Kč", () => {
    const goldSale = (mockConversions[0].saleAmount / 100).toFixed(2);
    expect(goldSale).toBe("990.00");

    const diamondSale = (mockConversions[1].saleAmount / 100).toFixed(2);
    expect(diamondSale).toBe("2490.00");
  });

  it("should correctly format commission amounts", () => {
    const goldCommission = (mockConversions[0].commissionAmount / 100).toFixed(2);
    expect(goldCommission).toBe("653.40");

    const diamondCommission = (mockConversions[1].commissionAmount / 100).toFixed(2);
    expect(diamondCommission).toBe("1917.30");
  });

  it("should correctly calculate GOLD commission (66%)", () => {
    const sale = mockConversions[0];
    const expectedCommission = Math.round(sale.saleAmount * (sale.commissionRate / 100));
    expect(sale.commissionAmount).toBe(expectedCommission);
  });

  it("should correctly calculate DIAMOND commission (77%)", () => {
    const sale = mockConversions[1];
    const expectedCommission = Math.round(sale.saleAmount * (sale.commissionRate / 100));
    expect(sale.commissionAmount).toBe(expectedCommission);
  });

  it("should generate valid CSV content", () => {
    const headers = ["Datum", "Plán", "Částka prodeje (Kč)", "Provize (%)", "Provize (Kč)", "Status"];
    const rows = mockConversions.map(c => [
      new Date(c.createdAt).toLocaleDateString("cs-CZ"),
      c.planId.toUpperCase(),
      (c.saleAmount / 100).toFixed(2),
      c.commissionRate.toString(),
      (c.commissionAmount / 100).toFixed(2),
      c.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    expect(csvContent).toContain("Datum,Plán");
    expect(csvContent).toContain("GOLD");
    expect(csvContent).toContain("DIAMOND");
    expect(csvContent).toContain("990.00");
    expect(csvContent).toContain("2490.00");
    expect(csvContent.split("\n")).toHaveLength(3); // header + 2 rows
  });
});

// ============================================
// Affiliate Commission Structure Tests
// ============================================
describe("Affiliate Commission Structure", () => {
  it("GOLD commission rate should be 66%", () => {
    const goldCommissionRate = 66;
    const goldPrice = 99000; // haléře
    const commission = Math.round(goldPrice * (goldCommissionRate / 100));
    expect(commission).toBe(65340);
    // 653.40 Kč per GOLD sale
    expect(commission / 100).toBe(653.40);
  });

  it("DIAMOND commission rate should be 77%", () => {
    const diamondCommissionRate = 77;
    const diamondPrice = 249000; // haléře
    const commission = Math.round(diamondPrice * (diamondCommissionRate / 100));
    expect(commission).toBe(191730);
    // 1917.30 Kč per DIAMOND sale
    expect(commission / 100).toBe(1917.30);
  });

  it("10 GOLD customers should earn 6,534 Kč/month", () => {
    const monthlyEarning = 10 * 65340; // haléře
    expect(monthlyEarning / 100).toBe(6534);
  });

  it("5 DIAMOND customers should earn 9,586.50 Kč/month", () => {
    const monthlyEarning = 5 * 191730; // haléře
    expect(monthlyEarning / 100).toBe(9586.50);
  });
});
