from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.http import HttpResponse

from accounts.permissions import has_permission, get_user_scopes
from reporting import services
from reporting.pdf_export import generate_board_pack_pdf


REPORT_RESOURCES = ("report_listing", "report_sales", "report_marketing", "report_finance", "report_operations")


def _has_company_property_oversight(user):
    """
    Gate for the company-wide property analytics (property-performance,
    governance-actions, territory-intelligence): company-scope property:view
    AND company scope on at least one report_* resource. The second clause
    keeps Sales/Marketing out -- they now hold company-scope property:view
    only for browsing the catalogue -- while CEO, Finance and Operations keep
    the access they had before.
    """
    if user.is_superuser:
        return True
    if "company" not in get_user_scopes(user, "view", "property"):
        return False
    return any("company" in get_user_scopes(user, "view", r) for r in REPORT_RESOURCES)


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


class MarketingCampaignDetailReportView(APIView):
    """
    Campaign directory detail for the CEO Campaigns page.
    Gated on report_marketing + company scope, matching MarketingReportView's resource.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not has_permission(request.user, "view", "report_marketing"):
            return Response({"detail": "Not permitted."}, status=403)
        scopes = get_user_scopes(request.user, "view", "report_marketing")
        if "company" not in scopes and not request.user.is_superuser:
            return Response({"detail": "Not permitted."}, status=403)
        return Response(services.marketing_campaign_detail_report())


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
        try:
            months = int(request.query_params.get("months", 6))
        except (TypeError, ValueError):
            months = 6
        if months < 1 or months > 120:
            months = 6
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


class RevenueTrendRangeView(APIView):
    """
    Revenue trend for a selectable range, decoupled from the cached
    ceo_dashboard() bundle so changing the range doesn't require
    re-fetching the whole dashboard. Mirrors CEODashboardView's
    permission gate since revenue trend is dashboard-level data.
    """
    permission_classes = [IsAuthenticated]
    resources = ["report_listing", "report_sales", "report_marketing", "report_finance", "report_operations"]
    RANGE_MONTHS = {"M": 6, "Q": 12, "Y": 24}

    def get(self, request):
        if not request.user.is_superuser:
            for resource in self.resources:
                scopes = get_user_scopes(request.user, "view", resource)
                if "company" not in scopes:
                    return Response({"detail": "Not permitted."}, status=403)

        range_param = request.query_params.get("range", "M")
        months = self.RANGE_MONTHS.get(range_param, 6)
        return Response({
            "range": range_param,
            "months": months,
            "trend": services.revenue_trend(months=months),
        })


class BoardPackPDFView(APIView):
    """
    Exports the same data as CEODashboardView (services.ceo_dashboard())
    as a formal PDF. Mirrors CEODashboardView's exact permission gate --
    company scope required on all five report resources, since it
    aggregates every department's data.
    """
    permission_classes = [IsAuthenticated]
    resources = ["report_listing", "report_sales", "report_marketing", "report_finance", "report_operations"]

    def get(self, request):
        if not request.user.is_superuser:
            for resource in self.resources:
                scopes = get_user_scopes(request.user, "view", resource)
                if "company" not in scopes:
                    return Response({"detail": "Not permitted."}, status=403)

        data = services.ceo_dashboard()
        pdf_bytes = generate_board_pack_pdf(data)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="horilux-board-pack.pdf"'
        return response


class StaffDirectoryReportView(APIView):
    """
    Staff directory for the CEO Staff Directory page.
    Gated on user_management:view -- per the seeded RBAC matrix, only CEO
    and Operations roles hold this permission, both at company scope, so
    this view intentionally returns full-company data or 403, with no
    department/team-scoped branch (none exists in the matrix yet).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not has_permission(request.user, "view", "user_management"):
            return Response({"detail": "Not permitted."}, status=403)
        scopes = get_user_scopes(request.user, "view", "user_management")
        if "company" not in scopes and not request.user.is_superuser:
            return Response({"detail": "Not permitted."}, status=403)
        return Response(services.staff_directory_report())


class PropertyPerformanceReportView(APIView):
    """
    Property performance for the CEO Property Performance page.
    Gated on property:view -- restricted to company scope only (CEO-level
    aggregate across all properties, same pattern as StaffDirectoryReportView).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _has_company_property_oversight(request.user):
            return Response({"detail": "Not permitted."}, status=403)
        return Response(services.property_performance())


class RecentActivityReportView(APIView):
    """
    Recent activity feed for the CEO Overview page, backed by AuditLog.
    Gated on audit_log:view, same pattern as PropertyPerformanceReportView.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not has_permission(request.user, "view", "audit_log"):
            return Response({"detail": "Not permitted."}, status=403)
        scopes = get_user_scopes(request.user, "view", "audit_log")
        if "company" not in scopes and not request.user.is_superuser:
            return Response({"detail": "Not permitted."}, status=403)
        return Response(services.recent_activity())


class GovernanceActionsReportView(APIView):
    """
    Governance Action Center for the CEO Overview page: pending property
    approvals, unassigned leads, overdue viewings. Same pattern as
    PropertyPerformanceReportView.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _has_company_property_oversight(request.user):
            return Response({"detail": "Not permitted."}, status=403)
        return Response(services.governance_actions())


class TerritoryIntelligenceReportView(APIView):
    """
    Territory Intelligence (corridor GTV) for the CEO Overview page.
    Same pattern as PropertyPerformanceReportView.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _has_company_property_oversight(request.user):
            return Response({"detail": "Not permitted."}, status=403)
        return Response(services.territory_intelligence())
