/**
 * 5-Part Email Welcome Sequence with Lead Magnet
 * Hormozi-style value-first approach to convert FREE → GOLD subscribers
 * 
 * Sequence:
 * Day 0: Welcome + Lead Magnet delivery ("7 způsobů jak AI zvýší váš ROI")
 * Day 1: Quick Win - First iBot success story
 * Day 3: Deep Value - Case study with specific ROI numbers
 * Day 5: Social Proof - Testimonials + community
 * Day 7: Offer - GOLD plan with urgency + bonus
 */

export interface EmailTemplate {
  id: string;
  dayOffset: number; // days after signup
  subject: string;
  preheader: string;
  bodyHtml: string;
  bodyText: string;
  tags: string[];
}

export interface WelcomeSequenceConfig {
  sequenceId: string;
  name: string;
  description: string;
  totalEmails: number;
  emails: EmailTemplate[];
}

/**
 * Lead magnet content - "7 způsobů jak AI zvýší váš ROI"
 */
export const LEAD_MAGNET = {
  title: "7 způsobů jak AI chatboti zvýší váš ROI o 327%",
  slug: "7-zpusobu-ai-roi",
  description: "Praktický průvodce s konkrétními strategiemi pro využití AI chatbotů v podnikání",
  downloadUrl: "/api/lead-magnet/download",
  chapters: [
    "1. Automatizace zákaznické podpory — ušetřete 40+ hodin měsíčně",
    "2. Personalizované prodejní funnely — zvyšte konverze o 42%",
    "3. Investiční rozhodování s AI mentory — portfolio +27%",
    "4. Leadership coaching 24/7 — produktivita týmu +35%",
    "5. Wellness a mindset optimalizace — snižte burnout o 60%",
    "6. Kreativní brainstorming s AI — 3x více nápadů za polovinu času",
    "7. Affiliate marketing s AI — pasivní příjem bez limitu",
  ],
};

/**
 * Email #1 - Welcome + Lead Magnet (Day 0)
 */
