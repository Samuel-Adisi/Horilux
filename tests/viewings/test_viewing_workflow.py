"""
Phase 9 functional tests: Viewing + FollowUp.
scheduled -> confirmed -> completed (outcome), warm/cold requires follow_up_due_date
"""
import datetime
import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


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
        title="Viewing Test House", property_type="residential", listing_type="sale",
        price=100000, currency="GHS", location="Accra", owner=owner, agent=listing_agent,
    )


@pytest.fixture
def a_client_record(sales_agent):
    from crm.models import Client
    return Client.objects.create(name="Test Client", phone="0244000000", assigned_agent=sales_agent)


def create_viewing(api_client, sales_agent, a_property, a_client_record):
    api_client.force_authenticate(sales_agent)
    resp = api_client.post("/api/v1/viewings/", {
        "client": str(a_client_record.id), "property": str(a_property.id),
        "agent": str(sales_agent.id), "date": "2026-09-15", "time": "10:00:00",
    }, format="json")
    assert resp.status_code == 201, resp.data
    return resp.data["id"]


def test_viewing_created_as_scheduled(api_client, sales_agent, a_property, a_client_record):
    vid = create_viewing(api_client, sales_agent, a_property, a_client_record)
    resp = api_client.get(f"/api/v1/viewings/{vid}/")
    assert resp.data["status"] == "scheduled"


def test_confirm_requires_scheduled(api_client, sales_agent, a_property, a_client_record):
    vid = create_viewing(api_client, sales_agent, a_property, a_client_record)
    resp = api_client.post(f"/api/v1/viewings/{vid}/confirm/")
    assert resp.status_code == 200
    assert resp.data["status"] == "confirmed"

    resp2 = api_client.post(f"/api/v1/viewings/{vid}/confirm/")
    assert resp2.status_code == 400


def test_complete_with_hot_outcome_no_followup_required(api_client, sales_agent, a_property, a_client_record):
    vid = create_viewing(api_client, sales_agent, a_property, a_client_record)
    resp = api_client.post(f"/api/v1/viewings/{vid}/complete/", {"outcome": "hot", "next_action": "Send offer"})
    assert resp.status_code == 200, resp.data
    assert resp.data["status"] == "completed"
    assert resp.data["outcome"] == "hot"


def test_complete_with_warm_outcome_requires_followup_due_date(api_client, sales_agent, a_property, a_client_record):
    vid = create_viewing(api_client, sales_agent, a_property, a_client_record)
    resp = api_client.post(f"/api/v1/viewings/{vid}/complete/", {"outcome": "warm"})
    assert resp.status_code == 400
    assert "follow_up_due_date" in str(resp.data)


def test_complete_with_warm_outcome_and_due_date_creates_followup(api_client, sales_agent, a_property, a_client_record):
    from viewings.models import FollowUp
    vid = create_viewing(api_client, sales_agent, a_property, a_client_record)
    resp = api_client.post(f"/api/v1/viewings/{vid}/complete/", {
        "outcome": "warm", "follow_up_due_date": "2026-09-20", "next_action": "Call back next week",
    })
    assert resp.status_code == 200, resp.data
    assert FollowUp.objects.filter(viewing_id=vid).exists()


def test_cancel_sets_no_show_when_flagged(api_client, sales_agent, a_property, a_client_record):
    vid = create_viewing(api_client, sales_agent, a_property, a_client_record)
    resp = api_client.post(f"/api/v1/viewings/{vid}/cancel/", {"no_show": True})
    assert resp.status_code == 200
    assert resp.data["status"] == "no_show"
