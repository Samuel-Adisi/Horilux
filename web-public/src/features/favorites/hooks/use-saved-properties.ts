import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSavedProperties, saveProperty, unsaveProperty } from "../api/saved-properties";
import { useAuthStore } from "@/lib/auth-store";

export function useSavedProperties() {
  const customer = useAuthStore((s) => s.customer);
  return useQuery({
    queryKey: ["saved-properties"],
    queryFn: fetchSavedProperties,
    enabled: !!customer,
  });
}

export function useToggleSavedProperty() {
  const queryClient = useQueryClient();
  const { data: saved } = useSavedProperties();

  const save = useMutation({
    mutationFn: (propertyId: string) => saveProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-properties"] });
    },
  });

  const unsave = useMutation({
    mutationFn: (savedPropertyId: number) => unsaveProperty(savedPropertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-properties"] });
    },
  });

  function isSaved(propertyId: string) {
    return saved?.find((s) => s.property === propertyId);
  }

  function toggle(propertyId: string) {
    const existing = isSaved(propertyId);
    if (existing) {
      unsave.mutate(existing.id);
    } else {
      save.mutate(propertyId);
    }
  }

  return { isSaved, toggle, isPending: save.isPending || unsave.isPending };
}

