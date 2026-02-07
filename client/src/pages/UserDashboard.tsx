import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Bot, Crown, Zap, Shield, Clock, CheckCircle2, XCircle,
  ArrowLeft, User, CreditCard, Settings, ExternalLink, Loader2
} from "lucide-react";
import { Link } from "wouter";

export default function UserDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { locale } = useI18n();
  const t = locale === "cs";

  const { data: registrations, isLoading: regLoading } = trpc.userDashboard.myRegistrations.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (authLoading) {
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
          <Bot className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h1 className="font-[Space_Grotesk] text-2xl font-bold text-white mb-4">
            {t ? "Přihlaste se" : "Sign In"}
          </h1>
          <p className="text-gray-400 mb-8">
            {t ? "Pro přístup k dashboardu se musíte přihlásit." : "You need to sign in to access the dashboard."}
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

  const planColors: Record<string, string> = {
    free: "text-gray-400 border-gray-500/30 bg-gray-500/10",
    gold: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    diamond: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  };

  const planIcons: Record<string, React.ReactNode> = {
    free: <Zap className="w-5 h-5" />,
    gold: <Crown className="w-5 h-5" />,
    diamond: <Shield className="w-5 h-5" />,
  };

  const planLimits: Record<string, { ibots: string; messages: string }> = {
    free: { ibots: "1", messages: "100" },
    gold: { ibots: "10", messages: "5 000" },
    diamond: { ibots: t ? "Neomezeno" : "Unlimited", messages: t ? "Neomezeno" : "Unlimited" },
  };

  const statusColors: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-500/10",
    activated: "text-green-400 bg-green-500/10",
    synced: "text-blue-400 bg-blue-500/10",
  };

  const statusLabels: Record<string, string> = {
    pending: t ? "Čeká na aktivaci" : "Pending",
    activated: t ? "Aktivní" : "Active",
    synced: t ? "Synchronizováno" : "Synced",
  };

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
            <span className="text-sm text-gray-400">{t ? "Můj Dashboard" : "My Dashboard"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <User className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-gray-300">{user?.name || user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-[Space_Grotesk] text-3xl font-bold mb-2">
            {t ? "Vítejte zpět" : "Welcome back"}, <span className="text-amber-400">{user?.name || (t ? "uživateli" : "user")}</span>
          </h1>
          <p className="text-gray-400">
            {t ? "Spravujte své iBoty, předplatné a sledujte výkon." : "Manage your iBots, subscriptions, and track performance."}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm text-gray-400">{t ? "Aktivní iBoti" : "Active iBots"}</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {registrations?.filter(r => r.status === "activated").length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CreditCard className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">{t ? "Registrace" : "Registrations"}</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {registrations?.length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">{t ? "Člen od" : "Member since"}</span>
            </div>
            <p className="text-lg font-bold text-white">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US") : "—"}
            </p>
          </div>
        </div>

        {/* Registrations / iBots */}
        <div className="mb-10">
          <h2 className="font-[Space_Grotesk] text-xl font-bold mb-6">
            {t ? "Moje registrace & iBoti" : "My Registrations & iBots"}
          </h2>

          {regLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : !registrations || registrations.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-12 text-center">
              <Bot className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                {t ? "Zatím žádné registrace" : "No registrations yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {t ? "Začněte s výběrem iBota z katalogu — je to zdarma!" : "Start by choosing an iBot from the catalog — it's free!"}
              </p>
              <Link href="/#catalog">
                <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold">
                  {t ? "Prohlédnout katalog" : "Browse Catalog"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border ${planColors[reg.plan]}`}>
                        {planIcons[reg.plan]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">
                            {reg.plan.toUpperCase()} {t ? "Plán" : "Plan"}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[reg.status]}`}>
                            {statusLabels[reg.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {t ? "Registrace" : "Registered"}: {new Date(reg.createdAt).toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US")}
                          {reg.source && <span className="ml-2 text-gray-600">({reg.source})</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">{t ? "iBoti" : "iBots"}</p>
                        <p className="font-semibold text-white">{planLimits[reg.plan].ibots}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">{t ? "Zprávy/měs" : "Msgs/mo"}</p>
                        <p className="font-semibold text-white">{planLimits[reg.plan].messages}</p>
                      </div>
                      {reg.status === "activated" ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-[Space_Grotesk] text-xl font-bold mb-6">
            {t ? "Rychlé akce" : "Quick Actions"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/#catalog">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-amber-500/30 transition-all cursor-pointer group">
                <Bot className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-1">{t ? "Katalog iBotů" : "iBot Catalog"}</h3>
                <p className="text-sm text-gray-500">{t ? "Prohlédněte si 77 AI osobností" : "Browse 77 AI personalities"}</p>
              </div>
            </Link>
            <Link href="/#pricing">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-purple-500/30 transition-all cursor-pointer group">
                <Crown className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-1">{t ? "Upgradovat plán" : "Upgrade Plan"}</h3>
                <p className="text-sm text-gray-500">{t ? "Získejte více iBotů a zpráv" : "Get more iBots and messages"}</p>
              </div>
            </Link>
            <Link href="/affiliate-dashboard">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-green-500/30 transition-all cursor-pointer group">
                <Settings className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-1">{t ? "Affiliate program" : "Affiliate Program"}</h3>
                <p className="text-sm text-gray-500">{t ? "Vydělávejte až 77 % provizí" : "Earn up to 77% commissions"}</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
