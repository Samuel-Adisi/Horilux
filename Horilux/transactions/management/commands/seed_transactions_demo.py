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
    "Penthouse Suite", "Serviced Studio Apartment",
]

# Weighted so every stage of the real pipeline is represented -- the
# existing seed_finance_demo data skews almost entirely to CLOSED, which
# left the Transactions page looking like a closed-deals list rather than
# a live pipeline.
STATUS_WEIGHTS = [
    (Transaction.Status.OFFER, 5),
    (Transaction.Status.NEGOTIATION, 4),
    (Transaction.Status.AGREEMENT, 3),
    (Transaction.Status.DOCUMENTATION, 3),
    (Transaction.Status.PAYMENT, 3),
    (Transaction.Status.CLOSING, 2),
    (Transaction.Status.COMMISSION, 2),
    (Transaction.Status.CLOSED, 3),
]


class Command(BaseCommand):
    help = "Seed demo Transaction data spread across every pipeline status, for the CEO Transactions page."

    def handle(self, *args, **options):
        agents = list(User.objects.filter(is_active=True, department__isnull=False).exclude(department__name="ceo"))
        if not agents:
            self.stdout.write(self.style.ERROR("No eligible agent users found. Aborting."))
            return

        default_rule = CommissionRule.objects.filter(role__isnull=True, active=True).first()
        default_split = default_rule.agent_split_percent if default_rule else Decimal("50.00")

        now = timezone.now()
        created = 0

        for status, count in STATUS_WEIGHTS:
            for _ in range(count):
                days_ago = random.randint(1, 120)
                created_at = now - relativedelta(days=days_ago)

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
                    status="under_offer" if status != Transaction.Status.CLOSED else "sold_rented",
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

                is_paid_stage = status in (Transaction.Status.COMMISSION, Transaction.Status.CLOSED)
                is_partial_stage = status == Transaction.Status.PAYMENT

                if status == Transaction.Status.CLOSED:
                    amount_received = price
                    outstanding_amount = Decimal("0.00")
                elif is_partial_stage:
                    amount_received = (price * Decimal("0.5")).quantize(Decimal("0.01"))
                    outstanding_amount = price - amount_received
                else:
                    amount_received = Decimal("0.00")
                    outstanding_amount = price

                txn = Transaction.objects.create(
                    id=uuid.uuid4(),
                    property=prop,
                    client=client,
                    owner=owner,
                    agent=agent,
                    price=price,
                    commission_percent=commission_percent,
                    expected_commission=expected_commission,
                    amount_received=amount_received,
                    outstanding_amount=outstanding_amount,
                    status=status,
                )
                Transaction.objects.filter(pk=txn.pk).update(created_at=created_at)

                if is_paid_stage:
                    received = expected_commission if status == Transaction.Status.CLOSED else Decimal("0.00")
                    outstanding = expected_commission - received
                    agent_share = (expected_commission * default_split / 100).quantize(Decimal("0.01"))
                    company_share = expected_commission - agent_share

                    Commission.objects.create(
                        id=uuid.uuid4(),
                        transaction=txn,
                        expected=expected_commission,
                        received=received,
                        outstanding=outstanding,
                        agent_share=(agent_share * received / expected_commission).quantize(Decimal("0.01")) if expected_commission and received else Decimal("0.00"),
                        company_share=(company_share * received / expected_commission).quantize(Decimal("0.01")) if expected_commission and received else Decimal("0.00"),
                        payment_status="paid" if status == Transaction.Status.CLOSED else "pending",
                    )

                created += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created} transactions spread across every pipeline status."))
