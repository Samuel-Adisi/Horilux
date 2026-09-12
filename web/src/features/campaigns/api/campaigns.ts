import { apiClient } from "@/lib/api-client";
import type {
  PaginatedResponse,
  Campaign,
  CreateCampaignPayload,
  SchedulePayload,
} from "../types";

export async function fetchCampaigns(): Promise<PaginatedResponse<Campaign>> {
  const { data } = await apiClient.get<PaginatedResponse<Campaign>>("/campaigns/");
  return data;
}

export async function createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
  const { data } = await apiClient.post<Campaign>("/campaigns/", payload);
  return data;
}

export async function submitForReview(id: string): Promise<Campaign> {
  const { data } = await apiClient.post<Campaign>(`/campaigns/${id}/submit_for_review/`);
  return data;
}

export async function scheduleCampaign(
  id: string,
  payload: SchedulePayload
): Promise<Campaign> {
  const { data } = await apiClient.post<Campaign>(`/campaigns/${id}/schedule/`, payload);
  return data;
}

export async function publishCampaign(id: string): Promise<Campaign> {
  const { data } = await apiClient.post<Campaign>(`/campaigns/${id}/publish/`);
  return data;
}
