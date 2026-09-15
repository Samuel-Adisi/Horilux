export type PropertyType = "residential" | "commercial" | string;
export type ListingType = "sale" | "rent" | string;
export type PropertyStatus =
  | "draft"
  | "onboarding"
  | "pending_verification"
  | "verified"
  | "pending_approval"
  | "marketing_ready"
  | "published"
  | "under_offer"
  | "sold_rented"
  | "archived"
  | string;

export interface PropertyOwner {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  created_at: string;
}

export interface PropertyMedia {
  id: string;
  property: string;
  file: string; // Cloudinary URL
  media_type: "photo" | "video" | string;
  order: number;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface Property {
  id: string;
  title: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: string; // decimal as string from DRF
  currency: string;
  location: string;
  region?: string | null;
  rental_period?: "daily" | "monthly" | "yearly" | null;
  sqft?: string | null;
  amenities?: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  status: PropertyStatus;
  status_label?: string;
  completion_percent: number;
  agent: string; // user id
  agent_name?: string | null;
  created_at: string;
  image_url?: string | null;
}

export interface PropertiesQuery {
  status?: string;
  search?: string;
  page?: number;
}

export interface PropertyDetail extends Property {
  address: string;
  land_size: string | null;
  building_size: string | null;
  description: string;
  owner: string;
  owner_detail: PropertyOwner;
  updated_at: string;
  media: PropertyMedia[];
}

export interface CreatePropertyPayload {
  title: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: string;
  currency: string;
  location: string;
  owner: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
}

export interface CreateOwnerPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
