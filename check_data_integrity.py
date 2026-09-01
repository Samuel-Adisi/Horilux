import os, sys, django
sys.path.insert(0, os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Horilux.settings.dev")
django.setup()

from django.db import transaction
from django.db.models import ProtectedError
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model

from accounts.models import Department, Role
from properties.models import Property, PropertyOwner, PropertyMedia
from crm.models import Lead, Client
from transactions.models import CommissionRule
from operations.models import Task
from notifications.models import Notification

User = get_user_model()
results = []

def check(name, fn):
    try:
        fn()
        results.append((name, "PASS"))
    except AssertionError as e:
        results.append((name, f"FAIL: {e}"))
    except Exception as e:
        results.append((name, f"ERROR: {type(e).__name__}: {e}"))

with transaction.atomic():
    sid = transaction.savepoint()

    dept = Department.objects.create(name="TestDept")
    role = Role.objects.create(name="TestRole", department=dept)
    user = User.objects.create(email="itest@test.com", first_name="I", last_name="Test")
    owner = PropertyOwner.objects.create(name="Test Owner", phone="0000000000")
    prop = Property.objects.create(title="Test Prop", owner=owner, agent=user, price=100000)

    def t_protect_owner():
        try:
            owner.delete()
            raise AssertionError("expected ProtectedError")
        except ProtectedError:
            pass
    check("PROTECT: PropertyOwner blocked while Property exists", t_protect_owner)

    def t_protect_department_role():
        try:
            dept.delete()
            raise AssertionError("expected ProtectedError")
        except ProtectedError:
            pass
    check("PROTECT: Department blocked while Role exists", t_protect_department_role)

    def t_cascade_property_media():
        media = PropertyMedia.objects.create(property=prop, file="x.jpg")
        mid = media.id
        prop.delete()
        assert not PropertyMedia.objects.filter(id=mid).exists()
    check("CASCADE: Property delete removes PropertyMedia", t_cascade_property_media)

    def t_setnull_agent():
        prop2 = Property.objects.create(title="P2", owner=owner, agent=user, price=50000)
        user2 = User.objects.create(email="ia2@test.com", first_name="I", last_name="A2")
        prop2.agent = user2
        prop2.save()
        user2.delete()
        prop2.refresh_from_db()
        assert prop2.agent_id is None
        assert Property.objects.filter(id=prop2.id).exists()
    check("SET_NULL: deleting agent nulls Property.agent, keeps Property", t_setnull_agent)

    def t_gfk_cleanup_on_property_delete():
        prop3 = Property.objects.create(title="P3", owner=owner, agent=user, price=75000)
        ct = ContentType.objects.get_for_model(Property)
        task = Task.objects.create(title="verify", content_type=ct, object_id=prop3.id, owner=user)
        tid = task.id
        prop3.delete()
        assert not Task.objects.filter(id=tid).exists(), "orphaned Task not cleaned up"
    check("FIXED: deleting Property cleans up related Task (no orphan)", t_gfk_cleanup_on_property_delete)

    def t_gfk_cleanup_on_lead_delete():
        lead2 = Lead.objects.create(name="Lead2", phone="3333333333")
        ct = ContentType.objects.get_for_model(Lead)
        notif = Notification.objects.create(recipient=user, content_type=ct, object_id=lead2.id, message="x")
        nid = notif.id
        lead2.delete()
        assert not Notification.objects.filter(id=nid).exists(), "orphaned Notification not cleaned up"
    check("FIXED: deleting Lead cleans up related Notification (no orphan)", t_gfk_cleanup_on_lead_delete)

    def t_role_protected_by_commission_rule():
        role2 = Role.objects.create(name="RoleForRule", department=dept)
        CommissionRule.objects.create(role=role2, agent_split_percent=50)
        try:
            role2.delete()
            raise AssertionError("expected ProtectedError")
        except ProtectedError:
            pass
    check("FIXED: Role delete blocked while CommissionRule references it", t_role_protected_by_commission_rule)

    def t_department_protected_by_user():
        dept2 = Department.objects.create(name="Dept2")
        User.objects.create(email="iu3@test.com", first_name="I", last_name="U3", department=dept2)
        try:
            dept2.delete()
            raise AssertionError("expected ProtectedError")
        except ProtectedError:
            pass
    check("FIXED: Department delete blocked while User references it", t_department_protected_by_user)

    transaction.savepoint_rollback(sid)

print("\n" + "="*70)
print("DATA INTEGRITY CHECK RESULTS")
print("="*70)
for name, status in results:
    print(f"[{status.split(':')[0]:>6}] {name}")
    if status.startswith("FAIL") or status.startswith("ERROR"):
        print(f"         {status}")
print("="*70)
print(f"{sum(1 for _,s in results if s=='PASS')}/{len(results)} checks passed")
print("(all test data rolled back — no changes persisted to DB)")
