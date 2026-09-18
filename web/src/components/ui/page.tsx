import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Page({ children, className, width = "wide" }: { children: ReactNode; className?: string; width?: "wide" | "narrow" }) {
  return (
    <div className={cn("mx-auto w-full px-4 py-6 sm:px-6 lg:px-8", width === "narrow" ? "max-w-3xl" : "max-w-[1400px]", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  back,
  meta,
  count,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
  meta?: ReactNode;
  /** Small mono badge next to the title, e.g. "53 total". */
  count?: ReactNode;
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link
          to={back.to}
          className="mb-3 inline-flex items-center gap-1 text-[13px] font-medium text-ink-muted transition-colors hover:text-brand-fg"
        >
          <ChevronLeft className="size-3.5" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-heading">{title}</h1>
            {count != null && (
              <span className="inline-flex items-center rounded border border-brand/15 bg-brand/5 px-2 py-0.5 font-mono text-[11px] font-medium text-brand-fg">
                {count}
              </span>
            )}
          </div>
          {description && <p className="mt-1 text-sm text-ink-subtle">{description}</p>}
          {meta && <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-center", className)}>{children}</div>;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 w-full rounded border border-line bg-surface-sunken pl-8 pr-7 text-xs font-medium text-ink placeholder:text-ink-faint transition focus:border-brand focus:bg-field focus:outline-none focus:ring-2 focus:ring-brand/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-subtle hover:text-ink"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/** Filter chips — the quick status switcher above tables. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div className={cn("scrollbar-thin flex gap-1.5 overflow-x-auto", className)} role="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-colors",
              active ? "bg-brand text-white shadow-raise" : "bg-surface-hover text-ink-subtle hover:text-heading",
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn("font-mono text-[10.5px]", active ? "text-white/75" : "text-ink-faint")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
