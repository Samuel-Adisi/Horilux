"""Per-grant scopes, seed idempotency and object-level parent resolution."""
import pytest

from accounts.models import Permission, Role, RolePermission
from accounts.management.commands.seed_rbac import Command as SeedRBACCommand
from accounts.permissions import get_user_scopes, has_permission
from accounts.rbac_matrix import RBAC_MATRIX, scope_for

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("role,resource,action,scope", [
    ("CEO", "property_verification", "view", "company"),
    ("CEO", "property_verification", "edit", "company"),
    ("CEO", "property_verification", "approve", "company"),
    ("Listing", "property_verification", "view", "team"),
    ("Listing", "property_verification", "create", "team"),
    ("Listing", "property_verification", "edit", "team"),
    ("Operations", "property_verification", "view", "company"),
    ("Sales", "property", "view", "company"),
    ("Marketing", "property", "view", "company"),
    ("CEO", "lead", "assign", "company"),
    ("Operations", "lead", "assign", "company"),
    ("Sales", "lead", "assign", "assigned"),
    ("CEO", "task", "delete", "company"),
    ("Operations", "task", "create", "company"),
    ("Listing", "task", "view", "own"),
    ("Sales", "task", "edit", "own"),
    ("Marketing", "task", "view", "own"),
    ("Finance", "task", "edit", "own"),
    ("Sales", "lead", "view", "assigned"),
])
def test_seeded_scopes(user_factory, role, resource, action, scope):
    user = user_factory(role_name=role)
    assert get_user_scopes(user, action, resource) == {scope}


@pytest.mark.parametrize("role", ["Listing", "Sales", "Marketing", "Finance"])
def test_non_management_roles_cannot_create_or_delete_tasks(user_factory, role):
    user = user_factory(role_name=role)
    assert not has_permission(user, "create", "task")
    assert not has_permission(user, "delete", "task")


def test_every_role_links_exactly_one_scope_per_grant():
    for role_name in RBAC_MATRIX:
        role = Role.objects.get(name=role_name)
        pairs = list(
            RolePermission.objects.filter(role=role).values_list("permission__resource", "permission__action")
        )
        assert len(pairs) == len(set(pairs)), f"{role_name} has duplicate scope links"
        expected = sum(len(a) for a in RBAC_MATRIX[role_name].values())
        assert len(pairs) == expected


def test_seed_rbac_is_idempotent_and_converges():
    sales = Role.objects.get(name="Sales")
    # Simulate an old DB: Sales property:view at the OLD 'assigned' scope.
    RolePermission.objects.filter(role=sales, permission__resource="property").delete()
    old_perm, _ = Permission.objects.get_or_create(action="view", resource="property", scope="assigned")
    RolePermission.objects.create(role=sales, permission=old_perm)

    before = RolePermission.objects.count()
    SeedRBACCommand().handle()
    SeedRBACCommand().handle()

    scopes = set(
        RolePermission.objects.filter(role=sales, permission__resource="property", permission__action="view")
        .values_list("permission__scope", flat=True)
    )
    assert scopes == {scope_for("Sales", "property", "view")} == {"company"}
    assert RolePermission.objects.count() == before  # one link replaced by one link


def test_seed_rbac_leaves_custom_roles_alone():
    custom = Role.objects.create(name="Custom")
    perm, _ = Permission.objects.get_or_create(action="view", resource="property", scope="own")
    RolePermission.objects.create(role=custom, permission=perm)
    SeedRBACCommand().handle()
    assert RolePermission.objects.filter(role=custom).count() == 1


# -- object-level parent resolution ----------------------------------------------

def test_checklist_object_permission_resolves_through_property(listing, user_factory, make_property):
    from accounts.models import Department
    prop = make_property(agent=listing)
    other_dept_agent = user_factory(role_name="Sales")
    foreign_prop = make_property(agent=other_dept_agent, title="Foreign")

    assert has_permission(listing, "edit", "property_verification", obj=prop.verification)
    assert not has_permission(listing, "edit", "property_verification", obj=foreign_prop.verification)
    assert Department.objects.filter(name="listing").exists()


def test_payment_object_permission_resolves_through_transaction(sales, user_factory, make_property, make_client):
    from transactions.models import Transaction, Payment
    prop = make_property()
    txn = Transaction.objects.create(
        property=prop, client=make_client(sales), owner=prop.owner, agent=sales,
        price=1000, commission_percent=5, expected_commission=50,
    )
    payment = Payment.objects.create(transaction=txn, amount=10, date="2026-01-01")
    other_sales = user_factory(role_name="Sales")
    assert has_permission(sales, "view", "transaction", obj=payment)
    assert not has_permission(other_sales, "view", "transaction", obj=payment)


def test_campaign_performance_resolves_through_campaign(marketing, user_factory, make_property):
    from marketing.models import MarketingCampaign, CampaignPerformance
    campaign = MarketingCampaign.objects.create(
        property=make_property(status="marketing_ready"), created_by=marketing,
    )
    perf = CampaignPerformance.objects.create(campaign=campaign, views=3)
    teammate = user_factory(role_name="Marketing")
    outsider = user_factory(role_name="Listing")
    assert has_permission(teammate, "view", "marketing_campaign", obj=perf)
    assert not has_permission(outsider, "view", "marketing_campaign", obj=perf)


def test_property_owner_object_permission(listing, user_factory, make_property, api):
    from properties.models import PropertyOwner
    mine = PropertyOwner.objects.create(name="Mine", phone="1")
    theirs = PropertyOwner.objects.create(name="Theirs", phone="2")
    make_property(agent=listing, owner=mine)
    make_property(agent=user_factory(role_name="Sales"), owner=theirs, title="Other")

    assert has_permission(listing, "edit", "property", obj=mine)
    assert not has_permission(listing, "edit", "property", obj=theirs)

    api.force_authenticate(listing)
    assert api.get(f"/api/v1/property-owners/{mine.id}/").status_code == 200
    assert api.get(f"/api/v1/property-owners/{theirs.id}/").status_code in (403, 404)


def test_listing_can_view_and_patch_checklist(api, listing, make_property):
    prop = make_property(agent=listing)
    api.force_authenticate(listing)
    url = f"/api/v1/verification-checklists/{prop.verification.id}/"
    assert api.get(url).status_code == 200
    resp = api.patch(url, {"price_ok": True, "owner_info_ok": True}, format="json")
    assert resp.status_code == 200, resp.data
    assert resp.data["price_ok"] is True


def test_checklist_property_is_read_only(api, ceo, make_property):
    prop = make_property()
    other = make_property(title="Other")
    api.force_authenticate(ceo)
    resp = api.patch(
        f"/api/v1/verification-checklists/{prop.verification.id}/", {"property": str(other.id)}, format="json",
    )
    assert resp.status_code == 200
    prop.verification.refresh_from_db()
    assert prop.verification.property_id == prop.id


def test_operations_can_view_but_not_edit_checklist(api, ops, make_property):
    prop = make_property()
    api.force_authenticate(ops)
    url = f"/api/v1/verification-checklists/{prop.verification.id}/"
    assert api.get(url).status_code == 200
    assert api.patch(url, {"price_ok": True}, format="json").status_code == 403


def test_listing_media_detail_resolves_through_property(api, listing, make_property):
    from properties.models import PropertyMedia
    prop = make_property(agent=listing)
    media = PropertyMedia.objects.create(property=prop, file="x.jpg", media_type="photo")
    api.force_authenticate(listing)
    assert api.get(f"/api/v1/property-media/{media.id}/").status_code == 200
