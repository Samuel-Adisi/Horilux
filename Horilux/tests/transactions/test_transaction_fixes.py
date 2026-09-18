"""Transaction status read-only, atomic advance, record_payment validation, detail fields."""
import pytest

from transactions.models import Transaction, Commission

pytestmark = pytest.mark.django_db


@pytest.fixture
def txn(sales, make_property, make_client):
    prop = make_property()
    return Transaction.objects.create(
        property=prop, client=make_client(sales, name="Buyer B"), owner=prop.owner, agent=sales,
        price=500000, commission_percent=5, expected_commission=25000,
    )


def test_create_defaults_agent_to_creator(api, sales, make_property, make_client):
    prop = make_property()
    api.force_authenticate(sales)
    resp = api.post("/api/v1/transactions/", {
        "property": str(prop.id), "client": str(make_client(sales).id), "owner": str(prop.owner.id),
        "price": "1000.00", "commission_percent": "5.00", "status": "closed",
    }, format="json")
    assert resp.status_code == 201, resp.data
    assert str(resp.data["agent"]) == str(sales.id)
    assert resp.data["status"] == "offer"
    assert api.get(f"/api/v1/transactions/{resp.data['id']}/").status_code == 200


def test_status_is_read_only_on_update(api, sales, txn):
    api.force_authenticate(sales)
    resp = api.patch(f"/api/v1/transactions/{txn.id}/", {"status": "closed"}, format="json")
    assert resp.status_code == 200
    txn.refresh_from_db()
    assert txn.status == "offer"


def test_detail_has_names(api, sales, txn):
    api.force_authenticate(sales)
    data = api.get(f"/api/v1/transactions/{txn.id}/").data
    assert data["property_title"] == "Fixture House"
    assert data["client_name"] == "Buyer B"
    assert data["agent_name"] == "Test User"
    assert data["owner_name"] == "Shared Owner"
    assert data["status_label"] == "Offer"


def test_advance_into_commission_without_rule_leaves_status(api, sales, txn):
    Transaction.objects.filter(pk=txn.pk).update(status="closing")
    old_updated = Transaction.objects.get(pk=txn.pk).updated_at
    api.force_authenticate(sales)
    resp = api.post(f"/api/v1/transactions/{txn.id}/advance/")
    assert resp.status_code == 400
    assert isinstance(resp.data, list)
    txn.refresh_from_db()
    assert txn.status == "closing"
    assert not Commission.objects.filter(transaction=txn).exists()
    assert txn.updated_at == old_updated


def test_advance_bumps_updated_at(api, sales, txn):
    before = txn.updated_at
    api.force_authenticate(sales)
    resp = api.post(f"/api/v1/transactions/{txn.id}/advance/")
    assert resp.status_code == 200
    txn.refresh_from_db()
    assert txn.status == "negotiation"
    assert txn.updated_at > before


@pytest.mark.parametrize("amount", ["0", "-5", "abc", "NaN", "Infinity", ""])
def test_record_payment_rejects_bad_amount(api, sales, txn, amount):
    api.force_authenticate(sales)
    resp = api.post(f"/api/v1/transactions/{txn.id}/record_payment/", {"amount": amount}, format="json")
    assert resp.status_code == 400


def test_record_payment_date_defaults_to_today(api, sales, txn):
    api.force_authenticate(sales)
    resp = api.post(f"/api/v1/transactions/{txn.id}/record_payment/", {"amount": "600000"}, format="json")
    assert resp.status_code == 200, resp.data
    from django.utils import timezone
    assert resp.data["payments"][0]["date"] == timezone.localdate().isoformat()
    assert float(resp.data["outstanding_amount"]) == 0.0  # never negative


def test_record_payment_bad_date(api, sales, txn):
    api.force_authenticate(sales)
    resp = api.post(
        f"/api/v1/transactions/{txn.id}/record_payment/", {"amount": "10", "date": "31/12/2026"}, format="json",
    )
    assert resp.status_code == 400


def test_sales_can_retrieve_own_payment(api, sales, txn):
    from transactions.models import Payment
    p = Payment.objects.create(transaction=txn, amount=5, date="2026-01-01")
    api.force_authenticate(sales)
    assert api.get(f"/api/v1/payments/{p.id}/").status_code == 200
