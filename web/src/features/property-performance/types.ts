export interface PropertyPerformanceRow {
  id: string;
  title: string;
  status: string;
  region: string;
  property_type: string;
  price: number | null;
  price_vs_region_avg_pct: number | null;
  days_on_market: number;
  views_count: number;
  inquiries_count: number;
  viewings_total: number;
  viewings_hot: number;
  viewings_warm: number;
  viewings_cold: number;
  converted_to_transaction: boolean;
  conversion_rate_pct: number | null;
}

export interface PropertyPerformanceSummary {
  total_properties: number;
  total_views: number;
  total_inquiries: number;
  avg_days_on_market: number;
}

export interface PropertyPerformanceResponse {
  summary: PropertyPerformanceSummary;
  status_funnel: Record<string, number>;
  top_performers: PropertyPerformanceRow[];
  stale_listings: PropertyPerformanceRow[];
  properties: PropertyPerformanceRow[];
}
