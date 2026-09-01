"""
Phase 9 functional tests: Marketing campaign, "approved properties only" gate,
and the schedule/publish-early guard.
"""
import datetime
import pytest
from django.utils import timezone
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def marketing_user(user_factory):
    return user_factory(role_name="Marketing")


@pytest.fixture
def listing_agent(user_factory):
    return user_factory(role_name="Listing")


@pytest.fixture
def owner():
    from properties.models import PropertyOwner
    return PropertyOwner.objects.create(name="Test Owner", phone="0200000000")


@pytest.fixture
def draft_property(owner, listing_agent):
    from properties.models import Property
    return Property.objects.create(
        title="Not Ready House", property_type="residential", listing_type="sale",
        price=100000, currency="GHS", location="Accra", owner=owner, agent=listing_agent,
        status=Property.Status.DRAFT,
    )


@pytest.fixture
def marketing_ready_property(owner, listing_agent):
    from properties.models import Property
    return Property.objects.create(
        title="Ready House", property_type="residential", listing_type="sale",
        price=100000, currency="GHS", location="Accra", owner=owner, agent=listing_agent,
        status=Property.Status.MARKETING_READY,
    )


def test_campaign_rejected_for_unapproved_property(api_client, marketing_user, draft_property):
    api_client.force_authenticate(marketing_user)
    resp = api_client.post("/api/v1/campaigns/", {"property": str(draft_property.id)}, format="json")
    assert resp.status_code == 400
    assert "approved for marketing" in str(resp.data).lower()


def test_campaign_created_for_marketing_ready_property(api_client, marketing_user, marketing_ready_property):
    api_client.force_authenticate(marketing_user)
    resp = api_client.post("/api/v1/campaigns/", {"property": str(marketing_ready_property.id)}, format="json")
    assert resp.status_code == 201, resp.data
    assert resp.data["status"] == "draft"


def test_publish_rejected_before_scheduled_date(api_client, marketing_user, marketing_ready_property):
    api_client.force_authenticate(marketing_user)
    create_resp = api_client.post("/api/v1/campaigns/", {"property": str(marketing_ready_property.id)}, format="json")
    campaign_id = create_resp.data["id"]

    api_client.post(f"/api/v1/campaigns/{campaign_id}/submit_for_review/")
    future_date = (timezone.now() + datetime.timedelta(days=5)).isoformat()
    schedule_resp = api_client.post(f"/api/v1/campaigns/{campaign_id}/schedule/", {"scheduled_date": future_date})
    assert schedule_resp.status_code == 200, schedule_resp.data

    publish_resp = api_client.post(f"/api/v1/campaigns/{campaign_id}/publish/")
    assert publish_resp.status_code == 400
    assert "cannot publish early" in str(publish_resp.data).lower()


def test_immediate_publish_without_schedule_succeeds(api_client, marketing_user, marketing_ready_property):
    api_client.force_authenticate(marketing_user)
    create_resp = api_client.post("/api/v1/campaigns/", {"property": str(marketing_ready_property.id)}, format="json")
    campaign_id = create_resp.data["id"]

    api_client.post(f"/api/v1/campaigns/{campaign_id}/submit_for_review/")
    resp = api_client.post(f"/api/v1/campaigns/{campaign_id}/publish/")
    assert resp.status_code == 200, resp.data
    assert resp.data["status"] == "published"
    assert resp.data["published_date"] is not None
