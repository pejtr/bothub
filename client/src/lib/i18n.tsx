import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type Locale = "cs" | "en";

// Translation dictionary type
type TranslationDict = Record<string, string>;

const translations: Record<Locale, TranslationDict> = {
  cs: {
    // Nav
    "nav.catalog": "Katalog iBotů",
    "nav.pricing": "Ceník",
    "nav.affiliate": "Affiliate",
    "nav.platforms": "Platformy",
    "nav.blog": "Blog",

    // Hero
    "hero.badge": "88 AI osobností ve 7 kategoriích",
    "hero.title1": "AI chatboti, kteří",
    "hero.title2": "PRODÁVAJÍ",
    "hero.title3": "za vás",
    "hero.subtitle": "Zvyšte své prodeje o <gold>+42 %</gold> a získejte <gold>327% ROI</gold> díky unikátním AI osobnostem. Platforma nové generace pro automatizaci prodeje, zákaznické podpory a osobního rozvoje.",
    "hero.cta.catalog": "Prohlédnout katalog",
    "hero.trust1": "Žádná kreditní karta",
    "hero.trust2": "Nasazení do 5 minut",
    "hero.trust3": "500+ firem",

    // Problem/Solution
    "ps.label": "Proč iBoti?",
    "ps.title1": "Tradiční chatboti ",
    "ps.title2": "selhávají.",
    "ps.title3": " iBoti prodávají.",
    "ps.header.feature": "Funkce",
    "ps.header.traditional": "Tradiční chatbot",
    "ps.header.ibot": "iBot od BOTHUB",
    "ps.row1.feature": "Odpovědi",
    "ps.row1.traditional": "Generické, robotické",
    "ps.row1.ibot": "Personalizované, s osobností",
    "ps.row2.feature": "Konverze",
    "ps.row2.traditional": "2–5 %",
    "ps.row2.ibot": "+42 % oproti průměru",
    "ps.row3.feature": "Nasazení",
    "ps.row3.traditional": "Týdny implementace",
    "ps.row3.ibot": "5 minut, plug & play",
    "ps.row4.feature": "Osobnost",
    "ps.row4.traditional": "Žádná — jeden pro všechny",
    "ps.row4.ibot": "88 unikátních osobností",
    "ps.row5.feature": "ROI",
    "ps.row5.traditional": "Těžko měřitelný",
    "ps.row5.ibot": "+327 % průměrná návratnost",

    // Catalog
    "catalog.label": "Katalog iBotů",
    "catalog.title1": "88 AI osobností. ",
    "catalog.title2": "7 kategorií.",
    "catalog.subtitle": "Každý iBot má unikátní osobnost, styl komunikace a specializaci. Vyberte si toho pravého pro váš byznys.",
    "catalog.featured": "Doporučený",
    "catalog.locked": "Odemknout",
    "catalog.unlock.title": "Odemkněte všech 88 iBotů",
    "catalog.unlock.subtitle": "Zadejte svůj e-mail a získejte přístup ke kompletnímu katalogu AI osobností.",
    "catalog.unlock.cta": "Odemknout katalog",

    // Categories
    "cat.sales": "Prodej & Marketing",
    "cat.support": "Zákaznická podpora",
    "cat.personal": "Osobní rozvoj",
    "cat.business": "Business & Finance",
    "cat.education": "Vzdělávání",
    "cat.creative": "Kreativita",
    "cat.health": "Zdraví & Wellness",

    // Value Proposition
    "value.label": "Proč to funguje",
    "value.title1": "Hormozi ",
    "value.title2": "Value Equation",
    "value.maximize": "Maximalizujte",
    "value.dreamOutcome": "Vysněný výsledek",
    "value.dreamOutcomeDesc": "AI chatbot, který skutečně prodává a buduje vztahy se zákazníky",
    "value.perceivedLikelihood": "Pravděpodobnost úspěchu",
    "value.perceivedLikelihoodDesc": "Ověřeno 500+ firmami, +42% konverze, 89% spokojenost",
    "value.minimize": "Minimalizujte",
    "value.timeDelay": "Čas do výsledku",
    "value.timeDelayDesc": "5 minut nasazení, okamžité výsledky od prvního dne",
    "value.effortSacrifice": "Úsilí & oběti",
    "value.effortSacrificeDesc": "Zero-code setup, žádná údržba, vše běží automaticky",
    "value.metric.roi": "ROI",
    "value.metric.conversion": "Konverze",
    "value.metric.satisfaction": "Spokojenost",
    "value.metric.deploy": "Nasazení",
    "value.metric.deploy.value": "5 min",

    // Pricing
    "pricing.label": "Cenové plány",
    "pricing.title1": "Tři jednoduché plány. ",
    "pricing.title2": "Začněte zdarma.",
    "pricing.subtitle": "Bez skrytých poplatků. Bez závazků. Upgradujte kdykoliv.",
    "pricing.free.name": "FREE",
    "pricing.free.price": "0 Kč",
    "pricing.free.period": "navždy",
    "pricing.free.desc": "Ideální pro vyzkoušení",
    "pricing.free.f1": "3 iBoti zdarma",
    "pricing.free.f2": "Web widget",
    "pricing.free.f3": "100 konverzací/měsíc",
    "pricing.free.f4": "Základní analytika",
    "pricing.free.cta": "Začít zdarma",
    "pricing.gold.name": "GOLD",
    "pricing.gold.price": "990 Kč",
    "pricing.gold.period": "/měsíc",
    "pricing.gold.desc": "Pro rostoucí firmy",
    "pricing.gold.badge": "Nejoblíbenější",
    "pricing.gold.f1": "30 iBotů",
    "pricing.gold.f2": "Web + Telegram + Discord",
    "pricing.gold.f3": "Neomezené konverzace",
    "pricing.gold.f4": "Pokročilá analytika",
    "pricing.gold.f5": "Prioritní podpora",
    "pricing.gold.f6": "Affiliate 66% provize",
    "pricing.gold.cta": "Získat GOLD",
    "pricing.diamond.name": "DIAMOND",
    "pricing.diamond.price": "2 490 Kč",
    "pricing.diamond.period": "/měsíc",
    "pricing.diamond.desc": "Pro maximální výsledky",
    "pricing.diamond.f1": "Všech 88 iBotů",
    "pricing.diamond.f2": "Všechny platformy + API",
    "pricing.diamond.f3": "Neomezené konverzace",
    "pricing.diamond.f4": "White-label řešení",
    "pricing.diamond.f5": "Dedikovaný account manager",
    "pricing.diamond.f6": "Affiliate 88% provize",
    "pricing.diamond.f7": "Custom iBoti na míru",
    "pricing.diamond.cta": "Získat DIAMOND",

    // Affiliate
    "affiliate.label": "Affiliate program",
    "affiliate.title1": "Vydělávejte ",
    "affiliate.title2": "až 88 %",
    "affiliate.title3": " z každého prodeje",
    "affiliate.subtitle": "Připojte se k našemu affiliate programu a získejte rekurentní provize z každého zákazníka, kterého přivedete.",
    "affiliate.benefit1.title": "Až 88 % provize",
    "affiliate.benefit1.desc": "Nejvyšší provize v oboru. GOLD: 66%, DIAMOND: 88% z každé platby.",
    "affiliate.benefit2.title": "Rekurentní příjem",
    "affiliate.benefit2.desc": "Provize z každé měsíční platby, dokud zákazník platí.",
    "affiliate.benefit3.title": "Marketing materiály",
    "affiliate.benefit3.desc": "Bannery, landing pages, e-mailové šablony — vše připraveno.",
    "affiliate.benefit4.title": "Real-time dashboard",
    "affiliate.benefit4.desc": "Sledujte kliky, konverze a výdělky v reálném čase.",
    "affiliate.cta": "Stát se partnerem",
    "affiliate.visual.title": "Váš potenciální výdělek",
    "affiliate.visual.gold": "GOLD partner",
    "affiliate.visual.gold.amount": "6 534 Kč/měs",
    "affiliate.visual.diamond": "DIAMOND partner",
    "affiliate.visual.diamond.amount": "19 173 Kč/měs",
    "affiliate.visual.note": "* Příklad: 10 zákazníků na GOLD nebo DIAMOND plánu",

    // Platforms
    "platforms.label": "Multi-platform",
    "platforms.title1": "Jeden iBot. ",
    "platforms.title2": "Všude.",
    "platforms.subtitle": "Nasaďte iBoty na všechny platformy, kde jsou vaši zákazníci. Jedna konfigurace, konzistentní zážitek.",
    "platforms.web.title": "Web Widget",
    "platforms.web.desc": "Jeden řádek kódu a iBot je na vašem webu. Plně přizpůsobitelný design.",
    "platforms.telegram.title": "Telegram Bot",
    "platforms.telegram.desc": "Přímá integrace s Telegram. Automatické odpovědi 24/7.",
    "platforms.discord.title": "Discord Bot",
    "platforms.discord.desc": "Komunitní podpora a engagement na vašem Discord serveru.",
    "platforms.api.title": "REST API",
    "platforms.api.desc": "Plný přístup přes API. Integrujte iBoty kamkoliv.",

    // Final CTA
    "final.title1": "Jste připraveni ",
    "final.title2": "změnit pravidla hry?",
    "final.subtitle": "Přestaňte ztrácet zákazníky a peníze. Nasaďte iBoty a sledujte, jak vaše tržby rostou. Bez práce.",
    "final.cta": "Začněte prodávat s AI — ZDARMA",
    "final.note": "Žádná kreditní karta. Žádné závazky. Okamžitý přístup.",

    // Footer
    "footer.desc": "AI chatboti, kteří prodávají za vás. 88 unikátních osobností ve 7 kategoriích.",
    "footer.product": "Produkt",
    "footer.partners": "Partneři",
    "footer.contact": "Kontakt",
    "footer.affiliate": "Affiliate program",
    "footer.api": "API Dokumentace",
    "footer.terms": "Obchodní podmínky",
    "footer.privacy": "Ochrana osobních údajů",
    "footer.copyright": "© 2026 BOTHUB.cz — Všechna práva vyhrazena.",
    "footer.powered": "Powered by AI. Built with Hormozi principles.",

    // Countdown
    "countdown.label": "Limitovaná nabídka",
    "countdown.spots": "Pouze {remaining} míst",
    "countdown.title": "Prvních 100 registrací získá",
    "countdown.offer": "GOLD plán na 30 dní ZDARMA",
    "countdown.cta": "Získat GOLD zdarma",
    "countdown.taken": "Obsazeno: {taken}/100",
    "countdown.free": "{remaining} volných",
    "countdown.days": "dní",
    "countdown.hours": "hod",
    "countdown.minutes": "min",
    "countdown.seconds": "sek",

    // Video
    "video.label": "Podívejte se sami",
    "video.title1": "iBoti ",
    "video.title2": "v akci",
    "video.subtitle": "Reálné ukázky, jak AI chatboti prodávají, podporují zákazníky a generují příjmy — automaticky a bez přestávky.",
    "video.note": "Videa jsou simulace reálných konverzací s iBoty. Skutečné výsledky se mohou lišit.",
    "video.coming": "Video demo bude brzy k dispozici",
  },

  en: {
    // Nav
    "nav.catalog": "iBot Catalog",
    "nav.pricing": "Pricing",
    "nav.affiliate": "Affiliate",
    "nav.platforms": "Platforms",
    "nav.blog": "Blog",

    // Hero
    "hero.badge": "88 AI Personalities in 7 Categories",
    "hero.title1": "AI chatbots that",
    "hero.title2": "SELL",
    "hero.title3": "for you",
    "hero.subtitle": "Boost your sales by <gold>+42%</gold> and achieve <gold>327% ROI</gold> with unique AI personalities. Next-gen platform for automating sales, customer support, and personal development.",
    "hero.cta.catalog": "Browse catalog",
    "hero.trust1": "No credit card",
    "hero.trust2": "Deploy in 5 minutes",
    "hero.trust3": "500+ companies",

    // Problem/Solution
    "ps.label": "Why iBots?",
    "ps.title1": "Traditional chatbots ",
    "ps.title2": "fail.",
    "ps.title3": " iBots sell.",
    "ps.header.feature": "Feature",
    "ps.header.traditional": "Traditional Chatbot",
    "ps.header.ibot": "iBot by BOTHUB",
    "ps.row1.feature": "Responses",
    "ps.row1.traditional": "Generic, robotic",
    "ps.row1.ibot": "Personalized, with personality",
    "ps.row2.feature": "Conversion",
    "ps.row2.traditional": "2–5%",
    "ps.row2.ibot": "+42% above average",
    "ps.row3.feature": "Deployment",
    "ps.row3.traditional": "Weeks of implementation",
    "ps.row3.ibot": "5 minutes, plug & play",
    "ps.row4.feature": "Personality",
    "ps.row4.traditional": "None — one size fits all",
    "ps.row4.ibot": "88 unique personalities",
    "ps.row5.feature": "ROI",
    "ps.row5.traditional": "Hard to measure",
    "ps.row5.ibot": "+327% average return",

    // Catalog
    "catalog.label": "iBot Catalog",
    "catalog.title1": "88 AI Personalities. ",
    "catalog.title2": "7 Categories.",
    "catalog.subtitle": "Each iBot has a unique personality, communication style, and specialization. Choose the right one for your business.",
    "catalog.featured": "Featured",
    "catalog.locked": "Unlock",
    "catalog.unlock.title": "Unlock all 88 iBots",
    "catalog.unlock.subtitle": "Enter your email to access the complete catalog of AI personalities.",
    "catalog.unlock.cta": "Unlock catalog",

    // Categories
    "cat.sales": "Sales & Marketing",
    "cat.support": "Customer Support",
    "cat.personal": "Personal Development",
    "cat.business": "Business & Finance",
    "cat.education": "Education",
    "cat.creative": "Creativity",
    "cat.health": "Health & Wellness",

    // Value Proposition
    "value.label": "Why It Works",
    "value.title1": "Hormozi ",
    "value.title2": "Value Equation",
    "value.maximize": "Maximize",
    "value.dreamOutcome": "Dream Outcome",
    "value.dreamOutcomeDesc": "An AI chatbot that actually sells and builds customer relationships",
    "value.perceivedLikelihood": "Perceived Likelihood",
    "value.perceivedLikelihoodDesc": "Verified by 500+ companies, +42% conversion, 89% satisfaction",
    "value.minimize": "Minimize",
    "value.timeDelay": "Time Delay",
    "value.timeDelayDesc": "5-minute deployment, instant results from day one",
    "value.effortSacrifice": "Effort & Sacrifice",
    "value.effortSacrificeDesc": "Zero-code setup, no maintenance, everything runs automatically",
    "value.metric.roi": "ROI",
    "value.metric.conversion": "Conversion",
    "value.metric.satisfaction": "Satisfaction",
    "value.metric.deploy": "Deploy",
    "value.metric.deploy.value": "5 min",

    // Pricing
    "pricing.label": "Pricing Plans",
    "pricing.title1": "Three simple plans. ",
    "pricing.title2": "Start for free.",
    "pricing.subtitle": "No hidden fees. No commitments. Upgrade anytime.",
    "pricing.free.name": "FREE",
    "pricing.free.price": "$0",
    "pricing.free.period": "forever",
    "pricing.free.desc": "Perfect for trying out",
    "pricing.free.f1": "3 iBots free",
    "pricing.free.f2": "Web widget",
    "pricing.free.f3": "100 conversations/month",
    "pricing.free.f4": "Basic analytics",
    "pricing.free.cta": "Start free",
    "pricing.gold.name": "GOLD",
    "pricing.gold.price": "$39",
    "pricing.gold.period": "/month",
    "pricing.gold.desc": "For growing businesses",
    "pricing.gold.badge": "Most Popular",
    "pricing.gold.f1": "30 iBots",
    "pricing.gold.f2": "Web + Telegram + Discord",
    "pricing.gold.f3": "Unlimited conversations",
    "pricing.gold.f4": "Advanced analytics",
    "pricing.gold.f5": "Priority support",
    "pricing.gold.f6": "Affiliate 66% commission",
    "pricing.gold.cta": "Get GOLD",
    "pricing.diamond.name": "DIAMOND",
    "pricing.diamond.price": "$99",
    "pricing.diamond.period": "/month",
    "pricing.diamond.desc": "For maximum results",
    "pricing.diamond.f1": "All 88 iBots",
    "pricing.diamond.f2": "All platforms + API",
    "pricing.diamond.f3": "Unlimited conversations",
    "pricing.diamond.f4": "White-label solution",
    "pricing.diamond.f5": "Dedicated account manager",
    "pricing.diamond.f6": "Affiliate 88% commission",
    "pricing.diamond.f7": "Custom iBots on demand",
    "pricing.diamond.cta": "Get DIAMOND",

    // Affiliate
    "affiliate.label": "Affiliate Program",
    "affiliate.title1": "Earn ",
    "affiliate.title2": "up to 88%",
    "affiliate.title3": " on every sale",
    "affiliate.subtitle": "Join our affiliate program and earn recurring commissions from every customer you bring.",
    "affiliate.benefit1.title": "Up to 88% commission",
    "affiliate.benefit1.desc": "Highest commissions in the industry. GOLD: 66%, DIAMOND: 88% of every payment.",
    "affiliate.benefit2.title": "Recurring income",
    "affiliate.benefit2.desc": "Commission from every monthly payment, as long as the customer pays.",
    "affiliate.benefit3.title": "Marketing materials",
    "affiliate.benefit3.desc": "Banners, landing pages, email templates — everything ready.",
    "affiliate.benefit4.title": "Real-time dashboard",
    "affiliate.benefit4.desc": "Track clicks, conversions, and earnings in real-time.",
    "affiliate.cta": "Become a partner",
    "affiliate.visual.title": "Your potential earnings",
    "affiliate.visual.gold": "GOLD partner",
    "affiliate.visual.gold.amount": "$257/mo",
    "affiliate.visual.diamond": "DIAMOND partner",
    "affiliate.visual.diamond.amount": "$762/mo",
    "affiliate.visual.note": "* Example: 10 customers on GOLD or DIAMOND plan",

    // Platforms
    "platforms.label": "Multi-platform",
    "platforms.title1": "One iBot. ",
    "platforms.title2": "Everywhere.",
    "platforms.subtitle": "Deploy iBots on all platforms where your customers are. One configuration, consistent experience.",
    "platforms.web.title": "Web Widget",
    "platforms.web.desc": "One line of code and iBot is on your website. Fully customizable design.",
    "platforms.telegram.title": "Telegram Bot",
    "platforms.telegram.desc": "Direct Telegram integration. Automatic 24/7 responses.",
    "platforms.discord.title": "Discord Bot",
    "platforms.discord.desc": "Community support and engagement on your Discord server.",
    "platforms.api.title": "REST API",
    "platforms.api.desc": "Full API access. Integrate iBots anywhere.",

    // Final CTA
    "final.title1": "Ready to ",
    "final.title2": "change the game?",
    "final.subtitle": "Stop losing customers and money. Deploy iBots and watch your revenue grow. Effortlessly.",
    "final.cta": "Start selling with AI — FREE",
    "final.note": "No credit card. No commitments. Instant access.",

    // Footer
    "footer.desc": "AI chatbots that sell for you. 88 unique personalities in 7 categories.",
    "footer.product": "Product",
    "footer.partners": "Partners",
    "footer.contact": "Contact",
    "footer.affiliate": "Affiliate program",
    "footer.api": "API Documentation",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.copyright": "© 2026 BOTHUB.cz — All rights reserved.",
    "footer.powered": "Powered by AI. Built with Hormozi principles.",

    // Countdown
    "countdown.label": "Limited Offer",
    "countdown.spots": "Only {remaining} spots left",
    "countdown.title": "First 100 registrations get",
    "countdown.offer": "GOLD plan for 30 days FREE",
    "countdown.cta": "Get GOLD free",
    "countdown.taken": "Taken: {taken}/100",
    "countdown.free": "{remaining} available",
    "countdown.days": "days",
    "countdown.hours": "hrs",
    "countdown.minutes": "min",
    "countdown.seconds": "sec",

    // Video
    "video.label": "See for Yourself",
    "video.title1": "iBots ",
    "video.title2": "in Action",
    "video.subtitle": "Real demos of how AI chatbots sell, support customers, and generate revenue — automatically and non-stop.",
    "video.note": "Videos are simulations of real conversations with iBots. Actual results may vary.",
    "video.coming": "Video demo coming soon",
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "cs",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("bothub_locale");
    if (saved === "en" || saved === "cs") return saved;
    // Auto-detect from browser
    const browserLang = navigator.language.slice(0, 2);
    return browserLang === "cs" || browserLang === "sk" ? "cs" : "cs"; // default to Czech
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("bothub_locale", newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let text = translations[locale][key] ?? translations.cs[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "cs" ? "en" : "cs")}
      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-400 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
      title={locale === "cs" ? "Switch to English" : "Přepnout do češtiny"}
    >
      <span className="text-base">{locale === "cs" ? "🇬🇧" : "🇨🇿"}</span>
      <span className="hidden sm:inline text-xs font-medium uppercase">
        {locale === "cs" ? "EN" : "CZ"}
      </span>
    </button>
  );
}
