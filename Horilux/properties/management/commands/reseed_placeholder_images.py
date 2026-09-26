import time

import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from properties.models import Property, PropertyMedia

# Curated real-estate-style photos (exteriors + interiors), pulled once and
# cycled deterministically per property so results are stable across runs.
REAL_ESTATE_IMAGE_IDS = [
    "1600596542815-ffad4c1539a9",  # modern house exterior
    "1600585154340-be6161a56a0c",  # modern house dusk
    "1613977257363-707ba9348227",  # apartment building
    "1600607687939-ce8a6c25118c",  # luxury living room
    "1600585152220-90363fe7e115",  # modern kitchen
    "1600566753086-00f18fb6b3ea",  # bright bedroom
    "1600607687920-4e2a09cf159d",  # house with pool
    "1512917774080-9991f1c4c750",  # modern house day
    "1600047509807-ba8f99d2cdde",  # townhouse row
    "1600210492486-724fe5c67fb0",  # bathroom
    "1600585152915-d208bec867a1",  # dining area
    "1600566752355-35792bedcfea",  # minimalist living room
]

IMAGE_URL_TEMPLATE = "https://images.unsplash.com/photo-{photo_id}?q=80&w=1600&auto=format&fit=crop"


class Command(BaseCommand):
    help = (
        "Replace placeholder PropertyMedia rows created by seed_missing_property_images "
        "(Picsum, unrelated stock photos) with curated real-estate-style photos. "
        "Only touches media rows with uploaded_by=None so genuinely uploaded photos are untouched."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="List properties that would be reseeded without downloading/saving anything.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        placeholder_media = PropertyMedia.objects.filter(uploaded_by__isnull=True).select_related("property")
        count = placeholder_media.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS("No placeholder media found. Nothing to do."))
            return

        self.stdout.write(f"Found {count} placeholder media rows to replace.")

        if dry_run:
            for media in placeholder_media:
                idx = int(media.property_id.int) % len(REAL_ESTATE_IMAGE_IDS)
                self.stdout.write(f"  would replace: {media.property.title} -> photo index {idx}")
            self.stdout.write(self.style.WARNING("Dry run — nothing was downloaded or saved."))
            return

        replaced = 0
        failed = 0

        for media in placeholder_media:
            try:
                idx = int(media.property_id.int) % len(REAL_ESTATE_IMAGE_IDS)
                photo_id = REAL_ESTATE_IMAGE_IDS[idx]
                url = IMAGE_URL_TEMPLATE.format(photo_id=photo_id)
                response = requests.get(url, timeout=20)
                response.raise_for_status()

                media.file.delete(save=False)
                filename = f"{media.property_id}.jpg"
                media.file.save(filename, ContentFile(response.content), save=True)

                replaced += 1
                self.stdout.write(self.style.SUCCESS(f"  replaced: {media.property.title}"))

                time.sleep(0.3)

            except Exception as exc:
                failed += 1
                self.stdout.write(self.style.ERROR(f"  FAILED: {media.property.title} — {exc}"))

        self.stdout.write(self.style.SUCCESS(f"\nDone. Replaced {replaced}, failed {failed}, total {count}."))

