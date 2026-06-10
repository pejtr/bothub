/**
 * Admin Analytics Dashboard - Enhanced with Chart.js Visualizations
 * Tracks: KPIs, A/B tests, Affiliate performance, Chatbot engagement, Email sequence
 * Access: Admin role only
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Activity,
  Mail,
  Shield,
  Loader2,
  BarChart3,
  MessageSquare,
  ArrowLeft,
  Crown,
  DollarSign,
  Eye,
  MousePointerClick,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  GitCompareArrows,
  Search,
  X,
  Check,
  Star,
  FileText,
  ThumbsUp,
  Calendar,
  Zap,
  Target,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut, Chart } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart.js global defaults for dark theme
ChartJS.defaults.color = "#9CA3AF";
ChartJS.defaults.borderColor = "rgba(42, 42, 47, 0.5)";
ChartJS.defaults.font.family = "'Inter', system-ui, sans-serif";

type TabId = "overview" | "abtest" | "affiliate" | "chatbot" | "comparison" | "email" | "reports" | "feedback" | "intelligence";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Přehled", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "abtest", label: "A/B Testy", icon: <Eye className="w-4 h-4" /> },
  { id: "affiliate", label: "Affiliate", icon: <DollarSign className="w-4 h-4" /> },
  { id: "chatbot", label: "Chatbot", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "comparison", label: "Porovnání botů", icon: <GitCompareArrows className="w-4 h-4" /> },
  { id: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
  { id: "reports", label: "Reporty", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "feedback", label: "Zpětná vazba", icon: <Star className="w-4 h-4" /> },
  { id: "intelligence", label: "Intelligence", icon: <Zap className="w-4 h-4" /> },
];

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Přístup odepřen</h2>
          <p className="text-gray-400 mb-6">Pro přístup do admin dashboardu se musíte přihlásit.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-[#D4AF37] text-[#0A0A0F] hover:bg-[#B8860B]">Přihlásit se</Button>
          </a>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Nedostatečná oprávnění</h2>
          <p className="text-gray-400 mb-6">Tato sekce je přístupná pouze pro administrátory.</p>
          <Link href="/">
            <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Zpět na hlavní stránku
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <header className="bg-[#0A0A0F]/80 backdrop-blur-lg border-b border-[#2A2A2F] sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1" /> iBots
              </Button>
            </Link>
            <div className="w-px h-6 bg-[#2A2A2F]" />
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#D4AF37]" />
              <span className="font-bold text-lg">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Date range selector */}
            <div className="flex items-center gap-1 bg-[#1A1A1F] rounded-lg p-1 border border-[#2A2A2F]">
              {(["7d", "30d", "90d", "all"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDateRange(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dateRange === d
                      ? "bg-[#D4AF37] text-[#0A0A0F]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {d === "all" ? "Vše" : d}
                </button>
              ))}
            </div>
            <Badge variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">
              {user?.name || "Admin"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-[#2A2A2F]">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "text-gray-400 hover:text-white hover:bg-[#1A1A1F]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === "overview" && <OverviewTab dateRange={dateRange} />}
        {activeTab === "abtest" && <ABTestTab />}
        {activeTab === "affiliate" && <AffiliateTab dateRange={dateRange} />}
        {activeTab === "chatbot" && <ChatbotTab />}
        {activeTab === "comparison" && <ComparisonTab dateRange={dateRange} />}
        {activeTab === "email" && <EmailTab />}
        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "feedback" && <FeedbackTab />}
        {activeTab === "intelligence" && <IntelligenceTab />}
      </div>
    </div>
  );
}

