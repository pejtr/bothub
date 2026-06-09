/**
 * Affiliate Dashboard - Protected page for affiliate partners
 * Features: Stats overview, conversions table, CSV export, tracking links
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  TrendingUp, 
  Users, 
  Coins, 
  Link as LinkIcon,
  Copy,
  ExternalLink,
  BarChart3,
  ArrowLeft,
  Loader2,
  Calendar,
  CheckCircle,
  Globe
} from "lucide-react";
import { generateAffiliateLink } from "@/hooks/useCrossPlatformTracking";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import AffiliateLeaderboard from "@/components/AffiliateLeaderboard";

export default function AffiliateDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Fetch affiliate data
  const { data: affiliateData, isLoading: affiliateLoading } = trpc.affiliate.getMyStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: conversions, isLoading: conversionsLoading } = trpc.affiliate.getConversions.useQuery(
    { range: dateRange },
    { enabled: isAuthenticated }
  );

  const { data: clicks, isLoading: clicksLoading } = trpc.affiliate.getClicks.useQuery(
    { range: dateRange },
    { enabled: isAuthenticated }
  );

  const { data: crossPlatformStats } = trpc.affiliate.getCrossPlatformStats.useQuery(
    undefined,
    { enabled: isAuthenticated && !!affiliateData }
  );

  // CSV Export function
  const exportToCSV = useCallback(() => {
    if (!conversions || conversions.length === 0) {
      toast.error("Žádná data k exportu");
      return;
    }

    const headers = ["Datum", "Plán", "Částka prodeje (Kč)", "Provize (%)", "Provize (Kč)", "Status"];
    const rows = conversions.map(c => [
      new Date(c.createdAt).toLocaleDateString("cs-CZ"),
      c.planId.toUpperCase(),
      (c.saleAmount / 100).toFixed(2),
      c.commissionRate.toString(),
      (c.commissionAmount / 100).toFixed(2),
      c.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Add BOM for Czech characters in Excel
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ibots-affiliate-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV exportováno", {
      description: `${conversions.length} záznamů exportováno`,
    });
  }, [conversions]);

  // Copy affiliate link
  const copyAffiliateLink = useCallback((platform: "ibots" | "bothub" = "ibots") => {
    if (!affiliateData?.affiliateCode) return;
    const link = platform === "bothub"
      ? generateAffiliateLink(affiliateData.affiliateCode, "bothub")
      : `${window.location.origin}/?ref=${affiliateData.affiliateCode}`;
    navigator.clipboard.writeText(link);
    toast.success(`${platform === "bothub" ? "BotHub" : "iBots"} odkaz zkopírován!`, {
      description: "Váš affiliate odkaz byl zkopírován do schránky",
    });
  }, [affiliateData]);

  // Computed stats
  const stats = useMemo(() => {
    if (!affiliateData) return null;
    return {
      totalEarnings: (affiliateData.totalEarnings / 100).toLocaleString("cs-CZ"),
      totalPaidOut: (affiliateData.totalPaidOut / 100).toLocaleString("cs-CZ"),
      pendingBalance: ((affiliateData.totalEarnings - affiliateData.totalPaidOut) / 100).toLocaleString("cs-CZ"),
      totalClicks: clicks?.length || 0,
      totalConversions: conversions?.length || 0,
      conversionRate: clicks && clicks.length > 0 
        ? ((conversions?.length || 0) / clicks.length * 100).toFixed(1)
        : "0.0",
    };
  }, [affiliateData, clicks, conversions]);

  // Loading state
  if (loading || affiliateLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-white">
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Přihlášení vyžadováno</h2>
          <p className="text-gray-400 mb-6">Pro přístup k affiliate dashboardu se musíte přihlásit.</p>
          <a href={getLoginUrl()}>
            <Button className="btn-gold w-full">Přihlásit se</Button>
          </a>
        </Card>
      </div>
    );
  }

  // Not an affiliate partner yet
  if (!affiliateData) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-white">
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Affiliate program</h2>
          <p className="text-gray-400 mb-6">Zatím nejste registrovaní jako affiliate partner.</p>
          <Link href="/affiliate">
            <Button className="btn-gold w-full">Registrovat se do programu</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Top Nav */}
      <nav className="bg-[#0A0A0F]/80 backdrop-blur-lg border-b border-[#2A2A2F] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <a className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </a>
            </Link>
            <h1 className="text-xl font-bold">
              <span className="text-gold-gradient">Affiliate</span> Dashboard
            </h1>
            <Badge className={`${
              affiliateData.status === "active" 
                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }`}>
              {affiliateData.status === "active" ? "Aktivní" : "Čeká na schválení"}
            </Badge>
          </div>
          <Button onClick={exportToCSV} className="btn-gold-outline gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Affiliate Links - Cross Platform */}
        <Card className="bg-gradient-to-r from-[#D4AF37]/10 to-[#8B7355]/10 border-[#D4AF37]/30 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-[#D4AF37]" />
            Vaše affiliate odkazy
          </h3>
          <div className="space-y-3">
            {/* iBots link */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">iBots</Badge>
                <span className="text-sm text-gray-400">Landing page</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0A0A0F] rounded-lg px-4 py-2 border border-[#2A2A2F] w-full sm:w-auto">
                <code className="text-[#D4AF37] text-sm truncate flex-1">
                  {window.location.origin}/?ref={affiliateData.affiliateCode}
                </code>
                <Button size="sm" variant="ghost" onClick={() => copyAffiliateLink("ibots")} className="text-gray-400 hover:text-[#D4AF37]">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* BotHub link */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Globe className="w-3 h-3 mr-1" />
                  BotHub
                </Badge>
                <span className="text-sm text-gray-400">Hlavní platforma</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0A0A0F] rounded-lg px-4 py-2 border border-[#2A2A2F] w-full sm:w-auto">
                <code className="text-blue-400 text-sm truncate flex-1">
                  bothub.cz/?ref={affiliateData.affiliateCode}
                </code>
                <Button size="sm" variant="ghost" onClick={() => copyAffiliateLink("bothub")} className="text-gray-400 hover:text-blue-400">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Provize se počítají ze všech platforem — sdílejte odkaz, který nejlépe sedí vašemu publiku.</p>
        </Card>

        {/* Cross-Platform Stats */}
        {crossPlatformStats && (
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#D4AF37]" />
              Cross-Platform Přehled
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0A0A0F] rounded-xl p-4 border border-[#2A2A2F]">
                <div className="text-xs text-gray-500 mb-1">iBots kliky</div>
                <div className="text-xl font-bold text-[#D4AF37]">{crossPlatformStats.clicks.ibots}</div>
              </div>
              <div className="bg-[#0A0A0F] rounded-xl p-4 border border-[#2A2A2F]">
                <div className="text-xs text-gray-500 mb-1">BotHub kliky</div>
                <div className="text-xl font-bold text-blue-400">{crossPlatformStats.clicks.bothub}</div>
              </div>
              <div className="bg-[#0A0A0F] rounded-xl p-4 border border-[#2A2A2F]">
                <div className="text-xs text-gray-500 mb-1">iBots provize</div>
                <div className="text-xl font-bold text-[#D4AF37]">
                  {((crossPlatformStats.conversions.ibots.amount || 0) / 100).toLocaleString("cs-CZ")} Kč
                </div>
                <div className="text-xs text-gray-600">{crossPlatformStats.conversions.ibots.count} konverzí</div>
              </div>
              <div className="bg-[#0A0A0F] rounded-xl p-4 border border-[#2A2A2F]">
                <div className="text-xs text-gray-500 mb-1">BotHub provize</div>
                <div className="text-xl font-bold text-blue-400">
                  {((crossPlatformStats.conversions.bothub.amount || 0) / 100).toLocaleString("cs-CZ")} Kč
                </div>
                <div className="text-xs text-gray-600">{crossPlatformStats.conversions.bothub.count} konverzí</div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <span className="text-sm text-gray-400">Celkové výdělky</span>
            </div>
            <div className="text-2xl font-bold text-gold-gradient">{stats?.totalEarnings || "0"} Kč</div>
          </Card>

          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">Vyplaceno</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{stats?.totalPaidOut || "0"} Kč</div>
          </Card>

          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">Kliknutí</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{stats?.totalClicks || 0}</div>
          </Card>

          <Card className="bg-[#1A1A1F] border-[#2A2A2F] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">Konverze</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {stats?.totalConversions || 0}
              <span className="text-sm text-gray-500 font-normal ml-2">({stats?.conversionRate}%)</span>
            </div>
          </Card>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400 mr-2">Období:</span>
          {(["7d", "30d", "90d", "all"] as const).map((range) => (
            <Button
              key={range}
              size="sm"
              variant={dateRange === range ? "default" : "outline"}
              className={dateRange === range 
                ? "bg-[#D4AF37] text-[#0A0A0F] hover:bg-[#D4AF37]/90" 
                : "border-[#2A2A2F] text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]"
              }
              onClick={() => setDateRange(range)}
            >
              {range === "7d" ? "7 dní" : range === "30d" ? "30 dní" : range === "90d" ? "90 dní" : "Vše"}
            </Button>
          ))}
        </div>

        {/* Conversions Table */}
        <Card className="bg-[#1A1A1F] border-[#2A2A2F] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2F] flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
              Konverze
            </h3>
            <span className="text-sm text-gray-400">
              {conversions?.length || 0} záznamů
            </span>
          </div>

          {conversionsLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto" />
            </div>
          ) : !conversions || conversions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>Zatím žádné konverze v tomto období</p>
              <p className="text-sm mt-1">Sdílejte svůj affiliate odkaz pro získání provizí</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A2F] text-left">
                    <th className="px-4 py-3 text-sm font-medium text-gray-400">Datum</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400">Plán</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400">Prodej</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400">Provize</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400">Výdělek</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((conversion) => (
                    <tr key={conversion.id} className="border-b border-[#2A2A2F]/50 hover:bg-[#2A2A2F]/20">
                      <td className="px-4 py-3 text-sm">
                        {new Date(conversion.createdAt).toLocaleDateString("cs-CZ")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${
                          conversion.planId === "diamond" 
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30"
                        }`}>
                          {conversion.planId.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(conversion.saleAmount / 100).toLocaleString("cs-CZ")} Kč
                      </td>
                      <td className="px-4 py-3 text-sm text-[#D4AF37]">
                        {conversion.commissionRate}%
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-400">
                        {(conversion.commissionAmount / 100).toLocaleString("cs-CZ")} Kč
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${
                          conversion.status === "paid" 
                            ? "bg-green-500/20 text-green-400"
                            : conversion.status === "confirmed"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {conversion.status === "paid" ? "Vyplaceno" 
                            : conversion.status === "confirmed" ? "Potvrzeno" 
                            : "Čeká"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Leaderboard */}
        <AffiliateLeaderboard />

        {/* Quick Tips */}
        <Card className="bg-[#1A1A1F]/50 border-[#2A2A2F] p-6">
          <h3 className="text-lg font-semibold mb-4">Tipy pro vyšší konverze</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                <span className="text-[#D4AF37] font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Sdílejte osobní zkušenost</p>
                <p className="text-xs text-gray-500">Autentické příběhy konvertují 3x lépe</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                <span className="text-[#D4AF37] font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Cílte na specifické iBoty</p>
                <p className="text-xs text-gray-500">Doporučujte konkrétní boty pro konkrétní problémy</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                <span className="text-[#D4AF37] font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Využijte video obsah</p>
                <p className="text-xs text-gray-500">Video recenze mají 5x vyšší engagement</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
