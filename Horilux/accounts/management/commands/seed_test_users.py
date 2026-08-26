"""
Seed a superuser + one test user per role for local RBAC testing.

NOT for production — passwords are simple and printed to stdout.
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User, Role, UserRole, Department


TEST_PASSWORD = "TestPass123!"

TEST_USERS = [
    {"email": "ceo@horilux.test", "first_name": "Test", "last_name": "CEO", "role": "CEO", "dept": Department.Name.CEO},
    {"email": "listing@horilux.test", "first_name": "Test", "last_name": "Listing", "role": "Listing", "dept": Department.Name.LISTING},
    {"email": "sales@horilux.test", "first_name": "Test", "last_name": "Sales", "role": "Sales", "dept": Department.Name.SALES},
    {"email": "marketing@horilux.test", "first_name": "Test", "last_name": "Marketing", "role": "Marketing", "dept": Department.Name.MARKETING},
    {"email": "finance@horilux.test", "first_name": "Test", "last_name": "Finance", "role": "Finance", "dept": Department.Name.TRANSACTIONS},
    {"email": "operations@horilux.test", "first_name": "Test", "last_name": "Operations", "role": "Operations", "dept": Department.Name.OPERATIONS},
]


class Command(BaseCommand):
    help = "Seed a superuser + one test user per role. Requires seed_rbac to have run first."

    @transaction.atomic
    def handle(self, *args, **options):
        # Superuser
        if not User.objects.filter(email="admin@horilux.test").exists():
            User.objects.create_superuser(
                email="admin@horilux.test",
                password=TEST_PASSWORD,
                first_name="Admin",
                last_name="User",
            )
            self.stdout.write(self.style.SUCCESS("  Superuser created: admin@horilux.test"))
        else:
            self.stdout.write("  Superuser already exists: admin@horilux.test")

        # One user per role
        for entry in TEST_USERS:
            try:
                role = Role.objects.get(name=entry["role"])
            except Role.DoesNotExist:
                self.stdout.write(self.style.ERROR(
                    f"  Role '{entry['role']}' not found. Run `python manage.py seed_rbac` first."
                ))
                continue

            dept = Department.objects.get(name=entry["dept"])

            user, created = User.objects.get_or_create(
                email=entry["email"],
                defaults={
                    "first_name": entry["first_name"],
                    "last_name": entry["last_name"],
                    "department": dept,
                },
            )
            if created:
                user.set_password(TEST_PASSWORD)
                user.save()
                self.stdout.write(self.style.SUCCESS(f"  User created: {entry['email']} ({entry['role']})"))
            else:
                self.stdout.write(f"  User already exists: {entry['email']}")

            UserRole.objects.get_or_create(user=user, role=role)

        self.stdout.write(self.style.SUCCESS(f"\nAll test users use password: {TEST_PASSWORD}"))
