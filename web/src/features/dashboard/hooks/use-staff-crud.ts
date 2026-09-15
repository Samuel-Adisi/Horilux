import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchDepartments,
  fetchRoles,
  fetchStaffMember,
  createStaffMember,
  updateStaffMember,
  deactivateStaffMember,
  reactivateStaffMember,
  type StaffFormInput,
} from "../api/staff-directory";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });
}

export function useCreateStaffMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StaffFormInput) => createStaffMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-directory"] });
    },
  });
}

export function useUpdateStaffMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<StaffFormInput> }) =>
      updateStaffMember(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-directory"] });
    },
  });
}

export function useDeactivateStaffMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateStaffMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-directory"] });
    },
  });
}

export function useReactivateStaffMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reactivateStaffMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-directory"] });
    },
  });
}


export function useStaffMember(id: string | null) {
  return useQuery({
    queryKey: ["staff-member", id],
    queryFn: () => fetchStaffMember(id as string),
    enabled: !!id,
  });
}
