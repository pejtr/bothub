import { ENV } from "./_core/env";

type ConfirmationEmailParams = {
  email: string;
  name?: string;
  plan: "free" | "gold" | "diamond";
  registrationId: number;
  isAutoActivated: boolean;
};

const PLAN_NAMES: Record<string, string> = {
  free: "FREE",
  gold: "GOLD",
  diamond: "DIAMOND",
};

const PLAN_COLORS: Record<string, string> = {
  free: "#6B7280",
  gold: "#F59E0B",
  diamond: "#8B5CF6",
};

function generateActivationToken(registrationId: number): string {
  return Buffer.from(`${registrationId}:bothub-activate`).toString("base64url");
}

function buildEmailHtml(params: ConfirmationEmailParams, origin: string): string {
  const { name, plan, registrationId, isAutoActivated } = params;
  const planName = PLAN_NAMES[plan] ?? plan.toUpperCase();
  const planColor = PLAN_COLORS[plan] ?? "#F59E0B";
  const greeting = name ? `Ahoj ${name}` : "Ahoj";

  const activationUrl = isAutoActivated
    ? null
    : `${origin}/activate?id=${registrationId}&token=${generateActivationToken(registrationId)}`;

  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <!-- Header -->
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-flex;align-items:center;gap:8px;">
      <span style="font-size:24px;font-weight:800;color:#F59E0B;">BOT</span><span style="font-size:24px;font-weight:800;color:#FFFFFF;">HUB</span>
    </div>
  </div>

  <!-- Main Card -->
  <div style="background:#111118;border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:32px;margin-bottom:24px;">
    <h1 style="color:#FFFFFF;font-size:24px;margin:0 0 8px;font-weight:700;">${greeting},</h1>
    <p style="color:#9CA3AF;font-size:16px;line-height:1.6;margin:0 0 24px;">
      ${isAutoActivated
        ? "Vaše registrace na BOTHUB.cz byla úspěšně dokončena a váš plán je aktivní!"
        : "Vaše registrace na BOTHUB.cz byla úspěšně přijata. Klikněte na tlačítko níže pro aktivaci vašeho plánu."
      }
    </p>

    <!-- Plan Badge -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid ${planColor}33;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="color:#9CA3AF;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Váš plán</p>
      <p style="color:${planColor};font-size:28px;font-weight:800;margin:0;">${planName}</p>
      <p style="color:#6B7280;font-size:13px;margin:8px 0 0;">
        ${plan === "free" ? "3 iBoti • 100 konverzací/měsíc • Základní analytics"
          : plan === "gold" ? "Neomezení iBoti • Neomezené konverzace • 66% affiliate provize"
          : "Vše z GOLD • White-label • Custom AI persony • 77% affiliate provize"
        }
      </p>
    </div>

    ${!isAutoActivated ? `
    <!-- Activation Button -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${activationUrl}" style="display:inline-block;background:linear-gradient(135deg,${planColor},${planColor}CC);color:${plan === "gold" ? "#000000" : "#FFFFFF"};text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:10px;">
        Aktivovat plán ${planName}
      </a>
    </div>
    <p style="color:#6B7280;font-size:12px;text-align:center;margin:0;">
      Pokud tlačítko nefunguje, zkopírujte tento odkaz:<br>
      <a href="${activationUrl}" style="color:${planColor};word-break:break-all;">${activationUrl}</a>
    </p>
    ` : `
    <!-- What's Next -->
    <div style="text-align:center;">
      <p style="color:#D1D5DB;font-size:14px;margin:0 0 16px;">Co dál?</p>
      <div style="display:inline-block;">
        <p style="color:#9CA3AF;font-size:13px;text-align:left;margin:0 0 8px;">✅ Prozkoumejte katalog 77 AI osobností</p>
        <p style="color:#9CA3AF;font-size:13px;text-align:left;margin:0 0 8px;">✅ Nasaďte svého prvního iBota za 5 minut</p>
        <p style="color:#9CA3AF;font-size:13px;text-align:left;margin:0;">✅ Sledujte výsledky v reálném čase</p>
      </div>
    </div>
    `}
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:16px 0;">
    <p style="color:#4B5563;font-size:12px;margin:0 0 8px;">
      Tento e-mail byl odeslán z BOTHUB.cz — AI chatboti, kteří prodávají za vás.
    </p>
    <p style="color:#374151;font-size:11px;margin:0;">
      © 2026 BOTHUB.cz — Všechna práva vyhrazena.
    </p>
  </div>
</div>
</body>
</html>`;
}

function buildPlainText(params: ConfirmationEmailParams, origin: string): string {
  const { name, plan, registrationId, isAutoActivated } = params;
  const planName = PLAN_NAMES[plan] ?? plan.toUpperCase();
  const greeting = name ? `Ahoj ${name}` : "Ahoj";
  const activationUrl = isAutoActivated
    ? null
    : `${origin}/activate?id=${registrationId}&token=${generateActivationToken(registrationId)}`;

  let text = `${greeting},\n\n`;
  text += isAutoActivated
    ? `Vaše registrace na BOTHUB.cz byla úspěšně dokončena a váš plán ${planName} je aktivní!\n\n`
    : `Vaše registrace na BOTHUB.cz byla úspěšně přijata.\n\nPro aktivaci plánu ${planName} klikněte na tento odkaz:\n${activationUrl}\n\n`;
  text += `Váš plán: ${planName}\n`;
  text += `---\n© 2026 BOTHUB.cz — AI chatboti, kteří prodávají za vás.\n`;
  return text;
}

/**
 * Send a confirmation email after registration.
 * Uses the Manus Forge API notification endpoint for email delivery.
 * Falls back to owner notification if direct email is not available.
 */
export async function sendConfirmationEmail(params: ConfirmationEmailParams): Promise<boolean> {
  const { email, plan } = params;
  const planName = PLAN_NAMES[plan] ?? plan.toUpperCase();
  const origin = "https://bothub.cz"; // Will be updated when domain is configured

  const htmlContent = buildEmailHtml(params, origin);
  const plainText = buildPlainText(params, origin);

  // Since we don't have a direct email sending API yet,
  // we notify the owner with the email details so they can follow up.
  // When a proper email service is integrated, this will send directly.
  try {
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      console.warn("[Email] Email service not configured, skipping confirmation email");
      return false;
    }

    // Use notification service to alert owner about the email that should be sent
    const endpoint = `${ENV.forgeApiUrl.replace(/\/$/, "")}/webdevtoken.v1.WebDevService/SendNotification`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        title: `📧 Potvrzovací e-mail: ${planName} plán → ${email}`,
        content: `Registrace #${params.registrationId}\nE-mail: ${email}\nPlán: ${planName}\nStav: ${params.isAutoActivated ? "Aktivován" : "Čeká na aktivaci"}\n\nObsah e-mailu (plain text):\n${plainText}`,
      }),
    });

    if (!response.ok) {
      console.warn(`[Email] Notification failed: ${response.status}`);
      return false;
    }

    console.log(`[Email] Confirmation notification sent for ${email} (${planName})`);
    return true;
  } catch (error) {
    console.warn("[Email] Failed to send confirmation:", error);
    return false;
  }
}

