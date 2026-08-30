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
]
