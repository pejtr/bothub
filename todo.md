# BOTHUB.cz Landing Page TODO

- [x] Dark premium theme setup (#0A0A0F base, #F59E0B gold, #8B5CF6 purple)
- [x] Database schema for email captures and A/B test tracking
- [x] Hero section with tagline "AI chatboti, kteří PRODÁVAJÍ za vás"
- [x] Problem/Solution section (Hormozi style comparison table)
- [x] Interactive catalog of 77 iBots in 7 categories
- [x] Gated content system (1 featured iBot unlocked, rest locked)
- [x] Unlock modal with email capture and GDPR consent
- [x] Value proposition section with Hormozi Value Equation visualization
- [x] Key metrics display (+327% ROI, +42% conversion, 89% satisfaction, 5min deploy)
- [x] Pricing table (FREE/GOLD/DIAMOND) with affiliate commissions
- [x] Affiliate program section (up to 77% recurring commission)
- [x] Multi-platform integration section (Web, Telegram, Discord, API)
- [x] Parallax decorative elements with AI/tech motifs
- [x] A/B testing for CTA buttons with conversion tracking
- [x] Email capture server-side API endpoint
- [x] Footer with links and copyright
- [x] Vitest tests for A/B testing and email capture

- [x] Prozkoumat BotHub API (api.bothub.cz) dokumentaci a endpointy (DNS neresolvuje, API zatím neexistuje)
- [x] Implementovat server-side registrační/aktivační flow (DB-based, ready for API swap)
- [x] Propojit Hero CTA tlačítka s registračním flow
- [x] Propojit Pricing CTA tlačítka s výběrem plánu (FREE/GOLD/DIAMOND)
- [x] Propojit Affiliate CTA s registrací partnera (generuje BH-XXXXXX kódy)
- [x] Vytvořit RegistrationModal a AffiliateModal na frontendu
- [x] Napsat testy pro registration a affiliate routery (16/16 passed)

- [x] Admin dashboard: server-side query endpointy (registrace, affiliate, email captures, A/B testy)
- [x] Admin dashboard: chráněná stránka s real-time přehledy a statistikami
- [x] Admin dashboard: routing a role-based přístup (pouze admin)
- [x] Potvrzovací e-maily: server-side odesílání po registraci (welcome email)
- [x] Potvrzovací e-maily: aktivační odkaz pro GOLD/DIAMOND plány + /activate stránka
- [x] Exit-intent popup: detekce opuštění stránky (mouse leave + mobile scroll)
- [x] Exit-intent popup: personalizace obsahu dle CTA varianty (3 varianty)
- [x] Exit-intent popup: 24h cooldown, 15s auto-close, 5s activation delay
- [x] Testy pro admin dashboard, e-maily a exit-intent popup (29/29 passed)

- [x] Denní reporty: server-side endpoint pro generování denního přehledu (dailyReport.ts)
- [x] Denní reporty: scheduled task pro automatické odesílání každý den v 8:00
- [x] Sekce s referencemi: 3 ukázkové ohlasy spokojených zákazníků (Testimonials.tsx)
- [x] Sekce s referencemi: integrace do landing page (před Pricing sekcí)
- [x] Live chat demo: interaktivní iBot widget na landing page (LiveChatDemo.tsx)
- [x] Live chat demo: napojení na LLM pro reálné odpovědi (Alex Hormozi persona)
- [x] Testy pro nové features (36/36 passed)

- [x] Social proof: real-time notifikace widget ("Martin z Prahy právě aktivoval GOLD")
- [x] Social proof: simulace aktivity z databáze registrací (20 realistických událostí)
- [x] Social proof: animace slide-in/slide-out s auto-rotation (15-30s interval, 5s display)
- [x] Blog: stránka se seznamem článků o AI chatbotech (/blog)
- [x] Blog: detail článku s SEO meta tagy a strukturovanými daty (/blog/:slug)
- [x] Blog: 3 seed články (konverze, affiliate, kategorie iBotů)
- [x] Blog: sitemap.xml (dynamický) a robots.txt pro SEO
- [x] Týdenní souhrn: rozšíření daily report o týdenní analýzu (generateWeeklyReport)
- [x] Týdenní souhrn: strategická doporučení na základě dat (LLM - Hormozi principy)
- [x] Týdenní souhrn: scheduled task každý pondělí v 9:00
- [x] Testy pro nové features (41/41 passed)
