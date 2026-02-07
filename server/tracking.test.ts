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
}));

import { captureEmail, trackAbTestEvent, trackAffiliateClick } from "./db";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("tracking.captureEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("captures a valid email with GDPR consent", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tracking.captureEmail({
      email: "test@example.com",
      source: "unlock_modal",
      variant: "variant_a",
      gdprConsent: true,
    });

    expect(result).toEqual({ success: true });
    expect(captureEmail).toHaveBeenCalledWith({
      email: "test@example.com",
      source: "unlock_modal",
      variant: "variant_a",
      gdprConsent: 1,
    });
  });

  it("rejects invalid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.tracking.captureEmail({
        email: "not-an-email",
        source: "unlock_modal",
        gdprConsent: true,
      })
    ).rejects.toThrow();
  });

  it("handles missing variant by setting null", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.tracking.captureEmail({
      email: "user@test.cz",
      gdprConsent: false,
    });

    expect(captureEmail).toHaveBeenCalledWith({
      email: "user@test.cz",
      source: "unlock_modal",
      variant: null,
      gdprConsent: 0,
    });
  });
});

describe("tracking.ctaClick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tracks a CTA click event", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tracking.ctaClick({
      variant: "variant_b",
      targetUrl: "#pricing",
    });

    expect(result).toEqual({ success: true });
    expect(trackAbTestEvent).toHaveBeenCalledWith("cta_hero", "variant_b", "click");
  });
});

describe("tracking.ctaImpression", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tracks a CTA impression event", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tracking.ctaImpression({
      variant: "variant_a",
    });

    expect(result).toEqual({ success: true });
    expect(trackAbTestEvent).toHaveBeenCalledWith("cta_hero", "variant_a", "impression");
  });
});

describe("tracking.affiliateClick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tracks an affiliate click with all fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tracking.affiliateClick({
      partner: "partner123",
      plan: "gold",
      referrer: "https://google.com",
    });

    expect(result).toEqual({ success: true });
    expect(trackAffiliateClick).toHaveBeenCalledWith({
      partner: "partner123",
      plan: "gold",
      referrer: "https://google.com",
    });
  });

  it("handles missing optional fields by setting null", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.tracking.affiliateClick({
      partner: "partner456",
    });

    expect(trackAffiliateClick).toHaveBeenCalledWith({
      partner: "partner456",
      plan: null,
      referrer: null,
    });
  });
});
