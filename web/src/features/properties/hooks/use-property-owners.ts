import { useQuery } from "@tanstack/react-query";
import { fetchPropertyOwners } from "../api/properties";

export function usePropertyOwners() {
  return useQuery({
    queryKey: ["property-owners"],
    queryFn: fetchPropertyOwners,
  });
}
