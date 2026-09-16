import { apiClient } from "@/lib/api-client";
import type { LeadSourceStatsResponse } from "../types";

export async function fetchLeadSourceStats(): Promise<LeadSourceStatsResponse> {
  const { data } = await apiClient.get<LeadSourceStatsResponse>("/lead-source-stats/");
  return data;
}
