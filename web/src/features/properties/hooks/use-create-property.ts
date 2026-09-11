import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProperty, createPropertyOwner } from "../api/properties";

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useCreatePropertyOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPropertyOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-owners"] });
    },
  });
}
