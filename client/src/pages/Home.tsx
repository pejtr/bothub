import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ParallaxDecorations } from "@/components/ParallaxDecorations";
import { UnlockModal } from "@/components/UnlockModal";
import { RegistrationModal } from "@/components/RegistrationModal";
import { AffiliateModal } from "@/components/AffiliateModal";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { Testimonials } from "@/components/Testimonials";
import { LiveChatDemo } from "@/components/LiveChatDemo";
import { SocialProofWidget } from "@/components/SocialProofWidget";
import { CountdownBanner } from "@/components/CountdownBanner";
import { VideoShowcase } from "@/components/VideoShowcase";
import { AnimatedSection } from "@/components/AnimatedSection";
import { FAQ, faqItems } from "@/components/FAQ";
import { HomePageSchema } from "@/components/SchemaOrg";
import { categories, getIBotsByCategory } from "@/data/ibots";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { NotificationBell } from "@/components/NotificationBell";
import { WishlistBadge } from "@/components/WishlistBadge";
import { getCTAText, trackCTAClick, getUserCTAVariant } from "@/lib/ctaAbTest";
import { useI18n, LanguageSwitcher } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import {
  Zap, Lock, Crown, CheckCircle2, ArrowRight, Bot, MessageSquare,
  Globe, Send, Cpu, BarChart3, Shield, Users, Star, ChevronRight,
  Sparkles, TrendingUp, Clock, Target, ExternalLink, Menu, X
} from "lucide-react";

type Plan = "free" | "gold" | "diamond";

