import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from properties.models import Property


class Command(BaseCommand):
    help = "Backfills realistic views_count/inquiries_count/published_at on existing properties for demo purposes."

    def handle(self, *args, **options):
        properties = Property.objects.all()
        updated = 0

        for prop in properties:
            age_days = max((timezone.now() - prop.created_at).days, 1)

            if prop.status in [Property.Status.PUBLISHED, Property.Status.UNDER_OFFER, Property.Status.SOLD_RENTED]:
                base_views = random.randint(15, 40) * min(age_days, 90) // 10
                views = max(base_views + random.randint(-20, 60), 5)
                inquiries = max(int(views * random.uniform(0.03, 0.12)), 0)
                if not prop.published_at:
                    prop.published_at = prop.created_at + timezone.timedelta(days=random.randint(0, 3))
            elif prop.status == Property.Status.MARKETING_READY:
                views = random.randint(0, 20)
                inquiries = 0
            else:
                views = 0
                inquiries = 0

            prop.views_count = views
            prop.inquiries_count = inquiries
            prop.save(update_fields=["views_count", "inquiries_count", "published_at"])
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"Updated engagement data on {updated} properties."))
