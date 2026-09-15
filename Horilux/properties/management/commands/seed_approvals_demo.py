import uuid
import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from properties.models import Property, PropertyOwner, VerificationChecklist

TITLES = [
    "Riverside Terrace Villa",
    "Golden Palm Apartments",
    "Cedar Court Townhouse",
    "Skyline Heights Penthouse",
]
LOCATIONS = ["East Legon", "Airport Residential", "Cantonments", "Labone"]
REGIONS = ["Greater Accra"]


class Command(BaseCommand):
    help = "Seed demo Property records in pending_verification status (mix of complete/incomplete checklists) for the CEO Approvals page."

    def handle(self, *args, **options):
        listing_agents = list(User.objects.filter(is_active=True, roles__name="Listing").distinct())
        owners = list(PropertyOwner.objects.all())

        if not owners:
            self.stdout.write(self.style.ERROR("No PropertyOwner records found. Aborting."))
            return

        created = 0
        now = timezone.now()

        for i, title in enumerate(TITLES):
            owner = random.choice(owners)
            agent = random.choice(listing_agents) if listing_agents else None

            prop = Property.objects.create(
                id=uuid.uuid4(),
                title=title,
                property_type=random.choice(["house", "apartment", "villa"]),
                listing_type=random.choice(["sale", "rent"]),
                price=Decimal(random.randint(80, 950)) * 1000,
                currency="GHS",
                location=random.choice(LOCATIONS),
                region=random.choice(REGIONS),
                address=f"{random.randint(1,99)} Sample Street",
                bedrooms=random.randint(2, 6),
                bathrooms=random.randint(2, 5),
                owner=owner,
                agent=agent,
                status=Property.Status.PENDING_VERIFICATION,
            )

            # Alternate between fully-complete checklists (ready to approve)
            # and partially-complete ones (blocked), to give the CEO page a realistic mix.
            complete = i % 2 == 0
            VerificationChecklist.objects.create(
                property=prop,
                owner_info_ok=True,
                price_ok=True,
                location_ok=True,
                details_ok=complete,
                photos_ok=complete,
                documents_ok=complete,
                commission_agreement_ok=complete,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created} pending_verification properties for approvals demo."))
