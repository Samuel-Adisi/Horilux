import { useQuery } from "@tanstack/react-query";
import { fetchLeadSourceStats } from "../api/lead-source-stats";

export function useLeadSourceStats() {
  return useQuery({
    queryKey: ["lead-source-stats"],
    queryFn: fetchLeadSourceStats,
  });
}
