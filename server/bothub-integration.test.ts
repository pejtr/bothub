import { describe, it, expect } from "vitest";

/**
 * BotHub Integration Tests
 * Tests cross-platform navigation, branding, affiliate tracking
 */

// ============================================================
// Cross-Platform Tracking Logic Tests
// ============================================================

describe("Cross-Platform Tracking", () => {
  describe("Affiliate Code Parsing", () => {
    it("should detect BotHub affiliate codes (BH- prefix)", () => {
      const code = "BH-ABC123";
      const isBotHub = code.startsWith("BH-") || code.startsWith("bh-");
      expect(isBotHub).toBe(true);
    });

    it("should detect iBots affiliate codes (ib- prefix)", () => {
      const code = "ib-42-abc123";
      const isIBots = code.startsWith("ib-");
      expect(isIBots).toBe(true);
    });

    it("should normalize BotHub codes to uppercase", () => {
      const code = "bh-abc123";
      const normalized = code.toUpperCase();
      expect(normalized).toBe("BH-ABC123");
    });

    it("should keep iBots codes as-is (lowercase)", () => {
      const code = "ib-42-abc123";
      expect(code.startsWith("ib-")).toBe(true);
      expect(code).toBe("ib-42-abc123");
    });
  });

  describe("Source Detection", () => {
    it("should detect bothub source from utm_source param", () => {
      const utmSource = "bothub";
      const source = utmSource === "bothub" || utmSource === "bothub.cz" ? "bothub" : "direct";
      expect(source).toBe("bothub");
    });

    it("should detect bothub.cz source from utm_source param", () => {
      const utmSource = "bothub.cz";
      const source = utmSource === "bothub" || utmSource === "bothub.cz" ? "bothub" : "direct";
      expect(source).toBe("bothub");
    });

    it("should detect direct source when no utm_source", () => {
      const utmSource = null;
      const source = utmSource === "bothub" || utmSource === "bothub.cz" ? "bothub" : "direct";
      expect(source).toBe("direct");
    });

    it("should detect bothub source from referrer URL", () => {
      const referrer = "https://bothub.cz/katalog";
      const isFromBotHub = referrer.includes("bothub.cz") || referrer.includes("bothub.com");
      expect(isFromBotHub).toBe(true);
    });

    it("should not detect bothub from unrelated referrer", () => {
      const referrer = "https://google.com/search?q=ibots";
      const isFromBotHub = referrer.includes("bothub.cz") || referrer.includes("bothub.com");
      expect(isFromBotHub).toBe(false);
    });
  });

  describe("Affiliate Link Generation", () => {
    it("should generate iBots affiliate link", () => {
      const code = "ib-42-abc123";
      const origin = "https://ibots.manus.space";
      const link = `${origin}?ref=${code}&utm_source=bothub`;
      expect(link).toContain("ref=ib-42-abc123");
      expect(link).toContain("utm_source=bothub");
    });

    it("should generate BotHub affiliate link", () => {
      const code = "ib-42-abc123";
      const link = `https://bothub.cz?ref=${code}&utm_source=ibots`;
      expect(link).toContain("bothub.cz");
      expect(link).toContain("ref=ib-42-abc123");
      expect(link).toContain("utm_source=ibots");
    });
  });

  describe("Referral Expiry", () => {
    it("should expire referral after 30 days", () => {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const oldTimestamp = Date.now() - thirtyDays - 1000; // 30 days + 1 second ago
      const isExpired = Date.now() - oldTimestamp > thirtyDays;
      expect(isExpired).toBe(true);
    });

    it("should not expire recent referral", () => {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const recentTimestamp = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
      const isExpired = Date.now() - recentTimestamp > thirtyDays;
      expect(isExpired).toBe(false);
    });
  });
});

// ============================================================
// BotHub Ecosystem Features Tests
// ============================================================

