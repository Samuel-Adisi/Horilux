import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompleteViewingPayload, CancelViewingPayload } from "../types";
import { confirmViewing, completeViewing, cancelViewing } from "../api/viewings";

export function useConfirmViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmViewing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewings"] });
    },
  });
}

export function useCompleteViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CompleteViewingPayload }) =>
      completeViewing(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewings"] });
    },
  });
}

export function useCancelViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CancelViewingPayload }) =>
      cancelViewing(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewings"] });
    },
  });
}
