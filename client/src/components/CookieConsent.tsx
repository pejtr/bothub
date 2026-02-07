import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_KEY = "bothub_cookie_consent";

export function CookieConsent() {
  const { locale } = useI18n();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Delay showing to not interfere with page load
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ essential: true, analytics: true, marketing: true, ts: Date.now() }));
    setVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ essential: true, analytics: false, marketing: false, ts: Date.now() }));
    setVisible(false);
  };

  const en = locale === "en";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden md:flex w-10 h-10 rounded-full bg-amber-500/10 items-center justify-center flex-shrink-0 mt-1">
                <Cookie className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold font-[Space_Grotesk] text-lg flex items-center gap-2">
                    <Cookie className="w-5 h-5 text-amber-400 md:hidden" />
                    {en ? "Cookie Settings" : "Nastavení cookies"}
                  </h3>
                  <button onClick={acceptEssential} className="text-gray-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-400 leading-relaxed">
                  {en
                    ? "We use cookies to improve your experience, analyze traffic, and personalize content. You can choose which cookies to accept."
                    : "Používáme cookies pro zlepšení vašeho zážitku, analýzu návštěvnosti a personalizaci obsahu. Můžete si vybrat, které cookies přijmete."}
                </p>

                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="space-y-2 text-xs text-gray-500 border-t border-white/5 pt-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-gray-300 font-medium">{en ? "Essential" : "Nezbytné"}</span>
                      <span>— {en ? "Required for basic site functionality" : "Nutné pro základní funkčnost webu"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-gray-300 font-medium">{en ? "Analytics" : "Analytické"}</span>
                      <span>— {en ? "Help us understand how visitors use the site" : "Pomáhají nám pochopit, jak návštěvníci web používají"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-gray-300 font-medium">{en ? "Marketing" : "Marketingové"}</span>
                      <span>— {en ? "Used for personalized content and A/B testing" : "Slouží k personalizaci obsahu a A/B testování"}</span>
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button
                    onClick={acceptAll}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-6"
                  >
                    {en ? "Accept All" : "Přijmout vše"}
                  </Button>
                  <Button
                    onClick={acceptEssential}
                    variant="outline"
                    className="border-white/10 text-gray-300 hover:bg-white/5"
                  >
                    {en ? "Essential Only" : "Pouze nezbytné"}
                  </Button>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-gray-500 hover:text-amber-400 transition-colors underline underline-offset-2"
                  >
                    {showDetails ? (en ? "Hide details" : "Skrýt detaily") : (en ? "Show details" : "Zobrazit detaily")}
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                  <Shield className="w-3 h-3" />
                  {en ? "GDPR compliant • Your data is safe" : "V souladu s GDPR • Vaše data jsou v bezpečí"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
