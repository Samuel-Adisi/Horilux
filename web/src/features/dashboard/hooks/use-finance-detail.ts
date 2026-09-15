import { useQuery } from "@tanstack/react-query";
import { fetchFinanceDetail } from "../api/finance-detail";

export function useFinanceDetail() {
  return useQuery({
    queryKey: ["finance-detail"],
    queryFn: fetchFinanceDetail,
  });
}
