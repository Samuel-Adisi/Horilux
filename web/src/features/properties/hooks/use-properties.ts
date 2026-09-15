import { useQuery } from "@tanstack/react-query";
import { fetchProperties } from "../api/properties";
import type { PropertiesQuery } from "../types";

export function useProperties(query: PropertiesQuery | number = 1) {
  const normalized: PropertiesQuery = typeof query === "number" ? { page: query } : query;
  return useQuery({
    queryKey: ["properties", normalized],
    queryFn: () => fetchProperties(normalized),
  });
}
