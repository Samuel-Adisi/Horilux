import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cleanParams, type Paginated } from "@/lib/types";

export interface AuditLog {
  id: string;
  actor: string | null;
  actor_name: string;
  action: string;
  model_name: string;
  object_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  timestamp: string;
}

export interface AuditQuery {
  page?: number;
  search?: string;
  model_name?: string;
  action?: string;
}

export const AUDITED_MODELS = ["Property", "Lead", "Transaction", "Commission", "CommissionRule", "MarketingCampaign"];

export function useAuditLogs(q: AuditQuery) {
  return useQuery({
    queryKey: ["audit-logs", q],
    queryFn: async () =>
      (
        await apiClient.get<Paginated<AuditLog>>("/audit-logs/", {
          params: cleanParams({ page: q.page ?? 1, search: q.search, model_name: q.model_name, action: q.action }),
        })
      ).data,
    placeholderData: keepPreviousData,
  });
}
