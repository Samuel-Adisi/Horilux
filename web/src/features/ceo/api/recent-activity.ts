import { apiClient } from "@/lib/api-client";

export interface RecentActivityItem {
  id: string;
  actor: string;
  action: string;
  model: string;
  object_id: string;
  timestamp: string;
}

export async function fetchRecentActivity(): Promise<RecentActivityItem[]> {
  const { data } = await apiClient.get<RecentActivityItem[]>("/reports/recent-activity/");
  return data;
}
