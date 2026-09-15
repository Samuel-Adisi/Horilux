import { useQuery } from "@tanstack/react-query";
import { fetchAgentsRoster } from "../api/agents-roster";

export function useAgentsRoster() {
  return useQuery({
    queryKey: ["agents-roster"],
    queryFn: fetchAgentsRoster,
  });
}
