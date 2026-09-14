import { useQuery } from "@tanstack/react-query";
import { fetchCeoDashboard } from "../api/ceo-dashboard";

export function useCeoDashboard() {
  return useQuery({
    queryKey: ["ceo-dashboard"],
    queryFn: fetchCeoDashboard,
  });
}
