"""
Seed Departments, Roles, Permissions, and the RolePermission matrix
defined in docs/architecture.md section 1.5 (RBAC Matrix).

Idempotent and convergent: safe to re-run. Re-running on an existing DB
applies matrix changes -- missing grants are added and grants that are no
longer in the matrix (including grants whose scope changed) are removed
from the seeded roles. The matrix itself lives in accounts/rbac_matrix.py.
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Department, Role, Permission, RolePermission
from accounts.rbac_matrix import (  # noqa: F401  (re-exported for tests/other callers)
    RBAC_MATRIX,
    ROLE_SCOPE,
    SCOPE_OVERRIDES,
    scope_for,
    sync_rbac,
)

DEPARTMENT_FOR_ROLE = {
    "CEO": Department.Name.CEO,
    "Listing": Department.Name.LISTING,
    "Sales": Department.Name.SALES,
    "Marketing": Department.Name.MARKETING,
    "Finance": Department.Name.TRANSACTIONS,
    "Operations": Department.Name.OPERATIONS,
}


class Command(BaseCommand):
    help = "Seed/sync Departments, Roles, Permissions, and RolePermission matrix."

    @transaction.atomic
    def handle(self, *args, **options):
        stats = sync_rbac(Department, Role, Permission, RolePermission, log=self.stdout.write)
        self.stdout.write(self.style.SUCCESS(
            f"\nDone. {stats['permissions']} new Permission rows, "
            f"{stats['links_added']} RolePermission links added, "
            f"{stats['links_removed']} stale links removed."
        ))
