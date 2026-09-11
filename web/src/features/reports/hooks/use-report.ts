import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import {
  fetchCeoDashboard,
  fetchListingReport,
  fetchSalesReport,
  fetchMarketingReport,
  fetchFinanceReport,
  fetchOperationsReport,
} from "../api/reports";
import type { DepartmentReportKey } from "../types";

const DEPARTMENT_TO_REPORT: Record<string, DepartmentReportKey> = {
  listing: "listing",
  sales: "sales",
  marketing: "marketing",
  finance: "finance",
  operations: "operations",
};

/**
 * Picks the right report(s) to load based on the current user's department.
 * CEO (or any department not in the map) falls back to the full dashboard,
 * matching the backend's company-scope RBAC rule.
 */
export function useReport() {
  const departmentName = useAuthStore((s) => s.user?.department?.name)?.toLowerCase();
  const reportKey = departmentName ? DEPARTMENT_TO_REPORT[departmentName] : undefined;
  const isCeo = departmentName === "ceo" || !reportKey;

  const dashboardQuery = useQuery({
    queryKey: ["reports", "ceo-dashboard"],
    queryFn: fetchCeoDashboard,
    enabled: isCeo,
  });

  const listingQuery = useQuery({
    queryKey: ["reports", "listing"],
    queryFn: fetchListingReport,
    enabled: reportKey === "listing",
  });
  const salesQuery = useQuery({
    queryKey: ["reports", "sales"],
    queryFn: fetchSalesReport,
    enabled: reportKey === "sales",
  });
  const marketingQuery = useQuery({
    queryKey: ["reports", "marketing"],
    queryFn: fetchMarketingReport,
    enabled: reportKey === "marketing",
  });
  const financeQuery = useQuery({
    queryKey: ["reports", "finance"],
    queryFn: fetchFinanceReport,
    enabled: reportKey === "finance",
  });
  const operationsQuery = useQuery({
    queryKey: ["reports", "operations"],
    queryFn: fetchOperationsReport,
    enabled: reportKey === "operations",
  });

  if (isCeo) {
    return {
      mode: "dashboard" as const,
      isLoading: dashboardQuery.isLoading,
      isError: dashboardQuery.isError,
      dashboard: dashboardQuery.data,
    };
  }

  const activeQuery = {
    listing: listingQuery,
    sales: salesQuery,
    marketing: marketingQuery,
    finance: financeQuery,
    operations: operationsQuery,
  }[reportKey!];

  return {
    mode: "single" as const,
    department: reportKey!,
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    report: activeQuery.data,
  };
}
