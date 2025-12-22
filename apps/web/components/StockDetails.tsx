"use client";

import { useEffect, useMemo, useState } from "react";
import type { StockDetailsResponse } from "@/lib/types";
import { PriceChart } from "@/components/PriceChart";

function displayOrNA(v: string | null | undefined) {
  if (!v) return "N/A";
  return v;
}

function formatUsd(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function formatNum(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "N/A";
  return new Intl.NumberFormat("en-US").format(v);
}

function formatPct(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "N/A";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

export function StockDetails({ symbol }: { symbol: string }) {
  const [data, setData] = useState<StockDetailsResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/stocks/${encodeURIComponent(symbol)}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as StockDetailsResponse;
      })
      .then(setData)
      .catch((e: unknown) => {
        if ((e as any)?.name === "AbortError") return;
        setErr(e instanceof Error ? e.message : "Failed to load");
      });

    return () => controller.abort();
  }, [symbol]);

  const chartData = useMemo(() => {
    if (!data) return null;
    // chart oldest->newest
    return [...data.prices]
      .slice()
      .reverse()
      .map((p) => ({ date: p.date, close: p.close }));
  }, [data]);

  if (err) {
    return (
      <section className="card p-6">
        <div className="text-sm font-medium text-red-300">Failed to load</div>
        <div className="muted mt-1 text-sm">{err}</div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="card p-6">
        <div className="h-5 w-44 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-64 w-full animate-pulse rounded bg-white/10" />
      </section>
    );
  }

  const c = data.company;

  return (
    <>
      <section className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold tracking-tight">{c.symbol}</div>
            <div className="muted mt-1 text-sm">{displayOrNA(c.name)}</div>
          </div>
          {c.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.logoUrl} alt={`${c.symbol} logo`} className="h-10 w-auto opacity-90" />
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-1 text-sm">
            <div>
              <span className="muted">Asset Type:</span> {displayOrNA(c.assetType)}
            </div>
            <div>
              <span className="muted">Exchange:</span> {displayOrNA(c.exchange)}
            </div>
            <div>
              <span className="muted">Sector:</span> {displayOrNA(c.sector)}
            </div>
            <div>
              <span className="muted">Industry:</span> {displayOrNA(c.industry)}
            </div>
            <div>
              <span className="muted">Market Cap:</span> {displayOrNA(c.marketCap)}
            </div>
          </div>
          <div className="muted text-sm leading-relaxed">{displayOrNA(c.description)}</div>
        </div>
      </section>

      {chartData && chartData.length > 1 ? (
        <section className="card p-6">
          <div className="mb-4 text-sm font-medium">Close Price History</div>
          <PriceChart data={chartData} />
        </section>
      ) : null}

      <section className="card overflow-hidden">
        <div className="border-b border-white/10 p-6">
          <div className="text-sm font-medium">Daily Prices</div>
          <div className="muted mt-1 text-xs">
            Date, close, volume, and % change vs previous trading day
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-zinc-950/80 backdrop-blur">
              <tr className="border-b border-white/10 text-xs text-zinc-400">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Close</th>
                <th className="px-6 py-3 font-medium">Volume</th>
                <th className="px-6 py-3 font-medium">% Change</th>
              </tr>
            </thead>
            <tbody>
              {data.prices.map((p) => (
                <tr key={p.date} className="border-b border-white/5">
                  <td className="px-6 py-3">{p.date}</td>
                  <td className="px-6 py-3">{formatUsd(p.close)}</td>
                  <td className="px-6 py-3">{formatNum(p.volume)}</td>
                  <td className="px-6 py-3">{formatPct(p.changePct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}


