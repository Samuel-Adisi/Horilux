import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCompanyProfile,
  updateCompanyProfile,
  fetchIntegrations,
  fetchApprovalThreshold,
  updateApprovalThreshold,
  fetchNotificationPreferences,
  updateNotificationPreference,
} from "../api/settings";
import type { CompanyProfileUpdate } from "../types";

export function useCompanyProfile() {
  return useQuery({ queryKey: ["company-profile"], queryFn: fetchCompanyProfile });
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyProfileUpdate) => updateCompanyProfile(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company-profile"] }),
  });
}

export function useIntegrations() {
  return useQuery({ queryKey: ["integrations"], queryFn: fetchIntegrations });
}

export function useApprovalThreshold() {
  return useQuery({ queryKey: ["approval-threshold"], queryFn: fetchApprovalThreshold });
}

export function useUpdateApprovalThreshold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: string) => updateApprovalThreshold(value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["approval-threshold"] }),
  });
}

export function useNotificationPreferences() {
  return useQuery({ queryKey: ["notification-preferences"], queryFn: fetchNotificationPreferences });
}

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) => updateNotificationPreference(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notification-preferences"] }),
  });
}
