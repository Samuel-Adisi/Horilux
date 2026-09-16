import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { fetchProperties } from "../api/properties";
import type { PropertyDetail } from "../types";

async function fetchPendingApprovals(): Promise<PropertyDetail[]> {
  const list = await fetchProperties({ status: "pending_verification", page: 1 });
  const details = await Promise.all(
    list.results.map(async (p) => {
      const { data } = await apiClient.get<PropertyDetail>(`/properties/${p.id}/`);
      return data;
    })
  );
  return details;
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ["properties", "pending-approvals"],
    queryFn: fetchPendingApprovals,
  });
}
