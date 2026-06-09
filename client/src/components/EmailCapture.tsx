/**
 * Email Capture Component with Lead Magnet
 * "7 způsobů jak AI zvýší váš ROI" - free PDF guide
 * Hormozi-style value stacking for maximum conversion
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  ArrowRight, 
  CheckCircle, 
  Download, 
  BookOpen, 
  Zap, 
  TrendingUp, 
  Gift,
  Lock,
  Mail
} from "lucide-react";
import { toast } from "sonner";

const leadMagnetBenefits = [
  "7 ověřených strategií pro zvýšení ROI pomocí AI",
  "Konkrétní příklady z praxe českých podnikatelů",
  "Šablona pro implementaci AI do vašeho byznysu",
  "Bonus: Checklist pro výběr správného AI nástroje",
  "Bonus: 30minutová konzultace zdarma",
];

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitted(true);
    toast.success("E-book odeslán na váš email!", {
      description: "Zkontrolujte svou schránku (i spam složku).",
    });
  };

  if (isSubmitted) {
    return (
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#0A0D0F] to-[#0A0A0F]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <Card className="bg-gradient-to-br from-[#D4AF37]/10 to-[#1A1A1F] border-[#D4AF37]/30 p-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Děkujeme!</h3>
              <p className="text-gray-300 mb-4">
                E-book "7 způsobů jak AI zvýší váš ROI" byl odeslán na <span className="text-[#D4AF37] font-semibold">{email}</span>
              </p>
              <p className="text-sm text-gray-400">
                Zkontrolujte svou emailovou schránku. Pokud email nevidíte, podívejte se do spam složky.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#0A0D0F] to-[#0A0A0F]" />
      
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Left - Lead Magnet Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-2 mb-6">
              <Gift className="w-4 h-4 mr-1" />
              Zdarma ke stažení
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gold-gradient">7 způsobů</span> jak AI zvýší váš ROI
            </h2>
            
            <p className="text-gray-300 text-lg mb-8">
              Praktický e-book pro podnikatele, kteří chtějí využít AI pro maximální návratnost investic. 
              Žádná teorie — pouze ověřené strategie z praxe.
            </p>

            {/* Benefits list */}
            <ul className="space-y-4 mb-8">
              {leadMagnetBenefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="text-gray-300">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            {/* Social proof */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {["MK", "PS", "TR", "JM"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center text-[#0A0A0F] text-xs font-bold border-2 border-[#0A0A0F]"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span>Stáhlo si již <span className="text-[#D4AF37] font-semibold">2,847+</span> podnikatelů</span>
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-[#12121A] border-[#2A2A2F] p-8 relative overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent" />
              
              <div className="relative z-10">
                {/* E-book preview */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-[#1A1A1F] rounded-xl border border-[#2A2A2F]">
                  <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center shrink-0">
                    <BookOpen className="w-8 h-8 text-[#0A0A0F]" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">7 způsobů jak AI zvýší váš ROI</div>
                    <div className="text-xs text-gray-400 mt-1">PDF • 24 stran • Česky</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs line-through text-gray-500">990 Kč</span>
                      <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">ZDARMA</Badge>
                    </div>
                  </div>
                </div>

                {/* Value stack */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">E-book (24 stran)</span>
                    <span className="text-gray-400 line-through">990 Kč</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Implementační šablona</span>
                    <span className="text-gray-400 line-through">490 Kč</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">AI checklist</span>
                    <span className="text-gray-400 line-through">290 Kč</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">30min konzultace</span>
                    <span className="text-gray-400 line-through">1 990 Kč</span>
                  </div>
                  <div className="border-t border-[#2A2A2F] pt-2 flex items-center justify-between">
                    <span className="font-semibold text-white">Celková hodnota</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through">3 760 Kč</span>
                      <span className="text-[#D4AF37] font-bold text-lg">ZDARMA</span>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Vaše jméno"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white py-5"
                  />
                  <Input
                    type="email"
                    placeholder="Váš nejlepší email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white py-5"
                  />
                  <Button type="submit" className="btn-gold w-full py-6 text-base">
                    <Download className="mr-2 w-5 h-5" />
                    Stáhnout zdarma
                  </Button>
                </form>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                  <Lock className="w-3 h-3" />
                  <span>Vaše data jsou v bezpečí. Žádný spam.</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
