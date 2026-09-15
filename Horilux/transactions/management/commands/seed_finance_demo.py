import random
import uuid
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from dateutil.relativedelta import relativedelta

from accounts.models import User
from properties.models import Property, PropertyOwner
from crm.models import Client
from transactions.models import Transaction, Commission, CommissionRule


LOCATIONS = ["East Legon", "Airport Residential", "Cantonments", "Trasacco Valley", "Labone", "Spintex"]
PROPERTY_TITLES = [
    "4-Bedroom Executive House", "3-Bedroom Townhouse", "Luxury Villa with Pool",
    "2-Bedroom Apartment", "Commercial Office Space", "5-Bedroom Family Home",
]


class Command(BaseCommand):
    help = "Seed demo Transaction/Commission data for the CEO Revenue page, spread across the trailing 6 months."

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=24, help="Number of transactions to create")

    def handle(self, *args, **options):
        count = options["count"]
        agents = list(User.objects.filter(is_active=True, department__isnull=False).exclude(department__name="ceo"))
        if not agents:
            self.stdout.write(self.style.ERROR("No eligible agent users found. Aborting."))
            return

        default_rule = CommissionRule.objects.filter(role__isnull=True, active=True).first()
        default_split = default_rule.agent_split_percent if default_rule else Decimal("50.00")

        now = timezone.now()
        created = 0

        for i in range(count):
            months_ago = random.randint(0, 5)
            day_offset = random.randint(0, 27)
            created_at = (now - relativedelta(months=months_ago)).replace(day=1) + relativedelta(days=day_offset)

            owner = PropertyOwner.objects.create(
                id=uuid.uuid4(),
                name=f"Owner {random.choice(['Kofi', 'Ama', 'Yaw', 'Abena', 'Kwesi'])} {random.randint(100,999)}",
                phone=f"+2332{random.randint(1000000,9999999)}",
            )

            prop = Property.objects.create(
                id=uuid.uuid4(),
                owner=owner,
                title=random.choice(PROPERTY_TITLES),
                property_type=random.choice(["residential", "commercial"]),
                listing_type="sale",
                price=Decimal(random.randint(80, 950)) * 1000,
                location=random.choice(LOCATIONS),
                status="sold_rented",
            )

            client = Client.objects.create(
                id=uuid.uuid4(),
                name=f"Client {random.choice(['Nana', 'Efua', 'Kojo', 'Adjoa'])} {random.randint(100,999)}",
                phone=f"+2335{random.randint(1000000,9999999)}",
                assigned_agent=random.choice(agents),
            )

            agent = random.choice(agents)
            price = Decimal(random.randint(60, 900)) * 1000
            commission_percent = Decimal(random.choice(["3.00", "3.50", "4.00", "5.00"]))
            expected_commission = (price * commission_percent / 100).quantize(Decimal("0.01"))

            # Older months: fully closed and paid. Current month: mixed statuses.
            if months_ago == 0:
                status = random.choice([Transaction.Status.NEGOTIATION, Transaction.Status.CLOSING, Transaction.Status.CLOSED])
            else:
                status = Transaction.Status.CLOSED

            if status == Transaction.Status.CLOSED:
                received = expected_commission
                outstanding = Decimal("0.00")
            else:
                received = (expected_commission * Decimal(random.choice(["0.00", "0.50"]))).quantize(Decimal("0.01"))
                outstanding = expected_commission - received

            txn = Transaction.objects.create(
                id=uuid.uuid4(),
                property=prop,
                client=client,
                owner=owner,
                agent=agent,
                price=price,
                commission_percent=commission_percent,
                expected_commission=expected_commission,
                amount_received=price if status == Transaction.Status.CLOSED else Decimal("0.00"),
                outstanding_amount=Decimal("0.00") if status == Transaction.Status.CLOSED else price,
                status=status,
                created_at=created_at,
            )
            Transaction.objects.filter(pk=txn.pk).update(created_at=created_at)

            agent_share = (expected_commission * default_split / 100).quantize(Decimal("0.01"))
            company_share = expected_commission - agent_share

            Commission.objects.create(
                id=uuid.uuid4(),
                transaction=txn,
                expected=expected_commission,
                received=received,
                outstanding=outstanding,
                agent_share=(agent_share * received / expected_commission).quantize(Decimal("0.01")) if expected_commission else Decimal("0.00"),
                company_share=(company_share * received / expected_commission).quantize(Decimal("0.01")) if expected_commission else Decimal("0.00"),
                payment_status="paid" if status == Transaction.Status.CLOSED else "pending",
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created} transactions with commissions across the trailing 6 months."))
