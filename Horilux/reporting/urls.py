from django.urls import path
from reporting import views

app_name = "reporting"

urlpatterns = [
    path("reports/listing/", views.ListingReportView.as_view(), name="report-listing"),
    path("reports/sales/", views.SalesReportView.as_view(), name="report-sales"),
    path("reports/marketing/", views.MarketingReportView.as_view(), name="report-marketing"),
    path("reports/finance/", views.FinanceReportView.as_view(), name="report-finance"),
    path("reports/operations/", views.OperationsReportView.as_view(), name="report-operations"),
    path("reports/ceo-dashboard/", views.CEODashboardView.as_view(), name="report-ceo-dashboard"),
    path("reports/finance-detail/", views.FinanceDetailReportView.as_view(), name="report-finance-detail"),
    path("reports/sales-pipeline/", views.SalesPipelineReportView.as_view(), name="report-sales-pipeline"),
    path("reports/marketing-campaigns/", views.MarketingCampaignDetailReportView.as_view(), name="report-marketing-campaigns"),
    path("reports/agents-roster/", views.AgentsRosterReportView.as_view(), name="report-agents-roster"),
    path("reports/staff-directory/", views.StaffDirectoryReportView.as_view(), name="report-staff-directory"),
    path("reports/property-performance/", views.PropertyPerformanceReportView.as_view(), name="report-property-performance"),
    path("reports/recent-activity/", views.RecentActivityReportView.as_view(), name="report-recent-activity"),
    path("reports/governance-actions/", views.GovernanceActionsReportView.as_view(), name="report-governance-actions"),
]
