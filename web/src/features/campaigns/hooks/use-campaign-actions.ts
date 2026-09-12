import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SchedulePayload } from "../types";
import { submitForReview, scheduleCampaign, publishCampaign } from "../api/campaigns";

export function useSubmitForReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitForReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useScheduleCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SchedulePayload }) =>
      scheduleCampaign(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function usePublishCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
