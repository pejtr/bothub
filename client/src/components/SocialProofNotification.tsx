/**
 * Social Proof Notification Component
 * Shows real-time purchase notifications to increase urgency and trust
 * Hormozi-style social proof for higher conversions
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, ArrowRight } from "lucide-react";

interface Notification {
  id: number;
  name: string;
  city: string;
  plan: string;
  time: string;
}

// Sample notifications data
const sampleNotifications: Omit<Notification, "id">[] = [
  { name: "Martin K.", city: "Praha", plan: "GOLD", time: "před 2 minutami" },
  { name: "Petra S.", city: "Brno", plan: "DIAMOND", time: "před 5 minutami" },
  { name: "Tomáš R.", city: "Ostrava", plan: "GOLD", time: "před 8 minutami" },
  { name: "Jana M.", city: "Plzeň", plan: "FREE", time: "před 12 minutami" },
  { name: "David H.", city: "Liberec", plan: "GOLD", time: "před 15 minutami" },
  { name: "Lucie P.", city: "Olomouc", plan: "DIAMOND", time: "před 18 minutami" },
  { name: "Jakub V.", city: "České Budějovice", plan: "GOLD", time: "před 22 minutami" },
  { name: "Markéta K.", city: "Hradec Králové", plan: "FREE", time: "před 25 minutami" },
  { name: "Filip N.", city: "Pardubice", plan: "GOLD", time: "před 30 minutami" },
  { name: "Tereza B.", city: "Zlín", plan: "DIAMOND", time: "před 35 minutami" },
];

const planColors: Record<string, string> = {
  FREE: "text-gray-400",
  GOLD: "text-[#D4AF37]",
  DIAMOND: "text-blue-400",
};

const planBgColors: Record<string, string> = {
  FREE: "bg-gray-500/20",
  GOLD: "bg-[#D4AF37]/20",
  DIAMOND: "bg-blue-500/20",
};

export default function SocialProofNotification() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [notificationIndex, setNotificationIndex] = useState(0);

  useEffect(() => {
    // Show first notification after 8 seconds
    const initialDelay = setTimeout(() => {
      showNotification();
    }, 8000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Hide notification after 8 seconds (longer duration)
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    // Show next notification after 20-35 seconds (less frequent)
    const nextTimer = setTimeout(() => {
      showNotification();
    }, Math.random() * 15000 + 20000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [isVisible, notificationIndex]);

  const showNotification = () => {
    const notification = {
      ...sampleNotifications[notificationIndex % sampleNotifications.length],
      id: Date.now(),
    };
    setCurrentNotification(notification);
    setIsVisible(true);
    setNotificationIndex((prev) => prev + 1);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleCTA = () => {
    document.getElementById('cenik')?.scrollIntoView({ behavior: 'smooth' });
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && currentNotification && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="fixed bottom-6 left-6 z-50 max-w-md"
        >
          {/* Pulsating glow effect */}
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(212, 175, 55, 0.2)",
                "0 0 40px rgba(212, 175, 55, 0.4)",
                "0 0 20px rgba(212, 175, 55, 0.2)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-[#1A1A1F]/95 backdrop-blur-lg border border-[#D4AF37]/30 rounded-xl p-4 shadow-2xl"
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-3">
              {/* Circular avatar with plan color */}
              <div className={`w-12 h-12 rounded-full ${planBgColors[currentNotification.plan]} flex items-center justify-center shrink-0 border-2 border-[#D4AF37]/30`}>
                <CheckCircle className="w-6 h-6 text-[#D4AF37]" />
              </div>
              
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-sm text-white">
                  <span className="font-semibold">{currentNotification.name}</span>
                  <span className="text-gray-400"> z </span>
                  <span className="text-gray-300">{currentNotification.city}</span>
                </p>
                <p className="text-sm text-gray-400">
                  právě zakoupil{" "}
                  <span className={`font-bold ${planColors[currentNotification.plan]}`}>
                    {currentNotification.plan}
                  </span>
                  {" "}plán
                </p>
                <p className="text-xs text-gray-500 mt-1">{currentNotification.time}</p>
              </div>
            </div>
            
            {/* CTA Button - positioned to the right */}
            <div className="mt-3 pt-3 border-t border-[#2A2A2F] flex items-center justify-between">
              <span className="text-xs text-gray-500">Připojte se k {2847 + notificationIndex} uživatelům</span>
              <button
                onClick={handleCTA}
                className="flex items-center gap-1 text-sm font-semibold text-[#D4AF37] hover:text-[#F5D77A] transition-colors group"
              >
                TAM CHCI TAKY
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* Animated progress bar */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] rounded-b-xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
