import io
import time

import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from properties.models import Property, PropertyMedia

# Picsum returns a random real photo for a given seed; using property id as seed
# keeps it stable/reproducible per property, no API key needed.
IMAGE_URL_TEMPLATE = "https://picsum.photos/seed/{seed}/1200/800"


class Command(BaseCommand):
    help = "Attach a placeholder cover photo to any published/marketable property that has zero PropertyMedia."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="List properties that would be seeded without downloading/saving anything.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        properties_without_media = Property.objects.filter(media__isnull=True).distinct()
        count = properties_without_media.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS("No properties are missing images. Nothing to do."))
            return

        self.stdout.write(f"Found {count} properties with zero media.")

        if dry_run:
            for prop in properties_without_media:
                self.stdout.write(f"  would seed: {prop.id} - {prop.title}")
            self.stdout.write(self.style.WARNING("Dry run — nothing was downloaded or saved."))
            return

        seeded = 0
        failed = 0

        for prop in properties_without_media:
            try:
                url = IMAGE_URL_TEMPLATE.format(seed=prop.id)
                response = requests.get(url, timeout=20)
                response.raise_for_status()

                media = PropertyMedia(
                    property=prop,
                    media_type=PropertyMedia.MediaType.PHOTO,
                    order=0,
                )
                filename = f"{prop.id}.jpg"
                media.file.save(filename, ContentFile(response.content), save=True)

                seeded += 1
                self.stdout.write(self.style.SUCCESS(f"  seeded: {prop.title}"))

                # small delay to be polite to the image host
                time.sleep(0.3)

            except Exception as exc:
                failed += 1
                self.stdout.write(self.style.ERROR(f"  FAILED: {prop.title} — {exc}"))

        self.stdout.write(self.style.SUCCESS(f"\nDone. Seeded {seeded}, failed {failed}, total {count}."))