// ============ Overview Tab ============
function OverviewTab({ dateRange }: { dateRange: "7d" | "30d" | "90d" | "all" }) {
  const daysMap = { "7d": 7, "30d": 30, "90d": 90, "all": 365 };
  const days = daysMap[dateRange];
  const { data, isLoading } = trpc.adminAnalytics.overview.useQuery({ days });
  const { data: subBreakdown } = trpc.adminAnalytics.subscriptionBreakdown.useQuery();

  if (isLoading) return <LoadingState />;

  const kpis = [
    { label: "Uživatelé", value: data?.totalUsers || 0, icon: <Users className="w-5 h-5" />, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Odběratelé", value: data?.totalSubscribers || 0, icon: <Mail className="w-5 h-5" />, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Aktivní předplatné", value: data?.totalSubscriptions || 0, icon: <Crown className="w-5 h-5" />, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
    { label: "MRR odhad", value: `${(data?.revenueEstimate || 0).toLocaleString()} Kč`, icon: <DollarSign className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Affiliate partneři", value: data?.totalAffiliates || 0, icon: <TrendingUp className="w-5 h-5" />, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Chat eventy", value: data?.totalChatEvents || 0, icon: <MessageSquare className="w-5 h-5" />, color: "text-orange-400", bg: "bg-orange-400/10" },
  ];

  // User growth chart data
  const userGrowthData = {
    labels: (data?.userGrowth || []).map((d) => {
      const date = new Date(d.date);
      return `${date.getDate()}.${date.getMonth() + 1}.`;
    }),
    datasets: [
      {
        label: "Noví uživatelé",
        data: (data?.userGrowth || []).map((d) => d.count),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#3B82F6",
      },
    ],
  };

  // Subscriber growth chart data
  const subscriberGrowthData = {
    labels: (data?.subscriberGrowth || []).map((d) => {
      const date = new Date(d.date);
      return `${date.getDate()}.${date.getMonth() + 1}.`;
    }),
    datasets: [
      {
        label: "Noví odběratelé",
        data: (data?.subscriberGrowth || []).map((d) => d.count),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#10B981",
      },
    ],
  };

  // Chat events trend
  const chatTrendData = {
    labels: (data?.chatEventsTrend || []).map((d) => {
      const date = new Date(d.date);
      return `${date.getDate()}.${date.getMonth() + 1}.`;
    }),
    datasets: [
      {
        label: "Triggery",
        data: (data?.chatEventsTrend || []).map((d) => d.count),
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#F59E0B",
      },
      {
        label: "Interakce",
        data: (data?.chatEventsTrend || []).map((d) => d.interacted),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#8B5CF6",
      },
    ],
  };

  // Subscription breakdown doughnut
  const planColors: Record<string, string> = {
    gold: "#D4AF37",
    diamond: "#60A5FA",
    heritage_addon: "#A78BFA",
    free: "#6B7280",
  };
  const planLabels: Record<string, string> = {
    gold: "GOLD",
    diamond: "DIAMOND",
    heritage_addon: "Heritage",
    free: "FREE",
  };

  const subBreakdownData = {
    labels: (subBreakdown?.plans || []).map((p) => planLabels[p.planId] || p.planId),
    datasets: [
      {
        data: (subBreakdown?.plans || []).map((p) => p.count),
        backgroundColor: (subBreakdown?.plans || []).map((p) => planColors[p.planId] || "#6B7280"),
        borderColor: "#0A0A0F",
        borderWidth: 3,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1A1A1F",
        borderColor: "#2A2A2F",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "#9CA3AF",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 8, font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(42, 42, 47, 0.3)" },
        ticks: { font: { size: 11 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { size: 12 } },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
            <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color} mb-3`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-bold text-white">{typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: User Growth + Subscriber Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Růst uživatelů
            </h3>
            <span className="text-xs text-gray-500">Posledních {dateRange} dní</span>
          </div>
          <div style={{ height: "240px" }}>
            {(data?.userGrowth || []).length > 0 ? (
              <Line data={userGrowthData} options={lineChartOptions} />
            ) : (
              <EmptyChart message="Zatím žádná data o uživatelích" />
            )}
          </div>
        </Card>

        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-400" /> Růst odběratelů
            </h3>
            <span className="text-xs text-gray-500">Posledních {dateRange} dní</span>
          </div>
          <div style={{ height: "240px" }}>
            {(data?.subscriberGrowth || []).length > 0 ? (
              <Line data={subscriberGrowthData} options={lineChartOptions} />
            ) : (
              <EmptyChart message="Zatím žádná data o odběratelích" />
            )}
          </div>
        </Card>
      </div>

      {/* Charts Row 2: Chat Trend + Subscription Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#D4AF37]" /> Chatbot aktivita
            </h3>
            <span className="text-xs text-gray-500">Triggery vs Interakce</span>
          </div>
          <div style={{ height: "240px" }}>
            {(data?.chatEventsTrend || []).length > 0 ? (
              <Line data={chatTrendData} options={{
                ...lineChartOptions,
                plugins: {
                  ...lineChartOptions.plugins,
                  legend: { display: true, position: "top" as const, labels: { usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } } },
                },
              }} />
            ) : (
              <EmptyChart message="Zatím žádná chatbot data" />
            )}
          </div>
        </Card>

        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#D4AF37]" /> Předplatné
            </h3>
          </div>
          <div style={{ height: "240px" }}>
            {(subBreakdown?.plans || []).length > 0 ? (
              <Doughnut data={subBreakdownData} options={doughnutOptions} />
            ) : (
              <EmptyChart message="Zatím žádná předplatná" />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============ A/B Test Tab ============
function ABTestTab() {
  const { data, isLoading } = trpc.adminAnalytics.abTestResults.useQuery();

  if (isLoading) return <LoadingState />;

  if (!data?.tests || data.tests.length === 0) {
    return <EmptyState icon={<Eye className="w-12 h-12" />} message="Zatím žádné A/B testy." />;
  }

  const variantColors: Record<string, string> = {
    control: "#6B7280",
    variant_b: "#D4AF37",
    variant_c: "#3B82F6",
  };
  const variantLabels: Record<string, string> = {
    control: "Control (A)",
    variant_b: "Varianta B",
    variant_c: "Varianta C",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Eye className="w-5 h-5 text-[#D4AF37]" /> A/B Test Výsledky
      </h2>

      {data.tests.map((test) => {
        // Find winner
        const maxRate = Math.max(...test.variants.map((v) => v.conversionRate));
        const winner = test.variants.find((v) => v.conversionRate === maxRate && v.total >= 10);

        // Bar chart data
        const barData = {
          labels: test.variants.map((v) => variantLabels[v.variant] || v.variant),
          datasets: [
            {
              label: "Konverzní poměr (%)",
              data: test.variants.map((v) => Number(v.conversionRate.toFixed(1))),
              backgroundColor: test.variants.map((v) => variantColors[v.variant] || "#6B7280"),
              borderRadius: 6,
              barThickness: 40,
            },
          ],
        };

        const barOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#1A1A1F",
              borderColor: "#2A2A2F",
              borderWidth: 1,
              titleColor: "#fff",
              bodyColor: "#9CA3AF",
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (ctx: any) => `Konverze: ${ctx.raw}%`,
              },
            },
          },
          scales: {
            x: { grid: { display: false } },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(42, 42, 47, 0.3)" },
              ticks: { callback: (val: any) => `${val}%` },
            },
          },
        };

        return (
          <Card key={test.testName} className="bg-[#1A1A1F] border-[#2A2A2F] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-lg">{test.testName}</h3>
                <p className="text-sm text-gray-400">
                  {test.totalVisitors} návštěvníků | {test.totalConversions} konverzí
                </p>
              </div>
              {winner && (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Winner: {variantLabels[winner.variant] || winner.variant}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart */}
              <div style={{ height: "200px" }}>
                <Bar data={barData} options={barOptions} />
              </div>

              {/* Variant details */}
              <div className="space-y-3">
                {test.variants.map((v) => {
                  const isWinner = winner && v.variant === winner.variant;
                  return (
                    <div
                      key={v.variant}
                      className={`p-3 rounded-lg border ${
                        isWinner ? "border-green-500/30 bg-green-500/5" : "border-[#2A2A2F] bg-[#0A0A0F]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: variantColors[v.variant] || "#6B7280" }}
                          />
                          <span className="text-sm font-medium text-white">
                            {variantLabels[v.variant] || v.variant}
                          </span>
                          {isWinner && (
                            <Badge className="bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0">
                              WINNER
                            </Badge>
                          )}
                        </div>
                        <span className={`text-lg font-bold ${isWinner ? "text-green-400" : "text-white"}`}>
                          {v.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>{v.total} návštěvníků</span>
                        <span>{v.converted} konverzí</span>
                        <span>{v.totalValue.toLocaleString()} Kč</span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 w-full bg-[#2A2A2F] rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${maxRate > 0 ? (v.conversionRate / maxRate) * 100 : 0}%`,
                            backgroundColor: variantColors[v.variant] || "#6B7280",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ============ Affiliate Tab ============
function AffiliateTab({ dateRange }: { dateRange: "7d" | "30d" | "90d" | "all" }) {
  const daysMap = { "7d": 7, "30d": 30, "90d": 90, "all": 365 };
  const days = daysMap[dateRange];
  const { data, isLoading } = trpc.adminAnalytics.affiliatePerformance.useQuery();
  const { data: clicksTrend } = trpc.adminAnalytics.affiliateClicksTrend.useQuery({ days });

  if (isLoading) return <LoadingState />;

  // Clicks trend line chart
  const clicksTrendData = {
    labels: (clicksTrend?.trend || []).map((d) => {
      const date = new Date(d.date);
      return `${date.getDate()}.${date.getMonth() + 1}.`;
    }),
    datasets: [
      {
        label: "Kliky",
        data: (clicksTrend?.trend || []).map((d) => d.count),
        borderColor: "#D4AF37",
        backgroundColor: "rgba(212, 175, 55, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#D4AF37",
      },
    ],
  };

  // Source breakdown doughnut
  const sourceColors: Record<string, string> = {
    ibots: "#D4AF37",
    bothub: "#3B82F6",
    unknown: "#6B7280",
  };

  const sourceBreakdownData = {
    labels: (clicksTrend?.sourceBreakdown || []).map((s) => s.source === "ibots" ? "iBots" : s.source === "bothub" ? "BotHub" : s.source),
    datasets: [
      {
        data: (clicksTrend?.sourceBreakdown || []).map((s) => s.count),
        backgroundColor: (clicksTrend?.sourceBreakdown || []).map((s) => sourceColors[s.source] || "#6B7280"),
        borderColor: "#0A0A0F",
        borderWidth: 3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#1A1A1F", borderColor: "#2A2A2F", borderWidth: 1, titleColor: "#fff", bodyColor: "#9CA3AF", padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 11 } } },
      y: { beginAtZero: true, grid: { color: "rgba(42, 42, 47, 0.3)" }, ticks: { font: { size: 11 } } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { position: "bottom" as const, labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { size: 12 } } },
    },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-[#D4AF37]" /> Affiliate Výkonnost
      </h2>

      {/* Totals */}
      {data?.totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
            <Users className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{data.totals.totalPartners}</p>
            <p className="text-xs text-gray-400">Partnerů</p>
          </Card>
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
            <MousePointerClick className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{data.totals.totalClicks.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Kliků</p>
          </Card>
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
            <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{data.totals.totalConversions}</p>
            <p className="text-xs text-gray-400">Konverzí</p>
          </Card>
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
            <DollarSign className="w-5 h-5 text-[#D4AF37] mb-2" />
            <p className="text-2xl font-bold text-[#D4AF37]">{data.totals.totalCommissions.toLocaleString()} Kč</p>
            <p className="text-xs text-gray-400">Provize celkem</p>
          </Card>
        </div>
      )}

      {/* Charts: Clicks Trend + Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-[#D4AF37]" /> Trend kliků
            </h3>
            <span className="text-xs text-gray-500">Posledních {dateRange} dní</span>
          </div>
          <div style={{ height: "220px" }}>
            {(clicksTrend?.trend || []).length > 0 ? (
              <Line data={clicksTrendData} options={lineOptions} />
            ) : (
              <EmptyChart message="Zatím žádné affiliate kliky" />
            )}
          </div>
        </Card>

        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Zdroje
            </h3>
          </div>
          <div style={{ height: "220px" }}>
            {(clicksTrend?.sourceBreakdown || []).length > 0 ? (
              <Doughnut data={sourceBreakdownData} options={doughnutOptions} />
            ) : (
              <EmptyChart message="Zatím žádná data" />
            )}
          </div>
        </Card>
      </div>

      {/* Partners Table */}
      {data?.partners && data.partners.length > 0 && (
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2F] flex items-center justify-between">
            <h3 className="font-bold text-white">Top affiliate partneři</h3>
            <Badge variant="outline" className="border-[#2A2A2F] text-gray-400">
              {data.partners.length} partnerů
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2F] bg-[#0A0A0F]/50">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">#</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Kód</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Kliky</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Konverze</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">CR</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Tržby</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Provize</th>
                </tr>
              </thead>
              <tbody>
                {data.partners.map((p, i) => (
                  <tr key={p.id} className="border-b border-[#2A2A2F]/50 hover:bg-[#2A2A2F]/20">
                    <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                    <td className="py-3 px-4 font-mono text-[#D4AF37] text-xs">{p.affiliateCode}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          p.status === "active"
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-300">{p.clicks.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-gray-300">{p.conversions}</td>
                    <td className="text-right py-3 px-4">
                      <span className={`font-bold ${p.conversionRate > 5 ? "text-green-400" : "text-gray-400"}`}>
                        {p.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-300">{p.totalSales.toLocaleString()} Kč</td>
                    <td className="text-right py-3 px-4 text-[#D4AF37]">{Number(p.totalEarnings).toLocaleString()} Kč</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {(!data?.partners || data.partners.length === 0) && (
        <EmptyState icon={<DollarSign className="w-12 h-12" />} message="Zatím žádní affiliate partneři." />
      )}
    </div>
  );
}

// ============ Chatbot Tab ============
function ChatbotTab() {
  const { data, isLoading } = trpc.adminAnalytics.chatbotEngagement.useQuery();

  if (isLoading) return <LoadingState />;

  // Trigger type bar chart
  const triggerBarData = {
    labels: (data?.triggers || []).map((t) => t.eventType.replace(/_/g, " ")),
    datasets: [
      {
        label: "Zobrazení",
        data: (data?.triggers || []).map((t) => t.total),
        backgroundColor: "rgba(212, 175, 55, 0.6)",
        borderRadius: 4,
      },
      {
        label: "Interakce",
        data: (data?.triggers || []).map((t) => t.interacted),
        backgroundColor: "rgba(139, 92, 246, 0.6)",
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" as const, labels: { usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } } },
      tooltip: { backgroundColor: "#1A1A1F", borderColor: "#2A2A2F", borderWidth: 1, titleColor: "#fff", bodyColor: "#9CA3AF", padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { beginAtZero: true, grid: { color: "rgba(42, 42, 47, 0.3)" } },
    },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-purple-400" /> Chatbot Engagement
      </h2>

      {/* Totals */}
      {data?.totals && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-4 text-center">
            <Activity className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{data.totals.totalEvents}</p>
            <p className="text-xs text-gray-400">Trigger eventů</p>
          </Card>
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-4 text-center">
            <MessageSquare className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{data.totals.totalInteractions}</p>
            <p className="text-xs text-gray-400">Interakcí</p>
          </Card>
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-4 text-center">
            <TrendingUp className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#D4AF37]">{data.totals.interactionRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">Míra interakce</p>
          </Card>
        </div>
      )}

      {/* Trigger Performance Chart */}
      {data?.triggers && data.triggers.length > 0 ? (
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#D4AF37]" /> Výkon triggerů
          </h3>
          <div style={{ height: "280px" }}>
            <Bar data={triggerBarData} options={barOptions} />
          </div>
        </Card>
      ) : (
        <EmptyState icon={<MessageSquare className="w-12 h-12" />} message="Zatím žádné chatbot trigger eventy." />
      )}

      {/* Trigger Details Table */}
      {data?.triggers && data.triggers.length > 0 && (
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2F]">
            <h3 className="font-bold text-white">Detail triggerů</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2F] bg-[#0A0A0F]/50">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Typ triggeru</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Nabídnutý iBot</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Zobrazení</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Interakce</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Míra interakce</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Výkon</th>
                </tr>
              </thead>
              <tbody>
                {data.triggers.map((t, i) => {
                  const maxRate = Math.max(...data.triggers.map((x) => x.interactionRate));
                  return (
                    <tr key={i} className="border-b border-[#2A2A2F]/50 hover:bg-[#2A2A2F]/20">
                      <td className="py-3 px-4">
                        <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded">
                          {t.eventType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{t.botTriggered || "—"}</td>
                      <td className="text-right py-3 px-4 text-gray-300">{t.total}</td>
                      <td className="text-right py-3 px-4 text-gray-300">{t.interacted}</td>
                      <td className="text-right py-3 px-4">
                        <span className={`font-bold ${t.interactionRate > 10 ? "text-green-400" : "text-gray-400"}`}>
                          {t.interactionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="w-20 bg-[#2A2A2F] rounded-full h-2 ml-auto">
                          <div
                            className="h-2 rounded-full bg-[#D4AF37]"
                            style={{ width: `${maxRate > 0 ? (t.interactionRate / maxRate) * 100 : 0}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============ Email Tab ============
function EmailTab() {
  const { data, isLoading } = trpc.adminAnalytics.emailStats.useQuery();


  if (isLoading) return <LoadingState />;

  // Sequence funnel visualization
  const sequenceEmails = data?.sequenceSummary?.emails || [];
  const funnelData = {
    labels: sequenceEmails.map((e: any) => `Den ${e.dayOffset}`),
    datasets: [
      {
        label: "Sekvence emailů",
        data: sequenceEmails.map((_: any, i: number) => sequenceEmails.length - i),
        backgroundColor: sequenceEmails.map((_: any, i: number) => {
          const opacity = 1 - i * 0.15;
          return `rgba(212, 175, 55, ${opacity})`;
        }),
        borderRadius: 4,
        barThickness: 30,
      },
    ],
  };

  const funnelOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1A1A1F",
        borderColor: "#2A2A2F",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "#9CA3AF",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => {
            const email = sequenceEmails[ctx.dataIndex];
            return email ? email.subject : "";
          },
        },
      },
    },
    scales: {
      x: { display: false },
      y: { grid: { display: false } },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-400" /> Email Welcome Sekvence
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
          <Mail className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">{data?.totalSubscribers || 0}</p>
          <p className="text-xs text-gray-400">Celkem odběratelů</p>
        </Card>
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
          <Activity className="w-5 h-5 text-[#D4AF37] mb-2" />
          <p className="text-2xl font-bold text-white">{data?.sequenceSummary?.totalEmails || 5}</p>
          <p className="text-xs text-gray-400">Emailů v sekvenci</p>
        </Card>
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
          <TrendingUp className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">7</p>
          <p className="text-xs text-gray-400">Dní sekvence</p>
        </Card>
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
          <Crown className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-white">
            {data?.sequenceSummary?.emails?.filter((e: any) => e.tags?.includes("upsell")).length || 0}
          </p>
          <p className="text-xs text-gray-400">Upsell emailů</p>
        </Card>
      </div>

      {/* Funnel Chart + Sequence Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#D4AF37]" /> Sekvence funnel
          </h3>
          <div style={{ height: "220px" }}>
            {sequenceEmails.length > 0 ? (
              <Bar data={funnelData} options={funnelOptions} />
            ) : (
              <EmptyChart message="Žádná sekvence" />
            )}
          </div>
        </Card>

        {/* Sequence Detail */}
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
          <h3 className="font-bold text-white mb-4">Sekvence emailů</h3>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {sequenceEmails.map((email: any, i: number) => (
              <div key={email.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0A0A0F]/50">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-xs shrink-0">
                  D{email.dayOffset}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{email.subject}</p>
                  <div className="flex gap-1 mt-0.5">
                    {email.tags?.map((tag: string) => (
                      <span key={tag} className="text-[9px] bg-[#2A2A2F] text-gray-400 px-1 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Subscribers */}
      {data?.recentSubscribers && data.recentSubscribers.length > 0 && (
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2F] flex items-center justify-between">
            <h3 className="font-bold text-white">Nedávní odběratelé</h3>
            <Badge variant="outline" className="border-[#2A2A2F] text-gray-400">
              {data.totalSubscribers} celkem
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2F] bg-[#0A0A0F]/50">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Jméno</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Zdroj</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Datum</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSubscribers.map((sub: any, i: number) => (
                  <tr key={i} className="border-b border-[#2A2A2F]/50 hover:bg-[#2A2A2F]/20">
                    <td className="py-3 px-4 text-white">{sub.email}</td>
                    <td className="py-3 px-4 text-gray-300">{sub.name || "—"}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-[#2A2A2F] text-gray-400 px-2 py-1 rounded">{sub.source}</span>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString("cs-CZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {(!data?.recentSubscribers || data.recentSubscribers.length === 0) && (
        <EmptyState icon={<Mail className="w-12 h-12" />} message="Zatím žádní odběratelé." />
      )}
    </div>
  );
}

// ============ Comparison Tab ============
const BOT_COLORS = [
  "#D4AF37", "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#F97316", "#14B8A6",
];

function ComparisonTab({ dateRange }: { dateRange: "7d" | "30d" | "90d" | "all" }) {
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Import ibots data for name lookup
  const [ibotsData, setIbotsData] = useState<Array<{ id: string; name: string; avatar: string; category: string; categoryId: string }>>([]);

  useEffect(() => {
    import("@/data/ibots").then((mod) => {
      setIbotsData(mod.ibots.map((b: any) => ({ id: b.id, name: b.name, avatar: b.avatar, category: b.category, categoryId: b.categoryId })));
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Also load bot list from DB for bots that have data
  const { data: botListData } = trpc.adminAnalytics.chatbotList.useQuery();

  // Comparison data - only fetch when bots are selected
  const stableBotIds = useMemo(() => selectedBots, [selectedBots.join(",")]);
  const { data: comparisonData, isLoading: comparisonLoading } = trpc.adminAnalytics.chatbotComparison.useQuery(
    { botIds: stableBotIds, dateRange: dateRange },
    { enabled: selectedBots.length >= 2 }
  );

  const getBotName = (botId: string) => {
    const bot = ibotsData.find((b) => b.id === botId);
    return bot?.name || botId;
  };

  const getBotAvatar = (botId: string) => {
    const bot = ibotsData.find((b) => b.id === botId);
    return bot?.avatar || "🤖";
  };

  const getBotCategory = (botId: string) => {
    const bot = ibotsData.find((b) => b.id === botId);
    return bot?.category || "";
  };

  const filteredBots = ibotsData.filter(
    (b) =>
      !selectedBots.includes(b.id) &&
      (b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addBot = (botId: string) => {
    if (selectedBots.length < 10 && !selectedBots.includes(botId)) {
      setSelectedBots([...selectedBots, botId]);
    }
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const removeBot = (botId: string) => {
    setSelectedBots(selectedBots.filter((id) => id !== botId));
  };

  // Build comparison charts
  const bots = comparisonData?.bots || [];

  // Interaction rate bar chart
  const interactionRateData = {
    labels: bots.map((b) => getBotName(b.botId)),
    datasets: [
      {
        label: "Míra interakce (%)",
        data: bots.map((b) => b.interactionRate),
        backgroundColor: bots.map((_, i) => BOT_COLORS[i % BOT_COLORS.length]),
        borderRadius: 6,
        barThickness: 36,
      },
    ],
  };

  // Total triggers vs interactions grouped bar
  const triggersVsInteractionsData = {
    labels: bots.map((b) => getBotName(b.botId)),
    datasets: [
      {
        label: "Zobrazení",
        data: bots.map((b) => b.totalTriggers),
        backgroundColor: "rgba(212, 175, 55, 0.6)",
        borderRadius: 4,
      },
      {
        label: "Interakce",
        data: bots.map((b) => b.totalInteractions),
        backgroundColor: "rgba(139, 92, 246, 0.6)",
        borderRadius: 4,
      },
    ],
  };

  // Daily trend line chart (one line per bot)
  const allDates = new Set<string>();
  bots.forEach((b) => b.dailyTrend.forEach((d) => allDates.add(d.date)));
  const sortedDates = Array.from(allDates).sort();

  const trendLineData = {
    labels: sortedDates.map((d) => {
      const date = new Date(d);
      return `${date.getDate()}.${date.getMonth() + 1}.`;
    }),
    datasets: bots.map((b, i) => {
      const dateMap = new Map(b.dailyTrend.map((d) => [d.date, d.count]));
      return {
        label: getBotName(b.botId),
        data: sortedDates.map((d) => dateMap.get(d) || 0),
        borderColor: BOT_COLORS[i % BOT_COLORS.length],
        backgroundColor: `${BOT_COLORS[i % BOT_COLORS.length]}20`,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: BOT_COLORS[i % BOT_COLORS.length],
      };
    }),
  };

  // Multi-metric daily trend: Triggers + Interactions + Interaction Rate
  const multiMetricTrendData = {
    labels: sortedDates.map((d) => {
      const date = new Date(d);
      return `${date.getDate()}.${date.getMonth() + 1}.`;
    }),
    datasets: bots.flatMap((b, i) => {
      const triggerMap = new Map(b.dailyTrend.map((d) => [d.date, d.count]));
      const interactionMap = new Map(b.dailyTrend.map((d) => [d.date, d.interacted]));
      const rateMap = new Map(b.dailyTrend.map((d) => [d.date, d.interactionRate || 0]));
      const color = BOT_COLORS[i % BOT_COLORS.length];
      return [
        {
          label: `${getBotName(b.botId)} - Zobrazení`,
          data: sortedDates.map((d) => triggerMap.get(d) || 0),
          borderColor: color,
          backgroundColor: `${color}20`,
          borderDash: [5, 5],
          fill: false,
          tension: 0.3,
          pointRadius: 2,
          yAxisID: "y",
        },
        {
          label: `${getBotName(b.botId)} - Interakce`,
          data: sortedDates.map((d) => interactionMap.get(d) || 0),
          borderColor: color,
          backgroundColor: `${color}40`,
          fill: false,
          tension: 0.3,
          pointRadius: 2,
          yAxisID: "y",
        },
        {
          label: `${getBotName(b.botId)} - Míra interakce (%)`,
          data: sortedDates.map((d) => rateMap.get(d) || 0),
          borderColor: color,
          backgroundColor: `${color}60`,
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          yAxisID: "y1",
        },
      ];
    }),
  };

  // Performance Score Trend (interaction_rate * log(volume + 1))
  const performanceScoreTrendData = {
    labels: sortedDates.map((d) => {
      const date = new Date(d);
      return `${date.getDate()}.${date.getMonth() + 1}.`;
    }),
    datasets: bots.map((b, i) => {
      const scoreMap = new Map(b.dailyTrend.map((d) => [d.date, d.performanceScore || 0]));
      return {
        label: `${getBotName(b.botId)} - Performance Score`,
        data: sortedDates.map((d) => scoreMap.get(d) || 0),
        borderColor: BOT_COLORS[i % BOT_COLORS.length],
        backgroundColor: `${BOT_COLORS[i % BOT_COLORS.length]}30`,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: BOT_COLORS[i % BOT_COLORS.length],
        borderWidth: 2,
      };
    }),
  };

  // Week-over-week comparison (aggregate by week)
  const weeklyData = bots.map((b) => {
    const weekMap = new Map<string, { triggers: number; interactions: number; rate: number }>();
    b.dailyTrend.forEach((d) => {
      const date = new Date(d.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      const existing = weekMap.get(weekKey) || { triggers: 0, interactions: 0, rate: 0 };
      existing.triggers += d.count;
      existing.interactions += d.interacted || 0;
      weekMap.set(weekKey, existing);
    });
    // Calculate average rate per week
    weekMap.forEach((v) => {
      v.rate = v.triggers > 0 ? (v.interactions / v.triggers) * 100 : 0;
    });
    return { botId: b.botId, weekMap };
  });

  const allWeeks = new Set<string>();
  weeklyData.forEach((b) => b.weekMap.forEach((_, week) => allWeeks.add(week)));
  const sortedWeeks = Array.from(allWeeks).sort();

  const weekOverWeekData = {
    labels: sortedWeeks.map((w) => {
      const date = new Date(w);
      return `Týden ${date.getDate()}.${date.getMonth() + 1}.`;
    }),
    datasets: bots.flatMap((b, i) => {
      const botWeekly = weeklyData.find((wd) => wd.botId === b.botId);
      const color = BOT_COLORS[i % BOT_COLORS.length];
      return [
        {
          label: `${getBotName(b.botId)} - Zobrazení`,
          data: sortedWeeks.map((w) => botWeekly?.weekMap.get(w)?.triggers || 0),
          backgroundColor: `${color}60`,
          borderColor: color,
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: "y",
        },
        {
          label: `${getBotName(b.botId)} - Míra interakce (%)`,
          data: sortedWeeks.map((w) => botWeekly?.weekMap.get(w)?.rate || 0),
          type: "line" as const,
          borderColor: color,
          backgroundColor: `${color}40`,
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 4,
          yAxisID: "y1",
        },
      ];
    }),
  };

  // Trigger breakdown radar-like horizontal bar per bot
  const allTriggerTypes = new Set<string>();
  bots.forEach((b) => b.triggerBreakdown.forEach((t) => allTriggerTypes.add(t.eventType)));
  const triggerTypes = Array.from(allTriggerTypes);

  const triggerBreakdownData = {
    labels: triggerTypes.map((t) => t.replace(/_/g, " ")),
    datasets: bots.map((b, i) => {
      const typeMap = new Map(b.triggerBreakdown.map((t) => [t.eventType, t.count]));
      return {
        label: getBotName(b.botId),
        data: triggerTypes.map((t) => typeMap.get(t) || 0),
        backgroundColor: `${BOT_COLORS[i % BOT_COLORS.length]}80`,
        borderColor: BOT_COLORS[i % BOT_COLORS.length],
        borderWidth: 1,
        borderRadius: 4,
      };
    }),
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#1A1A1F", borderColor: "#2A2A2F", borderWidth: 1, titleColor: "#fff", bodyColor: "#9CA3AF", padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { beginAtZero: true, grid: { color: "rgba(42, 42, 47, 0.3)" } },
    },
  };

  const groupedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" as const, labels: { usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } } },
      tooltip: { backgroundColor: "#1A1A1F", borderColor: "#2A2A2F", borderWidth: 1, titleColor: "#fff", bodyColor: "#9CA3AF", padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { beginAtZero: true, grid: { color: "rgba(42, 42, 47, 0.3)" } },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" as const, labels: { usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } } },
      tooltip: { backgroundColor: "#1A1A1F", borderColor: "#2A2A2F", borderWidth: 1, titleColor: "#fff", bodyColor: "#9CA3AF", padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { size: 11 } } },
      y: { beginAtZero: true, grid: { color: "rgba(42, 42, 47, 0.3)" } },
    },
  };

  // Dual-axis options for multi-metric trend (count + percentage)
  const dualAxisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: { display: true, position: "top" as const, labels: { usePointStyle: true, pointStyleWidth: 8, font: { size: 10 }, boxWidth: 8, boxHeight: 8 } },
      tooltip: { backgroundColor: "#1A1A1F", borderColor: "#2A2A2F", borderWidth: 1, titleColor: "#fff", bodyColor: "#9CA3AF", padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { size: 10 } } },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        beginAtZero: true,
        grid: { color: "rgba(42, 42, 47, 0.3)" },
        title: { display: true, text: "Počet", color: "#9CA3AF", font: { size: 11 } },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Míra interakce (%)", color: "#9CA3AF", font: { size: 11 } },
      },
    },
  };

  // Mixed chart options for week-over-week (bar + line)
  const mixedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: { display: true, position: "top" as const, labels: { usePointStyle: true, pointStyleWidth: 8, font: { size: 10 }, boxWidth: 8, boxHeight: 8 } },
      tooltip: { backgroundColor: "#1A1A1F", borderColor: "#2A2A2F", borderWidth: 1, titleColor: "#fff", bodyColor: "#9CA3AF", padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        beginAtZero: true,
        grid: { color: "rgba(42, 42, 47, 0.3)" },
        title: { display: true, text: "Zobrazení", color: "#9CA3AF", font: { size: 11 } },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Míra interakce (%)", color: "#9CA3AF", font: { size: 11 } },
      },
    },
  };

  // Find best performer
  const bestBot = bots.length > 0 ? bots.reduce((best, b) => (b.interactionRate > best.interactionRate ? b : best)) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <GitCompareArrows className="w-5 h-5 text-[#D4AF37]" /> Porovnání výkonnosti chatbotů
        </h2>
        {selectedBots.length >= 2 && bestBot && (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
            🏆 Nejlepší: {getBotAvatar(bestBot.botId)} {getBotName(bestBot.botId)} ({bestBot.interactionRate.toFixed(1)}%)
          </Badge>
        )}
      </div>

      {/* Bot Selector */}
      <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Vyberte iBoty k porovnání (2–10)</h3>
          <span className="text-xs text-gray-500">{selectedBots.length}/10 vybráno</span>
        </div>

        {/* Selected bots chips */}
        {selectedBots.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedBots.map((botId, i) => (
              <div
                key={botId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                style={{ backgroundColor: `${BOT_COLORS[i % BOT_COLORS.length]}20`, border: `1px solid ${BOT_COLORS[i % BOT_COLORS.length]}40` }}
              >
                <span>{getBotAvatar(botId)}</span>
                <span className="text-white font-medium">{getBotName(botId)}</span>
                <span className="text-[10px] text-gray-400">{getBotCategory(botId)}</span>
                <button
                  onClick={() => removeBot(botId)}
                  className="ml-1 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search & Add */}
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Hledat iBota podle jména nebo kategorie..."
              className="w-full bg-[#0A0A0F] border border-[#2A2A2F] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
              disabled={selectedBots.length >= 10}
            />
          </div>

          {/* Dropdown */}
          {isDropdownOpen && filteredBots.length > 0 && (
            <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg shadow-xl">
              {filteredBots.slice(0, 20).map((bot) => {
                const hasData = botListData?.bots.some((b) => b.botId === bot.id);
                return (
                  <button
                    key={bot.id}
                    onClick={() => addBot(bot.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#2A2A2F]/50 transition-colors"
                  >
                    <span className="text-lg">{bot.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{bot.name}</p>
                      <p className="text-[10px] text-gray-500">{bot.category}</p>
                    </div>
                    {hasData && (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[9px] px-1.5">
                        má data
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick select: bots with data */}
        {botListData?.bots && botListData.bots.length > 0 && selectedBots.length === 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Rychlý výběr — iBoti s daty:</p>
            <div className="flex flex-wrap gap-2">
              {botListData.bots.slice(0, 8).map((bot) => (
                <button
                  key={bot.botId}
                  onClick={() => addBot(bot.botId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A0A0F] border border-[#2A2A2F] text-xs text-gray-300 hover:border-[#D4AF37]/30 hover:text-white transition-all"
                >
                  <span>{getBotAvatar(bot.botId)}</span>
                  <span>{getBotName(bot.botId)}</span>
                  <span className="text-gray-600">({bot.totalTriggers})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Comparison Results */}
      {selectedBots.length < 2 && (
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-12 text-center">
          <GitCompareArrows className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Vyberte alespoň 2 iBoty pro porovnání</p>
          <p className="text-xs text-gray-600">Porovnejte míru interakce, trigger výkon a denní trendy vedle sebe</p>
        </Card>
      )}

      {selectedBots.length >= 2 && comparisonLoading && <LoadingState />}

      {selectedBots.length >= 2 && !comparisonLoading && bots.length > 0 && (
        <>
          {/* KPI Cards per bot */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {bots.map((b, i) => (
              <Card
                key={b.botId}
                className="bg-[#1A1A1F] border-[#2A2A2F] p-4 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ backgroundColor: BOT_COLORS[i % BOT_COLORS.length] }}
                />
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{getBotAvatar(b.botId)}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{getBotName(b.botId)}</p>
                    <p className="text-[9px] text-gray-500 truncate">{getBotCategory(b.botId)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Zobrazení</span>
                    <span className="text-white font-bold">{b.totalTriggers}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Interakce</span>
                    <span className="text-white font-bold">{b.totalInteractions}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Míra</span>
                    <span
                      className="font-bold"
                      style={{ color: bestBot?.botId === b.botId ? "#10B981" : BOT_COLORS[i % BOT_COLORS.length] }}
                    >
                      {b.interactionRate.toFixed(1)}%
                      {bestBot?.botId === b.botId && " 🏆"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Row 1: Interaction Rate + Triggers vs Interactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" /> Míra interakce (%)
              </h3>
              <div style={{ height: "280px" }}>
                <Bar data={interactionRateData} options={barOptions} />
              </div>
            </Card>

            <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" /> Zobrazení vs Interakce
              </h3>
              <div style={{ height: "280px" }}>
                <Bar data={triggersVsInteractionsData} options={groupedBarOptions} />
              </div>
            </Card>
          </div>

          {/* Charts Row 2: Multi-Metric Daily Trend */}
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Denní trend - Zobrazení, Interakce & Míra
              </h3>
              <span className="text-xs text-gray-500">Posledních {dateRange} dní</span>
            </div>
            <div style={{ height: "320px" }}>
              {sortedDates.length > 0 ? (
                <Line data={multiMetricTrendData} options={dualAxisOptions} />
              ) : (
                <EmptyChart message="Zatím žádná data pro vybrané období" />
              )}
            </div>
          </Card>

          {/* Charts Row 3: Performance Score Trend */}
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" /> Performance Score Trend
              </h3>
              <span className="text-xs text-gray-500">Kombinovaná metrika: míra × log(objem + 1)</span>
            </div>
            <div style={{ height: "300px" }}>
              {sortedDates.length > 0 ? (
                <Line data={performanceScoreTrendData} options={lineOptions} />
              ) : (
                <EmptyChart message="Zatím žádná data pro vybrané období" />
              )}
            </div>
          </Card>

          {/* Charts Row 4: Week-over-Week Comparison */}
          {sortedWeeks.length > 0 && (
            <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" /> Týdenní srovnání
                </h3>
                <span className="text-xs text-gray-500">Agregace po týdnech</span>
              </div>
              <div style={{ height: "320px" }}>
                <Chart type="bar" data={weekOverWeekData} options={mixedChartOptions} />
              </div>
            </Card>
          )}

          {/* Charts Row 3: Trigger Breakdown */}
          {triggerTypes.length > 0 && (
            <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400" /> Rozložení triggerů
              </h3>
              <div style={{ height: "280px" }}>
                <Bar data={triggerBreakdownData} options={groupedBarOptions} />
              </div>
            </Card>
          )}

          {/* Comparison Table */}
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] overflow-hidden">
            <div className="p-4 border-b border-[#2A2A2F]">
              <h3 className="font-bold text-white">Detailní porovnání</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2A2A2F] bg-[#0A0A0F]/50">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">iBot</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Kategorie</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Zobrazení</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Interakce</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Míra interakce</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Trigger typy</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Výkon</th>
                  </tr>
                </thead>
                <tbody>
                  {bots
                    .sort((a, b) => b.interactionRate - a.interactionRate)
                    .map((b, i) => {
                      const maxRate = Math.max(...bots.map((x) => x.interactionRate));
                      const isBest = b.interactionRate === maxRate && maxRate > 0;
                      const colorIdx = selectedBots.indexOf(b.botId);
                      return (
                        <tr
                          key={b.botId}
                          className={`border-b border-[#2A2A2F]/50 hover:bg-[#2A2A2F]/20 ${isBest ? "bg-green-500/5" : ""}`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-8 rounded-full"
                                style={{ backgroundColor: BOT_COLORS[colorIdx % BOT_COLORS.length] }}
                              />
                              <span className="text-lg">{getBotAvatar(b.botId)}</span>
                              <span className="text-white font-medium">{getBotName(b.botId)}</span>
                              {isBest && <span className="text-xs">🏆</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-xs">{getBotCategory(b.botId)}</td>
                          <td className="text-right py-3 px-4 text-gray-300">{b.totalTriggers}</td>
                          <td className="text-right py-3 px-4 text-gray-300">{b.totalInteractions}</td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-bold ${isBest ? "text-green-400" : "text-white"}`}>
                              {b.interactionRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 text-gray-400">{b.triggerBreakdown.length}</td>
                          <td className="text-right py-3 px-4">
                            <div className="w-24 bg-[#2A2A2F] rounded-full h-2 ml-auto">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${maxRate > 0 ? (b.interactionRate / maxRate) * 100 : 0}%`,
                                  backgroundColor: BOT_COLORS[colorIdx % BOT_COLORS.length],
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ============ Shared Components ============
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-12 text-center">
      <div className="text-gray-600 mb-4 flex justify-center">{icon}</div>
      <p className="text-gray-400">{message}</p>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

// ============ Reports Tab ============
function ReportsTab() {
  const [reportType, setReportType] = useState<"daily" | "weekly">("daily");
  const [isGenerating, setIsGenerating] = useState(false);
  const utils = trpc.useUtils();

  const { data: historyData, isLoading } = trpc.reports.getHistory.useQuery({
    reportType,
    limit: 30,
  });

  const { data: latestData } = trpc.reports.getLatest.useQuery({ reportType });

  const generateMutation = trpc.reports.generateReport.useMutation({
    onSuccess: () => {
      utils.reports.getHistory.invalidate();
      utils.reports.getLatest.invalidate();
      setIsGenerating(false);
    },
    onError: () => setIsGenerating(false),
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    generateMutation.mutate({ reportType });
  };

  const latest = latestData?.report;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Automatické reporty</h2>
          <p className="text-gray-400 text-sm mt-1">AI-generované denní a týdenní souhrny s doporučeními</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#1A1A1F] rounded-lg p-1 border border-[#2A2A2F]">
            {(["daily", "weekly"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  reportType === t
                    ? "bg-[#D4AF37] text-[#0A0A0F]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t === "daily" ? "Denní" : "Týdenní"}
              </button>
            ))}
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-[#D4AF37] text-[#0A0A0F] hover:bg-[#B8860B]"
            size="sm"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generuji...</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" />Generovat nyní</>
            )}
          </Button>
        </div>
      </div>

      {/* Latest Report Highlight */}
      {latest && (
        <Card className="bg-gradient-to-br from-[#1A1A0F] to-[#1A1A1F] border-[#D4AF37]/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 mb-2">
                Poslední {reportType === "daily" ? "denní" : "týdenní"} report
              </Badge>
              <h3 className="text-lg font-bold text-white">{latest.reportDate}</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#D4AF37]">{latest.newUsers}</p>
                <p className="text-xs text-gray-400">Noví uživatelé</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{latest.chatSessions}</p>
                <p className="text-xs text-gray-400">Chat sezení</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{((latest.revenue || 0) / 100).toLocaleString()} Kč</p>
                <p className="text-xs text-gray-400">MRR</p>
              </div>
            </div>
          </div>

          {latest.aiSummary && (
            <div className="bg-[#0A0A0F]/50 rounded-lg p-4 mb-4">
              <p className="text-xs text-[#D4AF37] font-medium mb-2 uppercase tracking-wider">AI Souhrn</p>
              <p className="text-gray-300 text-sm leading-relaxed">{latest.aiSummary}</p>
            </div>
          )}

          {latest.strategicRecommendations && (
            <div className="bg-[#0A0A0F]/50 rounded-lg p-4">
              <p className="text-xs text-green-400 font-medium mb-2 uppercase tracking-wider">Strategická doporučení</p>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{latest.strategicRecommendations}</p>
            </div>
          )}
        </Card>
      )}

      {/* Report History */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Historie reportů</h3>
        {isLoading ? (
          <LoadingState />
        ) : !historyData?.reports.length ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            message="Žádné reporty zatím. Klikněte na 'Generovat nyní' pro vytvoření prvního reportu."
          />
        ) : (
          <div className="space-y-3">
            {historyData.reports.map((report) => (
              <Card key={report.id} className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{report.reportDate}</p>
                      <p className="text-xs text-gray-500">
                        {report.reportType === "daily" ? "Denní" : "Týdenní"} report
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-white">{report.newUsers}</p>
                      <p className="text-xs text-gray-500">Noví uživatelé</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-blue-400">{report.chatSessions}</p>
                      <p className="text-xs text-gray-500">Chat sezení</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-400">{report.newSubscriptions}</p>
                      <p className="text-xs text-gray-500">Nové sub.</p>
                    </div>
                    {report.avgRating && report.avgRating > 0 ? (
                      <div className="text-center">
                        <p className="font-semibold text-[#D4AF37]">{(report.avgRating / 10).toFixed(1)}⭐</p>
                        <p className="text-xs text-gray-500">Hodnocení</p>
                      </div>
                    ) : null}
                  </div>
                </div>
                {report.aiSummary && (
                  <p className="text-xs text-gray-400 mt-3 border-t border-[#2A2A2F] pt-3 line-clamp-2">
                    {report.aiSummary}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Feedback Tab ============
function FeedbackTab() {
  const { data, isLoading } = trpc.conversations.getFeedbackStats.useQuery();

  if (isLoading) return <LoadingState />;

  const overall = data?.overall;
  const bots = data?.bots || [];
  const recentComments = data?.recentComments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Zpětná vazba uživatelů</h2>
        <p className="text-gray-400 text-sm mt-1">Hodnocení a komentáře po konverzacích s iBoty</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5 text-center">
          <div className="flex justify-center mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(overall?.avgRating || 0)
                    ? "text-[#D4AF37] fill-[#D4AF37]"
                    : "text-gray-600"
                }`}
              />
            ))}
          </div>
          <p className="text-3xl font-bold text-white">{(overall?.avgRating || 0).toFixed(1)}</p>
          <p className="text-sm text-gray-400 mt-1">Průměrné hodnocení</p>
        </Card>
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5 text-center">
          <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-white">{overall?.totalFeedback || 0}</p>
          <p className="text-sm text-gray-400 mt-1">Celkem hodnocení</p>
        </Card>
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5 text-center">
          <ThumbsUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-white">{(overall?.wouldRecommend || 0).toFixed(0)}%</p>
          <p className="text-sm text-gray-400 mt-1">Doporučilo by</p>
        </Card>
      </div>

      {/* Bot Ratings */}
      {bots.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Hodnocení per bot</h3>
          <div className="space-y-2">
            {bots.slice(0, 15).map((bot) => (
              <Card key={bot.botId} className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-sm">
                      🤖
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{bot.botId}</p>
                      <p className="text-xs text-gray-500">{bot.count} hodnocení</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= Math.round(bot.avgRating)
                              ? "text-[#D4AF37] fill-[#D4AF37]"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-white ml-1">{bot.avgRating.toFixed(1)}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        bot.recommendRate >= 80
                          ? "border-green-500/30 text-green-400"
                          : bot.recommendRate >= 60
                          ? "border-yellow-500/30 text-yellow-400"
                          : "border-red-500/30 text-red-400"
                      }`}
                    >
                      {bot.recommendRate.toFixed(0)}% doporučí
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Comments */}
      {recentComments.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Poslední komentáře</h3>
          <div className="space-y-3">
            {recentComments.map((comment, i) => (
              <Card key={i} className="bg-[#1A1A1F] border-[#2A2A2F] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex shrink-0 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= comment.rating
                            ? "text-[#D4AF37] fill-[#D4AF37]"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{comment.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {comment.botId} • {new Date(comment.createdAt).toLocaleDateString("cs-CZ")}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!bots.length && !recentComments.length && (
        <EmptyState
          icon={<Star className="w-12 h-12" />}
          message="Zatím žádná zpětná vazba. Hodnocení se zobrazí po prvních konverzacích uživatelů."
        />
      )}
    </div>
  );
}

// ============ Intelligence Hub Tab ============
function IntelligenceTab() {
  const { data: summary, isLoading } = trpc.intelligence.summary.useQuery();
  const { data: churnData } = trpc.intelligence.churnRisk.useQuery();
  const { data: pathsData } = trpc.intelligence.conversionPaths.useQuery();
  const runAutomationsMutation = trpc.intelligence.runAutomations.useMutation();

  if (isLoading) return <LoadingState />;

  const forecast = summary?.forecast;
  const healthScore = summary?.healthScore || 0;

  const healthColor =
    healthScore >= 70 ? "text-green-400" :
    healthScore >= 40 ? "text-yellow-400" :
    "text-red-400";

  const healthBg =
    healthScore >= 70 ? "bg-green-400/10 border-green-400/30" :
    healthScore >= 40 ? "bg-yellow-400/10 border-yellow-400/30" :
    "bg-red-400/10 border-red-400/30";

  const trendIcon = forecast?.trend === "up" ? "↑" : forecast?.trend === "down" ? "↓" : "→";
  const trendColor = forecast?.trend === "up" ? "text-green-400" : forecast?.trend === "down" ? "text-red-400" : "text-gray-400";

  // Revenue forecast chart
  const forecastChartData = {
    labels: ["Aktuální MRR", "Předpověď příští měsíc"],
    datasets: [
      {
        label: "MRR (Kč)",
        data: [forecast?.currentMRR || 0, forecast?.forecastedMRR || 0],
        backgroundColor: ["rgba(212, 175, 55, 0.6)", "rgba(212, 175, 55, 0.3)"],
        borderColor: ["#D4AF37", "#D4AF37"],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Conversion paths chart
  const paths = pathsData?.paths || [];
  const conversionChartData = {
    labels: paths.map((p) => p.botId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 15)),
    datasets: [
      {
        label: "Míra konverze (%)",
        data: paths.map((p) => p.conversionRate),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "#10B981",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#D4AF37]" />
            Intelligence Hub
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Syntéza všech systémů — growth engine v jednom pohledu
          </p>
        </div>
        <Button
          onClick={() => runAutomationsMutation.mutate()}
          disabled={runAutomationsMutation.isPending}
          size="sm"
          className="bg-[#D4AF37] text-[#0A0A0F] hover:bg-[#B8860B]"
        >
          {runAutomationsMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Spouštím...</>
          ) : (
            <><Zap className="w-4 h-4 mr-2" />Spustit automatizace</>
          )}
        </Button>
      </div>

      {/* Health Score + Key KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Health Score — main indicator */}
        <Card className={`col-span-2 md:col-span-1 border p-5 text-center ${healthBg}`}>
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Health Score</p>
          <p className={`text-5xl font-bold ${healthColor}`}>{healthScore}</p>
          <p className="text-xs text-gray-500 mt-1">/100</p>
          <div className="mt-3 w-full bg-[#0A0A0F] rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                healthScore >= 70 ? "bg-green-400" : healthScore >= 40 ? "bg-yellow-400" : "bg-red-400"
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </Card>

        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Aktuální MRR</p>
          <p className="text-2xl font-bold text-[#D4AF37]">
            {(forecast?.currentMRR || 0).toLocaleString()} Kč
          </p>
          <p className={`text-xs mt-1 font-medium ${trendColor}`}>
            {trendIcon} {Math.abs(forecast?.growthRate || 0)}% vs minulý měsíc
          </p>
        </Card>

        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Předpověď MRR</p>
          <p className="text-2xl font-bold text-green-400">
            {(forecast?.forecastedMRR || 0).toLocaleString()} Kč
          </p>
          <p className="text-xs text-gray-500 mt-1">příští měsíc</p>
        </Card>

        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Churn riziko</p>
          <p className={`text-2xl font-bold ${(summary?.churnRiskCount || 0) > 10 ? "text-red-400" : "text-yellow-400"}`}>
            {summary?.churnRiskCount || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">uživatelů 14d+ neaktivní</p>
        </Card>

        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5 text-center">
          <p className="text-xs text-gray-400 mb-1">Hodnocení (7d)</p>
          <p className="text-2xl font-bold text-[#D4AF37]">
            {summary?.avgRating?.toFixed(1) || "–"}
            <span className="text-sm ml-1">⭐</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">{summary?.feedbackCount || 0} hodnocení</p>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Forecast Chart */}
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            Revenue Forecast
          </h3>
          <div style={{ height: "220px" }}>
            <Bar
              data={forecastChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    grid: { color: "rgba(42,42,47,0.5)" },
                    ticks: {
                      callback: (v) => `${Number(v).toLocaleString()} Kč`,
                    },
                  },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </Card>

        {/* Top Conversion Bots */}
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-400" />
            Top konverzní boti
          </h3>
          {paths.length > 0 ? (
            <div style={{ height: "220px" }}>
              <Bar
                data={conversionChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: "y" as const,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      grid: { color: "rgba(42,42,47,0.5)" },
                      ticks: { callback: (v) => `${v}%` },
                    },
                    y: { grid: { display: false } },
                  },
                }}
              />
            </div>
          ) : (
            <EmptyChart message="Data se zobrazí po prvních konverzích" />
          )}
        </Card>
      </div>

      {/* Churn Risk Users */}
      {(churnData?.users.length || 0) > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" />
            Uživatelé v churn riziku (14+ dní neaktivní)
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {(churnData?.users || []).slice(0, 8).map((u) => (
              <Card key={u.id} className="bg-[#1A1A1F] border-[#2A2A2F] p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-400/10 flex items-center justify-center text-xs font-bold text-red-400">
                    {(u.name || u.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{u.name || u.email?.split("@")[0] || "Uživatel"}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                  {u.lastSignedIn
                    ? `${Math.floor((Date.now() - new Date(u.lastSignedIn).getTime()) / (1000 * 60 * 60 * 24))}d neaktivní`
                    : "nikdy"}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Automation Results */}
      {runAutomationsMutation.data && (
        <Card className="bg-[#1A1A1F] border-green-500/30 p-4">
          <p className="text-green-400 font-semibold text-sm mb-2">Automatizace dokončeny</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Churn detekce:</p>
              <p className="text-white">{runAutomationsMutation.data.churn.atRisk} v riziku, {runAutomationsMutation.data.churn.winBackTriggered} win-back</p>
            </div>
            <div>
              <p className="text-gray-400">Upsell triggery:</p>
              <p className="text-white">{runAutomationsMutation.data.upsell.eligible} eligible, {runAutomationsMutation.data.upsell.triggered} triggered</p>
            </div>
          </div>
        </Card>
      )}

      {/* Growth Loop Diagram */}
      <Card className="bg-gradient-to-br from-[#1A1A0F] to-[#1A1A1F] border-[#D4AF37]/20 p-6">
        <h3 className="text-sm font-semibold text-[#D4AF37] mb-4 uppercase tracking-wider">Growth Loop Architektura</h3>
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-center">
          {[
            { label: "Registrace", color: "bg-blue-400/20 text-blue-400 border-blue-400/30" },
            { label: "→", color: "text-gray-500" },
            { label: "Welcome Email", color: "bg-green-400/20 text-green-400 border-green-400/30" },
            { label: "→", color: "text-gray-500" },
            { label: "Chat s iBoty", color: "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30" },
            { label: "→", color: "text-gray-500" },
            { label: "Feedback", color: "bg-purple-400/20 text-purple-400 border-purple-400/30" },
            { label: "→", color: "text-gray-500" },
            { label: "AI Report", color: "bg-orange-400/20 text-orange-400 border-orange-400/30" },
            { label: "→", color: "text-gray-500" },
            { label: "Upsell Email", color: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30" },
            { label: "→", color: "text-gray-500" },
            { label: "Konverze", color: "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30" },
          ].map((item, i) =>
            item.label === "→" ? (
              <span key={i} className="text-gray-500 font-bold">{item.label}</span>
            ) : (
              <span key={i} className={`px-2 py-1 rounded-lg border text-xs font-medium ${item.color}`}>
                {item.label}
              </span>
            )
          )}
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Každá akce uživatele spouští automatické reakce — email, notifikaci nebo report
        </p>
      </Card>
    </div>
  );
}
