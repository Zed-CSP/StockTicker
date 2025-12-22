"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

export function PriceChart({ data }: { data: Array<{ date: string; close: number }> }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            minTickGap={28}
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={48}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(10,10,10,0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12
            }}
            labelStyle={{ color: "rgba(255,255,255,0.65)" }}
            itemStyle={{ color: "rgba(255,255,255,0.85)" }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="rgba(99,102,241,0.9)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


