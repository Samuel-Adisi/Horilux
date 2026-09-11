

export type PropertyCardData = {
  id: string;
  title: string;
  location: string;
  property_type: string;
  listing_type: "sale" | "rent";
  price: number | string;
  bedrooms?: number;
  bathrooms?: number;
  image_url?: string;
  region?: string;
  rental_period?: "daily" | "monthly" | "yearly";
  sqft?: number;
  amenities?: string[];
};

export function PropertyCard({
  property,
  onClick,
}: {
  property: PropertyCardData;
  onClick: () => void;
}) {
  const price = Number(property.price);
  const formattedPrice = Number.isNaN(price)
    ? property.price
    : price.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer gap-4 border-b border-[#EFEDE6] px-5 py-4 last:border-0 hover:bg-[#F7F6F3]"
    >
      <div className="h-28 w-40 shrink-0 overflow-hidden rounded-[6px] bg-[#EFEDE6]">
        {property.image_url ? (
          <img src={property.image_url} alt={property.title} className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="flex-1 py-1">
        <p className="text-[13.5px] font-medium text-[#17131F]">{property.title}</p>
        <p className="mt-1 text-[12px] text-[#8A8578]">{property.location}</p>
        <div className="mt-2 flex items-center gap-3 text-[12px] text-[#3E3A31]">
          <span className="capitalize">{property.property_type}</span>
          <span>·</span>
          <span className="capitalize">{property.listing_type}</span>
          {property.bedrooms != null && (
            <>
              <span>·</span>
              <span>{property.bedrooms} bd</span>
            </>
          )}
          {property.bathrooms != null && (
            <>
              <span>·</span>
              <span>{property.bathrooms} ba</span>
            </>
          )}
        </div>
        <p className="mt-2 text-[13px] font-semibold text-[#240270]">{formattedPrice}</p>
      </div>
    </div>
  );
}