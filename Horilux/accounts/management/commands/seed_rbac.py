"""
Seed Departments, Roles, Permissions, and the RolePermission matrix
defined in docs/architecture.md section 1.5 (RBAC Matrix).

Idempotent: safe to re-run. Uses get_or_create throughout so it won't
duplicate rows if the matrix is expanded and this command is re-run.
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Department, Role, Permission, RolePermission


# Resource keys match the `resource` field used across the app's models
# (property, lead, client, viewing, transaction, payment_commission,
# marketing_campaign, user_management, report, audit_log).

RBAC_MATRIX = {
    "CEO": {
        "property": {"view", "create", "edit", "delete", "approve", "publish", "export"},
        "property_verification": {"approve"},
        "lead": {"view", "export"},
        "client": {"view", "export"},
        "interaction": {"view", "export"},
        "lead_source_stats": {"view", "export"},
        "viewing": {"view", "export"},
        "followup": {"view", "export"},
        "transaction": {"view", "approve", "export"},
        "payment_commission": {"view", "export"},
        "marketing_campaign": {"view", "export"},
        "user_management": {"view", "create", "edit", "delete", "assign"},
        "report_listing": {"view", "export"},
        "report_sales": {"view", "export"},
        "report_marketing": {"view", "export"},
        "report_finance": {"view", "export"},
        "report_operations": {"view", "export"},
        "audit_log": {"view"},
        "company_settings": {"view", "edit"},
        "task": {"view", "create", "edit"},
    },
    "Listing": {
        "property": {"view", "create", "edit", "approve"},
        "property_verification": {"create", "edit"},
        "report_listing": {"view"},
    },
    "Sales": {
        "property": {"view"},
        "lead": {"view", "create", "edit", "assign"},
        "client": {"view", "create", "edit"},
        "interaction": {"view", "create", "edit"},
        "viewing": {"view", "create", "edit"},
        "followup": {"view", "create", "edit"},
        "transaction": {"view", "create", "edit"},
        "report_sales": {"view"},
    },
    "Marketing": {
        "property": {"view"},  # published only — enforced in serializer/service layer
        "marketing_campaign": {"view", "create", "edit", "publish"},
        "report_marketing": {"view"},
    },
    "Finance": {
        "property": {"view"},
        "client": {"view"},
        "transaction": {"view", "create", "edit"},
        "payment_commission": {"view", "create", "edit", "approve"},
        "report_finance": {"view", "export"},
    },
    "Operations": {
        "property": {"view"},
        "lead": {"view"},
        "client": {"view"},
        "interaction": {"view"},
        "lead_source_stats": {"view"},
        "viewing": {"view", "edit"},
        "followup": {"view", "edit"},
        "transaction": {"view"},
        "marketing_campaign": {"view"},
        "user_management": {"view", "create", "edit"},  # staff records only
        "report_operations": {"view", "export"},
        "audit_log": {"view"},
    },
}

# Scope per role — matches spec §4 access-scope assignments.
ROLE_SCOPE = {
    "CEO": "company",
    "Listing": "team",
    "Sales": "assigned",
    "Marketing": "team",
    "Finance": "company",
    "Operations": "company",
}

DEPARTMENT_FOR_ROLE = {
    "CEO": Department.Name.CEO,
    "Listing": Department.Name.LISTING,
    "Sales": Department.Name.SALES,
    "Marketing": Department.Name.MARKETING,
    "Finance": Department.Name.TRANSACTIONS,
    "Operations": Department.Name.OPERATIONS,
}


class Command(BaseCommand):
    help = "Seed Departments, Roles, Permissions, and RolePermission matrix."

    @transaction.atomic
    def handle(self, *args, **options):
        # 1. Departments
        departments = {}
        for name, _ in Department.Name.choices:
            dept, created = Department.objects.get_or_create(name=name)
            departments[name] = dept
            self.stdout.write(
                self.style.SUCCESS(f"  Department: {dept.get_name_display()}") if created
                else f"  Department already exists: {dept.get_name_display()}"
            )

        # 2. Roles
        roles = {}
        for role_name, dept_key in DEPARTMENT_FOR_ROLE.items():
            role, created = Role.objects.get_or_create(
                name=role_name,
                defaults={"department": departments[dept_key]},
            )
            roles[role_name] = role
            self.stdout.write(
                self.style.SUCCESS(f"  Role: {role_name}") if created
                else f"  Role already exists: {role_name}"
            )

        # 3. Permissions + RolePermission links
        created_perms = 0
        created_links = 0
        for role_name, resource_actions in RBAC_MATRIX.items():
            role = roles[role_name]
            scope = ROLE_SCOPE[role_name]
            for resource, actions in resource_actions.items():
                for action in actions:
                    perm, perm_created = Permission.objects.get_or_create(
                        action=action, resource=resource, scope=scope
                    )
                    if perm_created:
                        created_perms += 1
                    _, link_created = RolePermission.objects.get_or_create(
                        role=role, permission=perm
                    )
                    if link_created:
                        created_links += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. {created_perms} new Permission rows, {created_links} new RolePermission links."
        ))
