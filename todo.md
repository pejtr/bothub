# iBots Project TODO

## Core Landing Page
- [x] Hero section with AI robot, ROI metrics (+327%, +42%), floating stats
- [x] Dark premium theme (#0A0A0F background, #D4AF37 gold accents)
- [x] Navigation with auth buttons and mobile hamburger menu
- [x] Stats section (ROI, 77 AI personalities, conversions, availability)
- [x] Catalog of 77 iBots in 7 Czech categories with search/filtering
- [x] Category grid with icons (Sales, Therapy, Leadership, Wealth, Spirituality, Health, Creativity)
- [x] How it works - 3 step process
- [x] Pricing section: FREE / GOLD (990 Kč) / DIAMOND (2,490 Kč)
- [x] Testimonials section with 6 customer reviews
- [x] Final CTA section
- [x] Footer with links
- [x] Cookie consent banner
- [x] Mobile bottom navigation

## Heritage Collection (Red Dwarf Meltdown)
- [x] 21 Heroworld characters (Elvis, Einstein, Gandhi, Monroe, etc.)
- [x] 12 Villainworld characters (Hitler, Caligula, Rasputin, etc.)
- [x] Heritage Collection component with tabs (Heroworld/Villainworld)
- [x] Integration into pricing (DIAMOND free, GOLD +490 Kč/month)
- [x] All 33 characters from Red Dwarf S04E06 implemented
- [x] Comprehensive tests for Heritage Collection data integrity

## Interactive Features
- [x] Video demo with 3 AI chat simulations (Hormozi, Buffett, Jung)
- [x] Email capture with lead magnet "7 způsobů jak AI zvýší váš ROI"
- [x] Auth modal (login/register) with social login options
- [x] Chat modal for bot conversations
- [x] Social proof notifications
- [x] IBotCard component

## Affiliate Program
- [x] Separate /affiliate page with commission structure (66%/77%)
- [x] Removed affiliate mentions from main landing page pricing

## Backend & Infrastructure
- [x] Upgrade to web-db-user template
- [x] Database schema synchronized
- [x] Server routes for auth, email capture
- [x] BotHub API service prepared

## Tests
- [x] Auth logout test
- [x] iBots data integrity tests (77 bots, 7 categories, unique IDs, search)
- [x] Heritage Collection tests (33 bots, hero/villain split, required fields)

## Pending
- [x] Connect BotHub API for real chat functionality
- [x] Implement Stripe payment integration for subscriptions
- [ ] Add newsletter automation for email capture leads
- [ ] Deploy to production with chatbot-ai.io domain
- [ ] Launch first marketing campaigns per 90-day plan
- [ ] Implement real user authentication flow
- [ ] Add analytics tracking
- [x] SEO optimization (meta tags, structured data)

## New Tasks (Feb 8, 2026)
- [x] Stripe integration for GOLD/DIAMOND subscriptions with payment form
- [x] SEO meta tags and structured data for better sharing and indexing
- [x] BotHub API connection for real chat conversations with iBots
- [x] Stripe products configuration tests (15 tests)
- [x] Payment success/cancel pages
- [x] Webhook handler for subscription events

## New Tasks (Feb 8, 2026 - Batch 2)
- [x] Affiliate dashboard with CSV export of statistics
- [x] A/B pricing test for GOLD and DIAMOND plans
- [x] Proactive chat agents that engage users based on web behavior

## New Tasks (Feb 8, 2026 - Batch 3)
- [x] Affiliate leaderboard for competition and engagement
- [x] New A/B test variant highlighting different product features on pricing page
- [x] Proactive chat agent trigger when user compares 3+ items in catalog

## New Tasks (Feb 17, 2026 - Admin Dashboard)
- [x] Admin analytics dashboard page (/admin)
- [x] A/B test results tracking (conversion rates per variant)
- [x] Affiliate performance metrics (top affiliates, commissions, trends)
- [x] Chatbot engagement metrics (sessions, messages, popular bots)
- [x] Analytics event tracking tables in database
- [x] Admin-only tRPC procedures for dashboard data
- [x] Charts with visual data representation
- [x] Tests for admin dashboard features

## BotHub Integration - Phase 1 (Feb 17, 2026)
- [x] Cross-platform navigation: "Back to BotHub" link in iBots nav
- [x] Cross-platform navigation: BotHub ecosystem badge/indicator
- [x] Heritage Collection CTA in pricing (cross-sell to BotHub)
- [x] "Part of BotHub ecosystem" branding in hero/footer
- [x] Shared affiliate tracking with cross-platform source attribution
- [x] Cross-platform affiliate codes recognition (BH-/IB- prefixes)
- [x] BotHub catalog link in iBots catalog section
- [x] Tests for cross-platform integration features

## Phase 2 Integration + Features (Feb 17, 2026)
- [x] SSO: Cross-platform session token sharing between iBots and BotHub.cz
- [x] SSO: Unified login/logout across platforms
- [x] SSO: Cross-platform user profile sync
- [x] Email: 5-part welcome sequence with lead magnet
- [x] Email: Automated drip campaign (Day 0, 1, 3, 5, 7)
- [x] Email: Lead magnet "7 způsobů jak AI zvýší váš ROI" delivery
- [x] Email: Gradual upsell from FREE to GOLD plan
- [x] Admin: Analytics dashboard page (/admin)
- [x] Admin: A/B test results with conversion rates per variant
- [x] Admin: Affiliate performance metrics and top affiliates
- [x] Admin: Chatbot engagement metrics
- [x] Admin: Email sequence stats and subscriber tracking
- [x] Tests for all new features (28 tests)

## Admin Dashboard Enhancement (Feb 17, 2026)
- [x] Enhanced Overview tab with Chart.js user growth + subscriber growth + chat trend line charts
- [x] Enhanced Overview tab with Chart.js subscription breakdown doughnut chart
- [x] A/B test tab with Chart.js bar chart comparing variant conversion rates + winner detection
- [x] Affiliate tab with Chart.js clicks trend line chart + source breakdown doughnut
- [x] Chatbot tab with Chart.js grouped bar chart for trigger type performance
- [x] Email tab with Chart.js horizontal bar funnel visualization for sequence
- [x] 6 KPI cards with revenue estimate (MRR) and active subscriptions
- [x] Date range filter (7d/30d/90d) for all time-series data
- [x] Server-side time-series data aggregation + subscription breakdown + affiliate clicks trend
- [x] Tests for enhanced admin dashboard features (31 tests)

## Chatbot Comparison Feature (Feb 17, 2026)
- [x] Server-side chatbotList procedure (unique bots with trigger counts)
- [x] Server-side chatbotComparison procedure (per-bot metrics, daily trends, trigger breakdown)
- [x] Multi-select chatbot picker with search, category filter (up to 10 bots)
- [x] Quick select for bots with existing data
- [x] Chart.js bar chart for interaction rate comparison
- [x] Chart.js grouped bar chart for triggers vs interactions
- [x] Chart.js line chart for daily trend (one line per bot)
- [x] Chart.js grouped bar chart for trigger type breakdown
- [x] Side-by-side KPI cards per bot with color coding
- [x] Detailed comparison table with progress bars and best performer badge
- [x] Integration into admin dashboard as new "Porovnání botů" tab
- [x] Tests for chatbot comparison features (20 tests)

## Chatbot Comparison Date Filter (Feb 17, 2026)
- [x] Add dateRange parameter to chatbotComparison server procedure
- [x] Filter daily trends, trigger breakdown by date range
- [x] Add date range selector UI to ComparisonTab (7d/30d/90d/all)
- [x] Update all charts to respect date range filter
- [x] Tests for date range filtering in comparison (5 tests)

## Enhanced Trend Visualizations (Feb 17, 2026)
- [x] Server-side: Add interaction rate trend data to chatbotComparison (already implemented)
- [x] Server-side: Calculate performance score (interaction_rate * log(volume + 1))
- [x] Server-side: Add week-over-week comparison data aggregation (client-side)
- [x] Frontend: Multi-metric daily trend chart (triggers + interactions + rate with dual Y-axis)
- [x] Frontend: Performance score trend line chart
- [x] Frontend: Week-over-week comparison mixed chart (bar + line)
- [x] Tests for enhanced trend visualizations (16 new tests)

## Syntéza systémů — Growth Engine (Apr 2026)
- [x] Backend: Unified Event Pipeline (eventPipeline.ts) — propojení všech systémů
- [x] Backend: processEvent() — registrace, chat, feedback, subscription triggery
- [x] Backend: runChurnDetection() — 14d+ neaktivní uživatelé
- [x] Backend: runUpsellTriggers() — FREE uživatelé 7d+
- [x] Backend: analyzeConversionPaths() — které boty vedou ke konverzím
- [x] Backend: forecastRevenue() — MRR forecast s growth rate
- [x] Backend: calculateHealthScore() — celkové zdraví systému (0-100)
- [x] Backend: intelligence router (summary, churnRisk, conversionPaths, revenueForecast, runAutomations)
- [x] Frontend: IntelligenceTab — Health Score, MRR forecast, churn alert, konverzní cesty, growth loop diagram
- [x] Frontend: ExitIntentPopup — personalizovaný dle chování (pricing/catalog/default variant)
- [x] 203 testů prochází

## Komplexní integrace vylepšení (Apr 2026)

### 1. Konverzační analytika & feedback
- [x] DB: Tabulka conversation_logs (botId, userId, sessionId, messages, timestamps)
- [x] DB: Tabulka user_feedback (botId, rating, comment, userId, createdAt)
- [x] Backend: Ukládání konverzací do DB při chatu (ChatModal updated)
- [x] Backend: Feedback endpoint (hodnocení 1-5 + komentář po konverzaci)
- [x] Frontend: Feedback modal po každém chatu (hvězdičky + volitelný komentář)
- [x] Admin: Přehled feedbacku a průměrných hodnocení per bot (FeedbackTab)

### 2. Automatické denní/týdenní reporty
- [x] DB: Tabulka daily_reports (datum, metriky, generováno_ai)
- [x] Backend: Cron job - denní report (nové registrace, konverze, top boti, revenue)
- [x] Backend: Týdenní AI souhrn - strategická doporučení na základě dat
- [x] Backend: Owner notification pro denní/týdenní reporty
- [x] Admin: Report history page s archivem reportů (ReportsTab)

### 3. Newsletter automatizace
- [x] Backend: Trigger welcome sequence při registraci uživatele (ne jen email subscribe)
- [x] Backend: Trigger upsell sekvence po 7 dnech FREE plánu
- [x] Backend: Trigger win-back sekvence po 30 dnech inaktivity
- [ ] Admin: Email funnel vizualizace s open rates a click rates (future)

### 4. Landing page performance optimalizace
- [x] Urgency timer na pricing sekci (odpočet do konce akce)
- [x] Exit-intent popup s nabídkou FREE trialu
- [x] Sticky CTA bar při scrollování dolů
- [x] Live visitor counter ("X lidí právě prohlíží iBoty")
- [x] Rozšíření social proof o počítadlo aktivních uživatelů
- [ ] Zlepšení mobilního UX - větší CTA tlačítka (future)

### 5. Admin dashboard rozšíření
- [x] Admin: Reporty záložka s historií AI reportů
- [x] Admin: Zpětná vazba záložka s hodnoceními per bot
- [ ] Real-time metriky panel (WebSocket nebo polling každých 30s) (future)
- [ ] Revenue forecast graf (predikce na základě trendu) (future)
- [ ] Churn risk detection (uživatelé bez aktivity 14+ dní) (future)
- [ ] Top konverzní cesty (které boty vedou k platbě) (future)
- [ ] Export reportů do PDF/CSV (future)
