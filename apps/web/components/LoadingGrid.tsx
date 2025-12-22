"use client";

export function LoadingGrid() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="cardFancy p-5">
          <div className="flex items-center justify-between">
            <div className="h-5 w-16 animate-pulse rounded bg-white/10" />
            <div className="h-6 w-14 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="mt-4 h-4 w-44 animate-pulse rounded bg-white/10" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-10 animate-pulse rounded-xl bg-white/10" />
            <div className="h-10 animate-pulse rounded-xl bg-white/10" />
          </div>
        </div>
      ))}
    </section>
  );
}


