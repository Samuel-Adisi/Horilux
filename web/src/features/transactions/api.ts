import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cleanParams, type Paginated } from "@/lib/types";

export type TransactionStatus = "offer" | "negotiation" | "agreement" | "documentation" | "payment" | "closing" | "commission" | "closed";
export type PaymentStatus = "pending" | "partial" | "paid" | "overdue";

export const TRANSACTION_STAGES: TransactionStatus[] = [
  "offer",
  "negotiation",
  "agreement",
  "documentation",
  "payment",
  "closing",
  "commission",
  "closed",
];

export const TRANSACTION_STATUS_LABEL: Record<TransactionStatus, string> = {
  offer: "Offer",
  negotiation: "Negotiation",
  agreement: "Agreement",
  documentation: "Documentation",
  payment: "Payment",
  closing: "Closing",
  commission: "Commission",
  closed: "Closed",
};

export interface TransactionListItem {
  id: string;
  property: string;
  property_title: string | null;
  client: string;
  client_name: string | null;
  owner: string;
  agent: string | null;
  agent_name: string | null;
  price: string;
  commission_percent: string;
  expected_commission: string;
  amount_received: string;
  outstanding_amount: string;
  status: TransactionStatus;
  status_label: string;
  created_at: string;
}

export interface Payment {
  id: string;
  transaction: string;
  amount: string;
  date: string;
  status: PaymentStatus;
  method: string;
  reference: string;
}

export interface Commission {
  id: string;
  transaction: string;
  expected: string;
  received: string;
  outstanding: string;
  agent_share: string;
  company_share: string;
  payment_date: string | null;
  payment_status: PaymentStatus;
}

export interface TransactionDetail {
  id: string;
  property: string;
  property_title?: string | null;
  client: string;
  client_name?: string | null;
  owner: string;
  owner_name?: string | null;
  agent: string | null;
  agent_name?: string | null;
  price: string;
  commission_percent: string;
  expected_commission: string;
  amount_received: string;
  outstanding_amount: string;
  status: TransactionStatus;
  status_label?: string;
  created_at: string;
  updated_at: string;
  payments: Payment[];
  commission: Commission | null;
}

export interface TransactionInput {
  property: string;
  client: string;
  owner: string;
  agent?: string | null;
  price: string;
  commission_percent: string;
}

export interface PaymentInput {
  amount: string;
  date?: string;
  method?: string;
  reference?: string;
}

export interface TransactionsQuery {
  page?: number;
  status?: string;
  search?: string;
}

export function useTransactions(q: TransactionsQuery, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["transactions", "list", q],
    queryFn: async () =>
      (
        await apiClient.get<Paginated<TransactionListItem>>("/transactions/", {
          params: cleanParams({ page: q.page ?? 1, status: q.status, search: q.search }),
        })
      ).data,
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: ["transactions", "detail", id],
    queryFn: async () => (await apiClient.get<TransactionDetail>(`/transactions/${id}/`)).data,
    enabled: !!id,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return (t?: TransactionDetail) => {
    if (t) qc.setQueryData(["transactions", "detail", t.id], t);
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useCreateTransaction() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: TransactionInput) => (await apiClient.post<TransactionListItem>("/transactions/", input)).data,
    onSuccess: () => invalidate(),
  });
}

export function useAdvanceTransaction(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async () => (await apiClient.post<TransactionDetail>(`/transactions/${id}/advance/`)).data,
    onSuccess: (t) => invalidate(t),
  });
}

export function useRecordPayment(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: PaymentInput) =>
      (await apiClient.post<TransactionDetail>(`/transactions/${id}/record_payment/`, input)).data,
    onSuccess: (t) => invalidate(t),
  });
}

// ---------------------------------------------------------------------------
// Commission rules (Finance writes; CEO reads)
// ---------------------------------------------------------------------------

export interface CommissionRule {
  id: string;
  role: string | null;
  role_name: string | null;
  agent_split_percent: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCommissionRules(enabled = true) {
  return useQuery({
    queryKey: ["commission-rules"],
    queryFn: async () => (await apiClient.get<Paginated<CommissionRule>>("/commission-rules/")).data.results,
    enabled,
  });
}

export function useSaveCommissionRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: { role: string | null; agent_split_percent: string; active: boolean } }) =>
      id
        ? (await apiClient.patch<CommissionRule>(`/commission-rules/${id}/`, input)).data
        : (await apiClient.post<CommissionRule>("/commission-rules/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commission-rules"] }),
  });
}
