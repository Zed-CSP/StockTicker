import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../src/prisma.js";

function isoDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

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
  overviewFetchedAt: string | null; // ISO
};

type SeedDailyPrice = {
  symbol: string;
  date: string; // YYYY-MM-DD
  open: string | null;
  high: string | null;
  low: string | null;
  close: string; // decimal as string
  volume: string; // bigint as string
};

async function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = join(here, "..", "prisma", "seed-data");
  mkdirSync(outDir, { recursive: true });

  const stocks = await prisma.stock.findMany({
    orderBy: { symbol: "asc" }
  });

  const dailyPrices = await prisma.dailyPrice.findMany({
    orderBy: [{ symbol: "asc" }, { date: "desc" }]
  });

  const seedStocks: SeedStock[] = stocks.map((s) => ({
    symbol: s.symbol,
    name: s.name ?? null,
    assetType: s.assetType ?? null,
    description: s.description ?? null,
    exchange: s.exchange ?? null,
    sector: s.sector ?? null,
    industry: s.industry ?? null,
    marketCap: s.marketCap != null ? s.marketCap.toString() : null,
    logoUrl: s.logoUrl ?? null,
    overviewFetchedAt: s.overviewFetchedAt ? s.overviewFetchedAt.toISOString() : null
  }));

  const seedDaily: SeedDailyPrice[] = dailyPrices.map((p) => ({
    symbol: p.symbol,
    date: isoDateOnly(p.date),
    open: p.open != null ? p.open.toString() : null,
    high: p.high != null ? p.high.toString() : null,
    low: p.low != null ? p.low.toString() : null,
    close: p.close.toString(),
    volume: p.volume.toString()
  }));

  writeFileSync(join(outDir, "stocks.json"), JSON.stringify(seedStocks, null, 2), "utf-8");
  writeFileSync(join(outDir, "dailyPrices.json"), JSON.stringify(seedDaily, null, 2), "utf-8");

  // eslint-disable-next-line no-console
  console.log(
    `Exported ${seedStocks.length} stocks and ${seedDaily.length} daily price rows to ${outDir}`
  );
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