const email1Welcome: EmailTemplate = {
  id: "welcome_lead_magnet",
  dayOffset: 0,
  subject: "🎁 Váš průvodce je připraven: 7 způsobů jak AI zvýší váš ROI",
  preheader: "Stáhněte si zdarma + získejte přístup ke 3 AI chatbotům",
  bodyHtml: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E5E5; padding: 40px 24px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #8B7355); padding: 12px 16px; border-radius: 12px;">
      <span style="font-size: 24px; font-weight: bold; color: #0A0A0F;">iBots</span>
    </div>
    <p style="color: #D4AF37; font-size: 12px; margin-top: 8px;">Součást ekosystému BotHub.cz</p>
  </div>
  
  <h1 style="color: #D4AF37; font-size: 28px; line-height: 1.3; margin-bottom: 16px;">
    Vítejte v iBots! 🚀
  </h1>
  
  <p style="font-size: 16px; line-height: 1.6; color: #B0B0B0;">
    Děkujeme za registraci. Právě jste udělali první krok k transformaci vašeho podnikání pomocí AI.
  </p>
  
  <div style="background: #1A1A1F; border: 1px solid #D4AF37; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <h2 style="color: #D4AF37; font-size: 20px; margin-bottom: 12px;">📥 Váš průvodce je připraven</h2>
    <p style="color: #B0B0B0; font-size: 14px; margin-bottom: 16px;">
      "7 způsobů jak AI chatboti zvýší váš ROI o 327%" — praktický průvodce s konkrétními strategiemi.
    </p>
    <a href="{{LEAD_MAGNET_URL}}" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0A0A0F; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
      Stáhnout průvodce zdarma →
    </a>
  </div>
  
  <div style="background: #1A1A1F; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <h3 style="color: white; font-size: 18px; margin-bottom: 12px;">Co vás čeká v průvodci:</h3>
    <ul style="color: #B0B0B0; font-size: 14px; line-height: 2;">
      <li>✅ Automatizace zákaznické podpory — ušetřete 40+ hodin měsíčně</li>
      <li>✅ Personalizované prodejní funnely — zvyšte konverze o 42%</li>
      <li>✅ Investiční rozhodování s AI mentory</li>
      <li>✅ Leadership coaching 24/7</li>
      <li>✅ A další 3 strategie...</li>
    </ul>
  </div>
  
  <p style="font-size: 16px; line-height: 1.6; color: #B0B0B0;">
    <strong style="color: white;">Váš FREE plán zahrnuje:</strong> 3 vybrané iBoty a 100 zpráv měsíčně. 
    Vyzkoušejte je hned — stačí kliknout na kteréhokoliv iBota v katalogu.
  </p>
  
  <a href="{{APP_URL}}/#katalog" style="display: inline-block; background: transparent; border: 2px solid #D4AF37; color: #D4AF37; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
    Prozkoumat katalog 77 iBotů →
  </a>
  
  <div style="border-top: 1px solid #2A2A2F; margin-top: 40px; padding-top: 20px; text-align: center;">
    <p style="color: #666; font-size: 12px;">
      iBots — Součást ekosystému <a href="https://bothub.cz" style="color: #D4AF37;">BotHub.cz</a><br>
      <a href="{{UNSUBSCRIBE_URL}}" style="color: #666;">Odhlásit se z emailů</a>
    </p>
  </div>
</div>`,
  bodyText: `Vítejte v iBots!

Děkujeme za registraci. Váš průvodce "7 způsobů jak AI chatboti zvýší váš ROI o 327%" je připraven ke stažení: {{LEAD_MAGNET_URL}}

Váš FREE plán zahrnuje 3 vybrané iBoty a 100 zpráv měsíčně.

Prozkoumat katalog: {{APP_URL}}/#katalog

---
iBots — Součást ekosystému BotHub.cz
Odhlásit se: {{UNSUBSCRIBE_URL}}`,
  tags: ["welcome", "lead_magnet", "day0"],
};

/**
 * Email #2 - Quick Win (Day 1)
 */
const email2QuickWin: EmailTemplate = {
  id: "quick_win_day1",
  dayOffset: 1,
  subject: "Martin zvýšil konverze o 42% za 30 dní — takhle na to šel",
  preheader: "Jeden iBot, jedna strategie, měřitelné výsledky",
  bodyHtml: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E5E5; padding: 40px 24px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #8B7355); padding: 12px 16px; border-radius: 12px;">
      <span style="font-size: 24px; font-weight: bold; color: #0A0A0F;">iBots</span>
    </div>
  </div>
  
  <h1 style="color: white; font-size: 24px; line-height: 1.3; margin-bottom: 16px;">
    Martin zvýšil konverze o <span style="color: #D4AF37;">42%</span> za 30 dní
  </h1>
  
  <p style="font-size: 16px; line-height: 1.6; color: #B0B0B0;">
    Martin Kovář, e-commerce podnikatel, měl problém s nízkou konverzí na svém e-shopu. 
    Pak zkusil jednu věc — zeptal se Alex Hormozi iBota na svou nabídkovou strukturu.
  </p>
  
  <div style="background: #1A1A1F; border-left: 4px solid #D4AF37; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
    <p style="color: #D4AF37; font-size: 14px; font-weight: bold; margin-bottom: 8px;">💬 Co Martin napsal iBotovi:</p>
    <p style="color: #E5E5E5; font-style: italic; font-size: 15px;">
      "Mám e-shop s 500 návštěvami denně, ale konverze je jen 1.2%. Co bys změnil na mé nabídce?"
    </p>
  </div>
  
  <div style="background: #1A1A1F; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <h3 style="color: #D4AF37; font-size: 18px; margin-bottom: 12px;">🎯 Výsledek po 30 dnech:</h3>
    <ul style="color: #B0B0B0; font-size: 15px; line-height: 2;">
      <li>Konverze: 1.2% → <strong style="color: #D4AF37;">1.7%</strong> (+42%)</li>
      <li>Průměrná objednávka: +23%</li>
      <li>Měsíční tržby: +€4,200</li>
    </ul>
  </div>
  
  <p style="font-size: 16px; line-height: 1.6; color: #B0B0B0;">
    <strong style="color: white;">Chcete stejný výsledek?</strong> Alex Hormozi iBot je dostupný v katalogu. 
    Stačí mu popsat váš byznys a on vám navrhne konkrétní kroky.
  </p>
  
  <a href="{{APP_URL}}/#katalog" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0A0A0F; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 16px;">
    Vyzkoušet Alex Hormozi iBota →
  </a>
  
  <p style="font-size: 14px; color: #666; margin-top: 24px;">
    P.S. Zítra vám pošlu case study s konkrétními čísly — jak jeden investor využil Warren Buffett iBota k růstu portfolia o 27%.
  </p>
  
  <div style="border-top: 1px solid #2A2A2F; margin-top: 40px; padding-top: 20px; text-align: center;">
    <p style="color: #666; font-size: 12px;">
      iBots — Součást ekosystému <a href="https://bothub.cz" style="color: #D4AF37;">BotHub.cz</a><br>
      <a href="{{UNSUBSCRIBE_URL}}" style="color: #666;">Odhlásit se</a>
    </p>
  </div>
</div>`,
  bodyText: `Martin zvýšil konverze o 42% za 30 dní

Martin Kovář měl problém s nízkou konverzí. Pak zkusil Alex Hormozi iBota.

Výsledek po 30 dnech:
- Konverze: 1.2% → 1.7% (+42%)
- Průměrná objednávka: +23%
- Měsíční tržby: +€4,200

Vyzkoušejte Alex Hormozi iBota: {{APP_URL}}/#katalog

---
iBots — Součást ekosystému BotHub.cz`,
  tags: ["quick_win", "case_study", "day1"],
};

