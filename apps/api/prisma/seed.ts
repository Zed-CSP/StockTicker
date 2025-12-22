import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../src/prisma.js";

type SeedStock = {
  symbol: string;
  name: string | null;
  assetType: string | null;
  description: string | null;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  marketCap: string | null;
  logoUrl: string | null;
  overviewFetchedAt: string | null;
};

type SeedDailyPrice = {
  symbol: string;
  date: string; // YYYY-MM-DD
  open: string | null;
  high: string | null;
  low: string | null;
  close: string;
  volume: string;
};

function dateOnlyUtc(yyyyMmDd: string): Date {
  return new Date(`${yyyyMmDd}T00:00:00.000Z`);
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const base = join(here, "seed-data");
  const stocksPath = join(base, "stocks.json");
  const dailyPath = join(base, "dailyPrices.json");

  const stocks = JSON.parse(readFileSync(stocksPath, "utf-8")) as SeedStock[];
  const daily = JSON.parse(readFileSync(dailyPath, "utf-8")) as SeedDailyPrice[];

  await prisma.stock.createMany({
    data: stocks.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      assetType: s.assetType,
      description: s.description,
      exchange: s.exchange,
      sector: s.sector,
      industry: s.industry,
      marketCap: s.marketCap != null ? BigInt(s.marketCap) : null,
      logoUrl: s.logoUrl,
      overviewFetchedAt: s.overviewFetchedAt ? new Date(s.overviewFetchedAt) : null
    })),
    skipDuplicates: true
  });

  // Upsert to make re-seeding idempotent.
  for (const p of daily) {
    const date = dateOnlyUtc(p.date);
    await prisma.dailyPrice.upsert({
      where: { symbol_date: { symbol: p.symbol, date } },
      create: {
        symbol: p.symbol,
        date,
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close,
        volume: BigInt(p.volume)
      },
      update: {
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close,
        volume: BigInt(p.volume)
      }
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${stocks.length} stocks and ${daily.length} daily price rows`);
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


