import { Link } from "react-router-dom";
import { useState } from "react";
import type { PropertyListItem } from "@/lib/types";

function formatPrice(price: string, currency: string) {
  const n = Number(price);
  if (Number.isNaN(n)) return currency + " " + price;
  return currency + " " + n.toLocaleString();
}

export default function PropertyCard({
  property,
  size = "md",
}: {
  property: PropertyListItem;
  size?: "md" | "lg";
}) {
  const [loaded, setLoaded] = useState(false);
  const aspect = size === "lg" ? "aspect-[4/3] sm:aspect-[16/9]" : "aspect-[4/3]";
  const titleClass = size === "lg" ? "text-lg sm:text-xl md:text-2xl" : "text-lg";
  const priceClass = size === "lg" ? "text-lg sm:text-xl md:text-2xl" : "text-xl";

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
            className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-75 ${
              loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105"
            }`}
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
          No image
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

      {(property.bedrooms != null || property.bathrooms != null) && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full bg-black/30 backdrop-blur-sm px-3 py-1 text-xs text-white/90 whitespace-nowrap">
          {property.bedrooms != null && `${String(property.bedrooms).padStart(2, "0")} Bedrooms`}
          {property.bedrooms != null && property.bathrooms != null && "  "}
          {property.bathrooms != null && `${String(property.bathrooms).padStart(2, "0")} Bathrooms`}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
        <p className={`font-serif leading-snug tracking-wide uppercase truncate ${titleClass}`}>
          {property.title}
        </p>
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
