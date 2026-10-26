import { Link } from "react-router-dom";
import { useSavedProperties } from "./hooks/use-saved-properties";
import PropertyCard from "@/features/shared/PropertyCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function FavoritesPage() {
  const { data, isLoading, isError } = useSavedProperties();

  return (
    <div>
      {/* Short cover */}
      <section className="relative h-[50vh] min-h-[380px] flex items-end px-6 md:px-12 pb-14">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(10,10,20,0.28), rgba(10,10,20,0.03)), url('/covers/cover-8.jpg')",
          }}
        />
        <div className="relative z-10 max-w-3xl">
          <p className="text-white/80 uppercase tracking-[0.3em] text-xs md:text-sm mb-4">
            Saved For You
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl md:text-6xl text-white leading-tight">
            My Favorites
          </h1>
        </div>
      </section>

      <section className="bg-cream pb-20 pt-14">
        {isLoading && <LoadingSpinner />}

        {isError && (
          <p className="text-center text-neutral-500 px-6">Couldn&apos;t load your favorites right now.</p>
        )}

        {!isLoading && !isError && (data?.length ?? 0) === 0 && (
          <div className="px-6 py-10 text-center">
            <p className="font-serif text-xl text-brand-blue">Nothing saved yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">Tap the heart on any property to keep it here, on this device, for later.</p>
            <Link to="/listings" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand-blue px-8 font-serif text-xs uppercase tracking-[0.18em] text-white transition hover:bg-brand-blue/90">Browse Properties</Link>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data
              .filter((saved) => !!saved.property_detail)
              .map((saved) => (
                <PropertyCard key={saved.id} property={saved.property_detail} size="lg" />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

