import { useQuery } from "@tanstack/react-query";
import { fetchClients } from "../api/clients";
import type { ClientsQuery } from "../types";

export function useClients(query: ClientsQuery = {}) {
  return useQuery({
    queryKey: ["clients", query],
    queryFn: () => fetchClients(query),
  });
}
