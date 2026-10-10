import { useQuery } from "@tanstack/react-query";
import { fetchProperties, fetchPropertyById, type PropertyFilters } from "../api/properties";

type UsePropertiesOptions = PropertyFilters & { staleTime?: number; gcTime?: number; enabled?: boolean };

export function useProperties({ staleTime, gcTime, enabled, ...filters }: UsePropertiesOptions = {}) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => fetchProperties(filters),
    staleTime,
    gcTime,
    enabled,
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id as string),
    enabled: !!id,
  });
}
