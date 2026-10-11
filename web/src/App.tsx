import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { LoginPage } from "@/features/accounts/components/LoginPage";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/routes/RequireAuth";
import { RequirePermission } from "@/routes/RequirePermission";
import { PageFallback } from "@/routes/PageFallback";
import { NotFoundPage } from "@/routes/NotFoundPage";
import type { Action, Resource } from "@/features/accounts/permissions";

// Each page is its own chunk so the first load stays small.
function page<K extends string, T extends Record<K, ComponentType>>(loader: () => Promise<T>, name: K) {
  return lazy(() => loader().then((m) => ({ default: m[name] })));
}

const HomePage = page(() => import("@/features/home/HomePage"), "HomePage");
const PropertiesPage = page(() => import("@/features/properties/pages/PropertiesPage"), "PropertiesPage");
const PropertyDetailPage = page(() => import("@/features/properties/pages/PropertyDetailPage"), "PropertyDetailPage");
const PropertyFormPage = page(() => import("@/features/properties/pages/PropertyFormPage"), "PropertyFormPage");
const ApprovalsPage = page(() => import("@/features/properties/pages/ApprovalsPage"), "ApprovalsPage");
const OwnersPage = page(() => import("@/features/properties/pages/OwnersPage"), "OwnersPage");
const LeadsPage = page(() => import("@/features/crm/pages/LeadsPage"), "LeadsPage");
const LeadDetailPage = page(() => import("@/features/crm/pages/LeadDetailPage"), "LeadDetailPage");
const ClientsPage = page(() => import("@/features/crm/pages/ClientsPage"), "ClientsPage");
const ClientDetailPage = page(() => import("@/features/crm/pages/ClientDetailPage"), "ClientDetailPage");
const ActivityPage = page(() => import("@/features/crm/pages/ActivityPage"), "ActivityPage");
const ViewingsPage = page(() => import("@/features/viewings/pages/ViewingsPage"), "ViewingsPage");
const FollowUpsPage = page(() => import("@/features/viewings/pages/FollowUpsPage"), "FollowUpsPage");
const TransactionsPage = page(() => import("@/features/transactions/pages/TransactionsPage"), "TransactionsPage");
const TransactionFormPage = page(() => import("@/features/transactions/pages/TransactionFormPage"), "TransactionFormPage");
const TransactionDetailPage = page(() => import("@/features/transactions/pages/TransactionDetailPage"), "TransactionDetailPage");
const CampaignsPage = page(() => import("@/features/campaigns/CampaignsPage"), "CampaignsPage");
const TasksPage = page(() => import("@/features/tasks/TasksPage"), "TasksPage");
const NotificationsPage = page(() => import("@/features/notifications/NotificationsPage"), "NotificationsPage");
const RevenuePage = page(() => import("@/features/insights/RevenuePage"), "RevenuePage");
const PipelinePage = page(() => import("@/features/insights/PipelinePage"), "PipelinePage");
const PropertyPerformancePage = page(() => import("@/features/insights/PropertyPerformancePage"), "PropertyPerformancePage");
const AgentsPage = page(() => import("@/features/insights/AgentsPage"), "AgentsPage");
const LeadSourcesPage = page(() => import("@/features/insights/LeadSourcesPage"), "LeadSourcesPage");
const LocationsPage = page(() => import("@/features/insights/LocationsPage"), "LocationsPage");
const ReportsPage = page(() => import("@/features/reports/ReportsPage"), "ReportsPage");
const StaffPage = page(() => import("@/features/admin/StaffPage"), "StaffPage");
const SettingsPage = page(() => import("@/features/admin/SettingsPage"), "SettingsPage");
const AuditLogPage = page(() => import("@/features/audit/AuditLogPage"), "AuditLogPage");

function gate(anyOf: [Resource, Action][], el: ReactNode) {
  return <RequirePermission anyOf={anyOf}>{el}</RequirePermission>;
}

const REPORTS: [Resource, Action][] = [
  ["report_listing", "view"],
  ["report_sales", "view"],
  ["report_marketing", "view"],
  ["report_finance", "view"],
  ["report_operations", "view"],
];

