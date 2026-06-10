/**
 * Upsell & Win-back Email Sequences
 * 
 * UPSELL SEQUENCE: Triggered after 7 days on FREE plan
 * - Day 7: "Unlock the full power" - show what they're missing
 * - Day 10: Social proof + ROI case study
 * - Day 14: Final offer with urgency + bonus
 * 
 * WIN-BACK SEQUENCE: Triggered after 30 days of inactivity
 * - Day 30: "We miss you" + reminder of value
 * - Day 37: New feature announcement
 * - Day 44: Final win-back offer
 */

export interface EmailTemplate {
  id: string;
  dayOffset: number;
  subject: string;
  preheader: string;
  bodyHtml: string;
  bodyText: string;
  tags: string[];
}

// ─── UPSELL SEQUENCE ─────────────────────────────────────────────────────────

const upsellEmail1: EmailTemplate = {
  id: "upsell_day7",
  dayOffset: 7,
  subject: "🔓 Odemkněte všech 77 AI expertů (co vám uniká)",
  preheader: "Zatím máte přístup jen ke 3 botům. Podívejte se, co vám chybí.",
  bodyHtml: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E5E5; padding: 40px 24px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="font-size: 48px; margin-bottom: 16px;">🔓</div>
    <h1 style="color: #D4AF37; font-size: 28px; margin: 0 0 8px;">Týden s iBoty — jak to jde?</h1>
    <p style="color: #9CA3AF; font-size: 16px;">Doufáme, že jste si vyzkoušeli první chatboty. Ale víte, co vám ještě chybí?</p>
  </div>

  <div style="background: #1A1A1F; border: 1px solid #2A2A2F; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="color: #fff; font-size: 20px; margin: 0 0 16px;">Na FREE plánu máte přístup k 3 botům.</h2>
    <p style="color: #9CA3AF; margin: 0 0 16px;">Na GOLD plánu máte přístup ke <strong style="color: #D4AF37;">všem 77 AI expertům</strong> včetně:</p>
    <ul style="color: #E5E5E5; padding-left: 20px; line-height: 1.8;">
      <li>Alex Hormozi — zvýšení konverzí o 42%</li>
      <li>Warren Buffett — investiční rozhodování</li>
      <li>Tony Robbins — peak performance</li>
      <li>Carl Jung — psychologie a leadership</li>
      <li>Andrew Huberman — věda o výkonu</li>
      <li>+ 72 dalších světových expertů</li>
    </ul>
  </div>

  <div style="background: linear-gradient(135deg, #1A1A0F, #2A1A0F); border: 1px solid #D4AF37; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
    <p style="color: #D4AF37; font-size: 14px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">GOLD PLÁN</p>
    <p style="color: #fff; font-size: 36px; font-weight: bold; margin: 0 0 4px;">990 Kč<span style="font-size: 18px; color: #9CA3AF;">/měs</span></p>
    <p style="color: #9CA3AF; font-size: 14px; margin: 0 0 20px;">= 33 Kč/den za přístup ke všem 77 AI expertům</p>
    <a href="https://ibotchatbot.manus.space/#cenik" style="background: #D4AF37; color: #0A0A0F; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Upgradovat na GOLD →</a>
  </div>

  <p style="color: #6B7280; font-size: 12px; text-align: center;">Odhlásit se z emailů | iBots.cz</p>
</div>`,
  bodyText: `Týden s iBoty — jak to jde?

Na FREE plánu máte přístup k 3 botům. Na GOLD plánu máte přístup ke všem 77 AI expertům za 990 Kč/měs.

Upgradovat: https://ibotchatbot.manus.space/#cenik`,
  tags: ["upsell", "free-to-gold"],
};

