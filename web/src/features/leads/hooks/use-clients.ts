import { useQuery } from "@tanstack/react-query";
import { fetchClients } from "../api/leads";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });
}
