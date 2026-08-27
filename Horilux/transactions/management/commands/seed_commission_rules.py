"""
Seed CommissionRule rows: a default fallback rule, plus per-role overrides
for the roles that actually close transactions.

Idempotent: uses get_or_create keyed on role. NOTE: these defaults are a
placeholder (50/50, 40 for Listing) pending the client's final answer on
Open Decision #5 (Commission calculation rules). Update DEFAULT_SPLIT /
ROLE_SPLITS below once Horilux confirms actual rates, then re-run.
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Role
from transactions.models import CommissionRule

DEFAULT_SPLIT = 50

ROLE_SPLITS = {
    "Sales": 50,
    "Listing": 40,
}


class Command(BaseCommand):
    help = "Seed default and per-role CommissionRule rows."

    @transaction.atomic
    def handle(self, *args, **options):
        default_rule, created = CommissionRule.objects.get_or_create(
            role=None, defaults={"agent_split_percent": DEFAULT_SPLIT},
        )
        self.stdout.write(
            self.style.SUCCESS(f"  Default rule: {default_rule.agent_split_percent}%% agent") if created
            else f"  Default rule already exists: {default_rule.agent_split_percent}%% agent"
        )

        for role_name, split in ROLE_SPLITS.items():
            try:
                role = Role.objects.get(name=role_name)
            except Role.DoesNotExist:
                self.stdout.write(self.style.WARNING(
                    f"  SKIP: Role '{role_name}' not found -- run seed_rbac first."
                ))
                continue

            rule, created = CommissionRule.objects.get_or_create(
                role=role, defaults={"agent_split_percent": split},
            )
            self.stdout.write(
                self.style.SUCCESS(f"  {role_name} rule: {rule.agent_split_percent}%% agent") if created
                else f"  {role_name} rule already exists: {rule.agent_split_percent}%% agent"
            )

        self.stdout.write(self.style.WARNING(
            "\nReminder: these are placeholder splits pending Open Decision #5. "
            "Confirm actual rates with Horilux and update via admin or re-seed."
        ))
