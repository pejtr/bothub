import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  questionCs: string;
  questionEn: string;
  answerCs: string;
  answerEn: string;
}

export const faqItems: FAQItem[] = [
  {
    questionCs: "Co je iBot a jak se liší od běžného chatbota?",
    questionEn: "What is an iBot and how is it different from a regular chatbot?",
    answerCs: "iBot je AI chatbot s unikátní osobností — napodobuje styl komunikace konkrétní osobnosti (např. Alex Hormozi, Tony Robbins). Na rozdíl od generických chatbotů, iBoti používají personalizované prodejní techniky, empatickou komunikaci a ověřené frameworky, které zvyšují konverze o průměrně 42 %.",
    answerEn: "An iBot is an AI chatbot with a unique personality — it mimics the communication style of a specific personality (e.g., Alex Hormozi, Tony Robbins). Unlike generic chatbots, iBots use personalized sales techniques, empathic communication, and proven frameworks that increase conversions by an average of 42%.",
  },
  {
    questionCs: "Jak rychle mohu iBota nasadit na svůj web?",
    questionEn: "How quickly can I deploy an iBot on my website?",
    answerCs: "Nasazení trvá méně než 5 minut. Stačí si vybrat iBota z katalogu, zkopírovat widget kód a vložit ho na svůj web. iBot funguje okamžitě — žádná konfigurace, žádné programování. Podporujeme web widget, Telegram, Discord i přímé API napojení.",
    answerEn: "Deployment takes less than 5 minutes. Simply choose an iBot from the catalog, copy the widget code, and paste it on your website. The iBot works immediately — no configuration, no programming. We support web widgets, Telegram, Discord, and direct API integration.",
  },
  {
    questionCs: "Kolik stojí používání iBotů?",
    questionEn: "How much does it cost to use iBots?",
    answerCs: "Nabízíme 3 plány: FREE (0 Kč) — 1 iBot, 100 zpráv/měsíc, ideální na vyzkoušení. GOLD (990 Kč/měs) — až 10 iBotů, 5 000 zpráv, prioritní podpora. DIAMOND (2 490 Kč/měs) — neomezení iBoti, neomezené zprávy, vlastní API, dedikovaný manažer. Prvních 100 registrací získá GOLD na 30 dní zdarma!",
    answerEn: "We offer 3 plans: FREE ($0) — 1 iBot, 100 messages/month, perfect for testing. GOLD ($39/mo) — up to 10 iBots, 5,000 messages, priority support. DIAMOND ($99/mo) — unlimited iBots, unlimited messages, custom API, dedicated manager. First 100 sign-ups get GOLD free for 30 days!",
  },
  {
    questionCs: "Jak funguje affiliate program?",
    questionEn: "How does the affiliate program work?",
    answerCs: "Náš affiliate program nabízí až 88 % opakovaných provizí z každé platby vašich doporučených zákazníků. Získáte unikátní referral kód, marketingové materiály a přístup k affiliate dashboardu se statistikami v reálném čase. Provize se vyplácejí měsíčně. GOLD plán = 66 % provize, DIAMOND = 88 %.",
    answerEn: "Our affiliate program offers up to 88% recurring commissions from every payment of your referred customers. You get a unique referral code, marketing materials, and access to an affiliate dashboard with real-time statistics. Commissions are paid monthly. GOLD plan = 66% commission, DIAMOND = 88%.",
  },
  {
    questionCs: "Mohu si iBota přizpůsobit vlastním potřebám?",
    questionEn: "Can I customize an iBot to my needs?",
    answerCs: "Ano! U plánů GOLD a DIAMOND můžete přizpůsobit tón komunikace, přidat vlastní znalostní bázi (FAQ, produkty, ceníky) a nastavit specifické prodejní skripty. U DIAMOND plánu navíc získáte přístup k API pro plnou integraci do vašich systémů.",
    answerEn: "Yes! With GOLD and DIAMOND plans, you can customize the communication tone, add your own knowledge base (FAQ, products, pricing), and set up specific sales scripts. With the DIAMOND plan, you also get API access for full integration into your systems.",
  },
  {
    questionCs: "Jaké platformy iBoti podporují?",
    questionEn: "What platforms do iBots support?",
    answerCs: "iBoti fungují na 4 platformách: Web widget (vložíte na jakýkoli web), Telegram (přímá integrace), Discord (bot pro servery) a REST API (api.bothub.cz) pro vlastní aplikace. Všechny platformy sdílejí stejnou AI osobnost a historii konverzací.",
    answerEn: "iBots work on 4 platforms: Web widget (embed on any website), Telegram (direct integration), Discord (server bot), and REST API (api.bothub.cz) for custom applications. All platforms share the same AI personality and conversation history.",
  },
  {
    questionCs: "Jsou moje data v bezpečí?",
    questionEn: "Is my data safe?",
    answerCs: "Absolutně. Všechna data jsou šifrována (AES-256), servery běží v EU (GDPR compliant), a konverzace se nepoužívají pro trénink AI modelů. U DIAMOND plánu nabízíme i dedikovanou instanci s vlastním šifrováním.",
    answerEn: "Absolutely. All data is encrypted (AES-256), servers run in the EU (GDPR compliant), and conversations are not used for AI model training. With the DIAMOND plan, we also offer a dedicated instance with custom encryption.",
  },
  {
    questionCs: "Jak měřím výkon iBota?",
    questionEn: "How do I measure iBot performance?",
    answerCs: "Každý iBot má vlastní analytický dashboard s metrikami: počet konverzací, konverzní poměr, průměrná délka konverzace, spokojenost zákazníků a ROI. U GOLD a DIAMOND plánů máte přístup k A/B testování různých iBotů a detailním reportům.",
    answerEn: "Each iBot has its own analytics dashboard with metrics: number of conversations, conversion rate, average conversation length, customer satisfaction, and ROI. With GOLD and DIAMOND plans, you have access to A/B testing of different iBots and detailed reports.",
  },
];

export function FAQ() {
  const { locale } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent" />
      <div className="container relative z-10">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            {locale === "cs" ? "Časté dotazy" : "FAQ"}
          </span>
          <h2 className="font-[Space_Grotesk] text-3xl md:text-5xl font-black mb-4">
            {locale === "cs" ? "Máte " : "Have "}
            <span className="text-gradient-gold">
              {locale === "cs" ? "otázky?" : "questions?"}
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {locale === "cs"
              ? "Odpovědi na nejčastější otázky o iBotách, cenách a nasazení."
              : "Answers to the most common questions about iBots, pricing, and deployment."}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-300 ${
                openIndex === index
                  ? "border-amber-500/30 bg-amber-500/[0.03]"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10"
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className={`font-medium pr-4 transition-colors ${
                  openIndex === index ? "text-amber-400" : "text-gray-200"
                }`}>
                  {locale === "cs" ? item.questionCs : item.questionEn}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown className={`w-5 h-5 transition-colors ${
                    openIndex === index ? "text-amber-400" : "text-gray-500"
                  }`} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-gray-400 leading-relaxed">
                      {locale === "cs" ? item.answerCs : item.answerEn}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
