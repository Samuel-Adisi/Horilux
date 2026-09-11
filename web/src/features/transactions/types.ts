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
  client: string; // client id
  owner: string; // property owner id
  agent: string; // user id
  price: string; // decimal string
  commission_percent: string; // decimal string
  expected_commission: string; // decimal string
  amount_received: string; // decimal string
  outstanding_amount: string; // decimal string
  status: TransactionStatus;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
