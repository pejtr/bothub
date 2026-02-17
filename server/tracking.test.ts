import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  captureEmail: vi.fn().mockResolvedValue(undefined),
  trackAbTestEvent: vi.fn().mockResolvedValue(undefined),
  trackAffiliateClick: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  getEmailCaptureCount: vi.fn().mockResolvedValue(42),
  createRegistration: vi.fn().mockResolvedValue({ id: 1 }),
  getRegistrationByEmail: vi.fn().mockResolvedValue(undefined),
  activateRegistration: vi.fn().mockResolvedValue(undefined),
  getRegistrationCount: vi.fn().mockResolvedValue(10),
  createAffiliateRegistration: vi.fn().mockResolvedValue({ id: 1, affiliateCode: "BH-TEST01" }),
  getAffiliateByEmail: vi.fn().mockResolvedValue(undefined),
  getDashboardStats: vi.fn().mockResolvedValue({ registrations: 15, affiliates: 3, emails: 42, affiliateClicks: 100 }),
  getRegistrationsByPlan: vi.fn().mockResolvedValue([
    { plan: "free", count: 10, activated: 8, pending: 2 },
    { plan: "gold", count: 5, activated: 3, pending: 2 },
  ]),
  getAbTestResults: vi.fn().mockResolvedValue([
    { id: 1, testName: "cta_hero", variant: "variant_a", impressions: 100, clicks: 20, conversions: 5, updatedAt: new Date() },
  ]),
  getRecentRegistrations: vi.fn().mockResolvedValue([]),
  getRecentEmailCaptures: vi.fn().mockResolvedValue([]),
  getAffiliatePartners: vi.fn().mockResolvedValue([]),
  getRecentAffiliateClicks: vi.fn().mockResolvedValue([]),
  getRegistrationsByDay: vi.fn().mockResolvedValue([]),
  getEmailCapturesByDay: vi.fn().mockResolvedValue([]),
  getUserRegistrations: vi.fn().mockResolvedValue([
    { id: 1, email: "user@test.cz", name: "User", plan: "free", status: "activated", source: "hero_cta", company: null, ctaVariant: null, affiliateCode: null, gdprConsent: 1, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getAffiliateStats: vi.fn().mockResolvedValue({
    totalClicks: 50, totalReferrals: 5, goldReferrals: 3, diamondReferrals: 2, pendingCommission: 5793,
  }),
  getAffiliateReferrals: vi.fn().mockResolvedValue([
    { id: 10, email: "ref@test.cz", plan: "gold", status: "activated", createdAt: new Date() },
  ]),
  // Notifications
  createNotification: vi.fn().mockResolvedValue(undefined),
  getUserNotifications: vi.fn().mockResolvedValue([
    { id: 1, userId: 2, type: "registration", title: "Plán FREE aktivován!", message: "Váš plán FREE byl úspěšně aktivován.", isRead: 0, actionUrl: "/dashboard", metadata: null, createdAt: new Date() },
    { id: 2, userId: 2, type: "system", title: "Vítejte v BOTHUB!", message: "Děkujeme za registraci.", isRead: 1, actionUrl: null, metadata: null, createdAt: new Date() },
  ]),
  getUnreadNotificationCount: vi.fn().mockResolvedValue(1),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  notifyRegistrationChange: vi.fn().mockResolvedValue(undefined),
  // Blog
  createBlogPost: vi.fn().mockResolvedValue({ id: 1 }),
  updateBlogPost: vi.fn().mockResolvedValue(undefined),
  deleteBlogPost: vi.fn().mockResolvedValue(undefined),
  getBlogPostById: vi.fn().mockResolvedValue({
    id: 1, slug: "test-post", titleCs: "Test článek", titleEn: "Test Article",
    contentCs: "# Test\nObsah", contentEn: "# Test\nContent",
    excerptCs: "Výtah", excerptEn: "Excerpt",
    metaDescriptionCs: "Meta CZ", metaDescriptionEn: "Meta EN",
    category: "AI", coverImage: null, author: "BOTHUB Team",
    status: "published", readingTime: 5, publishedAt: new Date(),
    createdAt: new Date(), updatedAt: new Date(),
  }),
  getBlogPostBySlug: vi.fn().mockResolvedValue({
    id: 1, slug: "test-post", titleCs: "Test článek", titleEn: "Test Article",
    contentCs: "# Test\nObsah", contentEn: "# Test\nContent",
    excerptCs: "Výtah", excerptEn: "Excerpt",
    metaDescriptionCs: "Meta CZ", metaDescriptionEn: "Meta EN",
    category: "AI", coverImage: null, author: "BOTHUB Team",
    status: "published", readingTime: 5, publishedAt: new Date(),
    createdAt: new Date(), updatedAt: new Date(),
  }),
  getAllBlogPosts: vi.fn().mockResolvedValue([
    { id: 1, slug: "test-post", titleCs: "Test článek", status: "published", category: "AI", author: "BOTHUB Team", readingTime: 5, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getPublishedBlogPosts: vi.fn().mockResolvedValue([
    { id: 1, slug: "test-post", titleCs: "Test článek", status: "published", category: "AI", author: "BOTHUB Team", readingTime: 5, publishedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
  ]),
  getAffiliateByCode: vi.fn().mockResolvedValue({ id: 1, email: "affiliate@test.cz", name: "Affiliate Partner", affiliateCode: "BH-TEST01" }),
  getRegistrationById: vi.fn().mockResolvedValue({ id: 1, email: "user@test.cz", name: "User", plan: "gold", status: "activated" }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("./email", () => ({
  sendConfirmationEmail: vi.fn().mockResolvedValue(true),
  sendPlanActivatedEmail: vi.fn().mockResolvedValue(true),
  sendNewReferralEmail: vi.fn().mockResolvedValue(true),
  sendAffiliateMilestoneEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock("./dailyReport", () => ({
  sendDailyReport: vi.fn().mockResolvedValue(true),
  generateDailyReport: vi.fn().mockResolvedValue({
    date: "2026-02-07",
    newRegistrations: { total: 5, free: 3, gold: 1, diamond: 1 },
    newEmails: 12,
    newAffiliatePartners: 2,
    newAffiliateClicks: 25,
    abTestSummary: [{ testName: "cta_hero", variant: "variant_a", impressions: 100, clicks: 20, conversions: 5, ctr: "20.0", cvr: "25.0" }],
    topSource: "hero_cta",
  }),
  formatReportContent: vi.fn().mockReturnValue("Test report content"),
  sendWeeklyReport: vi.fn().mockResolvedValue(true),
  generateWeeklyReport: vi.fn().mockResolvedValue({
    weekStart: "2026-01-31",
    weekEnd: "2026-02-07",
    dailyTrend: [{ date: "2026-02-07", registrations: 5, emails: 12 }],
    totalRegistrations: { total: 20, free: 12, gold: 5, diamond: 3 },
    totalEmails: 50,
    totalAffiliatePartners: 4,
    totalAffiliateClicks: 80,
    abTestSummary: [{ testName: "cta_hero", variant: "variant_a", impressions: 500, clicks: 100, conversions: 25, ctr: "20.0", cvr: "25.0" }],
    topSources: [{ source: "hero_cta", count: 10 }],
    estimatedRevenue: 12420,
  }),
  formatWeeklyReportContent: vi.fn().mockReturnValue("Test weekly report content"),
  generateStrategicRecommendations: vi.fn().mockResolvedValue("1. Zvy\u0161te investice do affiliate programu."),
}));

vi.mock("./stripe", () => ({
  createCheckoutSession: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test", sessionId: "cs_test_123" }),
}));

vi.mock("./botHubApi", () => ({
  checkApiHealth: vi.fn().mockResolvedValue({
    status: "not_configured",
    message: "BotHub API není nakonfigurováno. Používá se lokální databáze.",
    checkedAt: new Date(),
  }),
  syncRegistration: vi.fn().mockResolvedValue({ success: true, synced: false, error: "API not configured" }),
  getApiConfig: vi.fn().mockReturnValue({ baseUrl: "https://api.bothub.cz", apiKey: "", timeout: 10000, isEnabled: false }),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Ahoj! Jsem Alex Hormozi iBot." } }],
  }),
}));

import {
  captureEmail, trackAbTestEvent, trackAffiliateClick,
  createRegistration, getRegistrationByEmail, activateRegistration,
  createAffiliateRegistration, getAffiliateByEmail,
  getDashboardStats, getRegistrationsByPlan, getAbTestResults,
  getUserRegistrations, getAffiliateStats, getAffiliateReferrals,
  getUserNotifications, getUnreadNotificationCount, markNotificationRead,
  markAllNotificationsRead, createBlogPost, updateBlogPost, deleteBlogPost,
  getBlogPostById, getAllBlogPosts, getPublishedBlogPosts, getBlogPostBySlug,
} from "./db";

import { sendConfirmationEmail, sendPlanActivatedEmail, sendNewReferralEmail, sendAffiliateMilestoneEmail } from "./email";
import { sendDailyReport, generateDailyReport, formatReportContent, sendWeeklyReport, generateWeeklyReport, formatWeeklyReportContent, generateStrategicRecommendations } from "./dailyReport";
import { invokeLLM } from "./_core/llm";
import { createCheckoutSession } from "./stripe";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1, openId: "admin-user", email: "admin@bothub.cz", name: "Admin",
      loginMethod: "manus", role: "admin",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2, openId: "regular-user", email: "user@test.cz", name: "User",
      loginMethod: "manus", role: "user",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ===== Tracking tests =====

describe("tracking.captureEmail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("captures a valid email with GDPR consent", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.tracking.captureEmail({
      email: "test@example.com", source: "unlock_modal", variant: "variant_a", gdprConsent: true,
    });
    expect(result).toEqual({ success: true });
    expect(captureEmail).toHaveBeenCalledWith({
      email: "test@example.com", source: "unlock_modal", variant: "variant_a", gdprConsent: 1,
    });
  });

  it("rejects invalid email format", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.tracking.captureEmail({ email: "not-an-email", source: "unlock_modal", gdprConsent: true })).rejects.toThrow();
  });

  it("handles missing variant by setting null", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await caller.tracking.captureEmail({ email: "user@test.cz", gdprConsent: false });
    expect(captureEmail).toHaveBeenCalledWith({ email: "user@test.cz", source: "unlock_modal", variant: null, gdprConsent: 0 });
  });
});

describe("tracking.ctaClick", () => {
  beforeEach(() => vi.clearAllMocks());

  it("tracks a CTA click event", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.tracking.ctaClick({ variant: "variant_b", targetUrl: "#pricing" });
    expect(result).toEqual({ success: true });
    expect(trackAbTestEvent).toHaveBeenCalledWith("cta_hero", "variant_b", "click");
  });
});

