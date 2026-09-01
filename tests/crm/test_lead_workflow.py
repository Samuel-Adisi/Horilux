"""
Phase 9 functional tests: Lead pipeline.
new -> contacted -> qualified -> (convert) -> Client
"""
import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def sales_agent(user_factory):
    return user_factory(role_name="Sales")


def create_lead(api_client, sales_agent):
    api_client.force_authenticate(sales_agent)
    resp = api_client.post("/api/v1/leads/", {
        "name": "Jane Doe", "phone": "0244000000", "purpose": "buy",
    }, format="json")
    assert resp.status_code == 201, resp.data
    return resp.data["id"]


def test_lead_created_as_new(api_client, sales_agent):
    lead_id = create_lead(api_client, sales_agent)
    resp = api_client.get(f"/api/v1/leads/{lead_id}/")
    assert resp.data["status"] == "new"


def test_assign_moves_new_lead_to_contacted(api_client, sales_agent):
    lead_id = create_lead(api_client, sales_agent)
    resp = api_client.post(f"/api/v1/leads/{lead_id}/assign/", {"agent_id": str(sales_agent.id)})
    assert resp.status_code == 200, resp.data
    assert resp.data["status"] == "contacted"


def test_qualify_requires_new_or_contacted(api_client, sales_agent):
    lead_id = create_lead(api_client, sales_agent)
    api_client.post(f"/api/v1/leads/{lead_id}/assign/", {"agent_id": str(sales_agent.id)})
    resp = api_client.post(f"/api/v1/leads/{lead_id}/qualify/")
    assert resp.status_code == 200, resp.data
    assert resp.data["status"] == "qualified"


def test_convert_to_client_requires_qualified(api_client, sales_agent):
    lead_id = create_lead(api_client, sales_agent)
    resp = api_client.post(f"/api/v1/leads/{lead_id}/convert_to_client/")
    assert resp.status_code == 400


def test_convert_to_client_succeeds_and_is_idempotent(api_client, sales_agent):
    lead_id = create_lead(api_client, sales_agent)
    api_client.post(f"/api/v1/leads/{lead_id}/assign/", {"agent_id": str(sales_agent.id)})
    api_client.post(f"/api/v1/leads/{lead_id}/qualify/")

    resp1 = api_client.post(f"/api/v1/leads/{lead_id}/convert_to_client/")
    assert resp1.status_code == 201, resp1.data

    resp2 = api_client.post(f"/api/v1/leads/{lead_id}/convert_to_client/")
    assert resp2.status_code == 200
    assert resp2.data["id"] == resp1.data["id"]
