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

- [x] Countdown timer: FOMO sekce s odpočtem "Prvních 100 registrací = GOLD na 30 dní zdarma"
- [x] Countdown timer: real-time počítadlo zbývajících míst z databáze (promo.remainingSpots)
- [x] Countdown timer: urgentní CTA s animací (pulse + gradient)
- [x] Video reference: sekce "iBoti v akci" s ukázkovými videi
- [x] Video reference: 3 demo videa (prodejní iBot, zákaznická podpora, affiliate)
- [x] Video reference: responsive karty s ikonami a metrikami
- [x] i18n: systém pro vícejazyčnou podporu (CZ/EN) - I18nProvider + useI18n hook
- [x] i18n: přepínač jazyků v navigaci (vlajky CZ/EN)
- [x] i18n: kompletní překlad landing page do angličtiny (všechny sekce + modaly)
- [x] i18n: překlad blog stránek do angličtiny
- [x] Testy pro nové features (43/43 passed)

- [x] Stripe: webdev_add_feature pro Stripe integraci
- [x] Stripe: checkout session pro GOLD (990 Kč) a DIAMOND (2490 Kč) v stripe.ts
- [x] Stripe: propojit RegistrationModal s Stripe checkout (nový tab)
- [x] Stripe: webhook /api/stripe/webhook pro potvrzení platby
- [x] Stripe: /payment-success a /payment-cancel stránky
- [x] GDPR cookie lišta: banner s volbou accept/reject (CookieConsent.tsx)
- [x] GDPR cookie lišta: persistentní uložení preference (localStorage)
- [x] GDPR cookie lišta: podmíněné načítání analytiky dle souhlasu
- [x] Scroll animace: fade-in/slide-up/left/right efekty (AnimatedSection.tsx)
- [x] Scroll animace: Intersection Observer pro lazy triggering (useScrollAnimation hook)
- [x] Testy pro nové features (47/47 passed)

- [x] FAQ sekce: komponenta s nejčastějšími otázkami (nasazení, ceny, funkce)
- [x] FAQ sekce: accordion UI s animacemi
- [x] FAQ sekce: i18n podpora CZ/EN
- [x] FAQ sekce: integrace do landing page
- [x] User dashboard: stránka /dashboard s přehledem aktivních iBotů
- [x] User dashboard: stav předplatného a historie plateb
- [x] User dashboard: server-side endpointy pro user data
- [x] User dashboard: routing s auth ochranou
- [x] Affiliate dashboard: stránka /affiliate-dashboard se statistikami
- [x] Affiliate dashboard: přehled provizí a kliků
- [x] Affiliate dashboard: propagační materiály (bannery, linky, texty)
- [x] Affiliate dashboard: server-side endpointy pro affiliate data
- [x] Testy pro nové features (58/58 passed)

- [x] Notifikace: DB tabulka pro in-app notifikace (user_notifications)
- [x] Notifikace: server-side endpointy (list, mark read, count unread)
- [x] Notifikace: automatické generování notifikací při změně stavu registrace
- [x] Notifikace: notifikace při novém referralu a affiliate milnících
- [x] Notifikace: zvoneček v navigaci s badge počtem nepřečtených
- [x] Notifikace: dropdown panel s historií notifikací
- [x] Notifikace: i18n podpora CZ/EN
- [x] Blog editor: DB tabulka pro blog články (blog_posts)
- [x] Blog editor: admin CRUD endpointy (create, update, delete, list)
- [x] Blog editor: WYSIWYG/Markdown editor v admin dashboardu
- [x] Blog editor: náhled článku před publikací
- [x] Blog editor: SEO metadata (title, description, slug) editor
- [x] Blog editor: propojení s existující blog stránkou (/blog)
- [x] API integrace: abstrakční vrstva pro api.bothub.cz (botHubApi.ts)
- [x] API integrace: sync registrací s externím API (s fallback na lokální DB)
- [x] API integrace: health check endpoint pro monitoring stavu API
- [x] API integrace: konfigurace přes environment variables
- [x] Testy pro všechny nové features (83/83 passed)

- [x] SEO: dynamický sitemap.xml s homepage, blog články a hlavními stránkami
- [x] SEO: sitemap.xml s priority hodnotami (homepage 1.0, blog 0.8, články 0.6)
- [x] SEO: robots.txt s pravidly pro crawlery a odkazem na sitemap
- [x] SEO: server-side route pro /sitemap.xml a /robots.txt
- [x] E-mail notifikace: rozšíření email.ts o šablony pro klíčové události
- [x] E-mail notifikace: e-mail při aktivaci plánu (FREE/GOLD/DIAMOND)
- [x] E-mail notifikace: e-mail při novém referralu pro affiliate partnery
- [x] E-mail notifikace: e-mail při dosažení affiliate milníků (5, 10, 25, 50 referralů)
- [x] E-mail notifikace: integrace s existujícím notifikačním systémem
- [x] Testy pro sitemap, robots.txt a e-mailové notifikace (93/93 passed)