/** Old bookmarks (/ceo/..., /dashboard) keep working. */
const LEGACY: Record<string, string> = {
  "/dashboard": "/",
  "/ceo": "/",
  "/ceo/revenue": "/insights/revenue",
  "/ceo/sales": "/insights/pipeline",
  "/ceo/transactions": "/transactions",
  "/ceo/properties": "/properties",
  "/ceo/properties/performance": "/insights/properties",
  "/ceo/locations": "/insights/locations",
  "/ceo/landlords": "/owners",
  "/ceo/leads": "/leads",
  "/ceo/customers": "/clients",
  "/ceo/crm": "/activity",
  "/ceo/agents": "/insights/agents",
  "/ceo/staff": "/staff",
  "/ceo/campaigns": "/campaigns",
  "/ceo/lead-sources": "/insights/lead-sources",
  "/ceo/approvals": "/approvals",
  "/ceo/viewings": "/viewings",
  "/ceo/audit-logs": "/audit-log",
  "/ceo/settings": "/settings",
  "/properties/performance": "/insights/properties",
};

function LegacyRedirect() {
  const { pathname, search } = useLocation();
  const clean = pathname.replace(/\/$/, "") || "/";
  const target = LEGACY[clean];
  if (target) return <Navigate to={target + search} replace />;
  const detail = clean.match(/^\/ceo\/properties\/([^/]+)$/);
  if (detail) return <Navigate to={`/properties/${detail[1]}`} replace />;
  if (clean.startsWith("/ceo")) return <Navigate to="/" replace />;
  return <NotFoundPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route
              element={
                // Lazy pages show a skeleton while their chunk loads, not a blank screen.
                <Suspense fallback={<PageFallback />}>
                  <Outlet />
                </Suspense>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="tasks" element={gate([["task", "view"]], <TasksPage />)} />
              <Route path="notifications" element={<NotificationsPage />} />

              <Route path="properties" element={gate([["property", "view"]], <PropertiesPage />)} />
              <Route path="properties/new" element={gate([["property", "create"]], <PropertyFormPage />)} />
              <Route path="properties/:id" element={gate([["property", "view"]], <PropertyDetailPage />)} />
              <Route path="properties/:id/edit" element={gate([["property", "edit"]], <PropertyFormPage />)} />
              <Route path="approvals" element={gate([["property", "approve"], ["property_verification", "view"]], <ApprovalsPage />)} />
              <Route path="owners" element={gate([["property", "create"]], <OwnersPage />)} />

              <Route path="leads" element={gate([["lead", "view"]], <LeadsPage />)} />
              <Route path="leads/:id" element={gate([["lead", "view"]], <LeadDetailPage />)} />
              <Route path="clients" element={gate([["client", "view"]], <ClientsPage />)} />
              <Route path="clients/:id" element={gate([["client", "view"]], <ClientDetailPage />)} />
              <Route path="viewings" element={gate([["viewing", "view"]], <ViewingsPage />)} />
              <Route path="follow-ups" element={gate([["followup", "view"]], <FollowUpsPage />)} />
              <Route path="activity" element={gate([["interaction", "view"]], <ActivityPage />)} />

              <Route path="transactions" element={gate([["transaction", "view"]], <TransactionsPage />)} />
              <Route path="transactions/new" element={gate([["transaction", "create"]], <TransactionFormPage />)} />
              <Route path="transactions/:id" element={gate([["transaction", "view"]], <TransactionDetailPage />)} />
              <Route path="campaigns" element={gate([["marketing_campaign", "view"]], <CampaignsPage />)} />

              <Route path="insights/revenue" element={gate([["finance_insights", "view"]], <RevenuePage />)} />
              <Route path="insights/pipeline" element={gate([["executive_insights", "view"]], <PipelinePage />)} />
              <Route path="insights/properties" element={gate([["property_insights", "view"]], <PropertyPerformancePage />)} />
              <Route path="insights/agents" element={gate([["executive_insights", "view"]], <AgentsPage />)} />
              <Route path="insights/lead-sources" element={gate([["lead_source_stats", "view"]], <LeadSourcesPage />)} />
              <Route path="insights/locations" element={gate([["property_insights", "view"]], <LocationsPage />)} />
              <Route path="reports" element={gate(REPORTS, <ReportsPage />)} />

              <Route path="staff" element={gate([["user_management", "view"]], <StaffPage />)} />
              <Route path="audit-log" element={gate([["audit_log", "view"]], <AuditLogPage />)} />
              <Route path="settings" element={<SettingsPage />} />

              <Route path="*" element={<LegacyRedirect />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
