import { apiClient } from "@/lib/api-client";
import type {
  PaginatedResponse,
  Property,
  PropertyDetail,
  PropertyOwner,
  CreatePropertyPayload,
  CreateOwnerPayload,
  PropertiesQuery,
} from "../types";

export async function fetchProperties(query: PropertiesQuery = {}): Promise<PaginatedResponse<Property>> {
  const params: Record<string, string | number> = { page: query.page ?? 1 };
  if (query.status) params.status = query.status;
  if (query.search) params.search = query.search;
  const { data } = await apiClient.get<PaginatedResponse<Property>>("/properties/", { params });
  return data;
}

export async function fetchPropertyOwners(): Promise<PaginatedResponse<PropertyOwner>> {
  const { data } = await apiClient.get<PaginatedResponse<PropertyOwner>>("/property-owners/");
  return data;
}

export async function createPropertyOwner(payload: CreateOwnerPayload): Promise<PropertyOwner> {
  const { data } = await apiClient.post<PropertyOwner>("/property-owners/", payload);
  return data;
}

export async function createProperty(payload: CreatePropertyPayload): Promise<PropertyDetail> {
  const { data } = await apiClient.post<PropertyDetail>("/properties/", payload);
  return data;
}

export async function submitForVerification(id: string): Promise<PropertyDetail> {
  const { data } = await apiClient.post<PropertyDetail>(`/properties/${id}/submit_for_verification/`);
  return data;
}

export async function publishProperty(id: string): Promise<PropertyDetail> {
  const { data } = await apiClient.post<PropertyDetail>(`/properties/${id}/publish/`);
  return data;
}

export async function approveProperty(id: string): Promise<PropertyDetail> {
  const { data } = await apiClient.post<PropertyDetail>(`/properties/${id}/approve/`);
  return data;
}
