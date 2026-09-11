export type ViewingStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show"
  | string;

export type ViewingOutcome = "hot" | "warm" | "cold" | string;

export interface Viewing {
  id: string;
  client: string;
  property: string;
  agent: string;
  date: string;
  time: string;
  status: ViewingStatus;
  notes: string;
  outcome: ViewingOutcome | null;
  next_action: string;
  created_at: string;
}

export interface CreateViewingPayload {
  client: string;
  property: string;
  date: string;
  time: string;
  notes?: string;
}

export interface CompleteViewingPayload {
  outcome: ViewingOutcome;
  next_action?: string;
  follow_up_due_date?: string;
}

export interface CancelViewingPayload {
  reason?: string;
  no_show?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
