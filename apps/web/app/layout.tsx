import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Ticker",
  description: "Cached stock overview and daily prices (AlphaVantage)."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="appShell min-h-screen">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-2xl font-semibold tracking-tight">Stock Ticker</div>
                <div className="muted text-sm">15+ tracked symbols, refreshed daily</div>
              </div>
              <div className="muted text-sm">
                Powered by cached AlphaVantage data
                <span className="mx-2 text-white/15">•</span>
                <span className="text-zinc-300">API-safe</span>
              </div>
            </header>
            {children}
            <footer className="mt-12 border-t border-white/10 pt-6 text-xs text-zinc-500">
              Data is refreshed daily and served from a cache to stay within API limits.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}


