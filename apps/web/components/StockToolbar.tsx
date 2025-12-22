"use client";

import clsx from "clsx";

export type SortMode = "symbol" | "changeDesc" | "changeAsc";

export function StockToolbar({
  query,
  setQuery,
  sort,
  setSort,
  count,
  visible
}: {
  query: string;
  setQuery: (v: string) => void;
  sort: SortMode;
  setSort: (v: SortMode) => void;
  count: number;
  visible: number;
}) {
  return (
    <section className="cardFancy p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium">Tracked Stocks</div>
          <div className="muted mt-0.5 text-xs">
            Showing {visible} of {count}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symbol or name…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none ring-0 transition focus:border-indigo-400/30 focus:bg-white/[0.03] sm:w-72"
            />
          </div>

          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] p-1">
            <button
              onClick={() => setSort("symbol")}
              className={clsx(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                sort === "symbol" ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              )}
              type="button"
            >
              A–Z
            </button>
            <button
              onClick={() => setSort("changeDesc")}
              className={clsx(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                sort === "changeDesc"
                  ? "bg-white/10 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
              type="button"
            >
              Gainers
            </button>
            <button
              onClick={() => setSort("changeAsc")}
              className={clsx(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                sort === "changeAsc"
                  ? "bg-white/10 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
              type="button"
            >
              Losers
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


