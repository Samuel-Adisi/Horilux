import time

import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from properties.models import Property, PropertyMedia

# Extra gallery photos to round out a property's carousel -- deliberately
# distinct real-estate shots (exterior/interior variety) per property.
GALLERY_IMAGE_IDS = [
    "1600607687939-ce8a6c25118c",  # luxury living room
    "1600585152220-90363fe7e115",  # modern kitchen
    "1600566753086-00f18fb6b3ea",  # bright bedroom
    "1600210492486-724fe5c67fb0",  # bathroom
    "1600585152915-d208bec867a1",  # dining area
    "1600566752355-35792bedcfea",  # minimalist living room
]

IMAGE_URL_TEMPLATE = "https://images.unsplash.com/photo-{photo_id}?q=80&w=1600&auto=format&fit=crop"

PHOTOS_PER_PROPERTY = 3
PROPERTY_COUNT = 4


class Command(BaseCommand):
    help = (
        f"Add {PHOTOS_PER_PROPERTY} extra gallery photos to the first {PROPERTY_COUNT} "
        "properties (by created_at) so the detail-page carousel has real content to scroll."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="List what would be added without downloading/saving anything.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        properties = list(Property.objects.order_by("created_at")[:PROPERTY_COUNT])

        if not properties:
            self.stdout.write(self.style.WARNING("No properties found."))
            return

        added = 0
        failed = 0

        for prop in properties:
            existing_count = PropertyMedia.objects.filter(property=prop).count()
            self.stdout.write(f"{prop.title} (currently {existing_count} photo(s)):")

            for i in range(PHOTOS_PER_PROPERTY):
                photo_id = GALLERY_IMAGE_IDS[(int(prop.id.int) + i) % len(GALLERY_IMAGE_IDS)]
                order = existing_count + i + 1

                if dry_run:
                    self.stdout.write(f"  would add: order {order}, photo {photo_id}")
                    continue

                try:
                    url = IMAGE_URL_TEMPLATE.format(photo_id=photo_id)
                    response = requests.get(url, timeout=20)
                    response.raise_for_status()

                    media = PropertyMedia(
                        property=prop,
                        media_type=PropertyMedia.MediaType.PHOTO,
                        order=order,
                    )
                    filename = f"{prop.id}_gallery_{order}.jpg"
                    media.file.save(filename, ContentFile(response.content), save=True)

                    added += 1
                    self.stdout.write(self.style.SUCCESS(f"  added: order {order}"))
                    time.sleep(0.3)

                except Exception as exc:
                    failed += 1
                    self.stdout.write(self.style.ERROR(f"  FAILED: order {order} — {exc}"))

        if dry_run:
            self.stdout.write(self.style.WARNING("\nDry run — nothing was downloaded or saved."))
        else:
            self.stdout.write(self.style.SUCCESS(f"\nDone. Added {added}, failed {failed}."))

