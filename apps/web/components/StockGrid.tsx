"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import type { StockListItem } from "@/lib/types";
import { LoadingGrid } from "@/components/LoadingGrid";
import { StockToolbar, type SortMode } from "@/components/StockToolbar";

function formatUsd(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function formatPct(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "N/A";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function initialsFor(symbol: string) {
  return symbol.slice(0, 2).toUpperCase();
}

export function StockGrid() {
  const [data, setData] = useState<StockListItem[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("symbol");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/stocks`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as StockListItem[];
      })
      .then(setData)
      .catch((e: unknown) => {
        if ((e as any)?.name === "AbortError") return;
        setErr(e instanceof Error ? e.message : "Failed to load");
      });

    return () => controller.abort();
  }, []);

  const filteredSorted = useMemo(() => {
    if (!data) return null;
    const q = query.trim().toLowerCase();
    const filtered = q
      ? data.filter((s) => {
          const name = (s.name ?? "").toLowerCase();
          return s.symbol.toLowerCase().includes(q) || name.includes(q);
        })
      : data;

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "symbol") return a.symbol.localeCompare(b.symbol);

      const av = a.dayChangePct ?? (sort === "changeAsc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
      const bv = b.dayChangePct ?? (sort === "changeAsc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);

      return sort === "changeDesc" ? bv - av : av - bv;
    });

    return sorted;
  }, [data, query, sort]);

  if (err) {
    return (
      <section className="cardFancy p-6">
        <div className="text-sm font-medium text-red-300">Failed to load stocks</div>
        <div className="muted mt-1 text-sm">{err}</div>
      </section>
    );
  }

  if (!filteredSorted) return <LoadingGrid />;

  return (
    <div className="space-y-4">
      <StockToolbar
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        count={data?.length ?? 0}
        visible={filteredSorted.length}
      />

      {filteredSorted.length === 0 ? (
        <section className="cardFancy p-6">
          <div className="text-sm font-medium">No matches</div>
          <div className="muted mt-1 text-sm">Try a different search term.</div>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSorted.map((s) => (
            <Link
              key={s.symbol}
              href={`/stocks/${encodeURIComponent(s.symbol)}`}
              className="cardFancy group p-5 transition hover:bg-white/[0.04]"
            >
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.logoUrl}
                      alt={`${s.symbol} logo`}
                      className="h-10 w-10 rounded-xl border border-white/10 bg-black/20 object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-zinc-200">
                      {initialsFor(s.symbol)}
                    </div>
                  )}
                  <div>
                    <div className="text-base font-semibold tracking-tight">{s.symbol}</div>
                    <div className="muted mt-0.5 text-sm">{s.name ?? "N/A"}</div>
                  </div>
                </div>

                <div
                  className={clsx(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    s.dayChangePct == null
                      ? "bg-white/5 text-zinc-300"
                      : s.dayChangePct >= 0
                        ? "bg-emerald-500/10 text-emerald-200"
                        : "bg-rose-500/10 text-rose-200"
                  )}
                >
                  {formatPct(s.dayChangePct)}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.015] px-3 py-2.5">
                  <div className="muted text-xs">Latest close</div>
                  <div className="mt-1 text-base font-semibold">{formatUsd(s.latestClose)}</div>
                </div>
                <div className="rounded-xl bg-white/[0.015] px-3 py-2.5">
                  <div className="muted text-xs">Updated</div>
                  <div className="mt-1 text-sm font-medium text-zinc-200">{s.latestDate ?? "N/A"}</div>
                </div>
              </div>

              <div className="muted mt-4 text-xs">
                View details <span className="transition group-hover:translate-x-0.5 inline-block">→</span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}


