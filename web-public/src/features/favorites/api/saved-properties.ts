import api from "@/lib/api";
import type { PaginatedResponse, SavedProperty } from "@/lib/types";

export async function fetchSavedProperties() {
  const { data } = await api.get<SavedProperty[] | PaginatedResponse<SavedProperty>>(
    "/public/saved-properties/"
  );
  return Array.isArray(data) ? data : data.results;
}

export async function saveProperty(propertyId: string) {
  const { data } = await api.post<SavedProperty>("/public/saved-properties/", { property: propertyId });
  return data;
}

export async function unsaveProperty(savedPropertyId: number) {
  await api.delete(`/public/saved-properties/${savedPropertyId}/`);
}

