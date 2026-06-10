/**
 * Exit Intent Popup — Personalized based on user behavior
 *
 * Synthesis: Detects which section user scrolled to and shows
 * the most relevant offer at the moment of exit.
 *
 * Variants:
 * - Viewed pricing  → Urgency offer ("50% sleva jen dnes")
 * - Viewed catalog  → Bot recommendation ("Váš AI expert čeká")
 * - Default         → FREE guide offer
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ArrowRight, Gift, Brain, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ExitIntentPopupProps {
  onCTAClick: () => void;
}

const SESSION_KEY = "ibot_exit_popup_shown";
type PopupVariant = "pricing" | "catalog" | "default";

const CONTENT = {
  pricing: {
    icon: <TrendingUp className="w-7 h-7 text-[#D4AF37]" />,
    badge: "Jen dnes",
    badgeColor: "#D4AF37",
    headline: "Speciální nabídka jen pro vás",
    sub: "Viděli jste naše plány. Zaregistrujte se nyní a získejte první měsíc GOLD za 490 Kč místo 990 Kč.",
    cta: "Získat 50% slevu",
    ctaColor: "from-[#D4AF37] to-[#F5D77A]",
    source: "exit_intent_pricing",
  },
  catalog: {
    icon: <Brain className="w-7 h-7 text-purple-400" />,
    badge: "Žádná kreditní karta",
    badgeColor: "#A855F7",
    headline: "Váš osobní AI expert čeká",
    sub: "Procházeli jste naše iBoty. Vyzkoušejte 3 z nich ZDARMA — bez závazků, bez kreditní karty.",
    cta: "Vyzkoušet zdarma",
    ctaColor: "from-purple-500 to-purple-400",
    source: "exit_intent_catalog",
  },
  default: {
    icon: <Gift className="w-7 h-7 text-[#D4AF37]" />,
    badge: "Zdarma",
    badgeColor: "#10B981",
    headline: "Počkejte! Máme pro vás dárek",
    sub: "Stáhněte si průvodce '7 AI strategií pro 2x vyšší příjem' — používaný 2 400+ podnikateli.",
    cta: "Poslat průvodce zdarma",
    ctaColor: "from-[#D4AF37] to-[#F5D77A]",
    source: "exit_intent_default",
  },
};

export default function ExitIntentPopup({ onCTAClick }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [variant, setVariant] = useState<PopupVariant>("default");

  const subscribeMutation = trpc.email.subscribe.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Odesláno!", { description: "Zkontrolujte svůj email za pár minut." });
      setTimeout(() => setIsVisible(false), 2500);
    },
  });

  const detectVariant = useCallback((): PopupVariant => {
    const vh = window.innerHeight;
    const pricingEl = document.getElementById("cenik");
    const catalogEl = document.getElementById("katalog");
    if (pricingEl && pricingEl.getBoundingClientRect().top < vh * 3) return "pricing";
    if (catalogEl && catalogEl.getBoundingClientRect().top < vh * 3) return "catalog";
    return "default";
  }, []);

  const handleExitIntent = useCallback(
    (e: MouseEvent) => {
      if (e.clientY < window.innerHeight * 0.08) {
        if (!sessionStorage.getItem(SESSION_KEY)) {
          setVariant(detectVariant());
          setIsVisible(true);
          sessionStorage.setItem(SESSION_KEY, "1");
          document.removeEventListener("mousemove", handleExitIntent);
        }
      }
    },
    [detectVariant]
  );

  useEffect(() => {
    if (window.innerWidth > 768) {
      const timer = setTimeout(() => {
        document.addEventListener("mousemove", handleExitIntent);
      }, 8000);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousemove", handleExitIntent);
      };
    }
  }, [handleExitIntent]);

  const c = CONTENT[variant];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    subscribeMutation.mutate({ email, source: c.source });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVisible(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-md mx-4"
          >
            <div className="bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#8B7355]/20 p-6 text-center relative">
                <button
                  onClick={() => setIsVisible(false)}
                  className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Badge */}
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                  style={{ backgroundColor: `${c.badgeColor}20`, color: c.badgeColor }}
                >
                  {c.badge}
                </span>
                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-3">
                  {c.icon}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{c.headline}</h2>
                <p className="text-gray-400 text-sm">{c.sub}</p>
              </div>

              {/* Body */}
              <div className="p-6">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-white font-semibold">Odesláno!</p>
                    <p className="text-gray-400 text-sm mt-1">Zkontrolujte svůj email.</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="bg-[#1A1A1F] rounded-xl p-4 mb-4">
                      <ul className="text-gray-400 text-xs space-y-1.5">
                        <li>✓ Konkrétní strategie pro zvýšení konverzí</li>
                        <li>✓ Případové studie s reálnými čísly</li>
                        <li>✓ Šablony pro implementaci</li>
                        <li>✓ Přístup ke 3 iBotům ZDARMA</li>
                      </ul>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="váš@email.cz"
                        className="bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white"
                        required
                      />
                      <Button
                        type="submit"
                        className={`w-full bg-gradient-to-r ${c.ctaColor} text-[#0A0A0F] font-semibold hover:opacity-90`}
                        disabled={subscribeMutation.isPending}
                      >
                        {subscribeMutation.isPending ? "Odesílám..." : (
                          <>{c.cta} <ArrowRight className="w-4 h-4 ml-2" /></>
                        )}
                      </Button>
                    </form>

                    <div className="mt-4 text-center">
                      <button
                        onClick={() => { onCTAClick(); setIsVisible(false); }}
                        className="text-xs text-gray-500 hover:text-[#D4AF37] transition-colors"
                      >
                        Nebo začněte rovnou s FREE plánem →
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
