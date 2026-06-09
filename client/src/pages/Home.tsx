/**
 * iBots Landing Page - Premium AI Chatbots
 * Design: Dark theme with gold accents, Hormozi-style marketing
 * Features: Hero with ROI stats, 77 iBots catalog, Pricing tiers, Social Proof
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Brain,
  Target,
  Heart,
  Crown,
  Coins,
  Sparkles,
  Activity,
  Lightbulb,
  ChevronRight,
  Search,
  Filter,
  Play,
  Clock,
  Award,
  Percent,
  Menu,
  X,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useABTest } from "@/hooks/useABTest";
import { PRICING_AB_TEST } from "@/data/ab-tests";
import { ibots, categories, getIBotsByCategory, searchIBots } from "@/data/ibots";
import IBotCard from "@/components/IBotCard";
import SocialProofNotification from "@/components/SocialProofNotification";
import ChatModal from "@/components/ChatModal";
import HeritageCollection from "@/components/HeritageCollection";
import VideoDemo from "@/components/VideoDemo";
import EmailCapture from "@/components/EmailCapture";
import AuthModal from "@/components/AuthModal";
import CookieConsent from "@/components/CookieConsent";
import ProactiveChatAgent from "@/components/ProactiveChatAgent";
import BotHubBadge from "@/components/BotHubBadge";
import BotHubCrossSell from "@/components/BotHubCrossSell";
import UrgencyTimer from "@/components/UrgencyTimer";
import StickyCTABar from "@/components/StickyCTABar";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import LiveVisitorCounter from "@/components/LiveVisitorCounter";
import type { HeritageBot } from "@/data/heritage-collection";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { IBot } from "@/data/ibots";

// Image URLs
const HERO_BG = "https://private-us-east-1.manuscdn.com/sessionFile/ZAtoIS2Z0EkO0kuTvu9UXk/sandbox/oGW3Z0ncEVLQL3RYXxWovU-img-2_1770034692000_na1fn_aWJvdHMtaGVyby1iYWNrZ3JvdW5k.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWkF0b0lTMlowRWtPMGt1VHZ1OVVYay9zYW5kYm94L29HVzNaMG5jRVZMUUwzUllYeFdvdlUtaW1nLTJfMTc3MDAzNDY5MjAwMF9uYTFmbl9hV0p2ZEhNdGFHVnlieTFpWVdOclozSnZkVzVrLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=XUBTs5XiHFQ2d608lDYOkwn9OAVA~F0BdUhibRr8-RRcb9-fs0gxqFjqEMJuD4EOuzeJFvtD7eOJpsDn4DGk2AuK5VzkpJAetvP0Ipmw-bL5QVqFoBV9duokVxul-ei~faLs86AEluC0-POEw4is~tlcnl1BLO7VsRjwVeHxlSNpnf2TUt9iMeDXBr~Qb~y4rsrUiLNVySkdYSK~OG5cZ-~c3VpqlXyRBN3AbGIS9Q6LOEV-K-BehIb0E2ynP-sLzapgmI5OWYPGR0tuqP0KXNWIKhosuu9oTOIZlm4XRfXaibNTealy9NiHlcTouWYqJI3IvfAP1BsbcPXey8fDGw__";
const HERO_ROBOT = "https://private-us-east-1.manuscdn.com/sessionFile/ZAtoIS2Z0EkO0kuTvu9UXk/sandbox/oGW3Z0ncEVLQL3RYXxWovU-img-1_1770034679000_na1fn_aWJvdHMtaGVyby1yb2JvdA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWkF0b0lTMlowRWtPMGt1VHZ1OVVYay9zYW5kYm94L29HVzNaMG5jRVZMUUwzUllYeFdvdlUtaW1nLTFfMTc3MDAzNDY3OTAwMF9uYTFmbl9hV0p2ZEhNdGFHVnlieTF5YjJKdmRBLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=roQlOSlWpNCzKa7zy1MSFimeqGxo91Nw2NhQIam~7N3fEjzy4rLgXVlX33AktWTq7gG195LeVKRHoECcdan3xP0o8jVRa83vykXMZ2EoGou4buhO~keUTZves2E8G94k7Vo40r1zQ-HXPa4C0Ht5sO89JUYEeZDFRKP4mG9ELgQqaP~hsxVXO9cDljkfiQYpy9efCcDJS5nhl46wV5mM1hBVd93NEdlEE7p6iXoOIQbZDZ0IIT7KlLQHqYWfbcK1xP5L99Qg7cBuqC6oYGpJPcuLYou-ZPNiKe3Dg2AdN8uNr08ck466a3zY~sjKj4dHJ6Sm0kXQR6YjwTgCXd6Cmw__";
const GOLD_PARTICLES = "https://private-us-east-1.manuscdn.com/sessionFile/ZAtoIS2Z0EkO0kuTvu9UXk/sandbox/c3YdIswqJN8Bj7hwmBIiWc-img-4_1770034495000_na1fn_aWJvdHMtZ29sZC1wYXJ0aWNsZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWkF0b0lTMlowRWtPMGt1VHZ1OVVYay9zYW5kYm94L2MzWWRJc3dxSk44Qmo3aHdtQklpV2MtaW1nLTRfMTc3MDAzNDQ5NTAwMF9uYTFmbl9hV0p2ZEhNdFoyOXNaQzF3WVhKMGFXTnNaWE0ucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=kqJstDVGiAhBGneOC8Ag7CyspOK43fR-awGSJStSJsaULmJH5SQf-SXSaIgddtuEUraWd380neeHdrV5l~9UXSGNbcBc4xK0dn1-aVJ1qTLOyJ1TwKskENaIJIoeGxfNg0CgSjr4ETBWb97D~dhCSb7DkLVw7dZqprOvN1tjeCZd2kaE-pmlu6egtux9b73uHx3taPqWDUAs9iuRGcGJQ-Xoi398pWM8fjj1~Iwa8X-ihfoTjEbkF31O4~vM2u0GprgSIi3HJABqixCQslgjVbywC41VjsoPGFf~GGNg~9sqpQm7DW-1OZePOAB7wmm8R8H22hxRfGYmtWDj5Ji7Hg__";

// Category icons mapping
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sales: Target,
  therapy: Heart,
  leadership: Crown,
  wealth: Coins,
  spirituality: Sparkles,
  health: Activity,
  creativity: Lightbulb,
};

// Pricing tiers
const pricingTiers = [
  {
    name: "FREE",
    price: "0",
    period: "navždy",
    description: "Vyzkoušejte sílu AI chatbotů",
    features: [
      "3 vybraní iBoti",
      "100 zpráv měsíčně",
      "Základní analytika",
      "Email podpora",
      "Komunitní přístup",
    ],
    limitations: [
      "Omezený počet iBotů",
      "Základní funkce",
    ],
    cta: "Začít zdarma",
    popular: false,
    affiliate: null,
    color: "gray",
  },
  {
    name: "GOLD",
    price: "990",
    period: "měsíčně",
    description: "Pro seriózní podnikatele a profesionály",
    features: [
      "Všech 77 iBotů",
      "Neomezené zprávy",
      "Pokročilá analytika",
      "Priority podpora 24/7",
      "API přístup",
      "Telegram & Discord integrace",
      "Export konverzací",
      "Vlastní affiliate odkaz",
      "Heritage Collection (+490 Kč/měs)",
    ],
    limitations: [],
    cta: "Získat GOLD",
    popular: true,
    color: "gold",
  },
  {
    name: "DIAMOND",
    price: "2 490",
    period: "měsíčně",
    description: "Pro lídry, influencery a agentury",
    features: [
      "Vše z GOLD plánu",
      "Vlastní iBoti na míru",
      "White-label řešení",
      "Dedikovaný account manager",
      "Vlastní branding",
      "Prioritní vývoj funkcí",
      "Exkluzivní mastermind skupina",
      "Premium affiliate program",
      "🏛️ Heritage Collection ZDARMA",
    ],
    limitations: [],
    cta: "Kontaktovat sales",
    popular: false,
    color: "diamond",
  },
];

// Stats
const stats = [
  { value: "+327%", label: "Průměrný nárůst ROI", icon: TrendingUp },
  { value: "77", label: "AI Osobností", icon: Brain },
  { value: "+42%", label: "Vyšší konverze", icon: Target },
  { value: "24/7", label: "Dostupnost", icon: Zap },
];

// Testimonials
const testimonials = [
  {
    name: "Martin Kovář",
    role: "E-commerce podnikatel",
    company: "ShopMax.cz",
    text: "Díky Alex Hormozi iBotovi jsem přepracoval celou nabídkovou strukturu. Konverze vzrostly o 42% během prvního měsíce. Nejlepší investice do mého byznysu.",
    rating: 5,
    result: "+42% konverze",
    avatar: "MK"
  },
  {
    name: "Petra Svobodová",
    role: "Life coach",
    company: "MindShift Academy",
    text: "Carl Jung iBot mi pomohl lépe porozumět klientům a jejich stínům. Moje sezení jsou nyní mnohem hlubší a transformativnější. Klienti jsou nadšení.",
    rating: 5,
    result: "2x více klientů",
    avatar: "PS"
  },
  {
    name: "Tomáš Richter",
    role: "Investor & Trader",
    company: "Richter Capital",
    text: "Warren Buffett a Charlie Munger iBoti mi poskytují cenné investiční perspektivy. Moje portfolio vzrostlo o 27% za poslední kvartál díky lepším rozhodnutím.",
    rating: 5,
    result: "+27% portfolio",
    avatar: "TR"
  },
  {
    name: "Jana Malá",
    role: "Marketing Director",
    company: "TechStart s.r.o.",
    text: "Russell Brunson iBot mi pomohl vytvořit konverzní funnely, které generují 3x více leadů. ROI z marketingu se dramaticky zlepšilo.",
    rating: 5,
    result: "3x více leadů",
    avatar: "JM"
  },
  {
    name: "David Horák",
    role: "CEO",
    company: "GrowthLab",
    text: "Kombinace Tony Robbins a Jocko Willink iBotů mi pomohla transformovat firemní kulturu. Produktivita týmu vzrostla o 35%.",
    rating: 5,
    result: "+35% produktivita",
    avatar: "DH"
  },
  {
    name: "Lucie Procházková",
    role: "Wellness Coach",
    company: "Balance Life",
    text: "Andrew Huberman iBot je jako mít osobního neurovědce. Moji klienti dosahují lepších výsledků díky vědecky podloženým protokolům.",
    rating: 5,
    result: "95% spokojenost",
    avatar: "LP"
  },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllBots, setShowAllBots] = useState(false);
  const [selectedBot, setSelectedBot] = useState<IBot | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewedBotCount, setViewedBotCount] = useState(0);

  // A/B Test for pricing
  const { values: abValues, trackConversion: trackPricingConversion, variant: pricingVariant } = useABTest(PRICING_AB_TEST);

  // Filter bots based on category and search
  const filteredBots = useMemo(() => {
    let result = ibots;
    
    if (selectedCategory) {
      result = getIBotsByCategory(selectedCategory);
    }
    
    if (searchQuery) {
      result = searchIBots(searchQuery).filter(bot => 
        !selectedCategory || bot.categoryId === selectedCategory
      );
    }
    
    return result;
  }, [selectedCategory, searchQuery]);

  // Display limited bots unless "show all" is clicked
  const displayedBots = showAllBots ? filteredBots : filteredBots.slice(0, 6);

  const handleBotClick = (bot: IBot) => {
    setSelectedBot(bot);
    setIsChatOpen(true);
    setViewedBotCount(prev => prev + 1);
  };

  const handleHeritageBotClick = (bot: HeritageBot) => {
    // Convert HeritageBot to IBot-like for ChatModal
    setSelectedBot({
      id: bot.id,
      name: bot.name,
      category: bot.side === "hero" ? "Heritage: Heroworld" : "Heritage: Villainworld",
      categoryId: "heritage",
      specialty: bot.specialty,
      description: bot.description,
      avatar: bot.avatar,
      tags: bot.tags,
    });
    setIsChatOpen(true);
  };

  const checkoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      toast.success("Přesměrování na platební bránu...", {
        description: "Budete přesměrováni na Stripe pro dokončení platby.",
      });
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      if (error.message.includes("login") || error.message.includes("10001")) {
        toast.error("Pro nákup se prosím nejdříve přihlaste", {
          description: "Klikněte na 'Přihlásit se' v navigaci.",
        });
      } else {
        toast.error("Chyba při vytváření platby", {
          description: error.message,
        });
      }
    },
  });

  const handlePlanSelect = (planId: string) => {
    if (planId === "free") {
      if (!isAuthenticated) {
        setAuthTab("register");
        setIsAuthOpen(true);
      } else {
        toast.success("Již máte FREE plán!", {
          description: "Prozkoumejte katalog iBotů.",
        });
      }
      return;
    }

    if (!isAuthenticated) {
      toast.info("Pro nákup se prosím nejdříve přihlaste", {
        description: "Po přihlášení budete přesměrováni na platbu.",
      });
      setAuthTab("register");
      setIsAuthOpen(true);
      return;
    }

    checkoutMutation.mutate({
      planId,
      origin: window.location.origin,
    });
  };

  const handleCTAClick = (action: string) => {
    toast.success(action, {
      description: "Děkujeme za váš zájem! Brzy vás budeme kontaktovat.",
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">
      {/* Social Proof Notifications */}
      <SocialProofNotification />

      {/* Sticky CTA Bar */}
      <StickyCTABar onCTAClick={() => { setAuthTab("register"); setIsAuthOpen(true); }} />

      {/* Exit Intent Popup */}
      <ExitIntentPopup onCTAClick={() => { setAuthTab("register"); setIsAuthOpen(true); }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-lg border-b border-[#D4AF37]/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center">
              <Brain className="w-6 h-6 text-[#0A0A0F]" />
            </div>
            <span className="text-xl font-bold text-gold-gradient">iBots</span>
            <BotHubBadge variant="nav" className="hidden lg:flex" />
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="https://bothub.cz" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              BotHub
            </a>
            <a href="#katalog" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Katalog</a>
            <a href="#jak-to-funguje" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Jak to funguje</a>
            <a href="#cenik" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Ceník</a>
            <a href="#heritage" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Heritage</a>
            <a href="#reference" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Reference</a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-gray-300 hover:text-[#D4AF37] hidden sm:flex" onClick={() => { setAuthTab("login"); setIsAuthOpen(true); }}>
              Přihlásit se
            </Button>
            <Button className="btn-gold hidden sm:flex" onClick={() => { setAuthTab("register"); setIsAuthOpen(true); }}>
              Začít zdarma
            </Button>
            {/* Mobile hamburger */}
            <button
              className="md:hidden w-10 h-10 rounded-lg bg-[#1A1A1F] border border-[#2A2A2F] flex items-center justify-center text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0A0A0F]/95 backdrop-blur-lg border-t border-[#2A2A2F]"
            >
              <div className="container mx-auto px-4 py-4 space-y-1">
                {[
                  { href: "https://bothub.cz", label: "\u{1F310} BotHub.cz", external: true },
                  { href: "#katalog", label: "Katalog", external: false },
                  { href: "#jak-to-funguje", label: "Jak to funguje", external: false },
                  { href: "#cenik", label: "Ceník", external: false },
                  { href: "#heritage", label: "Heritage Collection", external: false },
                  { href: "#reference", label: "Reference", external: false },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`block py-3 px-4 rounded-lg hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all ${item.external ? 'text-[#D4AF37]/80 font-medium border-b border-[#2A2A2F] mb-1' : 'text-gray-300'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-3 border-t border-[#2A2A2F] space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-[#D4AF37]"
                    onClick={() => { setAuthTab("login"); setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
                  >
                    Přihlásit se
                  </Button>
                  <Button
                    className="btn-gold w-full"
                    onClick={() => { setAuthTab("register"); setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
                  >
                    Začít zdarma
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Cookie Consent */}
      <CookieConsent />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background — layered for depth */}
        <div className="absolute inset-0 z-0">
          <img 
            src={HERO_BG} 
            alt="" 
            className="w-full h-full object-cover opacity-50"
          />
          {/* Deep gradient overlays for luxury depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#0A0A0F]/30 to-[#0A0A0F]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-transparent to-[#0A0A0F]/60" />
          {/* Animated gold particles overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-[#D4AF37] opacity-[0.06]"
                style={{
                  width: `${Math.random() * 300 + 100}px`,
                  height: `${Math.random() * 300 + 100}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  filter: 'blur(80px)',
                  animation: `float ${6 + i * 0.7}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
                <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-2 text-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  77 AI Osobností k dispozici
                </Badge>
                <BotHubBadge variant="hero" />
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="hero-headline text-4xl md:text-5xl lg:text-[3.75rem] font-bold leading-tight"
              >
                Přístup k moudrosti{" "}
                <span className="text-gold-shimmer">77 světových lídrů</span>
                <br />
                <span className="font-luxury text-3xl md:text-4xl lg:text-5xl italic text-gray-300 font-normal">
                  — 24/7, okamžitě, bez kompromisů
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-lg text-gray-300 max-w-xl leading-relaxed"
              >
                Přestaňte platit za koučink tisíce korun za hodinu. Získejte neomezený přístup k AI verzím
                Alexe Hormoziho, Warrena Buffetta, Carla Junga a dalších 74 expertů —
                a transformujte svůj byznys i osobní život.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Button 
                  className="btn-gold text-lg px-8 py-6 group"
                  onClick={() => handleCTAClick("Chci zvýšit ROI")}
                >
                  Chci zvýšit ROI
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-gold-outline text-lg px-8 py-6"
                  onClick={() => document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Prohlédnout katalog
                </Button>
              </motion.div>

              {/* Premium Trust Metrics Bar — quantified social proof */}
              <motion.div variants={fadeInUp} className="pt-2">
                <div className="divider-gold mb-5" />
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { value: "4.9★", label: "Hodnocení", sub: "Google Reviews" },
                    { value: "2,847+", label: "Uživatelů", sub: "aktivních" },
                    { value: "+327%", label: "Růst ROI", sub: "průměrně" },
                    { value: "30 dní", label: "Záruka", sub: "vrácení peněz" },
                  ].map((m, i) => (
                    <div key={i} className="text-center">
                      <div className="trust-metric-value">{m.value}</div>
                      <div className="text-xs font-semibold text-white mt-0.5">{m.label}</div>
                      <div className="text-[10px] text-gray-500">{m.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="divider-gold mt-5" />
              </motion.div>

              {/* Live Visitor Counter */}
              <motion.div variants={fadeInUp}>
                <LiveVisitorCounter />
              </motion.div>
            </motion.div>

            {/* Right - Robot Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <img 
                  src={HERO_ROBOT} 
                  alt="AI Robot Assistant" 
                  className="w-full max-w-lg mx-auto drop-shadow-2xl"
                />
                {/* Floating stats cards */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-10 -left-10 bg-[#1A1A1F]/90 backdrop-blur-sm border border-[#D4AF37]/30 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-[#0A0A0F]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#D4AF37]">+327%</div>
                      <div className="text-sm text-gray-400">ROI nárůst</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-20 -right-5 bg-[#1A1A1F]/90 backdrop-blur-sm border border-[#D4AF37]/30 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#0A0A0F]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#D4AF37]">2,847+</div>
                      <div className="text-sm text-gray-400">Aktivních uživatelů</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[#D4AF37]/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-[#D4AF37] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#0D0D12] to-[#0A0A0F]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/20">
                  <stat.icon className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gold-gradient mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="katalog" className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-2 mb-6">
              7 Kategorií • 77 AI Osobností
            </Badge>
            <h2 className="hero-headline text-3xl md:text-4xl font-bold mb-4">
              Katalog <span className="text-gold-gradient">iBots</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Každý iBot je trénovaný na specifickou oblast a přináší unikátní perspektivu světových expertů
            </p>
          </motion.div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Hledat iBota podle jména nebo specializace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white"
              />
            </div>
            <Button
              variant="outline"
              className={`border-[#2A2A2F] ${selectedCategory ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {selectedCategory ? 'Zrušit filtr' : 'Všechny kategorie'}
            </Button>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-12">
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.id] || Target;
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className={`group p-5 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20"
                      : "bg-gradient-to-br from-[#1A1A1F] to-[#0A0A0F] border-[#2A2A2F] hover:border-[#D4AF37]/50"
                  }`}
                >
                  <div 
                    className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${category.color}20`,
                      boxShadow: selectedCategory === category.id ? `0 0 20px ${category.color}40` : 'none'
                    }}
                  >
                    <span style={{ color: category.color }}>
                      <IconComponent className="w-7 h-7" />
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1 line-clamp-2 min-h-[2.5rem] flex items-center justify-center text-center">{category.name}</div>
                  <div className="text-xs text-gray-500">{category.count} iBotů</div>
                </motion.button>
              );
            })}
          </div>

          {/* Results count */}
          <div className="mb-6 text-gray-400">
            Zobrazeno {displayedBots.length} z {filteredBots.length} iBotů
            {selectedCategory && ` v kategorii ${categories.find(c => c.id === selectedCategory)?.name}`}
          </div>

          {/* Bots Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {displayedBots.map((bot, index) => (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <IBotCard 
                    bot={bot} 
                    onClick={() => handleBotClick(bot)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Show more button */}
          {filteredBots.length > 6 && (
            <div className="text-center mt-10">
              <Button 
                className="btn-gold-outline"
                onClick={() => setShowAllBots(!showAllBots)}
              >
                {showAllBots ? 'Zobrazit méně' : `Zobrazit všech ${filteredBots.length} iBotů`}
                <ArrowRight className={`ml-2 w-4 h-4 transition-transform ${showAllBots ? 'rotate-90' : ''}`} />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section id="jak-to-funguje" className="py-20 relative">
        <div className="absolute inset-0">
          <img src={GOLD_PARTICLES} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-transparent to-[#0A0A0F]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-2 mb-6">
              Jednoduchý 3-krokový proces
            </Badge>
            <h2 className="hero-headline text-3xl md:text-4xl font-bold mb-4">
              77 AI <span className="text-gold-gradient">Osobností</span> v 7 kategoriích
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Začněte využívat sílu AI expertů během několika minut
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Vyberte si iBota",
                description: "Prozkoumejte katalog 77 AI osobností a vyberte si experta, který odpovídá vašim potřebám a cílům.",
                icon: Brain,
                color: "#D4AF37"
              },
              {
                step: "02",
                title: "Zahajte konverzaci",
                description: "Položte otázku nebo popište svůj problém. AI vám odpoví s moudrostí a zkušenostmi vybraného experta.",
                icon: MessageSquare,
                color: "#60A5FA"
              },
              {
                step: "03",
                title: "Implementujte a rostěte",
                description: "Aplikujte získané poznatky do praxe a sledujte měřitelný růst vašeho podnikání a osobního rozvoje.",
                icon: TrendingUp,
                color: "#34D399"
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="bg-[#1A1A1F]/80 border-[#2A2A2F] p-8 h-full hover:border-[#D4AF37]/30 transition-colors">
                  <div className="text-6xl font-bold text-[#D4AF37]/10 absolute top-4 right-4">
                    {item.step}
                  </div>
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <span style={{ color: item.color }}>
                      <item.icon className="w-7 h-7" />
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </Card>
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#D4AF37]/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="cenik" className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-2 mb-6">
              Transparentní ceny
            </Badge>
            <h2 className="hero-headline text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Investice, která se <span className="text-gold-shimmer">vrátí 10×</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Jeden dobrý poradce stojí 5 000–50 000 Kč za hodinu. My vám dáme 77 nejlepších — za cenu jednoho oběda.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Začněte zdarma • Bez závazků • Zrušte kdykoliv
            </p>
          </motion.div>

          {/* Urgency Timer */}
          <div className="max-w-2xl mx-auto mb-8">
            <UrgencyTimer />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative ${tier.popular ? "md:-mt-4 md:mb-4" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0F] px-4 py-1 font-semibold">
                      <Star className="w-4 h-4 mr-1" />
                      Nejoblíbenější
                    </Badge>
                  </div>
                )}
                <Card className={`h-full p-8 card-premium ${
                  tier.popular 
                    ? "bg-gradient-to-b from-[#D4AF37]/15 to-[#0F0F14] border-[#D4AF37]/80 card-popular-glow" 
                    : tier.name === "DIAMOND"
                    ? "bg-gradient-to-b from-[#1A1A2F]/80 to-[#0F0F14] border-blue-500/20"
                    : "bg-[#0F0F14]/90 border-[#1A1A2F]"
                }`}>
                  <div className="text-center mb-6">
                    <h3 className="font-display text-2xl font-bold mb-1 tracking-wide">{tier.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{tier.description}</p>
                    {/* Value per day framing */}
                    {tier.name === "GOLD" && (
                      <p className="text-xs text-green-400 font-medium mb-2">
                        = 33 Kč/den — méně než káva
                      </p>
                    )}
                    {tier.name === "DIAMOND" && (
                      <p className="text-xs text-blue-400 font-medium mb-2">
                        = 83 Kč/den — vs. 5 000+ Kč/hod poradce
                      </p>
                    )}
                    {/* A/B Test: Variant B - Show original price + discount */}
                    {tier.name === "GOLD" && abValues.goldOriginalPrice && (
                      <div className="mb-2">
                        <span className="text-lg text-gray-500 line-through">{abValues.goldOriginalPrice} Kč</span>
                        <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30 text-xs">{abValues.goldDiscount}</Badge>
                      </div>
                    )}
                    {tier.name === "DIAMOND" && abValues.diamondOriginalPrice && (
                      <div className="mb-2">
                        <span className="text-lg text-gray-500 line-through">{abValues.diamondOriginalPrice} Kč</span>
                        <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30 text-xs">{abValues.diamondDiscount}</Badge>
                      </div>
                    )}
                    {/* A/B Test: Variant C - ROI badge */}
                    {tier.name === "GOLD" && abValues.goldRoiBadge && (
                      <Badge className="mb-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs font-bold">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {abValues.goldRoiBadge}
                      </Badge>
                    )}
                    {tier.name === "DIAMOND" && abValues.diamondRoiBadge && (
                      <Badge className="mb-2 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs font-bold">
                        <Award className="w-3 h-3 mr-1" />
                        {abValues.diamondRoiBadge}
                      </Badge>
                    )}
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gold-gradient">
                        {tier.name === "GOLD" ? abValues.goldPrice || tier.price : tier.name === "DIAMOND" ? abValues.diamondPrice || tier.price : tier.price}
                      </span>
                      <span className="text-gray-400">Kč/{tier.period}</span>
                    </div>
                  </div>

                  {/* A/B Test: Variant C - Feature highlights before feature list */}
                  {tier.name === "GOLD" && abValues.goldHighlights && (
                    <div className="mb-4 space-y-2">
                      {abValues.goldHighlights.map((highlight: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-[#D4AF37]/10 rounded-lg px-3 py-2">
                          <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                          <span className="text-sm text-[#D4AF37] font-medium">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {tier.name === "DIAMOND" && abValues.diamondHighlights && (
                    <div className="mb-4 space-y-2">
                      {abValues.diamondHighlights.map((highlight: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-blue-500/10 rounded-lg px-3 py-2">
                          <Crown className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="text-sm text-blue-400 font-medium">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <ul className="space-y-3 mb-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* A/B Test: Variant C - Social proof under features */}
                  {tier.name === "GOLD" && abValues.goldSocialProof && (
                    <div className="mb-4 text-center py-2 border-t border-[#2A2A2F]">
                      <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" />
                        {abValues.goldSocialProof}
                      </span>
                    </div>
                  )}
                  {tier.name === "DIAMOND" && abValues.diamondSocialProof && (
                    <div className="mb-4 text-center py-2 border-t border-[#2A2A2F]">
                      <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Star className="w-3 h-3" />
                        {abValues.diamondSocialProof}
                      </span>
                    </div>
                  )}

                  <Button 
                    className={`w-full py-6 ${tier.popular ? "btn-gold" : "btn-gold-outline"}`}
                    onClick={() => {
                      trackPricingConversion(tier.name === "GOLD" ? 990 : tier.name === "DIAMOND" ? 2490 : 0);
                      handlePlanSelect(tier.name.toLowerCase());
                    }}
                  >
                    {tier.name === "GOLD" && abValues.goldCta ? abValues.goldCta : tier.name === "DIAMOND" && abValues.diamondCta ? abValues.diamondCta : tier.cta}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Urgency banner for A/B variant */}
          {abValues.showUrgency && abValues.urgencyText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center mt-8 mb-4"
            >
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-6 py-3">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">{abValues.urgencyText}</span>
              </div>
            </motion.div>
          )}

          {/* Risk Reversal — prominent guarantee section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 max-w-3xl mx-auto"
          >
            <div className="divider-gold mb-10" />
            <div className="text-center">
              <div className="inline-flex flex-col items-center gap-4 bg-gradient-to-b from-[#1A1A0F]/80 to-[#0F0F0A]/80 border border-[#D4AF37]/25 rounded-2xl px-10 py-8">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">30-denní Záruka vrácení peněz</h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    Pokud nejste do 30 dní 100% spokojeni, vrátíme vám každý cent. 
                    Žádné otázky, žádné komplikace. Také proto jsme měli méně než 0.5% refund rate.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  {[
                    { icon: <CheckCircle className="w-4 h-4 text-[#D4AF37]" />, text: "Žádná kreditní karta" },
                    { icon: <CheckCircle className="w-4 h-4 text-[#D4AF37]" />, text: "Okamžitý přístup" },
                    { icon: <CheckCircle className="w-4 h-4 text-[#D4AF37]" />, text: "Zrušte kdykoliv" },
                  ].map((item, i) => (
                    <span key={i} className="flex items-center gap-2 text-gray-300">
                      {item.icon}
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Video Demo */}
      <VideoDemo />

      {/* Heritage Collection */}
      <HeritageCollection onBotClick={handleHeritageBotClick} />

      {/* Testimonials */}
      <section id="reference" className="py-24 relative">
        <div className="absolute inset-0 section-dark" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-2 mb-6">
              Skutečné výsledky
            </Badge>
            <h2 className="hero-headline text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Lidé, kteří to <span className="text-gold-shimmer">už zkušili</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Konkrétní výsledky od skutečných podnikatelů — s čísly, která se nedá vymyslet
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card-premium p-6 h-full flex flex-col">
                  {/* Top: Rating + Result */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                      ))}
                    </div>
                    <Badge className="bg-green-500/15 text-green-400 border border-green-500/20 text-xs font-bold">
                      {testimonial.result}
                    </Badge>
                  </div>
                  
                  {/* Quote — Cormorant for elegance */}
                  <p className="font-luxury text-lg text-gray-200 mb-6 leading-relaxed flex-1">
                    <span className="text-[#D4AF37] text-2xl leading-none mr-1">“</span>
                    {testimonial.text}
                    <span className="text-[#D4AF37] text-2xl leading-none ml-1">”</span>
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#D4AF37]/10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center text-[#0A0A0F] font-bold text-sm shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-xs text-[#D4AF37]">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Founder / Team Humanization — people buy from people */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="divider-gold mb-12" />
            <div className="text-center mb-10">
              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-2 mb-4">
                Kdo za tím stojí
              </Badge>
              <h3 className="hero-headline text-2xl md:text-3xl font-bold text-white">
                Lidé, kteří iBoty <span className="text-gold-gradient">vytvořili</span>
              </h3>
              <p className="text-gray-400 mt-2 max-w-xl mx-auto text-sm">
                Nejsme anonymní korporace. Jsme podnikatelé, kteří sami používají to, co prodávají.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  initials: "PV",
                  name: "Petr Vlček",
                  role: "Zakladatel & CEO",
                  desc: "10+ let v performance marketingu. Vytvořil systémy, které generovaly 100M+ Kč v obratu.",
                  contact: "petr@ibots.cz",
                  color: "from-[#D4AF37] to-[#8B7355]",
                },
                {
                  initials: "MH",
                  name: "Martin Horaček",
                  role: "CTO & AI Architect",
                  desc: "Bivší senior engineer v Google. Navrhuje AI systémy pro Fortune 500 společnosti.",
                  contact: "martin@ibots.cz",
                  color: "from-blue-500 to-blue-700",
                },
                {
                  initials: "LK",
                  name: "Lucie Kovářová",
                  role: "Head of Customer Success",
                  desc: "Pomohla 500+ podnikatelům implementovat AI do jejich byznysu s měřitelnými výsledky.",
                  contact: "lucie@ibots.cz",
                  color: "from-purple-500 to-purple-700",
                },
              ].map((person, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                >
                  <Card className="card-premium p-6 text-center">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-white font-bold text-xl mx-auto mb-4`}>
                      {person.initials}
                    </div>
                    <h4 className="font-display font-bold text-white text-lg">{person.name}</h4>
                    <p className="text-[#D4AF37] text-xs font-semibold mb-3">{person.role}</p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{person.desc}</p>
                    <a
                      href={`mailto:${person.contact}`}
                      className="text-xs text-gray-500 hover:text-[#D4AF37] transition-colors"
                    >
                      {person.contact}
                    </a>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* BotHub Cross-Sell */}
      <BotHubCrossSell />

      {/* Email Capture / Lead Magnet */}
      <EmailCapture />

      {/* Final CTA Section */}
      <section className="py-28 relative">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-[#0A0A0F]" />
          {/* Gold glow center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[300px] bg-[#D4AF37] opacity-[0.04] rounded-full blur-[120px]" />
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-2 mb-6">
              Poslední krok
            </Badge>
            <h2 className="hero-headline text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              Vaše konkurence už
              <br />
              <span className="text-gold-shimmer">iBoty používá</span>
            </h2>
            <p className="font-luxury text-xl text-gray-300 mb-3 italic">
              Otázka není, zda AI bude měnit byznys. Otázka je, zda budete patřit mezi první, nebo poslední.
            </p>
            <p className="text-gray-400 mb-10">
              Dnes se připojilo 2,847+ podnikatelů. Zítra jich bude o 50 více. Bude mezi nimi i vaše jméno?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                className="btn-gold text-lg px-10 py-6"
                onClick={() => handleCTAClick("Registrace zahájena")}
              >
                Začít zdarma
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                className="btn-gold-outline text-lg px-10 py-6"
                onClick={() => handleCTAClick("Konzultace rezervována")}
              >
                <Play className="mr-2 w-5 h-5" />
                Rezervovat demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6 flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                Žádná kreditní karta
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                30 dní garance
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D4AF37]" />
                Okamžitý přístup
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#2A2A2F]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center">
                  <Brain className="w-6 h-6 text-[#0A0A0F]" />
                </div>
                <span className="text-xl font-bold text-gold-gradient">iBots</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Premium AI chatboti pro maximální návratnost investic a osobní růst.
              </p>
              <BotHubBadge variant="footer" />
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Produkt</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#katalog" className="hover:text-[#D4AF37] transition-colors">Katalog iBotů</a></li>
                <li><a href="#cenik" className="hover:text-[#D4AF37] transition-colors">Ceník</a></li>
                <li><a href="https://bothub.cz" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">BotHub.cz platforma</a></li>
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">API dokumentace</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Společnost</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">O nás</a></li>
                <li><a href="/affiliate" className="hover:text-[#D4AF37] transition-colors">Affiliate program</a></li>
                <li><a href="#reference" className="hover:text-[#D4AF37] transition-colors">Reference</a></li>
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Kontakt</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Právní</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Obchodní podmínky</a></li>
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Ochrana soukromí</a></li>
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">GDPR</a></li>
                <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#2A2A2F] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 iBots — součást ekosystému <a href="https://bothub.cz" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline">BotHub.cz</a>. Všechna práva vyhrazena.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Made with ❤️ in Czech Republic</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Modal */}
      <ChatModal 
        bot={selectedBot}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultTab={authTab}
      />

      {/* Proactive Chat Agent */}
      <ProactiveChatAgent
        comparedBotCount={viewedBotCount}
        onOpenChat={(botId, message) => {
          // Find the bot from ibots data or create a generic one
          const bot = ibots.find(b => b.id === botId);
          if (bot) {
            setSelectedBot(bot);
            setIsChatOpen(true);
          } else {
            // Use a generic sales bot
            setSelectedBot({
              id: botId,
              name: botId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              category: "Sales & Marketing",
              categoryId: "sales",
              specialty: "Business growth and conversion optimization",
              description: "AI expert ready to help you grow your business",
              avatar: "\u{1F916}",
              tags: ["business", "growth"],
            });
            setIsChatOpen(true);
          }
        }}
      />

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0F]/95 backdrop-blur-lg border-t border-[#2A2A2F] px-2 py-2">
        <div className="flex items-center justify-around">
          <a href="#katalog" className="flex flex-col items-center gap-1 py-1 px-3 text-gray-400 hover:text-[#D4AF37] transition-colors">
            <Brain className="w-5 h-5" />
            <span className="text-[10px]">Katalog</span>
          </a>
          <a href="#cenik" className="flex flex-col items-center gap-1 py-1 px-3 text-gray-400 hover:text-[#D4AF37] transition-colors">
            <Coins className="w-5 h-5" />
            <span className="text-[10px]">Ceník</span>
          </a>
          <button
            onClick={() => { setAuthTab("register"); setIsAuthOpen(true); }}
            className="flex flex-col items-center gap-1 py-1 px-4 -mt-4 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] rounded-xl text-[#0A0A0F] shadow-lg shadow-[#D4AF37]/20"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-bold">Start</span>
          </button>
          <a href="#heritage" className="flex flex-col items-center gap-1 py-1 px-3 text-gray-400 hover:text-[#D4AF37] transition-colors">
            <Crown className="w-5 h-5" />
            <span className="text-[10px]">Heritage</span>
          </a>
          <a href="#reference" className="flex flex-col items-center gap-1 py-1 px-3 text-gray-400 hover:text-[#D4AF37] transition-colors">
            <Star className="w-5 h-5" />
            <span className="text-[10px]">Reference</span>
          </a>
        </div>
      </div>
    </div>
  );
}
