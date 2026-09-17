import { useQuery } from "@tanstack/react-query";
import { fetchPropertyPerformance } from "../api/property-performance";

export function usePropertyPerformance() {
  return useQuery({
    queryKey: ["property-performance"],
    queryFn: fetchPropertyPerformance,
  });
}
