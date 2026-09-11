import { apiClient } from "@/lib/api-client";
import type {
  ListingReport,
  SalesReport,
  MarketingReport,
  FinanceReport,
  OperationsReport,
  CeoDashboard,
  DepartmentReportKey,
} from "../types";

export async function fetchListingReport(): Promise<ListingReport> {
  const { data } = await apiClient.get<ListingReport>("/reports/listing/");
  return data;
}

export async function fetchSalesReport(): Promise<SalesReport> {
  const { data } = await apiClient.get<SalesReport>("/reports/sales/");
  return data;
}

export async function fetchMarketingReport(): Promise<MarketingReport> {
  const { data } = await apiClient.get<MarketingReport>("/reports/marketing/");
  return data;
}

export async function fetchFinanceReport(): Promise<FinanceReport> {
  const { data } = await apiClient.get<FinanceReport>("/reports/finance/");
  return data;
}

export async function fetchOperationsReport(): Promise<OperationsReport> {
  const { data } = await apiClient.get<OperationsReport>("/reports/operations/");
  return data;
}

export async function fetchCeoDashboard(): Promise<CeoDashboard> {
  const { data } = await apiClient.get<CeoDashboard>("/reports/ceo-dashboard/");
  return data;
}

export const DEPARTMENT_REPORT_FETCHERS: Record<DepartmentReportKey, () => Promise<unknown>> = {
  listing: fetchListingReport,
  sales: fetchSalesReport,
  marketing: fetchMarketingReport,
  finance: fetchFinanceReport,
  operations: fetchOperationsReport,
};
