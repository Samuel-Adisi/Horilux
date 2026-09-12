import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PropertyDetail } from "../types";

export function usePropertyDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["properties", id],
    queryFn: async () => {
      const { data } = await apiClient.get<PropertyDetail>(`/properties/${id}/`);
      return data;
    },
    enabled: !!id,
  });
}
