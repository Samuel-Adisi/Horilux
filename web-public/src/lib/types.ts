export type RentalPeriod = "daily" | "monthly" | "yearly";

export interface PropertyListItem {
  id: string;
  title: string;
  region: string;
  /** Area name (e.g. East Legon). Not yet sent by the list endpoint; shown when present. */
  location?: string;
  property_type: string;
  listing_type: "sale" | "rent";
  /** Not yet sent by the list endpoint; the detail endpoint already sends it. */
  rental_period?: RentalPeriod | null;
  price: string;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  building_size: string | null;
  land_size: string | null;
  status: string;
  cover_image: string | null;
  published_at: string | null;
}

export interface PropertyMediaItem {
  id: string;
  url: string | null;
  media_type: "photo" | "video";
  order: number;
}

export interface PropertyDetail extends PropertyListItem {
  location: string;
  address: string;
  description?: string;
  media: PropertyMediaItem[];
  amenities: string[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SavedProperty {
  id: number;
  property: string;
  property_detail: PropertyListItem;
  created_at: string;
}

export interface PropertyInquiry {
  id: number;
  property: string;
  message: string;
  requested_viewing: boolean;
  requested_viewing_date: string | null;
  created_at: string;
}
