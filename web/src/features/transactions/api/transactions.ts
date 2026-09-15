import { apiClient } from "@/lib/api-client";
import type {
  PaginatedResponse,
  Transaction,
  CreateTransactionPayload,
  RecordPaymentPayload,
  TransactionsQuery,
} from "../types";

export async function fetchTransactions(query: TransactionsQuery = {}): Promise<PaginatedResponse<Transaction>> {
  const params: Record<string, string | number> = {};
  if (query.status) params.status = query.status;
  if (query.search) params.search = query.search;
  if (query.page) params.page = query.page;
  const { data } = await apiClient.get<PaginatedResponse<Transaction>>("/transactions/", { params });
  return data;
}

export async function createTransaction(
  payload: CreateTransactionPayload
): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>("/transactions/", payload);
  return data;
}

export async function advanceTransaction(id: string): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>(`/transactions/${id}/advance/`);
  return data;
}

export async function recordPayment(
  id: string,
  payload: RecordPaymentPayload
): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>(
    `/transactions/${id}/record_payment/`,
    payload
  );
  return data;
}
