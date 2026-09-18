"""
Phase 9 functional tests: Transaction state machine + commission calc.
offer -> negotiation -> agreement -> documentation -> payment -> closing -> commission -> closed
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


@pytest.fixture
def finance_user(user_factory):
    return user_factory(role_name="Finance")


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
        title="Txn Test House", property_type="residential", listing_type="sale",
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


def create_transaction(api_client, sales_agent, a_property, a_client_record, owner):
    api_client.force_authenticate(sales_agent)
    resp = api_client.post("/api/v1/transactions/", {
        "property": str(a_property.id), "client": str(a_client_record.id),
        "owner": str(owner.id), "agent": str(sales_agent.id),
        "price": "500000.00", "commission_percent": "5.00",
    }, format="json")
    assert resp.status_code == 201, resp.data
    return resp.data["id"]


def test_transaction_created_with_expected_commission(api_client, sales_agent, a_property, a_client_record, owner):
    txn_id = create_transaction(api_client, sales_agent, a_property, a_client_record, owner)
    resp = api_client.get(f"/api/v1/transactions/{txn_id}/")
    assert resp.data["status"] == "offer"
    assert float(resp.data["expected_commission"]) == 25000.0


def test_advance_walks_full_state_machine_and_computes_commission(
    api_client, sales_agent, a_property, a_client_record, owner, commission_rule
):
    txn_id = create_transaction(api_client, sales_agent, a_property, a_client_record, owner)
    expected_sequence = [
        "negotiation", "agreement", "documentation", "payment", "closing", "commission", "closed",
    ]
    for expected_status in expected_sequence:
        resp = api_client.post(f"/api/v1/transactions/{txn_id}/advance/")
        assert resp.status_code == 200, resp.data
        assert resp.data["status"] == expected_status

    from transactions.models import Commission
    commission = Commission.objects.get(transaction_id=txn_id)
    assert float(commission.expected) == 25000.0
    assert float(commission.agent_share) == 12500.0
    assert float(commission.company_share) == 12500.0


def test_cannot_advance_past_closed(api_client, sales_agent, a_property, a_client_record, owner, commission_rule):
    txn_id = create_transaction(api_client, sales_agent, a_property, a_client_record, owner)
    for _ in range(7):
        api_client.post(f"/api/v1/transactions/{txn_id}/advance/")
    resp = api_client.post(f"/api/v1/transactions/{txn_id}/advance/")
    assert resp.status_code == 400


def test_record_payment_updates_outstanding_and_commission(
    api_client, sales_agent, a_property, a_client_record, owner, commission_rule
):
    txn_id = create_transaction(api_client, sales_agent, a_property, a_client_record, owner)
    for _ in range(6):  # advance to "commission" status
        api_client.post(f"/api/v1/transactions/{txn_id}/advance/")

    resp = api_client.post(f"/api/v1/transactions/{txn_id}/record_payment/", {
        "amount": "100000.00", "date": "2026-09-01",
    })
    assert resp.status_code == 200, resp.data
    assert float(resp.data["amount_received"]) == 100000.0
    assert float(resp.data["outstanding_amount"]) == 400000.0

    from transactions.models import Commission
    commission = Commission.objects.get(transaction_id=txn_id)
    # Commission is earned pro rata: 100k of a 500k price = 20% of expected commission.
    expected = float(commission.expected)
    assert float(commission.received) == round(expected * 0.2, 2)
    assert float(commission.outstanding) == round(expected * 0.8, 2)
    assert commission.payment_status == "partial"

    resp = api_client.post(f"/api/v1/transactions/{txn_id}/record_payment/", {"amount": "400000.00"})
    assert resp.status_code == 200, resp.data
    commission.refresh_from_db()
    assert float(commission.received) == expected
    assert float(commission.outstanding) == 0.0
    assert commission.payment_status == "paid"
    assert commission.payment_date is not None


def test_commission_reflects_payments_made_before_commission_stage(
    api_client, sales_agent, a_property, a_client_record, owner, commission_rule
):
    txn_id = create_transaction(api_client, sales_agent, a_property, a_client_record, owner)
    for _ in range(4):  # to "payment"
        api_client.post(f"/api/v1/transactions/{txn_id}/advance/")
    api_client.post(f"/api/v1/transactions/{txn_id}/record_payment/", {"amount": "500000.00"})
    for _ in range(2):  # to "commission" — commission is calculated here
        api_client.post(f"/api/v1/transactions/{txn_id}/advance/")

    from transactions.models import Commission
    commission = Commission.objects.get(transaction_id=txn_id)
    assert float(commission.received) == float(commission.expected)
    assert commission.payment_status == "paid"
