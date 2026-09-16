import { apiClient } from "@/lib/api-client";
import type {
  CompanyProfile,
  CompanyProfileUpdate,
  IntegrationStatus,
  ApprovalThreshold,
  NotificationPreference,
} from "../types";

export async function fetchCompanyProfile(): Promise<CompanyProfile> {
  const { data } = await apiClient.get<CompanyProfile>("/company-profile/");
  return data;
}

export async function updateCompanyProfile(payload: CompanyProfileUpdate): Promise<CompanyProfile> {
  const { data } = await apiClient.patch<CompanyProfile>("/company-profile/", payload);
  return data;
}

export async function fetchIntegrations(): Promise<IntegrationStatus[]> {
  const { data } = await apiClient.get<{ results: IntegrationStatus[] }>("/integrations/");
  return data.results;
}

export async function fetchApprovalThreshold(): Promise<ApprovalThreshold> {
  const { data } = await apiClient.get<ApprovalThreshold>("/approval-threshold/");
  return data;
}

export async function updateApprovalThreshold(ceo_approval_min_price: string): Promise<ApprovalThreshold> {
  const { data } = await apiClient.patch<ApprovalThreshold>("/approval-threshold/", { ceo_approval_min_price });
  return data;
}

export async function fetchNotificationPreferences(): Promise<NotificationPreference[]> {
  const { data } = await apiClient.get<{ results: NotificationPreference[] }>("/notification-preferences/");
  return data.results;
}

export async function updateNotificationPreference(id: number, enabled: boolean): Promise<NotificationPreference> {
  const { data } = await apiClient.patch<NotificationPreference>(`/notification-preferences/${id}/`, { enabled });
  return data;
}
