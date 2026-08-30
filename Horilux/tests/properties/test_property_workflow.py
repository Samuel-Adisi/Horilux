"""
Phase 9 functional tests: Property state machine.
draft -> pending_verification -> verified -> ... -> published
"""
import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def listing_agent(user_factory):
    return user_factory(role_name="Listing")


@pytest.fixture
def ceo(user_factory):
    return user_factory(role_name="CEO")


@pytest.fixture
def owner():
    from properties.models import PropertyOwner
    return PropertyOwner.objects.create(name="Test Owner", phone="0200000000")


def create_property(api_client, listing_agent, owner):
    api_client.force_authenticate(listing_agent)
    resp = api_client.post("/api/v1/properties/", {
        "title": "Test House", "property_type": "residential", "listing_type": "sale",
        "price": "150000.00", "currency": "GHS", "location": "Accra",
        "owner": str(owner.id),
    }, format="json")
    assert resp.status_code == 201, resp.data
    return resp.data["id"]


def test_property_created_in_draft(api_client, listing_agent, owner):
    prop_id = create_property(api_client, listing_agent, owner)
    resp = api_client.get(f"/api/v1/properties/{prop_id}/")
    assert resp.data["status"] == "draft"


def test_submit_for_verification_from_draft_succeeds(api_client, listing_agent, owner):
    prop_id = create_property(api_client, listing_agent, owner)
    resp = api_client.post(f"/api/v1/properties/{prop_id}/submit_for_verification/")
    assert resp.status_code == 200, resp.data
    assert resp.data["status"] == "pending_verification"


def test_submit_for_verification_from_wrong_status_fails(api_client, listing_agent, owner):
    prop_id = create_property(api_client, listing_agent, owner)
    api_client.post(f"/api/v1/properties/{prop_id}/submit_for_verification/")
    resp = api_client.post(f"/api/v1/properties/{prop_id}/submit_for_verification/")
    assert resp.status_code == 400


def test_approve_requires_complete_checklist(api_client, listing_agent, ceo, owner):
    prop_id = create_property(api_client, listing_agent, owner)
    api_client.post(f"/api/v1/properties/{prop_id}/submit_for_verification/")

    api_client.force_authenticate(ceo)
    resp = api_client.post(f"/api/v1/properties/{prop_id}/approve/")
    assert resp.status_code == 400
    assert "incomplete" in str(resp.data).lower()


def test_approve_succeeds_with_complete_checklist(api_client, listing_agent, ceo, owner):
    from properties.models import Property
    prop_id = create_property(api_client, listing_agent, owner)
    api_client.post(f"/api/v1/properties/{prop_id}/submit_for_verification/")

    prop = Property.objects.get(id=prop_id)
    checklist = prop.verification
    for field in ["owner_info_ok", "price_ok", "location_ok", "details_ok",
                  "photos_ok", "documents_ok", "commission_agreement_ok"]:
        setattr(checklist, field, True)
    checklist.save()

    api_client.force_authenticate(ceo)
    resp = api_client.post(f"/api/v1/properties/{prop_id}/approve/")
    assert resp.status_code == 200, resp.data
    assert resp.data["status"] == "verified"


def test_publish_requires_marketing_ready_status(api_client, listing_agent, ceo, owner):
    prop_id = create_property(api_client, listing_agent, owner)
    api_client.force_authenticate(ceo)
    resp = api_client.post(f"/api/v1/properties/{prop_id}/publish/")
    assert resp.status_code == 400