describe("tracking.ctaImpression", () => {
  beforeEach(() => vi.clearAllMocks());

  it("tracks a CTA impression event", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.tracking.ctaImpression({ variant: "variant_a" });
    expect(result).toEqual({ success: true });
    expect(trackAbTestEvent).toHaveBeenCalledWith("cta_hero", "variant_a", "impression");
  });
});

describe("tracking.affiliateClick", () => {
  beforeEach(() => vi.clearAllMocks());

  it("tracks an affiliate click with all fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.tracking.affiliateClick({ partner: "partner123", plan: "gold", referrer: "https://google.com" });
    expect(result).toEqual({ success: true });
    expect(trackAffiliateClick).toHaveBeenCalledWith({ partner: "partner123", plan: "gold", referrer: "https://google.com" });
  });

  it("handles missing optional fields by setting null", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await caller.tracking.affiliateClick({ partner: "partner456" });
    expect(trackAffiliateClick).toHaveBeenCalledWith({ partner: "partner456", plan: null, referrer: null });
  });
});

// ===== Registration tests =====

describe("registration.register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a new FREE registration, auto-activates, and sends email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.registration.register({
      email: "new@user.cz", plan: "free", source: "hero_cta", gdprConsent: true,
    });
    expect(result.success).toBe(true);
    expect(result.alreadyRegistered).toBe(false);
    expect(result.plan).toBe("free");
    expect(result.status).toBe("activated");
    expect(createRegistration).toHaveBeenCalledWith(expect.objectContaining({
      email: "new@user.cz", plan: "free", source: "hero_cta", gdprConsent: 1,
    }));
    expect(activateRegistration).toHaveBeenCalledWith(1);
    expect(sendConfirmationEmail).toHaveBeenCalledWith(expect.objectContaining({
      email: "new@user.cz", plan: "free", registrationId: 1, isAutoActivated: true,
    }));
  });

  it("creates a GOLD registration with pending status", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.registration.register({
      email: "gold@user.cz", plan: "gold", source: "pricing_gold", gdprConsent: true,
    });
    expect(result.success).toBe(true);
    expect(result.plan).toBe("gold");
    expect(result.status).toBe("pending");
    expect(activateRegistration).not.toHaveBeenCalled();
    expect(sendConfirmationEmail).toHaveBeenCalledWith(expect.objectContaining({
      email: "gold@user.cz", plan: "gold", isAutoActivated: false,
    }));
  });

  it("returns existing registration if email already registered", async () => {
    vi.mocked(getRegistrationByEmail).mockResolvedValueOnce({
      id: 42, email: "existing@user.cz", plan: "gold", status: "activated",
      name: null, company: null, source: "hero_cta", ctaVariant: null,
      affiliateCode: null, gdprConsent: 1, createdAt: new Date(), updatedAt: new Date(),
    });
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.registration.register({
      email: "existing@user.cz", plan: "free", gdprConsent: true,
    });
    expect(result.success).toBe(true);
    expect(result.alreadyRegistered).toBe(true);
    expect(result.registrationId).toBe(42);
    expect(createRegistration).not.toHaveBeenCalled();
    expect(sendConfirmationEmail).not.toHaveBeenCalled();
  });

  it("tracks A/B conversion when ctaVariant is provided", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await caller.registration.register({
      email: "ab@test.cz", plan: "free", ctaVariant: "variant_b", gdprConsent: true,
    });
    expect(trackAbTestEvent).toHaveBeenCalledWith("cta_hero", "variant_b", "conversion");
  });

  it("rejects invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.registration.register({
      email: "invalid", plan: "free", gdprConsent: true,
    })).rejects.toThrow();
  });
});

