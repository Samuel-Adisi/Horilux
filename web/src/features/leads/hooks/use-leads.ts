import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../api/leads";
import type { LeadsQuery } from "../types";

export function useLeads(query: LeadsQuery | number = 1) {
  const normalized: LeadsQuery = typeof query === "number" ? { page: query } : query;
  return useQuery({
    queryKey: ["leads", normalized],
    queryFn: () => fetchLeads(normalized),
  });
}
