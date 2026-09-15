import random
import uuid

from django.core.management.base import BaseCommand
from django.utils import timezone
from dateutil.relativedelta import relativedelta

from accounts.models import User
from properties.models import Property
from marketing.models import MarketingCampaign, CampaignPerformance

HEADLINES = [
    "Luxury Living Awaits", "Prime Location, Prime Investment", "Your Dream Home Starts Here",
    "Exclusive Listing Now Available", "Modern Comfort Meets Elegant Design",
    "Rare Opportunity in a Sought-After Area", "Move-In Ready, Move Up Today",
]

STATUS_WEIGHTS = [
    (MarketingCampaign.Status.DRAFT, 5),
    (MarketingCampaign.Status.IN_REVIEW, 3),
    (MarketingCampaign.Status.SCHEDULED, 4),
    (MarketingCampaign.Status.PUBLISHED, 10),
]


class Command(BaseCommand):
    help = "Seed demo MarketingCampaign + CampaignPerformance data across all statuses for the CEO Campaigns page."

    def handle(self, *args, **options):
        marketers = list(User.objects.filter(is_active=True, department__name="marketing"))
        if not marketers:
            self.stdout.write(self.style.ERROR("No eligible Marketing department users found. Aborting."))
            return

        eligible_statuses = {Property.Status.MARKETING_READY, Property.Status.PUBLISHED}
        properties = list(Property.objects.filter(status__in=eligible_statuses))
        if not properties:
            self.stdout.write(self.style.ERROR(
                "No properties with status marketing_ready or published found. Aborting."
            ))
            return

        now = timezone.now()
        created_campaigns = 0
        created_perf = 0

        for status, count in STATUS_WEIGHTS:
            for _ in range(count):
                prop = random.choice(properties)
                marketer = random.choice(marketers)
                days_ago = random.randint(1, 120)
                created_at = now - relativedelta(days=days_ago)

                campaign = MarketingCampaign.objects.create(
                    id=uuid.uuid4(),
                    property=prop,
                    status=status,
                    content={"headline": random.choice(HEADLINES)},
                    created_by=marketer,
                )

                scheduled_date = None
                published_date = None
                if status in (MarketingCampaign.Status.SCHEDULED, MarketingCampaign.Status.PUBLISHED):
                    scheduled_date = created_at + relativedelta(days=random.randint(1, 5))
                if status == MarketingCampaign.Status.PUBLISHED:
                    published_date = scheduled_date + relativedelta(days=random.randint(0, 2))

                MarketingCampaign.objects.filter(pk=campaign.pk).update(
                    created_at=created_at,
                    scheduled_date=scheduled_date,
                    published_date=published_date,
                )
                created_campaigns += 1

                if status == MarketingCampaign.Status.PUBLISHED:
                    views = random.randint(500, 12000)
                    enquiries = random.randint(5, int(views * 0.03) + 5)
                    leads = random.randint(1, max(1, int(enquiries * 0.5)))
                    viewings = random.randint(0, leads)
                    conversions = random.randint(0, max(0, viewings // 4))
                    CampaignPerformance.objects.create(
                        id=uuid.uuid4(),
                        campaign=campaign,
                        views=views,
                        enquiries=enquiries,
                        leads_generated=leads,
                        viewings_booked=viewings,
                        conversions=conversions,
                    )
                    created_perf += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {created_campaigns} campaigns ({created_perf} with performance records)."
        ))
