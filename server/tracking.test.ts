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
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("./email", () => ({
  sendConfirmationEmail: vi.fn().mockResolvedValue(true),
}));

import {
  captureEmail, trackAbTestEvent, trackAffiliateClick,
  createRegistration, getRegistrationByEmail, activateRegistration,
  createAffiliateRegistration, getAffiliateByEmail,
  getDashboardStats, getRegistrationsByPlan, getAbTestResults,
} from "./db";

import { sendConfirmationEmail } from "./email";

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
