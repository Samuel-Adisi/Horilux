import { apiClient } from "@/lib/api-client";
import type { PropertyPerformanceResponse } from "../types";

export async function fetchPropertyPerformance(): Promise<PropertyPerformanceResponse> {
  const { data } = await apiClient.get<PropertyPerformanceResponse>("/reports/property-performance/");
  return data;
}
