export interface CeoDashboardData {
  listing: { total_properties: number; by_status: Record<string, number>; avg_completion_percent: number };
  sales: { total_leads: number; leads_by_status: Record<string, number>; total_clients: number; overdue_followups: number };
  marketing: { total_campaigns: number; by_status: Record<string, number>; performance: Record<string, number> };
  finance: { total_transactions: number; by_status: Record<string, number>; commission: Record<string, number> };
  operations: { total_tasks: number; by_status: Record<string, number>; overdue_tasks: number };
  kpis: {
    gross_volume_ytd: number;
    avg_deal_size: number;
    active_agents: number;
    active_mandates: number;
    closed_yield_percent: number;
  };
  revenue_trend: Array<{ month: string; current: number; prior: number }>;
  conversion_funnel: Array<{ label: string; count: number; pct: number }>;
  departments: Array<{ name: string; value: number; count: number; pct: number }>;
  leaderboard: Array<{ rank: number; name: string; division: string; deals: number; volume: number; yield_percent: number }>;
}
