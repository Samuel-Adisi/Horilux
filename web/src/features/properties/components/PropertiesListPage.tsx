import { useMemo, useState } from "react";
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

const SEARCH_ICON = "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35";
const SLIDERS_ICON = "M4 6h16M7 12h10M10 18h4";
const PLUS_ICON = "M12 5v14M5 12h14";

function CardSkeleton() {
  return (
    <div className="flex gap-4 border-b border-[#EFEDE6] px-5 py-4 last:border-0">
      <div className="h-28 w-40 shrink-0 animate-pulse rounded-[6px] bg-[#EFEDE6]" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-[#EFEDE6]" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-[#EFEDE6]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#EFEDE6]" />
      </div>
    </div>
  );
}

export function PropertiesListPage() {
  const { data, isLoading, isError } = useProperties();
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);

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

      if (p.sqft != null && (p.sqft < filters.sqftMin || p.sqft > filters.sqftMax)) return false;

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

  return (
    <AdminLayout pageTitle="Properties" pageSubtitle={`${data?.count ?? 0} total`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-[4px] border border-[#E4E1D9] bg-white px-3 py-2.5">
          <span className="text-[#8A8578]">
            <Icon d={SEARCH_ICON} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location, or region…"
            className="w-full bg-transparent text-[13px] text-[#17131F] placeholder:text-[#8A8578] focus:outline-none"
          />
        </div>

        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`relative flex items-center gap-2 rounded-[4px] border px-4 py-2.5 text-[13px] font-medium transition-colors ${
            filtersOpen ? "border-[#240270] bg-[#EAE3F7] text-[#240270]" : "border-[#D8D3C6] text-[#3E3A31] hover:bg-[#F7F6F3]"
          }`}
        >
          <Icon d={SLIDERS_ICON} width={15} height={15} />
          Advanced filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#240270] text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <Link
          to="/properties/new"
          className="flex items-center gap-2 rounded-[4px] bg-[#240270] px-4 py-2.5 text-[13px] font-medium text-white hover:opacity-90"
        >
          <Icon d={PLUS_ICON} width={15} height={15} />
          New property
        </Link>
      </div>

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1 overflow-hidden rounded-[6px] border border-[#E4E1D9] bg-white">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          ) : isError ? (
            <div className="px-5 py-10 text-center text-[13px] text-[#8A2E2E]">
              Couldn't load properties. Check your connection and try again.
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-[13.5px] font-medium text-[#17131F]">No properties match your filters</p>
              <p className="mt-1 text-[12.5px] text-[#8A8578]">Try widening your search or clearing a filter.</p>
            </div>
          ) : (
            filtered.map((property) => (
              <PropertyCard key={property.id} property={property} onClick={() => {}} />
            ))
          )}
        </div>

        {filtersOpen && (
          <PropertyFiltersPanel filters={filters} onChange={setFilters} onClose={() => setFiltersOpen(false)} />
        )}
      </div>
    </AdminLayout>
  );
}