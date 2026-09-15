import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/accounts/components/LoginPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { PropertiesListPage } from "@/features/properties/components/PropertiesListPage";
import { DashboardRouter } from "@/features/dashboard/DashboardRouter";
import { PropertyDetailPage } from "@/features/properties/components/PropertyDetailPage";
import { PropertyCreatePage } from "@/features/properties/components/PropertyCreatePage";
import { LeadsListPage } from "@/features/leads/components/LeadsListPage";
import { LeadCreatePage } from "@/features/leads/components/LeadCreatePage";
import { ViewingsListPage } from "@/features/viewings/components/ViewingsListPage";
import { ViewingCreatePage } from "@/features/viewings/components/ViewingCreatePage";
import { TransactionsListPage } from "@/features/transactions/components/TransactionsListPage";
import { TransactionCreatePage } from "@/features/transactions/components/TransactionCreatePage";
import { CampaignsListPage } from "@/features/campaigns/components/CampaignsListPage";
import { CampaignCreatePage } from "@/features/campaigns/components/CampaignCreatePage";
import { ReportsPage } from "@/features/reports/components/ReportsPage";
import CeoLayout from "@/features/ceo/CeoLayout";
import CeoOverviewPage from "@/features/ceo/pages/CeoOverviewPage";
import CeoRevenuePage from "@/features/ceo/pages/CeoRevenuePage";
import CeoSalesPipelinePage from "@/features/ceo/pages/CeoSalesPipelinePage";
import CeoTransactionsPage from "@/features/ceo/pages/CeoTransactionsPage";
import CeoAgentsRosterPage from "@/features/ceo/pages/CeoAgentsRosterPage";
import CeoPropertiesPage from "@/features/ceo/pages/CeoPropertiesPage";
import CeoPropertyDetailPage from "@/features/ceo/pages/CeoPropertyDetailPage";
import CeoCampaignsPage from "@/features/ceo/pages/CeoCampaignsPage";
import CeoComingSoonPage from "@/features/ceo/pages/CeoComingSoonPage";
import CeoStaffDirectoryPage from "@/features/ceo/pages/CeoStaffDirectoryPage";
import CeoLeadsPage from "@/features/ceo/pages/CeoLeadsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/properties" element={<PropertiesListPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/properties/new" element={<PropertyCreatePage />} />
            <Route path="/leads" element={<LeadsListPage />} />
            <Route path="/leads/new" element={<LeadCreatePage />} />
            <Route path="/viewings" element={<ViewingsListPage />} />
            <Route path="/viewings/new" element={<ViewingCreatePage />} />
            <Route path="/transactions" element={<TransactionsListPage />} />
            <Route path="/transactions/new" element={<TransactionCreatePage />} />
            <Route path="/campaigns" element={<CampaignsListPage />} />
            <Route path="/campaigns/new" element={<CampaignCreatePage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          <Route path="/ceo" element={<CeoLayout />}>
            <Route index element={<CeoOverviewPage />} />
            <Route path="revenue" element={<CeoRevenuePage />} />
            <Route path="sales" element={<CeoSalesPipelinePage />} />
            <Route path="transactions" element={<CeoTransactionsPage />} />
            <Route path="forecasting" element={<CeoComingSoonPage />} />
            <Route path="properties" element={<CeoPropertiesPage />} />
            <Route path="properties/:id" element={<CeoPropertyDetailPage />} />
            <Route path="properties/performance" element={<CeoComingSoonPage />} />
            <Route path="locations" element={<CeoComingSoonPage />} />
            <Route path="developers" element={<CeoComingSoonPage />} />
            <Route path="leads" element={<CeoLeadsPage />} />
            <Route path="customers" element={<CeoComingSoonPage />} />
            <Route path="crm" element={<CeoComingSoonPage />} />
            <Route path="agents" element={<CeoAgentsRosterPage />} />
            <Route path="agencies" element={<CeoComingSoonPage />} />
            <Route path="landlords" element={<CeoComingSoonPage />} />
            <Route path="staff" element={<CeoStaffDirectoryPage />} />
            <Route path="campaigns" element={<CeoCampaignsPage />} />
            <Route path="lead-sources" element={<CeoComingSoonPage />} />
            <Route path="advertising" element={<CeoComingSoonPage />} />
            <Route path="rentals/performance" element={<CeoComingSoonPage />} />
            <Route path="rentals/occupancy" element={<CeoComingSoonPage />} />
            <Route path="rentals/tenancies" element={<CeoComingSoonPage />} />
            <Route path="approvals" element={<CeoComingSoonPage />} />
            <Route path="audit-logs" element={<CeoComingSoonPage />} />
            <Route path="risk" element={<CeoComingSoonPage />} />
            <Route path="ai-insights" element={<CeoComingSoonPage />} />
            <Route path="settings" element={<CeoComingSoonPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
