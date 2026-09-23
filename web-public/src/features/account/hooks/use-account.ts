import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSavedProperties,
  saveProperty,
  unsaveProperty,
  fetchMyInquiries,
  createInquiry,
} from "../api/account";

export function useSavedProperties() {
  return useQuery({ queryKey: ["saved-properties"], queryFn: fetchSavedProperties });
}

export function useSaveProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveProperty,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-properties"] }),
  });
}

export function useUnsaveProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unsaveProperty,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-properties"] }),
  });
}

export function useMyInquiries() {
  return useQuery({ queryKey: ["my-inquiries"], queryFn: fetchMyInquiries });
}

export function useCreateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInquiry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-inquiries"] }),
  });
}
