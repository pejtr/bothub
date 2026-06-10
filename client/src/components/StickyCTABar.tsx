/**
 * Sticky CTA Bar - Appears when user scrolls past hero section
 * Persistent conversion opportunity throughout the page
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyCTABarProps {
  onCTAClick: () => void;
}

export default function StickyCTABar({ onCTAClick }: StickyCTABarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 600px (past hero)
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0F]/95 backdrop-blur-lg border-t border-[#D4AF37]/20"
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  77 AI expertů čeká na vás
                </p>
                <p className="text-xs text-gray-400 truncate hidden sm:block">
                  Začněte s FREE plánem — žádná kreditní karta
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={onCTAClick}
                className="bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0F] font-semibold hover:opacity-90 text-sm"
                size="sm"
              >
                Začít zdarma
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Zavřít"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
