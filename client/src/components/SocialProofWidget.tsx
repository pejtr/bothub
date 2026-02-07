import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface SocialEvent {
  name: string;
  city: string;
  actionCs: string;
  actionEn: string;
  plan: string;
}

const socialProofEvents: SocialEvent[] = [
  { name: "Martin", city: "Praha", actionCs: "aktivoval GOLD plán", actionEn: "activated GOLD plan", plan: "gold" },
  { name: "Petra", city: "Brno", actionCs: "se zaregistrovala ZDARMA", actionEn: "registered for FREE", plan: "free" },
  { name: "Jakub", city: "Ostrava", actionCs: "aktivoval DIAMOND plán", actionEn: "activated DIAMOND plan", plan: "diamond" },
  { name: "Lucie", city: "Plzeň", actionCs: "odemkla katalog iBotů", actionEn: "unlocked the iBot catalog", plan: "free" },
  { name: "Tomáš", city: "Olomouc", actionCs: "se stal affiliate partnerem", actionEn: "became an affiliate partner", plan: "affiliate" },
  { name: "Kateřina", city: "Liberec", actionCs: "aktivovala GOLD plán", actionEn: "activated GOLD plan", plan: "gold" },
  { name: "David", city: "České Budějovice", actionCs: "se zaregistroval ZDARMA", actionEn: "registered for FREE", plan: "free" },
  { name: "Anna", city: "Hradec Králové", actionCs: "aktivovala DIAMOND plán", actionEn: "activated DIAMOND plan", plan: "diamond" },
  { name: "Ondřej", city: "Pardubice", actionCs: "odemkl katalog iBotů", actionEn: "unlocked the iBot catalog", plan: "free" },
  { name: "Veronika", city: "Zlín", actionCs: "se stala affiliate partnerem", actionEn: "became an affiliate partner", plan: "affiliate" },
  { name: "Filip", city: "Jihlava", actionCs: "aktivoval GOLD plán", actionEn: "activated GOLD plan", plan: "gold" },
  { name: "Markéta", city: "Karlovy Vary", actionCs: "se zaregistrovala ZDARMA", actionEn: "registered for FREE", plan: "free" },
  { name: "Michal", city: "Ústí nad Labem", actionCs: "aktivoval DIAMOND plán", actionEn: "activated DIAMOND plan", plan: "diamond" },
  { name: "Tereza", city: "Opava", actionCs: "aktivovala GOLD plán", actionEn: "activated GOLD plan", plan: "gold" },
  { name: "Jan", city: "Most", actionCs: "se zaregistroval ZDARMA", actionEn: "registered for FREE", plan: "free" },
  { name: "Eliška", city: "Frýdek-Místek", actionCs: "odemkla katalog iBotů", actionEn: "unlocked the iBot catalog", plan: "free" },
  { name: "Pavel", city: "Kladno", actionCs: "se stal affiliate partnerem", actionEn: "became an affiliate partner", plan: "affiliate" },
  { name: "Simona", city: "Teplice", actionCs: "aktivovala GOLD plán", actionEn: "activated GOLD plan", plan: "gold" },
  { name: "Radek", city: "Děčín", actionCs: "aktivoval DIAMOND plán", actionEn: "activated DIAMOND plan", plan: "diamond" },
  { name: "Nikola", city: "Chomutov", actionCs: "se zaregistrovala ZDARMA", actionEn: "registered for FREE", plan: "free" },
];

function getPlanColor(plan: string): string {
  switch (plan) {
    case "gold": return "text-amber-400";
    case "diamond": return "text-purple-400";
    case "affiliate": return "text-green-400";
    default: return "text-blue-400";
  }
}

function getPlanIcon(plan: string) {
  switch (plan) {
    case "gold":
    case "diamond":
      return <Sparkles className="w-4 h-4 text-amber-400" />;
    default:
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
  }
}

export function SocialProofWidget() {
  const { locale } = useI18n();
  const [currentEvent, setCurrentEvent] = useState<SocialEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isDismissed = useCallback(() => {
    return sessionStorage.getItem("social_proof_dismissed") === "true";
  }, []);

  const getTimeAgo = useCallback((): string => {
    const minutes = Math.floor(Math.random() * 15) + 1;
    return locale === "en" ? `${minutes} min ago` : `před ${minutes} min`;
  }, [locale]);

  useEffect(() => {
    if (isDismissed()) return;
    const initialDelay = setTimeout(() => { showNextEvent(); }, 8000);
    return () => clearTimeout(initialDelay);
  }, []);

  const showNextEvent = useCallback(() => {
    const idx = Math.floor(Math.random() * socialProofEvents.length);
    setCurrentEvent(socialProofEvents[idx]!);
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
      const nextDelay = (Math.random() * 15 + 15) * 1000;
      setTimeout(() => { if (!isDismissed()) showNextEvent(); }, nextDelay);
    }, 5000);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("social_proof_dismissed", "true");
  };

  if (!currentEvent) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-6 z-40 max-w-xs"
        >
          <div className="relative rounded-xl border border-white/10 bg-[#0D0D14]/95 backdrop-blur-lg shadow-xl shadow-black/30 p-4 pr-8">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors text-xs"
              aria-label={locale === "en" ? "Close" : "Zavřít"}
            >
              ×
            </button>
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">{getPlanIcon(currentEvent.plan)}</div>
              <div className="min-w-0">
                <p className="text-sm text-gray-200 leading-snug">
                  <span className="font-semibold text-white">{currentEvent.name}</span>
                  {locale === "en" ? " from " : " z "}
                  <span className="text-gray-400">{currentEvent.city}</span>
                  {locale === "en" ? " just " : " právě "}
                  <span className={`font-medium ${getPlanColor(currentEvent.plan)}`}>
                    {locale === "en" ? currentEvent.actionEn : currentEvent.actionCs}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{getTimeAgo()}</p>
              </div>
            </div>
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500/50 to-purple-500/50 rounded-b-xl"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
