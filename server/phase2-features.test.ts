import { describe, it, expect } from "vitest";
import {
  WELCOME_SEQUENCE,
  LEAD_MAGNET,
  getNextEmailInSequence,
  getEmailByDayOffset,
  renderEmailTemplate,
  getSequenceEmailIds,
} from "./email/welcome-sequence";
import {
  getSequenceStatus,
  shouldSendEmail,
  prepareEmailContent,
  getSequenceSummary,
} from "./email/scheduler";
import {
  generateSSOToken,
  verifySSOToken,
  buildSSORedirectUrl,
} from "./sso/sso";

// ============ Email Welcome Sequence Tests ============
describe("Email Welcome Sequence", () => {
  it("should have exactly 5 emails in the sequence", () => {
    expect(WELCOME_SEQUENCE.totalEmails).toBe(5);
    expect(WELCOME_SEQUENCE.emails.length).toBe(5);
  });

  it("should have correct day offsets (0, 1, 3, 5, 7)", () => {
    const offsets = WELCOME_SEQUENCE.emails.map((e) => e.dayOffset);
    expect(offsets).toEqual([0, 1, 3, 5, 7]);
  });

  it("should have unique email IDs", () => {
    const ids = WELCOME_SEQUENCE.emails.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should have non-empty subjects for all emails", () => {
    for (const email of WELCOME_SEQUENCE.emails) {
      expect(email.subject.length).toBeGreaterThan(0);
    }
  });

  it("should have both HTML and text body for all emails", () => {
    for (const email of WELCOME_SEQUENCE.emails) {
      expect(email.bodyHtml.length).toBeGreaterThan(0);
      expect(email.bodyText.length).toBeGreaterThan(0);
    }
  });

  it("should have tags for all emails", () => {
    for (const email of WELCOME_SEQUENCE.emails) {
      expect(email.tags.length).toBeGreaterThan(0);
    }
  });

  it("first email should be welcome with lead magnet", () => {
    const first = WELCOME_SEQUENCE.emails[0];
    expect(first.id).toBe("welcome_lead_magnet");
    expect(first.dayOffset).toBe(0);
    expect(first.tags).toContain("welcome");
    expect(first.tags).toContain("lead_magnet");
  });

  it("last email should be offer with urgency", () => {
    const last = WELCOME_SEQUENCE.emails[4];
    expect(last.id).toBe("offer_urgency_day7");
    expect(last.dayOffset).toBe(7);
    expect(last.tags).toContain("offer");
    expect(last.tags).toContain("urgency");
  });
});

describe("Lead Magnet", () => {
  it("should have 7 chapters", () => {
    expect(LEAD_MAGNET.chapters.length).toBe(7);
  });

  it("should have title and slug", () => {
    expect(LEAD_MAGNET.title.length).toBeGreaterThan(0);
    expect(LEAD_MAGNET.slug.length).toBeGreaterThan(0);
  });
});

describe("Email Sequence Helpers", () => {
  it("getNextEmailInSequence should return correct email", () => {
    const first = getNextEmailInSequence(0);
    expect(first?.id).toBe("welcome_lead_magnet");

    const second = getNextEmailInSequence(1);
    expect(second?.id).toBe("quick_win_day1");

    const none = getNextEmailInSequence(5);
    expect(none).toBeNull();
  });

  it("getEmailByDayOffset should find correct email", () => {
    expect(getEmailByDayOffset(0)?.id).toBe("welcome_lead_magnet");
    expect(getEmailByDayOffset(3)?.id).toBe("deep_value_day3");
    expect(getEmailByDayOffset(7)?.id).toBe("offer_urgency_day7");
    expect(getEmailByDayOffset(10)).toBeNull();
  });

  it("renderEmailTemplate should replace variables", () => {
    const template = WELCOME_SEQUENCE.emails[0];
    const result = renderEmailTemplate(template, {
      APP_URL: "https://test.com",
      LEAD_MAGNET_URL: "https://test.com/download",
      UNSUBSCRIBE_URL: "https://test.com/unsub",
    });

    expect(result.bodyHtml).toContain("https://test.com/download");
    expect(result.bodyText).toContain("https://test.com/download");
    expect(result.bodyHtml).not.toContain("{{LEAD_MAGNET_URL}}");
  });

  it("getSequenceEmailIds should return all IDs", () => {
    const ids = getSequenceEmailIds();
    expect(ids.length).toBe(5);
    expect(ids[0]).toBe("welcome_lead_magnet");
  });
});

