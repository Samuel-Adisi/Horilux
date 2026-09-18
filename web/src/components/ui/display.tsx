import type { ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { Button } from "./button";

export type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "muted";

const toneDot: Record<Tone, string> = {
  neutral: "bg-ink-subtle",
  brand: "bg-brand",
  success: "bg-forest",
  warning: "bg-kokoda",
  danger: "bg-danger",
  muted: "bg-ink-faint",
};

const toneText: Record<Tone, string> = {
  neutral: "text-ink",
  brand: "text-brand-fg",
  success: "text-forest",
  warning: "text-kokoda-700",
  danger: "text-danger",
  muted: "text-ink-subtle",
};

const toneFill: Record<Tone, string> = {
  neutral: "bg-surface-hover text-ink-muted",
  brand: "bg-brand-50 text-brand-fg",
  success: "bg-forest-50 text-forest",
  warning: "bg-kokoda-50 text-kokoda-700",
  danger: "bg-danger-50 text-danger-700",
  muted: "bg-surface-sunken text-ink-subtle",
};

/** Status pill: tinted background, dot and label. Used across tables and headers. */
export function Status({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold",
        toneFill[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", toneDot[tone])} aria-hidden />
      {children}
    </span>
  );
}

/** Filled tag — for counts, categories and short attributes. */
export function Tag({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium",
        tone === "neutral" ? "border-line bg-surface-sunken text-ink-muted" : cn("border-transparent", toneFill[tone]),
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  flush,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Remove body padding (tables, lists). */
  flush?: boolean;
}) {
  return (
    <section className={cn("overflow-hidden rounded-lg border border-line bg-surface shadow-card", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-bold text-heading">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-ink-subtle">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(!flush && "p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Avatar({ name, size = "md", className }: { name?: string | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const s = size === "sm" ? "size-6 text-[10px]" : size === "lg" ? "size-10 text-sm" : "size-8 text-xs";
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-white", s, className)}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-sm bg-line/70", className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      {icon && <div className="mb-3 text-ink-faint [&_svg]:size-7">{icon}</div>}
      <p className="text-sm font-bold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-subtle">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Couldn't load this data",
  error,
  onRetry,
  className,
}: {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  const status = (error as { response?: { status?: number } } | undefined)?.response?.status;
  const description =
    status === 403
      ? "Your role doesn't have access to this. Ask an administrator if you need it."
      : status === 404
        ? "It may have been removed or the link is wrong."
        : "Something went wrong on our side or the connection dropped.";
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <AlertTriangle className="mb-3 size-6 text-danger" aria-hidden />
      <p className="text-sm font-bold text-ink">{status === 403 ? "No access" : title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-subtle">{description}</p>
      {onRetry && status !== 403 && status !== 404 && (
        <Button className="mt-4" size="sm" icon={<RotateCw />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const w = 96;
  const h = 28;
  const min = Math.min(...points);
  const range = Math.max(...points) - min || 1;
  const d = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - 2 - ((v - min) / range) * (h - 4)}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0 text-brand-fg" aria-hidden>
      <polyline points={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * KPI card: mono uppercase label, big figure, optional badge, trend chip and
 * sparkline. Every number passed in must come from real data.
 */
export function Stat({
  label,
  value,
  hint,
  tone,
  badge,
  trend,
  sparkline,
  onClick,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
  badge?: string;
  trend?: { label: string; up: boolean };
  sparkline?: number[];
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "min-w-0 rounded-lg border border-line bg-surface p-5 text-left shadow-card transition-colors",
        onClick && "cursor-pointer hover:border-brand",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate font-mono text-[11px] font-medium uppercase tracking-wider text-ink-subtle">{label}</p>
        {badge && <span className="shrink-0 rounded bg-surface-hover px-1.5 py-0.5 font-mono text-[10px] text-ink-subtle">{badge}</span>}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className={cn("num truncate font-mono text-2xl font-bold tracking-tight", tone ? toneText[tone] : "text-heading")}>{value}</p>
        {sparkline && <Sparkline points={sparkline} />}
      </div>
      {(hint || trend) && (
        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10.5px] font-semibold",
                trend.up ? "bg-forest-50 text-forest" : "bg-danger-50 text-danger",
              )}
            >
              {trend.up ? "▲" : "▼"} {trend.label}
            </span>
          )}
          {hint && <p className="truncate text-xs text-ink-subtle">{hint}</p>}
        </div>
      )}
    </Comp>
  );
}

/** Grid of KPI cards. */
export function StatStrip({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>{children}</div>;
}

export function DescriptionList({ items, columns = 2 }: { items: { label: string; value: ReactNode }[]; columns?: 2 | 3 | 4 }) {
  const cols = columns === 4 ? "sm:grid-cols-4" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-4", cols)}>
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="text-xs text-ink-subtle">{it.label}</dt>
          <dd className="mt-0.5 break-words text-sm font-medium text-ink">{it.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Horizontal share bar used in breakdowns (e.g. status counts). */
export function Meter({ value, max, tone = "brand" }: { value: number; max: number; tone?: Tone }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
      <div className={cn("h-full rounded-full", toneDot[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
