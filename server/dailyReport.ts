import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { registrations, emailCaptures, abTestResults, affiliateClicks, affiliateRegistrations } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";

async function getDb() {
  if (!process.env.DATABASE_URL) return null;
  return drizzle(process.env.DATABASE_URL);
}

export type DailyReportData = {
  date: string;
  newRegistrations: { total: number; free: number; gold: number; diamond: number };
  newEmails: number;
  newAffiliatePartners: number;
  newAffiliateClicks: number;
  abTestSummary: Array<{ testName: string; variant: string; impressions: number; clicks: number; conversions: number; ctr: string; cvr: string }>;
  topSource: string;
};

/** Generate daily report data for the last 24 hours */
export async function generateDailyReport(): Promise<DailyReportData | null> {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dateStr = now.toISOString().split("T")[0]!;

  // New registrations
  const regRows = await db.select({
    plan: registrations.plan,
    count: sql<number>`count(*)`,
  }).from(registrations)
    .where(sql`createdAt >= ${yesterday}`)
    .groupBy(registrations.plan);

  const regByPlan: Record<string, number> = {};
  let totalRegs = 0;
  for (const r of regRows) {
    regByPlan[r.plan] = r.count;
    totalRegs += r.count;
  }

  // New email captures
  const emailRows = await db.select({ count: sql<number>`count(*)` })
    .from(emailCaptures)
    .where(sql`capturedAt >= ${yesterday}`);
  const newEmails = emailRows[0]?.count ?? 0;

  // New affiliate partners
  const affRows = await db.select({ count: sql<number>`count(*)` })
    .from(affiliateRegistrations)
    .where(sql`createdAt >= ${yesterday}`);
  const newAffiliatePartners = affRows[0]?.count ?? 0;

  // New affiliate clicks
  const clickRows = await db.select({ count: sql<number>`count(*)` })
    .from(affiliateClicks)
    .where(sql`clickedAt >= ${yesterday}`);
  const newAffiliateClicks = clickRows[0]?.count ?? 0;

  // A/B test summary (all time, for context)
  const abRows = await db.select().from(abTestResults);
  const abTestSummary = abRows.map((t) => ({
    testName: t.testName,
    variant: t.variant,
    impressions: t.impressions,
    clicks: t.clicks,
    conversions: t.conversions,
    ctr: t.impressions > 0 ? ((t.clicks / t.impressions) * 100).toFixed(1) : "0.0",
    cvr: t.clicks > 0 ? ((t.conversions / t.clicks) * 100).toFixed(1) : "0.0",
  }));

  // Top registration source
  const sourceRows = await db.select({
    source: registrations.source,
    count: sql<number>`count(*)`,
  }).from(registrations)
    .where(sql`createdAt >= ${yesterday}`)
    .groupBy(registrations.source)
    .orderBy(sql`count(*) DESC`)
    .limit(1);
  const topSource = sourceRows[0]?.source ?? "N/A";

  return {
    date: dateStr,
    newRegistrations: {
      total: totalRegs,
      free: regByPlan["free"] ?? 0,
      gold: regByPlan["gold"] ?? 0,
      diamond: regByPlan["diamond"] ?? 0,
    },
    newEmails,
    newAffiliatePartners,
    newAffiliateClicks,
    abTestSummary,
    topSource,
  };
}

/** Format report data into a readable notification */
export function formatReportContent(data: DailyReportData): string {
  const lines: string[] = [
    `📊 BOTHUB.cz — Denní report (${data.date})`,
    ``,
    `📋 NOVÉ REGISTRACE: ${data.newRegistrations.total}`,
    `  • FREE: ${data.newRegistrations.free}`,
    `  • GOLD: ${data.newRegistrations.gold}`,
    `  • DIAMOND: ${data.newRegistrations.diamond}`,
    ``,
    `📧 Nové e-mail captures: ${data.newEmails}`,
    `🤝 Noví affiliate partneři: ${data.newAffiliatePartners}`,
    `🔗 Affiliate kliky: ${data.newAffiliateClicks}`,
    `📍 Top zdroj registrací: ${data.topSource}`,
  ];

  if (data.abTestSummary.length > 0) {
    lines.push(``, `🧪 A/B TESTY:`);
    for (const t of data.abTestSummary) {
      lines.push(`  ${t.testName} | ${t.variant}: ${t.impressions} impresí, ${t.clicks} kliků, ${t.conversions} konverzí (CTR: ${t.ctr}%, CVR: ${t.cvr}%)`);
    }

    // Recommendation
    const sorted = [...data.abTestSummary].sort((a, b) => parseFloat(b.cvr) - parseFloat(a.cvr));
    if (sorted[0] && parseFloat(sorted[0].cvr) > 0) {
      lines.push(`  ✅ Doporučení: Varianta "${sorted[0].variant}" má nejlepší CVR (${sorted[0].cvr}%)`);
    }
  }

  lines.push(``, `---`, `Automatický report z BOTHUB.cz`);
  return lines.join("\n");
}

/** Send daily report as owner notification */
export async function sendDailyReport(): Promise<boolean> {
  try {
    const data = await generateDailyReport();
    if (!data) {
      console.warn("[DailyReport] No database available, skipping report");
      return false;
    }

    const content = formatReportContent(data);
    const success = await notifyOwner({
      title: `📊 Denní report BOTHUB.cz — ${data.date}`,
      content,
    });

    if (success) {
      console.log(`[DailyReport] Report sent successfully for ${data.date}`);
    } else {
      console.warn(`[DailyReport] Failed to send report for ${data.date}`);
    }

    return success;
  } catch (error) {
    console.error("[DailyReport] Error generating report:", error);
    return false;
  }
}
