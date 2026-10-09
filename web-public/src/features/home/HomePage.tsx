import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useProperties } from "@/features/listings/hooks/use-properties";
import PropertyCard from "@/features/shared/PropertyCard";
import SearchBar from "./SearchBar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Reveal from "@/components/shared/Reveal";

export default function HomePage() {
  const { data: propertiesPage, isLoading, isError } = useProperties({
    ordering: "-published_at",
    staleTime: 2 * 60_000,
    gcTime: 5 * 60_000,
  });
  const featured = propertiesPage?.results;
  const [subscribed, setSubscribed] = useState(false);

  const HERO_IMAGES = [
    "/covers/cover-5.jpg",
    "/covers/cover-2.jpg",
    "/covers/cover-3.jpg",
    "/covers/cover-7.jpg",
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  const touchX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);


  return (
    <div>
      {/* Hero */}
      <section onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }} onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 40) setHeroIndex((i) => (i + (dx < 0 ? 1 : HERO_IMAGES.length - 1)) % HERO_IMAGES.length); }} className="relative min-h-screen flex items-end px-6 md:px-12 pb-16 overflow-hidden">
        {HERO_IMAGES.map((src, i) => (
          <div
            key={src}
            aria-hidden={i !== heroIndex}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1800ms] ease-in-out ${
              i === heroIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage:
                "linear-gradient(to top, rgba(10,10,20,0.28), rgba(10,10,20,0.03)), url('" + src + "')",
            }}
          />
        ))}
        <div className="relative z-10 max-w-3xl">
          <p className="text-white/80 uppercase tracking-[0.3em] text-xs md:text-sm mb-4">
            Ghana&apos;s Premium Real Estate
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl md:text-6xl text-white leading-tight">
            Find Your Place Among Ghana&apos;s Finest Homes
          </h1>
        </div>
      </section>

      {/* Spotlight: 2 newest properties, each full viewport, desktop only */}
      {featured && featured.length >= 2 && (
        <section className="hidden md:block bg-cream pt-16 md:pt-20 pb-4">
          <Reveal className="text-center mb-10 px-6">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-taupe font-semibold mb-2">
              Just Listed
            </p>
            <h2 className="font-serif text-xl sm:text-2xl md:text-4xl text-neutral-900">
              Fresh On The Market
            </h2>
          </Reveal>
          <div className="flex flex-col">
            {featured.slice(0, 2).map((property, index) => (
              <div key={property.id}>
                <div className="flex items-center justify-center gap-4 py-4 md:py-5 bg-cream">
                  <span className="h-px w-10 md:w-16 bg-brand-taupe/40" />
                  <span className="font-serif text-sm md:text-base tracking-[0.4em] text-brand-taupe">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px w-10 md:w-16 bg-brand-taupe/40" />
                </div>
                <PropertyCard property={property} size="hero" disableHoverEffects />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Intro + search */}
      <section className="bg-cream px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="font-serif text-xl sm:text-2xl md:text-4xl tracking-[0.15em] uppercase text-brand-blue">
              Luxury Lives Here
            </h2>
            <p className="mt-6 text-neutral-600 leading-relaxed max-w-2xl mx-auto">
              Horilux Estates brings deep local expertise to Ghana&apos;s real estate market,
              connecting discerning buyers and tenants with verified, exceptional homes from
              Accra to Kumasi.
            </p>
          </Reveal>
        </div>
        <div className="mt-12">
          <SearchBar />
        </div>
      </section>

      {/* Featured listings */}
      <section className="bg-cream py-20">
        <Reveal className="text-center mb-12 px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-taupe font-semibold mb-2">
            Handpicked
          </p>
          <h2 className="font-serif text-xl sm:text-2xl md:text-4xl text-neutral-900">Featured Properties</h2>
        </Reveal>

        {isLoading && <LoadingSpinner />}

        {isError && (
          <p className="text-center text-neutral-500 px-6">Couldn&apos;t load featured properties right now.</p>
        )}

        {featured && featured.length === 0 && (
          <p className="text-center text-neutral-500 px-6">No featured properties yet &mdash; check back soon.</p>
        )}

        {featured && featured.length > 0 && (
          <>
            {/* Mobile: original unshifted list (no desktop spotlight to account for) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {featured.slice(0, 8).map((property, index) => (
                <Reveal key={property.id} delay={(index % 4) * 100}>
                  <PropertyCard property={property} size="lg" />
                </Reveal>
              ))}
            </div>

            {/* Desktop: skip the 2 properties already shown in the spotlight section */}
            <div className="hidden md:grid md:grid-cols-2 gap-4">
              {featured.slice(2, 10).map((property, index) => (
                <Reveal key={property.id} delay={(index % 4) * 100}>
                  <PropertyCard property={property} size="lg" />
                </Reveal>
              ))}
            </div>
          </>
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
              "linear-gradient(to bottom, rgba(10,10,20,0.25), rgba(10,10,20,0.12)), url('/covers/cover-4.jpg')",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-white uppercase tracking-[0.1em] mb-10">
              Keep Yourself Updated On The Latest Homes Available
            </h2>
          </Reveal>

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
          <Reveal delay={0} className="flex items-start gap-4 justify-center md:justify-start">
            <span className="font-serif text-5xl text-brand-blue">10+</span>
            <p className="text-sm text-neutral-600 pt-2">
              years connecting buyers and tenants with Ghana&apos;s finest homes.
            </p>
          </Reveal>
          <Reveal delay={100} className="flex items-start gap-4 justify-center md:justify-start">
            <span className="font-serif text-5xl text-brand-blue">6</span>
            <p className="text-sm text-neutral-600 pt-2">regions of active practice, from Accra to Kumasi.</p>
          </Reveal>
          <Reveal delay={200} className="flex items-start gap-4 justify-center md:justify-start">
            <span className="font-serif text-5xl text-brand-blue">1</span>
            <p className="text-sm text-neutral-600 pt-2">
              goal &mdash; a transparent, seamless experience for every client.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
