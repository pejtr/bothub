import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ParallaxDecorations } from "@/components/ParallaxDecorations";
import { UnlockModal } from "@/components/UnlockModal";
import { categories, ibots, getIBotsByCategory } from "@/data/ibots";
import { getCTAText, trackCTAClick, getUserCTAVariant } from "@/lib/ctaAbTest";
import { trpc } from "@/lib/trpc";
import {
  Zap, Lock, Crown, CheckCircle2, ArrowRight, Bot, MessageSquare,
  Globe, Send, Cpu, BarChart3, Shield, Users, Star, ChevronRight,
  Sparkles, TrendingUp, Clock, Target, ExternalLink, Menu, X
} from "lucide-react";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("sales");
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ctaText = useMemo(() => getCTAText(), []);
  const ctaImpression = trpc.tracking.ctaImpression.useMutation();

  useEffect(() => {
    const unlocked = localStorage.getItem("ibots_unlocked");
    if (unlocked === "true") setIsUnlocked(true);
  }, []);

  useEffect(() => {
    const variant = getUserCTAVariant();
    ctaImpression.mutate({ variant });
  }, []);

  const handleCTAClick = () => {
    trackCTAClick("#pricing");
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  const currentBots = getIBotsByCategory(activeCategory);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative">
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
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#catalog" className="hover:text-amber-400 transition-colors">Katalog iBotů</a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">Ceník</a>
            <a href="#affiliate" className="hover:text-amber-400 transition-colors">Affiliate</a>
            <a href="#platforms" className="hover:text-amber-400 transition-colors">Platformy</a>
            <Button
              onClick={handleCTAClick}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              {ctaText}
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/5 px-4 pb-4 space-y-3">
            <a href="#catalog" className="block text-gray-400 hover:text-amber-400 py-2" onClick={() => setMobileMenuOpen(false)}>Katalog iBotů</a>
            <a href="#pricing" className="block text-gray-400 hover:text-amber-400 py-2" onClick={() => setMobileMenuOpen(false)}>Ceník</a>
            <a href="#affiliate" className="block text-gray-400 hover:text-amber-400 py-2" onClick={() => setMobileMenuOpen(false)}>Affiliate</a>
            <a href="#platforms" className="block text-gray-400 hover:text-amber-400 py-2" onClick={() => setMobileMenuOpen(false)}>Platformy</a>
            <Button onClick={() => { handleCTAClick(); setMobileMenuOpen(false); }} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              {ctaText}
            </Button>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />

        <div className="container relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">77 AI osobností ve 7 kategoriích</span>
          </div>

          <h1 className="font-[Space_Grotesk] text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 max-w-4xl mx-auto">
            AI chatboti, kteří{" "}
            <span className="text-gradient-gold">PRODÁVAJÍ</span>{" "}
            za vás
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Zvyšte své prodeje o <span className="text-amber-400 font-semibold">+42 %</span> a získejte{" "}
            <span className="text-amber-400 font-semibold">327% ROI</span> díky unikátním AI osobnostem.
            Platforma nové generace pro automatizaci prodeje, zákaznické podpory a osobního rozvoje.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleCTAClick}
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
              Prohlédnout katalog
            </Button>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-14 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Žádná kreditní karta</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Nasazení do 5 minut</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>500+ firem</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM / SOLUTION ===== */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-purple-400 tracking-wider uppercase mb-3 block">Problém & Řešení</span>
            <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold max-w-3xl mx-auto leading-tight">
              <span className="text-red-400">89 % firem selhává</span> při implementaci AI — my to řešíme
            </h2>
            <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg">
              Podle studie MIT z roku 2025 většina AI implementací nedosáhne očekávaného ROI.
              Hlavní důvody? Generické odpovědi, nulová konverze a složitý onboarding.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02] backdrop-blur-sm">
              {/* Header */}
              <div className="grid grid-cols-3 bg-white/5">
                <div className="p-4 md:p-5 text-sm font-semibold text-gray-400">Problém</div>
                <div className="p-4 md:p-5 text-sm font-semibold text-red-400 text-center">Tradiční Chatbot</div>
                <div className="p-4 md:p-5 text-sm font-semibold text-amber-400 text-center">✅ iBots Řešení</div>
              </div>
              {/* Rows */}
              {[
                { problem: "🤖 Generické odpovědi", traditional: "Ano", ibots: "Unikátní osobnost" },
                { problem: "📉 Nulová konverze", traditional: "Ano", ibots: "Hormozi prodejní principy" },
                { problem: "🤯 Složitý setup", traditional: "Ano", ibots: "Nasazení do 5 minut" },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-3 ${i < 2 ? "border-b border-white/5" : ""}`}>
                  <div className="p-4 md:p-5 text-sm md:text-base text-gray-300">{row.problem}</div>
                  <div className="p-4 md:p-5 text-sm md:text-base text-red-400/70 text-center">{row.traditional}</div>
                  <div className="p-4 md:p-5 text-sm md:text-base text-amber-400 font-semibold text-center">{row.ibots}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATALOG ===== */}
      <section id="catalog" className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-amber-400 tracking-wider uppercase mb-3 block">Katalog</span>
            <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold">
              <span className="text-gradient-gold">77 AI osobností</span> ve 7 kategoriích
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
              Každý iBot je trénovaný na komunikační styl a principy reálné osobnosti.
              Vyberte si personu, která nejlépe odpovídá vašim potřebám.
            </p>
          </div>

          {/* Category Tabs */}
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
                {cat.nameCs}
              </button>
            ))}
          </div>

          {/* Bot Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentBots.map((bot, index) => {
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
                  {/* Featured badge */}
                  {isFeatured && (
                    <div className="absolute -top-3 left-4 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold px-3 py-1 rounded-full">
                      <Crown className="w-3 h-3" />
                      FEATURED
                    </div>
                  )}

                  {/* Lock overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-[#0A0A0F]/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center z-10">
                      <Lock className="w-6 h-6 text-amber-400/60 mb-2" />
                      <span className="text-xs text-amber-400/60 font-medium">Klikni pro odemčení</span>
                    </div>
                  )}

                  {/* Bot avatar */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                    isFeatured
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-white/5 text-gray-400"
                  }`}>
                    <Bot className="w-6 h-6" />
                  </div>

                  <h3 className={`font-[Space_Grotesk] font-bold text-base mb-1 ${
                    isFeatured ? "text-amber-400" : "text-white"
                  }`}>
                    {bot.name}
                  </h3>

                  <p className="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-2">
                    {bot.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {bot.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isFeatured
                            ? "bg-amber-500/10 text-amber-400/80"
                            : "bg-white/5 text-gray-500"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unlock CTA */}
          {!isUnlocked && (
            <div className="text-center mt-10">
              <Button
                onClick={() => setUnlockModalOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 py-6 text-base"
              >
                <Lock className="w-4 h-4 mr-2" />
                Odemknout všech 77 iBotů ZDARMA
              </Button>
              <p className="text-xs text-gray-500 mt-3">Stačí zadat e-mail. Žádné závazky.</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== VALUE PROPOSITION (Hormozi Equation) ===== */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.03] to-transparent" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-amber-400 tracking-wider uppercase mb-3 block">Hodnotová propozice</span>
            <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
              Nabídka tak dobrá, že byste se cítili{" "}
              <span className="text-gradient-gold">hloupě ji odmítnout</span>
            </h2>
          </div>

          {/* Value Equation Visual */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-purple-500/5 p-8 md:p-10">
              <div className="text-center mb-8">
                <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Hormozi Value Equation</p>
                <div className="font-[Space_Grotesk] text-xl md:text-2xl font-bold">
                  <span className="text-white">Hodnota = </span>
                  <span className="text-amber-400">(Dream Outcome × Perceived Likelihood)</span>
                  <span className="text-white"> / </span>
                  <span className="text-purple-400">(Time Delay × Effort & Sacrifice)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Maximize */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> MAXIMALIZUJEME
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-green-500/5 rounded-lg p-3">
                      <Target className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">Dream Outcome</p>
                        <p className="text-xs text-gray-400">Více peněz, méně práce, automatizace prodeje</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-green-500/5 rounded-lg p-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">Perceived Likelihood</p>
                        <p className="text-xs text-gray-400">Ověřené techniky, reálné výsledky, 500+ firem</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimize */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 rotate-180" /> MINIMALIZUJEME
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-red-500/5 rounded-lg p-3">
                      <Clock className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">Time Delay</p>
                        <p className="text-xs text-gray-400">Okamžitá aktivace, nasazení do 5 minut</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-red-500/5 rounded-lg p-3">
                      <Zap className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">Effort & Sacrifice</p>
                        <p className="text-xs text-gray-400">Nulová práce s nastavováním, žádná kreditní karta</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: "+327%", label: "Průměrné ROI", icon: TrendingUp, color: "text-amber-400" },
              { value: "+42%", label: "Nárůst konverzí", icon: BarChart3, color: "text-green-400" },
              { value: "89%", label: "Spokojenost zákazníků", icon: Star, color: "text-purple-400" },
              { value: "5 min", label: "Průměrný čas nasazení", icon: Clock, color: "text-blue-400" },
            ].map((metric) => (
              <div
                key={metric.label}
                className="text-center p-6 rounded-2xl border border-white/5 bg-white/[0.02] card-hover-glow"
              >
                <metric.icon className={`w-8 h-8 ${metric.color} mx-auto mb-3`} />
                <div className={`font-[Space_Grotesk] text-3xl md:text-4xl font-black ${metric.color}`}>
                  {metric.value}
                </div>
                <p className="text-sm text-gray-400 mt-2">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-purple-400 tracking-wider uppercase mb-3 block">Cenové plány</span>
            <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold">
              Tři jednoduché plány. <span className="text-gradient-gold">Začněte zdarma.</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-lg">
              Férový WIN:WIN model. Žádné skryté poplatky. Žádné závazky.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* FREE */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="font-[Space_Grotesk] text-xl font-bold text-gray-300">FREE</h3>
                <div className="mt-3">
                  <span className="font-[Space_Grotesk] text-4xl font-black text-white">0 Kč</span>
                  <span className="text-gray-500 text-sm">/měsíc</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "3 iBoti k dispozici",
                  "100 konverzací/měsíc",
                  "Základní analytics",
                  "Email podpora",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gray-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full border-white/10 text-gray-300 hover:bg-white/5 py-6"
                onClick={handleCTAClick}
              >
                Začít zdarma
              </Button>
            </div>

            {/* GOLD - Featured */}
            <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent p-8 flex flex-col relative glow-gold">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold px-4 py-1.5 rounded-full">
                NEJOBLÍBENĚJŠÍ
              </div>
              <div className="mb-6">
                <h3 className="font-[Space_Grotesk] text-xl font-bold text-amber-400">GOLD</h3>
                <div className="mt-3">
                  <span className="font-[Space_Grotesk] text-4xl font-black text-white">990 Kč</span>
                  <span className="text-gray-500 text-sm">/měsíc</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Neomezený počet iBotů",
                  "Neomezené konverzace",
                  "Hormozi metriky & analytics",
                  "Telegram + Discord integrace",
                  "API přístup",
                  "66% affiliate provize",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6 pulse-gold"
                onClick={handleCTAClick}
              >
                Vybrat GOLD
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* DIAMOND */}
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent p-8 flex flex-col relative glow-purple">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> PREMIUM
              </div>
              <div className="mb-6">
                <h3 className="font-[Space_Grotesk] text-xl font-bold text-purple-400">DIAMOND</h3>
                <div className="mt-3">
                  <span className="font-[Space_Grotesk] text-4xl font-black text-white">2 490 Kč</span>
                  <span className="text-gray-500 text-sm">/měsíc</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Vše z GOLD plánu",
                  "White-label řešení",
                  "Custom AI persony",
                  "SLA 99.9% uptime",
                  "Prioritní podpora",
                  "77% affiliate provize",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-6"
                onClick={handleCTAClick}
              >
                Vybrat DIAMOND
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AFFILIATE ===== */}
      <section id="affiliate" className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-amber-400 tracking-wider uppercase mb-3 block">Affiliate program</span>
              <h2 className="font-[Space_Grotesk] text-3xl md:text-4xl font-bold mb-6">
                Vydělávejte s námi.{" "}
                <span className="text-gradient-gold">Až 77% opakovaná provize.</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Náš affiliate program je klíčový růstový motor platformy. Aktivně odměňujeme partnery,
                kteří šíří naši platformu. Získejte provizi z každého přivedeného zákazníka — navždy.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: TrendingUp, title: "Až 77% opakovaná provize", desc: "GOLD: 66% | DIAMOND: 77% z každé platby" },
                  { icon: BarChart3, title: "Detailní affiliate dashboard", desc: "Sledujte konverze, provize a výdělky v reálném čase" },
                  { icon: Sparkles, title: "Připravené marketingové materiály", desc: "Bannery, texty, landing pages — vše připraveno k použití" },
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
                onClick={handleCTAClick}
              >
                Staňte se partnerem
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Affiliate visual */}
            <div className="relative">
              <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-purple-500/5 p-8">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-400 mb-2">Příklad měsíčního výdělku</p>
                  <div className="font-[Space_Grotesk] text-5xl font-black text-gradient-gold">38 115 Kč</div>
                  <p className="text-xs text-gray-500 mt-2">při 20 zákaznících na GOLD plánu</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                    <span className="text-sm text-gray-400">20× GOLD (990 Kč)</span>
                    <span className="text-sm font-semibold text-amber-400">19 800 Kč tržby</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                    <span className="text-sm text-gray-400">Vaše provize (66%)</span>
                    <span className="text-sm font-semibold text-green-400">13 068 Kč</span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                    <span className="text-sm text-amber-300 font-medium">Ročně (opakovaně)</span>
                    <span className="text-sm font-bold text-amber-400">156 816 Kč</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLATFORMS ===== */}
      <section id="platforms" className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-purple-400 tracking-wider uppercase mb-3 block">Multi-platform</span>
            <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold">
              Jeden dashboard. <span className="text-gradient-purple">Všechny kanály.</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
              iBoti fungují všude, kde jsou vaši zákazníci. Centralizovaná správa, analytics a reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Globe, name: "Web Widget", desc: "Integrace na jakýkoli web pomocí jednoho řádku kódu", status: "Dostupné" },
              { icon: Send, name: "Telegram Bot", desc: "Plná integrace s Telegram platformou", status: "Dostupné" },
              { icon: MessageSquare, name: "Discord Bot", desc: "Automatizace komunitní komunikace", status: "Dostupné" },
              { icon: Cpu, name: "API", desc: "RESTful API pro custom integrace", status: "api.bothub.cz", link: true },
            ].map((platform) => (
              <div
                key={platform.name}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center card-hover-glow"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <platform.icon className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="font-[Space_Grotesk] font-bold text-white mb-2">{platform.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{platform.desc}</p>
                <span className={`text-xs font-medium ${platform.link ? "text-purple-400" : "text-green-400"}`}>
                  {platform.link ? (
                    <span className="flex items-center justify-center gap-1">
                      {platform.status}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      {platform.status}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.03] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="container relative z-10 text-center">
          <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl lg:text-6xl font-black max-w-3xl mx-auto leading-tight mb-6">
            Jste připraveni{" "}
            <span className="text-gradient-gold">změnit pravidla hry?</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
            Přestaňte ztrácet zákazníky a peníze. Nasaďte iBoty a sledujte, jak vaše tržby rostou. Bez práce.
          </p>
          <Button
            onClick={handleCTAClick}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-lg px-10 py-7 pulse-gold"
          >
            Začněte prodávat s AI — ZDARMA
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">Žádná kreditní karta. Žádné závazky. Okamžitý přístup.</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-7 h-7 text-amber-400" />
                <span className="font-[Space_Grotesk] font-bold text-lg">
                  <span className="text-amber-400">BOT</span>HUB
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI chatboti, kteří prodávají za vás. 77 unikátních osobností ve 7 kategoriích.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#catalog" className="hover:text-amber-400 transition-colors">Katalog iBotů</a></li>
                <li><a href="#pricing" className="hover:text-amber-400 transition-colors">Ceník</a></li>
                <li><a href="#platforms" className="hover:text-amber-400 transition-colors">Platformy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Partneři</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#affiliate" className="hover:text-amber-400 transition-colors">Affiliate program</a></li>
                <li><a href="https://api.bothub.cz" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1">API Dokumentace <ExternalLink className="w-3 h-3" /></a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="mailto:info@bothub.cz" className="hover:text-amber-400 transition-colors">info@bothub.cz</a></li>
                <li><span>Obchodní podmínky</span></li>
                <li><span>Ochrana osobních údajů</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© 2026 BOTHUB.cz — Všechna práva vyhrazena.</p>
            <p className="text-xs text-gray-600">Powered by AI. Built with Hormozi principles.</p>
          </div>
        </div>
      </footer>

      {/* Unlock Modal */}
      <UnlockModal
        open={unlockModalOpen}
        onOpenChange={setUnlockModalOpen}
        onUnlock={handleUnlock}
      />
    </div>
  );
}
