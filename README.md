# Stock Ticker (TensorWave Challenge)

This app satisfies the TensorWave stock challenge by showing **15+ tracked stocks** on the homepage and a **stock details** page with cached **Company Overview** + **TIME_SERIES_DAILY** history (including day-over-day % change). The key constraint is AlphaVantage’s **25 requests/day** limit, so the app uses a **Postgres cache** refreshed by a **single daily cron job**.

## Architecture
- **`apps/web`**: Next.js (App Router) UI. Never calls AlphaVantage directly.
- **`apps/api`**: Express API backed by Postgres (Prisma). Serves cached data only.
- **Cron**: one job/day populates/refreshes the cache and strictly stays within the request budget.

Relevant docs:
- AlphaVantage docs: `https://www.alphavantage.co/documentation/`
- AlphaVantage API key: `https://www.alphavantage.co/support/#api-key`
- Express production security best practices: `https://expressjs.com/en/advanced/best-practice-security`
- Render env vars: `https://render.com/docs/configure-environment-variables`

## AlphaVantage request budgeting (hard cap 25/day)
Daily cron behavior:
- **15 calls/day**: `TIME_SERIES_DAILY` for the 15 tracked tickers.
- **Up to 10 calls/day**: `OVERVIEW` only for stocks missing overview (or stale by TTL).

Cron also waits between calls to respect the per-minute throttle.

## Local development (Docker Compose)
1. Create a local env file (the repo includes `env.sample` as reference).
2. Start services:

```bash
docker compose up -d db
docker compose up -d api web
```

3. Run the cron job manually (optional):

```bash
cd apps/api
DATABASE_URL='postgresql://postgres:postgres@localhost:5432/stockticker' \
ALPHAVANTAGE_API_KEY='YOUR_KEY' \
npm run job:daily
```

## Seed data (from current dev cache)
The repo includes a snapshot of the current dev cache in `apps/api/prisma/seed-data/`.\n+\n+- Export fresh seed data from your current DB:\n+\n+```bash\n+cd stockticker\n+DATABASE_URL='postgresql://postgres:postgres@localhost:5432/stockticker' npm run -w @stockticker/api seed:export\n+```\n+\n+- Reset DB and re-seed (uses Prisma seed):\n+\n+```bash\n+cd stockticker\n+DATABASE_URL='postgresql://postgres:postgres@localhost:5432/stockticker' npx -w @stockticker/api prisma migrate reset --force\n+```\n+
## Render deployment
This repo includes `render.yaml`:
- **`stockticker-api`** (Docker): runs migrations on startup, serves `/api/*` and `/health`.
- **`stockticker-web`** (Docker): Next.js frontend.
- **`stockticker-daily-refresh`** (Cron): runs migrations + `dailyRefresh` job once/day.

Set these environment variables in Render:
- `ALPHAVANTAGE_API_KEY` (secret)
- `TRACKED_SYMBOLS` (15 symbols)
- `CORS_ORIGIN` (your deployed web origin)
- `API_BASE_URL` (your deployed api origin; used by Next.js route handlers to proxy `/api/*`)


