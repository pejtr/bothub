/**
 * Analytics Report Generator
 * Generates daily and weekly reports with AI-powered strategic summaries
 */
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";
import {
  users,
  subscriptions,
  conversationLogs,
  userFeedback,
  dailyReports,
  chatTriggerEvents,
  emailSubscribers,
} from "../../drizzle/schema";
import { and, gte, lt, sql, desc, eq } from "drizzle-orm";

export interface ReportMetrics {
  newUsers: number;
  activeUsers: number;
  newSubscriptions: number;
  revenue: number;
  chatSessions: number;
  avgRating: number;
  topBots: Array<{ botId: string; sessions: number; avgRating: number }>;
}

/**
 * Collect metrics for a given date range
 */
export async function collectMetrics(
  startDate: Date,
  endDate: Date
): Promise<ReportMetrics> {
  const db = await getDb();
  if (!db) return { newUsers: 0, activeUsers: 0, newSubscriptions: 0, revenue: 0, chatSessions: 0, avgRating: 0, topBots: [] };

  // New users
  const newUsersResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(and(gte(users.createdAt, startDate), lt(users.createdAt, endDate)));
  const newUsers = Number(newUsersResult[0]?.count || 0);

  // Active users (signed in during period)
  const activeUsersResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(and(gte(users.lastSignedIn, startDate), lt(users.lastSignedIn, endDate)));
  const activeUsers = Number(activeUsersResult[0]?.count || 0);

  // New subscriptions
  const newSubsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(subscriptions)
    .where(and(gte(subscriptions.createdAt, startDate), lt(subscriptions.createdAt, endDate), eq(subscriptions.status, "active")));
  const newSubscriptions = Number(newSubsResult[0]?.count || 0);

  // Revenue estimate (active subscriptions * plan price)
  // GOLD = 99000 haléřů, DIAMOND = 249000 haléřů
  const activeSubs = await db
    .select({ planId: subscriptions.planId, count: sql<number>`COUNT(*)` })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"))
    .groupBy(subscriptions.planId);
  const revenue = activeSubs.reduce((sum, s) => {
    const price = s.planId === "diamond" ? 249000 : s.planId === "gold" ? 99000 : 0;
    return sum + price * Number(s.count);
  }, 0);

  // Chat sessions
  const chatSessionsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(conversationLogs)
    .where(and(gte(conversationLogs.createdAt, startDate), lt(conversationLogs.createdAt, endDate)));
  const chatSessions = Number(chatSessionsResult[0]?.count || 0);

  // Average rating (stored as 10x integer)
  const ratingResult = await db
    .select({ avg: sql<number>`AVG(${userFeedback.rating})` })
    .from(userFeedback)
    .where(and(gte(userFeedback.createdAt, startDate), lt(userFeedback.createdAt, endDate)));
  const avgRating = Math.round(Number(ratingResult[0]?.avg || 0) * 10);

  // Top bots by session count
  const topBotsResult = await db
    .select({
      botId: conversationLogs.botId,
      sessions: sql<number>`COUNT(*)`,
    })
    .from(conversationLogs)
    .where(and(gte(conversationLogs.createdAt, startDate), lt(conversationLogs.createdAt, endDate)))
    .groupBy(conversationLogs.botId)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(5);

  const topBots = topBotsResult.map(b => ({
    botId: b.botId,
    sessions: Number(b.sessions),
    avgRating: 0,
  }));

  return { newUsers, activeUsers, newSubscriptions, revenue, chatSessions, avgRating, topBots };
}

/**
 * Generate AI-powered strategic summary
 */
