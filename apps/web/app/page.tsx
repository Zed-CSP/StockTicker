import { StockGrid } from "@/components/StockGrid";

export default function HomePage() {
  return (
    <main className="space-y-6">
      <section className="cardFancy p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-3xl font-semibold tracking-tight">
              A cached, API-safe stock dashboard
            </div>
            <p className="muted mt-2 max-w-2xl text-sm leading-relaxed">
              Click any ticker to see company overview and daily price history, including day-over-day
              percentage change. Data is refreshed once per day and served from Postgres to stay within
              AlphaVantage limits.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-xl font-semibold leading-none">15</div>
              <div className="muted mt-1 text-xs">Tracked</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-xl font-semibold leading-none">Daily</div>
              <div className="muted mt-1 text-xs">Refresh</div>
            </div>
          </div>
        </div>
      </section>

      <StockGrid />
    </main>
  );
}


