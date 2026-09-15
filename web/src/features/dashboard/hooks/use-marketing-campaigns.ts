import { useQuery } from "@tanstack/react-query";
import { fetchMarketingCampaignDetailReport } from "../api/marketing-campaigns";

export function useMarketingCampaigns() {
  return useQuery({
    queryKey: ["marketing-campaigns-report"],
    queryFn: fetchMarketingCampaignDetailReport,
  });
}
