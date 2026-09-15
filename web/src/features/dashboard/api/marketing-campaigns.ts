import { apiClient } from "@/lib/api-client";

export interface CampaignPerformanceData {
  views: number;
  enquiries: number;
  leads_generated: number;
  viewings_booked: number;
  conversions: number;
}

export interface MarketingCampaignRow {
  id: number;
  property_id: number;
  property_title: string;
  property_image_url: string | null;
  status: "draft" | "in_review" | "scheduled" | "published";
  status_label: string;
  headline: string | null;
  created_by_name: string;
  created_at: string;
  scheduled_date: string | null;
  published_date: string | null;
  has_performance: boolean;
  performance: CampaignPerformanceData | null;
}

export interface MarketingCampaignStatusCounts {
  draft: number;
  in_review: number;
  scheduled: number;
  published: number;
}

export interface MarketingCampaignTotals {
  views: number;
  enquiries: number;
  leads_generated: number;
  viewings_booked: number;
  conversions: number;
}

export interface MarketingCampaignDetailReport {
  total_campaigns: number;
  status_counts: MarketingCampaignStatusCounts;
  totals: MarketingCampaignTotals;
  campaigns: MarketingCampaignRow[];
}

export async function fetchMarketingCampaignDetailReport(): Promise<MarketingCampaignDetailReport> {
  const { data } = await apiClient.get<MarketingCampaignDetailReport>(
    "/reports/marketing-campaigns/"
  );
  return data;
}
