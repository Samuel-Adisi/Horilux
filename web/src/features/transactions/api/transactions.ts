import { apiClient } from "@/lib/api-client";
import type {
  PaginatedResponse,
  Transaction,
  CreateTransactionPayload,
  RecordPaymentPayload,
} from "../types";

export async function fetchTransactions(): Promise<PaginatedResponse<Transaction>> {
  const { data } = await apiClient.get<PaginatedResponse<Transaction>>("/transactions/");
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
