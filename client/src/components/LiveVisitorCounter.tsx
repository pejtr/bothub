/**
 * Live Visitor Counter - Social proof element
 * Shows simulated real-time visitor count to create FOMO
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";

// Base count + random fluctuation to simulate real visitors
const BASE_COUNT = 47;
const FLUCTUATION = 12;

function getRandomCount(): number {
  return BASE_COUNT + Math.floor(Math.random() * FLUCTUATION);
}

export default function LiveVisitorCounter() {
  const [count, setCount] = useState(getRandomCount());
  const [prevCount, setPrevCount] = useState(count);
  const [isIncreasing, setIsIncreasing] = useState(true);

  useEffect(() => {
    // Update count every 8-15 seconds
    const interval = setInterval(() => {
      const newCount = getRandomCount();
      setIsIncreasing(newCount >= count);
      setPrevCount(count);
      setCount(newCount);
    }, 8000 + Math.random() * 7000);

    return () => clearInterval(interval);
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 bg-[#1A1A1F] border border-[#2A2A2F] rounded-full px-3 py-1.5"
    >
      {/* Pulsing green dot */}
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping opacity-75" />
      </div>

      <Users className="w-3.5 h-3.5 text-gray-400" />

      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: isIncreasing ? 5 : -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: isIncreasing ? -5 : 5 }}
          className="text-xs font-semibold text-white tabular-nums"
        >
          {count}
        </motion.span>
      </AnimatePresence>

      <span className="text-xs text-gray-400">lidí právě prohlíží iBoty</span>
    </motion.div>
  );
}
