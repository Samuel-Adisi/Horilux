import random
import uuid
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from dateutil.relativedelta import relativedelta

from accounts.models import User
from crm.models import Lead

FIRST_NAMES = ["Kofi", "Ama", "Yaw", "Abena", "Kwesi", "Efua", "Kojo", "Adjoa", "Nana", "Akosua", "Kwabena", "Esi"]
LAST_NAMES = ["Mensah", "Owusu", "Boateng", "Asante", "Osei", "Appiah", "Darko", "Agyemang"]
LOCATIONS = ["East Legon", "Airport Residential", "Cantonments", "Trasacco Valley", "Labone", "Spintex", "Osu", "Dzorwulu"]
SOURCES = ["Website", "Referral", "Walk-in", "Facebook Ad", "Property Portal", "Agent Network"]

STAGE_WEIGHTS = [
    (Lead.Status.NEW, 8),
    (Lead.Status.CONTACTED, 7),
    (Lead.Status.QUALIFIED, 6),
    (Lead.Status.PROPERTY_MATCHED, 5),
    (Lead.Status.VIEWING, 4),
    (Lead.Status.NEGOTIATION, 3),
    (Lead.Status.CLOSED, 2),
    (Lead.Status.LOST, 2),
]


class Command(BaseCommand):
    help = "Seed demo Lead data across every pipeline stage for the CEO Sales Pipeline page."

    def handle(self, *args, **options):
        agents = list(User.objects.filter(is_active=True, department__isnull=False).exclude(department__name="ceo"))
        if not agents:
            self.stdout.write(self.style.ERROR("No eligible agent users found. Aborting."))
            return

        now = timezone.now()
        created = 0

        for status, count in STAGE_WEIGHTS:
            for _ in range(count):
                name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
                days_ago = random.randint(1, 150)
                lead = Lead.objects.create(
                    id=uuid.uuid4(),
                    name=name,
                    phone=f"+2335{random.randint(1000000,9999999)}",
                    email=f"{name.lower().replace(' ', '.')}{random.randint(1,99)}@example.com",
                    source=random.choice(SOURCES),
                    budget=Decimal(random.randint(60, 900)) * 1000,
                    currency="GHS",
                    location_preference=random.choice(LOCATIONS),
                    purpose=random.choice(["buy", "rent"]),
                    assigned_agent=random.choice(agents),
                    status=status,
                    last_contact=now - relativedelta(days=random.randint(0, 20)),
                )
                Lead.objects.filter(pk=lead.pk).update(created_at=now - relativedelta(days=days_ago))
                created += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created} leads across all pipeline stages."))
