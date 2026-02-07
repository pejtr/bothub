import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

// Simulated social proof data — mix of realistic Czech names, cities and actions
const socialProofEvents = [
  { name: "Martin", city: "Praha", action: "aktivoval GOLD plán", plan: "gold" },
  { name: "Petra", city: "Brno", action: "se zaregistrovala ZDARMA", plan: "free" },
  { name: "Jakub", city: "Ostrava", action: "aktivoval DIAMOND plán", plan: "diamond" },
  { name: "Lucie", city: "Plzeň", action: "odemkla katalog iBotů", plan: "free" },
  { name: "Tomáš", city: "Olomouc", action: "se stal affiliate partnerem", plan: "affiliate" },
  { name: "Kateřina", city: "Liberec", action: "aktivovala GOLD plán", plan: "gold" },
  { name: "David", city: "České Budějovice", action: "se zaregistroval ZDARMA", plan: "free" },
  { name: "Anna", city: "Hradec Králové", action: "aktivovala DIAMOND plán", plan: "diamond" },
  { name: "Ondřej", city: "Pardubice", action: "odemkl katalog iBotů", plan: "free" },
  { name: "Veronika", city: "Zlín", action: "se stala affiliate partnerem", plan: "affiliate" },
  { name: "Filip", city: "Jihlava", action: "aktivoval GOLD plán", plan: "gold" },
  { name: "Markéta", city: "Karlovy Vary", action: "se zaregistrovala ZDARMA", plan: "free" },
  { name: "Michal", city: "Ústí nad Labem", action: "aktivoval DIAMOND plán", plan: "diamond" },
  { name: "Tereza", city: "Opava", action: "aktivovala GOLD plán", plan: "gold" },
  { name: "Jan", city: "Most", action: "se zaregistroval ZDARMA", plan: "free" },
  { name: "Eliška", city: "Frýdek-Místek", action: "odemkla katalog iBotů", plan: "free" },
  { name: "Pavel", city: "Kladno", action: "se stal affiliate partnerem", plan: "affiliate" },
  { name: "Simona", city: "Teplice", action: "aktivovala GOLD plán", plan: "gold" },
  { name: "Radek", city: "Děčín", action: "aktivoval DIAMOND plán", plan: "diamond" },
  { name: "Nikola", city: "Chomutov", action: "se zaregistrovala ZDARMA", plan: "free" },
];

function getTimeAgo(): string {
  const minutes = Math.floor(Math.random() * 15) + 1;
  return `před ${minutes} min`;
}

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
  const [currentEvent, setCurrentEvent] = useState<typeof socialProofEvents[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [eventIndex, setEventIndex] = useState(0);

  // Check if user dismissed recently
  const isDismissed = useCallback(() => {
    const dismissed = sessionStorage.getItem("social_proof_dismissed");
    return dismissed === "true";
  }, []);

  useEffect(() => {
    if (isDismissed()) return;

    // Initial delay before first notification
    const initialDelay = setTimeout(() => {
      showNextEvent();
    }, 8000);

    return () => clearTimeout(initialDelay);
  }, []);

  const showNextEvent = useCallback(() => {
    const idx = Math.floor(Math.random() * socialProofEvents.length);
    setEventIndex(idx);
    setCurrentEvent(socialProofEvents[idx]!);
    setIsVisible(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);

      // Schedule next notification (random 15-30 seconds)
      const nextDelay = (Math.random() * 15 + 15) * 1000;
      setTimeout(() => {
        if (!isDismissed()) showNextEvent();
      }, nextDelay);
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
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors text-xs"
              aria-label="Zavřít"
            >
              ×
            </button>

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {getPlanIcon(currentEvent.plan)}
              </div>

              {/* Content */}
              <div className="min-w-0">
                <p className="text-sm text-gray-200 leading-snug">
                  <span className="font-semibold text-white">{currentEvent.name}</span>
                  {" z "}
                  <span className="text-gray-400">{currentEvent.city}</span>
                  {" právě "}
                  <span className={`font-medium ${getPlanColor(currentEvent.plan)}`}>
                    {currentEvent.action}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{getTimeAgo()}</p>
              </div>
            </div>

            {/* Progress bar (auto-dismiss indicator) */}
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