/**
 * Email #3 - Deep Value Case Study (Day 3)
 */
const email3DeepValue: EmailTemplate = {
  id: "deep_value_day3",
  dayOffset: 3,
  subject: "ROI kalkulačka: Kolik peněz vám iBoti ušetří? (konkrétní čísla)",
  preheader: "3 reálné příběhy s měřitelnými výsledky",
  bodyHtml: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E5E5; padding: 40px 24px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #8B7355); padding: 12px 16px; border-radius: 12px;">
      <span style="font-size: 24px; font-weight: bold; color: #0A0A0F;">iBots</span>
    </div>
  </div>
  
  <h1 style="color: white; font-size: 24px; line-height: 1.3; margin-bottom: 16px;">
    Kolik peněz vám iBoti <span style="color: #D4AF37;">ušetří</span>?
  </h1>
  
  <p style="font-size: 16px; line-height: 1.6; color: #B0B0B0;">
    Připravili jsme 3 reálné case studies s konkrétními čísly. Podívejte se, který scénář je nejblíže vašemu podnikání.
  </p>
  
  <div style="background: #1A1A1F; border: 1px solid #2A2A2F; border-radius: 12px; padding: 24px; margin: 20px 0;">
    <div style="display: flex; align-items: center; margin-bottom: 12px;">
      <span style="background: #D4AF37; color: #0A0A0F; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">E-COMMERCE</span>
    </div>
    <h3 style="color: white; font-size: 18px;">ShopMax.cz — Konverze +42%</h3>
    <p style="color: #B0B0B0; font-size: 14px;">Investice: 990 Kč/měs (GOLD) → Návratnost: 126,000 Kč/měs</p>
    <p style="color: #D4AF37; font-weight: bold;">ROI: 12,727%</p>
  </div>
  
  <div style="background: #1A1A1F; border: 1px solid #2A2A2F; border-radius: 12px; padding: 24px; margin: 20px 0;">
    <div style="display: flex; align-items: center; margin-bottom: 12px;">
      <span style="background: #D4AF37; color: #0A0A0F; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">INVESTICE</span>
    </div>
    <h3 style="color: white; font-size: 18px;">Richter Capital — Portfolio +27%</h3>
    <p style="color: #B0B0B0; font-size: 14px;">Investice: 990 Kč/měs (GOLD) → Návratnost: 810,000 Kč/kvartál</p>
    <p style="color: #D4AF37; font-weight: bold;">ROI: 27,272%</p>
  </div>
  
  <div style="background: #1A1A1F; border: 1px solid #2A2A2F; border-radius: 12px; padding: 24px; margin: 20px 0;">
    <div style="display: flex; align-items: center; margin-bottom: 12px;">
      <span style="background: #D4AF37; color: #0A0A0F; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">COACHING</span>
    </div>
    <h3 style="color: white; font-size: 18px;">MindShift Academy — 2x více klientů</h3>
    <p style="color: #B0B0B0; font-size: 14px;">Investice: 990 Kč/měs (GOLD) → Návratnost: 45,000 Kč/měs</p>
    <p style="color: #D4AF37; font-weight: bold;">ROI: 4,545%</p>
  </div>
  
  <p style="font-size: 16px; line-height: 1.6; color: #B0B0B0; margin-top: 24px;">
    <strong style="color: white;">Průměrný ROI napříč všemi uživateli: +327%</strong><br>
    A to je konzervativní odhad — mnozí uživatelé reportují ještě vyšší čísla.
  </p>
  
  <a href="{{APP_URL}}/#cenik" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0A0A0F; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 16px;">
    Spočítat můj ROI →
  </a>
  
  <div style="border-top: 1px solid #2A2A2F; margin-top: 40px; padding-top: 20px; text-align: center;">
    <p style="color: #666; font-size: 12px;">
      iBots — Součást ekosystému <a href="https://bothub.cz" style="color: #D4AF37;">BotHub.cz</a><br>
      <a href="{{UNSUBSCRIBE_URL}}" style="color: #666;">Odhlásit se</a>
    </p>
  </div>
</div>`,
  bodyText: `Kolik peněz vám iBoti ušetří?

3 reálné case studies:

1. ShopMax.cz — Konverze +42%, ROI: 12,727%
2. Richter Capital — Portfolio +27%, ROI: 27,272%
3. MindShift Academy — 2x více klientů, ROI: 4,545%

Průměrný ROI: +327%

Spočítat můj ROI: {{APP_URL}}/#cenik

---
iBots — Součást ekosystému BotHub.cz`,
  tags: ["deep_value", "case_study", "roi", "day3"],
};

/**
 * Email #4 - Social Proof (Day 5)
 */
const email4SocialProof: EmailTemplate = {
  id: "social_proof_day5",
  dayOffset: 5,
  subject: "2,847 podnikatelů už používá iBoty — přidáte se?",
  preheader: "Co říkají naši uživatelé + exkluzivní komunita",
  bodyHtml: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E5E5; padding: 40px 24px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #8B7355); padding: 12px 16px; border-radius: 12px;">
      <span style="font-size: 24px; font-weight: bold; color: #0A0A0F;">iBots</span>
    </div>
  </div>
  
  <h1 style="color: white; font-size: 24px; line-height: 1.3; margin-bottom: 16px;">
    <span style="color: #D4AF37;">2,847</span> podnikatelů už používá iBoty
  </h1>
  
  <p style="font-size: 16px; line-height: 1.6; color: #B0B0B0;">
    Každý den se přidávají noví uživatelé. Tady je, co říkají ti, kteří už iBoty aktivně využívají:
  </p>
  
  <div style="background: #1A1A1F; border-radius: 12px; padding: 24px; margin: 20px 0;">
    <div style="margin-bottom: 16px;">
      <span style="color: #D4AF37;">⭐⭐⭐⭐⭐</span>
    </div>
    <p style="color: #E5E5E5; font-style: italic; font-size: 15px; margin-bottom: 12px;">
      "Díky Alex Hormozi iBotovi jsem přepracoval celou nabídkovou strukturu. Konverze vzrostly o 42% během prvního měsíce."
    </p>
    <p style="color: #D4AF37; font-size: 14px; font-weight: bold;">— Martin K., E-commerce podnikatel</p>
    <p style="color: #666; font-size: 13px;">Výsledek: +42% konverze</p>
  </div>
  
  <div style="background: #1A1A1F; border-radius: 12px; padding: 24px; margin: 20px 0;">
    <div style="margin-bottom: 16px;">
      <span style="color: #D4AF37;">⭐⭐⭐⭐⭐</span>
    </div>
    <p style="color: #E5E5E5; font-style: italic; font-size: 15px; margin-bottom: 12px;">
      "Warren Buffett a Charlie Munger iBoti mi poskytují cenné investiční perspektivy. Portfolio vzrostlo o 27%."
    </p>
    <p style="color: #D4AF37; font-size: 14px; font-weight: bold;">— Tomáš R., Investor</p>
    <p style="color: #666; font-size: 13px;">Výsledek: +27% portfolio</p>
  </div>
  
  <div style="background: #1A1A1F; border-radius: 12px; padding: 24px; margin: 20px 0;">
    <div style="margin-bottom: 16px;">
      <span style="color: #D4AF37;">⭐⭐⭐⭐⭐</span>
    </div>
    <p style="color: #E5E5E5; font-style: italic; font-size: 15px; margin-bottom: 12px;">
      "Russell Brunson iBot mi pomohl vytvořit konverzní funnely, které generují 3x více leadů."
    </p>
    <p style="color: #D4AF37; font-size: 14px; font-weight: bold;">— Jana M., Marketing Director</p>
    <p style="color: #666; font-size: 13px;">Výsledek: 3x více leadů</p>
  </div>
  
  <div style="background: linear-gradient(135deg, #1A1A0F, #2A2A1F); border: 1px solid #D4AF37; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
    <h3 style="color: #D4AF37; font-size: 20px; margin-bottom: 8px;">🏆 Exkluzivní komunita</h3>
    <p style="color: #B0B0B0; font-size: 14px; margin-bottom: 16px;">
      GOLD a DIAMOND členové mají přístup k uzavřené komunitě podnikatelů, kteří sdílejí strategie a výsledky.
    </p>
    <a href="{{APP_URL}}/#cenik" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0A0A0F; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
      Připojit se ke komunitě →
    </a>
  </div>
  
  <div style="border-top: 1px solid #2A2A2F; margin-top: 40px; padding-top: 20px; text-align: center;">
    <p style="color: #666; font-size: 12px;">
      iBots — Součást ekosystému <a href="https://bothub.cz" style="color: #D4AF37;">BotHub.cz</a><br>
      <a href="{{UNSUBSCRIBE_URL}}" style="color: #666;">Odhlásit se</a>
    </p>
  </div>
</div>`,
  bodyText: `2,847 podnikatelů už používá iBoty

Co říkají naši uživatelé:

"Konverze vzrostly o 42% během prvního měsíce." — Martin K.
"Portfolio vzrostlo o 27%." — Tomáš R.
"3x více leadů." — Jana M.

Připojte se ke komunitě: {{APP_URL}}/#cenik

---
iBots — Součást ekosystému BotHub.cz`,
  tags: ["social_proof", "testimonials", "community", "day5"],
};

