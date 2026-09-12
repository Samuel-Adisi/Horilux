import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { PropertyCard, type PropertyCardData } from "./PropertyCard";
import { PropertyFiltersPanel, DEFAULT_FILTERS, type PropertyFilters } from "./PropertyFiltersPanel";
import { useProperties } from "../hooks/use-properties";

function Icon({ d, ...props }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={d} />
    </svg>
  );
}

const SEARCH_ICON = "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z";
const SLIDERS_ICON = "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z";
const PLUS_ICON = "M12 4v16m8-8H4";
const CHEVRON_LEFT = "M15 19l-7-7 7-7";
const CHEVRON_RIGHT = "M9 5l7 7-7 7";
const SEARCH_EMPTY_ICON = "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z";
const ERROR_ICON = "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-md border border-[#E4E1D9] bg-white shadow-xs">
      <div className="h-60 bg-[#EAE8E3]" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 rounded-xs bg-[#EAE8E3]" />
        <div className="h-5 w-3/4 rounded-xs bg-[#EAE8E3]" />
        <div className="mt-2 h-7 w-1/2 rounded-xs bg-[#EAE8E3]" />
        <div className="flex justify-between border-t border-[#F1EFEA] pt-4">
          <div className="h-4 w-1/4 rounded-xs bg-[#EAE8E3]" />
          <div className="h-4 w-1/4 rounded-xs bg-[#EAE8E3]" />
          <div className="h-4 w-1/4 rounded-xs bg-[#EAE8E3]" />
        </div>
      </div>
    </div>
  );
}

