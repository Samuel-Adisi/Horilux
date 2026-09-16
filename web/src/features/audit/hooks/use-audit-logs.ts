import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "../api/audit-logs";
import type { AuditLogsQuery } from "../types";

export function useAuditLogs(query: AuditLogsQuery = {}) {
  return useQuery({
    queryKey: ["audit-logs", query],
    queryFn: () => fetchAuditLogs(query),
  });
}
