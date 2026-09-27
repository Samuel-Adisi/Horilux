import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSavedProperties, saveProperty, unsaveProperty } from "../api/saved-properties";
import type { SavedProperty } from "@/lib/types";

export function useSavedProperties() {
  return useQuery({
    queryKey: ["saved-properties"],
    queryFn: fetchSavedProperties,
  });
}

export function useToggleSavedProperty() {
  const queryClient = useQueryClient();
  const { data: saved } = useSavedProperties();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const markPending = useCallback((propertyId: string, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(propertyId);
      else next.delete(propertyId);
      return next;
    });
  }, []);

  const save = useMutation({
    mutationFn: (propertyId: string) => saveProperty(propertyId),
    onMutate: async (propertyId: string) => {
      markPending(propertyId, true);
      await queryClient.cancelQueries({ queryKey: ["saved-properties"] });
      const previous = queryClient.getQueryData<SavedProperty[]>(["saved-properties"]);

      const optimistic: SavedProperty = {
        id: -Date.now(),
        property: propertyId,
        property_detail: undefined as unknown as SavedProperty["property_detail"],
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<SavedProperty[]>(["saved-properties"], (old) => [
        ...(old ?? []),
        optimistic,
      ]);

      return { previous, propertyId };
    },
    onError: (_err, _propertyId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["saved-properties"], context.previous);
      }
    },
    onSettled: (_data, _err, propertyId) => {
      markPending(propertyId, false);
      queryClient.invalidateQueries({ queryKey: ["saved-properties"] });
    },
  });

  const unsave = useMutation({
    mutationFn: (args: { savedPropertyId: number; propertyId: string }) =>
      unsaveProperty(args.savedPropertyId),
    onMutate: async ({ savedPropertyId, propertyId }) => {
      markPending(propertyId, true);
      await queryClient.cancelQueries({ queryKey: ["saved-properties"] });
      const previous = queryClient.getQueryData<SavedProperty[]>(["saved-properties"]);

      queryClient.setQueryData<SavedProperty[]>(["saved-properties"], (old) =>
        (old ?? []).filter((s) => s.id !== savedPropertyId)
      );

      return { previous };
    },
    onError: (_err, { propertyId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["saved-properties"], context.previous);
      }
      markPending(propertyId, false);
    },
    onSettled: (_data, _err, { propertyId }) => {
      markPending(propertyId, false);
      queryClient.invalidateQueries({ queryKey: ["saved-properties"] });
    },
  });

  function isSaved(propertyId: string) {
    return saved?.find((s) => s.property === propertyId);
  }

  function isPending(propertyId: string) {
    return pendingIds.has(propertyId);
  }

  function toggle(propertyId: string) {
    if (isPending(propertyId)) return;
    const existing = isSaved(propertyId);
    if (existing) {
      if (existing.id < 0) return;
      unsave.mutate({ savedPropertyId: existing.id, propertyId });
    } else {
      save.mutate(propertyId);
    }
  }

  return { isSaved, toggle, isPending };
}
