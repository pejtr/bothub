/**
 * Urgency Timer - Countdown for pricing section
 * Creates FOMO and urgency to drive conversions (Hormozi principle)
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap } from "lucide-react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function getEndOfDay(): Date {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

function getStoredEndTime(): Date {
  const stored = localStorage.getItem("ibot_offer_end");
  if (stored) {
    const d = new Date(stored);
    if (d > new Date()) return d;
  }
  // Set end time to end of today
  const end = getEndOfDay();
  localStorage.setItem("ibot_offer_end", end.toISOString());
  return end;
}

export default function UrgencyTimer() {
  const [endTime] = useState(() => getStoredEndTime());
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        // Reset to next day
        const nextEnd = new Date();
        nextEnd.setDate(nextEnd.getDate() + 1);
        nextEnd.setHours(23, 59, 59, 999);
        localStorage.setItem("ibot_offer_end", nextEnd.toISOString());
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (isExpired) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-xl p-3 mb-6"
    >
      <div className="flex items-center gap-2 text-red-400">
        <Clock className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-medium">Dnešní nabídka vyprší za:</span>
      </div>
      <div className="flex items-center gap-1">
        {[
          { value: timeLeft.hours, label: "hod" },
          { value: timeLeft.minutes, label: "min" },
          { value: timeLeft.seconds, label: "sek" },
        ].map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-1">
            {i > 0 && <span className="text-red-400 font-bold">:</span>}
            <div className="bg-[#1A1A1F] border border-red-500/30 rounded-lg px-2 py-1 min-w-[40px] text-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={unit.value}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="text-white font-bold text-sm tabular-nums"
                >
                  {String(unit.value).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
              <p className="text-gray-500 text-[10px]">{unit.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 text-[#D4AF37]">
        <Zap className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">Heritage Collection ZDARMA</span>
      </div>
    </motion.div>
  );
}
