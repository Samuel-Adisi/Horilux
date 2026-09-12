import { useState } from "react";

function StatIcon({ d, ...props }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={d} />
    </svg>
  );
}

const BED_ICON = "M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18v2M21 18v2M3 12V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4M7 6v6";
const BATH_ICON = "M4 12h16a1 1 0 0 1 1 1v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2a1 1 0 0 1 1-1ZM6 12V6a2 2 0 0 1 3.5-1.3M9 6a2 2 0 1 1 4 0v6";
const AREA_ICON = "M4 4h6v6H4V4ZM14 14h6v6h-6v-6ZM4 20h6M4 14v6M14 4h6v6M14 4v6M20 10V4";
const PIN_ICON = "M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z";
const CALENDAR_ICON = "M8 2v4M16 2v4M3.5 9h17M4 4h16a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z";

export type PropertyCardData = {
  id: string;
  title: string;
  location: string;
  property_type: string;
  listing_type: "sale" | "rent";
  price: number | string;
  bedrooms?: number;
  bathrooms?: number;
  image_url?: string;
  region?: string;
  rental_period?: "daily" | "monthly" | "yearly";
  sqft?: number | string;
  amenities?: string[];
  status?: string;
  created_at?: string;
};

const STATUS_STYLES: Record<string, { bg: string; dot: string; label: string }> = {
  draft: { bg: "bg-white/90 text-[#8A8578]", dot: "bg-[#8A8578]", label: "Draft" },
  onboarding: { bg: "bg-white/90 text-[#8A8578]", dot: "bg-[#8A8578]", label: "Onboarding" },
  pending_verification: { bg: "bg-white/90 text-[#B98A1E]", dot: "bg-[#E8A93B]", label: "Pending" },
  verified: { bg: "bg-white/90 text-[#2E7D5B]", dot: "bg-[#3DAD7F]", label: "Verified" },
  pending_approval: { bg: "bg-white/90 text-[#B98A1E]", dot: "bg-[#E8A93B]", label: "Pending" },
  marketing_ready: { bg: "bg-white/90 text-[#2E5DAD]", dot: "bg-[#4A7FD9]", label: "Ready" },
  published: { bg: "bg-white/90 text-[#2E7D5B]", dot: "bg-[#3DAD7F]", label: "Available" },
  under_offer: { bg: "bg-white/90 text-[#B98A1E]", dot: "bg-[#E8A93B]", label: "Under offer" },
  sold_rented: { bg: "bg-white/90 text-[#8A2E2E]", dot: "bg-[#C25050]", label: "Sold/Rented" },
  archived: { bg: "bg-white/90 text-[#8A8578]", dot: "bg-[#8A8578]", label: "Archived" },
};

function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StatPill({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-[#E4E1D9] bg-[#FAF9F6] px-2.5 py-1 text-[11.5px] font-medium text-[#3E3A31]">
      <span className="text-[#8A8578]">
        <StatIcon d={icon} />
      </span>
      {children}
    </span>
  );
}

export function PropertyCard({
  property,
  onClick,
}: {
  property: PropertyCardData;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const price = Number(property.price);
  const formattedPrice = Number.isNaN(price)
    ? property.price
    : price.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const sqftNum = property.sqft != null ? Number(property.sqft) : null;
  const statusInfo = property.status ? STATUS_STYLES[property.status] : null;
  const dateLabel = formatDate(property.created_at);

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer gap-4 border-b border-[#EFEDE6] px-5 py-4 last:border-0 hover:bg-[#F7F6F3]"
    >
      <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-[6px] bg-[#EFEDE6]">
        {property.image_url && !imgError ? (
          <img
            src={property.image_url}
            alt={property.title}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#B5AF9E]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 21V9l8-6 8 6v12h-5v-7H9v7H4Z" />
            </svg>
          </div>
        )}
        {statusInfo && (
          <span className={`absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${statusInfo.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        )}
      </div>

      <div className="flex-1 py-1">
        <p className="text-[13.5px] font-medium text-[#17131F]">{property.title}</p>
        <p className="mt-1 flex items-center gap-1 text-[12px] text-[#8A8578]">
          <StatIcon d={PIN_ICON} width={12} height={12} />
          {property.location}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-[#E4E1D9] bg-[#FAF9F6] px-2.5 py-1 text-[11.5px] font-medium capitalize text-[#3E3A31]">
            {property.property_type}
          </span>
          <span className="rounded-full border border-[#E4E1D9] bg-[#FAF9F6] px-2.5 py-1 text-[11.5px] font-medium capitalize text-[#3E3A31]">
            {property.listing_type}
          </span>
          {property.bedrooms != null && <StatPill icon={BED_ICON}>{property.bedrooms}</StatPill>}
          {property.bathrooms != null && <StatPill icon={BATH_ICON}>{property.bathrooms}</StatPill>}
          {sqftNum != null && !Number.isNaN(sqftNum) && (
            <StatPill icon={AREA_ICON}>{sqftNum.toLocaleString()} sqft</StatPill>
          )}
          {dateLabel && <StatPill icon={CALENDAR_ICON}>{dateLabel}</StatPill>}
        </div>

        <p className="mt-2.5 text-[13px] font-semibold text-[#240270]">{formattedPrice}</p>
      </div>
    </div>
  );
}
