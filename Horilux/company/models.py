import uuid
from django.db import models


class CompanyProfile(models.Model):
    """Singleton — one row only, enforced in save()."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, default="Horilux Estates")
    logo = models.ImageField(upload_to="company/", null=True, blank=True)
    registered_address = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=32, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    default_currency = models.CharField(max_length=8, default="GHS")
    timezone = models.CharField(max_length=64, default="Africa/Accra")
    theme_primary_color = models.CharField(max_length=9, default="#240270")
    theme_secondary_color = models.CharField(max_length=9, default="#003E03")
    theme_accent_color = models.CharField(max_length=9, default="#7A6D0C")
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )

    def save(self, *args, **kwargs):
        self.pk = self.pk or uuid.UUID(int=0)  # force a fixed singleton PK
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=uuid.UUID(int=0))
        return obj

    def __str__(self):
        return self.name


class IntegrationStatus(models.Model):
    """
    No secrets stored here. Keys live in env vars on Render.
    This just records whether a given integration's env var is present
    and, optionally, the last time a health-check confirmed it works.
    """
    class Provider(models.TextChoices):
        PAYSTACK = "paystack", "Paystack"
        CLOUDINARY = "cloudinary", "Cloudinary"
        EMAIL = "email", "Email (SMTP)"
        SMS = "sms", "SMS Gateway"

    provider = models.CharField(max_length=32, choices=Provider.choices, unique=True)
    configured = models.BooleanField(default=False)
    last_checked_at = models.DateTimeField(null=True, blank=True)
    last_check_ok = models.BooleanField(null=True, blank=True)
    notes = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.get_provider_display()} ({'OK' if self.last_check_ok else 'unchecked'})"