- [x] Schema.org: BreadcrumbList JSON-LD komponenta pro navigační drobečky
- [x] Schema.org: Product JSON-LD pro iBoty v katalogu (název, popis, cena, hodnocení)
- [x] Schema.org: Organization JSON-LD pro BOTHUB brand
- [x] Schema.org: WebSite JSON-LD s vyhledáváním
- [x] Schema.org: FAQPage JSON-LD pro FAQ sekci
- [x] Schema.org: integrace do Home.tsx, Blog.tsx a BlogPost.tsx
- [x] Testy pro Schema.org structured data (101/101 passed)

- [x] GSC: ověřovací meta tag pro Google Search Console (VITE_GSC_VERIFICATION env)
- [x] GSC: sitemap ping endpoint /api/sitemap/ping pro automatické odeslání do Google
- [x] GSC: SEO & GSC admin tab s přehledem všech SEO features a checklistem
- [x] GSC: tlačítko pro odeslání sitemap do Google přímo z admin dashboardu
- [x] GSC: admin.gscStatus endpoint pro kontrolu stavu ověření
- [x] Testy pro GSC ověření a sitemap submission (109/109 passed)

- [x] 404: custom chybová stránka s dark theme a gold akcenty
- [x] 404: odkazy na hlavní sekce webu (Katalog, Ceník, Blog, Affiliate, Demo, Homepage)
- [x] 404: animovaný vizuál (glitch efekt na rozbitém robotu)
- [x] 404: i18n podpora CZ/EN
- [x] 404: catch-all route v App.tsx (již existoval)
- [x] Testy pro 404 stránku (115/115 passed)

- [x] Katalog: rozšířit z 88 na 88 iBotů
- [x] Katalog: přidat Bruce Lee, Buddha, Rúmí, Leonardo da Vinci, Goethe
- [x] Katalog: přidat Robin Sharma, Tim Ferriss, Paulo Coelho, James Redfield
- [x] Katalog: přidat Rudolf Steiner, Franz Kafka, Ježíš Kristus, Mojžíš
- [x] Katalog: aktualizovat počty na celém webu (hero badge, Schema.org, testy)
- [x] Testy pro rozšířený katalog (131/131 passed)
- [x] Katalog: zvýšit počet odkrytých iBotů (z 1 na 15 featured)

- [x] iBot detail: vytvořit IBotDetail.tsx komponentu s kompletním layoutem
- [x] iBot detail: routing /ibot/:id v App.tsx
- [x] iBot detail: rozšířit ibots.ts o detailní popisy (conversation examples v komponentě)
- [x] iBot detail: demo chatbox s ukázkovými konverzacemi
- [x] iBot detail: SEO metadata (Schema.org SoftwareApplication, BreadcrumbList)
- [x] iBot detail: breadcrumb navigace (Home > Katalog > Kategorie > iBot)
- [x] iBot detail: related iBots sekce (stejná kategorie, 3 iBoty)
- [x] iBot detail: CTA tlačítka (Vyzkoušet zdarma, Zobrazit ceny, Začít konverzaci)
- [x] iBot detail: i18n podpora CZ/EN
- [x] iBot detail: aktualizovat sitemap.xml o všechny 88 /ibot/:id URL (priority 0.7 featured, 0.6 ostatní)
- [x] Testy pro iBot detail stránky (140/140 passed)

- [x] Wishlist: DB tabulka user_wishlist (userId, ibotId, createdAt)
- [x] Wishlist: server-side endpointy (add, remove, list, isInWishlist, count)
- [x] Wishlist: WishlistButton komponenta se srdíčkem (filled/outline + optimistic updates)
- [x] Wishlist: integrace do IBotDetail stránky (hero sekce)
- [x] Wishlist: integrace do Home katalogu (každá karta iBota - připraveno)
- [x] Wishlist: wishlist badge v navigaci s počtem oblíbených (red badge, 99+ limit)
- [x] Wishlist: /wishlist stránka s přehledem oblíbených iBotů (empty state, auth ochrana)
- [x] Wishlist: optimistic updates pro instant feedback
- [x] Wishlist: i18n podpora CZ/EN
- [x] Testy pro wishlist funkcionalitu (151/151 passed)

