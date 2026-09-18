"""Tasks RBAC/filters, campaigns serializer/filters, staff password, audit actor, misc crash fixes."""
import pytest
from django.core.cache import cache

from operations.models import Task

pytestmark = pytest.mark.django_db


# -- tasks -------------------------------------------------------------------------

def test_ops_task_crud(api, ops, sales):
    api.force_authenticate(ops)
    resp = api.post("/api/v1/tasks/", {"title": "Call owner", "owner": str(sales.id)}, format="json")
    assert resp.status_code == 201, resp.data
    assert resp.data["status_label"] == "Open"
    assert api.delete(f"/api/v1/tasks/{resp.data['id']}/").status_code == 204


def test_other_roles_see_and_edit_only_own_tasks(api, sales, finance, ceo):
    mine = Task.objects.create(title="Mine", owner=sales)
    theirs = Task.objects.create(title="Theirs", owner=finance)
    Task.objects.create(title="Nobody's")

    api.force_authenticate(sales)
    rows = api.get("/api/v1/tasks/").data["results"]
    assert [r["title"] for r in rows] == ["Mine"]
    assert api.patch(f"/api/v1/tasks/{mine.id}/", {"status": "done"}, format="json").status_code == 200
    assert api.patch(f"/api/v1/tasks/{theirs.id}/", {"status": "done"}, format="json").status_code == 404
    assert api.post("/api/v1/tasks/", {"title": "x"}, format="json").status_code == 403
    assert api.delete(f"/api/v1/tasks/{mine.id}/").status_code == 403

    api.force_authenticate(ceo)
    assert api.get("/api/v1/tasks/").data["count"] == 3


def test_task_filters(api, ceo, ops):
    Task.objects.create(title="Open one", owner=ceo)
    Task.objects.create(title="Done one", owner=ops, status="done")
    Task.objects.create(title="Another open", owner=ops)
    api.force_authenticate(ops)
    assert api.get("/api/v1/tasks/?status=done").data["count"] == 1
    assert api.get("/api/v1/tasks/?mine=true").data["count"] == 2
    assert api.get("/api/v1/tasks/?mine=true&status=open").data["count"] == 1
    assert api.get("/api/v1/tasks/?search=another").data["count"] == 1


# -- campaigns ------------------------------------------------------------------------

def test_campaign_serializer_fields_and_filter(api, marketing, make_property):
    from marketing.models import MarketingCampaign
    prop = make_property(status="marketing_ready", title="Sea View")
    api.force_authenticate(marketing)
    resp = api.post("/api/v1/campaigns/", {"property": str(prop.id), "content": {"headline": "Hi"}}, format="json")
    assert resp.status_code == 201, resp.data
    assert resp.data["property_title"] == "Sea View"
    assert resp.data["created_by_name"] == "Test User"
    assert resp.data["status_label"] == "Draft"
    MarketingCampaign.objects.create(property=prop, created_by=marketing, status="published")
    assert api.get("/api/v1/campaigns/?status=draft").data["count"] == 1
    assert api.get("/api/v1/campaigns/").data["results"][0]["status"] == "published"  # -created_at


def test_marketing_can_open_campaign_performance_detail(api, marketing, make_property):
    from marketing.models import MarketingCampaign, CampaignPerformance
    c = MarketingCampaign.objects.create(property=make_property(status="published"), created_by=marketing)
    perf = CampaignPerformance.objects.create(campaign=c, views=1)
    api.force_authenticate(marketing)
    assert api.get(f"/api/v1/campaign-performance/{perf.id}/").status_code == 200


# -- staff --------------------------------------------------------------------------------

@pytest.mark.parametrize("password", [None, "", "short"])
def test_staff_create_requires_password(api, ceo, password):
    api.force_authenticate(ceo)
    body = {"email": "new@horilux.test", "first_name": "N", "last_name": "U"}
    if password is not None:
        body["password"] = password
    resp = api.post("/api/v1/accounts/staff/", body, format="json")
    assert resp.status_code == 400
    assert "password" in resp.data


def test_staff_create_with_password(api, ceo):
    api.force_authenticate(ceo)
    resp = api.post("/api/v1/accounts/staff/", {
        "email": "new2@horilux.test", "first_name": "N", "last_name": "U", "password": "longenough1",
    }, format="json")
    assert resp.status_code == 201, resp.data
    from accounts.models import User
    assert User.objects.get(email="new2@horilux.test").check_password("longenough1")


