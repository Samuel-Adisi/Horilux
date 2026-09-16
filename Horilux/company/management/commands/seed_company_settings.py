from django.core.management.base import BaseCommand
from company.models import CompanyProfile, IntegrationStatus


class Command(BaseCommand):
    help = "Seed the CompanyProfile singleton and IntegrationStatus rows."

    def handle(self, *args, **options):
        profile = CompanyProfile.get_solo()
        profile.name = "Horilux Estates"
        profile.registered_address = "Accra, Ghana"
        profile.contact_email = "info@horilux.com"
        profile.contact_phone = "+233 000 000 000"
        profile.license_number = "GREDA-0000"
        profile.default_currency = "GHS"
        profile.timezone = "Africa/Accra"
        profile.theme_primary_color = "#240270"
        profile.theme_secondary_color = "#003E03"
        profile.theme_accent_color = "#7A6D0C"
        profile.save()
        self.stdout.write(self.style.SUCCESS(f"CompanyProfile ready: {profile.name}"))

        for provider, label in IntegrationStatus.Provider.choices:
            obj, created = IntegrationStatus.objects.get_or_create(provider=provider)
            action = "created" if created else "already exists"
            self.stdout.write(f"  {label}: {action}")