// ===== E-mail Notification Templates for Key Events =====

type EventEmailParams = {
  email: string;
  name?: string;
};

function buildEventEmailHtml(subject: string, greeting: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <span style="font-size:24px;font-weight:800;color:#F59E0B;">BOT</span><span style="font-size:24px;font-weight:800;color:#FFFFFF;">HUB</span>
  </div>
  <div style="background:#111118;border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:32px;margin-bottom:24px;">
    <h1 style="color:#FFFFFF;font-size:22px;margin:0 0 8px;font-weight:700;">${greeting}</h1>
    ${bodyHtml}
  </div>
  <div style="text-align:center;padding:16px 0;">
    <p style="color:#4B5563;font-size:12px;margin:0 0 8px;">Tento e-mail byl odesl\u00e1n z BOTHUB.cz \u2014 AI chatboti, kte\u0159\u00ed prod\u00e1vaj\u00ed za v\u00e1s.</p>
    <p style="color:#374151;font-size:11px;margin:0;">\u00a9 2026 BOTHUB.cz \u2014 V\u0161echna pr\u00e1va vyhrazena.</p>
  </div>
</div>
</body>
</html>`;
}

/**
 * Send email notification when a plan is activated.
 */
export async function sendPlanActivatedEmail(params: EventEmailParams & { plan: string }): Promise<boolean> {
  const { email, name, plan } = params;
  const planName = PLAN_NAMES[plan] ?? plan.toUpperCase();
  const planColor = PLAN_COLORS[plan] ?? "#F59E0B";
  const greeting = name ? `Ahoj ${name},` : "Ahoj,";

  const bodyHtml = `
    <p style="color:#9CA3AF;font-size:16px;line-height:1.6;margin:0 0 24px;">V\u00e1\u0161 pl\u00e1n <strong style="color:${planColor};">${planName}</strong> byl \u00fasp\u011b\u0161n\u011b aktivov\u00e1n! M\u016f\u017eete za\u010d\u00edt pou\u017e\u00edvat sv\u00e9 AI chatboty.</p>
    <div style="background:rgba(255,255,255,0.03);border:1px solid ${planColor}33;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="color:#9CA3AF;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Aktivn\u00ed pl\u00e1n</p>
      <p style="color:${planColor};font-size:28px;font-weight:800;margin:0;">\u2705 ${planName}</p>
    </div>
    <div style="text-align:center;">
      <a href="https://bothub.cz/dashboard" style="display:inline-block;background:linear-gradient(135deg,${planColor},${planColor}CC);color:${plan === "gold" ? "#000000" : "#FFFFFF"};text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:10px;">P\u0159ej\u00edt do Dashboardu</a>
    </div>`;

  return sendEventEmail(email, `Pl\u00e1n ${planName} aktivov\u00e1n!`, greeting, bodyHtml);
}

/**
 * Send email notification to affiliate partner when they get a new referral.
 */
export async function sendNewReferralEmail(params: EventEmailParams & { referralEmail: string; referralPlan: string; totalReferrals: number }): Promise<boolean> {
  const { email, name, referralEmail, referralPlan, totalReferrals } = params;
  const planName = PLAN_NAMES[referralPlan] ?? referralPlan.toUpperCase();
  const planColor = PLAN_COLORS[referralPlan] ?? "#F59E0B";
  const greeting = name ? `Ahoj ${name},` : "Ahoj,";
  const commission = referralPlan === "diamond" ? "77%" : referralPlan === "gold" ? "66%" : "0%";

  const bodyHtml = `
    <p style="color:#9CA3AF;font-size:16px;line-height:1.6;margin:0 0 24px;">M\u00e1te nov\u00fd referral! N\u011bkdo se zaregistroval p\u0159es v\u00e1\u0161 affiliate odkaz.</p>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span style="color:#9CA3AF;font-size:13px;">Nov\u00fd referral</span>
        <span style="color:#FFFFFF;font-size:13px;font-weight:600;">${referralEmail.replace(/(.{3}).*(@.*)/, "$1***$2")}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span style="color:#9CA3AF;font-size:13px;">Pl\u00e1n</span>
        <span style="color:${planColor};font-size:13px;font-weight:600;">${planName}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span style="color:#9CA3AF;font-size:13px;">Provize</span>
        <span style="color:#10B981;font-size:13px;font-weight:600;">${commission}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#9CA3AF;font-size:13px;">Celkem referral\u016f</span>
        <span style="color:#F59E0B;font-size:13px;font-weight:700;">${totalReferrals}</span>
      </div>
    </div>
    <div style="text-align:center;">
      <a href="https://bothub.cz/affiliate-dashboard" style="display:inline-block;background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:#FFFFFF;text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:10px;">Zobrazit Affiliate Dashboard</a>
    </div>`;

  return sendEventEmail(email, `Nov\u00fd referral: ${planName} pl\u00e1n!`, greeting, bodyHtml);
}

/**
 * Send email notification when affiliate reaches a milestone.
 */
export async function sendAffiliateMilestoneEmail(params: EventEmailParams & { milestone: number; totalCommission: number }): Promise<boolean> {
  const { email, name, milestone, totalCommission } = params;
  const greeting = name ? `Ahoj ${name},` : "Ahoj,";
  const commissionFormatted = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(totalCommission);

  const milestoneEmoji = milestone >= 50 ? "\ud83c\udfc6" : milestone >= 25 ? "\ud83d\udd25" : milestone >= 10 ? "\u2b50" : "\ud83c\udf89";

  const bodyHtml = `
    <p style="color:#9CA3AF;font-size:16px;line-height:1.6;margin:0 0 24px;">Gratulujeme! Dos\u00e1hli jste d\u016fle\u017eit\u00e9ho affiliate miln\u00edku!</p>
    <div style="background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(139,92,246,0.1));border:1px solid rgba(245,158,11,0.3);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
      <p style="font-size:48px;margin:0 0 8px;">${milestoneEmoji}</p>
      <p style="color:#F59E0B;font-size:36px;font-weight:800;margin:0 0 8px;">${milestone} referral\u016f!</p>
      <p style="color:#9CA3AF;font-size:14px;margin:0;">Celkov\u00e1 provize: <strong style="color:#10B981;">${commissionFormatted}</strong></p>
    </div>
    <div style="text-align:center;">
      <a href="https://bothub.cz/affiliate-dashboard" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#D97706);color:#000000;text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:10px;">Zobrazit v\u00fdsledky</a>
    </div>`;

  return sendEventEmail(email, `${milestoneEmoji} Miln\u00edk: ${milestone} referral\u016f!`, greeting, bodyHtml);
}

/**
 * Generic event email sender using Forge notification API.
 */
async function sendEventEmail(toEmail: string, subject: string, greeting: string, bodyHtml: string): Promise<boolean> {
  const htmlContent = buildEventEmailHtml(subject, greeting, bodyHtml);

  try {
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      console.warn("[Email] Email service not configured, skipping event email");
      return false;
    }

    const endpoint = `${ENV.forgeApiUrl.replace(/\/$/, "")}/webdevtoken.v1.WebDevService/SendNotification`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        title: `\ud83d\udce7 ${subject} \u2192 ${toEmail}`,
        content: `E-mail: ${toEmail}\nP\u0159edm\u011bt: ${subject}\n\nHTML obsah p\u0159ipraven k odesl\u00e1n\u00ed.`,
      }),
    });

    if (!response.ok) {
      console.warn(`[Email] Event email notification failed: ${response.status}`);
      return false;
    }

    console.log(`[Email] Event email notification sent: ${subject} -> ${toEmail}`);
    return true;
  } catch (error) {
    console.warn("[Email] Failed to send event email:", error);
    return false;
  }
}

/** Export for testing */
export { buildEmailHtml, buildPlainText, generateActivationToken, buildEventEmailHtml, sendEventEmail };
