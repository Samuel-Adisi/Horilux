import { Link } from "react-router-dom";
import { useState } from "react";
import { BedDouble, Bath, Ruler, Heart, MapPin, ImageOff } from "lucide-react";
import type { PropertyListItem } from "@/lib/types";
import { useToggleSavedProperty } from "@/features/favorites/hooks/use-saved-properties";

const PERIOD: Record<string, string> = { daily: "/ day", monthly: "/ month", yearly: "/ year" };

function formatPrice(price: string) {
  const n = Number(price);
  if (!price || Number.isNaN(n) || n <= 0) return "Price on request";
  return "GH₵ " + n.toLocaleString();
}

export default function PropertyCard({
  property,
  size = "md",
  disableHoverEffects = false,
}: {
  property: PropertyListItem;
  size?: "md" | "lg" | "hero";
  disableHoverEffects?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { isSaved, toggle, isPending } = useToggleSavedProperty();
  const saved = !!isSaved(property.id);
  const pending = isPending(property.id);

  const aspect =
    size === "hero" ? "min-h-screen" : size === "lg" ? "aspect-[4/3] sm:aspect-[16/9]" : "aspect-[4/3]";
  const titleClass =
    size === "hero" ? "text-2xl md:text-4xl" : size === "lg" ? "text-lg sm:text-xl md:text-2xl" : "text-lg";
  const priceClass =
    size === "hero" ? "text-2xl md:text-3xl" : size === "lg" ? "text-xl sm:text-2xl" : "text-xl";
  const padClass = size === "hero" ? "p-8 sm:p-12 md:p-16" : "p-4 sm:p-6";

  const place = [property.location, property.region].filter(Boolean).join(", ");
  const period = property.listing_type === "rent" && property.rental_period ? PERIOD[property.rental_period] : "";
  const underOffer = property.status === "under_offer";
  const hasImage = !!property.cover_image && !failed;

  const specs = [
    property.bedrooms != null && { Icon: BedDouble, text: property.bedrooms + " Bed" },
    property.bathrooms != null && { Icon: Bath, text: property.bathrooms + " Bath" },
    property.building_size && { Icon: Ruler, text: property.building_size + " m²" },
  ].filter(Boolean) as { Icon: typeof Bath; text: string }[];

  function handleToggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!pending) toggle(property.id);
  }

  return (
    <Link
      to={"/listings/" + property.id}
      aria-label={property.title + ", " + formatPrice(property.price) + (period ? " " + period : "")}
      className={"group relative block overflow-hidden bg-neutral-200 " + aspect}
    >
      {hasImage ? (
        <>
          <div aria-hidden className={"skeleton absolute inset-0 transition-opacity duration-500 " + (loaded ? "opacity-0" : "opacity-100")} />
          <img
            src={property.cover_image as string}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={
              "h-full w-full object-cover transition-all duration-700 ease-out " +
              (disableHoverEffects ? "" : "group-hover:scale-105 group-focus-visible:scale-105 ") +
              (loaded ? "opacity-100 blur-0" : "opacity-0 blur-md")
            }
          />
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-sand text-sm text-neutral-500">
          <ImageOff className="h-6 w-6" aria-hidden />
          Photos coming soon
        </div>
      )}

      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10" />
      {!disableHoverEffects && (
        <div aria-hidden className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
      )}

      <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2 sm:left-5 sm:top-5">
        <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-blue">
          {property.listing_type === "rent" ? "For Rent" : "For Sale"}
        </span>
        {underOffer && (
          <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-900">
            Under Offer
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleToggleSave}
        aria-label={saved ? "Remove " + property.title + " from favorites" : "Save " + property.title + " to favorites"}
        aria-pressed={saved}
        disabled={pending}
        className="absolute right-1 top-1 z-10 flex h-11 w-11 items-center justify-center sm:right-3 sm:top-3"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm transition-colors hover:bg-black/55">
          <Heart
            className={"h-4 w-4 transition-colors " + (saved ? "fill-rose-500 text-rose-500" : "text-white")}
            strokeWidth={1.75}
            aria-hidden
          />
        </span>
      </button>

      <div className={"absolute inset-x-0 bottom-0 text-white " + padClass}>
        {place && (
          <p className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-white/80">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{place}</span>
          </p>
        )}
        <p className={"truncate font-serif uppercase leading-snug tracking-wide " + titleClass}>{property.title}</p>
        <div className="mt-2.5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <p className={"font-serif " + priceClass}>
            {formatPrice(property.price)}
            {period && <span className="ml-1.5 font-sans text-xs font-medium text-white/75">{period}</span>}
          </p>
          {specs.length > 0 && (
            <ul className="flex items-center gap-3 text-xs text-white/85">
              {specs.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Link>
  );
}
