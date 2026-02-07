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
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import {
  captureEmail, trackAbTestEvent, trackAffiliateClick,
  createRegistration, getRegistrationByEmail, activateRegistration,
  createAffiliateRegistration, getAffiliateByEmail,
} from "./db";

function createPublicContext(): TrpcContext {
  return {
    user: null,
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

  it("creates a new FREE registration and auto-activates", async () => {
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
