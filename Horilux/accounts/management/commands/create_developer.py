from getpass import getpass

from django.core.management.base import BaseCommand, CommandError

from accounts.developer import DEVELOPER_ROLE
from accounts.models import Role, User, UserRole


class Command(BaseCommand):
    help = "Create or reset the single Developer account (system access only, no company data)."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--first-name", default="Developer")
        parser.add_argument("--last-name", default="")

    def handle(self, *args, **opts):
        try:
            role = Role.objects.get(name=DEVELOPER_ROLE)
        except Role.DoesNotExist:
            raise CommandError("Developer role missing. Run seed_rbac first.")

        email = opts["email"].strip().lower()
        others = [
            ur.user.email for ur in UserRole.objects.filter(role=role).select_related("user")
            if ur.user.email.lower() != email
        ]
        if others:
            raise CommandError("A Developer account already exists: " + ", ".join(others))

        user = User.objects.filter(email__iexact=email).first()
        if user is not None and not user.user_roles.filter(role=role).exists():
            raise CommandError("That email belongs to an existing non-developer account. Use a new email.")

        pw = getpass("Password (12+ chars): ")
        if len(pw) < 12 or pw != getpass("Repeat password: "):
            raise CommandError("Passwords must match and be at least 12 characters.")

        if user is None:
            user = User.objects.create_user(
                email=email, password=pw,
                first_name=opts["first_name"], last_name=opts["last_name"],
            )
        else:
            user.set_password(pw)
        user.is_staff = False
        user.is_superuser = False
        user.is_active = True
        user.save()
        UserRole.objects.get_or_create(user=user, role=role)
        self.stdout.write(self.style.SUCCESS("Developer account ready: " + email))
