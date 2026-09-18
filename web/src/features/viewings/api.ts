import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cleanParams, type Paginated } from "@/lib/types";

export type ViewingStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
export type ViewingOutcome = "hot" | "warm" | "cold";

export const VIEWING_STATUS_LABEL: Record<ViewingStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export const OUTCOME_LABEL: Record<ViewingOutcome, string> = { hot: "Hot", warm: "Warm", cold: "Cold" };

export interface Viewing {
  id: string;
  client: string;
  client_name: string;
  property: string;
  property_title: string;
  property_location: string;
  property_image_url: string | null;
  agent: string | null;
  agent_name: string | null;
  date: string;
  time: string;
  status: ViewingStatus;
  notes: string;
  outcome: ViewingOutcome | null;
  next_action: string;
  created_at: string;
}

export interface ViewingInput {
  client: string;
  property: string;
  agent?: string | null;
  date: string;
  time: string;
  notes?: string;
}

export interface ViewingsQuery {
  page?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface FollowUp {
  id: string;
  viewing: string | null;
  lead: string | null;
  lead_name: string | null;
  client: string | null;
  client_name: string | null;
  property_title: string | null;
  due_date: string;
  completed: boolean;
  notes: string;
  responsible_agent: string | null;
  responsible_agent_name: string | null;
  created_at: string;
}

export interface FollowUpInput {
  viewing?: string | null;
  lead?: string | null;
  client?: string | null;
  due_date: string;
  notes?: string;
  responsible_agent?: string | null;
}

export function useViewings(q: ViewingsQuery, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["viewings", "list", q],
    queryFn: async () =>
      (
        await apiClient.get<Paginated<Viewing>>("/viewings/", {
          params: cleanParams({ page: q.page ?? 1, status: q.status, date_from: q.date_from, date_to: q.date_to }),
        })
      ).data,
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

function useInvalidateViewings() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["viewings"] });
    qc.invalidateQueries({ queryKey: ["follow-ups"] });
    qc.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useCreateViewing() {
  const invalidate = useInvalidateViewings();
  return useMutation({
    mutationFn: async (input: ViewingInput) => (await apiClient.post<Viewing>("/viewings/", input)).data,
    onSuccess: invalidate,
  });
}

export function useUpdateViewing() {
  const invalidate = useInvalidateViewings();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<ViewingInput> }) =>
      (await apiClient.patch<Viewing>(`/viewings/${id}/`, input)).data,
    onSuccess: invalidate,
  });
}

export function useConfirmViewing() {
  const invalidate = useInvalidateViewings();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post<Viewing>(`/viewings/${id}/confirm/`)).data,
    onSuccess: invalidate,
  });
}

export function useCompleteViewing() {
  const invalidate = useInvalidateViewings();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { outcome: ViewingOutcome; next_action?: string; follow_up_due_date?: string };
    }) => (await apiClient.post<Viewing>(`/viewings/${id}/complete/`, payload)).data,
    onSuccess: invalidate,
  });
}

export function useCancelViewing() {
  const invalidate = useInvalidateViewings();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { reason?: string; no_show?: boolean } }) =>
      (await apiClient.post<Viewing>(`/viewings/${id}/cancel/`, payload)).data,
    onSuccess: invalidate,
  });
}

export function useFollowUps(q: { page?: number; completed?: "true" | "false" | "" }, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["follow-ups", q],
    queryFn: async () =>
      (
        await apiClient.get<Paginated<FollowUp>>("/follow-ups/", {
          params: cleanParams({ page: q.page ?? 1, completed: q.completed }),
        })
      ).data,
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

export function useCreateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: FollowUpInput) => (await apiClient.post<FollowUp>("/follow-ups/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["follow-ups"] }),
  });
}

export function useCompleteFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post<FollowUp>(`/follow-ups/${id}/mark_complete/`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-ups"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
