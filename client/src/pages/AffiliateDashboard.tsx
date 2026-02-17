import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  ArrowLeft, Bot, Users, DollarSign, MousePointerClick, Crown,
  Shield, Copy, CheckCircle2, ExternalLink, Loader2, TrendingUp,
  FileText, Image, Link2, Share2
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function AffiliateDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { locale } = useI18n();
  const t = locale === "cs";
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: partnerInfo, isLoading: partnerLoading } = trpc.affiliateDashboard.myPartnerInfo.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const affiliateCode = partnerInfo?.affiliateCode ?? "";

  const { data: stats, isLoading: statsLoading } = trpc.affiliateDashboard.myStats.useQuery(
    { affiliateCode },
    { enabled: isAuthenticated && !!affiliateCode }
  );

  const { data: referrals } = trpc.affiliateDashboard.myReferrals.useQuery(
    { affiliateCode },
    { enabled: isAuthenticated && !!affiliateCode }
  );

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t ? "Zkopírováno!" : "Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (authLoading || partnerLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Share2 className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h1 className="font-[Space_Grotesk] text-2xl font-bold text-white mb-4">
            {t ? "Přihlaste se" : "Sign In"}
          </h1>
          <p className="text-gray-400 mb-8">
            {t ? "Pro přístup k affiliate dashboardu se musíte přihlásit." : "You need to sign in to access the affiliate dashboard."}
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-8 py-3">
              {t ? "Přihlásit se" : "Sign In"}
            </Button>
          </a>
        </div>
      </div>
    );
  }

  if (!partnerInfo) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Share2 className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h1 className="font-[Space_Grotesk] text-2xl font-bold text-white mb-4">
            {t ? "Nejste affiliate partner" : "Not an Affiliate Partner"}
          </h1>
          <p className="text-gray-400 mb-8">
            {t ? "Zaregistrujte se do affiliate programu na hlavní stránce." : "Register for the affiliate program on the main page."}
          </p>
          <Link href="/#affiliate">
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-8 py-3">
              {t ? "Registrovat se" : "Register Now"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const referralUrl = `${window.location.origin}?ref=${affiliateCode}`;

  const marketingMaterials = [
    {
      icon: <FileText className="w-5 h-5" />,
      titleCs: "E-mailová šablona",
      titleEn: "Email Template",
      descCs: "Připravená e-mailová šablona pro oslovení potenciálních zákazníků",
      descEn: "Ready-made email template for reaching potential customers",
      contentCs: `Předmět: AI chatbot, který prodává za vás — 327% ROI\n\nDobrý den,\n\nchtěl bych vám představit iBoty — AI chatboty s osobností, kteří prodávají za vás 24/7.\n\n✅ +42% konverze\n✅ 5minutové nasazení\n✅ 88 AI osobností na výběr\n\nVyzkoušejte zdarma: ${referralUrl}\n\nS pozdravem`,
      contentEn: `Subject: AI chatbot that sells for you — 327% ROI\n\nHello,\n\nI'd like to introduce you to iBots — AI chatbots with personality that sell for you 24/7.\n\n✅ +42% conversions\n✅ 5-minute deployment\n✅ 88 AI personalities to choose from\n\nTry for free: ${referralUrl}\n\nBest regards`,
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      titleCs: "Social media post",
      titleEn: "Social Media Post",
      descCs: "Připravený post pro Facebook, LinkedIn nebo Twitter",
      descEn: "Ready-made post for Facebook, LinkedIn, or Twitter",
      contentCs: `🤖 Právě jsem objevil iBoty — AI chatboty, kteří PRODÁVAJÍ za vás!\n\n📈 +327% ROI\n💬 +42% konverze\n⚡ 5 minut nasazení\n\n77 AI osobností včetně Alexe Hormoziho, Tonyho Robbinse a dalších.\n\nVyzkoušejte ZDARMA 👉 ${referralUrl}\n\n#AI #chatbot #marketing #sales`,
      contentEn: `🤖 Just discovered iBots — AI chatbots that SELL for you!\n\n📈 +327% ROI\n💬 +42% conversions\n⚡ 5-minute deployment\n\n77 AI personalities including Alex Hormozi, Tony Robbins, and more.\n\nTry for FREE 👉 ${referralUrl}\n\n#AI #chatbot #marketing #sales`,
    },
    {
      icon: <Link2 className="w-5 h-5" />,
      titleCs: "Banner text pro web",
      titleEn: "Web Banner Text",
      descCs: "Textový banner pro váš web nebo blog",
      descEn: "Text banner for your website or blog",
      contentCs: `[DOPORUČUJI] AI chatboti, kteří prodávají za vás — 88 osobností, +327% ROI. Vyzkoušejte zdarma na ${referralUrl}`,
      contentEn: `[RECOMMENDED] AI chatbots that sell for you — 88 personalities, +327% ROI. Try free at ${referralUrl}`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <Bot className="w-6 h-6 text-amber-400" />
                <span className="font-[Space_Grotesk] font-bold">
                  <span className="text-amber-400">BOT</span>HUB
                </span>
              </button>
            </Link>
            <span className="text-gray-600">|</span>
            <span className="text-sm text-gray-400">{t ? "Affiliate Dashboard" : "Affiliate Dashboard"}</span>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:text-white">
              {t ? "Můj Dashboard" : "My Dashboard"}
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-10">
        {/* Partner Info */}
        <div className="mb-10">
          <h1 className="font-[Space_Grotesk] text-3xl font-bold mb-2">
            {t ? "Affiliate Dashboard" : "Affiliate Dashboard"}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-sm text-gray-400">{t ? "Váš kód:" : "Your code:"}</span>
              <span className="font-mono font-bold text-amber-400">{affiliateCode}</span>
              <button onClick={() => copyToClipboard(affiliateCode, "code")} className="ml-1">
                {copiedField === "code" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400 hover:text-white" />}
              </button>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-gray-400">{t ? "Referral URL:" : "Referral URL:"}</span>
              <span className="text-sm text-white font-mono truncate max-w-[200px]">{referralUrl}</span>
              <button onClick={() => copyToClipboard(referralUrl, "url")} className="ml-1">
                {copiedField === "url" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400 hover:text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MousePointerClick className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">{t ? "Celkem kliků" : "Total Clicks"}</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalClicks ?? 0}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">{t ? "Referraly" : "Referrals"}</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalReferrals ?? 0}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm text-gray-400">{t ? "Konverzní poměr" : "Conversion Rate"}</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {stats && stats.totalClicks > 0
                ? `${((stats.totalReferrals / stats.totalClicks) * 100).toFixed(1)}%`
                : "0%"}
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">{t ? "Provize (čeká)" : "Commission (pending)"}</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">
              {t ? `${stats?.pendingCommission ?? 0} Kč` : `$${Math.round((stats?.pendingCommission ?? 0) / 25)}`}
            </p>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-amber-400" />
              <h3 className="font-semibold text-white">GOLD {t ? "referraly" : "Referrals"}</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-amber-400">{stats?.goldReferrals ?? 0}</span>
              <span className="text-gray-400">× 66% = {t ? `${(stats?.goldReferrals ?? 0) * 653} Kč/měs` : `$${(stats?.goldReferrals ?? 0) * 26}/mo`}</span>
            </div>
            <p className="text-sm text-gray-500">{t ? "990 Kč × 66% = 653 Kč provize za každý GOLD plán" : "$39 × 66% = $26 commission per GOLD plan"}</p>
          </div>
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.03] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
              <h3 className="font-semibold text-white">DIAMOND {t ? "referraly" : "Referrals"}</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-purple-400">{stats?.diamondReferrals ?? 0}</span>
              <span className="text-gray-400">× 88% = {t ? `${(stats?.diamondReferrals ?? 0) * 1917} Kč/měs` : `$${(stats?.diamondReferrals ?? 0) * 76}/mo`}</span>
            </div>
            <p className="text-sm text-gray-500">{t ? "2 490 Kč × 88% = 1 917 Kč provize za každý DIAMOND plán" : "$99 × 88% = $76 commission per DIAMOND plan"}</p>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="mb-10">
          <h2 className="font-[Space_Grotesk] text-xl font-bold mb-6">
            {t ? "Poslední referraly" : "Recent Referrals"}
          </h2>
          {!referrals || referrals.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-12 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                {t ? "Zatím žádné referraly" : "No referrals yet"}
              </h3>
              <p className="text-gray-500">
                {t ? "Sdílejte svůj referral odkaz a začněte vydělávat!" : "Share your referral link and start earning!"}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="text-left text-sm text-gray-400 font-medium p-4">{t ? "E-mail" : "Email"}</th>
                    <th className="text-left text-sm text-gray-400 font-medium p-4">{t ? "Plán" : "Plan"}</th>
                    <th className="text-left text-sm text-gray-400 font-medium p-4">{t ? "Stav" : "Status"}</th>
                    <th className="text-left text-sm text-gray-400 font-medium p-4">{t ? "Datum" : "Date"}</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 text-sm text-gray-300">{ref.email}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          ref.plan === "diamond" ? "bg-purple-500/10 text-purple-400" :
                          ref.plan === "gold" ? "bg-amber-500/10 text-amber-400" :
                          "bg-gray-500/10 text-gray-400"
                        }`}>
                          {ref.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ref.status === "activated" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                        }`}>
                          {ref.status === "activated" ? (t ? "Aktivní" : "Active") : (t ? "Čeká" : "Pending")}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {new Date(ref.createdAt).toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Marketing Materials */}
        <div>
          <h2 className="font-[Space_Grotesk] text-xl font-bold mb-6">
            {t ? "Propagační materiály" : "Marketing Materials"}
          </h2>
          <div className="space-y-4">
            {marketingMaterials.map((material, index) => (
              <div key={index} className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      {material.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {t ? material.titleCs : material.titleEn}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t ? material.descCs : material.descEn}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    onClick={() => copyToClipboard(t ? material.contentCs : material.contentEn, `material-${index}`)}
                  >
                    {copiedField === `material-${index}` ? (
                      <><CheckCircle2 className="w-4 h-4 mr-1" /> {t ? "Zkopírováno" : "Copied"}</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-1" /> {t ? "Kopírovat" : "Copy"}</>
                    )}
                  </Button>
                </div>
                <pre className="text-sm text-gray-400 bg-black/30 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono">
                  {t ? material.contentCs : material.contentEn}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
