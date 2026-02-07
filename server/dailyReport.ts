import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { registrations, emailCaptures, abTestResults, affiliateClicks, affiliateRegistrations } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";

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

export type WeeklyReportData = {
  weekStart: string;
  weekEnd: string;
  dailyTrend: Array<{ date: string; registrations: number; emails: number }>;
  totalRegistrations: { total: number; free: number; gold: number; diamond: number };
  totalEmails: number;
  totalAffiliatePartners: number;
  totalAffiliateClicks: number;
  abTestSummary: Array<{ testName: string; variant: string; impressions: number; clicks: number; conversions: number; ctr: string; cvr: string }>;
  topSources: Array<{ source: string; count: number }>;
  estimatedRevenue: number;
};

/** Generate daily report data for the last 24 hours */
export async function generateDailyReport(): Promise<DailyReportData | null> {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dateStr = now.toISOString().split("T")[0]!;

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

  const emailRows = await db.select({ count: sql<number>`count(*)` })
    .from(emailCaptures)
    .where(sql`capturedAt >= ${yesterday}`);
  const newEmails = emailRows[0]?.count ?? 0;

  const affRows = await db.select({ count: sql<number>`count(*)` })
    .from(affiliateRegistrations)
    .where(sql`createdAt >= ${yesterday}`);
  const newAffiliatePartners = affRows[0]?.count ?? 0;

  const clickRows = await db.select({ count: sql<number>`count(*)` })
    .from(affiliateClicks)
    .where(sql`clickedAt >= ${yesterday}`);
  const newAffiliateClicks = clickRows[0]?.count ?? 0;

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

/** Generate weekly report data for the last 7 days */
export async function generateWeeklyReport(): Promise<WeeklyReportData | null> {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekStart = weekAgo.toISOString().split("T")[0]!;
  const weekEnd = now.toISOString().split("T")[0]!;

  // Daily trend
  const dailyRegRows = await db.select({
    date: sql<string>`DATE(createdAt)`.as("date"),
    count: sql<number>`count(*)`,
  }).from(registrations)
    .where(sql`createdAt >= ${weekAgo}`)
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);

  const dailyEmailRows = await db.select({
    date: sql<string>`DATE(capturedAt)`.as("date"),
    count: sql<number>`count(*)`,
  }).from(emailCaptures)
    .where(sql`capturedAt >= ${weekAgo}`)
    .groupBy(sql`DATE(capturedAt)`)
    .orderBy(sql`DATE(capturedAt)`);

  const emailMap: Record<string, number> = {};
  for (const r of dailyEmailRows) emailMap[r.date] = r.count;

  const dailyTrend = dailyRegRows.map((r) => ({
    date: r.date,
    registrations: r.count,
    emails: emailMap[r.date] ?? 0,
  }));

  // Total registrations by plan
  const regRows = await db.select({
    plan: registrations.plan,
    count: sql<number>`count(*)`,
  }).from(registrations)
    .where(sql`createdAt >= ${weekAgo}`)
    .groupBy(registrations.plan);

  const regByPlan: Record<string, number> = {};
  let totalRegs = 0;
  for (const r of regRows) {
    regByPlan[r.plan] = r.count;
    totalRegs += r.count;
  }

  // Total emails
  const emailTotalRows = await db.select({ count: sql<number>`count(*)` })
    .from(emailCaptures)
    .where(sql`capturedAt >= ${weekAgo}`);
  const totalEmails = emailTotalRows[0]?.count ?? 0;

  // Affiliate stats
  const affRows = await db.select({ count: sql<number>`count(*)` })
    .from(affiliateRegistrations)
    .where(sql`createdAt >= ${weekAgo}`);
  const totalAffiliatePartners = affRows[0]?.count ?? 0;

  const clickRows = await db.select({ count: sql<number>`count(*)` })
    .from(affiliateClicks)
    .where(sql`clickedAt >= ${weekAgo}`);
  const totalAffiliateClicks = clickRows[0]?.count ?? 0;

  // A/B tests
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

  // Top sources
  const sourceRows = await db.select({
    source: registrations.source,
    count: sql<number>`count(*)`,
  }).from(registrations)
    .where(sql`createdAt >= ${weekAgo}`)
    .groupBy(registrations.source)
    .orderBy(sql`count(*) DESC`)
    .limit(5);
  const topSources = sourceRows.map((r) => ({ source: r.source ?? "unknown", count: r.count }));

  // Estimated revenue (GOLD = 990, DIAMOND = 2490)
  const goldCount = regByPlan["gold"] ?? 0;
  const diamondCount = regByPlan["diamond"] ?? 0;
  const estimatedRevenue = goldCount * 990 + diamondCount * 2490;

  return {
    weekStart,
    weekEnd,
    dailyTrend,
    totalRegistrations: {
      total: totalRegs,
      free: regByPlan["free"] ?? 0,
      gold: goldCount,
      diamond: diamondCount,
    },
    totalEmails,
    totalAffiliatePartners,
    totalAffiliateClicks,
    abTestSummary,
    topSources,
    estimatedRevenue,
  };
}