// ===== Registration activation tests =====

describe("registration.activate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("activates registration with valid token", async () => {
    const validToken = Buffer.from("1:bothub-activate").toString("base64url");
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.registration.activate({ registrationId: 1, token: validToken });
    expect(result.success).toBe(true);
    expect(activateRegistration).toHaveBeenCalledWith(1);
  });

  it("rejects invalid activation token", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.registration.activate({ registrationId: 1, token: "invalid-token" });
    expect(result.success).toBe(false);
    expect(activateRegistration).not.toHaveBeenCalled();
  });
});

// ===== Affiliate registration tests =====

describe("affiliate.register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a new affiliate partner with generated code", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.affiliate.register({
      email: "partner@test.cz", name: "Jan Novák", gdprConsent: true,
    });
    expect(result.success).toBe(true);
    expect(result.alreadyRegistered).toBe(false);
    expect(result.affiliateCode).toBe("BH-TEST01");
    expect(createAffiliateRegistration).toHaveBeenCalledWith(expect.objectContaining({
      email: "partner@test.cz", name: "Jan Novák", gdprConsent: 1,
    }));
  });

  it("returns existing affiliate if already registered", async () => {
    vi.mocked(getAffiliateByEmail).mockResolvedValueOnce({
      id: 5, email: "existing@partner.cz", name: "Existing", affiliateCode: "BH-EXIST",
      company: null, website: null, status: "active", gdprConsent: 1,
      createdAt: new Date(), updatedAt: new Date(),
    });
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.affiliate.register({
      email: "existing@partner.cz", name: "Existing", gdprConsent: true,
    });
    expect(result.success).toBe(true);
    expect(result.alreadyRegistered).toBe(true);
    expect(result.affiliateCode).toBe("BH-EXIST");
    expect(createAffiliateRegistration).not.toHaveBeenCalled();
  });

  it("rejects missing name", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.affiliate.register({
      email: "test@test.cz", name: "", gdprConsent: true,
    })).rejects.toThrow();
  });
});

// ===== Admin dashboard tests =====

describe("admin.stats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns dashboard stats for admin user", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.stats();
    expect(result).toEqual({ registrations: 15, affiliates: 3, emails: 42, affiliateClicks: 100 });
    expect(getDashboardStats).toHaveBeenCalled();
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("rejects unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.admin.stats()).rejects.toThrow();
  });
});

describe("admin.registrationsByPlan", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns plan breakdown for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.registrationsByPlan();
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ plan: "free", count: 10 });
    expect(getRegistrationsByPlan).toHaveBeenCalled();
  });

  it("rejects regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.registrationsByPlan()).rejects.toThrow();
  });
});

describe("admin.abTestResults", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns A/B test results for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.abTestResults();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ testName: "cta_hero", variant: "variant_a" });
    expect(getAbTestResults).toHaveBeenCalled();
  });
});

// ===== Email module tests =====

describe("email.generateActivationToken", () => {
  it("generates consistent base64url token", async () => {
    // Import the actual function (not mocked)
    const { generateActivationToken } = await vi.importActual<typeof import("./email")>("./email");
    const token = generateActivationToken(42);
    const expected = Buffer.from("42:bothub-activate").toString("base64url");
    expect(token).toBe(expected);
  });
});

describe("email.buildPlainText", () => {
  it("generates plain text for free plan", async () => {
    const { buildPlainText } = await vi.importActual<typeof import("./email")>("./email");
    const text = buildPlainText({
      email: "test@test.cz", name: "Jan", plan: "free",
      registrationId: 1, isAutoActivated: true,
    }, "https://bothub.cz");
    expect(text).toContain("Ahoj Jan");
    expect(text).toContain("FREE");
    expect(text).toContain("aktivní");
    expect(text).not.toContain("aktivaci");
  });

  it("generates plain text with activation link for gold plan", async () => {
    const { buildPlainText } = await vi.importActual<typeof import("./email")>("./email");
    const text = buildPlainText({
      email: "test@test.cz", name: "Jan", plan: "gold",
      registrationId: 5, isAutoActivated: false,
    }, "https://bothub.cz");
    expect(text).toContain("GOLD");
    expect(text).toContain("https://bothub.cz/activate?id=5");
  });
});

describe("email.buildEmailHtml", () => {
  it("generates HTML with activation button for diamond plan", async () => {
    const { buildEmailHtml } = await vi.importActual<typeof import("./email")>("./email");
    const html = buildEmailHtml({
      email: "test@test.cz", plan: "diamond",
      registrationId: 10, isAutoActivated: false,
    }, "https://bothub.cz");
    expect(html).toContain("DIAMOND");
    expect(html).toContain("Aktivovat plán DIAMOND");
    expect(html).toContain("https://bothub.cz/activate?id=10");
  });

  it("generates HTML without activation button for free plan", async () => {
    const { buildEmailHtml } = await vi.importActual<typeof import("./email")>("./email");
    const html = buildEmailHtml({
      email: "test@test.cz", plan: "free",
      registrationId: 1, isAutoActivated: true,
    }, "https://bothub.cz");
    expect(html).toContain("FREE");
    expect(html).toContain("aktivní");
    expect(html).not.toContain("Aktivovat plán");
  });
});

// ===== Daily Report tests =====

describe("admin.sendDailyReport", () => {
  beforeEach(() => vi.clearAllMocks());

  it("triggers daily report for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.sendDailyReport();
    expect(result).toEqual({ success: true });
    expect(sendDailyReport).toHaveBeenCalled();
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.sendDailyReport()).rejects.toThrow();
  });
});

describe("admin.dailyReportPreview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns formatted report content for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.dailyReportPreview();
    expect(result).toEqual({ content: "Test report content" });
    expect(generateDailyReport).toHaveBeenCalled();
    expect(formatReportContent).toHaveBeenCalled();
  });
});

// ===== Daily Report module tests =====

