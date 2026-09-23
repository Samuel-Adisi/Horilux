import { useState } from "react";
import { useNavigate } from "react-router-dom";

const REGIONS = ["Greater Accra", "Ashanti", "Western", "Central", "Eastern"];
const TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];
const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5+"];
const BATHROOM_OPTIONS = ["1", "2", "3", "4", "5+"];
const PRICE_RANGES = [
  { label: "Under GHS 500,000", min: undefined, max: 500000 },
  { label: "GHS 500,000 - 1,000,000", min: 500000, max: 1000000 },
  { label: "GHS 1,000,000 - 2,500,000", min: 1000000, max: 2500000 },
  { label: "GHS 2,500,000+", min: 2500000, max: undefined },
];

const pillClass =
  "w-full appearance-none rounded-full bg-white border border-black/5 shadow-sm px-4 sm:px-6 py-3 sm:py-3.5 pr-9 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-shadow hover:shadow-md cursor-pointer";

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
      viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface SearchBarProps {
  initialParams?: URLSearchParams;
}

function priceRangeIndexFromParams(params?: URLSearchParams): string {
  if (!params) return "";
  const min = params.get("min_price");
  const max = params.get("max_price");
  if (!min && !max) return "";
  const idx = PRICE_RANGES.findIndex(
    (r) => String(r.min ?? "") === (min ?? "") && String(r.max ?? "") === (max ?? "")
  );
  return idx >= 0 ? String(idx) : "";
}

export default function SearchBar({ initialParams }: SearchBarProps = {}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState(initialParams?.get("search") ?? "");
  const [region, setRegion] = useState(initialParams?.get("region") ?? "");
  const [propertyType, setPropertyType] = useState(initialParams?.get("property_type") ?? "");
  const [bedrooms, setBedrooms] = useState(initialParams?.get("bedrooms") ?? "");
  const [bathrooms, setBathrooms] = useState(initialParams?.get("bathrooms") ?? "");
  const [priceRange, setPriceRange] = useState(priceRangeIndexFromParams(initialParams));

  function handleSearch() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (region) params.set("region", region);
    if (propertyType) params.set("property_type", propertyType);
    if (bedrooms) params.set("bedrooms", bedrooms.replace("+", ""));
    if (bathrooms) params.set("bathrooms", bathrooms.replace("+", ""));
    if (priceRange) {
      const range = PRICE_RANGES[Number(priceRange)];
      if (range?.min != null) params.set("min_price", String(range.min));
      if (range?.max != null) params.set("max_price", String(range.max));
    }
    navigate(`/listings?${params.toString()}`);
  }

  function handleReset() {
    setSearch("");
    setRegion("");
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    setPriceRange("");
    navigate("/listings");
  }

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      <div className="relative col-span-2 sm:col-span-3 md:col-span-2">
        <svg
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
          viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M17 17L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className={pillClass + " pl-12"}
        />
      </div>

      <div className="relative">
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={pillClass}>
          <option value="">Location</option>
          {REGIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
        </select>
        <Chevron />
      </div>

      <div className="relative">
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={pillClass}>
          <option value="">Property Type</option>
          {TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
        </select>
        <Chevron />
      </div>

      <div className="relative">
        <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={pillClass}>
          <option value="">Bedroom</option>
          {BEDROOM_OPTIONS.map((b) => (<option key={b} value={b}>{b}</option>))}
        </select>
        <Chevron />
      </div>

      <div className="relative">
        <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className={pillClass}>
          <option value="">Bathroom</option>
          {BATHROOM_OPTIONS.map((b) => (<option key={b} value={b}>{b}</option>))}
        </select>
        <Chevron />
      </div>

      <div className="relative col-span-2 sm:col-span-1">
        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className={pillClass}>
          <option value="">Price Range</option>
          {PRICE_RANGES.map((r, i) => (<option key={r.label} value={i}>{r.label}</option>))}
        </select>
        <Chevron />
      </div>

      <div className="col-span-2 sm:col-span-1 flex gap-2">
        <button
          onClick={handleSearch}
          className="flex-1 rounded-full bg-brand-blue text-white font-serif tracking-[0.15em] uppercase text-sm py-3 sm:py-3.5 hover:bg-brand-blue/90 active:scale-[0.98] transition-all whitespace-nowrap"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleReset}
          title="Reset search"
          aria-label="Reset search"
          className="shrink-0 rounded-full border border-black/10 bg-white text-neutral-500 hover:text-brand-blue hover:border-brand-blue/30 transition-colors px-4 py-3 sm:py-3.5"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 10a6 6 0 1 1 1.76 4.24M4 10V6m0 4h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
