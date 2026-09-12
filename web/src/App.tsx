import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/accounts/components/LoginPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { PropertiesListPage } from "@/features/properties/components/PropertiesListPage";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<div>Dashboard placeholder</div>} />
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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
