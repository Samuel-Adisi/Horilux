import { apiClient } from "@/lib/api-client";

export interface MonthlyLedgerRow {
  month: string;
  gross_volume: number;
  commission_income: number;
  agent_payouts: number;
  company_retention: number;
}

export interface FinanceDetailData {
  gross_volume_ytd: number;
  transaction_count_ytd: number;
  net_commission_income: number;
  effective_commission_percent: number;
  outstanding_commission: number;
  agent_payouts: number;
  agent_payout_percent: number;
  company_retention: number;
  monthly_ledger: MonthlyLedgerRow[];
}

export async function fetchFinanceDetail(): Promise<FinanceDetailData> {
  const { data } = await apiClient.get<FinanceDetailData>("/reports/finance-detail/");
  return data;
}
