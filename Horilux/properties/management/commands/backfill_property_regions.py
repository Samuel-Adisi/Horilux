from django.core.management.base import BaseCommand
from properties.models import Property

LOCATION_TO_REGION = {
    "trasacco valley": "Greater Accra",
    "labone": "Greater Accra",
    "spintex": "Greater Accra",
    "east legon": "Greater Accra",
    "airport residential": "Greater Accra",
    "cantonments": "Greater Accra",
    "accra": "Greater Accra",
    "kumasi": "Ashanti",
}


class Command(BaseCommand):
    help = "Backfill blank Property.region from real Property.location values."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Show what would change without saving.")

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        blanks = Property.objects.filter(region="")
        total = blanks.count()

        matched = 0
        unmatched = set()

        for p in blanks:
            key = p.location.strip().lower()
            region = LOCATION_TO_REGION.get(key)
            if region:
                matched += 1
                if not dry_run:
                    p.region = region
                    p.save(update_fields=["region"])
            else:
                unmatched.add(p.location)

        self.stdout.write(f"Blank-region properties found: {total}")
        self.stdout.write(f"Matched and {'would update' if dry_run else 'updated'}: {matched}")
        if unmatched:
            self.stdout.write(self.style.WARNING(f"Unmatched locations (no mapping): {sorted(unmatched)}"))
        else:
            self.stdout.write(self.style.SUCCESS("All blank-region properties matched a known location."))
