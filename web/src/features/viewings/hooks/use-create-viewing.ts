import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createViewing } from "../api/viewings";

export function useCreateViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createViewing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewings"] });
    },
  });
}
