"""Lead transition endpoint, unassigned filter, CEO/Ops assign, search, client defaults."""
import pytest

from crm.models import Lead

pytestmark = pytest.mark.django_db


def make_lead(agent=None, status="new", **kw):
    return Lead.objects.create(
        name=kw.pop("name", "Ama"), phone=kw.pop("phone", "0240000000"),
        assigned_agent=agent, status=status, **kw,
    )


@pytest.mark.parametrize("start,target", [
    ("new", "contacted"), ("contacted", "qualified"), ("qualified", "property_matched"),
    ("property_matched", "viewing"), ("viewing", "negotiation"), ("negotiation", "closed"),
    ("new", "lost"), ("negotiation", "lost"), ("lost", "contacted"),
])
def test_allowed_transitions(api, sales, start, target):
    lead = make_lead(sales, start)
    api.force_authenticate(sales)
    resp = api.post(f"/api/v1/leads/{lead.id}/transition/", {"status": target}, format="json")
    assert resp.status_code == 200, resp.data
    assert resp.data["status"] == target
    assert resp.data["status_label"]


@pytest.mark.parametrize("start,target", [
    ("new", "qualified"), ("closed", "lost"), ("closed", "contacted"), ("lost", "new"),
    ("contacted", "new"), ("new", "bogus"), ("new", ""),
])
def test_rejected_transitions(api, sales, start, target):
    lead = make_lead(sales, start)
    api.force_authenticate(sales)
    resp = api.post(f"/api/v1/leads/{lead.id}/transition/", {"status": target}, format="json")
    assert resp.status_code == 400
    assert isinstance(resp.data, list)


def test_qualify_still_works(api, sales):
    lead = make_lead(sales, "contacted")
    api.force_authenticate(sales)
    assert api.post(f"/api/v1/leads/{lead.id}/qualify/").data["status"] == "qualified"


def test_unassigned_filter_and_ceo_ops_assign(api, ceo, ops, sales):
    unassigned = make_lead(None)
    make_lead(sales, name="Kofi")
    for user in (ceo, ops):
        api.force_authenticate(user)
        resp = api.get("/api/v1/leads/?unassigned=true")
        assert [r["id"] for r in resp.data["results"]] == [str(unassigned.id)]

    api.force_authenticate(ops)
    resp = api.post(f"/api/v1/leads/{unassigned.id}/assign/", {"agent_id": str(sales.id)}, format="json")
    assert resp.status_code == 200, resp.data
    assert str(resp.data["assigned_agent"]) == str(sales.id)
    assert resp.data["status"] == "contacted"


def test_ceo_can_assign_but_marketing_cannot(api, ceo, marketing, sales):
    lead = make_lead(None)
    api.force_authenticate(marketing)
    assert api.post(f"/api/v1/leads/{lead.id}/assign/", {"agent_id": str(sales.id)}).status_code == 403
    api.force_authenticate(ceo)
    assert api.post(f"/api/v1/leads/{lead.id}/assign/", {"agent_id": str(sales.id)}).status_code == 200


def test_lead_search_matches_phone_and_email(api, sales):
    make_lead(sales, name="A", phone="0551112222", email="a@example.com")
    make_lead(sales, name="B", phone="0209999999", email="b@example.com")
    api.force_authenticate(sales)
    assert api.get("/api/v1/leads/?search=1112").data["count"] == 1
    assert api.get("/api/v1/leads/?search=b@example").data["count"] == 1


def test_client_create_defaults_assigned_agent_and_ordering(api, sales):
    api.force_authenticate(sales)
    first = api.post("/api/v1/clients/", {"name": "First", "phone": "1"}, format="json")
    assert first.status_code == 201, first.data
    assert str(first.data["assigned_agent"]) == str(sales.id)
    api.post("/api/v1/clients/", {"name": "Second", "phone": "2"}, format="json")
    names = [r["name"] for r in api.get("/api/v1/clients/").data["results"]]
    assert names == ["Second", "First"]