describe("Email Scheduler", () => {
  it("getSequenceStatus should track progress", () => {
    const status = getSequenceStatus(
      "test@example.com",
      new Date("2026-01-01"),
      []
    );

    expect(status.currentStep).toBe(0);
    expect(status.totalSteps).toBe(5);
    expect(status.isComplete).toBe(false);
    expect(status.nextEmailId).toBe("welcome_lead_magnet");
  });

  it("getSequenceStatus should detect completion", () => {
    const status = getSequenceStatus(
      "test@example.com",
      new Date("2026-01-01"),
      ["a", "b", "c", "d", "e"]
    );

    expect(status.currentStep).toBe(5);
    expect(status.isComplete).toBe(true);
    expect(status.nextEmailId).toBeNull();
  });

  it("shouldSendEmail should check timing correctly", () => {
    const signupDate = new Date("2026-01-01T10:00:00Z");
    const email = WELCOME_SEQUENCE.emails[0]; // Day 0

    // Same day - should send
    const sameDay = new Date("2026-01-01T15:00:00Z");
    expect(shouldSendEmail(signupDate, email, sameDay)).toBe(true);

    // Next day - should not send (outside 24h window)
    const nextDay = new Date("2026-01-02T15:00:00Z");
    expect(shouldSendEmail(signupDate, email, nextDay)).toBe(false);
  });

  it("prepareEmailContent should fill all variables", () => {
    const template = WELCOME_SEQUENCE.emails[0];
    const result = prepareEmailContent(
      template,
      "user@test.com",
      "https://ibots.test"
    );

    expect(result.bodyHtml).toContain("https://ibots.test");
    expect(result.bodyHtml).toContain("user%40test.com");
    expect(result.bodyHtml).not.toContain("{{APP_URL}}");
  });

  it("getSequenceSummary should return correct structure", () => {
    const summary = getSequenceSummary();
    expect(summary.totalEmails).toBe(5);
    expect(summary.emails.length).toBe(5);
    expect(summary.emails[0].id).toBe("welcome_lead_magnet");
    expect(summary.emails[0].dayOffset).toBe(0);
  });
});

// ============ SSO Tests ============
describe("SSO Cross-Platform Authentication", () => {
  it("should generate a valid SSO token", async () => {
    const token = await generateSSOToken({
      openId: "test-user-123",
      name: "Test User",
      email: "test@example.com",
      sourcePlatform: "ibots",
      targetPlatform: "bothub",
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("should verify a valid SSO token", async () => {
    const token = await generateSSOToken({
      openId: "verify-test-456",
      name: "Verify User",
      email: "verify@example.com",
      sourcePlatform: "ibots",
      targetPlatform: "bothub",
    });

    // Token was issued by ibots with audience=bothub, so verify with audience=bothub
    const payload = await verifySSOToken(token, "bothub");
    expect(payload).not.toBeNull();
    expect(payload?.openId).toBe("verify-test-456");
    expect(payload?.name).toBe("Verify User");
    expect(payload?.sourcePlatform).toBe("ibots");
    expect(payload?.targetPlatform).toBe("bothub");
  });

  it("should reject an invalid SSO token", async () => {
    const payload = await verifySSOToken("invalid-token-string");
    expect(payload).toBeNull();
  });

  it("should build correct redirect URL", () => {
    const url = buildSSORedirectUrl(
      "https://bothub.cz",
      "test-token-abc",
      "/dashboard"
    );

    expect(url).toContain("https://bothub.cz");
    expect(url).toContain("sso_token=test-token-abc");
    expect(url).toContain("return_path=%2Fdashboard");
  });

  it("should handle SSO token with null email", async () => {
    const token = await generateSSOToken({
      openId: "no-email-user",
      name: "No Email",
      email: null,
      sourcePlatform: "ibots",
      targetPlatform: "bothub",
    });

    // Token was issued by ibots with audience=bothub, so verify with audience=bothub
    const payload = await verifySSOToken(token, "bothub");
    expect(payload).not.toBeNull();
    expect(payload?.email).toBeNull();
  });
});

// ============ Admin Analytics Tests ============
describe("Admin Analytics - Structure", () => {
  it("welcome sequence summary should have correct format", () => {
    const summary = getSequenceSummary();
    expect(summary).toHaveProperty("id");
    expect(summary).toHaveProperty("name");
    expect(summary).toHaveProperty("totalEmails");
    expect(summary).toHaveProperty("emails");
    expect(summary.id).toBe("ibots_welcome_v1");
  });

  it("email templates should contain BotHub branding", () => {
    for (const email of WELCOME_SEQUENCE.emails) {
      expect(email.bodyHtml).toContain("BotHub.cz");
      expect(email.bodyHtml).toContain("iBots");
    }
  });

  it("email templates should have unsubscribe links", () => {
    for (const email of WELCOME_SEQUENCE.emails) {
      expect(email.bodyHtml).toContain("{{UNSUBSCRIBE_URL}}");
      expect(email.bodyHtml.toLowerCase()).toContain("odhlásit");
    }
  });

  it("email subjects should be compelling (non-generic)", () => {
    for (const email of WELCOME_SEQUENCE.emails) {
      // Subjects should be longer than 20 chars (not generic)
      expect(email.subject.length).toBeGreaterThan(20);
    }
  });
});
