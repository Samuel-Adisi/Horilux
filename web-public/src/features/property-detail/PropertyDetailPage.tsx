import { useRef, useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useProperty, useProperties } from "@/features/listings/hooks/use-properties";
import type { PropertyListItem } from "@/lib/types";
import PropertyCard from "@/features/shared/PropertyCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useToggleSavedProperty } from "@/features/favorites/hooks/use-saved-properties";
import { Heart, Share2, Check } from "lucide-react";
import { api } from "@/lib/api";
import { getAmenityIcon } from "./amenity-icons";
import { BedDouble, Bath, Ruler, LandPlot, Tag, MapPin, Home } from "lucide-react";

const FACT_ICONS: Record<string, typeof BedDouble> = {
  "Bedrooms": BedDouble,
  "Bathrooms": Bath,
  "Floor Area": Ruler,
  "Land Area": LandPlot,
  "Property Type": Home,
  "Listing Type": Tag,
  "Region": MapPin,
  "Status": Tag,
};

function formatPrice(price: string, _currency: string) {
  const n = Number(price);
  if (!price || Number.isNaN(n) || n <= 0) return "Price on request";
  return "GH₵ " + n.toLocaleString();
}

function ShareButton({ id, title }: { id: string | number; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.origin + "/listings/" + id;
    try {
      if (navigator.share) {
        await navigator.share({ title: title, text: title + " - Horilux Estates", url: url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // share sheet dismissed or clipboard blocked: nothing to do
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share this property"
      className="relative shrink-0 flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
    >
      {copied ? (
        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={1.75} />
      ) : (
        <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={1.75} />
      )}
      {copied && (
        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-3 py-1 text-xs font-sans normal-case tracking-normal text-white">
          Link copied
        </span>
      )}
    </button>
  );
}

function Lightbox({ urls, startIndex, onClose }: { urls: string[]; startIndex: number; onClose: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(startIndex);

  function go(dir: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = startIndex * el.clientWidth;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {urls.map((url, i) => (
          <div
            key={i}
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
            className="shrink-0 w-full h-full snap-center snap-always flex items-center justify-center px-2 sm:px-16"
          >
            <img src={url} alt="" draggable={false} className="max-h-full max-w-full object-contain select-none" />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
          <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className="absolute top-5 left-4 sm:top-7 sm:left-6 z-10 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
        {index + 1} / {urls.length}
      </div>

      {urls.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading, isError } = useProperty(id);
  useEffect(() => {
    if (!property?.title) return;
    const prev = document.title;
    document.title = property.title + " | Horilux Estates";
    return () => { document.title = prev; };
  }, [property?.title]);
  const { data: sameTypePage } = useProperties({
    listing_type: property?.listing_type,
    ordering: "-published_at",
    enabled: !!property?.listing_type,
    staleTime: 2 * 60_000,
    gcTime: 5 * 60_000,
  });
  const { data: sameRegionPage } = useProperties({
    listing_type: property?.listing_type,
    region: property?.region,
    ordering: "-published_at",
    enabled: !!property?.listing_type && !!property?.region,
    staleTime: 2 * 60_000,
    gcTime: 5 * 60_000,
  });

  const relatedSeed = useMemo(() => Math.random(), [property?.id]);

  const heroSwipeRef = useRef<HTMLDivElement>(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const deskSwipeRef = useRef<HTMLDivElement>(null);
  const [deskSlide, setDeskSlide] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = thumbsRef.current;
    const t = el?.children[deskSlide] as HTMLElement | undefined;
    if (el && t) el.scrollTo({ left: t.offsetLeft - el.clientWidth / 2 + t.clientWidth / 2, behavior: "smooth" });
  }, [deskSlide]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function handleHeroScroll() {
    const el = heroSwipeRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setHeroSlide(index);
  }

  const { isSaved, toggle: toggleSaved, isPending: isSavePending } = useToggleSavedProperty();
  const savePending = property ? isSavePending(property.id) : false;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Reset local inquiry UI state whenever the viewed property changes --
  // otherwise a success message from a previous property lingers, since
  // React Router reuses this component instance across /listings/:id navigations.
  useEffect(() => {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setInquiryError(null);
    setInquirySuccess(false);
    setHeroSlide(0);
    setLightboxIndex(null);
  }, [id]);

  async function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (website) { setInquirySuccess(true); return; }
    if (!property) return;
    setInquiryError(null);
    setSending(true);
    try {
      await api.post("/public/contact/", {
        name,
        email,
        phone,
        message,
        property: property.id,
      });
      setInquirySuccess(true);
      setMessage("");
    } catch {
      setInquiryError("Something went wrong sending your message. Please try again.");
    } finally {
      setSending(false);
    }
  }


  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div><p className="font-serif text-2xl text-brand-blue mb-3">Property not found</p><p className="text-neutral-500 mb-6">It may have been sold or removed.</p><Link to="/listings" className="inline-block rounded-xl bg-brand-blue px-6 py-3 font-serif text-xs uppercase tracking-wider text-white hover:bg-brand-blue/90">Browse properties</Link></div>
      </div>
    );
  }

  const photos = [...property.media]
    .filter((m) => m.media_type === "photo" && m.url)
    .sort((a, b) => a.order - b.order);
  const videos = property.media.filter((m) => m.media_type === "video" && m.url);
  const heroImageUrl = photos[0]?.url || property.cover_image;
  const galleryUrls: string[] =
    photos.length > 0
      ? photos.map((m) => m.url as string)
      : heroImageUrl
        ? [heroImageUrl]
        : [];

  const heroOverlay =
    "linear-gradient(to top, rgba(10,10,20,0.4) 0%, rgba(10,10,20,0.15) 14%, rgba(10,10,20,0) 32%)";

  const related = (() => {
    const pool = new Map<string, PropertyListItem>();
    [...(sameRegionPage?.results || []), ...(sameTypePage?.results || [])].forEach((p) => {
      if (p.id !== property.id) pool.set(p.id, p);
    });
    const basePrice = Number(property.price) || 0;
    const hash = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
      return Math.abs(h);
    };
    const score = (p: PropertyListItem) => {
      let sc = 0;
      if (p.region === property.region) sc += 4;
      if (p.property_type === property.property_type) sc += 3;
      const price = Number(p.price) || 0;
      if (basePrice > 0 && price > 0) {
        const diff = Math.abs(price - basePrice) / basePrice;
        if (diff <= 0.25) sc += 3;
        else if (diff <= 0.5) sc += 2;
        else if (diff <= 1) sc += 1;
      }
      if (p.bedrooms != null && property.bedrooms != null) {
        const d = Math.abs(p.bedrooms - property.bedrooms);
        if (d === 0) sc += 2;
        else if (d === 1) sc += 1;
      }
      return sc;
    };
    return Array.from(pool.values())
      .map((p) => ({ p, sc: score(p), r: hash(String(relatedSeed) + p.id) }))
      .sort((a, b) => b.sc - a.sc || a.r - b.r)
      .slice(0, 12)
      .sort((a, b) => a.r - b.r)
      .slice(0, 6)
      .map((x) => x.p);
  })();

  const waLink = "https://wa.me/233591368760?text=" + encodeURIComponent("Hi, I am interested in " + property.title + " (" + window.location.href + ")");

  const facts = [
    { label: "Property Type", value: property.property_type },
    { label: "Listing Type", value: property.listing_type === "sale" ? "For Sale" : "For Rent" },
    { label: "Region", value: property.region },
    property.address && { label: "Address", value: property.address },
    property.bedrooms != null && { label: "Bedrooms", value: String(property.bedrooms) },
    property.bathrooms != null && { label: "Bathrooms", value: String(property.bathrooms) },
    property.building_size && { label: "Floor Area", value: property.building_size },
    property.land_size && { label: "Land Area", value: property.land_size },
    property.status && { label: "Status", value: property.status === "marketing_ready" ? "Available" : property.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="bg-white pb-20 md:pb-0">
      <Link
        to="/contact"
        className="hidden md:block fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-30 animate-float px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-brand-blue text-white font-serif tracking-wider uppercase text-[10px] sm:text-xs md:text-sm shadow-lg hover:bg-brand-blue/90 transition-colors"
      >
        Contact Us
      </Link>

      {/* 1. Hero / cover */}
      <section className="relative">
        {/* Desktop: real image at its own natural aspect ratio, full width, no crop */}
        <div className="hidden md:block relative w-full h-[87vh] min-h-[560px] bg-neutral-900">
          { /* desktop slider */ }<div ref={deskSwipeRef} onScroll={() => { const el = deskSwipeRef.current; if (el) setDeskSlide(Math.round(el.scrollLeft / el.clientWidth)); }} className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">{(photos.length > 0 ? photos : [{ id: "cover", url: property.cover_image }]).map((photo, i) => (<div key={photo.id} className="relative shrink-0 w-full h-full snap-start">{photo.url && (<img src={photo.url} alt={property.title} onClick={() => setLightboxIndex(i)} loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover cursor-zoom-in" />)}</div>))}</div>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: heroOverlay }} />
          {photos.length > 1 && (<><div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">{photos.map((photo, i) => (<span key={photo.id} className={`h-1.5 rounded-full transition-all ${i === deskSlide ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />))}</div></>)}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 max-w-4xl px-6 md:px-12 pb-16">
            <h1 className="font-serif text-2xl sm:text-4xl md:text-6xl text-white leading-tight uppercase flex items-center gap-3 sm:gap-4 pointer-events-auto">
              <span>{property.title}</span>
              <ShareButton id={property.id} title={property.title} />
              {true && (
                <button
                  type="button"
                  onClick={() => !savePending && toggleSaved(property.id)}
                  aria-label={isSaved(property.id) ? "Remove from favorites" : "Add to favorites"}
                  disabled={savePending}
                  className="shrink-0 flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors disabled:opacity-60"
                >
                  <Heart
                    className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${isSaved(property.id) ? "fill-pink-500 text-pink-500" : "text-white"}`}
                    strokeWidth={1.75}
                  />
                </button>
              )}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-white/85 text-sm">
              {property.bedrooms != null && <span>{String(property.bedrooms).padStart(2, "0")} Bedrooms</span>}
              {property.bathrooms != null && <span>{String(property.bathrooms).padStart(2, "0")} Bathrooms</span>}
              {property.building_size && <span>Floor Area {property.building_size}</span>}
              {property.land_size && <span>Land Area {property.land_size}</span>}
            </div>
          </div>
        </div>

        {/* Mobile: swipeable cover carousel, no arrows, dot indicator only */}
        <div
          ref={heroSwipeRef}
          onScroll={handleHeroScroll}
          className="md:hidden relative flex items-start overflow-x-auto snap-x snap-mandatory touch-pan-x touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {(photos.length > 0 ? photos : [{ id: "cover", url: property.cover_image }]).map((photo, i) => (
            <div key={photo.id} className="relative shrink-0 w-full aspect-[2/3] max-h-[85svh] snap-start bg-neutral-900">
              {photo.url && (
                <img src={photo.url} alt={property.title} onClick={() => setLightboxIndex(i)} loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover block cursor-zoom-in" />
              )}
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: heroOverlay }} />
            </div>
          ))}

        </div>

          <div className="md:hidden pointer-events-none absolute inset-x-0 bottom-0 z-10 max-w-4xl px-6 md:px-12 pb-10">
            <h1 className="font-serif text-2xl sm:text-4xl md:text-6xl text-white leading-tight uppercase flex items-center gap-3 sm:gap-4 pointer-events-auto">
              <span>{property.title}</span>
              <ShareButton id={property.id} title={property.title} />
              {true && (
                <button
                  type="button"
                  onClick={() => !savePending && toggleSaved(property.id)}
                  aria-label={isSaved(property.id) ? "Remove from favorites" : "Add to favorites"}
                  disabled={savePending}
                  className="shrink-0 flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors disabled:opacity-60"
                >
                  <Heart
                    className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${isSaved(property.id) ? "fill-pink-500 text-pink-500" : "text-white"}`}
                    strokeWidth={1.75}
                  />
                </button>
              )}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-white/85 text-xs">
              {property.bedrooms != null && <span>{String(property.bedrooms).padStart(2, "0")} Bedrooms</span>}
              {property.bathrooms != null && <span>{String(property.bathrooms).padStart(2, "0")} Bathrooms</span>}
              {property.building_size && <span>Floor Area {property.building_size}</span>}
              {property.land_size && <span>Land Area {property.land_size}</span>}
            </div>
          </div>

        {photos.length > 1 && (
          <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {photos.map((photo, i) => (
              <span
                key={photo.id}
                className={`h-1.5 rounded-full transition-all ${
                  i === heroSlide ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
        {photos.length > 1 && (<div className="md:hidden absolute bottom-6 right-4 z-20 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">{heroSlide + 1} / {photos.length}</div>)}
      </section>

      {photos.length > 1 && (<div className="hidden md:block bg-white px-6 md:px-12 pt-4"><div ref={thumbsRef} className="relative flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">{photos.map((photo, i) => (<button key={photo.id} type="button" aria-label={"Show photo " + (i + 1)} onClick={() => deskSwipeRef.current?.scrollTo({ left: i * (deskSwipeRef.current?.clientWidth ?? 0), behavior: "smooth" })} className={`relative shrink-0 w-28 h-20 overflow-hidden rounded-md transition-all ${i === deskSlide ? "ring-2 ring-brand-blue opacity-100" : "opacity-60 hover:opacity-100"}`}><img src={photo.url ?? undefined} alt="" loading="lazy" className="h-full w-full object-cover" /></button>))}</div></div>)}

      {/* 2 + 3. Description + property details */}
      <section className="bg-white px-6 md:pl-12 md:pr-12 py-16 md:py-20">
        <div className="mx-auto md:mx-0 max-w-4xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-8">
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl uppercase tracking-wide text-brand-blue">
              {property.title}
            </h2>
            <span className="inline-flex items-center rounded-full bg-[#F4EFE6] border border-green-600/20 px-4 py-1.5 font-bold text-base sm:text-lg text-green-600 whitespace-nowrap">
              {formatPrice(property.price, property.currency)}
            </span>
          </div>
          {property.description ? (
            <div className="space-y-5 text-neutral-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </div>
          ) : (
            <p className="text-neutral-500 leading-relaxed">
              A {property.property_type.toLowerCase()} located in {property.region}, offered{" "}
              {property.listing_type === "sale" ? "for sale" : "for rent"}.
            </p>
          )}
        </div>

        <div className="mx-auto md:mx-0 max-w-5xl mt-16">
          <h3 className="font-serif text-lg sm:text-xl md:text-2xl uppercase tracking-wide text-brand-blue text-center md:text-left mb-10">
            Property Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8">
            {facts.map((fact) => {
              const Icon = FACT_ICONS[fact.label];
              return (
                <div key={fact.label} className="flex items-start gap-3">
                  {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900" strokeWidth={1.75} />}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-brand-taupe font-semibold mb-1">
                      {fact.label}
                    </p>
                    <p className="text-neutral-700">{fact.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div className="mt-16">
              <h3 className="font-serif text-xl md:text-2xl uppercase tracking-wide text-brand-blue text-center md:text-left mb-10">
                Amenities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-6">
                {property.amenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={amenity} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </span>
                      <span className="text-sm text-neutral-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>


      {/* 3.5 Inquiry / contact this property */}
      <section className="bg-white px-6 md:px-12 py-16 md:py-24 border-t border-neutral-100">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-wide text-brand-blue mb-3">
              Interested in this property?
            </h3>
            <p className="text-neutral-500 text-sm">
              Fill in your details and we&apos;ll get back to you shortly.
            </p>
          </div>

          <a href={waLink} target="_blank" rel="noopener noreferrer" className="mb-6 hidden md:flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 font-semibold text-white transition hover:brightness-95"><svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>Chat on WhatsApp</a>

                    <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/60 border border-neutral-100 p-6 sm:p-8 md:p-10">
            {inquirySuccess ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6">
                    <path d="M5 10.5L8.5 14L15 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-neutral-800 font-medium">
                  Thank you &mdash; we will be in touch shortly about this property.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-5"><input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        placeholder="Name*"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-4 py-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:bg-white transition-all"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Email*"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-4 py-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:bg-white transition-all"
                      />
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-4 py-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:bg-white transition-all"
                    />
                </>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Tell us what you'd like to know about this property..."
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-4 py-3.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:bg-white transition-all resize-none"
                />
                {inquiryError && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                    <p className="text-sm text-red-600">{inquiryError}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full px-6 py-3.5 rounded-xl bg-brand-blue text-white font-serif tracking-wider uppercase text-xs sm:text-sm hover:bg-brand-blue/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 5. Video reference */}
      {videos.length > 0 && (
        <section className="bg-white py-16 md:py-20 px-6">
          <div className="mx-auto md:mx-0 max-w-4xl">
            <h3 className="font-serif text-lg sm:text-xl md:text-2xl uppercase tracking-wide text-brand-blue text-center mb-10">
              Video Tour
            </h3>
            <video
              src={videos[0].url ?? undefined}
              controls
              className="w-full aspect-video bg-black"
            />
          </div>
        </section>
      )}

      {/* 6. Related properties */}
      {related.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="text-center mb-10 px-6">
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-neutral-900 uppercase tracking-wide">
              You May Also Like
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.map((p) => (
              <PropertyCard key={p.id} property={p} size="lg" />
            ))}
          </div>
        </section>
      )}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-neutral-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur"><a href="tel:+233591368760" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-blue px-4 py-3 text-sm font-semibold text-brand-blue"><svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>Call</a><a href={waLink} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white"><svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>WhatsApp</a></div>
      {lightboxIndex !== null && galleryUrls.length > 0 && (
        <Lightbox urls={galleryUrls} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  );
}