def test_staff_update_without_password_ok(api, ceo, sales):
    api.force_authenticate(ceo)
    resp = api.patch(f"/api/v1/accounts/staff/{sales.id}/", {"phone": "123"}, format="json")
    assert resp.status_code == 200, resp.data


# -- audit actor + recent activity ------------------------------------------------------------

def test_audit_actor_recorded_for_api_writes(api, listing, prop_owner):
    from audit.models import AuditLog
    api.force_authenticate(listing)
    resp = api.post("/api/v1/properties/", {
        "title": "Audited", "property_type": "residential", "listing_type": "sale",
        "price": "1000.00", "location": "Accra", "owner": str(prop_owner.id),
    }, format="json")
    assert resp.status_code == 201
    log = AuditLog.objects.filter(model_name="Property", object_id=resp.data["id"], action="create").get()
    assert log.actor_id == listing.id


def test_audit_actor_recorded_with_real_jwt(api, listing, prop_owner):
    from audit.models import AuditLog
    login = api.post("/api/v1/auth/login/", {"email": listing.email, "password": "TestPass123!"}, format="json")
    assert login.status_code == 200, login.data
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    resp = api.post("/api/v1/properties/", {
        "title": "JWT Audited", "property_type": "residential", "listing_type": "sale",
        "price": "1000.00", "location": "Accra", "owner": str(prop_owner.id),
    }, format="json")
    assert resp.status_code == 201
    log = AuditLog.objects.get(model_name="Property", object_id=resp.data["id"], action="create")
    assert log.actor_id == listing.id


def test_audit_actor_is_none_outside_requests(make_property):
    from audit.models import AuditLog
    prop = make_property()
    assert AuditLog.objects.get(model_name="Property", object_id=str(prop.id), action="create").actor_id is None


def test_recent_activity_with_actor(api, ceo, listing, prop_owner):
    api.force_authenticate(listing)
    api.post("/api/v1/properties/", {
        "title": "Activity", "property_type": "residential", "listing_type": "sale",
        "price": "1000.00", "location": "Accra", "owner": str(prop_owner.id),
    }, format="json")
    api.force_authenticate(ceo)
    resp = api.get("/api/v1/reports/recent-activity/")
    assert resp.status_code == 200, resp.data
    assert any(row["actor"] == "Test User" for row in resp.data)


def test_audit_log_actor_name(api, ceo, listing, prop_owner):
    api.force_authenticate(listing)
    api.post("/api/v1/properties/", {
        "title": "Named", "property_type": "residential", "listing_type": "sale",
        "price": "1000.00", "location": "Accra", "owner": str(prop_owner.id),
    }, format="json")
    api.force_authenticate(ceo)
    rows = api.get("/api/v1/audit-logs/?model_name=Property").data["results"]
    assert rows[0]["actor_name"] == "Test User"


# -- misc ------------------------------------------------------------------------------------

def test_finance_detail_bad_months(api, ceo):
    cache.clear()
    api.force_authenticate(ceo)
    resp = api.get("/api/v1/reports/finance-detail/?months=abc")
    assert resp.status_code == 200
    assert len(resp.data["monthly_ledger"]) <= 6


def test_notification_preference_event_type_read_only(api, sales):
    api.force_authenticate(sales)
    rows = api.get("/api/v1/notification-preferences/").data["results"]
    pref = rows[0]
    resp = api.patch(
        f"/api/v1/notification-preferences/{pref['id']}/",
        {"event_type": rows[1]["event_type"], "enabled": False}, format="json",
    )
    assert resp.status_code == 200
    assert resp.data["event_type"] == pref["event_type"]
    assert resp.data["enabled"] is False


def test_name_fallback_uses_email(api, ceo, user_factory, make_property):
    agent = user_factory(role_name="Listing", first_name="", last_name="")
    prop = make_property(agent=agent)
    api.force_authenticate(ceo)
    assert api.get(f"/api/v1/properties/{prop.id}/").data["agent_name"] == agent.email


@pytest.mark.parametrize("path", [
    "/api/v1/reports/property-performance/",
    "/api/v1/reports/governance-actions/",
    "/api/v1/reports/territory-intelligence/",
])
def test_company_property_reports_gate_unchanged(api, user_factory, path):
    expected = {"CEO": 200, "Finance": 200, "Operations": 200, "Sales": 403, "Marketing": 403, "Listing": 403}
    for role, code in expected.items():
        api.force_authenticate(user_factory(role_name=role))
        assert api.get(path).status_code == code, (role, path)
