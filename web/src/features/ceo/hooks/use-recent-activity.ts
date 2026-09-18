import { useQuery } from "@tanstack/react-query";
import { fetchRecentActivity } from "../api/recent-activity";

export function useRecentActivity() {
  return useQuery({
    queryKey: ["ceo-recent-activity"],
    queryFn: fetchRecentActivity,
  });
}
