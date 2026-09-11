import { useMemo, useState } from "react";
import { RangeSlider } from "./RangeSlider";
import { GHANA_REGIONS } from "../constants/ghana-regions";

export type PropertyFilters = {
  propertyType: string | null;
  listingType: "sale" | "rent";
  rentalPeriod: "daily" | "monthly" | "yearly" | null;
  region: string | null;
  priceMin: number;
  priceMax: number;
  sqftMin: number;
  sqftMax: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
};

export const DEFAULT_FILTERS: PropertyFilters = {
  propertyType: null,
  listingType: "sale",
  rentalPeriod: null,
  region: null,
  priceMin: 0,
  priceMax: 1_000_000,
  sqftMin: 0,
  sqftMax: 10_000,
  bedrooms: 0,
  bathrooms: 0,
  amenities: [],
};

const PROPERTY_TYPES: { value: string; label: string; d: string }[] = [
  { value: "house", label: "House", d: "M3 11.5 12 4l9 7.5M5 10v9.5a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" },
  { value: "apartment", label: "Apartment", d: "M6 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M9 8h.01M9 12h.01M9 16h.01M14 21v-6h6v6M17 3v3" },
  { value: "commercial", label: "Commercial", d: "M4 21V9l8-6 8 6v12M9 21v-6h6v6M4 9h16" },
  { value: "land", label: "Land plot", d: "M3 20h18M5 20V10l7-6 7 6v10M9 20v-5h6v5" },
];

const AMENITIES: { value: string; label: string }[] = [
  { value: "parking", label: "Parking slot" },
  { value: "pets", label: "Pet allowed" },
  { value: "furnished", label: "Furnished" },
  { value: "security", label: "24/7 security" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-[12px] font-medium text-[#3E3A31]">{children}</p>;
}

function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#D8D3C6] text-[#3E3A31] hover:border-[#240270] hover:text-[#240270] disabled:opacity-40"
        disabled={value <= min}
      >
        −
      </button>
      <span className="w-4 text-center text-[13px] font-medium text-[#17131F]">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#D8D3C6] text-[#3E3A31] hover:border-[#240270] hover:text-[#240270]"
      >
        +
      </button>
    </div>
  );
}

