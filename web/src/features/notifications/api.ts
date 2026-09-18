import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cleanParams, type Paginated } from "@/lib/types";

export interface Notification {
  id: string;
  type: string;
  message: string;
  related_model: string | null;
  object_id: string | null;
  read: boolean;
  created_at: string;
}

/** Where a notification should take you when clicked. */
export function notificationLink(n: Notification): string | null {
  if (!n.object_id) return null;
  switch (n.related_model) {
    case "property":
      return `/properties/${n.object_id}`;
    case "lead":
      return `/leads/${n.object_id}`;
    case "transaction":
      return `/transactions/${n.object_id}`;
    case "viewing":
      return "/viewings";
    case "followup":
      return "/follow-ups";
    case "marketingcampaign":
      return "/campaigns";
    case "task":
      return "/tasks";
    default:
      return null;
  }
}

export function useUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => (await apiClient.get<{ unread_count: number }>("/notifications/unread-count/")).data.unread_count,
    enabled,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 20_000,
  });
}

export function useNotifications(q: { page?: number; read?: "true" | "false" | "" }, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["notifications", "list", q],
    queryFn: async () =>
      (await apiClient.get<Paginated<Notification>>("/notifications/", { params: cleanParams({ page: q.page ?? 1, read: q.read }) })).data,
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post<Notification>(`/notifications/${id}/mark-read/`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await apiClient.post<{ marked_read: number }>("/notifications/mark-all-read/")).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