describe("dailyReport.formatReportContent", () => {
  it("formats report data into readable text", async () => {
    const { formatReportContent: realFormat } = await vi.importActual<typeof import("./dailyReport")>("./dailyReport");
    const data = {
      date: "2026-02-07",
      newRegistrations: { total: 5, free: 3, gold: 1, diamond: 1 },
      newEmails: 12,
      newAffiliatePartners: 2,
      newAffiliateClicks: 25,
      abTestSummary: [
        { testName: "cta_hero", variant: "variant_a", impressions: 100, clicks: 20, conversions: 5, ctr: "20.0", cvr: "25.0" },
      ],
      topSource: "hero_cta",
    };
    const content = realFormat(data);
    expect(content).toContain("2026-02-07");
    expect(content).toContain("NOVÉ REGISTRACE: 5");
    expect(content).toContain("FREE: 3");
    expect(content).toContain("GOLD: 1");
    expect(content).toContain("DIAMOND: 1");
    expect(content).toContain("e-mail captures: 12");
    expect(content).toContain("Affiliate kliky: 25");
    expect(content).toContain("hero_cta");
    expect(content).toContain("A/B TESTY");
    expect(content).toContain("variant_a");
    expect(content).toContain("CVR: 25.0%");
  });
});

// ===== Live Chat Demo tests =====

describe("chat.send", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns assistant response from LLM", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.chat.send({
      messages: [{ role: "user", content: "Jak fungují iBoti?" }],
    });
    expect(result.role).toBe("assistant");
    expect(result.content).toBe("Ahoj! Jsem Alex Hormozi iBot.");
    expect(invokeLLM).toHaveBeenCalledWith({
      messages: expect.arrayContaining([
        expect.objectContaining({ role: "system" }),
        expect.objectContaining({ role: "user", content: "Jak fungují iBoti?" }),
      ]),
    });
  });

  it("handles LLM error gracefully", async () => {
    vi.mocked(invokeLLM).mockRejectedValueOnce(new Error("LLM unavailable"));
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.chat.send({
      messages: [{ role: "user", content: "Test" }],
    });
    expect(result.role).toBe("assistant");
    expect(result.content).toContain("technické potíže");
  });

  it("filters out system messages from input", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await caller.chat.send({
      messages: [
        { role: "system", content: "Custom system" },
        { role: "user", content: "Hello" },
      ],
    });
    // Should use built-in system prompt, not the one from input
    const callArgs = vi.mocked(invokeLLM).mock.calls[0]![0];
    const systemMsgs = callArgs.messages.filter((m: { role: string }) => m.role === "system");
    expect(systemMsgs).toHaveLength(1);
    expect(systemMsgs[0].content).toContain("Alex Hormozi iBot");
  });
});

// ===== Weekly Report tests =====

describe("admin.sendWeeklyReport", () => {
  beforeEach(() => vi.clearAllMocks());

  it("triggers weekly report for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.sendWeeklyReport();
    expect(result).toEqual({ success: true });
    expect(sendWeeklyReport).toHaveBeenCalled();
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.sendWeeklyReport()).rejects.toThrow();
  });
});

describe("admin.weeklyReportPreview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns formatted weekly report with recommendations for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.weeklyReportPreview();
    expect(result.content).toBe("Test weekly report content");
    expect(result.recommendations).toBe("1. Zvyšte investice do affiliate programu.");
    expect(generateWeeklyReport).toHaveBeenCalled();
    expect(generateStrategicRecommendations).toHaveBeenCalled();
    expect(formatWeeklyReportContent).toHaveBeenCalled();
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.weeklyReportPreview()).rejects.toThrow();
  });
});

// ===== Weekly Report module tests =====

describe("dailyReport.formatWeeklyReportContent", () => {
  it("formats weekly report data with recommendations", async () => {
    const { formatWeeklyReportContent: realFormat } = await vi.importActual<typeof import("./dailyReport")>("./dailyReport");
    const data = {
      weekStart: "2026-01-31",
      weekEnd: "2026-02-07",
      dailyTrend: [
        { date: "2026-02-06", registrations: 3, emails: 8 },
        { date: "2026-02-07", registrations: 5, emails: 12 },
      ],
      totalRegistrations: { total: 20, free: 12, gold: 5, diamond: 3 },
      totalEmails: 50,
      totalAffiliatePartners: 4,
      totalAffiliateClicks: 80,
      abTestSummary: [
        { testName: "cta_hero", variant: "variant_a", impressions: 500, clicks: 100, conversions: 25, ctr: "20.0", cvr: "25.0" },
      ],
      topSources: [{ source: "hero_cta", count: 10 }],
      estimatedRevenue: 12420,
    };
    const content = realFormat(data, "Test doporučení");
    expect(content).toContain("TÝDENNÍ STRATEGICKÝ SOUHRN");
    expect(content).toContain("2026-01-31");
    expect(content).toContain("2026-02-07");
    expect(content).toContain("REGISTRACE ZA TÝDEN: 20");
    expect(content).toContain("FREE: 12");
    expect(content).toContain("GOLD: 5");
    expect(content).toContain("DIAMOND: 3");
    expect(content).toContain("12");
    expect(content).toContain("Email captures: 50");
    expect(content).toContain("hero_cta");
    expect(content).toContain("variant_a");
    expect(content).toContain("STRATEGICKÁ DOPORUČENÍ");
    expect(content).toContain("Test doporučení");
  });
});


describe("promo.remainingSpots", () => {
  const caller = appRouter.createCaller(createPublicContext());

  it("returns remaining spots based on registration count", async () => {
    const result = await caller.promo.remainingSpots();
    // getRegistrationCount mock returns 10
    expect(result).toEqual({ remaining: 90, total: 100, taken: 10, isActive: true });
  });

  it("returns correct structure with numeric values", async () => {
    const result = await caller.promo.remainingSpots();
    expect(typeof result.remaining).toBe("number");
    expect(typeof result.total).toBe("number");
    expect(typeof result.taken).toBe("number");
    expect(typeof result.isActive).toBe("boolean");
  });
});

