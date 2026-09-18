import { useQuery } from "@tanstack/react-query";
import { fetchGovernanceActions } from "../api/governance-actions";

export function useGovernanceActions() {
  return useQuery({
    queryKey: ["ceo-governance-actions"],
    queryFn: fetchGovernanceActions,
  });
}
