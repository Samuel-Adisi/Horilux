import { useQuery } from "@tanstack/react-query";
import { fetchProperties } from "../api/properties";

export function useProperties(page: number = 1) {
  return useQuery({
    queryKey: ["properties", page],
    queryFn: () => fetchProperties(page),
  });
}