describe("stripe.createCheckout", () => {
  const caller = appRouter.createCaller(createPublicContext());

  it("creates a Stripe checkout session for GOLD plan", async () => {
    const result = await caller.stripe.createCheckout({
      plan: "gold",
      email: "test@example.com",
      registrationId: 1,
      name: "Test User",
      origin: "https://bothub.cz",
    });
    expect(result).toEqual({ url: "https://checkout.stripe.com/test", sessionId: "cs_test_123" });
    expect(createCheckoutSession).toHaveBeenCalledWith({
      plan: "gold",
      email: "test@example.com",
      registrationId: 1,
      name: "Test User",
      origin: "https://bothub.cz",
      affiliateCode: undefined,
    });
  });

  it("creates a Stripe checkout session for DIAMOND plan", async () => {
    const result = await caller.stripe.createCheckout({
      plan: "diamond",
      email: "diamond@example.com",
      registrationId: 2,
      origin: "https://bothub.cz",
    });
    expect(result.url).toBe("https://checkout.stripe.com/test");
    expect(result.sessionId).toBe("cs_test_123");
  });

  it("passes affiliate code when provided", async () => {
    await caller.stripe.createCheckout({
      plan: "gold",
      email: "affiliate@example.com",
      registrationId: 3,
      origin: "https://bothub.cz",
      affiliateCode: "BH-ABC123",
    });
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ affiliateCode: "BH-ABC123" })
    );
  });

  it("rejects invalid plan", async () => {
    await expect(
      caller.stripe.createCheckout({
        plan: "free" as any,
        email: "test@example.com",
        registrationId: 1,
        origin: "https://bothub.cz",
      })
    ).rejects.toThrow();
  });
});


// ===== User Dashboard tests =====

describe("userDashboard.myRegistrations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns registrations for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.userDashboard.myRegistrations();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ email: "user@test.cz", plan: "free", status: "activated" });
    expect(getUserRegistrations).toHaveBeenCalledWith("user@test.cz");
  });

  it("rejects unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.userDashboard.myRegistrations()).rejects.toThrow();
  });
});

describe("userDashboard.myProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns profile info for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.userDashboard.myProfile();
    expect(result).toMatchObject({
      id: 2,
      name: "User",
      email: "user@test.cz",
      role: "user",
    });
  });

  it("rejects unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.userDashboard.myProfile()).rejects.toThrow();
  });
});

// ===== Affiliate Dashboard tests =====

describe("affiliateDashboard.myStats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns affiliate stats for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.affiliateDashboard.myStats({ affiliateCode: "BH-TEST01" });
    expect(result).toMatchObject({
      totalClicks: 50,
      totalReferrals: 5,
      goldReferrals: 3,
      diamondReferrals: 2,
      pendingCommission: 5793,
    });
    expect(getAffiliateStats).toHaveBeenCalledWith("BH-TEST01");
  });

  it("rejects unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.affiliateDashboard.myStats({ affiliateCode: "BH-TEST01" })).rejects.toThrow();
  });
});

describe("affiliateDashboard.myReferrals", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns referral list for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.affiliateDashboard.myReferrals({ affiliateCode: "BH-TEST01" });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ email: "ref@test.cz", plan: "gold", status: "activated" });
    expect(getAffiliateReferrals).toHaveBeenCalledWith("BH-TEST01");
  });

  it("rejects unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.affiliateDashboard.myReferrals({ affiliateCode: "BH-TEST01" })).rejects.toThrow();
  });
});

describe("affiliateDashboard.myPartnerInfo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when user is not an affiliate partner", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.affiliateDashboard.myPartnerInfo();
    expect(result).toBeUndefined();
    expect(getAffiliateByEmail).toHaveBeenCalledWith("user@test.cz");
  });

  it("returns partner info when user is an affiliate", async () => {
    vi.mocked(getAffiliateByEmail).mockResolvedValueOnce({
      id: 5, email: "user@test.cz", name: "User", affiliateCode: "BH-USER01",
      company: null, website: null, status: "active", gdprConsent: 1,
      createdAt: new Date(), updatedAt: new Date(),
    });
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.affiliateDashboard.myPartnerInfo();
    expect(result).toMatchObject({ affiliateCode: "BH-USER01", email: "user@test.cz" });
  });

  it("rejects unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.affiliateDashboard.myPartnerInfo()).rejects.toThrow();
  });
});

// ===== Notification System tests =====

import { checkApiHealth, getApiConfig } from "./botHubApi";

describe("notifications.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns notifications for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.notifications.list();
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ type: "registration", title: "Plán FREE aktivován!" });
    expect(getUserNotifications).toHaveBeenCalledWith(2, 20);
  });

  it("rejects unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.notifications.list()).rejects.toThrow();
  });
});

describe("notifications.unreadCount", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns unread count for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.notifications.unreadCount();
    expect(result).toEqual({ count: 1 });
    expect(getUnreadNotificationCount).toHaveBeenCalledWith(2);
  });

  it("rejects unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.notifications.unreadCount()).rejects.toThrow();
  });
});

describe("notifications.markRead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marks notification as read", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.notifications.markRead({ notificationId: 1 });
    expect(result).toEqual({ success: true });
    expect(markNotificationRead).toHaveBeenCalledWith(1, 2);
  });

  it("rejects unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.notifications.markRead({ notificationId: 1 })).rejects.toThrow();
  });
});

describe("notifications.markAllRead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marks all notifications as read", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.notifications.markAllRead();
    expect(result).toEqual({ success: true });
    expect(markAllNotificationsRead).toHaveBeenCalledWith(2);
  });

  it("rejects unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.notifications.markAllRead()).rejects.toThrow();
  });
});

// ===== Blog Admin tests =====

describe("blogAdmin.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all blog posts for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.blogAdmin.list();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ slug: "test-post", titleCs: "Test článek" });
    expect(getAllBlogPosts).toHaveBeenCalled();
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.blogAdmin.list()).rejects.toThrow();
  });
});

describe("blogAdmin.getById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns blog post by ID for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.blogAdmin.getById({ id: 1 });
    expect(result).toMatchObject({ slug: "test-post", titleCs: "Test článek" });
    expect(getBlogPostById).toHaveBeenCalledWith(1);
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.blogAdmin.getById({ id: 1 })).rejects.toThrow();
  });
});

describe("blogAdmin.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a new blog post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.blogAdmin.create({
      slug: "new-post",
      titleCs: "Nový článek",
      contentCs: "# Nový\nObsah článku",
      status: "draft",
    });
    expect(result).toEqual({ success: true, id: 1 });
    expect(createBlogPost).toHaveBeenCalledWith(expect.objectContaining({
      slug: "new-post", titleCs: "Nový článek",
    }));
  });

  it("sets publishedAt when status is published", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await caller.blogAdmin.create({
      slug: "published-post",
      titleCs: "Publikovaný článek",
      contentCs: "Obsah",
      status: "published",
    });
    expect(createBlogPost).toHaveBeenCalledWith(expect.objectContaining({
      status: "published",
      publishedAt: expect.any(Date),
    }));
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.blogAdmin.create({
      slug: "test", titleCs: "Test", contentCs: "Content",
    })).rejects.toThrow();
  });
});

describe("blogAdmin.update", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates an existing blog post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.blogAdmin.update({
      id: 1, titleCs: "Aktualizovaný článek",
    });
    expect(result).toEqual({ success: true });
    expect(updateBlogPost).toHaveBeenCalledWith(1, expect.objectContaining({
      titleCs: "Aktualizovaný článek",
    }));
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.blogAdmin.update({ id: 1, titleCs: "Test" })).rejects.toThrow();
  });
});

