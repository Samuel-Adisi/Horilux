import { apiClient } from "@/lib/api-client";
import type {
  PaginatedResponse,
  Viewing,
  CreateViewingPayload,
  CompleteViewingPayload,
  CancelViewingPayload,
} from "../types";

export async function fetchViewings(page: number = 1): Promise<PaginatedResponse<Viewing>> {
  const { data } = await apiClient.get<PaginatedResponse<Viewing>>("/viewings/", {
    params: { page },
  });
  return data;
}

export async function createViewing(payload: CreateViewingPayload): Promise<Viewing> {
  const { data } = await apiClient.post<Viewing>("/viewings/", payload);
  return data;
}

export async function confirmViewing(id: string): Promise<Viewing> {
  const { data } = await apiClient.post<Viewing>(`/viewings/${id}/confirm/`);
  return data;
}

export async function completeViewing(id: string, payload: CompleteViewingPayload): Promise<Viewing> {
  const { data } = await apiClient.post<Viewing>(`/viewings/${id}/complete/`, payload);
  return data;
}

export async function cancelViewing(id: string, payload: CancelViewingPayload): Promise<Viewing> {
  const { data } = await apiClient.post<Viewing>(`/viewings/${id}/cancel/`, payload);
  return data;
}
