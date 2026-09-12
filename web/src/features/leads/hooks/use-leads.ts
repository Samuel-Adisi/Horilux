import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../api/leads";

export function useLeads(page: number = 1) {
  return useQuery({
    queryKey: ["leads", page],
    queryFn: () => fetchLeads(page),
  });
}
