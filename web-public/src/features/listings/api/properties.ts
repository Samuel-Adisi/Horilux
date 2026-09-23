import api from "@/lib/api";
import type { PaginatedResponse, PropertyDetail, PropertyListItem } from "@/lib/types";

export interface PropertyFilters {
  region?: string;
  property_type?: string;
  listing_type?: "sale" | "rent";
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
  ordering?: string;
  page?: number;
}

export async function fetchProperties(filters: PropertyFilters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const { data } = await api.get<PaginatedResponse<PropertyListItem>>("/public/properties/", { params });
  return data;
}

export async function fetchPropertyById(id: string) {
  const { data } = await api.get<PropertyDetail>(`/public/properties/${id}/`);
  return data;
}