/** Use LLM to generate strategic recommendations based on weekly data */
export async function generateStrategicRecommendations(data: WeeklyReportData): Promise<string> {
  try {
    const prompt = `Jsi strategický AI poradce pro platformu BOTHUB.cz (prodej AI chatbotů - iBotů).
Na základě těchto týdenních dat vytvoř stručný strategický souhrn (max 5 bodů) s konkrétními doporučeními:

TÝDENNÍ DATA (${data.weekStart} — ${data.weekEnd}):
- Celkem registrací: ${data.totalRegistrations.total} (FREE: ${data.totalRegistrations.free}, GOLD: ${data.totalRegistrations.gold}, DIAMOND: ${data.totalRegistrations.diamond})
- Email captures: ${data.totalEmails}
- Noví affiliate partneři: ${data.totalAffiliatePartners}
- Affiliate kliky: ${data.totalAffiliateClicks}
- Odhadovaný příjem: ${data.estimatedRevenue} Kč
- Top zdroje: ${data.topSources.map(s => `${s.source} (${s.count})`).join(", ") || "N/A"}
- A/B testy: ${data.abTestSummary.map(t => `${t.variant}: CTR ${t.ctr}%, CVR ${t.cvr}%`).join("; ") || "N/A"}
- Denní trend: ${data.dailyTrend.map(d => `${d.date}: ${d.registrations} reg`).join(", ") || "N/A"}

Zaměř se na:
1. Co funguje a co ne
2. Kde jsou příležitosti ke zvýšení konverzí
3. Jak optimalizovat affiliate program
4. Konkrétní akční kroky na příští týden
5. Odhad potenciálu růstu

Odpověz česky, stručně a akčně. Používej Hormozi principy (Value Equation, Grand Slam Offer).`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Jsi strategický business poradce specializovaný na performance marketing a AI produkty. Odpovídáš česky." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : "Strategická doporučení nejsou momentálně dostupná.";
  } catch (error) {
    console.error("[WeeklyReport] LLM error:", error);
    return "Strategická doporučení nejsou momentálně dostupná (chyba LLM).";
  }
}

/** Format daily report content */
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
    const sorted = [...data.abTestSummary].sort((a, b) => parseFloat(b.cvr) - parseFloat(a.cvr));
    if (sorted[0] && parseFloat(sorted[0].cvr) > 0) {
      lines.push(`  ✅ Doporučení: Varianta "${sorted[0].variant}" má nejlepší CVR (${sorted[0].cvr}%)`);
    }
  }

  lines.push(``, `---`, `Automatický report z BOTHUB.cz`);
  return lines.join("\n");
}

/** Format weekly report content */
export function formatWeeklyReportContent(data: WeeklyReportData, recommendations: string): string {
  const lines: string[] = [
    `📊 BOTHUB.cz — TÝDENNÍ STRATEGICKÝ SOUHRN`,
    `📅 ${data.weekStart} — ${data.weekEnd}`,
    ``,
    `═══════════════════════════════`,
    `📋 REGISTRACE ZA TÝDEN: ${data.totalRegistrations.total}`,
    `  • FREE: ${data.totalRegistrations.free}`,
    `  • GOLD: ${data.totalRegistrations.gold}`,
    `  • DIAMOND: ${data.totalRegistrations.diamond}`,
    ``,
    `💰 ODHADOVANÝ PŘÍJEM: ${data.estimatedRevenue.toLocaleString("cs-CZ")} Kč`,
    ``,
    `📧 Email captures: ${data.totalEmails}`,
    `🤝 Noví affiliate partneři: ${data.totalAffiliatePartners}`,
    `🔗 Affiliate kliky: ${data.totalAffiliateClicks}`,
    ``,
    `📈 DENNÍ TREND:`,
  ];

  for (const d of data.dailyTrend) {
    lines.push(`  ${d.date}: ${d.registrations} registrací, ${d.emails} emailů`);
  }

  if (data.topSources.length > 0) {
    lines.push(``, `📍 TOP ZDROJE:`);
    for (const s of data.topSources) {
      lines.push(`  ${s.source}: ${s.count} registrací`);
    }
  }

  if (data.abTestSummary.length > 0) {
    lines.push(``, `🧪 A/B TESTY:`);
    for (const t of data.abTestSummary) {
      lines.push(`  ${t.variant}: CTR ${t.ctr}%, CVR ${t.cvr}% (${t.impressions} impresí)`);
    }
  }

  lines.push(
    ``,
    `═══════════════════════════════`,
    `🧠 STRATEGICKÁ DOPORUČENÍ (AI):`,
    ``,
    recommendations,
    ``,
    `═══════════════════════════════`,
    `Automatický týdenní souhrn z BOTHUB.cz`,
  );

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

    if (success) console.log(`[DailyReport] Report sent successfully for ${data.date}`);
    else console.warn(`[DailyReport] Failed to send report for ${data.date}`);

    return success;
  } catch (error) {
    console.error("[DailyReport] Error generating report:", error);
    return false;
  }
}

/** Send weekly strategic report as owner notification */
export async function sendWeeklyReport(): Promise<boolean> {
  try {
    const data = await generateWeeklyReport();
    if (!data) {
      console.warn("[WeeklyReport] No database available, skipping report");
      return false;
    }

    const recommendations = await generateStrategicRecommendations(data);
    const content = formatWeeklyReportContent(data, recommendations);

    const success = await notifyOwner({
      title: `📊 Týdenní souhrn BOTHUB.cz — ${data.weekStart} až ${data.weekEnd}`,
      content,
    });

    if (success) console.log(`[WeeklyReport] Report sent successfully for ${data.weekStart}-${data.weekEnd}`);
    else console.warn(`[WeeklyReport] Failed to send report for ${data.weekStart}-${data.weekEnd}`);

    return success;
  } catch (error) {
    console.error("[WeeklyReport] Error generating report:", error);
    return false;
  }
}