const upsellEmail2: EmailTemplate = {
  id: "upsell_day10",
  dayOffset: 10,
  subject: "📊 Martin zvýšil konverze o 42% — zde je jak",
  preheader: "Skutečný příběh z praxe. Konkrétní čísla. Konkrétní kroky.",
  bodyHtml: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E5E5; padding: 40px 24px;">
  <h1 style="color: #D4AF37; font-size: 24px; margin: 0 0 24px;">Case Study: +42% konverze za 30 dní</h1>

  <div style="background: #1A1A1F; border-left: 4px solid #D4AF37; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
    <p style="color: #E5E5E5; font-style: italic; margin: 0 0 12px;">"Díky Alex Hormozi iBotovi jsem přepracoval celou nabídkovou strukturu. Konverze vzrostly o 42% během prvního měsíce."</p>
    <p style="color: #D4AF37; font-size: 14px; margin: 0;"><strong>Martin Kovář</strong> — E-commerce podnikatel, ShopMax.cz</p>
  </div>

  <h2 style="color: #fff; font-size: 18px;">Co Martin udělal:</h2>
  <ol style="color: #E5E5E5; line-height: 2; padding-left: 20px;">
    <li>Každé ráno 15 minut s Alex Hormozi iBoten — optimalizace nabídky</li>
    <li>Použil Hormozi Value Equation pro přepracování landing page</li>
    <li>Implementoval "Grand Slam Offer" strukturu do emailů</li>
    <li>Výsledek: 42% nárůst konverzí, 27% vyšší AOV</li>
  </ol>

  <div style="text-align: center; margin-top: 32px;">
    <a href="https://ibotchatbot.manus.space/#cenik" style="background: #D4AF37; color: #0A0A0F; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Chci stejné výsledky →</a>
  </div>

  <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 32px;">Odhlásit se z emailů | iBots.cz</p>
</div>`,
  bodyText: `Case Study: +42% konverze za 30 dní

Martin Kovář z ShopMax.cz zvýšil konverze o 42% díky Alex Hormozi iBotovi.

Chcete stejné výsledky? https://ibotchatbot.manus.space/#cenik`,
  tags: ["upsell", "case-study"],
};

const upsellEmail3: EmailTemplate = {
  id: "upsell_day14",
  dayOffset: 14,
  subject: "⏰ Poslední šance: GOLD plán + bonus Heritage Collection",
  preheader: "Tato nabídka platí jen do konce týdne.",
  bodyHtml: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E5E5; padding: 40px 24px;">
  <div style="text-align: center; background: linear-gradient(135deg, #1A1A0F, #2A1A0F); border: 2px solid #D4AF37; border-radius: 16px; padding: 32px; margin-bottom: 32px;">
    <p style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">SPECIÁLNÍ NABÍDKA</p>
    <h1 style="color: #fff; font-size: 28px; margin: 0 0 16px;">GOLD + Heritage Collection</h1>
    <p style="color: #9CA3AF; margin: 0 0 24px;">Normálně 990 + 490 Kč = 1 480 Kč/měs<br>
    <strong style="color: #D4AF37;">Dnes: 990 Kč/měs (Heritage ZDARMA první měsíc)</strong></p>
    <a href="https://ibotchatbot.manus.space/#cenik" style="background: #D4AF37; color: #0A0A0F; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block;">Získat GOLD teď →</a>
  </div>

  <p style="color: #9CA3AF; text-align: center; font-size: 14px;">Pokud vám iBoti nepomůžou do 30 dní, vrátíme vám peníze. Žádné otázky.</p>

  <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 32px;">Odhlásit se z emailů | iBots.cz</p>
</div>`,
  bodyText: `GOLD + Heritage Collection — speciální nabídka

GOLD plán (všech 77 iBotů) + Heritage Collection ZDARMA první měsíc.
Normálně 1 480 Kč, dnes 990 Kč/měs.

Získat: https://ibotchatbot.manus.space/#cenik`,
  tags: ["upsell", "final-offer", "urgency"],
};

// ─── WIN-BACK SEQUENCE ────────────────────────────────────────────────────────

