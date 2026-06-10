# BOTHUB — Nasazení (unified-v2)

Sjednocený produkt BOTHUB.cz (merge původních projektů `bothub` + `ibots`).
Větev **`unified-v2`** v repu `pejtr/bothub`; stará verze zůstává na `main` jako fallback.

## Architektura

- React 19 + Vite 7 + Tailwind 4 (client) · Express 4 + tRPC 11 (server) · Drizzle ORM + MySQL/TiDB
- 77 iBotů (7 kategorií) + 33 Heritage Collection (Red Dwarf) · FREE / GOLD 990 Kč / DIAMOND 2 490 Kč
- Chat engine: `server/bothub/bothub.ts` (dynamické persona prompty + Heritage hero/villain režim)
- Stripe subscriptions (plány definované v `server/stripe/products.ts` — žádné price ID v env)

## Postup nasazení na Manus

1. **Manus projekt** — založit nový projekt (web-db-user template) a propojit s GitHub repem
   `pejtr/bothub`, větev **`unified-v2`** (nebo po ověření mergnout `unified-v2` → `main`
   a nechat Manus sledovat `main`).
2. **Secrets** — viz tabulka níže. Většinu injektuje Manus platforma automaticky.
3. **Databáze** — migrace jsou v `drizzle/*.sql` (0000–0005). Aplikace: `pnpm db:push`
   (spouští `drizzle-kit generate && drizzle-kit migrate`).
4. **Build** — `pnpm build` (ověřeno lokálně: client + server OK). Start: `pnpm start`.
5. **Doména** — nasměrovat BOTHUB.cz na Manus projekt.

## Environment variables

| Proměnná | Zdroj | Povinná |
|---|---|---|
| `DATABASE_URL` | Manus injektuje (managed MySQL/TiDB) | ✅ |
| `JWT_SECRET` | Manus injektuje | ✅ |
| `VITE_APP_ID` | Manus injektuje (OAuth app id) | ✅ |
| `OAUTH_SERVER_URL` | Manus injektuje | ✅ |
| `OWNER_OPEN_ID` | Manus injektuje (admin účet) | ✅ |
| `BUILT_IN_FORGE_API_URL` | Manus injektuje (LLM API) | ✅ |
| `BUILT_IN_FORGE_API_KEY` | Manus injektuje | ✅ |
| `STRIPE_SECRET_KEY` | **ručně** — Stripe dashboard → API keys | pro platby |
| `STRIPE_WEBHOOK_SECRET` | **ručně** — Stripe webhook `/api/stripe/webhook` | pro platby |
| `PORT` | volitelná (default 3000) | — |

Bez Stripe klíčů aplikace běží (katalog, chat, wishlist…), jen checkout vrátí chybu.
Bez Forge klíče chat vrací graceful fallback hlášku.

## Lokální vývoj (Windows)

```bash
pnpm install
pnpm dev          # tsx watch (cross-env)
pnpm dev:preview  # bez watch — pro preview tooling
pnpm test         # 203 testů
pnpm check        # tsc --noEmit
```

`.env`: `NODE_ENV=development` (+ volitelně DATABASE_URL na lokální/TiDB DB).

## Co je odložené (vědomě)

- Stránky Blog / BlogPost / IBotDetail / Account z původního bothub (vyžadují adaptaci
  jeho i18n systému) — backend routery `blogPublic`/`blogAdmin` už ale běží
- Nodemailer wishlist-digest port (email šablony z bothub)
- `registrations`/`affiliate_registrations` tabulky z bothub — záměrně vynechány,
  ibots affiliate systém (partners/clicks/conversions) je nahrazuje
