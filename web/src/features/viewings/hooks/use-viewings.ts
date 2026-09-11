import { useQuery } from "@tanstack/react-query";
import { fetchViewings } from "../api/viewings";

export function useViewings() {
  return useQuery({
    queryKey: ["viewings"],
    queryFn: fetchViewings,
  });
}
