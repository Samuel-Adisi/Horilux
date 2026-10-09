import { useRef, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProperty, useProperties } from "@/features/listings/hooks/use-properties";
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
  if (Number.isNaN(n)) return "GH₵ " + price;
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
  const { data: relatedPage } = useProperties({
    ordering: "-published_at",
    staleTime: 2 * 60_000,
    gcTime: 5 * 60_000,
  });

  const carouselRef = useRef<HTMLDivElement>(null);
  const heroSwipeRef = useRef<HTMLDivElement>(null);
  const [heroSlide, setHeroSlide] = useState(0);
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

  function scrollCarousel(direction: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <p className="text-neutral-500">Could not find this property.</p>
      </div>
    );
  }

  const photos = [...property.media]
    .filter((m) => m.media_type === "photo" && m.url)
    .sort((a, b) => a.order - b.order);
  const videos = property.media.filter((m) => m.media_type === "video" && m.url);
  const heroImageUrl = photos[0]?.url || property.cover_image;
  const carouselPhotos = photos.slice(1);
  const galleryUrls: string[] =
    photos.length > 0
      ? photos.map((m) => m.url as string)
      : heroImageUrl
        ? [heroImageUrl]
        : [];

  const heroOverlay =
    "linear-gradient(to top, rgba(10,10,20,0.4) 0%, rgba(10,10,20,0.15) 14%, rgba(10,10,20,0) 32%)";

  const related = (relatedPage?.results || []).filter((p) => p.id !== property.id).slice(0, 2);

  const facts = [
    { label: "Property Type", value: property.property_type },
    { label: "Listing Type", value: property.listing_type === "sale" ? "For Sale" : "For Rent" },
    { label: "Region", value: property.region },
    { label: "Address", value: property.address },
    property.bedrooms != null && { label: "Bedrooms", value: String(property.bedrooms) },
    property.bathrooms != null && { label: "Bathrooms", value: String(property.bathrooms) },
    property.building_size && { label: "Floor Area", value: property.building_size },
    property.land_size && { label: "Land Area", value: property.land_size },
    { label: "Status", value: property.status },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="bg-white">
      <Link
        to="/contact"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-30 animate-float px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-brand-blue text-white font-serif tracking-wider uppercase text-[10px] sm:text-xs md:text-sm shadow-lg hover:bg-brand-blue/90 transition-colors"
      >
        Contact Us
      </Link>

      {/* 1. Hero / cover */}
      <section className="relative">
        {/* Desktop: real image at its own natural aspect ratio, full width, no crop */}
        <div className="hidden md:block relative w-full bg-neutral-900">
          {heroImageUrl && (
            <img src={heroImageUrl} alt={property.title} onClick={() => setLightboxIndex(0)} className="w-full h-auto block cursor-zoom-in" />
          )}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: heroOverlay }} />
          <div className="absolute inset-x-0 bottom-0 z-10 max-w-4xl px-6 md:px-12 pb-16">
            <h1 className="font-serif text-2xl sm:text-4xl md:text-6xl text-white leading-tight uppercase flex items-center gap-3 sm:gap-4">
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
            <div key={photo.id} className="relative shrink-0 w-full snap-start bg-neutral-900">
              {photo.url && (
                <img src={photo.url} alt={property.title} onClick={() => setLightboxIndex(i)} className="w-full h-auto block cursor-zoom-in" />
              )}
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: heroOverlay }} />
            </div>
          ))}

          <div className="absolute inset-x-0 bottom-0 z-10 max-w-4xl px-6 md:px-12 pb-10">
            <h1 className="font-serif text-2xl sm:text-4xl md:text-6xl text-white leading-tight uppercase flex items-center gap-3 sm:gap-4">
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
      </section>

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

      {/* 4. Image carousel */}
      {carouselPhotos.length > 0 && (
        <section className="hidden md:block bg-white py-16 md:py-20">
          <h3 className="px-6 md:px-12 font-serif text-lg sm:text-xl md:text-2xl uppercase tracking-wide text-brand-blue mb-8">
            Related Images
          </h3>
          <div className="relative w-full">
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 md:px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {carouselPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx + 1)}
                  className="shrink-0 w-[85%] sm:w-[60%] md:w-[38%] aspect-[4/5] snap-start overflow-hidden cursor-zoom-in group bg-neutral-200"
                >
                  <img
                    src={photo.url ?? undefined}
                    alt=""
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              aria-label="Previous image"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-brand-blue">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              aria-label="Next image"
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-brand-blue">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>
      )}

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
              <form onSubmit={handleInquirySubmit} className="space-y-5">
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
      {lightboxIndex !== null && galleryUrls.length > 0 && (
        <Lightbox urls={galleryUrls} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  );
}
