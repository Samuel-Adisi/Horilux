import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Skeleton } from "./display";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("scrollbar-thin overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-line bg-surface-sunken">{children}</thead>;
}

export function TH({ className, align, ...props }: ThHTMLAttributes<HTMLTableCellElement> & { align?: "right" | "center" }) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-4 py-2 text-2xs font-bold uppercase tracking-[0.06em] text-ink-subtle",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    />
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-line">{children}</tbody>;
}

export function TR({
  className,
  onClick,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={cn(onClick && "cursor-pointer", "transition-colors hover:bg-surface-sunken", className)}
      {...props}
    />
  );
}

export function TD({ className, align, ...props }: TdHTMLAttributes<HTMLTableCellElement> & { align?: "right" | "center" }) {
  return (
    <td
      className={cn(
        "px-4 py-2.5 align-middle text-ink",
        align === "right" && "num text-right",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-6 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn("h-3", c === 0 ? "w-1/4" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  count,
  hasNext,
  hasPrevious,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}) {
  if (!hasNext && !hasPrevious) {
    return count > 0 ? (
      <div className="border-t border-line px-4 py-2.5 text-xs text-ink-subtle">
        {count} {count === 1 ? "record" : "records"}
      </div>
    ) : null;
  }
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2">
      <p className="num text-xs text-ink-subtle">
        {from}–{to} of {count}
      </p>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" disabled={!hasPrevious} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft />
          Prev
        </Button>
        <Button size="sm" variant="ghost" disabled={!hasNext} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
