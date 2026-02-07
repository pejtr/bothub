import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gift, Zap, Crown, ArrowRight } from "lucide-react";
import { getUserCTAVariant } from "@/lib/ctaAbTest";
import { useI18n } from "@/lib/i18n";

type ExitIntentPopupProps = {
  onRegister: (plan: "free" | "gold" | "diamond", source: string) => void;
};

type PopupVariant = {
  titleCs: string;
  titleEn: string;
  subtitleCs: string;
  subtitleEn: string;
  offerCs: string;
  offerEn: string;
  ctaCs: string;
  ctaEn: string;
  dismissCs: string;
  dismissEn: string;
  plan: "free" | "gold" | "diamond";
  icon: React.ElementType;
  gradient: string;
};

const POPUP_VARIANTS: Record<string, PopupVariant> = {
  variant_a: {
    titleCs: "Počkejte! Máme pro vás speciální nabídku",
    titleEn: "Wait! We have a special offer for you",
    subtitleCs: "Vyzkoušejte si AI chatboty, kteří prodávají za vás — zdarma a bez závazků.",
    subtitleEn: "Try AI chatbots that sell for you — free and with no strings attached.",
    offerCs: "3 iBoti ZDARMA na 30 dní",
    offerEn: "3 iBots FREE for 30 days",
    ctaCs: "Získat zdarma",
    ctaEn: "Get it free",
    dismissCs: "Ne, děkuji — nechci zvýšit své tržby",
    dismissEn: "No thanks — I don't want to increase my revenue",
    plan: "free",
    icon: Gift,
    gradient: "from-amber-500 to-amber-600",
  },
  variant_b: {
    titleCs: "Nechte si ujít +327% ROI?",
    titleEn: "Walk away from +327% ROI?",
    subtitleCs: "Firmy, které nasadily iBoty, zvýšily své tržby průměrně o 42 %. Začněte ještě dnes.",
    subtitleEn: "Companies that deployed iBots increased their revenue by an average of 42%. Start today.",
    offerCs: "Exkluzivní přístup k 77 AI osobnostem",
    offerEn: "Exclusive access to 77 AI personalities",
    ctaCs: "Chci vyšší tržby",
    ctaEn: "I want higher revenue",
    dismissCs: "Ne, děkuji — nechci zvýšit své tržby",
    dismissEn: "No thanks — I don't want to increase my revenue",
    plan: "free",
    icon: Zap,
    gradient: "from-amber-500 to-amber-600",
  },
  variant_c: {
    titleCs: "Speciální nabídka jen pro vás",
    titleEn: "Special offer just for you",
    subtitleCs: "Jako poděkování za váš zájem vám nabízíme rozšířený zkušební přístup.",
    subtitleEn: "As a thank you for your interest, we're offering you extended trial access.",
    offerCs: "14 dní GOLD plánu zdarma",
    offerEn: "14 days of GOLD plan free",
    ctaCs: "Aktivovat GOLD trial",
    ctaEn: "Activate GOLD trial",
    dismissCs: "Ne, děkuji — nechci zvýšit své tržby",
    dismissEn: "No thanks — I don't want to increase my revenue",
    plan: "gold",
    icon: Crown,
    gradient: "from-amber-500 to-amber-600",
  },
};

const COOLDOWN_KEY = "bothub_exit_popup_last";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const DISPLAY_DURATION = 15000;

export function ExitIntentPopup({ onRegister }: ExitIntentPopupProps) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ctaVariant = getUserCTAVariant();
  const variant = POPUP_VARIANTS[ctaVariant] ?? POPUP_VARIANTS.variant_a!;

  const l = (field: string) => locale === "en" ? (variant as any)[`${field}En`] : (variant as any)[`${field}Cs`];

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
    if (localStorage.getItem("ibots_registered") === "true") return;
    setOpen(true);
    setCooldown();
    timerRef.current = setTimeout(() => { setOpen(false); }, DISPLAY_DURATION);
  }, [dismissed, open, isOnCooldown, setCooldown]);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    const handleMouseLeave = (e: MouseEvent) => { if (e.clientY <= 0) showPopup(); };
    let lastScrollY = window.scrollY;
    let scrollUpCount = 0;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastScrollY && lastScrollY - currentY > 100) {
        scrollUpCount++;
        if (scrollUpCount >= 2) { showPopup(); scrollUpCount = 0; }
      } else { scrollUpCount = 0; }
      lastScrollY = currentY;
    };
    const initTimer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 5000);
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
        <div className={`h-1 bg-gradient-to-r ${variant.gradient}`} />
        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${variant.gradient} flex items-center justify-center`}>
                <IconComponent className="w-8 h-8 text-black" />
              </div>
            </div>
            <DialogTitle className="font-[Space_Grotesk] text-xl font-bold text-center text-white leading-tight">
              {l("title")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">{l("subtitle")}</p>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-center mb-6">
            <p className="text-amber-400 font-semibold text-sm">{l("offer")}</p>
          </div>
          <Button
            onClick={handleCTA}
            className={`w-full bg-gradient-to-r ${variant.gradient} hover:opacity-90 text-black font-bold py-6 text-base`}
          >
            {l("cta")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <button
            onClick={handleDismiss}
            className="w-full text-center text-xs text-gray-600 hover:text-gray-400 mt-4 transition-colors"
          >
            {l("dismiss")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
