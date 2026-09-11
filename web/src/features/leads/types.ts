export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "property_matched"
  | "viewing"
  | "negotiation"
  | "closed"
  | "lost"
  | string;

export type LeadPurpose = "buy" | "rent" | string;

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
  purpose: LeadPurpose | null;
  assigned_agent: string;
  status: LeadStatus;
  last_contact: string | null;
  next_follow_up: string | null;
  notes: string;
  created_at: string;
}

export interface Client {
  id: string;
  lead: string | null;
  name: string;
  phone: string;
  email: string;
  preferences: Record<string, unknown>;
  budget: string | null;
  assigned_agent: string;
  created_at: string;
}

export interface CreateLeadPayload {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  budget?: string;
  currency?: string;
  location_preference?: string;
  property_type_preference?: string;
  bedrooms_preference?: number;
  purpose?: LeadPurpose;
  notes?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