const winbackEmail1: EmailTemplate = {
  id: "winback_day30",
  dayOffset: 30,
  subject: "Chybíte nám 👋 — co se děje?",
  preheader: "Všimli jsme si, že jste chvíli nebyli. Máme pro vás novinky.",
  bodyHtml: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E5E5; padding: 40px 24px;">
  <h1 style="color: #D4AF37; font-size: 24px; margin: 0 0 16px;">Chybíte nám! 👋</h1>
  <p style="color: #E5E5E5; line-height: 1.7;">Všimli jsme si, že jste chvíli nebyli na iBots.cz. Chtěli jsme se zeptat — je vše v pořádku?</p>
  <p style="color: #E5E5E5; line-height: 1.7;">Mezitím jsme přidali nové funkce a iBoty. Přijďte se podívat — váš přístup stále čeká.</p>
  <div style="text-align: center; margin-top: 32px;">
    <a href="https://ibotchatbot.manus.space" style="background: #D4AF37; color: #0A0A0F; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Vrátit se na iBots →</a>
  </div>
  <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 32px;">Odhlásit se z emailů | iBots.cz</p>
</div>`,
  bodyText: `Chybíte nám! Přijďte se podívat na novinky: https://ibotchatbot.manus.space`,
  tags: ["winback", "re-engagement"],
};

const winbackEmail2: EmailTemplate = {
  id: "winback_day37",
  dayOffset: 37,
  subject: "🆕 Nové iBoty přidány — podívejte se",
  preheader: "Přidali jsme Heritage Collection a nové funkce od vaší poslední návštěvy.",
  bodyHtml: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E5E5; padding: 40px 24px;">
  <h1 style="color: #D4AF37; font-size: 24px; margin: 0 0 16px;">Co je nového na iBots.cz 🆕</h1>
  <ul style="color: #E5E5E5; line-height: 2; padding-left: 20px;">
    <li>🏛️ <strong>Heritage Collection</strong> — 33 historických osobností (Einstein, Gandhi, Churchill...)</li>
    <li>📊 <strong>Pokročilá analytika</strong> — sledujte svůj pokrok</li>
    <li>🔗 <strong>Integrace s BotHub.cz</strong> — rozšířený ekosystém AI agentů</li>
    <li>⚡ <strong>Rychlejší odpovědi</strong> — optimalizovaný engine</li>
  </ul>
  <div style="text-align: center; margin-top: 32px;">
    <a href="https://ibotchatbot.manus.space" style="background: #D4AF37; color: #0A0A0F; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Prozkoumat novinky →</a>
  </div>
  <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 32px;">Odhlásit se z emailů | iBots.cz</p>
</div>`,
  bodyText: `Nové funkce na iBots.cz: Heritage Collection, analytika, BotHub integrace. Prozkoumat: https://ibotchatbot.manus.space`,
  tags: ["winback", "feature-announcement"],
};

const winbackEmail3: EmailTemplate = {
  id: "winback_day44",
  dayOffset: 44,
  subject: "🎁 Speciální nabídka pro váš návrat",
  preheader: "Jako poděkování za vaši loajalitu máme pro vás dárek.",
  bodyHtml: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E5E5; padding: 40px 24px;">
  <h1 style="color: #D4AF37; font-size: 24px; margin: 0 0 16px;">Speciální nabídka pro váš návrat 🎁</h1>
  <p style="color: #E5E5E5; line-height: 1.7;">Chceme vás mít zpět. Proto vám nabízíme <strong style="color: #D4AF37;">první měsíc GOLD plánu za 490 Kč</strong> (místo 990 Kč).</p>
  <p style="color: #E5E5E5; line-height: 1.7;">Tato nabídka platí 48 hodin od doručení tohoto emailu.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="https://ibotchatbot.manus.space/#cenik" style="background: #D4AF37; color: #0A0A0F; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block;">Využít nabídku →</a>
  </div>
  <p style="color: #6B7280; font-size: 12px; text-align: center;">Odhlásit se z emailů | iBots.cz</p>
</div>`,
  bodyText: `Speciální nabídka: první měsíc GOLD za 490 Kč (platí 48 hodin). Využít: https://ibotchatbot.manus.space/#cenik`,
  tags: ["winback", "discount-offer"],
};

export const UPSELL_SEQUENCE = {
  sequenceId: "free_to_gold_upsell",
  name: "FREE → GOLD Upsell",
  description: "Triggered after 7 days on FREE plan",
  totalEmails: 3,
  emails: [upsellEmail1, upsellEmail2, upsellEmail3],
};

export const WINBACK_SEQUENCE = {
  sequenceId: "win_back_inactive",
  name: "Win-back Inactive Users",
  description: "Triggered after 30 days of inactivity",
  totalEmails: 3,
  emails: [winbackEmail1, winbackEmail2, winbackEmail3],
};
