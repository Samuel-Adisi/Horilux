import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/features/properties/types";
import type { Interaction, InteractionsQuery } from "../types";

export async function fetchInteractions(query: InteractionsQuery = {}): Promise<PaginatedResponse<Interaction>> {
  const params: Record<string, string | number> = { page: query.page ?? 1 };
  if (query.search) params.search = query.search;
  if (query.type) params.type = query.type;
  if (query.lead) params.lead = query.lead;
  if (query.client) params.client = query.client;
  const { data } = await apiClient.get<PaginatedResponse<Interaction>>("/interactions/", { params });
  return data;
}
