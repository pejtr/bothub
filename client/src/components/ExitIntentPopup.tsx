import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Gift, Zap, Crown, ArrowRight } from "lucide-react";
import { getUserCTAVariant } from "@/lib/ctaAbTest";

type ExitIntentPopupProps = {
  onRegister: (plan: "free" | "gold" | "diamond", source: string) => void;
};

type PopupVariant = {
  title: string;
  subtitle: string;
  offer: string;
  cta: string;
  plan: "free" | "gold" | "diamond";
  icon: React.ElementType;
  gradient: string;
};

const POPUP_VARIANTS: Record<string, PopupVariant> = {
  variant_a: {
    title: "Počkejte! Máme pro vás speciální nabídku",
    subtitle: "Vyzkoušejte si AI chatboty, kteří prodávají za vás — zdarma a bez závazků.",
    offer: "3 iBoti ZDARMA na 30 dní",
    cta: "Získat zdarma",
    plan: "free",
    icon: Gift,
    gradient: "from-amber-500 to-amber-600",
  },
  variant_b: {
    title: "Nechte si ujít +327% ROI?",
    subtitle: "Firmy, které nasadily iBoty, zvýšily své tržby průměrně o 42 %. Začněte ještě dnes.",
    offer: "Exkluzivní přístup k 77 AI osobnostem",
    cta: "Chci vyšší tržby",
    plan: "free",
    icon: Zap,
    gradient: "from-amber-500 to-amber-600",
  },
  variant_c: {
    title: "Speciální nabídka jen pro vás",
    subtitle: "Jako poděkování za váš zájem vám nabízíme rozšířený zkušební přístup.",
    offer: "14 dní GOLD plánu zdarma",
    cta: "Aktivovat GOLD trial",
    plan: "gold",
    icon: Crown,
    gradient: "from-amber-500 to-amber-600",
  },
};

const COOLDOWN_KEY = "bothub_exit_popup_last";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours between popups
const DISPLAY_DURATION = 15000; // Show for 15 seconds before auto-close

export function ExitIntentPopup({ onRegister }: ExitIntentPopupProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine popup variant based on user's CTA variant
  const ctaVariant = getUserCTAVariant();
  const variant = POPUP_VARIANTS[ctaVariant] ?? POPUP_VARIANTS.variant_a!;

  const isOnCooldown = useCallback(() => {
    const last = localStorage.getItem(COOLDOWN_KEY);
    if (!last) return false;
    return Date.now() - Number(last) < COOLDOWN_MS;
  }, []);

  const setCooldown = useCallback(() => {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  }, []);

  const showPopup = useCallback(() => {
    if (dismissed || open || isOnCooldown()) return;
    // Don't show if user already registered
    if (localStorage.getItem("ibots_registered") === "true") return;
    setOpen(true);
    setCooldown();

    // Auto-close after display duration
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, DISPLAY_DURATION);
  }, [dismissed, open, isOnCooldown, setCooldown]);

  useEffect(() => {
    // Don't show on admin pages
    if (window.location.pathname.startsWith("/admin")) return;

    // Exit intent detection (mouse leaving viewport at top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showPopup();
      }
    };

    // Mobile: detect rapid scroll up (back-to-top gesture)
    let lastScrollY = window.scrollY;
    let scrollUpCount = 0;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastScrollY && lastScrollY - currentY > 100) {
        scrollUpCount++;
        if (scrollUpCount >= 2) {
          showPopup();
          scrollUpCount = 0;
        }
      } else {
        scrollUpCount = 0;
      }
      lastScrollY = currentY;
    };

    // Delay adding listeners to avoid triggering on page load
    const initTimer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 5000); // Wait 5 seconds before activating

    return () => {
      clearTimeout(initTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showPopup]);

  const handleDismiss = () => {
    setOpen(false);
    setDismissed(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleCTA = () => {
    setOpen(false);
    setDismissed(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    onRegister(variant.plan, "exit_intent_popup");
  };

  const IconComponent = variant.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="bg-[#111118] border border-white/10 text-white max-w-md p-0 overflow-hidden gap-0">
        {/* Top accent bar */}
        <div className={`h-1 bg-gradient-to-r ${variant.gradient}`} />

        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${variant.gradient} flex items-center justify-center`}>
                <IconComponent className="w-8 h-8 text-black" />
              </div>
            </div>
            <DialogTitle className="font-[Space_Grotesk] text-xl font-bold text-center text-white leading-tight">
              {variant.title}
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
            {variant.subtitle}
          </p>

          {/* Offer highlight */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-center mb-6">
            <p className="text-amber-400 font-semibold text-sm">{variant.offer}</p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleCTA}
            className={`w-full bg-gradient-to-r ${variant.gradient} hover:opacity-90 text-black font-bold py-6 text-base`}
          >
            {variant.cta}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Dismiss link */}
          <button
            onClick={handleDismiss}
            className="w-full text-center text-xs text-gray-600 hover:text-gray-400 mt-4 transition-colors"
          >
            Ne, děkuji — nechci zvýšit své tržby
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
