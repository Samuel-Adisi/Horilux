import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { Department, Role, User } from "@/features/accounts/types";

// ---------------------------------------------------------------------------
// Staff (accounts/staff/ — plain arrays, not paginated)
// ---------------------------------------------------------------------------

export interface StaffInput {
  email?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  department: string | null;
  role: string | null;
  password?: string;
  is_active?: boolean;
}

export function useStaff(search: string) {
  return useQuery({
    queryKey: ["staff", search],
    queryFn: async () => (await apiClient.get<User[]>("/accounts/staff/", { params: search ? { search } : {} })).data,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await apiClient.get<Department[]>("/accounts/departments/")).data,
    staleTime: 10 * 60_000,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await apiClient.get<Role[]>("/accounts/roles/")).data,
    staleTime: 10 * 60_000,
  });
}

function useInvalidateStaff() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["staff"] });
    qc.invalidateQueries({ queryKey: ["users"] });
    qc.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useSaveStaff() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: StaffInput }) =>
      id
        ? (await apiClient.patch(`/accounts/staff/${id}/`, input)).data
        : (await apiClient.post("/accounts/staff/", input)).data,
    onSuccess: invalidate,
  });
}

export function useSetStaffActive() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (active) await apiClient.post(`/accounts/staff/${id}/reactivate/`);
      else await apiClient.delete(`/accounts/staff/${id}/`);
    },
    onSuccess: invalidate,
  });
}

// ---------------------------------------------------------------------------
// Company settings (CEO)
// ---------------------------------------------------------------------------

export interface CompanyProfile {
  id: string;
  name: string;
  logo: string | null;
  registered_address: string;
  contact_email: string;
  contact_phone: string;
  license_number: string;
  default_currency: string;
  timezone: string;
  theme_primary_color: string;
  theme_secondary_color: string;
  theme_accent_color: string;
  updated_at: string;
  updated_by: string | null;
}

export type CompanyProfileInput = Partial<Omit<CompanyProfile, "id" | "logo" | "updated_at" | "updated_by">>;

export interface Integration {
  id: number;
  provider: "paystack" | "cloudinary" | "email" | "sms";
  provider_display: string;
  configured: boolean;
  last_checked_at: string | null;
  last_check_ok: boolean | null;
  notes: string;
}

export interface ApprovalThreshold {
  id: string;
  ceo_approval_min_price: string;
  updated_at: string;
  updated_by: string | null;
}

export interface NotificationPreference {
  id: number;
  event_type: string;
  event_type_display: string;
  enabled: boolean;
}

export function useCompanyProfile(enabled = true) {
  return useQuery({
    queryKey: ["company-profile"],
    queryFn: async () => (await apiClient.get<CompanyProfile>("/company-profile/")).data,
    enabled,
  });
}

export function useUpdateCompanyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CompanyProfileInput) => (await apiClient.patch<CompanyProfile>("/company-profile/", input)).data,
    onSuccess: (d) => qc.setQueryData(["company-profile"], d),
  });
}

export function useUploadCompanyLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("logo", file);
      return (await apiClient.patch<CompanyProfile>("/company-profile/", form)).data;
    },
    onSuccess: (d) => qc.setQueryData(["company-profile"], d),
  });
}

export function useIntegrations(enabled = true) {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: async () => (await apiClient.get<Paginated<Integration>>("/integrations/")).data.results,
    enabled,
  });
}

export function useApprovalThreshold(enabled = true) {
  return useQuery({
    queryKey: ["approval-threshold"],
    queryFn: async () => (await apiClient.get<ApprovalThreshold>("/approval-threshold/")).data,
    enabled,
  });
}

export function useUpdateApprovalThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (value: string) =>
      (await apiClient.patch<ApprovalThreshold>("/approval-threshold/", { ceo_approval_min_price: value })).data,
    onSuccess: (d) => qc.setQueryData(["approval-threshold"], d),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => (await apiClient.get<Paginated<NotificationPreference>>("/notification-preferences/")).data.results,
  });
}

export function useUpdateNotificationPreference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) =>
      (await apiClient.patch<NotificationPreference>(`/notification-preferences/${id}/`, { enabled })).data,
    onMutate: async ({ id, enabled }) => {
      await qc.cancelQueries({ queryKey: ["notification-preferences"] });
      const prev = qc.getQueryData<NotificationPreference[]>(["notification-preferences"]);
      qc.setQueryData<NotificationPreference[]>(["notification-preferences"], (list) =>
        list?.map((p) => (p.id === id ? { ...p, enabled } : p)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(["notification-preferences"], ctx?.prev),
  });
}
