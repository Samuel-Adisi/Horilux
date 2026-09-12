import uuid
from django.conf import settings
from django.db import models


class PropertyOwner(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    id_document = models.FileField(upload_to="owners/documents/", blank=True, null=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Property(models.Model):
    class ListingType(models.TextChoices):
        SALE = "sale", "For Sale"
        RENT = "rent", "For Rent"

    class PropertyType(models.TextChoices):
        RESIDENTIAL = "residential", "Residential"
        COMMERCIAL = "commercial", "Commercial"

    class RentalPeriod(models.TextChoices):
        DAILY = "daily", "Daily"
        MONTHLY = "monthly", "Monthly"
        YEARLY = "yearly", "Yearly"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ONBOARDING = "onboarding", "Onboarding"
        PENDING_VERIFICATION = "pending_verification", "Pending Verification"
        VERIFIED = "verified", "Verified"
        PENDING_APPROVAL = "pending_approval", "Pending Approval"
        MARKETING_READY = "marketing_ready", "Marketing Ready"
        PUBLISHED = "published", "Published"
        UNDER_OFFER = "under_offer", "Under Offer"
        SOLD_RENTED = "sold_rented", "Sold/Rented"
        ARCHIVED = "archived", "Archived"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    property_type = models.CharField(max_length=20, choices=PropertyType.choices)
    listing_type = models.CharField(max_length=10, choices=ListingType.choices)
    price = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=3, default="GHS")
    location = models.CharField(max_length=255)
    region = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    bedrooms = models.PositiveIntegerField(null=True, blank=True)
    bathrooms = models.PositiveIntegerField(null=True, blank=True)
    land_size = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    building_size = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    amenities = models.JSONField(default=list, blank=True)
    rental_period = models.CharField(max_length=10, choices=RentalPeriod.choices, null=True, blank=True)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(PropertyOwner, on_delete=models.PROTECT, related_name="properties")
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="listed_properties")
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.DRAFT)
    completion_percent = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class PropertyMedia(models.Model):
    class MediaType(models.TextChoices):
        PHOTO = "photo", "Photo"
        VIDEO = "video", "Video"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="media")
    file = models.FileField(upload_to="properties/media/")
    media_type = models.CharField(max_length=10, choices=MediaType.choices)
    order = models.PositiveSmallIntegerField(default=0)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]


class PropertyDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="properties/documents/")
    doc_type = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class VerificationChecklist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.OneToOneField(Property, on_delete=models.CASCADE, related_name="verification")
    owner_info_ok = models.BooleanField(default=False)
    price_ok = models.BooleanField(default=False)
    location_ok = models.BooleanField(default=False)
    details_ok = models.BooleanField(default=False)
    photos_ok = models.BooleanField(default=False)
    documents_ok = models.BooleanField(default=False)
    commission_agreement_ok = models.BooleanField(default=False)
    manager_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def is_complete(self) -> bool:
        return all([
            self.owner_info_ok, self.price_ok, self.location_ok, self.details_ok,
            self.photos_ok, self.documents_ok, self.commission_agreement_ok,
        ])
