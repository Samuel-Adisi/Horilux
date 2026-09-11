import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitForVerification, publishProperty } from "../api/properties";

export function useSubmitForVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitForVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function usePublishProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
