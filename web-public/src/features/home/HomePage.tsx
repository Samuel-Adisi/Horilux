import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProperties } from "@/features/listings/hooks/use-properties";
import PropertyCard from "@/features/shared/PropertyCard";
import SearchBar from "./SearchBar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Reveal from "@/components/shared/Reveal";
import WiggleHeading from "@/components/shared/WiggleHeading";

const CATEGORIES = [
  { label: "For Sale", to: "/listings?listing_type=sale", image: "/covers/cover-7.jpg" },
  { label: "For Rent", to: "/listings?listing_type=rent", image: "/covers/cover-3.jpg" },
  { label: "Residential", to: "/listings?property_type=residential", image: "/covers/cover-6.jpg" },
  { label: "Commercial", to: "/listings?property_type=commercial", image: "/covers/cover-4.jpg" },
];

export default function HomePage() {
  const { data: propertiesPage, isLoading, isError } = useProperties({
    ordering: "-published_at",
    staleTime: 2 * 60_000,
    gcTime: 5 * 60_000,
  });
  const featured = propertiesPage?.results;

  const shuffle = <T,>(list: T[]): T[] => {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const desktopGrid = useMemo(() => {
    const all = propertiesPage?.results || [];
    return shuffle(all.length >= 2 ? all.slice(2) : all).slice(0, 12);
  }, [propertiesPage]);
  const mobileGrid = useMemo(() => shuffle(propertiesPage?.results || []).slice(0, 12), [propertiesPage]);
  const totalProperties = (propertiesPage as unknown as { count?: number } | undefined)?.count ?? propertiesPage?.results?.length ?? 0;
  const mobileShown = mobileGrid.length;
  const desktopShown = ((propertiesPage?.results?.length ?? 0) >= 2 ? 2 : 0) + desktopGrid.length;

  const HERO_IMAGES = [
    "/covers/cover-9.jpg",
    "/covers/cover-10.jpg",
    "/covers/cover-5.jpg",
    "/covers/cover-11.jpg",
    "/covers/cover-12.jpg",
    "/covers/cover-11.jpg",
    "/covers/cover-12.jpg",
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
      <section onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }} onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 40) setHeroIndex((i) => (i + (dx < 0 ? 1 : HERO_IMAGES.length - 1)) % HERO_IMAGES.length); }} className="relative flex items-end aspect-[4/5] md:aspect-auto md:h-[100svh] px-6 md:px-12 pb-16 overflow-hidden">
        {HERO_IMAGES.map((src, i) => (
          <div
            key={src + "-" + i}
            aria-hidden={i !== heroIndex}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1800ms] ease-in-out ${
              i === heroIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage:
                "linear-gradient(to top, rgba(10,10,20,0.28), rgba(10,10,20,0.03)), url('" + src + "')",
              backgroundPosition: "center",
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
            <WiggleHeading text="Luxury Lives Here" className="font-serif text-xl sm:text-2xl md:text-4xl tracking-[0.15em] uppercase text-brand-blue" />
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
          <WiggleHeading text="Featured Properties" className="font-serif text-xl sm:text-2xl md:text-4xl text-neutral-900" />
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
              {mobileGrid.map((property, index) => (
                <Reveal key={property.id} delay={(index % 4) * 100}>
                  <PropertyCard property={property} size="lg" />
                </Reveal>
              ))}
            </div>

            {/* Desktop: skip the 2 properties already shown in the spotlight section */}
            <div className="hidden md:grid md:grid-cols-2 gap-4">
              {desktopGrid.map((property, index) => (
                <Reveal key={property.id} delay={(index % 4) * 100}>
                  <PropertyCard property={property} size="lg" />
                </Reveal>
              ))}
            </div>
          </>
        )}

        {featured && featured.length > 0 && totalProperties > mobileShown && (
          <div className="mt-14 text-center md:hidden">
          <Link
            to="/listings"
            className="inline-block px-6 py-3 sm:px-10 sm:py-4 rounded-full border border-brand-blue text-brand-blue font-serif tracking-wider uppercase text-xs sm:text-sm hover:bg-brand-blue hover:text-white transition-colors"
          >
            View More
          </Link>
          </div>
        )}
        {featured && featured.length > 0 && totalProperties > desktopShown && (
          <div className="mt-14 hidden text-center md:block">
          <Link
            to="/listings"
            className="inline-block px-6 py-3 sm:px-10 sm:py-4 rounded-full border border-brand-blue text-brand-blue font-serif tracking-wider uppercase text-xs sm:text-sm hover:bg-brand-blue hover:text-white transition-colors"
          >
            View More
          </Link>
          </div>
        )}
      </section>

      {/* Browse by category */}
      <section className="bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-taupe">Explore</p>
            <WiggleHeading text="Browse By Category" className="font-serif text-xl sm:text-2xl md:text-4xl uppercase tracking-[0.12em] text-brand-blue" />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.label} delay={i * 100} className="h-full">
                <Link to={c.to} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-200">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: "linear-gradient(to top, rgba(10,10,20,0.78), rgba(10,10,20,0.08)), url('" + c.image + "')" }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-left sm:p-6">
                    <p className="font-serif text-lg text-white sm:text-2xl">{c.label}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/70 sm:text-xs">Browse &rarr;</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
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
