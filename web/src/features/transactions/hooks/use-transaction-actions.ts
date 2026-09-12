import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecordPaymentPayload } from "../types";
import { advanceTransaction, recordPayment } from "../api/transactions";

export function useAdvanceTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: advanceTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecordPaymentPayload }) =>
      recordPayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
