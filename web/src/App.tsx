import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/accounts/components/LoginPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { PropertiesListPage } from "@/features/properties/components/PropertiesListPage";
import { PropertyCreatePage } from "@/features/properties/components/PropertyCreatePage";
import { LeadsListPage } from "@/features/leads/components/LeadsListPage";
import { LeadCreatePage } from "@/features/leads/components/LeadCreatePage";
import { ViewingsListPage } from "@/features/viewings/components/ViewingsListPage";
import { TransactionsListPage } from "@/features/transactions/components/TransactionsListPage";
import { CampaignsListPage } from "@/features/campaigns/components/CampaignsListPage";
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
            <Route path="/properties/new" element={<PropertyCreatePage />} />
            <Route path="/leads" element={<LeadsListPage />} />
            <Route path="/leads/new" element={<LeadCreatePage />} />
            <Route path="/viewings" element={<ViewingsListPage />} />
            <Route path="/transactions" element={<TransactionsListPage />} />
            <Route path="/campaigns" element={<CampaignsListPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
