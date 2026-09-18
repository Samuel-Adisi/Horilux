import { useState, type ReactNode } from "react";
import { Bath, BedDouble, Building2, CalendarDays, MapPin, Ruler } from "lucide-react";
import { PropertyStatus } from "@/components/domain/status";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import type { PropertyListItem } from "../api";

function Pill({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface-sunken px-2.5 py-1 text-[11.5px] font-medium capitalize text-ink-muted">
      {icon && <span className="text-ink-subtle [&_svg]:size-3">{icon}</span>}
      {children}
    </span>
  );
}

/** Listing row with photo, status pill and attribute pills (the original listings layout). */
export function PropertyRow({ property: p, onClick }: { property: PropertyListItem; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);
  const sqft = p.sqft != null ? Number(p.sqft) : null;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full cursor-pointer gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-hover/60"
      >
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md bg-surface-hover sm:h-28 sm:w-40">
          {p.image_url && !imgError ? (
            <img src={p.image_url} alt="" loading="lazy" onError={() => setImgError(true)} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-faint">
              <Building2 className="size-7" strokeWidth={1.5} />
            </div>
          )}
          <span className="absolute left-2 top-2 shadow-sm">
            <PropertyStatus status={p.status} />
          </span>
        </div>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate text-[14px] font-semibold text-heading">{p.title}</p>
            <p className="num shrink-0 font-mono text-[14px] font-bold text-brand-fg">
              {formatMoney(p.price, p.currency)}
              {p.listing_type === "rent" && p.rental_period && (
                <span className="font-sans text-xs font-medium text-ink-subtle"> / {p.rental_period.replace("ly", "")}</span>
              )}
            </p>
          </div>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-ink-subtle">
            <MapPin className="size-3" />
            {[p.location, p.region].filter(Boolean).join(", ")}
            {p.agent_name && <span className="hidden sm:inline"> · {p.agent_name}</span>}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Pill>{p.property_type}</Pill>
            <Pill>{p.listing_type === "rent" ? "For rent" : "For sale"}</Pill>
            {p.bedrooms != null && <Pill icon={<BedDouble />}>{p.bedrooms}</Pill>}
            {p.bathrooms != null && <Pill icon={<Bath />}>{p.bathrooms}</Pill>}
            {sqft != null && !Number.isNaN(sqft) && <Pill icon={<Ruler />}>{formatNumber(sqft)} sqft</Pill>}
            <span className="hidden sm:contents">
              <Pill icon={<CalendarDays />}>{formatDate(p.created_at)}</Pill>
            </span>
          </div>
        </div>
      </button>
    </li>
  );
}
