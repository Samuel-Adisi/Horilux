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

export interface ClientsQuery {
  search?: string;
  page?: number;
}

export type InteractionType = "call" | "email" | "meeting" | "whatsapp" | "site_visit" | "sms" | "other";
export type InteractionDirection = "inbound" | "outbound";

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
  direction: InteractionDirection;
  direction_label: string;
  summary: string;
  notes: string;
  occurred_at: string;
  created_at: string;
}

export interface InteractionsQuery {
  search?: string;
  type?: InteractionType;
  lead?: string;
  client?: string;
  page?: number;
}

export interface LeadSourceStat {
  source: string;
  total_leads: number;
  converted: number;
  lost: number;
  qualified: number;
  conversion_rate: number;
}

export interface LeadSourceStatsResponse {
  results: LeadSourceStat[];
}
