from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import has_permission, get_user_scopes, get_user_scopes_bulk
from reporting import services


class BaseReportView(APIView):
    permission_classes = [IsAuthenticated]
    report_resource = None
    service_fn = None

    def get(self, request):
        if not has_permission(request.user, "view", self.report_resource):
            return Response({"detail": "Not permitted."}, status=403)
        scopes = get_user_scopes(request.user, "view", self.report_resource)
        user_arg = None if "company" in scopes or request.user.is_superuser else request.user
        return Response(self.service_fn(user_arg))


class ListingReportView(BaseReportView):
    report_resource = "report_listing"
    service_fn = staticmethod(services.listing_report)


class SalesReportView(BaseReportView):
    report_resource = "report_sales"
    service_fn = staticmethod(services.sales_report)


class MarketingReportView(BaseReportView):
    report_resource = "report_marketing"
    service_fn = staticmethod(services.marketing_report)


class FinanceReportView(BaseReportView):
    report_resource = "report_finance"
    service_fn = staticmethod(services.finance_report)


class OperationsReportView(BaseReportView):
    report_resource = "report_operations"
    service_fn = staticmethod(services.operations_report)


class CEODashboardView(APIView):
    """
    CEO dashboard requires company scope on ALL five report resources --
    not just one -- since it aggregates every department's data.
    """
    permission_classes = [IsAuthenticated]
    resources = ["report_listing", "report_sales", "report_marketing", "report_finance", "report_operations"]

    def get(self, request):
        if request.user.is_superuser:
            return Response(services.ceo_dashboard())
        scopes_by_resource = get_user_scopes_bulk(request.user, "view", self.resources)
        for resource in self.resources:
            if "company" not in scopes_by_resource[resource]:
                return Response({"detail": "Not permitted."}, status=403)
        return Response(services.ceo_dashboard())
