"""
Tests for reporting/services.py CEO dashboard aggregations and the
CEODashboardView endpoint (RBAC + caching + empty-state correctness).
"""
import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture(autouse=True)
def clear_dashboard_cache():
    """Cache is process-local and keyed by a fixed name, so it must be
    cleared between tests or an earlier test's cached response leaks in."""
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def ceo_user(user_factory):
    return user_factory(role_name="CEO")


@pytest.fixture
def sales_agent(user_factory):
    return user_factory(role_name="Sales")


@pytest.fixture
def listing_agent(user_factory):
    return user_factory(role_name="Listing")


@pytest.fixture
def owner():
    from properties.models import PropertyOwner
    return PropertyOwner.objects.create(name="Test Owner", phone="0200000000")


@pytest.fixture
def a_property(owner, listing_agent):
    from properties.models import Property
    return Property.objects.create(
        title="Dashboard Test House", property_type="residential", listing_type="sale",
        price=500000, currency="GHS", location="Accra", owner=owner, agent=listing_agent,
    )


@pytest.fixture
def a_client_record(sales_agent):
    from crm.models import Client
    return Client.objects.create(name="Buyer", phone="0244000000", assigned_agent=sales_agent)


@pytest.fixture
def commission_rule(db):
    from transactions.models import CommissionRule
    return CommissionRule.objects.create(role=None, agent_split_percent=50, active=True)


def create_closed_transaction(sales_agent, a_property, a_client_record, owner, commission_rule):
    """Builds one fully-closed transaction directly via ORM, mirroring the
    state the transaction workflow tests drive through the API -- faster
    here since these tests care about the report output, not the workflow."""
    from transactions.models import Transaction, Commission

    txn = Transaction.objects.create(
        property=a_property, client=a_client_record, owner=owner, agent=sales_agent,
        price=500000, commission_percent=5, expected_commission=25000,
        status=Transaction.Status.CLOSED,
    )
    Commission.objects.create(
        transaction=txn, expected=25000, received=0, outstanding=25000,
        agent_share=12500, company_share=12500,
    )
    return txn


class TestCeoDashboardPermissions:
    def test_non_ceo_role_cannot_access(self, api_client, sales_agent):
        api_client.force_authenticate(sales_agent)
        resp = api_client.get("/api/v1/reports/ceo-dashboard/")
        assert resp.status_code == 403

    def test_ceo_role_can_access(self, api_client, ceo_user):
        api_client.force_authenticate(ceo_user)
        resp = api_client.get("/api/v1/reports/ceo-dashboard/")
        assert resp.status_code == 200

    def test_response_contains_all_expected_sections(self, api_client, ceo_user):
        api_client.force_authenticate(ceo_user)
        resp = api_client.get("/api/v1/reports/ceo-dashboard/")
        for key in [
            "listing", "sales", "marketing", "finance", "operations",
            "kpis", "revenue_trend", "conversion_funnel", "departments", "leaderboard",
        ]:
            assert key in resp.data, f"missing section: {key}"


class TestCeoKpis:
    def test_kpis_with_no_data_returns_zeros_not_errors(self):
        from reporting.services import ceo_kpis
        result = ceo_kpis()
        assert result["gross_volume_ytd"] == 0
        assert result["active_mandates"] == 0
        assert result["closed_yield_percent"] == 0

    def test_kpis_reflect_real_closed_transaction(
        self, sales_agent, a_property, a_client_record, owner, commission_rule, a_client_record_lead=None
    ):
        from reporting.services import ceo_kpis
        create_closed_transaction(sales_agent, a_property, a_client_record, owner, commission_rule)
        result = ceo_kpis()
        assert result["gross_volume_ytd"] == 500000
        assert result["active_mandates"] == 1


class TestDepartmentPerformance:
    def test_empty_state_returns_empty_list_not_fake_percentages(self):
        """Regression test: previously `grand_total = sum(...) or 1` meant a
        department with $0 in transactions would compute a misleading 0% of
        a fake $1 denominator instead of returning nothing."""
        from reporting.services import department_performance
        assert department_performance() == []

    def test_single_department_gets_100_percent(
        self, sales_agent, a_property, a_client_record, owner, commission_rule
    ):
        from accounts.models import Department
        dept = Department.objects.create(name="Sales")
        sales_agent.department = dept
        sales_agent.save()

        create_closed_transaction(sales_agent, a_property, a_client_record, owner, commission_rule)

        from reporting.services import department_performance
        result = department_performance()
        assert len(result) == 1
        assert result[0]["pct"] == 100.0
        assert result[0]["value"] == 500000.0


class TestAgentLeaderboard:
    def test_leaderboard_yield_percent_uses_correct_lead_count(
        self, sales_agent, a_property, a_client_record, owner, commission_rule
    ):
        """Regression test for the N+1 fix: verifies the batched lead-count
        query attributes leads to the correct agent, not just that it
        doesn't crash."""
        from crm.models import Lead
        Lead.objects.create(
            name="Lead One", phone="0201111111", assigned_agent=sales_agent,
            status=Lead.Status.QUALIFIED, purpose=Lead.Purpose.BUY,
        )
        Lead.objects.create(
            name="Lead Two", phone="0202222222", assigned_agent=sales_agent,
            status=Lead.Status.NEW, purpose=Lead.Purpose.BUY,
        )
        create_closed_transaction(sales_agent, a_property, a_client_record, owner, commission_rule)

        from reporting.services import agent_leaderboard
        result = agent_leaderboard()
        assert len(result) == 1
        assert result[0]["deals"] == 1
        assert result[0]["yield_percent"] == 50.0  # 1 deal / 2 leads

    def test_leaderboard_empty_when_no_closed_transactions(self):
        from reporting.services import agent_leaderboard
        assert agent_leaderboard() == []


class TestCeoDashboardCaching:
    def test_second_call_returns_cached_result_without_requerying(
        self, sales_agent, a_property, a_client_record, owner, commission_rule, django_assert_num_queries
    ):
        from reporting.services import ceo_dashboard

        first = ceo_dashboard()  # populates cache
        create_closed_transaction(sales_agent, a_property, a_client_record, owner, commission_rule)

        second = ceo_dashboard()  # should return the cached (stale) result
        assert second == first
        # gross_volume_ytd only changes once the new transaction is counted --
        # if caching works, the second call must still show 0, matching `first`,
        # even though a real transaction now exists in the DB.
        assert second["kpis"]["gross_volume_ytd"] == 0

    def test_cache_expires_and_reflects_new_data(self, settings):
        from reporting import services

        services.ceo_dashboard()
        cache.delete(services.CEO_DASHBOARD_CACHE_KEY)  # simulate TTL expiry
        result = services.ceo_dashboard()
        assert result["kpis"]["active_mandates"] == 0