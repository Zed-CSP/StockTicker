import { z } from "zod";

const AV_BASE = "https://www.alphavantage.co/query";

export type AvDailyBar = {
  date: string; // YYYY-MM-DD
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

function isAvThrottle(payload: any): boolean {
  const note = typeof payload?.Note === "string" ? payload.Note : "";
  const info = typeof payload?.Information === "string" ? payload.Information : "";
  return note.toLowerCase().includes("frequency") || info.toLowerCase().includes("frequency");
}

function isAvError(payload: any): boolean {
  return typeof payload?.["Error Message"] === "string";
}

export async function fetchTimeSeriesDaily(params: {
  apiKey: string;
  symbol: string;
  outputsize?: "compact" | "full";
}): Promise<{ bars: AvDailyBar[] }> {
  const url = new URL(AV_BASE);
  url.searchParams.set("function", "TIME_SERIES_DAILY");
  url.searchParams.set("symbol", params.symbol);
  url.searchParams.set("outputsize", params.outputsize ?? "compact");
  url.searchParams.set("apikey", params.apiKey);

  const res = await fetch(url.toString(), { headers: { accept: "application/json" } });
  const json: any = await res.json().catch(() => null);

  if (!res.ok) throw new Error(`AlphaVantage HTTP ${res.status}`);
  if (!json) throw new Error("AlphaVantage returned non-JSON");
  if (isAvThrottle(json)) throw new Error("AlphaVantage throttling (Note/Information)");
  if (isAvError(json)) throw new Error(`AlphaVantage error: ${json["Error Message"]}`);

  const series = json?.["Time Series (Daily)"];
  if (!series || typeof series !== "object") {
    throw new Error("AlphaVantage missing Time Series (Daily)");
  }

  const bars: AvDailyBar[] = Object.entries<any>(series).map(([date, v]) => ({
    date,
    open: String(v?.["1. open"] ?? ""),
    high: String(v?.["2. high"] ?? ""),
    low: String(v?.["3. low"] ?? ""),
    close: String(v?.["4. close"] ?? ""),
    volume: String(v?.["5. volume"] ?? "")
  }));

  // newest first
  bars.sort((a, b) => (a.date < b.date ? 1 : -1));
  return { bars };
}

const overviewSchema = z.object({
  Symbol: z.string().optional(),
  AssetType: z.string().optional(),
  Name: z.string().optional(),
  Description: z.string().optional(),
  Exchange: z.string().optional(),
  Sector: z.string().optional(),
  Industry: z.string().optional(),
  MarketCapitalization: z.string().optional()
});

export type AvOverview = z.infer<typeof overviewSchema>;

export async function fetchCompanyOverview(params: {
  apiKey: string;
  symbol: string;
}): Promise<AvOverview> {
  const url = new URL(AV_BASE);
  url.searchParams.set("function", "OVERVIEW");
  url.searchParams.set("symbol", params.symbol);
  url.searchParams.set("apikey", params.apiKey);

  const res = await fetch(url.toString(), { headers: { accept: "application/json" } });
  const json: any = await res.json().catch(() => null);

  if (!res.ok) throw new Error(`AlphaVantage HTTP ${res.status}`);
  if (!json) throw new Error("AlphaVantage returned non-JSON");
  if (isAvThrottle(json)) throw new Error("AlphaVantage throttling (Note/Information)");
  if (isAvError(json)) throw new Error(`AlphaVantage error: ${json["Error Message"]}`);

  const parsed = overviewSchema.safeParse(json);
  if (!parsed.success) throw new Error("AlphaVantage overview response not understood");
  return parsed.data;
}


