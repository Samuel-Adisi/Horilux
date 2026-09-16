import { useQuery } from "@tanstack/react-query";
import { fetchInteractions } from "../api/interactions";
import type { InteractionsQuery } from "../types";

export function useInteractions(query: InteractionsQuery = {}) {
  return useQuery({
    queryKey: ["interactions", query],
    queryFn: () => fetchInteractions(query),
  });
}
