import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cleanParams, type Paginated } from "@/lib/types";

export type CampaignStatus = "draft" | "in_review" | "scheduled" | "published";

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  scheduled: "Scheduled",
  published: "Published",
};

export const CHANNELS = ["Instagram", "Facebook", "TikTok", "WhatsApp", "Website", "Property portal", "Email", "Print"];

export interface CampaignPerformance {
  id: string;
  campaign: string;
  views: number;
  enquiries: number;
  leads_generated: number;
  viewings_booked: number;
  conversions: number;
  recorded_at: string;
}

export interface CampaignContent {
  headline?: string;
  body?: string;
  channels?: string[];
  [key: string]: unknown;
}

export interface Campaign {
  id: string;
  property: string;
  property_title?: string | null;
  status: CampaignStatus;
  status_label?: string;
  content: CampaignContent;
  scheduled_date: string | null;
  published_date: string | null;
  created_by: string;
  created_by_name?: string | null;
  created_at: string;
  performance_records: CampaignPerformance[];
}

export interface CampaignInput {
  property: string;
  content: CampaignContent;
  scheduled_date?: string | null;
}

export type PerformanceInput = Omit<CampaignPerformance, "id" | "recorded_at">;

export function useCampaigns(q: { page?: number; status?: string }, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["campaigns", "list", q],
    queryFn: async () =>
      (await apiClient.get<Paginated<Campaign>>("/campaigns/", { params: cleanParams({ page: q.page ?? 1, status: q.status }) })).data,
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    qc.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useCreateCampaign() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: CampaignInput) => (await apiClient.post<Campaign>("/campaigns/", input)).data,
    onSuccess: invalidate,
  });
}

export function useUpdateCampaign() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<CampaignInput> }) =>
      (await apiClient.patch<Campaign>(`/campaigns/${id}/`, input)).data,
    onSuccess: invalidate,
  });
}

export function useCampaignAction() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      body,
    }: {
      id: string;
      action: "submit_for_review" | "schedule" | "publish";
      body?: { scheduled_date: string };
    }) => (await apiClient.post<Campaign>(`/campaigns/${id}/${action}/`, body)).data,
    onSuccess: invalidate,
  });
}

export function useRecordPerformance() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: PerformanceInput) => (await apiClient.post<CampaignPerformance>("/campaign-performance/", input)).data,
    onSuccess: invalidate,
  });
}
