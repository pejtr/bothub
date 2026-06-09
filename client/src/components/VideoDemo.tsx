/**
 * Video Demo Component
 * Animated chat simulation showing how users interact with iBots
 * Uses typing animation to simulate real-time conversation
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Brain, User, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
  typing?: boolean;
}

const demoConversations = [
  {
    botName: "Alex Hormozi iBot",
    botAvatar: "🦈",
    botTag: "Sales & Business",
    messages: [
      { role: "user" as const, text: "Mám e-shop s obratem 500K měsíčně. Jak zvýšit konverze?" },
      { role: "bot" as const, text: "Skvělý základ! Pojďme na to systematicky. Prvně — jaký máš průměrný AOV (average order value) a kolik % návštěvníků přidá do košíku?" },
      { role: "user" as const, text: "AOV je 890 Kč, do košíku přidá asi 8% lidí." },
      { role: "bot" as const, text: "8% add-to-cart je solidní. Tvůj problém bude v checkout flow. Tady je můj Grand Slam framework pro tebe:\n\n1️⃣ **Dream Outcome**: Přidej \"Ušetříte X Kč\" badge ke každému produktu\n2️⃣ **Perceived Likelihood**: Přidej 3 recenze nad fold na product page\n3️⃣ **Time Delay**: Nabídni express doručení za příplatek\n4️⃣ **Effort & Sacrifice**: Zjednodušit checkout na 2 kroky max\n\nTímhle bys měl zvýšit konverze o 25-40% během 30 dní. Chceš rozebrat konkrétní krok?" },
    ]
  },
  {
    botName: "Warren Buffett iBot",
    botAvatar: "📈",
    botTag: "Wealth & Finance",
    messages: [
      { role: "user" as const, text: "Mám 500 000 Kč na investice. Kam je nejlépe vložit?" },
      { role: "bot" as const, text: "Nejprve mi řekněte — máte vytvořenou finanční rezervu na 6 měsíců výdajů? A jaký je váš investiční horizont?" },
      { role: "user" as const, text: "Ano, rezervu mám. Horizont 10+ let, nechci se o to starat denně." },
      { role: "bot" as const, text: "Výborně! S 10letým horizontem a pasivním přístupem bych doporučil mou oblíbenou strategii:\n\n📊 **70%** — Nízkonákladový S&P 500 ETF (např. Vanguard VOO)\n📊 **20%** — Globální ETF mimo USA (diverzifikace)\n📊 **10%** — Dluhopisový ETF (stabilita)\n\nKlíčové pravidlo: \"Nikdy neinvestujte do něčeho, čemu nerozumíte.\" ETF fondy jsou jednoduché, levné a historicky poráží 90% aktivních manažerů.\n\nPravidelně přikupujte — nezáleží na ceně. Čas na trhu > timing trhu." },
    ]
  },
  {
    botName: "Carl Jung iBot",
    botAvatar: "🧠",
    botTag: "Therapy & Mindset",
    messages: [
      { role: "user" as const, text: "Cítím se vyčerpaný a nevím, jestli dělám správnou věc ve svém životě." },
      { role: "bot" as const, text: "To, co popisujete, může být důležitý signál z vašeho nevědomí. Řekněte mi — kdy jste naposledy cítil opravdové nadšení z toho, co děláte?" },
      { role: "user" as const, text: "Asi před 2 lety, když jsem začínal s vlastním projektem. Teď je to jen rutina." },
      { role: "bot" as const, text: "Velmi zajímavé. To, co prožíváte, bych nazval **setkáním se Stínem** — částí vás, kterou jste potlačil.\n\n🔮 Před 2 lety jste žil v souladu se svým **Selbst** — autentickým já. Rutina je signál, že vaše **Persona** (společenská maska) převzala kontrolu.\n\nDoporučuji:\n1. **Aktivní imaginace**: Každý večer 10 min tiše sedět a ptát se: \"Co opravdu chci?\"\n2. **Analýza snů**: Zapisujte si sny — nevědomí vám posílá zprávy\n3. **Stínová práce**: Co vás na druhých nejvíce irituje? To je váš potlačený potenciál.\n\nVyčerpání není problém — je to pozvánka k transformaci." },
    ]
  }
];

export default function VideoDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentConvo, setCurrentConvo] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const convo = demoConversations[currentConvo];

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleMessages, displayedText]);

  // Typing animation
  useEffect(() => {
    if (!isPlaying) return;
    if (currentMsgIndex >= convo.messages.length) {
      // Conversation finished, move to next after delay
      const timer = setTimeout(() => {
        setCurrentConvo((prev) => (prev + 1) % demoConversations.length);
        setVisibleMessages([]);
        setCurrentMsgIndex(0);
        setDisplayedText("");
      }, 4000);
      return () => clearTimeout(timer);
    }

    const msg = convo.messages[currentMsgIndex];

    if (msg.role === "user") {
      // Show user message instantly after short delay
      const timer = setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg]);
        setCurrentMsgIndex(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Bot message - typing animation
    if (!isTyping) {
      setIsTyping(true);
      setDisplayedText("");
    }

    if (displayedText.length < msg.text.length) {
      const speed = msg.text[displayedText.length] === '\n' ? 100 : 
                    msg.text[displayedText.length] === ' ' ? 20 : 15;
      const timer = setTimeout(() => {
        setDisplayedText(msg.text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      // Message complete
      const timer = setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg]);
        setDisplayedText("");
        setIsTyping(false);
        setCurrentMsgIndex(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentMsgIndex, displayedText, isTyping, convo, currentConvo]);

  const handlePlay = () => {
    if (!isPlaying) {
      setVisibleMessages([]);
      setCurrentMsgIndex(0);
      setDisplayedText("");
      setIsTyping(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setVisibleMessages([]);
    setCurrentMsgIndex(0);
    setDisplayedText("");
    setIsTyping(false);
  };

  const handleCTA = () => {
    toast.success("Registrace zahájena!", {
      description: "Vyzkoušejte si chat s iBoty zdarma.",
    });
  };

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#0D0A14] to-[#0A0A0F]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-2 mb-6">
            <Play className="w-4 h-4 mr-1" />
            Živá ukázka
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Podívejte se, jak <span className="text-gold-gradient">iBoti fungují</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Reálná konverzace s AI osobnostmi. Každý iBot má unikátní znalosti a styl komunikace.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto items-start">
          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <Card className="bg-[#12121A] border-[#2A2A2F] overflow-hidden">
              {/* Chat Header */}
              <div className="bg-[#1A1A1F] border-b border-[#2A2A2F] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center text-xl">
                    {convo.botAvatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{convo.botName}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-xs text-gray-400">{convo.botTag}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="w-8 h-8 rounded-lg bg-[#2A2A2F] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlePlay}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isPlaying 
                        ? "bg-[#D4AF37] text-[#0A0A0F]" 
                        : "bg-[#2A2A2F] text-gray-400 hover:text-white"
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div ref={chatRef} className="h-[400px] overflow-y-auto p-4 space-y-4 scroll-smooth">
                {!isPlaying && visibleMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-4">
                      <Play className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <p className="text-gray-400 mb-2">Klikněte na ▶ pro spuštění demo</p>
                    <p className="text-xs text-gray-500">Ukázka reálné konverzace s {convo.botName}</p>
                  </div>
                )}

                <AnimatePresence>
                  {visibleMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.role === "user" 
                          ? "bg-blue-500/20" 
                          : "bg-[#D4AF37]/20"
                      }`}>
                        {msg.role === "user" 
                          ? <User className="w-4 h-4 text-blue-400" />
                          : <span className="text-sm">{convo.botAvatar}</span>
                        }
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-500/20 text-blue-100 rounded-tr-sm"
                          : "bg-[#1A1A1F] text-gray-200 border border-[#2A2A2F] rounded-tl-sm"
                      }`}>
                        {msg.text.split('\n').map((line, j) => (
                          <span key={j}>
                            {line}
                            {j < msg.text.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Currently typing bot message */}
                {isTyping && displayedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                      <span className="text-sm">{convo.botAvatar}</span>
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed bg-[#1A1A1F] text-gray-200 border border-[#2A2A2F]">
                      {displayedText.split('\n').map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < displayedText.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                      <span className="inline-block w-0.5 h-4 bg-[#D4AF37] ml-0.5 animate-pulse" />
                    </div>
                  </motion.div>
                )}

                {/* Typing indicator */}
                {isPlaying && !isTyping && currentMsgIndex < convo.messages.length && convo.messages[currentMsgIndex].role === "bot" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                      <span className="text-sm">{convo.botAvatar}</span>
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-[#1A1A1F] border border-[#2A2A2F]">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input (decorative) */}
              <div className="border-t border-[#2A2A2F] p-4">
                <div className="flex gap-3">
                  <div className="flex-1 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-4 py-3 text-sm text-gray-500">
                    Napište zprávu...
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#0A0A0F]">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right Side - Conversation Selector + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3">Vyberte ukázku:</h3>
            
            {demoConversations.map((demo, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentConvo(index);
                  setVisibleMessages([]);
                  setCurrentMsgIndex(0);
                  setDisplayedText("");
                  setIsTyping(false);
                  setIsPlaying(true);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  currentConvo === index
                    ? "bg-[#D4AF37]/10 border-[#D4AF37]/50"
                    : "bg-[#1A1A1F]/50 border-[#2A2A2F] hover:border-[#D4AF37]/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{demo.botAvatar}</span>
                  <div>
                    <div className="font-medium text-white text-sm">{demo.botName}</div>
                    <div className="text-xs text-gray-400">{demo.botTag}</div>
                  </div>
                  {currentConvo === index && isPlaying && (
                    <div className="ml-auto flex gap-0.5">
                      <div className="w-1 h-3 bg-[#D4AF37] rounded-full animate-pulse" />
                      <div className="w-1 h-4 bg-[#D4AF37] rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                      <div className="w-1 h-2 bg-[#D4AF37] rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                    </div>
                  )}
                </div>
              </button>
            ))}

            <div className="pt-4 border-t border-[#2A2A2F] mt-6">
              <Card className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border-[#D4AF37]/30 p-6 text-center">
                <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Vyzkoušejte sami</h4>
                <p className="text-sm text-gray-400 mb-4">
                  3 iBoti zdarma, bez kreditní karty
                </p>
                <Button className="btn-gold w-full" onClick={handleCTA}>
                  Začít zdarma
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
