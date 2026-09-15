import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "../api/transactions";
import type { TransactionsQuery } from "../types";

export function useTransactions(query: TransactionsQuery = {}) {
  return useQuery({
    queryKey: ["transactions", query],
    queryFn: () => fetchTransactions(query),
  });
}
