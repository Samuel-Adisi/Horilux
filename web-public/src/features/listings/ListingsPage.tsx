import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProperties } from "./hooks/use-properties";
import type { PropertyFilters } from "./api/properties";
import type { PropertyListItem } from "@/lib/types";
import PropertyCard from "@/features/shared/PropertyCard";
import SearchBar from "@/features/home/SearchBar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import logo from "@/assets/logo.png";

export default function ListingsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  function handleReset() {
    navigate("/listings");
  }

  const filters = useMemo(() => {
    const f: PropertyFilters = { ordering: "-published_at" };
    const region = searchParams.get("region");
    if (region) f.region = region;
    const propertyType = searchParams.get("property_type");
    if (propertyType) f.property_type = propertyType;
    const minPrice = searchParams.get("min_price");
    if (minPrice) f.min_price = Number(minPrice);
    const maxPrice = searchParams.get("max_price");
    if (maxPrice) f.max_price = Number(maxPrice);
    const bedrooms = searchParams.get("bedrooms");
    if (bedrooms) f.bedrooms = Number(bedrooms);
    const bathrooms = searchParams.get("bathrooms");
    if (bathrooms) f.bathrooms = Number(bathrooms);
    const search = searchParams.get("search");
    if (search) f.search = search;
    const listingType = searchParams.get("listing_type");
    if (listingType === "sale" || listingType === "rent") f.listing_type = listingType;
    return f;
  }, [searchParams]);

  const filtersKey = JSON.stringify(filters);

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PropertyListItem[]>([]);
  const loadedPagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setPage(1);
    setItems([]);
    loadedPagesRef.current = new Set();
  }, [filtersKey]);

  const { data, isLoading, isError, isFetching } = useProperties({
    ...filters,
    page,
    staleTime: 2 * 60_000,
    gcTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!data) return;
    const key = `${filtersKey}:${page}`;
    if (loadedPagesRef.current.has(key)) return;
    loadedPagesRef.current.add(key);
    setItems((prev) => (page === 1 ? data.results : [...prev, ...data.results]));
  }, [data, filtersKey, page]);

  const hasMore = !!data?.next;
  const showInitialLoading = isLoading && page === 1;

  function handleLoadMore() {
    setPage((p) => p + 1);
  }

  return (
    <div>
      {/* Short cover */}
      <section className="relative h-[50vh] min-h-[380px] flex items-end px-6 md:px-12 pb-14">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(10,10,20,0.75), rgba(10,10,20,0.15)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        <div className="relative z-10 max-w-3xl">
          <p className="text-white/80 uppercase tracking-[0.3em] text-xs md:text-sm mb-4">
            Ghana&apos;s Premium Real Estate
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl md:text-6xl text-white leading-tight">
            All Properties
          </h1>
        </div>
      </section>

      {/* Intro + search */}
      <section className="bg-cream px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-xl sm:text-2xl md:text-4xl tracking-[0.15em] uppercase text-brand-blue">
            Explore Our Properties
          </h2>
          <p className="mt-4 text-neutral-500 text-sm">Please reset filters before starting a new search.</p>
        </div>
        <div className="mt-10">
          <SearchBar key={searchParams.toString()} initialParams={searchParams} />
        </div>
      </section>

      {
        <section className="bg-cream pb-20">
          {showInitialLoading && <LoadingSpinner />}

          {isError && (
            <p className="text-center text-neutral-500 px-6">Couldn&apos;t load properties right now.</p>
          )}

          {!showInitialLoading && !isError && items.length === 0 && (
            <div className="text-center px-6">
              <p className="text-neutral-500">No properties match your search.</p>
              <button
                onClick={handleReset}
                className="mt-4 inline-block px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-brand-blue text-white font-serif tracking-[0.15em] uppercase text-[11px] sm:text-sm hover:bg-brand-blue/90 transition-colors"
              >
                Reset Search
              </button>
            </div>
          )}

          {items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((property) => (
                <PropertyCard key={property.id} property={property} size="lg" />
              ))}
            </div>
          )}

          {!showInitialLoading && isFetching && page > 1 && (
            <div className="flex items-center justify-center py-10">
              <img
                src={logo}
                alt="Loading more"
                className="h-10 w-10 object-contain brightness-0 [animation:horilux-fade_1.4s_ease-in-out_infinite]"
              />
            </div>
          )}

          {hasMore ? (
            <div className="mt-14 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isFetching}
                className="inline-block px-6 py-3 sm:px-10 sm:py-4 rounded-full bg-neutral-800 text-white font-serif tracking-wider uppercase text-xs sm:text-sm hover:bg-neutral-700 transition-colors disabled:opacity-60"
              >
                Load More
              </button>
            </div>
          ) : (
            !showInitialLoading &&
            (data?.results?.length ?? 0) > 0 && (
              <div className="mt-14 text-center text-sm tracking-wider uppercase text-neutral-500 font-serif">
                You've seen all properties
              </div>
            )
          )}
        </section>
      }
    </div>
  );
}
