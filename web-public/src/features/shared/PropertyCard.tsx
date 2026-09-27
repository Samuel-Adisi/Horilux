import { Link } from "react-router-dom";
import { useState } from "react";
import { Heart } from "lucide-react";
import type { PropertyListItem } from "@/lib/types";
import { useAuthStore } from "@/lib/auth-store";
import { useToggleSavedProperty } from "@/features/favorites/hooks/use-saved-properties";

function formatPrice(price: string, currency: string) {
  const n = Number(price);
  if (Number.isNaN(n)) return currency + " " + price;
  return currency + " " + n.toLocaleString();
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
  const aspect =
    size === "hero" ? "min-h-screen" : size === "lg" ? "aspect-[4/3] sm:aspect-[16/9]" : "aspect-[4/3]";
  const titleClass = size === "hero" ? "text-2xl md:text-4xl" : size === "lg" ? "text-lg sm:text-xl md:text-2xl" : "text-lg";
  const priceClass = size === "hero" ? "text-2xl md:text-3xl" : size === "lg" ? "text-lg sm:text-xl md:text-2xl" : "text-xl";
  const padClass = size === "hero" ? "p-8 sm:p-12 md:p-16" : "p-4 sm:p-5";

  const customer = useAuthStore((s) => s.customer);
  const { isSaved, toggle, isPending } = useToggleSavedProperty();
  const saved = !!isSaved(property.id);

  function handleToggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!customer || isPending) return;
    toggle(property.id);
  }

  return (
    <Link
      to={`/listings/${property.id}`}
      className={`group relative block ${aspect} overflow-hidden`}
    >
      {property.cover_image ? (
        <>
          <div
            aria-hidden
            className={`absolute inset-0 bg-neutral-200 transition-opacity duration-500 ${
              loaded ? "opacity-0" : "opacity-100 animate-pulse"
            }`}
          />
          <img
            src={property.cover_image}
            alt={property.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-700 ${
              disableHoverEffects ? "" : "group-hover:scale-105 group-hover:brightness-75"
            } ${loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105"}`}
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
          No image
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300" />
      <div
        className={`absolute inset-0 bg-black/0 transition-colors duration-300 ${
          disableHoverEffects ? "" : "group-hover:bg-black/30"
        }`}
      />

      {customer && size !== "hero" && (
        <button
          type="button"
          onClick={handleToggleSave}
          aria-label={saved ? "Remove from favorites" : "Add to favorites"}
          disabled={isPending}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors disabled:opacity-60"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${saved ? "fill-pink-500 text-pink-500" : "text-white"}`}
            strokeWidth={1.75}
          />
        </button>
      )}


      {(property.bedrooms != null || property.bathrooms != null) && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full bg-black/30 backdrop-blur-sm px-3 py-1 text-xs text-white/90 whitespace-nowrap">
          {property.bedrooms != null && `${String(property.bedrooms).padStart(2, "0")} Bedrooms`}
          {property.bedrooms != null && property.bathrooms != null && "  "}
          {property.bathrooms != null && `${String(property.bathrooms).padStart(2, "0")} Bathrooms`}
        </div>
      )}

      <div className={`absolute inset-x-0 bottom-0 text-white ${padClass}`}>
        <div className="flex items-center gap-3">
          <p className={`font-serif leading-snug tracking-wide uppercase truncate ${titleClass}`}>
            {property.title}
          </p>
          {customer && size === "hero" && (
            <button
              type="button"
              onClick={handleToggleSave}
              aria-label={saved ? "Remove from favorites" : "Add to favorites"}
              disabled={isPending}
              className="shrink-0 flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors disabled:opacity-60"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${saved ? "fill-pink-500 text-pink-500" : "text-white"}`}
                strokeWidth={1.75}
              />
            </button>
          )}
        </div>
        <div className="mt-2 flex items-end justify-between gap-2">
          <p className={`font-serif ${priceClass} truncate`}>
            {formatPrice(property.price, property.currency)}
          </p>
          {(property.building_size || property.land_size) && (
            <p className="text-xs text-white/70 text-right shrink-0">
              {property.building_size && `Floor Area ${property.building_size}`}
              {property.building_size && property.land_size && " | "}
              {property.land_size && `Land Area ${property.land_size}`}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