export default function Home() {
  const { t, locale } = useI18n();
  const [activeCategory, setActiveCategory] = useState("sales");
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [affiliateModalOpen, setAffiliateModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("free");
  const [registrationSource, setRegistrationSource] = useState("hero_cta");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ctaText = useMemo(() => getCTAText(), []);
  const ctaImpression = trpc.tracking.ctaImpression.useMutation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const unlocked = localStorage.getItem("ibots_unlocked");
    if (unlocked === "true") setIsUnlocked(true);
  }, []);

  useEffect(() => {
    const variant = getUserCTAVariant();
    ctaImpression.mutate({ variant });
  }, []);

  const openRegistration = (plan: Plan, source: string) => {
    trackCTAClick(`#registration-${plan}`);
    setSelectedPlan(plan);
    setRegistrationSource(source);
    setRegistrationModalOpen(true);
  };

  const handleHeroCTA = () => openRegistration("free", "hero_cta");
  const handleNavCTA = () => openRegistration("free", "nav_cta");
  const handlePricingCTA = (plan: Plan) => openRegistration(plan, `pricing_${plan}`);
  const handleAffiliateCTA = () => { trackCTAClick("#affiliate-register"); setAffiliateModalOpen(true); };
  const handleFinalCTA = () => openRegistration("free", "final_cta");
  const handleCountdownCTA = () => openRegistration("gold", "countdown_banner");
  const handleUnlock = () => setIsUnlocked(true);

  const currentBots = getIBotsByCategory(activeCategory);

  // Category name based on locale
  const getCatName = (cat: typeof categories[0]) => locale === "en" ? cat.name : cat.nameCs;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative">
      {/* Schema.org Structured Data */}
      <HomePageSchema
        locale={locale as "cs" | "en"}
        faqItems={faqItems.map(item => ({
          question: locale === "en" ? item.questionEn : item.questionCs,
          answer: locale === "en" ? item.answerEn : item.answerCs,
        }))}
      />
      <ParallaxDecorations />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-amber-400" />
            <span className="font-[Space_Grotesk] font-bold text-xl">
              <span className="text-amber-400">BOT</span>HUB
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#catalog" className="hover:text-amber-400 transition-colors">{t("nav.catalog")}</a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">{t("nav.pricing")}</a>
            <a href="#affiliate" className="hover:text-amber-400 transition-colors">{t("nav.affiliate")}</a>
            <a href="#platforms" className="hover:text-amber-400 transition-colors">{t("nav.platforms")}</a>
            {isAuthenticated && (
              <Link href="/dashboard" className="hover:text-amber-400 transition-colors">{locale === "cs" ? "Dashboard" : "Dashboard"}</Link>
            )}
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated && <WishlistBadge />}
            <LanguageSwitcher />
            <Button
              onClick={handleNavCTA}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              {ctaText}
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/5 px-4 pb-4 space-y-3">
            <a href="#catalog" className="block text-gray-400 hover:text-amber-400 py-2" onClick={() => setMobileMenuOpen(false)}>{t("nav.catalog")}</a>
            <a href="#pricing" className="block text-gray-400 hover:text-amber-400 py-2" onClick={() => setMobileMenuOpen(false)}>{t("nav.pricing")}</a>
            <a href="#affiliate" className="block text-gray-400 hover:text-amber-400 py-2" onClick={() => setMobileMenuOpen(false)}>{t("nav.affiliate")}</a>
            <a href="#platforms" className="block text-gray-400 hover:text-amber-400 py-2" onClick={() => setMobileMenuOpen(false)}>{t("nav.platforms")}</a>
            <Button onClick={() => { handleNavCTA(); setMobileMenuOpen(false); }} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              {ctaText}
            </Button>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />

        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">{t("hero.badge")}</span>
          </div>

          <h1 className="font-[Space_Grotesk] text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 max-w-4xl mx-auto">
            {t("hero.title1")}{" "}
            <span className="text-gradient-gold">{t("hero.title2")}</span>{" "}
            {t("hero.title3")}
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {locale === "cs" ? (
              <>Zvyšte své prodeje o <span className="text-amber-400 font-semibold">+42 %</span> a získejte{" "}
              <span className="text-amber-400 font-semibold">327% ROI</span> díky unikátním AI osobnostem.
              Platforma nové generace pro automatizaci prodeje, zákaznické podpory a osobního rozvoje.</>
            ) : (
              <>Boost your sales by <span className="text-amber-400 font-semibold">+42%</span> and achieve{" "}
              <span className="text-amber-400 font-semibold">327% ROI</span> with unique AI personalities.
              Next-gen platform for automating sales, customer support, and personal development.</>
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleHeroCTA}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-lg px-8 py-7 pulse-gold"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white px-8 py-7"
              onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
            >
              {t("hero.cta.catalog")}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-14 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>{t("hero.trust1")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{t("hero.trust2")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>{t("hero.trust3")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COUNTDOWN BANNER ===== */}
      <CountdownBanner onClaim={handleCountdownCTA} />

      {/* ===== PROBLEM / SOLUTION ===== */}
      <AnimatedSection>
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-purple-400 tracking-wider uppercase mb-3 block">{t("ps.label")}</span>
            <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold max-w-3xl mx-auto leading-tight">
              {locale === "cs" ? (
                <><span className="text-red-400">89 % firem selhává</span> při implementaci AI — my to řešíme</>
              ) : (
                <><span className="text-red-400">89% of companies fail</span> at AI implementation — we fix that</>
              )}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02] backdrop-blur-sm">
              <div className="grid grid-cols-3 bg-white/5">
                <div className="p-4 md:p-5 text-sm font-semibold text-gray-400">{t("ps.header.feature")}</div>
                <div className="p-4 md:p-5 text-sm font-semibold text-red-400 text-center">{t("ps.header.traditional")}</div>
                <div className="p-4 md:p-5 text-sm font-semibold text-amber-400 text-center">✅ {t("ps.header.ibot")}</div>
              </div>
              {[
                { feature: t("ps.row1.feature"), traditional: t("ps.row1.traditional"), ibot: t("ps.row1.ibot") },
                { feature: t("ps.row2.feature"), traditional: t("ps.row2.traditional"), ibot: t("ps.row2.ibot") },
                { feature: t("ps.row3.feature"), traditional: t("ps.row3.traditional"), ibot: t("ps.row3.ibot") },
                { feature: t("ps.row4.feature"), traditional: t("ps.row4.traditional"), ibot: t("ps.row4.ibot") },
                { feature: t("ps.row5.feature"), traditional: t("ps.row5.traditional"), ibot: t("ps.row5.ibot") },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-3 ${i < 4 ? "border-b border-white/5" : ""}`}>
                  <div className="p-4 md:p-5 text-sm md:text-base text-gray-300">{row.feature}</div>
                  <div className="p-4 md:p-5 text-sm md:text-base text-red-400/70 text-center">{row.traditional}</div>
                  <div className="p-4 md:p-5 text-sm md:text-base text-amber-400 font-semibold text-center">{row.ibot}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* ===== CATALOG ===== */}
      <AnimatedSection delay={0.1}>
      <section id="catalog" className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-amber-400 tracking-wider uppercase mb-3 block">{t("catalog.label")}</span>
            <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold">
              <span className="text-gradient-gold">{t("catalog.title1")}</span>{t("catalog.title2")}
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">{t("catalog.subtitle")}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                {getCatName(cat)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentBots.map((bot) => {
              const isFeatured = bot.featured;
              const isLocked = !isFeatured && !isUnlocked;
              return (
                <div
                  key={bot.id}
                  onClick={() => isLocked && setUnlockModalOpen(true)}
                  className={`relative rounded-xl border p-5 transition-all duration-300 ${
                    isFeatured
                      ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 glow-gold"
                      : isLocked
                      ? "border-white/5 bg-white/[0.02] cursor-pointer hover:border-amber-500/20"
                      : "border-white/5 bg-white/[0.02] card-hover-glow"
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-3 left-4 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold px-3 py-1 rounded-full">
                      <Crown className="w-3 h-3" />
                      {t("catalog.featured").toUpperCase()}
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute inset-0 bg-[#0A0A0F]/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center z-10">
                      <Lock className="w-6 h-6 text-amber-400/60 mb-2" />
                      <span className="text-xs text-amber-400/60 font-medium">{t("catalog.locked")}</span>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 overflow-hidden ${
                    isFeatured ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-gray-400"
                  }`}>
                    {bot.imageUrl ? (
                      <img src={bot.imageUrl} alt={bot.name} className="w-full h-full object-cover" />
                    ) : (
                      <Bot className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className={`font-[Space_Grotesk] font-bold text-base mb-1 ${isFeatured ? "text-amber-400" : "text-white"}`}>
                    {bot.name}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-2">{bot.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {bot.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${
                        isFeatured ? "bg-amber-500/10 text-amber-400/80" : "bg-white/5 text-gray-500"
                      }`}>{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {!isUnlocked && (
            <div className="text-center mt-10">
              <Button
                onClick={() => setUnlockModalOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 py-6 text-base"
              >
                <Lock className="w-4 h-4 mr-2" />
                {t("catalog.unlock.cta")}
              </Button>
            </div>
          )}
        </div>
      </section>

      </AnimatedSection>

      {/* ===== VALUE PROPOSITION (Hormozi Equation) ===== */}
      <AnimatedSection>
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.03] to-transparent" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-amber-400 tracking-wider uppercase mb-3 block">{t("value.label")}</span>
            <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
              {t("value.title1")}<span className="text-gradient-gold">{t("value.title2")}</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto mb-16">
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-purple-500/5 p-8 md:p-10">
              <div className="text-center mb-8">
                <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Hormozi Value Equation</p>
                <div className="font-[Space_Grotesk] text-xl md:text-2xl font-bold">
                  <span className="text-white">Value = </span>
                  <span className="text-amber-400">(Dream Outcome × Perceived Likelihood)</span>
                  <span className="text-white"> / </span>
                  <span className="text-purple-400">(Time Delay × Effort & Sacrifice)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> {t("value.maximize").toUpperCase()}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-green-500/5 rounded-lg p-3">
                      <Target className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{t("value.dreamOutcome")}</p>
                        <p className="text-xs text-gray-400">{t("value.dreamOutcomeDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-green-500/5 rounded-lg p-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{t("value.perceivedLikelihood")}</p>
                        <p className="text-xs text-gray-400">{t("value.perceivedLikelihoodDesc")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 rotate-180" /> {t("value.minimize").toUpperCase()}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-red-500/5 rounded-lg p-3">
                      <Clock className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{t("value.timeDelay")}</p>
                        <p className="text-xs text-gray-400">{t("value.timeDelayDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-red-500/5 rounded-lg p-3">
                      <Zap className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{t("value.effortSacrifice")}</p>
                        <p className="text-xs text-gray-400">{t("value.effortSacrificeDesc")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: "+327%", label: t("value.metric.roi"), icon: TrendingUp, color: "text-amber-400" },
              { value: "+42%", label: t("value.metric.conversion"), icon: BarChart3, color: "text-green-400" },
              { value: "89%", label: t("value.metric.satisfaction"), icon: Star, color: "text-purple-400" },
              { value: t("value.metric.deploy.value"), label: t("value.metric.deploy"), icon: Clock, color: "text-blue-400" },
            ].map((metric) => (
              <div key={metric.label} className="text-center p-6 rounded-2xl border border-white/5 bg-white/[0.02] card-hover-glow">
                <metric.icon className={`w-8 h-8 ${metric.color} mx-auto mb-3`} />
                <div className={`font-[Space_Grotesk] text-3xl md:text-4xl font-black ${metric.color}`}>{metric.value}</div>
                <p className="text-sm text-gray-400 mt-2">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      </AnimatedSection>

      {/* ===== VIDEO SHOWCASE ===== */}
      <VideoShowcase />

      {/* ===== TESTIMONIALS ===== */}
      <Testimonials />

      {/* ===== PRICING ===== */}
      <AnimatedSection>
      <section id="pricing" className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-purple-400 tracking-wider uppercase mb-3 block">{t("pricing.label")}</span>
            <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold">
              {t("pricing.title1")}<span className="text-gradient-gold">{t("pricing.title2")}</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-lg">{t("pricing.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* FREE */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="font-[Space_Grotesk] text-xl font-bold text-gray-300">{t("pricing.free.name")}</h3>
                <div className="mt-3">
                  <span className="font-[Space_Grotesk] text-4xl font-black text-white">{t("pricing.free.price")}</span>
                  <span className="text-gray-500 text-sm">/{t("pricing.free.period")}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[t("pricing.free.f1"), t("pricing.free.f2"), t("pricing.free.f3"), t("pricing.free.f4")].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gray-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full border-white/10 text-gray-300 hover:bg-white/5 py-6" onClick={() => handlePricingCTA("free")}>
                {t("pricing.free.cta")}
              </Button>
            </div>

            {/* GOLD */}
            <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent p-8 flex flex-col relative glow-gold">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold px-4 py-1.5 rounded-full">
                {t("pricing.gold.badge")}
              </div>
              <div className="mb-6">
                <h3 className="font-[Space_Grotesk] text-xl font-bold text-amber-400">{t("pricing.gold.name")}</h3>
                <div className="mt-3">
                  <span className="font-[Space_Grotesk] text-4xl font-black text-white">{t("pricing.gold.price")}</span>
                  <span className="text-gray-500 text-sm">{t("pricing.gold.period")}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[t("pricing.gold.f1"), t("pricing.gold.f2"), t("pricing.gold.f3"), t("pricing.gold.f4"), t("pricing.gold.f5"), t("pricing.gold.f6")].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6 pulse-gold" onClick={() => handlePricingCTA("gold")}>
                {t("pricing.gold.cta")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* DIAMOND */}
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent p-8 flex flex-col relative glow-purple">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> PREMIUM
              </div>
              <div className="mb-6">
                <h3 className="font-[Space_Grotesk] text-xl font-bold text-purple-400">{t("pricing.diamond.name")}</h3>
                <div className="mt-3">
                  <span className="font-[Space_Grotesk] text-4xl font-black text-white">{t("pricing.diamond.price")}</span>
                  <span className="text-gray-500 text-sm">{t("pricing.diamond.period")}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[t("pricing.diamond.f1"), t("pricing.diamond.f2"), t("pricing.diamond.f3"), t("pricing.diamond.f4"), t("pricing.diamond.f5"), t("pricing.diamond.f6"), t("pricing.diamond.f7")].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-6" onClick={() => handlePricingCTA("diamond")}>
                {t("pricing.diamond.cta")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      </AnimatedSection>

      {/* ===== AFFILIATE ===== */}
      <AnimatedSection direction="left">
      <section id="affiliate" className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-amber-400 tracking-wider uppercase mb-3 block">{t("affiliate.label")}</span>
              <h2 className="font-[Space_Grotesk] text-3xl md:text-4xl font-bold mb-6">
                {t("affiliate.title1")}<span className="text-gradient-gold">{t("affiliate.title2")}</span>{t("affiliate.title3")}
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">{t("affiliate.subtitle")}</p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: TrendingUp, title: t("affiliate.benefit1.title"), desc: t("affiliate.benefit1.desc") },
                  { icon: BarChart3, title: t("affiliate.benefit2.title"), desc: t("affiliate.benefit2.desc") },
                  { icon: Sparkles, title: t("affiliate.benefit3.title"), desc: t("affiliate.benefit3.desc") },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 bg-white/[0.02] rounded-xl p-4 border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 py-6"
                onClick={handleAffiliateCTA}
              >
                {t("affiliate.cta")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-purple-500/5 p-8">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-400 mb-2">{t("affiliate.visual.title")}</p>
                  <div className="font-[Space_Grotesk] text-5xl font-black text-gradient-gold">
                    {locale === "cs" ? "38 115 Kč" : "$1,524"}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {locale === "cs" ? "při 20 zákaznících na GOLD plánu" : "with 20 customers on GOLD plan"}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                    <span className="text-sm text-gray-400">{locale === "cs" ? "20× GOLD (990 Kč)" : "20× GOLD ($39)"}</span>
                    <span className="text-sm font-semibold text-amber-400">{locale === "cs" ? "19 800 Kč" : "$780"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                    <span className="text-sm text-gray-400">{locale === "cs" ? "Vaše provize (66%)" : "Your commission (66%)"}</span>
                    <span className="text-sm font-semibold text-green-400">{locale === "cs" ? "13 068 Kč" : "$515"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                    <span className="text-sm text-amber-300 font-medium">{locale === "cs" ? "Ročně (opakovaně)" : "Yearly (recurring)"}</span>
                    <span className="text-sm font-bold text-amber-400">{locale === "cs" ? "156 816 Kč" : "$6,180"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      </AnimatedSection>

      {/* ===== PLATFORMS ===== */}
      <AnimatedSection direction="right">
      <section id="platforms" className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-purple-400 tracking-wider uppercase mb-3 block">{t("platforms.label")}</span>
            <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold">
              {t("platforms.title1")}<span className="text-gradient-purple">{t("platforms.title2")}</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">{t("platforms.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Globe, name: t("platforms.web.title"), desc: t("platforms.web.desc"), status: locale === "cs" ? "Dostupné" : "Available" },
              { icon: Send, name: t("platforms.telegram.title"), desc: t("platforms.telegram.desc"), status: locale === "cs" ? "Dostupné" : "Available" },
              { icon: MessageSquare, name: t("platforms.discord.title"), desc: t("platforms.discord.desc"), status: locale === "cs" ? "Dostupné" : "Available" },
              { icon: Cpu, name: t("platforms.api.title"), desc: t("platforms.api.desc"), status: "api.bothub.cz", link: true },
            ].map((platform) => (
              <div key={platform.name} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center card-hover-glow">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <platform.icon className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="font-[Space_Grotesk] font-bold text-white mb-2">{platform.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{platform.desc}</p>
                <span className={`text-xs font-medium ${platform.link ? "text-purple-400" : "text-green-400"}`}>
                  {platform.link ? (
                    <span className="flex items-center justify-center gap-1">{platform.status}<ExternalLink className="w-3 h-3" /></span>
                  ) : (
                    <span className="flex items-center justify-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" />{platform.status}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* ===== FAQ ===== */}
      <AnimatedSection direction="fade">
        <FAQ />
      </AnimatedSection>

      {/* ===== FINAL CTA ===== */}
      <AnimatedSection direction="fade">
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.03] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="container relative z-10 text-center">
          <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl lg:text-6xl font-black max-w-3xl mx-auto leading-tight mb-6">
            {t("final.title1")}<span className="text-gradient-gold">{t("final.title2")}</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">{t("final.subtitle")}</p>
          <Button
            onClick={handleFinalCTA}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-lg px-10 py-7 pulse-gold"
          >
            {t("final.cta")} <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">{t("final.note")}</p>
        </div>
      </section>
      </AnimatedSection>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-7 h-7 text-amber-400" />
                <span className="font-[Space_Grotesk] font-bold text-lg">
                  <span className="text-amber-400">BOT</span>HUB
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{t("footer.desc")}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">{t("footer.product")}</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#catalog" className="hover:text-amber-400 transition-colors">{t("nav.catalog")}</a></li>
                <li><a href="#pricing" className="hover:text-amber-400 transition-colors">{t("nav.pricing")}</a></li>
                <li><a href="#platforms" className="hover:text-amber-400 transition-colors">{t("nav.platforms")}</a></li>
                <li><a href="/blog" className="hover:text-amber-400 transition-colors">{t("nav.blog")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">{t("footer.partners")}</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#affiliate" className="hover:text-amber-400 transition-colors">{t("footer.affiliate")}</a></li>
                <li><a href="https://api.bothub.cz" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1">{t("footer.api")} <ExternalLink className="w-3 h-3" /></a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">{t("footer.contact")}</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="mailto:info@bothub.cz" className="hover:text-amber-400 transition-colors">info@bothub.cz</a></li>
                <li><span>{t("footer.terms")}</span></li>
                <li><span>{t("footer.privacy")}</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">{t("footer.copyright")}</p>
            <p className="text-xs text-gray-600">{t("footer.powered")}</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UnlockModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} onUnlock={handleUnlock} />
      <RegistrationModal open={registrationModalOpen} onOpenChange={setRegistrationModalOpen} initialPlan={selectedPlan} source={registrationSource} />
      <AffiliateModal open={affiliateModalOpen} onOpenChange={setAffiliateModalOpen} />
      <ExitIntentPopup onRegister={(plan, source) => openRegistration(plan, source)} />
      <LiveChatDemo />
      <SocialProofWidget />
    </div>
  );
}
