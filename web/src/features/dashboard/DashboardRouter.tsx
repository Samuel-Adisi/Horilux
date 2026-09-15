import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { DashboardPage } from "./DashboardPage";
import { SalesDashboardPage } from "./SalesDashboardPage";
import { MarketingDashboardPage } from "./MarketingDashboardPage";
import { FinanceDashboardPage } from "./FinanceDashboardPage";
import { OperationsDashboardPage } from "./OperationsDashboardPage";

export function DashboardRouter() {
  const user = useAuthStore((s) => s.user);
  const roleNames = user?.roles?.map((r) => r.name) ?? [];

  if (roleNames.includes("CEO")) return <Navigate to="/ceo" replace />;
  if (roleNames.includes("Sales")) return <SalesDashboardPage />;
  if (roleNames.includes("Marketing")) return <MarketingDashboardPage />;
  if (roleNames.includes("Finance")) return <FinanceDashboardPage />;
  if (roleNames.includes("Operations")) return <OperationsDashboardPage />;
  return <DashboardPage />;
}