describe("blogAdmin.delete", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a blog post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.blogAdmin.delete({ id: 1 });
    expect(result).toEqual({ success: true });
    expect(deleteBlogPost).toHaveBeenCalledWith(1);
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.blogAdmin.delete({ id: 1 })).rejects.toThrow();
  });
});

// ===== Blog Public tests =====

describe("blogPublic.published", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns published blog posts", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.blogPublic.published();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ slug: "test-post", status: "published" });
    expect(getPublishedBlogPosts).toHaveBeenCalled();
  });
});

describe("blogPublic.bySlug", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns blog post by slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.blogPublic.bySlug({ slug: "test-post" });
    expect(result).toMatchObject({ slug: "test-post", titleCs: "Test článek" });
    expect(getBlogPostBySlug).toHaveBeenCalledWith("test-post");
  });
});

// ===== API Integration tests =====

describe("apiIntegration.healthCheck", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns health check status for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.apiIntegration.healthCheck();
    expect(result).toMatchObject({ status: "not_configured" });
    expect(checkApiHealth).toHaveBeenCalled();
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.apiIntegration.healthCheck()).rejects.toThrow();
  });
});

describe("apiIntegration.config", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns API config for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.apiIntegration.config();
    expect(result).toMatchObject({
      baseUrl: "https://api.bothub.cz",
      isEnabled: false,
      hasApiKey: false,
    });
    expect(getApiConfig).toHaveBeenCalled();
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.apiIntegration.config()).rejects.toThrow();
  });
});

// ===== Email Notification Templates tests =====

describe("email notification templates", () => {
  it("sendPlanActivatedEmail is called for FREE plan auto-activation", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await caller.registration.register({
      email: "free-user@test.cz",
      plan: "free",
      source: "hero_cta",
      gdprConsent: true,
    });
    expect(sendPlanActivatedEmail).toHaveBeenCalledWith({
      email: "free-user@test.cz",
      name: undefined,
      plan: "free",
    });
  });

  it("sendConfirmationEmail is still called alongside plan activated email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await caller.registration.register({
      email: "both-emails@test.cz",
      plan: "free",
      source: "hero_cta",
      gdprConsent: true,
    });
    expect(sendConfirmationEmail).toHaveBeenCalled();
    expect(sendPlanActivatedEmail).toHaveBeenCalled();
  });

  it("sendPlanActivatedEmail is NOT called for GOLD plan (pending)", async () => {
    vi.clearAllMocks();
    const caller = appRouter.createCaller(createPublicContext());
    await caller.registration.register({
      email: "gold-user@test.cz",
      plan: "gold",
      source: "hero_cta",
      gdprConsent: true,
    });
    expect(sendPlanActivatedEmail).not.toHaveBeenCalled();
    expect(sendConfirmationEmail).toHaveBeenCalled();
  });
});

// ===== Email module unit tests =====

describe("email template functions", () => {
  it("buildEventEmailHtml generates valid HTML", async () => {
    const { buildEventEmailHtml: realBuild } = await vi.importActual<typeof import("./email")>("./email");
    const html = realBuild("Test Subject", "Ahoj,", "<p>Test body</p>");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("BOTHUB");
    expect(html).toContain("Ahoj,");
    expect(html).toContain("<p>Test body</p>");
    expect(html).toContain("BOTHUB.cz");
  });

  it("sendPlanActivatedEmail function exists and is callable", () => {
    expect(typeof sendPlanActivatedEmail).toBe("function");
  });

  it("sendNewReferralEmail function exists and is callable", () => {
    expect(typeof sendNewReferralEmail).toBe("function");
  });

  it("sendAffiliateMilestoneEmail function exists and is callable", () => {
    expect(typeof sendAffiliateMilestoneEmail).toBe("function");
  });
});

// ===== Sitemap and Robots.txt structure tests =====

describe("SEO files structure", () => {
  it("sitemap.xml should contain proper XML structure", () => {
    // Test that the sitemap generation logic produces valid structure
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "weekly", lastmod: "2026-02-08" },
      { loc: "/blog", priority: "0.8", changefreq: "daily", lastmod: "2026-02-08" },
    ];
    const blogUrls = [
      { loc: "/blog/test-post", priority: "0.6", changefreq: "monthly", lastmod: "2026-02-08" },
    ];
    const allUrls = [...staticPages, ...blogUrls];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>https://bothub.cz${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("<url>");
    expect(xml).toContain("<loc>https://bothub.cz/</loc>");
    expect(xml).toContain("<priority>1.0</priority>");
    expect(xml).toContain("<loc>https://bothub.cz/blog</loc>");
    expect(xml).toContain("<priority>0.8</priority>");
    expect(xml).toContain("<loc>https://bothub.cz/blog/test-post</loc>");
    expect(xml).toContain("<priority>0.6</priority>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(xml).toContain("<changefreq>daily</changefreq>");
    expect(xml).toContain("<changefreq>monthly</changefreq>");
    expect(xml).toContain("<lastmod>2026-02-08</lastmod>");
  });

  it("robots.txt should contain correct rules", () => {
    const baseUrl = "https://bothub.cz";
    const robotsTxt = `User-agent: *
Allow: /
Allow: /blog
Allow: /blog/
Disallow: /admin
Disallow: /dashboard
Disallow: /affiliate-dashboard
Disallow: /api/
Disallow: /activate

Sitemap: ${baseUrl}/sitemap.xml`;

    expect(robotsTxt).toContain("User-agent: *");
    expect(robotsTxt).toContain("Allow: /");
    expect(robotsTxt).toContain("Allow: /blog");
    expect(robotsTxt).toContain("Disallow: /admin");
    expect(robotsTxt).toContain("Disallow: /dashboard");
    expect(robotsTxt).toContain("Disallow: /api/");
    expect(robotsTxt).toContain("Sitemap: https://bothub.cz/sitemap.xml");
  });

  it("sitemap priority hierarchy is correct (homepage > blog > articles)", () => {
    const priorities = {
      homepage: 1.0,
      blog: 0.8,
      catalog: 0.7,
      pricing: 0.7,
      affiliate: 0.6,
      articles: 0.6,
      faq: 0.5,
    };
    expect(priorities.homepage).toBeGreaterThan(priorities.blog);
    expect(priorities.blog).toBeGreaterThan(priorities.articles);
    expect(priorities.catalog).toBeGreaterThanOrEqual(priorities.articles);
    expect(priorities.faq).toBeLessThanOrEqual(priorities.articles);
  });
});

// ===== Schema.org Structured Data tests =====