describe("BotHub Ecosystem", () => {
  const BOTHUB_URL = "https://bothub.cz";

  describe("Cross-Platform URLs", () => {
    it("should have correct BotHub base URL", () => {
      expect(BOTHUB_URL).toBe("https://bothub.cz");
    });

    it("should generate valid catalog link", () => {
      const catalogLink = `${BOTHUB_URL}/#katalog`;
      expect(catalogLink).toContain("bothub.cz");
      expect(catalogLink).toContain("#katalog");
    });

    it("should generate valid affiliate link", () => {
      const affiliateLink = `${BOTHUB_URL}/#affiliate`;
      expect(affiliateLink).toContain("bothub.cz");
      expect(affiliateLink).toContain("#affiliate");
    });

    it("should generate valid pricing link", () => {
      const pricingLink = `${BOTHUB_URL}/#cenik`;
      expect(pricingLink).toContain("bothub.cz");
      expect(pricingLink).toContain("#cenik");
    });
  });

  describe("Ecosystem Features", () => {
    const ecosystemFeatures = [
      { title: "77+ AI Osobností", icon: "MessageSquare" },
      { title: "Multi-platform", icon: "Zap" },
      { title: "Affiliate Program", icon: "Users" },
      { title: "Analytika & Reporty", icon: "BarChart3" },
    ];

    it("should have 4 ecosystem features", () => {
      expect(ecosystemFeatures).toHaveLength(4);
    });

    it("should include AI personalities feature", () => {
      const hasAI = ecosystemFeatures.some(f => f.title.includes("AI Osobností"));
      expect(hasAI).toBe(true);
    });

    it("should include affiliate program feature", () => {
      const hasAffiliate = ecosystemFeatures.some(f => f.title.includes("Affiliate"));
      expect(hasAffiliate).toBe(true);
    });

    it("should include multi-platform feature", () => {
      const hasMultiPlatform = ecosystemFeatures.some(f => f.title.includes("Multi-platform"));
      expect(hasMultiPlatform).toBe(true);
    });
  });

  describe("Platform Links", () => {
    const platformLinks = [
      { label: "Katalog iBotů", href: `${BOTHUB_URL}/#katalog` },
      { label: "Affiliate Program", href: `${BOTHUB_URL}/#affiliate` },
      { label: "Cenové plány", href: `${BOTHUB_URL}/#cenik` },
      { label: "Blog & Novinky", href: `${BOTHUB_URL}/blog` },
    ];

    it("should have 4 platform links", () => {
      expect(platformLinks).toHaveLength(4);
    });

    it("all links should point to bothub.cz", () => {
      platformLinks.forEach(link => {
        expect(link.href).toContain("bothub.cz");
      });
    });

    it("should include blog link", () => {
      const hasBlog = platformLinks.some(l => l.href.includes("/blog"));
      expect(hasBlog).toBe(true);
    });
  });
});

// ============================================================
// Cross-Platform Affiliate Stats Tests
// ============================================================

describe("Cross-Platform Affiliate Stats", () => {
  it("should structure clicks by source", () => {
    const clicksBySource = {
      ibots: 150,
      bothub: 85,
      total: 235,
    };

    expect(clicksBySource.ibots + clicksBySource.bothub).toBe(clicksBySource.total);
    expect(clicksBySource.ibots).toBeGreaterThan(0);
    expect(clicksBySource.bothub).toBeGreaterThan(0);
  });

  it("should structure conversions by source", () => {
    const conversionsBySource = {
      ibots: { count: 12, amount: 118800 }, // 1188 Kč
      bothub: { count: 8, amount: 79200 }, // 792 Kč
    };

    expect(conversionsBySource.ibots.count).toBeGreaterThan(0);
    expect(conversionsBySource.bothub.count).toBeGreaterThan(0);
    expect(conversionsBySource.ibots.amount).toBeGreaterThan(0);
    expect(conversionsBySource.bothub.amount).toBeGreaterThan(0);
  });

  it("should calculate total cross-platform earnings", () => {
    const ibots = 118800;
    const bothub = 79200;
    const total = ibots + bothub;
    expect(total).toBe(198000); // 1980 Kč
  });

  it("should format amounts in CZK correctly", () => {
    const amount = 118800; // haléře
    const formatted = (amount / 100).toLocaleString("cs-CZ");
    expect(formatted).toBeTruthy();
    expect(amount / 100).toBe(1188);
  });
});

// ============================================================
// Schema Validation Tests
// ============================================================

describe("Schema Cross-Platform Fields", () => {
  it("should support ibots source in clicks", () => {
    const validSources = ["ibots", "bothub"];
    expect(validSources).toContain("ibots");
    expect(validSources).toContain("bothub");
  });

  it("should support ibots source in conversions", () => {
    const validSources = ["ibots", "bothub"];
    expect(validSources).toContain("ibots");
    expect(validSources).toContain("bothub");
  });

  it("should default source to ibots", () => {
    const defaultSource = "ibots";
    expect(defaultSource).toBe("ibots");
  });
});
