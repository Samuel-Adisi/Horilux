import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cleanParams, type Paginated } from "@/lib/types";

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export type LeadStatus = "new" | "contacted" | "qualified" | "property_matched" | "viewing" | "negotiation" | "closed" | "lost";

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  property_matched: "Property matched",
  viewing: "Viewing",
  negotiation: "Negotiation",
  closed: "Closed",
  lost: "Lost",
};

export const LEAD_PIPELINE: LeadStatus[] = ["new", "contacted", "qualified", "property_matched", "viewing", "negotiation", "closed"];

/** Mirrors the backend transition map for POST leads/{id}/transition/. */
export const LEAD_NEXT: Partial<Record<LeadStatus, LeadStatus>> = {
  new: "contacted",
  contacted: "qualified",
  qualified: "property_matched",
  property_matched: "viewing",
  viewing: "negotiation",
  negotiation: "closed",
};

export const LEAD_OPEN: LeadStatus[] = ["new", "contacted", "qualified", "property_matched", "viewing", "negotiation"];

export const LEAD_SOURCES = ["Website", "Contact Form", "Referral", "Walk-in", "Phone call", "WhatsApp", "Instagram", "Facebook", "Property portal", "Signboard", "Other"];

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  budget: string | null;
  currency: string;
  location_preference: string;
  property_type_preference: string;
  bedrooms_preference: number | null;
  purpose: "buy" | "rent" | null;
  property_interest: string | null;
  property_interest_title: string | null;
  assigned_agent: string | null;
  assigned_agent_name: string | null;
  status: LeadStatus;
  status_label: string;
  last_contact: string | null;
  next_follow_up: string | null;
  notes: string;
  created_at: string;
}

export interface LeadInput {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  budget?: string | null;
  currency?: string;
  location_preference?: string;
  property_type_preference?: string;
  bedrooms_preference?: number | null;
  purpose?: "buy" | "rent" | null;
  assigned_agent?: string | null;
  next_follow_up?: string | null;
  notes?: string;
}

export interface LeadsQuery {
  page?: number;
  status?: string;
  search?: string;
  unassigned?: boolean;
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export interface Client {
  id: string;
  lead: string | null;
  name: string;
  phone: string;
  email: string;
  preferences: Record<string, unknown>;
  budget: string | null;
  assigned_agent: string | null;
  assigned_agent_name: string | null;
  created_at: string;
}

export interface ClientInput {
  name: string;
  phone: string;
  email?: string;
  budget?: string | null;
  assigned_agent?: string | null;
  preferences?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

export type InteractionType = "call" | "email" | "meeting" | "whatsapp" | "site_visit" | "sms" | "other";

export const INTERACTION_TYPE_LABEL: Record<InteractionType, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  whatsapp: "WhatsApp",
  site_visit: "Site visit",
  sms: "SMS",
  other: "Other",
};

export interface Interaction {
  id: string;
  lead: string | null;
  lead_name: string | null;
  client: string | null;
  client_name: string | null;
  agent: string | null;
  agent_name: string | null;
  type: InteractionType;
  type_label: string;
  direction: "inbound" | "outbound";
  direction_label: string;
  summary: string;
  notes: string;
  occurred_at: string;
  created_at: string;
}

export interface InteractionInput {
  lead?: string | null;
  client?: string | null;
  type: InteractionType;
  direction: "inbound" | "outbound";
  summary: string;
  notes?: string;
  occurred_at: string;
}

export interface InteractionsQuery {
  page?: number;
  search?: string;
  type?: string;
  lead?: string;
  client?: string;
}

export interface LeadSourceStat {
  source: string;
  total_leads: number;
  converted: number;
  lost: number;
  qualified: number;
  conversion_rate: number;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useLeads(q: LeadsQuery, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["leads", "list", q],
    queryFn: async () =>
      (
        await apiClient.get<Paginated<Lead>>("/leads/", {
          params: cleanParams({ page: q.page ?? 1, status: q.status, search: q.search, unassigned: q.unassigned ? "true" : undefined }),
        })
      ).data,
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: ["leads", "detail", id],
    queryFn: async () => (await apiClient.get<Lead>(`/leads/${id}/`)).data,
    enabled: !!id,
  });
}

function useLeadInvalidation() {
  const qc = useQueryClient();
  return (lead?: Lead) => {
    if (lead) qc.setQueryData(["leads", "detail", lead.id], lead);
    qc.invalidateQueries({ queryKey: ["leads"] });
    qc.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useCreateLead() {
  const invalidate = useLeadInvalidation();
  return useMutation({
    mutationFn: async (input: LeadInput) => (await apiClient.post<Lead>("/leads/", input)).data,
    onSuccess: (l) => invalidate(l),
  });
}

export function useUpdateLead(id: string) {
  const invalidate = useLeadInvalidation();
  return useMutation({
    mutationFn: async (input: Partial<LeadInput>) => (await apiClient.patch<Lead>(`/leads/${id}/`, input)).data,
    onSuccess: (l) => invalidate(l),
  });
}

export function useTransitionLead(id: string) {
  const invalidate = useLeadInvalidation();
  return useMutation({
    mutationFn: async (status: LeadStatus) => (await apiClient.post<Lead>(`/leads/${id}/transition/`, { status })).data,
    onSuccess: (l) => invalidate(l),
  });
}

export function useAssignLead() {
  const invalidate = useLeadInvalidation();
  return useMutation({
    mutationFn: async ({ id, agentId }: { id: string; agentId: string }) =>
      (await apiClient.post<Lead>(`/leads/${id}/assign/`, { agent_id: agentId })).data,
    onSuccess: (l) => invalidate(l),
  });
}

export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post<Client>(`/leads/${id}/convert_to_client/`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export async function fetchClients(q: { page?: number; search?: string }) {
  return (await apiClient.get<Paginated<Client>>("/clients/", { params: cleanParams({ page: q.page ?? 1, search: q.search }) })).data;
}

export function useClients(q: { page?: number; search?: string }, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["clients", "list", q],
    queryFn: () => fetchClients(q),
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ["clients", "detail", id],
    queryFn: async () => (await apiClient.get<Client>(`/clients/${id}/`)).data,
    enabled: !!id,
  });
}

/** The client created from a lead, if any (clients have a OneToOne `lead`). */
export function useClientForLead(leadId: string | undefined, leadName: string | undefined) {
  return useQuery({
    queryKey: ["clients", "for-lead", leadId],
    queryFn: async () => {
      const page = await fetchClients({ search: leadName });
      return page.results.find((c) => c.lead === leadId) ?? null;
    },
    enabled: !!leadId && !!leadName,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClientInput) => (await apiClient.post<Client>("/clients/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ClientInput>) => (await apiClient.patch<Client>(`/clients/${id}/`, input)).data,
    onSuccess: (c) => {
      qc.setQueryData(["clients", "detail", id], c);
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useInteractions(q: InteractionsQuery, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["interactions", q],
    queryFn: async () =>
      (
        await apiClient.get<Paginated<Interaction>>("/interactions/", {
          params: cleanParams({ page: q.page ?? 1, search: q.search, type: q.type, lead: q.lead, client: q.client }),
        })
      ).data,
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

export function useCreateInteraction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: InteractionInput) => (await apiClient.post<Interaction>("/interactions/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["interactions"] }),
  });
}

export function useLeadSourceStats(enabled = true) {
  return useQuery({
    queryKey: ["reports", "lead-source-stats"],
    queryFn: async () => (await apiClient.get<{ results: LeadSourceStat[] }>("/lead-source-stats/")).data.results,
    enabled,
  });
}
