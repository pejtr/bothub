/**
 * Heritage Collection Component
 * Red Dwarf S04E06 "Meltdown" inspired AI chatbot collection
 * Design: Dark premium with gold accents, split into Heroworld & Villainworld
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Shield, 
  Sword, 
  Flame, 
  Star, 
  ChevronRight, 
  Lock,
  AlertTriangle,
  Crown,
  MessageSquare
} from "lucide-react";
import { heritageBots, heritageCategories, type HeritageBot } from "@/data/heritage-collection";

interface HeritageCollectionProps {
  onBotClick?: (bot: HeritageBot) => void;
}

export default function HeritageCollection({ onBotClick }: HeritageCollectionProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "villain">("hero");
  const [expandedBot, setExpandedBot] = useState<string | null>(null);

  const heroBots = heritageBots.filter(b => b.side === "hero");
  const villainBots = heritageBots.filter(b => b.side === "villain");
  const activeBots = activeTab === "hero" ? heroBots : villainBots;
  const activeCategory = heritageCategories.find(c => c.id === (activeTab === "hero" ? "heroworld" : "villainworld"));

  return (
    <section id="heritage" className="py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#12100A] to-[#0A0A0F]" />
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 50%), 
                          radial-gradient(circle at 80% 50%, ${activeTab === "hero" ? "#D4AF37" : "#DC2626"} 0%, transparent 50%)`
      }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-2 mb-6">
            🏛️ Exkluzivní kolekce
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Heritage <span className="text-gold-gradient">Collection</span>
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-2">
            Inspirováno kultovní epizodou Červeného trpaslíka "Roztavení" (S04E06).
            AI osobnosti největších postav historie — od géniů po anti-vzory.
          </p>
          <p className="text-sm text-gray-500">
            {heroBots.length + villainBots.length} unikátních AI osobností • DIAMOND plán zdarma • GOLD plán +490 Kč/měs
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-[#1A1A1F] border border-[#2A2A2F] rounded-full p-1.5">
            <button
              onClick={() => setActiveTab("hero")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all text-sm font-medium ${
                activeTab === "hero"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0F] shadow-lg shadow-[#D4AF37]/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Crown className="w-4 h-4" />
              Heroworld
              <span className="text-xs opacity-70">({heroBots.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("villain")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all text-sm font-medium ${
                activeTab === "villain"
                  ? "bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white shadow-lg shadow-[#DC2626]/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Flame className="w-4 h-4" />
              Villainworld
              <span className="text-xs opacity-70">({villainBots.length})</span>
            </button>
          </div>
        </div>

        {/* Category Description */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {activeCategory?.description}
          </p>
          {activeTab === "villain" && (
            <div className="inline-flex items-center gap-2 mt-4 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-300">
                Dark Side Advisors — učte se z chyb historie, abyste je neopakovali
              </span>
            </div>
          )}
        </motion.div>

        {/* Bot Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {activeBots.map((bot, index) => (
              <motion.div
                key={bot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-300 ${
                    bot.side === "hero"
                      ? "bg-[#1A1A1F]/80 border-[#2A2A2F] hover:border-[#D4AF37]/50 hover:shadow-lg hover:shadow-[#D4AF37]/5"
                      : "bg-[#1A0A0A]/80 border-[#2A1515] hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/5"
                  } ${expandedBot === bot.id ? (bot.side === "hero" ? "border-[#D4AF37]/50" : "border-red-500/50") : ""}`}
                  onClick={() => setExpandedBot(expandedBot === bot.id ? null : bot.id)}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                        bot.side === "hero"
                          ? "bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5"
                          : "bg-gradient-to-br from-red-500/20 to-red-500/5"
                      }`}>
                        {bot.avatar}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate">{bot.name}</h4>
                        <p className={`text-xs truncate ${
                          bot.side === "hero" ? "text-[#D4AF37]/70" : "text-red-400/70"
                        }`}>
                          {bot.title}
                        </p>
                        <p className="text-xs text-gray-500">{bot.era}</p>
                      </div>
                    </div>

                    {/* Specialty */}
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                      {bot.specialty}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {bot.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            bot.side === "hero"
                              ? "bg-[#D4AF37]/10 text-[#D4AF37]/70"
                              : "bg-red-500/10 text-red-400/70"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {expandedBot === bot.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className={`border-t pt-3 mt-1 ${
                            bot.side === "hero" ? "border-[#D4AF37]/20" : "border-red-500/20"
                          }`}>
                            <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                              {bot.description}
                            </p>
                            <div className={`text-xs p-3 rounded-lg mb-3 ${
                              bot.side === "hero" ? "bg-[#D4AF37]/5" : "bg-red-500/5"
                            }`}>
                              <span className="text-gray-500 block mb-1">Zkuste se zeptat:</span>
                              <span className={bot.side === "hero" ? "text-[#D4AF37]/80" : "text-red-400/80"}>
                                "{bot.samplePrompt}"
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className={`w-full text-xs ${
                                bot.side === "hero"
                                  ? "bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0F] hover:opacity-90"
                                  : "bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onBotClick?.(bot);
                              }}
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Chatovat s {bot.name.split(" ")[0]}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-3 bg-[#1A1A1F]/50 border border-[#2A2A2F] rounded-full px-6 py-3">
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-gray-300 text-sm">
              Heritage Collection je součástí DIAMOND plánu nebo jako příplatek k GOLD plánu
            </span>
            <a href="#cenik" className="text-[#D4AF37] text-sm font-semibold hover:underline flex items-center gap-1">
              Zobrazit plány <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