export function PropertiesListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useProperties(page);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFiltersChange = (next: PropertyFilters) => {
    setFilters(next);
    setPage(1);
  };

  const properties = (data?.results ?? []) as PropertyCardData[];

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const q = search.trim().toLowerCase();
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.location.toLowerCase().includes(q) &&
        !(p.region ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }

      if (filters.propertyType && p.property_type !== filters.propertyType) return false;
      if (filters.listingType && p.listing_type !== filters.listingType) return false;

      if (filters.listingType === "rent" && filters.rentalPeriod && p.rental_period !== filters.rentalPeriod) {
        return false;
      }

      if (filters.region) {
        const matchesRegion =
          (p.region ?? "").toLowerCase() === filters.region.toLowerCase() ||
          p.location.toLowerCase().includes(filters.region.toLowerCase());
        if (!matchesRegion) return false;
      }

      const price = Number(p.price);
      if (!Number.isNaN(price) && (price < filters.priceMin || price > filters.priceMax)) return false;

      if (p.sqft != null) { const sqft = Number(p.sqft); if (!Number.isNaN(sqft) && (sqft < filters.sqftMin || sqft > filters.sqftMax)) return false; }

      if (filters.bedrooms && (p.bedrooms ?? 0) < filters.bedrooms) return false;
      if (filters.bathrooms && (p.bathrooms ?? 0) < filters.bathrooms) return false;

      if (filters.amenities.length > 0) {
        const propAmenities = p.amenities ?? [];
        const hasAll = filters.amenities.every((a) => propAmenities.includes(a));
        if (!hasAll) return false;
      }

      return true;
    });
  }, [properties, search, filters]);

  const activeFilterCount =
    (filters.propertyType ? 1 : 0) +
    (filters.region ? 1 : 0) +
    (filters.rentalPeriod ? 1 : 0) +
    (filters.bedrooms ? 1 : 0) +
    (filters.bathrooms ? 1 : 0) +
    filters.amenities.length +
    (filters.priceMin !== DEFAULT_FILTERS.priceMin || filters.priceMax !== DEFAULT_FILTERS.priceMax ? 1 : 0) +
    (filters.sqftMin !== DEFAULT_FILTERS.sqftMin || filters.sqftMax !== DEFAULT_FILTERS.sqftMax ? 1 : 0);

  // NOTE: your data model always filters by listing_type ("sale" | "rent") —
  // there's no "all listings" or "off-market" state in PropertyFilters/the API,
  // so unlike the Stitch mock's "All / For Sale / For Rent / Off-Market Pocket"
  // chips with fabricated counts (148/112/36/14), these two chips just toggle
  // the real filters.listingType, and their counts reflect the current page's
  // results only (no backend aggregate endpoint exists to show true totals).
  const saleCountOnPage = properties.filter((p) => p.listing_type === "sale").length;
  const rentCountOnPage = properties.filter((p) => p.listing_type === "rent").length;

  return (
    <AdminLayout pageTitle="Properties">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#18014e]">Properties</h1>
            <span className="inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-medium text-[#240270] border border-[#240270]/15 bg-[#240270]/5">
              {data?.count ?? 0} total listings
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#7D756B]">
            Browse and manage listings across your portfolio.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`relative flex items-center space-x-2 rounded-sm border px-3 py-2 text-xs font-medium shadow-xs transition ${
              filtersOpen ? "border-[#240270] bg-[#EAE3F7] text-[#240270]" : "border-[#D8D3C6] bg-white text-[#18014e] hover:bg-[#FAF9F6]"
            }`}
          >
            <Icon d={SLIDERS_ICON} width={14} height={14} className="text-[#240270]" />
            <span>Advanced Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#240270] font-mono text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <Link
            to="/properties/new"
            className="flex items-center space-x-2 rounded-sm border border-[#1c0159] bg-[#240270] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1c0159]"
          >
            <Icon d={PLUS_ICON} width={14} height={14} strokeWidth={2.5} />
            <span>New Property</span>
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-sm border border-[#E8E5DF] bg-white p-3 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[280px] max-w-md flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#7D756B]">
              <Icon d={SEARCH_ICON} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title, location, or region…"
              className="w-full rounded-sm border border-[#E8E5DF] bg-[#FAF9F6] py-1.5 pl-9 pr-3 text-xs font-medium text-[#18014e] placeholder-[#7D756B] transition focus:border-[#240270] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => handleFiltersChange({ ...filters, listingType: "sale" })}
              className={`rounded-sm border px-3 py-1 text-xs font-semibold transition ${
                filters.listingType === "sale" ? "border-[#240270] bg-[#240270] text-white" : "border-[#E8E5DF] bg-white text-[#7D756B] hover:text-[#18014e]"
              }`}
            >
              For Sale ({saleCountOnPage})
            </button>
            <button
              onClick={() => handleFiltersChange({ ...filters, listingType: "rent" })}
              className={`rounded-sm border px-3 py-1 text-xs font-semibold transition ${
                filters.listingType === "rent" ? "border-[#240270] bg-[#240270] text-white" : "border-[#E8E5DF] bg-white text-[#7D756B] hover:text-[#18014e]"
              }`}
            >
              For Rent ({rentCountOnPage})
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <div className="w-full flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : isError ? (
            <div className="mx-auto my-8 max-w-lg rounded-md border border-rose-200 bg-rose-50 p-8 text-center shadow-xs">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <Icon d={ERROR_ICON} width={20} height={20} />
              </div>
              <h3 className="text-sm font-bold text-rose-900">Couldn't load properties</h3>
              <p className="mt-1 text-xs text-rose-700">Check your connection and try again.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto my-8 max-w-lg rounded-md border border-[#E4E1D9] bg-white p-12 text-center shadow-xs">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#E8E5DF] bg-[#FAF9F6] text-[#7D756B]">
                <Icon d={SEARCH_EMPTY_ICON} width={24} height={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold text-[#18014e]">No properties match your filters</h3>
              <p className="mt-1 text-xs text-[#7D756B]">Try widening your search or clearing a filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} onClick={() => navigate(`/properties/${property.id}`)} />
              ))}
            </div>
          )}
        </div>

        {filtersOpen && (
          <PropertyFiltersPanel filters={filters} onChange={handleFiltersChange} onClose={() => setFiltersOpen(false)} />
        )}
      </div>

      {!search && activeFilterCount === 0 && (data?.next || data?.previous) && (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-sm border border-[#D8D3C6] bg-white px-4 py-3 shadow-xs sm:flex-row">
          <span className="text-xs text-[#3E3A31]">
            Page <strong className="font-mono text-[#18014e]">{page}</strong>
            {data?.count != null && (
              <>
                {" "}· <strong className="font-mono text-[#18014e]">{data.count}</strong> total properties
              </>
            )}
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!data?.previous}
              className="flex items-center space-x-1 rounded-sm border border-[#D8D3C6] bg-white px-3 py-1 text-xs font-medium text-[#3E3A31] transition hover:bg-[#FAF9F6] disabled:opacity-40"
            >
              <Icon d={CHEVRON_LEFT} width={14} height={14} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data?.next}
              className="flex items-center space-x-1 rounded-sm border border-[#D8D3C6] bg-white px-3 py-1 text-xs font-medium text-[#3E3A31] transition hover:bg-[#FAF9F6] disabled:opacity-40"
            >
              <span>Next</span>
              <Icon d={CHEVRON_RIGHT} width={14} height={14} />
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
