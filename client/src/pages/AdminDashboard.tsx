import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  BarChart3, Users, Mail, MousePointerClick, TrendingUp, Bot,
  ArrowLeft, RefreshCw, Shield, Crown, Loader2, LogOut,
  CheckCircle2, Clock, ExternalLink, FileText, Plus, Pencil,
  Trash2, Eye, Save, X, Search, Globe, AlertCircle
} from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";

function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string; value: string | number; icon: React.ElementType; color: string; subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="font-[Space_Grotesk] text-3xl font-bold text-white">{value}</div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function DataTable({ title, headers, rows, emptyMessage }: {
  title: string; headers: string[]; rows: React.ReactNode[][]; emptyMessage?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {headers.map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={headers.length} className="px-5 py-8 text-center text-gray-500 text-sm">{emptyMessage || "Zatím žádná data"}</td></tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  {row.map((cell, j) => (
                    <td key={j} className="px-5 py-3 text-gray-300">{cell}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type TabId = "overview" | "registrations" | "emails" | "affiliates" | "ab-tests" | "blog" | "seo";

export default function AdminDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const utils = trpc.useUtils();

  const [blogEditorOpen, setBlogEditorOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [blogForm, setBlogForm] = useState({
    slug: "", titleCs: "", titleEn: "", contentCs: "", contentEn: "",
    excerptCs: "", excerptEn: "", metaDescriptionCs: "", metaDescriptionEn: "",
    category: "", coverImage: "", author: "BOTHUB Team", status: "draft" as "draft" | "published",
    readingTime: 5,
  });
  const [previewMode, setPreviewMode] = useState(false);

  const blogPosts = trpc.blogAdmin.list.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" && activeTab === "blog" });
  const createPost = trpc.blogAdmin.create.useMutation({ onSuccess: () => { blogPosts.refetch(); resetBlogForm(); } });
  const updatePost = trpc.blogAdmin.update.useMutation({ onSuccess: () => { blogPosts.refetch(); resetBlogForm(); } });
  const deletePost = trpc.blogAdmin.delete.useMutation({ onSuccess: () => { blogPosts.refetch(); } });

  const resetBlogForm = () => {
    setBlogEditorOpen(false);
    setEditingPostId(null);
    setPreviewMode(false);
    setBlogForm({ slug: "", titleCs: "", titleEn: "", contentCs: "", contentEn: "", excerptCs: "", excerptEn: "", metaDescriptionCs: "", metaDescriptionEn: "", category: "", coverImage: "", author: "BOTHUB Team", status: "draft", readingTime: 5 });
  };

  const openEditPost = (post: any) => {
    setBlogForm({
      slug: post.slug, titleCs: post.titleCs, titleEn: post.titleEn || "",
      contentCs: post.contentCs, contentEn: post.contentEn || "",
      excerptCs: post.excerptCs || "", excerptEn: post.excerptEn || "",
      metaDescriptionCs: post.metaDescriptionCs || "", metaDescriptionEn: post.metaDescriptionEn || "",
      category: post.category || "", coverImage: post.coverImage || "",
      author: post.author || "BOTHUB Team", status: post.status,
      readingTime: post.readingTime || 5,
    });
    setEditingPostId(post.id);
    setBlogEditorOpen(true);
  };

  const handleSaveBlogPost = () => {
    if (editingPostId) {
      updatePost.mutate({ id: editingPostId, ...blogForm });
    } else {
      createPost.mutate(blogForm);
    }
  };

  const autoSlug = (title: string) => {
    return title.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

  const stats = trpc.admin.stats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin", refetchInterval: 30000 });
  const planBreakdown = trpc.admin.registrationsByPlan.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const abTests = trpc.admin.abTestResults.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" && activeTab === "ab-tests" });
  const recentRegs = trpc.admin.recentRegistrations.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" && (activeTab === "overview" || activeTab === "registrations") });
  const recentEmails = trpc.admin.recentEmails.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" && (activeTab === "overview" || activeTab === "emails") });
  const affiliatePartners = trpc.admin.affiliatePartners.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" && activeTab === "affiliates" });
  const regTrend = trpc.admin.registrationTrend.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" && activeTab === "overview" });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-amber-400/30 mx-auto mb-4" />
          <h1 className="font-[Space_Grotesk] text-2xl font-bold text-white mb-2">Přístup odepřen</h1>
          <p className="text-gray-400 mb-6">Pro přístup k admin dashboardu se musíte přihlásit.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">Přihlásit se</Button>
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400/30 mx-auto mb-4" />
          <h1 className="font-[Space_Grotesk] text-2xl font-bold text-white mb-2">Nedostatečná oprávnění</h1>
          <p className="text-gray-400 mb-6">Tato stránka je dostupná pouze pro administrátory.</p>
          <a href="/"><Button variant="outline" className="border-white/10 text-gray-300"><ArrowLeft className="w-4 h-4 mr-2" />Zpět na hlavní stránku</Button></a>
        </div>
      </div>
    );
  }

  const refreshAll = () => {
    utils.admin.stats.invalidate();
    utils.admin.registrationsByPlan.invalidate();
    utils.admin.abTestResults.invalidate();
    utils.admin.recentRegistrations.invalidate();
    utils.admin.recentEmails.invalidate();
    utils.admin.affiliatePartners.invalidate();
    utils.admin.registrationTrend.invalidate();
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Přehled", icon: BarChart3 },
    { id: "registrations", label: "Registrace", icon: Users },
    { id: "emails", label: "E-maily", icon: Mail },
    { id: "affiliates", label: "Affiliate", icon: TrendingUp },
    { id: "ab-tests", label: "A/B Testy", icon: MousePointerClick },
    { id: "blog", label: "Blog Editor", icon: FileText },
    { id: "seo", label: "SEO & GSC", icon: Search },
  ];

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return date.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const planBadge = (plan: string) => {
    const colors: Record<string, string> = { free: "bg-gray-500/20 text-gray-400", gold: "bg-amber-500/20 text-amber-400", diamond: "bg-purple-500/20 text-purple-400" };
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[plan] ?? colors.free}`}>{plan.toUpperCase()}</span>;
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { activated: "text-green-400", pending: "text-amber-400", synced: "text-blue-400", active: "text-green-400", approved: "text-blue-400" };
    return (
      <span className={`flex items-center gap-1 text-xs ${colors[status] ?? "text-gray-400"}`}>
        {status === "activated" || status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <Bot className="w-7 h-7 text-amber-400" />
              <span className="font-[Space_Grotesk] font-bold text-lg">
                <span className="text-amber-400">BOT</span>HUB
              </span>
            </a>
            <div className="hidden sm:flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
              <Crown className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-white/10 text-gray-400 hover:text-white" onClick={refreshAll}>
              <RefreshCw className={`w-4 h-4 mr-1 ${stats.isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Obnovit</span>
            </Button>
            <Button variant="outline" size="sm" className="border-white/10 text-gray-400 hover:text-white" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Odhlásit</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Registrace" value={stats.data?.registrations ?? "—"} icon={Users} color="bg-amber-500/10 text-amber-400" subtitle="Celkový počet" />
              <StatCard title="Affiliate partneři" value={stats.data?.affiliates ?? "—"} icon={TrendingUp} color="bg-purple-500/10 text-purple-400" subtitle="Aktivní partneři" />
              <StatCard title="E-mail captures" value={stats.data?.emails ?? "—"} icon={Mail} color="bg-green-500/10 text-green-400" subtitle="Unikátní e-maily" />
              <StatCard title="Affiliate kliky" value={stats.data?.affiliateClicks ?? "—"} icon={MousePointerClick} color="bg-blue-500/10 text-blue-400" subtitle="Celkové kliky" />
            </div>

            {/* Plan Breakdown */}
            {planBreakdown.data && planBreakdown.data.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="font-semibold text-white text-sm mb-4">Registrace podle plánu</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {planBreakdown.data.map((p) => (
                    <div key={p.plan} className="rounded-lg bg-white/[0.03] border border-white/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        {planBadge(p.plan)}
                        <span className="font-[Space_Grotesk] text-xl font-bold text-white">{p.count}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="text-green-400">{p.activated} aktivních</span>
                        <span className="text-amber-400">{p.pending} čekajících</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registration Trend */}
            {regTrend.data && regTrend.data.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="font-semibold text-white text-sm mb-4">Trend registrací (posledních 30 dní)</h3>
                <div className="flex items-end gap-1 h-32">
                  {regTrend.data.map((day) => {
                    const maxCount = Math.max(...regTrend.data!.map((d) => d.count), 1);
                    const height = Math.max((day.count / maxCount) * 100, 4);
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1" title={`${day.date}: ${day.count} registrací`}>
                        <span className="text-[10px] text-gray-500">{day.count}</span>
                        <div className="w-full rounded-t bg-amber-500/60 hover:bg-amber-500 transition-colors" style={{ height: `${height}%` }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Registrations */}
            <DataTable
              title="Poslední registrace"
              headers={["E-mail", "Plán", "Stav", "Zdroj", "Datum"]}
              rows={(recentRegs.data ?? []).slice(0, 10).map((r) => [
                <span className="font-mono text-xs">{r.email}</span>,
                planBadge(r.plan),
                statusBadge(r.status),
                <span className="text-xs text-gray-500">{r.source}</span>,
                <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span>,
              ])}
            />
          </div>
        )}

        {/* ===== REGISTRATIONS TAB ===== */}
        {activeTab === "registrations" && (
          <DataTable
            title={`Všechny registrace (${recentRegs.data?.length ?? 0})`}
            headers={["E-mail", "Jméno", "Firma", "Plán", "Stav", "Zdroj", "Affiliate", "Datum"]}
            rows={(recentRegs.data ?? []).map((r) => [
              <span className="font-mono text-xs">{r.email}</span>,
              <span className="text-xs">{r.name || "—"}</span>,
              <span className="text-xs">{r.company || "—"}</span>,
              planBadge(r.plan),
              statusBadge(r.status),
              <span className="text-xs text-gray-500">{r.source}</span>,
              <span className="text-xs text-gray-500">{r.affiliateCode || "—"}</span>,
              <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span>,
            ])}
          />
        )}

        {/* ===== EMAILS TAB ===== */}
        {activeTab === "emails" && (
          <DataTable
            title={`E-mail captures (${recentEmails.data?.length ?? 0})`}
            headers={["E-mail", "Zdroj", "Varianta", "GDPR", "Datum"]}
            rows={(recentEmails.data ?? []).map((e) => [
              <span className="font-mono text-xs">{e.email}</span>,
              <span className="text-xs text-gray-400">{e.source}</span>,
              <span className="text-xs text-gray-500">{e.variant || "—"}</span>,
              e.gdprConsent ? <span className="text-green-400 text-xs">Ano</span> : <span className="text-red-400 text-xs">Ne</span>,
              <span className="text-xs text-gray-500">{formatDate(e.capturedAt)}</span>,
            ])}
          />
        )}

        {/* ===== AFFILIATES TAB ===== */}
        {activeTab === "affiliates" && (
          <DataTable
            title={`Affiliate partneři (${affiliatePartners.data?.length ?? 0})`}
            headers={["Jméno", "E-mail", "Firma", "Web", "Kód", "Stav", "Datum"]}
            rows={(affiliatePartners.data ?? []).map((a) => [
              <span className="text-xs font-medium">{a.name}</span>,
              <span className="font-mono text-xs">{a.email}</span>,
              <span className="text-xs">{a.company || "—"}</span>,
              a.website ? <a href={a.website} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 flex items-center gap-1">{a.website.replace(/https?:\/\//, "").slice(0, 25)} <ExternalLink className="w-3 h-3" /></a> : <span className="text-xs text-gray-500">—</span>,
              <span className="font-mono text-xs text-amber-400">{a.affiliateCode}</span>,
              statusBadge(a.status),
              <span className="text-xs text-gray-500">{formatDate(a.createdAt)}</span>,
            ])}
          />
        )}

        {/* ===== A/B TESTS TAB ===== */}
        {activeTab === "ab-tests" && (
          <div className="space-y-6">
            <DataTable
              title="A/B Test výsledky"
              headers={["Test", "Varianta", "Imprese", "Kliky", "Konverze", "CTR", "CVR"]}
              rows={(abTests.data ?? []).map((t) => {
                const ctr = t.impressions > 0 ? ((t.clicks / t.impressions) * 100).toFixed(1) : "0.0";
                const cvr = t.clicks > 0 ? ((t.conversions / t.clicks) * 100).toFixed(1) : "0.0";
                return [
                  <span className="text-xs font-medium">{t.testName}</span>,
                  <span className="text-xs font-mono text-amber-400">{t.variant}</span>,
                  <span className="text-xs">{t.impressions.toLocaleString()}</span>,
                  <span className="text-xs">{t.clicks.toLocaleString()}</span>,
                  <span className="text-xs text-green-400 font-medium">{t.conversions.toLocaleString()}</span>,
                  <span className="text-xs">{ctr}%</span>,
                  <span className={`text-xs font-medium ${Number(cvr) > 5 ? "text-green-400" : Number(cvr) > 2 ? "text-amber-400" : "text-gray-400"}`}>{cvr}%</span>,
                ];
              })}
            />

            {abTests.data && abTests.data.length >= 2 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                <h3 className="font-semibold text-amber-400 text-sm mb-2">Doporučení</h3>
                <p className="text-sm text-gray-400">
                  {(() => {
                    const sorted = [...(abTests.data ?? [])].sort((a, b) => {
                      const cvrA = a.clicks > 0 ? a.conversions / a.clicks : 0;
                      const cvrB = b.clicks > 0 ? b.conversions / b.clicks : 0;
                      return cvrB - cvrA;
                    });
                    const best = sorted[0];
                    if (!best) return "Zatím nedostatek dat pro doporučení.";
                    const cvr = best.clicks > 0 ? ((best.conversions / best.clicks) * 100).toFixed(1) : "0";
                    return `Nejlepší varianta: "${best.variant}" s konverzním poměrem ${cvr}%. Doporučujeme ji použít jako výchozí.`;
                  })()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== BLOG EDITOR TAB ===== */}
        {activeTab === "blog" && (
          <div className="space-y-6">
            {!blogEditorOpen ? (
              <>
                {/* Blog posts list */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[Space_Grotesk] text-lg font-bold text-white">Blog články</h2>
                  <Button
                    onClick={() => { resetBlogForm(); setBlogEditorOpen(true); }}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Nový článek
                  </Button>
                </div>

                {blogPosts.isLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-amber-400 animate-spin" /></div>
                ) : (blogPosts.data ?? []).length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-10 text-center">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Zatím žádné články. Vytvořte první!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(blogPosts.data ?? []).map((post) => (
                      <div key={post.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white text-sm truncate">{post.titleCs}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              post.status === "published" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                            }`}>
                              {post.status === "published" ? "Publikováno" : "Koncept"}
                            </span>
                            {post.category && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">{post.category}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>/{post.slug}</span>
                            <span>{post.author}</span>
                            <span>{post.readingTime} min čtení</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {post.status === "published" && (
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="border-white/10 text-gray-400 hover:text-white">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          )}
                          <Button variant="outline" size="sm" className="border-white/10 text-gray-400 hover:text-amber-400" onClick={() => openEditPost(post)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            className="border-white/10 text-gray-400 hover:text-red-400"
                            onClick={() => { if (confirm("Opravdu smazat tento článek?")) deletePost.mutate({ id: post.id }); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Blog Editor Form */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-[Space_Grotesk] text-lg font-bold text-white">
                    {editingPostId ? "Upravit článek" : "Nový článek"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" size="sm"
                      className={`border-white/10 ${previewMode ? "text-amber-400 border-amber-500/30" : "text-gray-400"}`}
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="w-4 h-4 mr-1" /> Náhled
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/10 text-gray-400" onClick={resetBlogForm}>
                      <X className="w-4 h-4 mr-1" /> Zrušit
                    </Button>
                    <Button
                      className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                      onClick={handleSaveBlogPost}
                      disabled={createPost.isPending || updatePost.isPending || !blogForm.titleCs || !blogForm.contentCs}
                    >
                      {(createPost.isPending || updatePost.isPending) ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      Uložit
                    </Button>
                  </div>
                </div>

                {previewMode ? (
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8">
                    <h1 className="font-[Space_Grotesk] text-3xl font-bold text-white mb-4">{blogForm.titleCs || "Bez názvu"}</h1>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
                      <span>{blogForm.author}</span>
                      <span>•</span>
                      <span>{blogForm.readingTime} min čtení</span>
                      {blogForm.category && <><span>•</span><span className="text-purple-400">{blogForm.category}</span></>}
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <Streamdown>{blogForm.contentCs || "*Zatím žádný obsah...*"}</Streamdown>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left column - Content */}
                    <div className="space-y-4">
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-400" /> Obsah (CZ)
                        </h3>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Název *</label>
                          <input
                            type="text" value={blogForm.titleCs}
                            onChange={(e) => {
                              const title = e.target.value;
                              setBlogForm(f => ({ ...f, titleCs: title, slug: f.slug || autoSlug(title) }));
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none"
                            placeholder="Název článku..."
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Obsah (Markdown) *</label>
                          <textarea
                            value={blogForm.contentCs}
                            onChange={(e) => setBlogForm(f => ({ ...f, contentCs: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none min-h-[300px] font-mono"
                            placeholder="Markdown obsah článku..."
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Výtah</label>
                          <textarea
                            value={blogForm.excerptCs}
                            onChange={(e) => setBlogForm(f => ({ ...f, excerptCs: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none min-h-[80px]"
                            placeholder="Krátký výtah pro náhled..."
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                        <h3 className="font-semibold text-white text-sm">Obsah (EN) — volitelné</h3>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Title</label>
                          <input
                            type="text" value={blogForm.titleEn}
                            onChange={(e) => setBlogForm(f => ({ ...f, titleEn: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none"
                            placeholder="English title..."
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Content (Markdown)</label>
                          <textarea
                            value={blogForm.contentEn}
                            onChange={(e) => setBlogForm(f => ({ ...f, contentEn: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none min-h-[200px] font-mono"
                            placeholder="English markdown content..."
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Excerpt</label>
                          <textarea
                            value={blogForm.excerptEn}
                            onChange={(e) => setBlogForm(f => ({ ...f, excerptEn: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none min-h-[60px]"
                            placeholder="Short English excerpt..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right column - SEO & Settings */}
                    <div className="space-y-4">
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                        <h3 className="font-semibold text-white text-sm">Nastavení</h3>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Slug (URL) *</label>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">/blog/</span>
                            <input
                              type="text" value={blogForm.slug}
                              onChange={(e) => setBlogForm(f => ({ ...f, slug: e.target.value }))}
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none font-mono"
                              placeholder="url-slug"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Kategorie</label>
                            <input
                              type="text" value={blogForm.category}
                              onChange={(e) => setBlogForm(f => ({ ...f, category: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none"
                              placeholder="AI, Marketing..."
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Doba čtení (min)</label>
                            <input
                              type="number" value={blogForm.readingTime} min={1} max={60}
                              onChange={(e) => setBlogForm(f => ({ ...f, readingTime: Number(e.target.value) }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Autor</label>
                          <input
                            type="text" value={blogForm.author}
                            onChange={(e) => setBlogForm(f => ({ ...f, author: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Cover Image URL</label>
                          <input
                            type="text" value={blogForm.coverImage}
                            onChange={(e) => setBlogForm(f => ({ ...f, coverImage: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Stav</label>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setBlogForm(f => ({ ...f, status: "draft" }))}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                blogForm.status === "draft" ? "bg-gray-500/20 text-white border border-gray-500/30" : "bg-white/5 text-gray-400 border border-white/5"
                              }`}
                            >
                              Koncept
                            </button>
                            <button
                              onClick={() => setBlogForm(f => ({ ...f, status: "published" }))}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                blogForm.status === "published" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/5 text-gray-400 border border-white/5"
                              }`}
                            >
                              Publikovat
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                        <h3 className="font-semibold text-white text-sm">SEO Metadata</h3>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Meta popis (CZ)</label>
                          <textarea
                            value={blogForm.metaDescriptionCs}
                            onChange={(e) => setBlogForm(f => ({ ...f, metaDescriptionCs: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none min-h-[60px]"
                            placeholder="SEO popis pro vyhledávače..."
                            maxLength={300}
                          />
                          <span className="text-[10px] text-gray-600">{blogForm.metaDescriptionCs.length}/300</span>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Meta Description (EN)</label>
                          <textarea
                            value={blogForm.metaDescriptionEn}
                            onChange={(e) => setBlogForm(f => ({ ...f, metaDescriptionEn: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 focus:outline-none min-h-[60px]"
                            placeholder="SEO description for search engines..."
                            maxLength={300}
                          />
                          <span className="text-[10px] text-gray-600">{blogForm.metaDescriptionEn.length}/300</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== SEO & GSC TAB ===== */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <h2 className="font-[Space_Grotesk] text-xl font-bold text-white">SEO & Google Search Console</h2>

            {/* GSC Verification Status */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Google Search Console</h3>
                  <p className="text-xs text-gray-400">Ověření vlastnictví webu</p>
                </div>
              </div>
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Meta tag nakonfigurován</span>
                </div>
                <code className="text-xs text-gray-400 block bg-black/30 rounded p-2 overflow-x-auto">
                  {'<meta name="google-site-verification" content="7Aee29k8..." />'}
                </code>
              </div>
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/20 transition-all"
              >
                <ExternalLink className="w-3 h-3" /> Otevřít Google Search Console
              </a>
            </div>

            {/* Sitemap Status */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sitemap & Robots.txt</h3>
                  <p className="text-xs text-gray-400">Dynamicky generované soubory pro crawlery</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">sitemap.xml</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Aktivní</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Dynamický sitemap s blog články, priority hierarchií a lastmod</p>
                  <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Zobrazit sitemap.xml
                  </a>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">robots.txt</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Aktivní</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Pravidla pro crawlery: Allow blog, Disallow admin/api</p>
                  <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Zobrazit robots.txt
                  </a>
                </div>
              </div>
              <SitemapPingButton />
            </div>

            {/* Schema.org Status */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Schema.org Structured Data</h3>
                  <p className="text-xs text-gray-400">JSON-LD pro rich snippets ve vyhledávání</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Organization", page: "Home" },
                  { name: "WebSite + Search", page: "Home" },
                  { name: "BreadcrumbList", page: "Home, Blog, Article" },
                  { name: "Product (3x)", page: "Home (Pricing)" },
                  { name: "FAQPage (8 Q&A)", page: "Home (FAQ)" },
                  { name: "ItemList (77 iBotů)", page: "Home (Catalog)" },
                  { name: "BlogPosting", page: "Blog Articles" },
                ].map((schema) => (
                  <div key={schema.name} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span className="text-xs font-medium text-white">{schema.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{schema.page}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-amber-400 hover:underline"
              >
                <ExternalLink className="w-3 h-3" /> Otestovat v Google Rich Results Test
              </a>
            </div>

            {/* SEO Checklist */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> SEO Checklist
              </h3>
              {[
                { done: true, text: "Meta title a description" },
                { done: true, text: "Open Graph tagy (og:title, og:description, og:type)" },
                { done: true, text: "Google Search Console verification meta tag" },
                { done: true, text: "Dynamický sitemap.xml s blog články" },
                { done: true, text: "robots.txt s pravidly pro crawlery" },
                { done: true, text: "Schema.org BreadcrumbList" },
                { done: true, text: "Schema.org Product (cenové plány)" },
                { done: true, text: "Schema.org FAQPage" },
                { done: true, text: "Schema.org Organization + WebSite" },
                { done: true, text: "Schema.org BlogPosting" },
                { done: true, text: "Sitemap ping endpoint pro Google" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${item.done ? "text-green-400" : "text-gray-600"}`} />
                  <span className={`text-sm ${item.done ? "text-gray-300" : "text-gray-500"}`}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sitemap Ping Button component
function SitemapPingButton() {
  const [pinging, setPinging] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handlePing = async () => {
    setPinging(true);
    setResult(null);
    try {
      const res = await fetch("/api/sitemap/ping");
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: "Nepodařilo se kontaktovat server." });
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePing}
        disabled={pinging}
        className="bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
        variant="outline"
        size="sm"
      >
        {pinging ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <RefreshCw className="w-3 h-3 mr-2" />}
        Odeslat sitemap do Google
      </Button>
      {result && (
        <div className={`text-xs px-3 py-2 rounded-lg ${result.success ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {result.message}
        </div>
      )}
    </div>
  );
}
