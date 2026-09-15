import { useQuery } from "@tanstack/react-query";
import { fetchStaffDirectory } from "../api/staff-directory";

export function useStaffDirectory() {
  return useQuery({
    queryKey: ["staff-directory"],
    queryFn: fetchStaffDirectory,
  });
}
