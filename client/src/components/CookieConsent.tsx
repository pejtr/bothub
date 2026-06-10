/**
 * Cookie Consent Banner - GDPR Compliance
 * Dark premium design consistent with iBots theme
 */

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Cookie, Shield, Settings, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ibots-cookie-consent");
    if (!consent) {
      // Show after 1.5s delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("ibots-cookie-consent", JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem("ibots-cookie-consent", JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-[90] p-4"
        >
          <div className="max-w-4xl mx-auto bg-[#12121A] border border-[#2A2A2F] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5 text-[#D4AF37]" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Používáme cookies</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Používáme cookies pro zlepšení vašeho zážitku, analýzu návštěvnosti a personalizaci obsahu. 
                    Kliknutím na "Přijmout vše" souhlasíte s použitím všech cookies.
                  </p>

                  {/* Details */}
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3"
                      >
                        <div className="flex items-center justify-between p-3 bg-[#1A1A1F] rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-white">Nezbytné cookies</div>
                            <div className="text-xs text-gray-500">Nutné pro fungování webu</div>
                          </div>
                          <div className="text-xs text-[#D4AF37] font-medium">Vždy aktivní</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#1A1A1F] rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-white">Analytické cookies</div>
                            <div className="text-xs text-gray-500">Pomáhají nám zlepšovat web</div>
                          </div>
                          <div className="text-xs text-gray-400">Volitelné</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#1A1A1F] rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-white">Marketingové cookies</div>
                            <div className="text-xs text-gray-500">Pro personalizaci reklam</div>
                          </div>
                          <div className="text-xs text-gray-400">Volitelné</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => setIsVisible(false)}
                  className="w-8 h-8 rounded-lg bg-[#2A2A2F] flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4 ml-14">
                <Button className="btn-gold px-6" onClick={handleAcceptAll}>
                  Přijmout vše
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-[#2A2A2F] text-gray-300 hover:border-[#D4AF37]/30 hover:text-white px-6"
                  onClick={handleAcceptNecessary}
                >
                  Pouze nezbytné
                </Button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  {showDetails ? "Skrýt detaily" : "Nastavení"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
