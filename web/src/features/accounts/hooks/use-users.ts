import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/users";

/** Active staff, for assignee pickers. Changes rarely, so cache it longer. */
export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: fetchUsers, staleTime: 5 * 60_000 });
}
