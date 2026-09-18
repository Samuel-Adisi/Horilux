import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/** Every query here lives under ["reports", ...] so mutations can refresh them all at once. */

export interface ListingReport {
  total_properties: number;
  by_status: Record<string, number>;
  avg_completion_percent: number;
}
export interface SalesReport {
  total_leads: number;
  leads_by_status: Record<string, number>;
  total_clients: number;
  overdue_followups: number;
}
export interface PerformanceTotals {
  views: number;
  enquiries: number;
  leads_generated: number;
  viewings_booked: number;
  conversions: number;
}
export interface MarketingReport {
  total_campaigns: number;
  by_status: Record<string, number>;
  performance: PerformanceTotals;
}
export interface FinanceReport {
  total_transactions: number;
  by_status: Record<string, number>;
  commission: { expected: number; received: number; outstanding: number; agent_share: number; company_share: number };
}
export interface OperationsReport {
  total_tasks: number;
  by_status: Record<string, number>;
  overdue_tasks: number;
}

export interface CeoDashboard {
  listing: ListingReport;
  sales: SalesReport;
  marketing: MarketingReport;
  finance: FinanceReport;
  operations: OperationsReport;
  kpis: {
    gross_volume_ytd: number;
    avg_deal_size: number;
    active_agents: number;
    active_mandates: number;
    closed_yield_percent: number;
  };
  revenue_trend: { month: string; current: number; prior: number }[];
  conversion_funnel: { label: string; count: number; pct: number }[];
  departments: { name: string; value: number; count: number; pct: number }[];
  leaderboard: { rank: number; name: string; division: string; deals: number; volume: number; yield_percent: number }[];
}

export interface RevenueTrend {
  range: string;
  months: number;
  trend: { month: string; current: number; prior: number }[];
}

export interface FinanceDetail {
  gross_volume_ytd: number;
  transaction_count_ytd: number;
  net_commission_income: number;
  effective_commission_percent: number;
  outstanding_commission: number;
  agent_payouts: number;
  agent_payout_percent: number;
  company_retention: number;
  monthly_ledger: { month: string; gross_volume: number; commission_income: number; agent_payouts: number; company_retention: number }[];
}

export interface SalesPipeline {
  stages: { status: string; label: string; deal_count: number; value: number }[];
  deals_in_flight: {
    id: string;
    property_title: string;
    client_name: string;
    agent_name: string;
    price: number;
    status: string;
    status_label: string;
  }[];
  lost_count: number;
  total_leads: number;
}

export interface MarketingCampaignsReport {
  total_campaigns: number;
  status_counts: Record<"draft" | "in_review" | "scheduled" | "published", number>;
  totals: PerformanceTotals;
  campaigns: {
    id: string;
    property_id: string;
    property_title: string;
    property_image_url: string | null;
    status: string;
    status_label: string;
    headline: string | null;
    created_by_name: string;
    created_at: string;
    scheduled_date: string | null;
    published_date: string | null;
    has_performance: boolean;
    performance: PerformanceTotals | null;
  }[];
}

export interface AgentsRoster {
  agents: {
    id: string;
    name: string;
    email: string;
    department: string;
    date_joined: string;
    deals_closed: number;
    volume: number;
    active_deals: number;
    leads_assigned: number;
    conversion_percent: number;
  }[];
  total_agents: number;
}

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

export interface PropertyPerformance {
  summary: { total_properties: number; total_views: number; total_inquiries: number; avg_days_on_market: number };
  status_funnel: Record<string, number>;
  top_performers: PropertyPerformanceRow[];
  stale_listings: PropertyPerformanceRow[];
  properties: PropertyPerformanceRow[];
}

export interface RecentActivity {
  id: string;
  actor: string;
  action: string;
  model: string;
  object_id: string;
  timestamp: string;
}

export interface GovernanceAction {
  id: "pending-approvals" | "unassigned-leads" | "overdue-viewings" | string;
  severity: string;
  due: string;
  severity_color: string;
  title: string;
  detail: string;
  cta: string;
  cta_style: string;
  link: string;
}

export interface Territory {
  corridors: { name: string; property_count: number; gtv: number; avg_price: number | null }[];
  total_gtv: number;
}

function report<T>(path: string, key: unknown[], enabled = true, params?: Record<string, string | number>) {
  return {
    queryKey: ["reports", ...key],
    queryFn: async () => (await apiClient.get<T>(path, { params })).data,
    enabled,
  };
}

export const useListingReport = (enabled = true) => useQuery(report<ListingReport>("/reports/listing/", ["listing"], enabled));
export const useSalesReport = (enabled = true) => useQuery(report<SalesReport>("/reports/sales/", ["sales"], enabled));
export const useMarketingReport = (enabled = true) => useQuery(report<MarketingReport>("/reports/marketing/", ["marketing"], enabled));
export const useFinanceReport = (enabled = true) => useQuery(report<FinanceReport>("/reports/finance/", ["finance"], enabled));
export const useOperationsReport = (enabled = true) =>
  useQuery(report<OperationsReport>("/reports/operations/", ["operations"], enabled));
export const useCeoDashboard = (enabled = true) => useQuery(report<CeoDashboard>("/reports/ceo-dashboard/", ["ceo-dashboard"], enabled));
export const useRevenueTrend = (range: "M" | "Q" | "Y", enabled = true) =>
  useQuery(report<RevenueTrend>("/reports/revenue-trend/", ["revenue-trend", range], enabled, { range }));
export const useFinanceDetail = (months: number, enabled = true) =>
  useQuery(report<FinanceDetail>("/reports/finance-detail/", ["finance-detail", months], enabled, { months }));
export const useSalesPipeline = (enabled = true) => useQuery(report<SalesPipeline>("/reports/sales-pipeline/", ["sales-pipeline"], enabled));
export const useMarketingCampaignsReport = (enabled = true) =>
  useQuery(report<MarketingCampaignsReport>("/reports/marketing-campaigns/", ["marketing-campaigns"], enabled));
export const useAgentsRoster = (enabled = true) => useQuery(report<AgentsRoster>("/reports/agents-roster/", ["agents-roster"], enabled));
export const usePropertyPerformance = (enabled = true) =>
  useQuery(report<PropertyPerformance>("/reports/property-performance/", ["property-performance"], enabled));
export const useRecentActivity = (enabled = true) => useQuery(report<RecentActivity[]>("/reports/recent-activity/", ["recent-activity"], enabled));
export const useGovernanceActions = (enabled = true) =>
  useQuery(report<GovernanceAction[]>("/reports/governance-actions/", ["governance-actions"], enabled));
export const useTerritory = (enabled = true) => useQuery(report<Territory>("/reports/territory-intelligence/", ["territory"], enabled));

export async function downloadBoardPack() {
  const res = await apiClient.get<Blob>("/reports/board-pack-pdf/", { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `horilux-board-pack-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
