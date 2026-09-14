import { apiClient } from "@/lib/api-client";
import type { CeoDashboardData } from "../types";

export async function fetchCeoDashboard(): Promise<CeoDashboardData> {
  const { data } = await apiClient.get<CeoDashboardData>("/reports/ceo-dashboard/");
  return data;
}