export async function generateAISummary(
  metrics: ReportMetrics,
  reportType: "daily" | "weekly",
  previousMetrics?: Partial<ReportMetrics>
): Promise<{ summary: string; recommendations: string }> {
  try {
    const period = reportType === "daily" ? "dnešní den" : "tento týden";
    const revenueKc = (metrics.revenue / 100).toFixed(0);
    const avgRatingDisplay = metrics.avgRating > 0 ? (metrics.avgRating / 10).toFixed(1) : "N/A";

    const prompt = `Jsi analytik pro iBots.cz - platformu prémiových AI chatbotů. Analyzuj ${period} metriky a poskytni strategická doporučení.

METRIKY:
- Noví uživatelé: ${metrics.newUsers}
- Aktivní uživatelé: ${metrics.activeUsers}
- Nové předplatné: ${metrics.newSubscriptions}
- Odhadované MRR: ${revenueKc} Kč
- Chat sezení: ${metrics.chatSessions}
- Průměrné hodnocení: ${avgRatingDisplay}/5
- Top boti: ${metrics.topBots.map(b => b.botId).join(", ") || "žádná data"}
${previousMetrics ? `
SROVNÁNÍ S PŘEDCHOZÍM OBDOBÍM:
- Předchozí noví uživatelé: ${previousMetrics.newUsers || 0}
- Předchozí chat sezení: ${previousMetrics.chatSessions || 0}` : ""}

Poskytni:
1. SOUHRN (2-3 věty): Klíčové poznatky z metrik
2. DOPORUČENÍ (3 konkrétní akce): Co dělat pro zvýšení konverzí a příjmů

Odpovídej v češtině, stručně a akčně. Inspiruj se Alex Hormozi přístupem - fokus na ROI a konkrétní kroky.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Jsi expert na growth marketing a analytiku pro SaaS platformy. Odpovídáš stručně, konkrétně a akčně." },
        { role: "user", content: prompt },
      ],
    });

    const content = String(response.choices[0]?.message?.content || "");
    
    // Split into summary and recommendations
    const summaryMatch = content.match(/SOUHRN[:\s]+([\s\S]*?)(?=DOPORUČENÍ|$)/i);
    const recMatch = content.match(/DOPORUČENÍ[:\s]+([\s\S]*?)$/i);
    
    return {
      summary: summaryMatch?.[1]?.trim() || content.substring(0, 300),
      recommendations: recMatch?.[1]?.trim() || "",
    };
  } catch (error) {
    console.error("[ReportGenerator] AI summary failed:", error);
    return {
      summary: "Report vygenerován automaticky. AI souhrn není k dispozici.",
      recommendations: "",
    };
  }
}

/**
 * Generate and save a daily report
 */
export async function generateDailyReport(date?: Date): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const reportDate = date || new Date();
  const dateStr = reportDate.toISOString().split("T")[0];
  
  // Check if report already exists
  const existing = await db
    .select({ id: dailyReports.id })
    .from(dailyReports)
    .where(and(eq(dailyReports.reportDate, dateStr), eq(dailyReports.reportType, "daily")))
    .limit(1);
  
  if (existing.length > 0) {
    console.log(`[ReportGenerator] Daily report for ${dateStr} already exists`);
    return;
  }

  const startDate = new Date(reportDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(reportDate);
  endDate.setHours(23, 59, 59, 999);

  const metrics = await collectMetrics(startDate, endDate);
  const { summary, recommendations } = await generateAISummary(metrics, "daily");

  await db.insert(dailyReports).values({
    reportDate: dateStr,
    reportType: "daily",
    newUsers: metrics.newUsers,
    activeUsers: metrics.activeUsers,
    newSubscriptions: metrics.newSubscriptions,
    revenue: metrics.revenue,
    chatSessions: metrics.chatSessions,
    avgRating: metrics.avgRating,
    topBotsJson: JSON.stringify(metrics.topBots),
    aiSummary: summary,
    strategicRecommendations: recommendations,
  });

  // Notify owner
  const revenueKc = (metrics.revenue / 100).toFixed(0);
  await notifyOwner({
    title: `📊 Denní report iBots - ${dateStr}`,
    content: `**Nový uživatelé:** ${metrics.newUsers} | **Chat sezení:** ${metrics.chatSessions} | **MRR:** ${revenueKc} Kč\n\n${summary}\n\n**Doporučení:**\n${recommendations}`,
  });

  console.log(`[ReportGenerator] Daily report generated for ${dateStr}`);
}

/**
 * Generate and save a weekly report
 */
export async function generateWeeklyReport(weekStartDate?: Date): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const startDate = weekStartDate || (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  endDate.setHours(23, 59, 59, 999);

  const dateStr = startDate.toISOString().split("T")[0];

  // Check if report already exists
  const existing = await db
    .select({ id: dailyReports.id })
    .from(dailyReports)
    .where(and(eq(dailyReports.reportDate, dateStr), eq(dailyReports.reportType, "weekly")))
    .limit(1);
  
  if (existing.length > 0) {
    console.log(`[ReportGenerator] Weekly report for week of ${dateStr} already exists`);
    return;
  }

  const metrics = await collectMetrics(startDate, endDate);
  
  // Get previous week for comparison
  const prevStart = new Date(startDate);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevEnd = new Date(startDate);
  prevEnd.setHours(23, 59, 59, 999);
  const prevMetrics = await collectMetrics(prevStart, prevEnd);

  const { summary, recommendations } = await generateAISummary(metrics, "weekly", prevMetrics);

  await db.insert(dailyReports).values({
    reportDate: dateStr,
    reportType: "weekly",
    newUsers: metrics.newUsers,
    activeUsers: metrics.activeUsers,
    newSubscriptions: metrics.newSubscriptions,
    revenue: metrics.revenue,
    chatSessions: metrics.chatSessions,
    avgRating: metrics.avgRating,
    topBotsJson: JSON.stringify(metrics.topBots),
    aiSummary: summary,
    strategicRecommendations: recommendations,
  });

  // Notify owner with weekly summary
  const revenueKc = (metrics.revenue / 100).toFixed(0);
  const growthUsers = metrics.newUsers - (prevMetrics.newUsers || 0);
  const growthSessions = metrics.chatSessions - (prevMetrics.chatSessions || 0);
  
  await notifyOwner({
    title: `📈 Týdenní report iBots - týden od ${dateStr}`,
    content: `**Noví uživatelé:** ${metrics.newUsers} (${growthUsers >= 0 ? "+" : ""}${growthUsers} vs minulý týden)\n**Chat sezení:** ${metrics.chatSessions} (${growthSessions >= 0 ? "+" : ""}${growthSessions})\n**MRR:** ${revenueKc} Kč\n\n**AI Souhrn:**\n${summary}\n\n**Strategická doporučení:**\n${recommendations}`,
  });

  console.log(`[ReportGenerator] Weekly report generated for week of ${dateStr}`);
}
