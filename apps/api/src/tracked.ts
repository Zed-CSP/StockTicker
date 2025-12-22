export function parseTrackedSymbols(raw: string): string[] {
  const symbols = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  return Array.from(new Set(symbols));
}


