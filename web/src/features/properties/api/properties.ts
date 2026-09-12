import { apiClient } from "@/lib/api-client";
import type {
  PaginatedResponse,
  Property,
  PropertyDetail,
  PropertyOwner,
  CreatePropertyPayload,
  CreateOwnerPayload,
} from "../types";

export async function fetchProperties(page: number = 1): Promise<PaginatedResponse<Property>> {
  const { data } = await apiClient.get<PaginatedResponse<Property>>("/properties/", {
    params: { page },
  });
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
