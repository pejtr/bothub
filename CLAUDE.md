# BOTHUB.cz — Claude Code Context

## Projekt
SaaS platforma pro prodej AI chatbotů ("iBotů") — 88 person v 7 kategoriích.
Produkce: https://bothub.cz | Repo: E:\PROJEKTY\bothub

## Tech Stack
- **Frontend**: React 19 + Tailwind 4 + Vite 7 + i18n (CZ/EN)
- **Backend**: Express 4 + tRPC 11 + Drizzle ORM
- **DB**: MySQL/TiDB Serverless (`DATABASE_URL`)
- **Email**: Nodemailer (SMTP) — welcome, aktivace, affiliate milestone
- **Payments**: Stripe — GOLD (990 Kč) + DIAMOND (2490 Kč)
- **Deploy**: Railway.app (cíl migrace z Manus AI)
- **AI/LLM**: Google Gemini 2.5 Flash (`GOOGLE_AI_API_KEY`)

## Ekosystém — propojení projektů
```
bothub.cz  ←──── iBoti persona katalog (88 person) ────► do-italie.cz (Natalie)
    │                                                            │
    └──────────────► LeadOS (CRM / kampaně) ◄───────────────────┘
```
- **do-italie.cz**: Natalie je iBot `natalie-italy` na BotHub platformě
- **LeadOS**: registrace uživatelů → CRM, platby → revenue tracking
- `LEADCONNECT_API_KEY` pro obousměrnou komunikaci s LeadOS

## BotHub API (`api.bothub.cz`)
- `server/botHubApi.ts` — abstrakční vrstva s graceful fallback na lokální DB
- Až bude API live: nastav `BOTHUB_API_KEY` + `BOTHUB_API_URL`, sync proběhne auto
- Endpointy: `/v1/registrations`, `/v1/bots`, `/v1/users/:email/bots`, `/health`

## Klíčové soubory
```
server/
  routers.ts       # Všechny tRPC procedury (registrace, affiliate, blog, wishlist...)
  db.ts            # DB dotazy
  botHubApi.ts     # api.bothub.cz integration layer
  email.ts         # Nodemailer šablony (welcome, aktivace, digest)
  dailyReport.ts   # Denní + týdenní reporty s LLM analýzou
  stripe.ts        # Stripe checkout sessions
client/src/
  data/ibots.ts    # 88 iBot person (katalog)
  pages/           # Home, Blog, IBotDetail, UserDashboard, AffiliateDashboard...
  components/LiveChatDemo.tsx  # Floating chat widget s LLM
```

## Auth architektura
- **Admin**: email+heslo → JWT cookie (`/api/auth/login`)
- **Uživatelé**: registrace přes RegistrationModal (email → aktivace odkaz)
  - Plán FREE: okamžitá aktivace
  - Plán GOLD/DIAMOND: Stripe checkout → webhook → aktivace
- `adminProcedure` v tRPC = chráněno admin JWT

## Příkazy
```bash
pnpm dev          # Dev server
pnpm build        # Produkční build
pnpm start        # Spustit produkci
pnpm db:push      # Sync DB schéma (POZOR: produkce!)
pnpm test         # Vitest (163+ testů)
```

## Environment Variables
```
DATABASE_URL            # TiDB Serverless
JWT_SECRET              # Session signing
ADMIN_EMAIL             # admin@bothub.cz
ADMIN_PASSWORD_HASH     # HMAC-SHA256 hash
OWNER_OPEN_ID           # Admin open ID
GOOGLE_AI_API_KEY       # Gemini 2.5 Flash
SMTP_HOST/PORT/USER/PASS  # Email odesílání
EMAIL_FROM              # noreply@bothub.cz
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
VITE_STRIPE_PUBLISHABLE_KEY
LEADCONNECT_API_KEY     # LeadOS
VITE_GSC_VERIFICATION   # Google Search Console
NODE_ENV
```

## Plány a ceny
| Plán | Cena | Funkce |
|---|---|---|
| FREE | 0 Kč | 1 iBot, základní funkce |
| GOLD | 990 Kč/měsíc | 10 iBotů, analytics, podpora |
| DIAMOND | 2490 Kč/měsíc | Neomezeně, white-label, API |

## Affiliate program
- Kódy formát: `BH-XXXXXX` (generováno automaticky)
- Provize: až 77% recurring commission
- Dashboard: `/affiliate-dashboard`

## TODO po migraci
- [ ] Odstranit Manus OAuth reference z `/account` stránky (Account.tsx)
- [ ] Otestovat Stripe webhook na Railway URL
- [ ] Nastavit SMTP (nebo SendGrid jako alternativu)