/**
 * Email #5 - Offer with Urgency (Day 7)
 */
const email5Offer: EmailTemplate = {
  id: "offer_urgency_day7",
  dayOffset: 7,
  subject: "⏰ Poslední šance: GOLD plán se slevou 30% (zbývá 48 hodin)",
  preheader: "Exkluzivní nabídka pro nové členy + bonus Heritage Collection",
  bodyHtml: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E5E5; padding: 40px 24px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #8B7355); padding: 12px 16px; border-radius: 12px;">
      <span style="font-size: 24px; font-weight: bold; color: #0A0A0F;">iBots</span>
    </div>
  </div>
  
  <div style="background: linear-gradient(135deg, #3D2E0A, #1A1A0F); border: 2px solid #D4AF37; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
    <p style="color: #D4AF37; font-size: 14px; font-weight: bold; margin-bottom: 4px;">⏰ EXKLUZIVNÍ NABÍDKA</p>
    <h1 style="color: white; font-size: 28px; margin-bottom: 8px;">GOLD plán se slevou 30%</h1>
    <p style="color: #B0B0B0; font-size: 16px;">Pouze pro nové členy | Zbývá 48 hodin</p>
  </div>
  
  <p style="font-size: 16px; line-height: 1.6; color: #B0B0B0;">
    Za posledních 7 dní jste viděli, co iBoti dokážou. Teď je čas přejít z FREE na GOLD a odemknout plný potenciál.
  </p>
  
  <div style="background: #1A1A1F; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <h3 style="color: #D4AF37; font-size: 20px; margin-bottom: 16px;">Co získáte s GOLD:</h3>
    <ul style="color: #B0B0B0; font-size: 15px; line-height: 2.2;">
      <li>✅ Všech <strong style="color: white;">77 iBotů</strong> (místo 3)</li>
      <li>✅ <strong style="color: white;">Neomezené zprávy</strong> (místo 100/měsíc)</li>
      <li>✅ Pokročilá analytika konverzací</li>
      <li>✅ Priority podpora 24/7</li>
      <li>✅ API přístup + integrace</li>
      <li>✅ Export konverzací</li>
      <li>✅ Vlastní affiliate odkaz</li>
    </ul>
  </div>
  
  <div style="background: linear-gradient(135deg, #1A1A0F, #2A2A1F); border: 1px solid #D4AF37; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
    <p style="color: #666; font-size: 14px; text-decoration: line-through;">Běžná cena: 990 Kč/měsíc</p>
    <p style="color: #D4AF37; font-size: 32px; font-weight: bold; margin: 8px 0;">693 Kč/měsíc</p>
    <p style="color: #B0B0B0; font-size: 14px;">Ušetříte 3,564 Kč ročně</p>
    
    <a href="{{APP_URL}}/#cenik" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0A0A0F; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; margin-top: 16px;">
      Získat GOLD se slevou 30% →
    </a>
    
    <p style="color: #D4AF37; font-size: 13px; margin-top: 12px;">🔒 30denní garance vrácení peněz</p>
  </div>
  
  <div style="background: #1A1A1F; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <h4 style="color: #D4AF37; font-size: 16px; margin-bottom: 8px;">🎁 BONUS: Heritage Collection na 1 měsíc zdarma</h4>
    <p style="color: #B0B0B0; font-size: 14px;">
      Při upgradu na GOLD získáte přístup k 33 historickým AI osobnostem z Heritage Collection na celý první měsíc zdarma (hodnota 490 Kč).
    </p>
  </div>
  
  <p style="font-size: 14px; color: #666; margin-top: 24px;">
    P.S. Tato nabídka platí pouze 48 hodin. Po vypršení se cena vrátí na standardních 990 Kč/měsíc. 
    Rozhodněte se teď a začněte vydělávat více s AI.
  </p>
  
  <div style="border-top: 1px solid #2A2A2F; margin-top: 40px; padding-top: 20px; text-align: center;">
    <p style="color: #666; font-size: 12px;">
      iBots — Součást ekosystému <a href="https://bothub.cz" style="color: #D4AF37;">BotHub.cz</a><br>
      <a href="{{UNSUBSCRIBE_URL}}" style="color: #666;">Odhlásit se</a>
    </p>
  </div>
</div>`,
  bodyText: `⏰ Poslední šance: GOLD plán se slevou 30%

Za posledních 7 dní jste viděli, co iBoti dokážou. Teď je čas upgradovat.

GOLD plán:
- Všech 77 iBotů (místo 3)
- Neomezené zprávy (místo 100/měsíc)
- Pokročilá analytika, API přístup, integrace

Běžná cena: 990 Kč/měsíc
VAŠE CENA: 693 Kč/měsíc (sleva 30%)

BONUS: Heritage Collection na 1 měsíc zdarma (hodnota 490 Kč)

Získat GOLD: {{APP_URL}}/#cenik

Nabídka platí 48 hodin. 30denní garance vrácení peněz.

---
iBots — Součást ekosystému BotHub.cz`,
  tags: ["offer", "urgency", "discount", "day7"],
};

/**
 * Complete 5-part welcome sequence configuration
 */
export const WELCOME_SEQUENCE: WelcomeSequenceConfig = {
  sequenceId: "ibots_welcome_v1",
  name: "iBots Welcome Sequence",
  description: "5-part email drip campaign to convert FREE subscribers to GOLD plan",
  totalEmails: 5,
  emails: [
    email1Welcome,
    email2QuickWin,
    email3DeepValue,
    email4SocialProof,
    email5Offer,
  ],
};

/**
 * Get the next email in sequence based on subscriber's current position
 */
export function getNextEmailInSequence(
  currentEmailIndex: number
): EmailTemplate | null {
  if (currentEmailIndex >= WELCOME_SEQUENCE.emails.length) {
    return null; // Sequence complete
  }
  return WELCOME_SEQUENCE.emails[currentEmailIndex];
}

/**
 * Get email by day offset (for scheduler)
 */
export function getEmailByDayOffset(dayOffset: number): EmailTemplate | null {
  return WELCOME_SEQUENCE.emails.find((e) => e.dayOffset === dayOffset) || null;
}

/**
 * Replace template variables in email content
 */
export function renderEmailTemplate(
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; bodyHtml: string; bodyText: string } {
  let subject = template.subject;
  let bodyHtml = template.bodyHtml;
  let bodyText = template.bodyText;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    subject = subject.replaceAll(placeholder, value);
    bodyHtml = bodyHtml.replaceAll(placeholder, value);
    bodyText = bodyText.replaceAll(placeholder, value);
  }

  return { subject, bodyHtml, bodyText };
}

/**
 * Get all sequence email IDs for tracking
 */
export function getSequenceEmailIds(): string[] {
  return WELCOME_SEQUENCE.emails.map((e) => e.id);
}
