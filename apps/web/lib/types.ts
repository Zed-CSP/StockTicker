export type StockListItem = {
  symbol: string;
  name: string | null;
  latestDate: string | null;
  latestClose: number | null;
  dayChangePct: number | null;
  logoUrl: string | null;
};

export type StockDetailsResponse = {
  company: {
    symbol: string;
    assetType: string | null;
    name: string | null;
    description: string | null;
    exchange: string | null;
    sector: string | null;
    industry: string | null;
    marketCap: string | null;
    logoUrl: string | null;
  };
  prices: Array<{
    date: string;
    close: number;
    volume: number;
    changePct: number | null;
  }>;
};


