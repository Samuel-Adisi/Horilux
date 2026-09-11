import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse, Transaction } from "../types";

export async function fetchTransactions(): Promise<PaginatedResponse<Transaction>> {
  const { data } = await apiClient.get<PaginatedResponse<Transaction>>("/transactions/");
  return data;
}
