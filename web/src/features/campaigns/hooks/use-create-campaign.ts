import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCampaign } from "../api/campaigns";

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
