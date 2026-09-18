import { apiClient } from "@/lib/api-client";

export interface TerritoryCorridor {
  name: string;
  property_count: number;
  gtv: number;
  avg_price: number | null;
}

export interface TerritoryIntelligenceResponse {
  corridors: TerritoryCorridor[];
  total_gtv: number;
}

export async function fetchTerritoryIntelligence(): Promise<TerritoryIntelligenceResponse> {
  const { data } = await apiClient.get<TerritoryIntelligenceResponse>("/reports/territory-intelligence/");
  return data;
}
