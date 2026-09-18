"""
Data migration: bring existing databases in line with the updated RBAC
matrix (per-grant scopes, property_verification view/edit for CEO,
Sales/Marketing company-scope property view, lead.assign for CEO/Ops,
task grants for every role).

Only runs the sync if the RBAC has already been seeded (i.e. roles exist);
fresh databases are seeded with `python manage.py seed_rbac` as before.
Storage of permissions is unchanged -- scope was already per Permission row.
"""
from django.db import migrations


def forwards(apps, schema_editor):
    from accounts.rbac_matrix import sync_rbac

    Department = apps.get_model("accounts", "Department")
    Role = apps.get_model("accounts", "Role")
    Permission = apps.get_model("accounts", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    if not Role.objects.exists():
        return
    sync_rbac(Department, Role, Permission, RolePermission)


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
