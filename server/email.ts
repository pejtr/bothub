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

/** Export for testing */
export { buildEmailHtml, buildPlainText, generateActivationToken };
