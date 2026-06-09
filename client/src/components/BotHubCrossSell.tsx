/**
 * BotHub Cross-Sell Section
 * Promotes the full BotHub ecosystem from iBots landing page
 * Positioned before the final CTA section
 */

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Globe,
  ExternalLink,
  MessageSquare,
  Zap,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { BOTHUB_URL } from "./BotHubBadge";

const ecosystemFeatures = [
  {
    icon: MessageSquare,
    title: "77+ AI Osobností",
    description: "Kompletní katalog expertních chatbotů pro každou oblast podnikání",
  },
  {
    icon: Zap,
    title: "Multi-platform",
    description: "Web, Telegram, Discord, API — vaši iBoti všude, kde potřebujete",
  },
  {
    icon: Users,
    title: "Affiliate Program",
    description: "Až 77% recurring provize z každého doporučeného předplatného",
  },
  {
    icon: BarChart3,
    title: "Analytika & Reporty",
    description: "Real-time data o výkonnosti vašich chatbotů a konverzích",
  },
];

const platformLinks = [
  { label: "Katalog iBotů", href: `${BOTHUB_URL}/#katalog`, description: "Prohlédněte si všech 77 AI osobností" },
  { label: "Affiliate Program", href: `${BOTHUB_URL}/#affiliate`, description: "Začněte vydělávat s provizemi až 77%" },
  { label: "Cenové plány", href: `${BOTHUB_URL}/#cenik`, description: "FREE, GOLD nebo DIAMOND — vyberte si" },
  { label: "Blog & Novinky", href: `${BOTHUB_URL}/blog`, description: "Tipy, strategie a novinky ze světa AI" },
];

export default function BotHubCrossSell() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/[0.02] to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-2 mb-6">
            <Globe className="w-4 h-4 mr-2" />
            BotHub Ekosystém
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            iBots jsou součástí <span className="text-gold-gradient">BotHub.cz</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Kompletní platforma pro AI chatboty — od prodejních asistentů přes terapeutické boty 
            až po investiční poradce. Vše na jednom místě.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ecosystemFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-[#1A1A1F]/60 border-[#2A2A2F] p-6 h-full hover:border-[#D4AF37]/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#8B7355]/20 flex items-center justify-center mb-4 group-hover:from-[#D4AF37]/30 group-hover:to-[#8B7355]/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Platform Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="bg-[#1A1A1F]/40 border border-[#2A2A2F] rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Prozkoumejte celý ekosystém
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#0A0A0F]/50 border border-[#2A2A2F] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all group"
                >
                  <CheckCircle className="w-5 h-5 text-[#D4AF37] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-white group-hover:text-[#D4AF37] transition-colors text-sm">
                      {link.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {link.description}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <a
            href={BOTHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="btn-gold text-lg px-8 py-6 group">
              Navštívit BotHub.cz
              <ExternalLink className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <p className="text-sm text-gray-500 mt-4">
            Vaše iBots předplatné funguje na obou platformách
          </p>
        </motion.div>
      </div>
    </section>
  );
}
