import api from "@/lib/api";
import type { SavedProperty, PropertyInquiry } from "@/lib/types";

export async function fetchSavedProperties() {
  const { data } = await api.get<SavedProperty[]>("/public/account/saved-properties/");
  return data;
}

export async function saveProperty(propertyId: string) {
  const { data } = await api.post<SavedProperty>("/public/account/saved-properties/", { property: propertyId });
  return data;
}

export async function unsaveProperty(savedId: number) {
  await api.delete(`/public/account/saved-properties/${savedId}/`);
}

export async function fetchMyInquiries() {
  const { data } = await api.get<{ results: PropertyInquiry[] }>("/public/inquiries/");
  return data.results;
}

export interface CreateInquiryPayload {
  property: string;
  message: string;
  requested_viewing: boolean;
  requested_viewing_date?: string;
}

export async function createInquiry(payload: CreateInquiryPayload) {
  const { data } = await api.post<PropertyInquiry>("/public/inquiries/", payload);
  return data;
}
