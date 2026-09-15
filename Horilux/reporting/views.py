from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import has_permission, get_user_scopes
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


class SalesPipelineReportView(APIView):
    """
    Sales pipeline detail for the CEO Sales Pipeline page.
    Gated on report_sales + company scope, matching SalesReportView's resource.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not has_permission(request.user, "view", "report_sales"):
            return Response({"detail": "Not permitted."}, status=403)
        scopes = get_user_scopes(request.user, "view", "report_sales")
        if "company" not in scopes and not request.user.is_superuser:
            return Response({"detail": "Not permitted."}, status=403)
        return Response(services.sales_pipeline_report())


class AgentsRosterReportView(APIView):
    """
    Full agent roster with performance data for the CEO Agents Roster page.
    Gated on report_sales + company scope -- same resource CEO already has
    view/export on for the leaderboard card, just a fuller view of it.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not has_permission(request.user, "view", "report_sales"):
            return Response({"detail": "Not permitted."}, status=403)
        scopes = get_user_scopes(request.user, "view", "report_sales")
        if "company" not in scopes and not request.user.is_superuser:
            return Response({"detail": "Not permitted."}, status=403)
        return Response(services.agents_roster_report())


class FinanceDetailReportView(APIView):
    """
    Detailed revenue/commission report for the CEO Revenue page.
    Gated the same way as FinanceReportView: report_finance + company scope,
    since this is company-wide financial data, not per-agent.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not has_permission(request.user, "view", "report_finance"):
            return Response({"detail": "Not permitted."}, status=403)
        scopes = get_user_scopes(request.user, "view", "report_finance")
        if "company" not in scopes and not request.user.is_superuser:
            return Response({"detail": "Not permitted."}, status=403)
        months = int(request.query_params.get("months", 6))
        return Response(services.finance_detail_report(months=months))


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
        for resource in self.resources:
            scopes = get_user_scopes(request.user, "view", resource)
            if "company" not in scopes:
                return Response({"detail": "Not permitted."}, status=403)
        return Response(services.ceo_dashboard())
