import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Bot, Home, BookOpen, Tag, Users, Sparkles, Search, ArrowRight, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { t, locale } = useI18n();
  const [glitchActive, setGlitchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Periodic glitch animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const quickLinks = [
    {
      icon: Sparkles,
      label: locale === "cs" ? "Katalog iBotů" : "iBot Catalog",
      desc: locale === "cs" ? "88 AI osobností ve 7 kategoriích" : "88 AI personalities in 7 categories",
      href: "/#catalog",
      color: "from-amber-500/20 to-amber-600/10 border-amber-500/20 hover:border-amber-500/40",
      iconColor: "text-amber-400",
    },
    {
      icon: Tag,
      label: locale === "cs" ? "Ceník" : "Pricing",
      desc: locale === "cs" ? "FREE / GOLD / DIAMOND plány" : "FREE / GOLD / DIAMOND plans",
      href: "/#pricing",
      color: "from-purple-500/20 to-purple-600/10 border-purple-500/20 hover:border-purple-500/40",
      iconColor: "text-purple-400",
    },
    {
      icon: BookOpen,
      label: "Blog",
      desc: locale === "cs" ? "Články o AI a automatizaci" : "Articles about AI & automation",
      href: "/blog",
      color: "from-blue-500/20 to-blue-600/10 border-blue-500/20 hover:border-blue-500/40",
      iconColor: "text-blue-400",
    },
    {
      icon: Users,
      label: locale === "cs" ? "Affiliate program" : "Affiliate Program",
      desc: locale === "cs" ? "Až 88% provize z každého prodeje" : "Up to 88% commission per sale",
      href: "/#affiliate",
      color: "from-green-500/20 to-green-600/10 border-green-500/20 hover:border-green-500/40",
      iconColor: "text-green-400",
    },
    {
      icon: MessageCircle,
      label: locale === "cs" ? "Live Demo" : "Live Demo",
      desc: locale === "cs" ? "Vyzkoušejte AI chatbota živě" : "Try the AI chatbot live",
      href: "/#demo",
      color: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 hover:border-cyan-500/40",
      iconColor: "text-cyan-400",
    },
    {
      icon: Home,
      label: locale === "cs" ? "Domovská stránka" : "Homepage",
      desc: locale === "cs" ? "Zpět na hlavní stránku" : "Back to the main page",
      href: "/",
      color: "from-white/10 to-white/5 border-white/10 hover:border-white/20",
      iconColor: "text-white",
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/#catalog`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Animated broken bot */}
        <div className="mb-8 relative">
          <div className={`transition-transform duration-100 ${glitchActive ? "translate-x-1 -translate-y-0.5" : ""}`}>
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 flex items-center justify-center relative">
              <Bot className={`w-16 h-16 text-amber-400 transition-all duration-100 ${glitchActive ? "opacity-50 scale-95" : "opacity-100"}`} />
              {/* "Broken" sparks */}
              <div className="absolute -top-2 -right-2 w-6 h-6">
                <Sparkles className="w-6 h-6 text-amber-400/60 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4">
                <Sparkles className="w-4 h-4 text-purple-400/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>
              {/* Glitch overlay */}
              {glitchActive && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-amber-500/10 translate-x-1" />
                  <div className="absolute inset-0 bg-purple-500/10 -translate-x-1" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 404 heading */}
        <h1 className="font-[Space_Grotesk] text-8xl md:text-9xl font-bold mb-2 relative">
          <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
            404
          </span>
          {glitchActive && (
            <>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent translate-x-0.5 -translate-y-0.5 opacity-50">
                404
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent -translate-x-0.5 translate-y-0.5 opacity-50">
                404
              </span>
            </>
          )}
        </h1>

        <h2 className="font-[Space_Grotesk] text-2xl md:text-3xl font-bold text-white mb-3">
          {locale === "cs" ? "Stránka nenalezena" : "Page Not Found"}
        </h2>

        <p className="text-gray-400 text-center max-w-md mb-8 leading-relaxed">
          {locale === "cs"
            ? "Tento iBot se zatoulal do neznámých vod. Stránka, kterou hledáte, neexistuje nebo byla přesunuta."
            : "This iBot wandered into unknown waters. The page you're looking for doesn't exist or has been moved."}
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="w-full max-w-md mb-10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-amber-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "cs" ? "Hledat na BOTHUB.cz..." : "Search BOTHUB.cz..."}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all"
            >
              {locale === "cs" ? "Hledat" : "Search"}
            </button>
          </div>
        </form>

        {/* Quick links grid */}
        <div className="w-full max-w-3xl">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 text-center">
            {locale === "cs" ? "Kam dál?" : "Where to go?"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setLocation(link.href);
                }}
                className={`group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 ${link.color}`}
              >
                <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 ${link.iconColor}`}>
                  <link.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-white">{link.label}</span>
                    <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{link.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-600 mb-3">
            {locale === "cs"
              ? "Stále nemůžete najít, co hledáte?"
              : "Still can't find what you're looking for?"}
          </p>
          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
          >
            <Home className="w-4 h-4" />
            {locale === "cs" ? "Zpět na hlavní stránku" : "Back to Homepage"}
          </button>
        </div>
      </div>
    </div>
  );
}
