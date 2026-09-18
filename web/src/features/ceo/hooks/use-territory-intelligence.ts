import { useQuery } from "@tanstack/react-query";
import { fetchTerritoryIntelligence } from "../api/territory-intelligence";

export function useTerritoryIntelligence() {
  return useQuery({
    queryKey: ["ceo-territory-intelligence"],
    queryFn: fetchTerritoryIntelligence,
  });
}
