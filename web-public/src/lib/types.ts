export interface PropertyListItem {
  id: string;
  title: string;
  region: string;
  property_type: string;
  listing_type: "sale" | "rent";
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
