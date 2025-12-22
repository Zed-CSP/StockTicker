export const dynamic = "force-dynamic";

function getApiBaseUrl() {
  const v = process.env.API_BASE_URL;
  if (!v) throw new Error("Missing API_BASE_URL (server env var)");
  return v.replace(/\/$/, "");
}

export async function GET(_req: Request, ctx: { params: Promise<{ symbol: string }> }) {
  const apiBase = getApiBaseUrl();
  const { symbol } = await ctx.params;

  const res = await fetch(`${apiBase}/api/stocks/${encodeURIComponent(symbol)}`, {
    headers: { accept: "application/json" },
    cache: "no-store"
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json"
    }
  });
}


