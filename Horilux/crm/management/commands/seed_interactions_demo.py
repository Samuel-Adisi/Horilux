import random
import uuid

from django.core.management.base import BaseCommand
from django.utils import timezone
from dateutil.relativedelta import relativedelta

from accounts.models import User
from crm.models import Lead, Client, Interaction

CALL_SUMMARIES = [
    "Discussed budget and preferred locations",
    "Follow-up on property shortlist",
    "Confirmed availability for viewing",
    "Answered questions about financing options",
    "Checked in after viewing, gauging interest",
    "Negotiation call on offer terms",
]
EMAIL_SUMMARIES = [
    "Sent property shortlist matching criteria",
    "Shared brochure and pricing details",
    "Sent viewing confirmation and directions",
    "Followed up with additional listings",
    "Sent offer letter for review",
]
MEETING_SUMMARIES = [
    "In-person consultation at office",
    "Reviewed contract terms together",
    "Discussed financing and next steps",
]
WHATSAPP_SUMMARIES = [
    "Sent quick photos of new listing",
    "Confirmed viewing time via WhatsApp",
    "Quick check-in on decision timeline",
]
SITE_VISIT_SUMMARIES = [
    "Accompanied client on property tour",
    "Second viewing with family members",
]
SMS_SUMMARIES = [
    "Sent reminder for scheduled viewing",
    "Sent follow-up after missed call",
]

TYPE_SUMMARY_MAP = {
    Interaction.InteractionType.CALL: CALL_SUMMARIES,
    Interaction.InteractionType.EMAIL: EMAIL_SUMMARIES,
    Interaction.InteractionType.MEETING: MEETING_SUMMARIES,
    Interaction.InteractionType.WHATSAPP: WHATSAPP_SUMMARIES,
    Interaction.InteractionType.SITE_VISIT: SITE_VISIT_SUMMARIES,
    Interaction.InteractionType.SMS: SMS_SUMMARIES,
}

TYPE_WEIGHTS = [
    (Interaction.InteractionType.CALL, 5),
    (Interaction.InteractionType.EMAIL, 4),
    (Interaction.InteractionType.WHATSAPP, 4),
    (Interaction.InteractionType.MEETING, 2),
    (Interaction.InteractionType.SITE_VISIT, 2),
    (Interaction.InteractionType.SMS, 2),
]


def weighted_type():
    types, weights = zip(*TYPE_WEIGHTS)
    return random.choices(types, weights=weights, k=1)[0]


class Command(BaseCommand):
    help = "Seed demo Interaction data against existing Leads and Clients for the CEO CRM Interactions page."

    def add_arguments(self, parser):
        parser.add_argument("--per-record", type=int, default=3, help="Avg interactions per lead/client")

    def handle(self, *args, **options):
        agents = list(User.objects.filter(is_active=True, department__isnull=False).exclude(department__name="ceo"))
        if not agents:
            self.stdout.write(self.style.ERROR("No eligible agent users found. Aborting."))
            return

        leads = list(Lead.objects.all())
        clients = list(Client.objects.all())
        if not leads and not clients:
            self.stdout.write(self.style.ERROR("No leads or clients found. Seed those first."))
            return

        per_record = options["per_record"]
        now = timezone.now()
        created = 0

        def make_interactions(lead=None, client=None, agent=None):
            nonlocal created
            count = random.randint(0, per_record * 2)
            for _ in range(count):
                itype = weighted_type()
                summary = random.choice(TYPE_SUMMARY_MAP[itype])
                days_ago = random.randint(0, 120)
                occurred_at = now - relativedelta(days=days_ago, hours=random.randint(0, 23))
                Interaction.objects.create(
                    id=uuid.uuid4(),
                    lead=lead,
                    client=client,
                    agent=agent or random.choice(agents),
                    type=itype,
                    direction=random.choice([Interaction.Direction.INBOUND, Interaction.Direction.OUTBOUND]),
                    summary=summary,
                    notes="" if random.random() > 0.3 else "Client seemed engaged, good next-step candidate.",
                    occurred_at=occurred_at,
                )
                created += 1

        for lead in leads:
            make_interactions(lead=lead, agent=lead.assigned_agent)

        for client in clients:
            make_interactions(client=client, agent=client.assigned_agent)

        self.stdout.write(self.style.SUCCESS(f"Seeded {created} interactions across {len(leads)} leads and {len(clients)} clients."))
