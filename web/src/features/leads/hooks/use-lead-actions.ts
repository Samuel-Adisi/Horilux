import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qualifyLead, convertToClient } from "../api/leads";

export function useQualifyLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: qualifyLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useConvertToClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: convertToClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
