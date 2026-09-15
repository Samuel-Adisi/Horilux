export type TransactionStatus =
  | "offer"
  | "negotiation"
  | "agreement"
  | "documentation"
  | "payment"
  | "closing"
  | "commission"
  | "closed"
  | string;

export interface Transaction {
  id: string;
  property: string; // property id
  property_title: string | null;
  client: string; // client id
  client_name: string | null;
  owner: string; // property owner id
  agent: string; // user id
  agent_name: string | null;
  price: string; // decimal string
  commission_percent: string; // decimal string
  expected_commission: string; // decimal string
  amount_received: string; // decimal string
  outstanding_amount: string; // decimal string
  status: TransactionStatus;
  status_label: string;
  created_at: string;
}

export interface TransactionsQuery {
  status?: string;
  search?: string;
  page?: number;
}

export interface CreateTransactionPayload {
  property: string;
  client: string;
  owner: string;
  price: string;
  commission_percent: string;
}

export interface RecordPaymentPayload {
  amount: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