export function PropertyFiltersPanel({
  filters,
  onChange,
  onClose,
  onApply,
}: {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onClose: () => void;
  onApply?: (filters: PropertyFilters) => void;
}) {
  const [draft, setDraft] = useState(filters);
  const [regionQuery, setRegionQuery] = useState("");

  const update = (patch: Partial<PropertyFilters>) => setDraft((d) => ({ ...d, ...patch }));

  const regionMatches = useMemo(() => {
    if (!regionQuery) return GHANA_REGIONS;
    return GHANA_REGIONS.filter((r) => r.toLowerCase().includes(regionQuery.toLowerCase()));
  }, [regionQuery]);

  const toggleAmenity = (value: string) => {
    update({
      amenities: draft.amenities.includes(value)
        ? draft.amenities.filter((a) => a !== value)
        : [...draft.amenities, value],
    });
  };

  const activeCount =
    (draft.propertyType ? 1 : 0) +
    (draft.region ? 1 : 0) +
    (draft.rentalPeriod ? 1 : 0) +
    (draft.bedrooms ? 1 : 0) +
    (draft.bathrooms ? 1 : 0) +
    draft.amenities.length +
    (draft.priceMin !== DEFAULT_FILTERS.priceMin || draft.priceMax !== DEFAULT_FILTERS.priceMax ? 1 : 0) +
    (draft.sqftMin !== DEFAULT_FILTERS.sqftMin || draft.sqftMax !== DEFAULT_FILTERS.sqftMax ? 1 : 0);

  const handleReset = () => {
    setDraft(DEFAULT_FILTERS);
    setRegionQuery("");
  };

  const handleApply = () => {
    onChange(draft);
    onApply?.(draft);
    onClose();
  };

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-[8px] border border-[#E4E1D9] bg-white shadow-[0_2px_12px_rgba(23,19,31,0.06)]">
      <div className="flex items-center justify-between border-b border-[#EFEDE6] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#240270] text-white">
            <Icon d="M4 6h16M7 12h10M10 18h4" />
          </span>
          <p className="text-[14px] font-semibold text-[#17131F]">Filters</p>
          {activeCount > 0 && (
            <span className="rounded-full bg-[#EAE3F7] px-1.5 py-0.5 text-[10.5px] font-semibold text-[#240270]">
              {activeCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-[#8A8578] hover:text-[#17131F]" aria-label="Close filters">
          <Icon d="M18 6 6 18M6 6l12 12" />
        </button>
      </div>

      <div className="max-h-[72vh] overflow-y-auto px-5 py-4">
        {/* Property type */}
        <div className="pb-5">
          <SectionLabel>Property type</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {PROPERTY_TYPES.map((t) => {
              const active = draft.propertyType === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => update({ propertyType: active ? null : t.value })}
                  className={`flex items-center gap-2 rounded-[6px] border px-3 py-2.5 text-[13px] font-medium transition-colors ${
                    active
                      ? "border-[#240270] bg-[#EAE3F7] text-[#240270]"
                      : "border-[#D8D3C6] text-[#3E3A31] hover:bg-[#F7F6F3]"
                  }`}
                >
                  <Icon d={t.d} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Listing type */}
        <div className="border-t border-[#EFEDE6] py-5">
          <SectionLabel>Listing type</SectionLabel>
          <div className="flex rounded-[6px] border border-[#D8D3C6] p-0.5">
            {(["sale", "rent"] as const).map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => update({ listingType: lt, rentalPeriod: lt === "sale" ? null : draft.rentalPeriod })}
                className={`flex-1 rounded-[5px] py-1.5 text-[12.5px] font-medium capitalize transition-colors ${
                  draft.listingType === lt ? "bg-[#240270] text-white" : "text-[#3E3A31] hover:bg-[#F7F6F3]"
                }`}
              >
                For {lt}
              </button>
            ))}
          </div>
        </div>

        {/* Rental period — only relevant when renting */}
        {draft.listingType === "rent" && (
          <div className="border-t border-[#EFEDE6] py-5">
            <SectionLabel>Rental period</SectionLabel>
            <div className="flex gap-2">
              {(["daily", "monthly", "yearly"] as const).map((p) => {
                const active = draft.rentalPeriod === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => update({ rentalPeriod: active ? null : p })}
                    className={`flex-1 rounded-[6px] border px-2 py-1.5 text-[12.5px] font-medium capitalize transition-colors ${
                      active
                        ? "border-[#240270] bg-[#240270] text-white"
                        : "border-[#D8D3C6] text-[#3E3A31] hover:bg-[#F7F6F3]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Region */}
        <div className="border-t border-[#EFEDE6] py-5">
          <SectionLabel>Region</SectionLabel>
          <div className="mb-2 flex items-center gap-2 rounded-[6px] border border-[#D8D3C6] px-2.5 py-2">
            <span className="text-[#8A8578]">
              <Icon d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" />
            </span>
            <input
              value={regionQuery}
              onChange={(e) => setRegionQuery(e.target.value)}
              placeholder="Search Ghana regions…"
              className="w-full bg-transparent text-[12.5px] text-[#17131F] placeholder:text-[#8A8578] focus:outline-none"
            />
          </div>
          <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
            {regionMatches.map((r) => {
              const active = draft.region === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => update({ region: active ? null : r })}
                  className={`rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    active
                      ? "border-[#240270] bg-[#240270] text-white"
                      : "border-[#D8D3C6] text-[#3E3A31] hover:bg-[#F7F6F3]"
                  }`}
                >
                  {r}
                </button>
              );
            })}
            {regionMatches.length === 0 && (
              <p className="text-[12px] text-[#8A8578]">No region matches "{regionQuery}"</p>
            )}
          </div>
        </div>

        {/* Price range */}
        <div className="border-t border-[#EFEDE6] py-5">
          <SectionLabel>Price range</SectionLabel>
          <RangeSlider
            min={0}
            max={1_000_000}
            step={1000}
            valueMin={draft.priceMin}
            valueMax={draft.priceMax}
            onChange={(mn, mx) => update({ priceMin: mn, priceMax: mx })}
            formatLabel={(v) => `GH₵${v.toLocaleString()}`}
          />
        </div>

        {/* Rooms */}
        <div className="border-t border-[#EFEDE6] py-5">
          <SectionLabel>Rooms</SectionLabel>
          <div className="flex items-center gap-8">
            <div>
              <p className="mb-1.5 text-[11.5px] text-[#8A8578]">Bedroom</p>
              <Stepper value={draft.bedrooms} onChange={(v) => update({ bedrooms: v })} />
            </div>
            <div>
              <p className="mb-1.5 text-[11.5px] text-[#8A8578]">Bathroom</p>
              <Stepper value={draft.bathrooms} onChange={(v) => update({ bathrooms: v })} />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="border-t border-[#EFEDE6] py-5">
          <SectionLabel>Size (sqft)</SectionLabel>
          <RangeSlider
            min={0}
            max={10_000}
            step={100}
            valueMin={draft.sqftMin}
            valueMax={draft.sqftMax}
            onChange={(mn, mx) => update({ sqftMin: mn, sqftMax: mx })}
            formatLabel={(v) => `${v.toLocaleString()} sqft`}
          />
        </div>

        {/* Amenities */}
        <div className="border-t border-[#EFEDE6] pt-5">
          <SectionLabel>Amenities</SectionLabel>
          <div className="space-y-2">
            {AMENITIES.map((a) => (
              <label key={a.value} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={draft.amenities.includes(a.value)}
                  onChange={() => toggleAmenity(a.value)}
                  className="h-4 w-4 rounded-[3px] border-[#D8D3C6] text-[#240270] accent-[#240270] focus:ring-0"
                />
                <span className="text-[13px] text-[#3E3A31]">{a.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-[#EFEDE6] px-5 py-4">
        <button
          onClick={handleReset}
          className="flex-1 rounded-[6px] border border-[#D8D3C6] py-2.5 text-[13px] font-medium text-[#3E3A31] hover:bg-[#F7F6F3]"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="flex-1 rounded-[6px] bg-[#240270] py-2.5 text-[13px] font-medium text-white hover:opacity-90"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}