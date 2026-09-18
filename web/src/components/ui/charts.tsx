import type { ReactNode } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Chart palette — validated with the dataviz palette checker (lightness band,
 * chroma floor, CVD separation, contrast on white). Slot order is fixed.
 */
const SERIES = ["#5B3BB5", "#9A8F2E"] as const;
const GRID = "#ECEAE4";
const AXIS_TEXT = "#8A8693";

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5 text-xs text-ink-muted">
          <svg width="16" height="8" aria-hidden>
            <line x1="0" y1="4" x2="16" y2="4" stroke={i.color} strokeWidth="2" strokeDasharray={i.dashed ? "4 3" : undefined} />
          </svg>
          {i.label}
        </li>
      ))}
    </ul>
  );
}

interface TrendPoint {
  label: string;
  [key: string]: string | number;
}

/** Up to two series on one axis. Current period solid, comparison dashed. */
export function TrendChart({
  data,
  series,
  height = 260,
  format = formatCompact,
}: {
  data: TrendPoint[];
  series: { key: string; label: string; dashed?: boolean }[];
  height?: number;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="mb-3">
        <Legend items={series.map((s, i) => ({ label: s.label, color: SERIES[i], dashed: s.dashed }))} />
      </div>
      <div style={{ height }} role="img" aria-label={`Line chart: ${series.map((s) => s.label).join(" vs ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: GRID }} tick={{ fill: AXIS_TEXT, fontSize: 11 }} dy={6} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: AXIS_TEXT, fontSize: 11 }} width={48} tickFormatter={(v) => format(Number(v))} />
            <Tooltip
              cursor={{ stroke: "#B4B0BA", strokeWidth: 1 }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded border border-line bg-surface px-3 py-2 shadow-pop">
                    <p className="mb-1 text-xs font-bold text-ink">{label}</p>
                    {payload.map((p, i) => (
                      <p key={String(p.dataKey)} className="flex items-center justify-between gap-6 text-xs">
                        <span className="flex items-center gap-1.5 text-ink-muted">
                          <span className="size-2 rounded-full" style={{ background: SERIES[i] }} />
                          {series.find((s) => s.key === p.dataKey)?.label}
                        </span>
                        <span className="num font-semibold text-ink">{format(Number(p.value))}</span>
                      </p>
                    ))}
                  </div>
                ) : null
              }
            />
            {series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={SERIES[i]}
                strokeWidth={2}
                strokeDasharray={s.dashed ? "5 4" : undefined}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Horizontal bars as an HTML list: label, bar, value. Works as its own table
 * view — every value is printed, so nothing depends on colour or hover.
 */
export function BarList({
  items,
  format = (v: number) => v.toLocaleString("en-GH"),
  emptyText = "No data yet.",
  className,
}: {
  items: { key: string; label: ReactNode; value: number; hint?: ReactNode }[];
  format?: (v: number) => string;
  emptyText?: string;
  className?: string;
}) {
  const max = Math.max(0, ...items.map((i) => i.value));
  if (items.length === 0 || max === 0) return <p className="py-4 text-sm text-ink-subtle">{emptyText}</p>;
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((i) => (
        <li key={i.key} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 sm:grid-cols-[minmax(0,11rem)_1fr_auto]">
          <span className="truncate text-sm text-ink-muted">{i.label}</span>
          <span className="h-2 overflow-hidden rounded-r bg-surface-hover">
            <span className="block h-full rounded-r" style={{ width: `${(i.value / max) * 100}%`, background: SERIES[0] }} />
          </span>
          <span className="num min-w-[3.5rem] text-right text-sm font-semibold text-ink">
            {format(i.value)}
            {i.hint && <span className="block text-2xs font-normal text-ink-subtle">{i.hint}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