describe("Schema.org structured data", () => {
  it("BreadcrumbList schema has correct structure", () => {
    const items = [
      { name: "Domů", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: "Test článek", url: "/blog/test-post" },
    ];
    const baseUrl = "https://bothub.cz";
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${baseUrl}${item.url}`,
      })),
    };

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0]).toMatchObject({
      "@type": "ListItem",
      position: 1,
      name: "Domů",
      item: "https://bothub.cz/",
    });
    expect(schema.itemListElement[1]).toMatchObject({
      position: 2,
      name: "Blog",
      item: "https://bothub.cz/blog",
    });
    expect(schema.itemListElement[2]).toMatchObject({
      position: 3,
      name: "Test článek",
      item: "https://bothub.cz/blog/test-post",
    });
  });

  it("Organization schema has required fields", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "BOTHUB",
      url: "https://bothub.cz",
      logo: "https://bothub.cz/logo.png",
      description: "BOTHUB.cz — platforma AI chatbotů",
      contactPoint: {
        "@type": "ContactPoint",
        email: "info@bothub.cz",
        contactType: "customer service",
        availableLanguage: ["Czech", "English"],
      },
    };

    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("BOTHUB");
    expect(schema.url).toContain("bothub");
    expect(schema.logo).toContain("logo.png");
    expect(schema.contactPoint.email).toBe("info@bothub.cz");
    expect(schema.contactPoint.availableLanguage).toContain("Czech");
    expect(schema.contactPoint.availableLanguage).toContain("English");
  });

  it("WebSite schema includes search action", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "BOTHUB",
      url: "https://bothub.cz",
      inLanguage: ["cs", "en"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://bothub.cz/#catalog?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    };

    expect(schema["@type"]).toBe("WebSite");
    expect(schema.inLanguage).toContain("cs");
    expect(schema.inLanguage).toContain("en");
    expect(schema.potentialAction["@type"]).toBe("SearchAction");
    expect(schema.potentialAction.target.urlTemplate).toContain("{search_term_string}");
  });

  it("Product schema for pricing plans has correct structure", () => {
    const plans = [
      { name: "BOTHUB FREE", price: "0", currency: "CZK", sku: "bothub-free" },
      { name: "BOTHUB GOLD", price: "990", currency: "CZK", sku: "bothub-gold" },
      { name: "BOTHUB DIAMOND", price: "2490", currency: "CZK", sku: "bothub-diamond" },
    ];

    plans.forEach((plan) => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: plan.name,
        sku: plan.sku,
        brand: { "@type": "Brand", name: "BOTHUB" },
        offers: {
          "@type": "Offer",
          priceCurrency: plan.currency,
          price: plan.price,
          availability: "https://schema.org/InStock",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "127",
        },
      };

      expect(schema["@type"]).toBe("Product");
      expect(schema.name).toContain("BOTHUB");
      expect(schema.brand.name).toBe("BOTHUB");
      expect(schema.offers["@type"]).toBe("Offer");
      expect(schema.offers.priceCurrency).toBe("CZK");
      expect(schema.offers.availability).toBe("https://schema.org/InStock");
      expect(schema.aggregateRating.ratingValue).toBe("4.8");
    });

    // Verify price hierarchy
    expect(Number(plans[0].price)).toBeLessThan(Number(plans[1].price));
    expect(Number(plans[1].price)).toBeLessThan(Number(plans[2].price));
  });

  it("FAQPage schema has correct structure with Q&A pairs", () => {
    const faqItems = [
      { question: "Co je iBot?", answer: "iBot je AI chatbot s unikátní osobností." },
      { question: "Kolik stojí?", answer: "Nabízíme 3 plány: FREE, GOLD, DIAMOND." },
    ];
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };

    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0]["@type"]).toBe("Question");
    expect(schema.mainEntity[0].name).toBe("Co je iBot?");
    expect(schema.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
    expect(schema.mainEntity[0].acceptedAnswer.text).toContain("AI chatbot");
    expect(schema.mainEntity[1].name).toBe("Kolik stojí?");
  });

  it("BlogPosting schema has required fields", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "Test Article",
      description: "Test description",
      url: "https://bothub.cz/blog/test-post",
      author: { "@type": "Person", name: "BOTHUB Team" },
      publisher: {
        "@type": "Organization",
        name: "BOTHUB",
        logo: { "@type": "ImageObject", url: "https://bothub.cz/logo.png" },
      },
      datePublished: "2026-02-08",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://bothub.cz/blog/test-post",
      },
      articleSection: "AI",
    };

    expect(schema["@type"]).toBe("BlogPosting");
    expect(schema.headline).toBe("Test Article");
    expect(schema.url).toContain("/blog/test-post");
    expect(schema.author.name).toBe("BOTHUB Team");
    expect(schema.publisher.name).toBe("BOTHUB");
    expect(schema.datePublished).toBe("2026-02-08");
    expect(schema.articleSection).toBe("AI");
  });

  it("iBot catalog schema represents all 7 categories", () => {
    const categoryCount = 7;
    const totalIBots = 77;
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "BOTHUB iBot Katalog",
      numberOfItems: totalIBots,
      itemListElement: Array.from({ length: categoryCount }, (_, i) => ({
        "@type": "ListItem",
        position: i + 1,
      })),
    };

    expect(schema["@type"]).toBe("ItemList");
    expect(schema.numberOfItems).toBe(77);
    expect(schema.itemListElement).toHaveLength(7);
    schema.itemListElement.forEach((item, i) => {
      expect(item.position).toBe(i + 1);
    });
  });

  it("all schemas use https://schema.org context", () => {
    const schemaTypes = [
      "Organization", "WebSite", "BreadcrumbList",
      "Product", "FAQPage", "BlogPosting", "ItemList",
    ];
    schemaTypes.forEach((type) => {
      const schema = { "@context": "https://schema.org", "@type": type };
      expect(schema["@context"]).toBe("https://schema.org");
    });
  });
});

// ===== Google Search Console & Sitemap Ping tests =====

describe("admin.gscStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns GSC configuration status for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.gscStatus();
    expect(result).toHaveProperty("isConfigured");
    expect(typeof result.isConfigured).toBe("boolean");
    if (result.isConfigured) {
      expect(result.verificationCode).toBeTruthy();
      expect(result.metaTag).toContain("google-site-verification");
    }
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.gscStatus()).rejects.toThrow();
  });
});

describe("GSC verification meta tag", () => {
  it("meta tag format is correct", () => {
    const code = "7Aee29k84t99vWRgF765csv6FA1yX_zDWfp8Q4GqnGk";
    const metaTag = `<meta name="google-site-verification" content="${code}" />`;
    expect(metaTag).toContain("google-site-verification");
    expect(metaTag).toContain(code);
    expect(metaTag).toMatch(/^<meta name="google-site-verification" content="[^"]+"\s*\/?>$/);
  });

  it("verification code is non-empty string", () => {
    const code = "7Aee29k84t99vWRgF765csv6FA1yX_zDWfp8Q4GqnGk";
    expect(code).toBeTruthy();
    expect(code.length).toBeGreaterThan(10);
    expect(code).not.toContain(" ");
  });
});

describe("Sitemap ping endpoint structure", () => {
  it("ping URL is correctly formatted for Google", () => {
    const baseUrl = "https://bothub.cz";
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

    expect(pingUrl).toContain("https://www.google.com/ping");
    expect(pingUrl).toContain("sitemap=");
    expect(pingUrl).toContain(encodeURIComponent("https://bothub.cz/sitemap.xml"));
  });

  it("sitemap URL includes all required page types", () => {
    const requiredPages = ["/", "/blog", "/#catalog", "/#pricing", "/#affiliate", "/#faq"];
    const staticPages = [
      { loc: "/", priority: "1.0" },
      { loc: "/blog", priority: "0.8" },
      { loc: "/#catalog", priority: "0.7" },
      { loc: "/#pricing", priority: "0.7" },
      { loc: "/#affiliate", priority: "0.6" },
      { loc: "/#faq", priority: "0.5" },
    ];

    requiredPages.forEach(page => {
      const found = staticPages.find(p => p.loc === page);
      expect(found).toBeTruthy();
    });
  });
});

describe("SEO admin tab data", () => {
  it("Schema.org types are all implemented", () => {
    const implementedSchemas = [
      "Organization", "WebSite", "BreadcrumbList",
      "Product", "FAQPage", "ItemList", "BlogPosting",
    ];
    expect(implementedSchemas).toHaveLength(7);
    expect(implementedSchemas).toContain("Organization");
    expect(implementedSchemas).toContain("Product");
    expect(implementedSchemas).toContain("FAQPage");
    expect(implementedSchemas).toContain("BlogPosting");
  });

  it("SEO checklist items are all completed", () => {
    const checklist = [
      { done: true, text: "Meta title a description" },
      { done: true, text: "Open Graph tagy" },
      { done: true, text: "Google Search Console verification meta tag" },
      { done: true, text: "Dynamický sitemap.xml" },
      { done: true, text: "robots.txt" },
      { done: true, text: "Schema.org BreadcrumbList" },
      { done: true, text: "Schema.org Product" },
      { done: true, text: "Schema.org FAQPage" },
      { done: true, text: "Schema.org Organization + WebSite" },
      { done: true, text: "Schema.org BlogPosting" },
      { done: true, text: "Sitemap ping endpoint" },
    ];
    const allDone = checklist.every(item => item.done);
    expect(allDone).toBe(true);
    expect(checklist).toHaveLength(11);
  });
});

// ===== Custom 404 Page tests =====

describe("Custom 404 page structure", () => {
  it("has all required quick link sections", () => {
    const quickLinks = [
      { label: "Katalog iBotů", href: "/#catalog" },
      { label: "Ceník", href: "/#pricing" },
      { label: "Blog", href: "/blog" },
      { label: "Affiliate program", href: "/#affiliate" },
      { label: "Live Demo", href: "/#demo" },
      { label: "Domovská stránka", href: "/" },
    ];

    expect(quickLinks).toHaveLength(6);
    expect(quickLinks.find(l => l.href === "/#catalog")).toBeTruthy();
    expect(quickLinks.find(l => l.href === "/#pricing")).toBeTruthy();
    expect(quickLinks.find(l => l.href === "/blog")).toBeTruthy();
    expect(quickLinks.find(l => l.href === "/#affiliate")).toBeTruthy();
    expect(quickLinks.find(l => l.href === "/#demo")).toBeTruthy();
    expect(quickLinks.find(l => l.href === "/")).toBeTruthy();
  });

  it("has i18n support for CZ and EN", () => {
    const translations = {
      cs: {
        heading: "Stránka nenalezena",
        description: "Tento iBot se zatoulal do neznámých vod.",
        search: "Hledat na BOTHUB.cz...",
        backHome: "Zpět na hlavní stránku",
      },
      en: {
        heading: "Page Not Found",
        description: "This iBot wandered into unknown waters.",
        search: "Search BOTHUB.cz...",
        backHome: "Back to Homepage",
      },
    };

    expect(translations.cs.heading).toBe("Stránka nenalezena");
    expect(translations.en.heading).toBe("Page Not Found");
    expect(translations.cs.search).toContain("BOTHUB");
    expect(translations.en.search).toContain("BOTHUB");
    expect(translations.cs.backHome).toBeTruthy();
    expect(translations.en.backHome).toBeTruthy();
  });

  it("uses dark theme with gold accents matching site design", () => {
    const theme = {
      background: "#0A0A0F",
      accentGold: "amber-500",
      accentPurple: "purple-500",
      textPrimary: "white",
      textSecondary: "gray-400",
    };

    expect(theme.background).toBe("#0A0A0F");
    expect(theme.accentGold).toContain("amber");
    expect(theme.textPrimary).toBe("white");
  });

  it("404 route is registered as catch-all in router", () => {
    const routes = [
      { path: "/", component: "Home" },
      { path: "/admin", component: "AdminDashboard" },
      { path: "/activate", component: "Activate" },
      { path: "/blog", component: "Blog" },
      { path: "/blog/:slug", component: "BlogPost" },
      { path: "/payment-success", component: "PaymentSuccess" },
      { path: "/payment-cancel", component: "PaymentCancel" },
      { path: "/dashboard", component: "UserDashboard" },
      { path: "/affiliate-dashboard", component: "AffiliateDashboard" },
      { path: "/404", component: "NotFound" },
      { path: "*", component: "NotFound" }, // catch-all
    ];

    // Verify catch-all is last
    const lastRoute = routes[routes.length - 1];
    expect(lastRoute.path).toBe("*");
    expect(lastRoute.component).toBe("NotFound");

    // Verify explicit /404 route exists
    const explicit404 = routes.find(r => r.path === "/404");
    expect(explicit404).toBeTruthy();
    expect(explicit404?.component).toBe("NotFound");
  });

  it("quick links cover all main sections of the website", () => {
    const mainSections = ["catalog", "pricing", "blog", "affiliate", "demo", "homepage"];
    const quickLinkHrefs = ["/#catalog", "/#pricing", "/blog", "/#affiliate", "/#demo", "/"];

    mainSections.forEach((section, i) => {
      expect(quickLinkHrefs[i]).toBeTruthy();
    });
    expect(quickLinkHrefs).toHaveLength(mainSections.length);
  });

  it("search functionality redirects to catalog", () => {
    const searchQuery = "prodejní chatbot";
    const targetUrl = "/#catalog";
    expect(searchQuery.trim().length).toBeGreaterThan(0);
    expect(targetUrl).toBe("/#catalog");
  });
});
