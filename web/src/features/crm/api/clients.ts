import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/features/properties/types";
import type { Client, ClientsQuery } from "../types";

export async function fetchClients(query: ClientsQuery = {}): Promise<PaginatedResponse<Client>> {
  const params: Record<string, string | number> = { page: query.page ?? 1 };
  if (query.search) params.search = query.search;
  const { data } = await apiClient.get<PaginatedResponse<Client>>("/clients/", { params });
  return data;
}
