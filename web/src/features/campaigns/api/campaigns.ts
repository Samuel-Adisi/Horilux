import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse, Campaign } from "../types";

export async function fetchCampaigns(): Promise<PaginatedResponse<Campaign>> {
  const { data } = await apiClient.get<PaginatedResponse<Campaign>>("/campaigns/");
  return data;
}
