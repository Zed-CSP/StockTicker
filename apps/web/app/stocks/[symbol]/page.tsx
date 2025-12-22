import Link from "next/link";
import { StockDetails } from "@/components/StockDetails";

export default async function StockDetailsPage({
  params
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <Link className="muted text-sm hover:text-zinc-200" href="/">
          ← Back
        </Link>
        <div className="muted text-sm">/stocks/{symbol}</div>
      </div>

      <StockDetails symbol={symbol} />
    </main>
  );
}


