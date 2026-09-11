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

export interface CampaignPerformanceTotals {
  views: number;
  enquiries: number;
  leads_generated: number;
  viewings_booked: number;
  conversions: number;
}

export interface MarketingReport {
  total_campaigns: number;
  by_status: Record<string, number>;
  performance: CampaignPerformanceTotals;
}

export interface CommissionTotals {
  expected: number;
  received: number;
  outstanding: number;
  agent_share: number;
  company_share: number;
}

export interface FinanceReport {
  total_transactions: number;
  by_status: Record<string, number>;
  commission: CommissionTotals;
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
}

export type DepartmentReportKey = "listing" | "sales" | "marketing" | "finance" | "operations";
