import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/features/properties/types";
import type { AuditLog, AuditLogsQuery } from "../types";

export async function fetchAuditLogs(query: AuditLogsQuery = {}): Promise<PaginatedResponse<AuditLog>> {
  const params: Record<string, string | number> = { page: query.page ?? 1 };
  if (query.search) params.search = query.search;
  if (query.model_name) params.model_name = query.model_name;
  if (query.action) params.action = query.action;
  const { data } = await apiClient.get<PaginatedResponse<AuditLog>>("/audit-logs/", { params });
  return data;
}
