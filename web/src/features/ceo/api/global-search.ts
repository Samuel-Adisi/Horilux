import { fetchProperties } from "@/features/properties/api/properties";
import { fetchClients } from "@/features/crm/api/clients";
import { fetchLeads } from "@/features/leads/api/leads";
import { apiClient } from "@/lib/api-client";
import type { Property } from "@/features/properties/types";
import type { Lead } from "@/features/leads/types";
import type { Client } from "@/features/crm/types";
import type { StaffMember } from "@/features/dashboard/api/staff-directory";

export type GlobalSearchResultType = "property" | "lead" | "client" | "staff";

export interface GlobalSearchResult {
  type: GlobalSearchResultType;
  id: string | number;
  title: string;
  subtitle: string;
  path: string;
}

export interface GlobalSearchResponse {
  properties: GlobalSearchResult[];
  leads: GlobalSearchResult[];
  clients: GlobalSearchResult[];
  staff: GlobalSearchResult[];
}

const RESULT_LIMIT = 5;

async function searchStaff(query: string): Promise<GlobalSearchResult[]> {
  const { data } = await apiClient.get<{ results?: StaffMember[] } | StaffMember[]>(
    "/accounts/staff/",
    { params: { search: query, page_size: RESULT_LIMIT } }
  );
  const records = Array.isArray(data) ? data : data.results ?? [];
  return records.slice(0, RESULT_LIMIT).map((s) => ({
    type: "staff" as const,
    id: s.id,
    title: s.name,
    subtitle: s.department ?? s.email,
    path: `/ceo/staff?search=${encodeURIComponent(query)}`,
  }));
}

export async function globalSearch(query: string): Promise<GlobalSearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) return { properties: [], leads: [], clients: [], staff: [] };

  const [propertiesRes, leadsRes, clientsRes, staffRes] = await Promise.allSettled([
    fetchProperties({ search: trimmed, page: 1 }),
    fetchLeads({ search: trimmed, page: 1 }),
    fetchClients({ search: trimmed, page: 1 }),
    searchStaff(trimmed),
  ]);

  const properties: GlobalSearchResult[] =
    propertiesRes.status === "fulfilled"
      ? propertiesRes.value.results.slice(0, RESULT_LIMIT).map((p: Property) => ({
          type: "property" as const,
          id: p.id,
          title: p.title,
          subtitle: p.location,
          path: `/ceo/properties?search=${encodeURIComponent(trimmed)}`,
        }))
      : [];

  const leads: GlobalSearchResult[] =
    leadsRes.status === "fulfilled"
      ? leadsRes.value.results.slice(0, RESULT_LIMIT).map((l: Lead) => ({
          type: "lead" as const,
          id: l.id,
          title: l.name,
          subtitle: l.status_label ?? l.source,
          path: `/ceo/leads?search=${encodeURIComponent(trimmed)}`,
        }))
      : [];

  const clients: GlobalSearchResult[] =
    clientsRes.status === "fulfilled"
      ? clientsRes.value.results.slice(0, RESULT_LIMIT).map((c: Client) => ({
          type: "client" as const,
          id: c.id,
          title: c.name,
          subtitle: c.email || c.phone,
          path: `/ceo/customers?search=${encodeURIComponent(trimmed)}`,
        }))
      : [];

  const staff: GlobalSearchResult[] = staffRes.status === "fulfilled" ? staffRes.value : [];

  return { properties, leads, clients, staff };
}
