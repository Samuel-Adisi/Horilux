import { useQuery } from "@tanstack/react-query";
import { fetchSalesPipeline } from "../api/sales-pipeline";

export function useSalesPipeline() {
  return useQuery({
    queryKey: ["sales-pipeline"],
    queryFn: fetchSalesPipeline,
  });
}
