/**
 * Affiliate Program Page
 * Dedicated page for affiliate partners with commission details and registration
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight,
  CheckCircle,
  Percent,
  Clock,
  Coins,
  MessageSquare,
  TrendingUp,
  Users,
  Target,
  Zap,
  Award,
  BarChart3,
  Link as LinkIcon,
  Share2,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const HERO_BG = "https://private-us-east-1.manuscdn.com/sessionFile/ZAtoIS2Z0EkO0kuTvu9UXk/sandbox/oGW3Z0ncEVLQL3RYXxWovU-img-2_1770034692000_na1fn_aWJvdHMtaGVyby1iYWNrZ3JvdW5k.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWkF0b0lTMlowRWtPMGt1VHZ1OVVYay9zYW5kYm94L29HVzNaMG5jRVZMUUwzUllYeFdvdlUtaW1nLTJfMTc3MDAzNDY5MjAwMF9uYTFmbl9hV0p2ZEhNdGFHVnlieTFpWVdOclozSnZkVzVrLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=XUBTs5XiHFQ2d608lDYOkwn9OAVA~F0BdUhibRr8-RRcb9-fs0gxqFjqEMJuD4EOuzeJFvtD7eOJpsDn4DGk2AuK5VzkpJAetvP0Ipmw-bL5QVqFoBV9duokVxul-ei~faLs86AEluC0-POEw4is~tlcnl1BLO7VsRjwVeHxlSNpnf2TUt9iMeDXBr~Qb~y4rsrUiLNVySkdYSK~OG5cZ-~c3VpqlXyRBN3AbGIS9Q6LOEV-K-BehIb0E2ynP-sLzapgmI5OWYPGR0tuqP0KXNWIKhosuu9oTOIZlm4XRfXaibNTealy9NiHlcTouWYqJI3IvfAP1BsbcPXey8fDGw__";

const commissionTiers = [
  { tier: "GOLD", commission: "66%", price: "990 Kč", desc: "Z každého GOLD předplatného", color: "#D4AF37" },
  { tier: "DIAMOND", commission: "77%", price: "2 490 Kč", desc: "Z každého DIAMOND předplatného", color: "#60A5FA" },
];

const benefits = [
  { icon: Percent, title: "Až 77% provize", desc: "Nejvyšší provize na trhu AI chatbotů" },
  { icon: Clock, title: "30denní cookie", desc: "Dlouhá doba pro konverzi vašich odkazů" },
  { icon: Coins, title: "Týdenní výplaty", desc: "Pravidelné výplaty každý týden" },
  { icon: MessageSquare, title: "Podpora 24/7", desc: "Dedikovaný affiliate manager" },
  { icon: BarChart3, title: "Real-time statistiky", desc: "Sledujte své výsledky v reálném čase" },
  { icon: LinkIcon, title: "Vlastní tracking linky", desc: "Personalizované odkazy pro každou kampaň" },
];

const steps = [
  { number: 1, title: "Registrace", desc: "Vyplňte jednoduchý registrační formulář" },
  { number: 2, title: "Získejte linky", desc: "Dostanete své unikátní affiliate odkazy" },
  { number: 3, title: "Sdílejte", desc: "Propagujte iBoty ve své komunitě" },
  { number: 4, title: "Vydělávejte", desc: "Získávejte provize z každého prodeje" },
];

const faq = [
  {
    q: "Jak funguje affiliate program?",
    a: "Získáte unikátní affiliate odkaz, který sdílíte se svou komunitou. Za každý prodej přes váš odkaz dostanete provizi 66% (GOLD) nebo 77% (DIAMOND)."
  },
  {
    q: "Kdy dostanu výplatu?",
    a: "Výplaty probíhají každý týden. Minimální částka pro výplatu je 1 000 Kč. Platby posíláme na váš bankovní účet nebo PayPal."
  },
  {
    q: "Jak dlouho platí cookie?",
    a: "Cookie platí 30 dní od prvního kliknutí. To znamená, že pokud někdo klikne na váš odkaz a do 30 dní si zakoupí plán, dostanete provizi."
  },
  {
    q: "Mohu propagovat na sociálních sítích?",
    a: "Ano! Můžete sdílet na jakékoliv platformě - Instagram, Facebook, YouTube, TikTok, blog, email list, atd."
  },
  {
    q: "Dostanu marketingové materiály?",
    a: "Ano, poskytneme vám bannery, texty, videa a další materiály pro snadnější propagaci."
  },
];

export default function Affiliate() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Registrace odeslána!", {
      description: "Brzy vás budeme kontaktovat s dalšími informacemi.",
    });
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-lg border-b border-[#D4AF37]/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center">
                <Brain className="w-6 h-6 text-[#0A0A0F]" />
              </div>
              <span className="text-xl font-bold text-gold-gradient">iBots</span>
            </a>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/">
              <a className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                Zpět na hlavní stránku
              </a>
            </Link>
            <Button className="btn-gold" onClick={() => document.getElementById('registrace')?.scrollIntoView({ behavior: 'smooth' })}>
              Registrovat se
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center pt-20">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/50 via-[#0A0A0F]/80 to-[#0A0A0F]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 mb-6">
              💰 Affiliate Program
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Vydělávejte až <span className="text-gold-gradient">77%</span> z každého prodeje
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Připojte se k nejlukrativnějšímu affiliate programu v oblasti AI chatbotů. 
              Sdílejte iBoty se svou komunitou a získejte štědré provize.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                className="btn-gold text-lg px-8 py-6"
                onClick={() => document.getElementById('registrace')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Začít vydělávat
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 text-lg px-8 py-6"
                onClick={() => document.getElementById('jak-to-funguje')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Jak to funguje
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-[#2A2A2F]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "77%", label: "Max. provize", icon: Percent },
              { value: "2 847+", label: "Aktivních uživatelů", icon: Users },
              { value: "30 dní", label: "Cookie doba", icon: Clock },
              { value: "Týdně", label: "Výplaty", icon: Coins },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                <div className="text-3xl font-bold text-gold-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Provizní <span className="text-gold-gradient">struktura</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Čím vyšší plán váš zákazník zakoupí, tím vyšší provizi dostanete
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {commissionTiers.map((item, index) => (
              <motion.div
                key={item.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-[#1A1A1F] to-[#0A0A0F] border-[#2A2A2F] p-8 hover:border-[#D4AF37]/50 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{item.tier}</h3>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Percent className="w-8 h-8" style={{ color: item.color }} />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-5xl font-bold text-gold-gradient mb-2">{item.commission}</div>
                    <div className="text-gray-400">provize z {item.price}/měsíc</div>
                  </div>

                  <div className="pt-4 border-t border-[#2A2A2F]">
                    <div className="text-sm text-gray-400 mb-2">Váš výdělek:</div>
                    <div className="text-2xl font-bold text-white">
                      {item.tier === "GOLD" ? "654 Kč" : "1 918 Kč"}
                      <span className="text-sm text-gray-400 font-normal">/měsíc</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Card className="bg-gradient-to-r from-[#D4AF37]/10 to-[#8B7355]/10 border-[#D4AF37]/30 p-6 max-w-2xl mx-auto">
              <TrendingUp className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Příklad výdělku</h3>
              <p className="text-gray-300">
                10 zákazníků na GOLD plánu = <span className="text-[#D4AF37] font-bold">6 540 Kč/měsíc</span>
              </p>
              <p className="text-gray-300">
                5 zákazníků na DIAMOND plánu = <span className="text-[#D4AF37] font-bold">9 590 Kč/měsíc</span>
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-b from-[#0A0A0F] via-[#0D0D12] to-[#0A0A0F]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Proč se <span className="text-gold-gradient">připojit</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Nejlepší podmínky pro affiliate partnery na trhu
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#1A1A1F]/80 border-[#2A2A2F] p-6 h-full hover:border-[#D4AF37]/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="jak-to-funguje" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Jak to <span className="text-gold-gradient">funguje</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              4 jednoduché kroky k vašemu pasivnímu příjmu
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className="bg-gradient-to-br from-[#1A1A1F] to-[#0A0A0F] border-[#2A2A2F] p-6 text-center h-full">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center text-2xl font-bold text-[#0A0A0F] mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-[#D4AF37]/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gradient-to-b from-[#0A0A0F] via-[#0D0D12] to-[#0A0A0F]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Časté <span className="text-gold-gradient">otázky</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faq.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-[#1A1A1F]/80 border-[#2A2A2F] p-6">
                  <h3 className="text-lg font-semibold mb-3 text-white">{item.q}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.a}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section id="registrace" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 border-[#D4AF37]/30 p-8 md:p-12 text-center">
              <Award className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Připraveni <span className="text-gold-gradient">začít vydělávat</span>?
              </h2>
              <p className="text-gray-300 mb-8">
                Zaregistrujte se zdarma a získejte přístup k affiliate programu během 24 hodin
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Váš email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#1A1A1F] border-[#2A2A2F] focus:border-[#D4AF37] text-white text-lg py-6"
                />
                <Button 
                  type="submit"
                  className="btn-gold w-full text-lg py-6"
                >
                  Registrovat se zdarma
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>

              <p className="text-xs text-gray-500 mt-4">
                Registrací souhlasíte s našimi obchodními podmínkami
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A2F] py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 iBots. Všechna práva vyhrazena.
          </p>
          <div className="mt-4">
            <Link href="/">
              <a className="text-[#D4AF37] hover:text-[#F5D77A] transition-colors">
                ← Zpět na hlavní stránku
              </a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
