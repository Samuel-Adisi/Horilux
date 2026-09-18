"""New property workflow actions, detail fields, completion_percent, visibility, delete protection."""
import pytest

from properties.models import Property

pytestmark = pytest.mark.django_db

FLAGS = ["owner_info_ok", "price_ok", "location_ok", "details_ok",
         "photos_ok", "documents_ok", "commission_agreement_ok"]


def set_threshold(value):
    from transactions.models import ApprovalThreshold
    t = ApprovalThreshold.get_solo()
    t.ceo_approval_min_price = value
    t.save()


def test_mark_marketing_ready_from_verified(api, ceo, make_property):
    prop = make_property(status="verified")
    api.force_authenticate(ceo)
    resp = api.post(f"/api/v1/properties/{prop.id}/mark_marketing_ready/")
    assert resp.status_code == 200, resp.data
    assert resp.data["status"] == "marketing_ready"
    assert resp.data["status_label"] == "Marketing Ready"


def test_mark_marketing_ready_wrong_status_is_400_array(api, ceo, make_property):
    prop = make_property(status="draft")
    api.force_authenticate(ceo)
    resp = api.post(f"/api/v1/properties/{prop.id}/mark_marketing_ready/")
    assert resp.status_code == 400
    assert isinstance(resp.data, list)


def test_mark_marketing_ready_threshold_rule(api, listing, make_property):
    prop = make_property(agent=listing, status="verified", price=500000)
    api.force_authenticate(listing)

    set_threshold(1000000)  # below threshold -> Listing (team) may do it
    resp = api.post(f"/api/v1/properties/{prop.id}/mark_marketing_ready/")
    assert resp.status_code == 200, resp.data

    prop2 = make_property(agent=listing, status="verified", price=2000000, title="Pricey")
    resp = api.post(f"/api/v1/properties/{prop2.id}/mark_marketing_ready/")
    assert resp.status_code == 400
    assert "CEO approval" in resp.data[0]


def test_sales_cannot_mark_marketing_ready(api, sales, make_property):
    prop = make_property(status="verified")
    api.force_authenticate(sales)
    assert api.post(f"/api/v1/properties/{prop.id}/mark_marketing_ready/").status_code == 403


@pytest.mark.parametrize("action,start,end,ok", [
    ("mark_under_offer", "published", "under_offer", True),
    ("mark_under_offer", "marketing_ready", None, False),
    ("mark_sold", "published", "sold_rented", True),
    ("mark_sold", "under_offer", "sold_rented", True),
    ("mark_sold", "verified", None, False),
    ("archive", "draft", "archived", True),
    ("archive", "sold_rented", "archived", True),
    ("archive", "archived", None, False),
])
def test_simple_transitions(api, ceo, make_property, action, start, end, ok):
    prop = make_property(status=start)
    api.force_authenticate(ceo)
    resp = api.post(f"/api/v1/properties/{prop.id}/{action}/")
    if ok:
        assert resp.status_code == 200, resp.data
        assert resp.data["status"] == end
    else:
        assert resp.status_code == 400
        assert isinstance(resp.data, list)


def test_full_lifecycle_reaches_published(api, ceo, listing, make_property):
    set_threshold(0)
    prop = make_property(agent=listing)
    api.force_authenticate(listing)
    assert api.post(f"/api/v1/properties/{prop.id}/submit_for_verification/").status_code == 200
    resp = api.patch(
        f"/api/v1/verification-checklists/{prop.verification.id}/", {f: True for f in FLAGS}, format="json",
    )
    assert resp.status_code == 200, resp.data
    api.force_authenticate(ceo)
    assert api.post(f"/api/v1/properties/{prop.id}/approve/").data["status"] == "verified"
    assert api.post(f"/api/v1/properties/{prop.id}/mark_marketing_ready/").data["status"] == "marketing_ready"
    resp = api.post(f"/api/v1/properties/{prop.id}/publish/")
    assert resp.data["status"] == "published"
    assert resp.data["published_at"]


def test_detail_has_new_read_only_fields(api, ceo, listing, make_property):
    prop = make_property(agent=listing)
    api.force_authenticate(ceo)
    data = api.get(f"/api/v1/properties/{prop.id}/").data
    for key in ("status_label", "agent_name", "published_at", "views_count", "inquiries_count"):
        assert key in data
    assert data["agent_name"] == "Test User"
    resp = api.patch(f"/api/v1/properties/{prop.id}/", {"views_count": 99, "status": "published"}, format="json")
    assert resp.status_code == 200
    assert resp.data["views_count"] == 0
    assert resp.data["status"] == "draft"


def test_completion_percent_recomputed_on_checklist_save(api, ceo, make_property):
    prop = make_property()
    api.force_authenticate(ceo)
    url = f"/api/v1/verification-checklists/{prop.verification.id}/"
    api.patch(url, {"owner_info_ok": True, "price_ok": True}, format="json")
    prop.refresh_from_db()
    assert prop.completion_percent == round(100 * 2 / 7)  # 29

    detail = api.get(f"/api/v1/properties/{prop.id}/").data
    assert detail["completion_percent"] == 29
    listing_rows = api.get("/api/v1/properties/").data["results"]
    assert [r["completion_percent"] for r in listing_rows if r["id"] == str(prop.id)] == [29]

    api.patch(url, {f: True for f in FLAGS}, format="json")
    prop.refresh_from_db()
    assert prop.completion_percent == 100


def test_completion_save_does_not_duplicate_verification_tasks(api, ceo, listing, make_property):
    from operations.models import Task
    prop = make_property(agent=listing)
    api.force_authenticate(listing)
    api.post(f"/api/v1/properties/{prop.id}/submit_for_verification/")
    count = Task.objects.count()
    api.patch(f"/api/v1/verification-checklists/{prop.verification.id}/", {"price_ok": True}, format="json")
    assert Task.objects.count() == count


def test_sales_sees_all_properties(api, sales, listing, make_property):
    make_property(agent=listing)
    make_property(agent=None, title="Unassigned")
    api.force_authenticate(sales)
    assert api.get("/api/v1/properties/").data["count"] == 2


def test_marketing_sees_only_marketing_ready_and_published(api, marketing, make_property):
    for s in ("draft", "verified", "marketing_ready", "published", "sold_rented"):
        make_property(status=s, title=s)
    api.force_authenticate(marketing)
    resp = api.get("/api/v1/properties/")
    assert sorted(r["status"] for r in resp.data["results"]) == ["marketing_ready", "published"]
    draft = Property.objects.get(title="draft")
    assert api.get(f"/api/v1/properties/{draft.id}/").status_code == 404


def test_delete_protected_property_and_owner_is_400(api, ceo, sales, make_property, make_client):
    from transactions.models import Transaction
    prop = make_property()
    Transaction.objects.create(
        property=prop, client=make_client(sales), owner=prop.owner, agent=sales,
        price=1, commission_percent=1, expected_commission=0,
    )
    api.force_authenticate(ceo)
    resp = api.delete(f"/api/v1/properties/{prop.id}/")
    assert resp.status_code == 400
    assert isinstance(resp.data["detail"], str)
    resp = api.delete(f"/api/v1/property-owners/{prop.owner.id}/")
    assert resp.status_code == 400
    assert isinstance(resp.data["detail"], str)
