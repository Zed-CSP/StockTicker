import "dotenv/config";
import pino from "pino";
import { prisma } from "../prisma.js";
import { getEnv } from "../env.js";
import { parseTrackedSymbols } from "../tracked.js";
import { sleep } from "../utils/sleep.js";
import { fetchCompanyOverview, fetchTimeSeriesDaily } from "../alphavantage.js";

function normalizeText(v: string | undefined): string | null {
  if (!v) return null;
  const s = v.trim();
  if (!s) return null;
  if (s.toLowerCase() === "none" || s.toLowerCase() === "null" || s.toLowerCase() === "n/a")
    return null;
  return s;
}

function parseBigInt(v: string | undefined): bigint | null {
  const s = normalizeText(v);
  if (!s) return null;
  try {
    return BigInt(s);
  } catch {
    return null;
  }
}

function dateOnlyUtc(yyyyMmDd: string): Date {
  return new Date(`${yyyyMmDd}T00:00:00.000Z`);
}

async function main() {
  const env = getEnv();
  const logger = pino({ level: env.NODE_ENV === "production" ? "info" : "debug" });

  const apiKey = env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) throw new Error("Missing ALPHAVANTAGE_API_KEY");

  const symbols = parseTrackedSymbols(env.TRACKED_SYMBOLS);
  if (symbols.length < 15) logger.warn({ count: symbols.length }, "TRACKED_SYMBOLS has < 15 symbols");

  // Hard cap to respect 25/day. We must spend one call per symbol for TIME_SERIES_DAILY.
  const dailySymbols = symbols.slice(0, 15);
  const totalBudget = 25;
  const remainingBudget = Math.max(0, totalBudget - dailySymbols.length);

  logger.info(
    { dailySymbols: dailySymbols.length, remainingBudget, totalBudget },
    "Starting daily refresh"
  );

  await prisma.stock.createMany({
    data: dailySymbols.map((symbol) => ({ symbol })),
    skipDuplicates: true
  });

  let dailyOk = 0;
  let dailyFail = 0;
  for (const symbol of dailySymbols) {
    try {
      const { bars } = await fetchTimeSeriesDaily({ apiKey, symbol, outputsize: "compact" });
      let upserts = 0;
      for (const b of bars) {
        const date = dateOnlyUtc(b.date);
        await prisma.dailyPrice.upsert({
          where: { symbol_date: { symbol, date } },
          create: {
            symbol,
            date,
            open: b.open,
            high: b.high,
            low: b.low,
            close: b.close,
            volume: BigInt(b.volume)
          },
          update: {
            open: b.open,
            high: b.high,
            low: b.low,
            close: b.close,
            volume: BigInt(b.volume)
          }
        });
        upserts += 1;
      }
      dailyOk += 1;
      logger.info({ symbol, upserts }, "Updated daily prices");
    } catch (e: unknown) {
      dailyFail += 1;
      logger.warn({ symbol, err: e instanceof Error ? e.message : String(e) }, "Daily price update failed");
    }

    await sleep(env.AV_MIN_MS_BETWEEN_CALLS);
  }

  const ttlMs = env.OVERVIEW_TTL_DAYS * 24 * 60 * 60 * 1000;
  const staleCutoff = new Date(Date.now() - ttlMs);
  const toFetch = await prisma.stock.findMany({
    where: {
      symbol: { in: dailySymbols },
      OR: [{ overviewFetchedAt: null }, { overviewFetchedAt: { lt: staleCutoff } }]
    },
    orderBy: { overviewFetchedAt: "asc" },
    take: remainingBudget,
    select: { symbol: true }
  });

  let ovOk = 0;
  let ovFail = 0;
  for (const row of toFetch) {
    const symbol = row.symbol;
    try {
      const ov = await fetchCompanyOverview({ apiKey, symbol });
      await prisma.stock.update({
        where: { symbol },
        data: {
          assetType: normalizeText(ov.AssetType),
          name: normalizeText(ov.Name),
          description: normalizeText(ov.Description),
          exchange: normalizeText(ov.Exchange),
          sector: normalizeText(ov.Sector),
          industry: normalizeText(ov.Industry),
          marketCap: parseBigInt(ov.MarketCapitalization),
          overviewFetchedAt: new Date()
        }
      });
      ovOk += 1;
      logger.info({ symbol }, "Updated company overview");
    } catch (e: unknown) {
      ovFail += 1;
      logger.warn({ symbol, err: e instanceof Error ? e.message : String(e) }, "Company overview update failed");
    }

    await sleep(env.AV_MIN_MS_BETWEEN_CALLS);
  }

  logger.info({ dailyOk, dailyFail, ovOk, ovFail }, "Daily refresh complete");
}

main()
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


