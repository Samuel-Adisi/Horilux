import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../api/leads";

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
  });
}
