import { useQuery } from "@tanstack/react-query";
import { fetchViewings } from "../api/viewings";

export function useViewings(page: number = 1) {
  return useQuery({
    queryKey: ["viewings", page],
    queryFn: () => fetchViewings(page),
  });
}
