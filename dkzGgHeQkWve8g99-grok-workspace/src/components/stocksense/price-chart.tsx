import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money } from "@/lib/stocksense/format";
import type { SeriesPoint } from "@/lib/stocksense/types";

export function PriceChart({ series, currency }: { series: SeriesPoint[]; currency: string }) {
  if (series.length < 2) {
    return <p className="text-sm text-muted">Price history was not available for a chart.</p>;
  }
  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="d" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value) => [money(typeof value === "number" ? value : Number(value), currency), "Close"]}
            labelFormatter={(label) => String(label)}
            contentStyle={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-line)",
              borderRadius: 12,
              color: "var(--color-ink)",
            }}
            labelStyle={{ color: "var(--color-muted)" }}
          />
          <Area
            type="monotone"
            dataKey="c"
            stroke="var(--color-accent)"
            fill="var(--color-accent)"
            fillOpacity={0.16}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
