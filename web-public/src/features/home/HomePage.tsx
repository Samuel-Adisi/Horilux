import { useState } from "react";
import { Link } from "react-router-dom";
import { useProperties } from "@/features/listings/hooks/use-properties";
import PropertyCard from "@/features/shared/PropertyCard";
import SearchBar from "./SearchBar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function HomePage() {
  const { data: propertiesPage, isLoading, isError } = useProperties({
    ordering: "-published_at",
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });
  const featured = propertiesPage?.results;
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-end px-6 md:px-12 pb-16">
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
            Find Your Place Among Ghana&apos;s Finest Homes
          </h1>
        </div>
      </section>

      {/* Intro + search */}
      <section className="bg-cream px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-xl sm:text-2xl md:text-4xl tracking-[0.15em] uppercase text-brand-blue">
            Luxury Lives Here
          </h2>
          <p className="mt-6 text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Horilux Estates brings deep local expertise to Ghana&apos;s real estate market,
            connecting discerning buyers and tenants with verified, exceptional homes from
            Accra to Kumasi.
          </p>
        </div>
        <div className="mt-12">
          <SearchBar />
        </div>
      </section>

      {/* Featured listings */}
      <section className="bg-cream py-20">
        <div className="text-center mb-12 px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-taupe font-semibold mb-2">
            Handpicked
          </p>
          <h2 className="font-serif text-xl sm:text-2xl md:text-4xl text-neutral-900">Featured Properties</h2>
        </div>

        {isLoading && <LoadingSpinner />}

        {isError && (
          <p className="text-center text-neutral-500 px-6">Couldn&apos;t load featured properties right now.</p>
        )}

        {featured && featured.length === 0 && (
          <p className="text-center text-neutral-500 px-6">No featured properties yet &mdash; check back soon.</p>
        )}

        {featured && featured.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.slice(0, 8).map((property) => (
              <PropertyCard key={property.id} property={property} size="lg" />
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Link
            to="/listings"
            className="inline-block px-6 py-3 sm:px-10 sm:py-4 rounded-full border border-brand-blue text-brand-blue font-serif tracking-wider uppercase text-xs sm:text-sm hover:bg-brand-blue hover:text-white transition-colors"
          >
            View More
          </Link>
        </div>
      </section>

      {/* Newsletter + stats */}
      <section className="relative px-6 py-24 md:py-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(10,10,20,0.55), rgba(10,10,20,0.35)), url('https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-white uppercase tracking-[0.1em] mb-10">
            Keep Yourself Updated On The Latest Homes Available
          </h2>

          {subscribed ? (
            <p className="text-white font-serif text-lg">Thank you &mdash; you&apos;re on the list.</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
              className="flex flex-col md:flex-row gap-3"
            >
              <input
                type="text"
                required
                placeholder="Name*"
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 rounded-full bg-black/40 border border-white/50 text-white placeholder:text-white text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/60"
              />
              <input
                type="email"
                required
                placeholder="Email*"
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 rounded-full bg-black/40 border border-white/50 text-white placeholder:text-white text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/60"
              />
              <button
                type="submit"
                className="px-6 py-3 sm:px-10 sm:py-4 rounded-full bg-white text-brand-blue font-serif tracking-wider uppercase text-xs sm:text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Sign Up
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-cream py-16 border-t border-black/5">
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          <div className="flex items-start gap-4 justify-center md:justify-start">
            <span className="font-serif text-5xl text-brand-blue">10+</span>
            <p className="text-sm text-neutral-600 pt-2">
              years connecting buyers and tenants with Ghana&apos;s finest homes.
            </p>
          </div>
          <div className="flex items-start gap-4 justify-center md:justify-start">
            <span className="font-serif text-5xl text-brand-blue">6</span>
            <p className="text-sm text-neutral-600 pt-2">regions of active practice, from Accra to Kumasi.</p>
          </div>
          <div className="flex items-start gap-4 justify-center md:justify-start">
            <span className="font-serif text-5xl text-brand-blue">1</span>
            <p className="text-sm text-neutral-600 pt-2">
              goal &mdash; a transparent, seamless experience for every client.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
