import { getDb } from "./db";
import { users, userWishlist, userPreferences } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { ibots } from "../client/src/data/ibots";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
    });
  }
  return transporter;
}

interface WishlistDigestData {
  userId: number;
  userEmail: string;
  userName: string;
  wishlistItems: Array<{
    ibotId: string;
    name: string;
    category: string;
    description: string;
  }>;
}

/**
 * Generate weekly wishlist digest for a single user
 */
export async function generateUserWishlistDigest(userId: number): Promise<WishlistDigestData | null> {
  const db = await getDb();
  if (!db) return null;

  // Get user data
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || !user.email) return null;

  // Check if user has weekly digest enabled
  const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  if (prefs && prefs.weeklyDigest === 0) return null;

  // Get user's wishlist
  const wishlist = await db.select().from(userWishlist).where(eq(userWishlist.userId, userId));
  if (wishlist.length === 0) return null;

  // Map wishlist items to iBot data
  const wishlistItems = wishlist
    .map((item: any) => {
      const ibot = ibots.find((b) => b.id === item.ibotId);
      if (!ibot) return null;
      return {
        ibotId: ibot.id,
        name: ibot.name,
        category: ibot.category,
        description: ibot.description,
      };
    })
    .filter((item: any): item is NonNullable<typeof item> => item !== null);

  if (wishlistItems.length === 0) return null;

  return {
    userId,
    userEmail: user.email,
    userName: user.name || "Uživateli",
    wishlistItems,
  };
}

/**
 * Generate HTML email template for wishlist digest
 */
export function formatWishlistDigestEmail(data: WishlistDigestData, locale: "cs" | "en" = "cs"): string {
  const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL?.replace("/api", "") || "https://bothub.cz";
  const unsubscribeUrl = `${baseUrl}/preferences?unsubscribe=wishlist`;

  const translations = {
    cs: {
      subject: "Týdenní přehled vašich oblíbených iBotů",
      greeting: `Ahoj ${data.userName}!`,
      intro: `Máme pro tebe přehled tvých oblíbených iBotů. Podívej se, co je nového:`,
      viewDetails: "Zobrazit detail",
      tryNow: "Vyzkoušet nyní",
      footer: `Tento e-mail jsi obdržel, protože máš zapnuté týdenní přehledy oblíbených iBotů.`,
      unsubscribe: "Odhlásit se z týdenních přehledů",
      allRightsReserved: "Všechna práva vyhrazena.",
    },
    en: {
      subject: "Weekly digest of your favorite iBots",
      greeting: `Hello ${data.userName}!`,
      intro: `Here's an overview of your favorite iBots. Check out what's new:`,
      viewDetails: "View details",
      tryNow: "Try now",
      footer: `You received this email because you have weekly wishlist digests enabled.`,
      unsubscribe: "Unsubscribe from weekly digests",
      allRightsReserved: "All rights reserved.",
    },
  };

  const t = translations[locale];

  const ibotRows = data.wishlistItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 20px; border-bottom: 1px solid #2A2A3F;">
        <h3 style="margin: 0 0 10px 0; color: #F59E0B; font-size: 20px;">${item.name}</h3>
        <p style="margin: 0 0 10px 0; color: #9CA3AF; font-size: 14px;">Kategorie: ${item.category}</p>
        <p style="margin: 0 0 15px 0; color: #D1D5DB; font-size: 16px; line-height: 1.6;">${item.description}</p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right: 10px;">
              <a href="${baseUrl}/ibot/${item.ibotId}" style="display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #000; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">${t.viewDetails}</a>
            </td>
            <td>
              <a href="${baseUrl}/#catalog" style="display: inline-block; padding: 10px 20px; background: transparent; color: #F59E0B; text-decoration: none; border: 2px solid #F59E0B; border-radius: 6px; font-weight: 600; font-size: 14px;">${t.tryNow}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A0A0F;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0A0A0F;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #1A1A2E; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%); border-bottom: 2px solid #F59E0B;">
              <h1 style="margin: 0; color: #F59E0B; font-size: 28px; font-weight: 700;">
                <span style="color: #F59E0B;">BOT</span><span style="color: #FFF;">HUB</span>
              </h1>
              <p style="margin: 10px 0 0 0; color: #9CA3AF; font-size: 14px;">${t.subject}</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <h2 style="margin: 0 0 15px 0; color: #FFF; font-size: 24px;">${t.greeting}</h2>
              <p style="margin: 0; color: #D1D5DB; font-size: 16px; line-height: 1.6;">${t.intro}</p>
            </td>
          </tr>
          
          <!-- Wishlist Items -->
          ${ibotRows}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #16213E; border-top: 2px solid #2A2A3F;">
              <p style="margin: 0 0 15px 0; color: #9CA3AF; font-size: 14px;">${t.footer}</p>
              <p style="margin: 0 0 20px 0;">
                <a href="${unsubscribeUrl}" style="color: #F59E0B; text-decoration: none; font-size: 14px;">${t.unsubscribe}</a>
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 12px;">© 2026 BOTHUB.cz. ${t.allRightsReserved}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send wishlist digest email to a user
 */
export async function sendWishlistDigestEmail(data: WishlistDigestData, locale: "cs" | "en" = "cs"): Promise<boolean> {
  try {
    const translations = {
      cs: { subject: "Týdenní přehled vašich oblíbených iBotů" },
      en: { subject: "Weekly digest of your favorite iBots" },
    };

    const html = formatWishlistDigestEmail(data, locale);
    const mailer = getTransporter();

    await mailer.sendMail({
      from: `"BOTHUB" <${process.env.SMTP_USER}>`,
      to: data.userEmail,
      subject: translations[locale].subject,
      html,
    });

    console.log(`[WishlistDigest] Sent to ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error(`[WishlistDigest] Failed to send to ${data.userEmail}:`, error);
    return false;
  }
}

/**
 * Send weekly wishlist digest to all eligible users
 */
export async function sendWeeklyWishlistDigests(): Promise<{ sent: number; failed: number; skipped: number }> {
  console.log("[WishlistDigest] Starting weekly digest generation...");

  const db = await getDb();
  if (!db) {
    console.error("[WishlistDigest] Database not available");
    return { sent: 0, failed: 0, skipped: 0 };
  }

  const allUsers = await db.select({ id: users.id }).from(users);
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of allUsers) {
    try {
      const digestData = await generateUserWishlistDigest(user.id);
      if (!digestData) {
        skipped++;
        continue;
      }

      const success = await sendWishlistDigestEmail(digestData, "cs");
      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Rate limiting: wait 100ms between emails
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`[WishlistDigest] Error processing user ${user.id}:`, error);
      failed++;
    }
  }

  console.log(`[WishlistDigest] Completed: ${sent} sent, ${failed} failed, ${skipped} skipped`);
  return { sent, failed, skipped };
}