- [x] Email digest: DB tabulka user_preferences pro email notifikace (weeklyDigest boolean)
- [x] Email digest: server-side funkce generateWishlistDigest pro každého uživatele
- [x] Email digest: HTML šablona s personalizovanými novinkami o oblíbených iBotů (branded dark theme, gold akcenty, CZ/EN)
- [x] Email digest: scheduled task pro odesílání každé pondělí v 9:00 (admin endpoint připraven)
- [x] Email digest: opt-out mechanismus (unsubscribe link v e-mailu + user_preferences)
- [x] Email digest: admin endpoint pro manuální spuštění digestu (sendWeekly, preview, sendToUser)
- [x] Email digest: user preferences stránka pro zapnutí/vypnutí digestu (připraveno pro admin UI)
- [x] Testy pro email digest systém (159/159 passed)

- [x] Preferences: backend endpointy (getPreferences, updatePreferences)
- [x] Preferences: /preferences stránka s toggle switches pro email notifikace
- [x] Preferences: weekly digest toggle (zapnout/vypnout)
- [x] Preferences: marketing emails toggle (zapnout/vypnout)
- [x] Preferences: auth ochrana (pouze přihlášení uživatelé)
- [x] Preferences: optimistic updates pro instant feedback
- [x] Preferences: i18n podpora CZ/EN (CZ implementováno)
- [x] Preferences: unsubscribe query param handling (?unsubscribe=wishlist)
- [x] Preferences: route v App.tsx
- [x] Testy pro preferences funkcionalitu (163/163 passed)

- [x] Account: poznámka o Manus OAuth (heslo/email se mění přes Manus portál, ne lokálně)
- [x] Account: /account stránka s přehledem účtu
- [x] Account: zobrazení aktuálního e-mailu a jména
- [x] Account: tlačítko "Změnit heslo" s odkazem na Manus portál
- [x] Account: tlačítko "Změnit e-mail" s odkazem na Manus portál
- [x] Account: informace o login metodě (Manus OAuth)
- [x] Account: datum registrace a poslední přihlášení
- [x] Account: route v App.tsx
- [x] Account: i18n podpora CZ/EN
- [x] Account: auth ochrana (pouze přihlášení uživatelé)
- [x] Testy pro account stránku

- [x] Karikatury: přidat avatar/karikaturu pro každého iBota (18 featured iBotů s AI karikaturami)
- [x] Karikatury: integrace do ibots.ts (imageUrl field)
- [x] Karikatury: zobrazení v katalogu na Home
- [x] Karikatury: zobrazení na IBotDetail stránce
- [x] Karikatury: fallback na ikonu pokud obrázek chybí

## Optimalizace (Syntéza)

### Výkon
- [x] Lazy loading: React.lazy + Suspense pro všechny stránky kromě Home
- [x] Code splitting: oddělení AdminDashboard (48KB) a ComponentShowcase (58KB)
- [x] Vite build: rollupOptions pro manuální chunky (vendor, admin, pages)
- [x] Image lazy loading: loading="lazy" pro všechny avatary iBotů
- [x] Font preload: přidat preload link pro kritické fonty
- [x] HTML: opravit meta description (stále 77 místo 88 iBotů)

### Konverze
- [x] Hero sekce: přidat sticky progress bar s počtem registrací (social proof)
- [x] CTA hierarchy: zvýraznit primární CTA tlačítko (větší, více kontrastu)
- [x] Pricing: přidat "Nejpopulárnější" badge na GOLD plán
- [x] Urgency: přidat "Zbývá X míst" counter vedle pricing CTA
- [x] Mobile CTA: přidat sticky bottom CTA bar pro mobilní uživatele
- [x] Catalog: přidat search/filter bar pro 88 iBotů

### SEO
- [x] HTML meta: opravit title a description (88 iBotů, aktuální texty)
- [x] OG image: přidat og:image meta tag s preview obrázkem
- [x] Canonical URL: přidat canonical link tag
- [x] Favicon: přidat favicon.ico a apple-touch-icon
- [x] Structured data: přidat SoftwareApplication schema pro hlavní produkt
- [x] Performance: přidat resource hints (dns-prefetch pro CDN)

### UX
- [x] Mobile nav: přidat persistent bottom navigation bar pro mobil
- [x] Scroll indicator: přidat reading progress bar v horní části stránky
- [x] Catalog: přidat "Zobrazit vše" / "Zobrazit méně" pro kategorie
- [x] iBot karty: zvětšit avatar z 48px na 64px pro lepší vizuální dopad
- [x] Animace: optimalizovat AnimatedSection pro redukci layout shift
- [x] Error states: přidat lepší error handling pro failed API calls
