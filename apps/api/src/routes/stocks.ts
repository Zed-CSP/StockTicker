import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { parseTrackedSymbols } from "../tracked.js";
import { getEnv } from "../env.js";

const env = getEnv();

const symbolParamSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .max(12)
    .regex(/^[A-Za-z0-9._-]+$/)
    .transform((s) => s.toUpperCase())
});

function safeNumber(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export const stocksRouter = Router();

stocksRouter.get("/", async (_req, res) => {
  const symbols = parseTrackedSymbols(env.TRACKED_SYMBOLS);

  // ensure base rows exist so homepage always shows 15+ tickers even before the first cron run
  await prisma.stock.createMany({
    data: symbols.map((symbol) => ({ symbol })),
    skipDuplicates: true
  });

  const stocks = await prisma.stock.findMany({
    where: { symbol: { in: symbols } },
    orderBy: { symbol: "asc" },
    select: { symbol: true, name: true, logoUrl: true }
  });

  const items = await Promise.all(
    stocks.map(async (s) => {
      const lastTwo = await prisma.dailyPrice.findMany({
        where: { symbol: s.symbol },
        orderBy: { date: "desc" },
        take: 2,
        select: { date: true, close: true }
      });

      const latest = lastTwo[0];
      const prev = lastTwo[1];

      const latestClose = safeNumber(latest?.close);
      const prevClose = safeNumber(prev?.close);
      const dayChangePct =
        latestClose != null && prevClose != null && prevClose !== 0
          ? ((latestClose - prevClose) / prevClose) * 100
          : null;

      return {
        symbol: s.symbol,
        name: s.name ?? null,
        latestDate: latest ? latest.date.toISOString().slice(0, 10) : null,
        latestClose,
        dayChangePct,
        logoUrl: s.logoUrl ?? null
      };
    })
  );

  res.json(items);
});

stocksRouter.get("/:symbol", async (req, res) => {
  const parsed = symbolParamSchema.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid symbol" });

  const symbol = parsed.data.symbol;
  const symbols = parseTrackedSymbols(env.TRACKED_SYMBOLS);
  if (!symbols.includes(symbol)) {
    return res.status(404).json({ error: "Symbol not tracked" });
  }

  const stock = await prisma.stock.findUnique({
    where: { symbol },
    select: {
      symbol: true,
      assetType: true,
      name: true,
      description: true,
      exchange: true,
      sector: true,
      industry: true,
      marketCap: true,
      logoUrl: true
    }
  });

  const prices = await prisma.dailyPrice.findMany({
    where: { symbol },
    orderBy: { date: "desc" },
    take: 120,
    select: { date: true, close: true, volume: true }
  });

  const mapped = prices.map((p, idx) => {
    const close = safeNumber(p.close) ?? 0;
    const prevClose = safeNumber(prices[idx + 1]?.close);
    const changePct =
      prevClose != null && prevClose !== 0 ? ((close - prevClose) / prevClose) * 100 : null;

    return {
      date: p.date.toISOString().slice(0, 10),
      close,
      volume: Number(p.volume),
      changePct
    };
  });

  res.json({
    company: {
      symbol,
      assetType: stock?.assetType ?? null,
      name: stock?.name ?? null,
      description: stock?.description ?? null,
      exchange: stock?.exchange ?? null,
      sector: stock?.sector ?? null,
      industry: stock?.industry ?? null,
      marketCap: stock?.marketCap != null ? stock.marketCap.toString() : null,
      logoUrl: stock?.logoUrl ?? null
    },
    prices: mapped
  });
});


