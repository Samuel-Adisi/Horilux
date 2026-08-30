import uuid
from django.conf import settings
from django.db import models


class Lead(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        QUALIFIED = "qualified", "Qualified"
        PROPERTY_MATCHED = "property_matched", "Property Matched"
        VIEWING = "viewing", "Viewing"
        NEGOTIATION = "negotiation", "Negotiation"
        CLOSED = "closed", "Closed"
        LOST = "lost", "Lost"

    class Purpose(models.TextChoices):
        BUY = "buy", "Buy"
        RENT = "rent", "Rent"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    source = models.CharField(max_length=100, blank=True)
    budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default="GHS")
    location_preference = models.CharField(max_length=255, blank=True)
    property_type_preference = models.CharField(max_length=20, blank=True)
    bedrooms_preference = models.PositiveIntegerField(null=True, blank=True)
    purpose = models.CharField(max_length=10, choices=Purpose.choices, null=True, blank=True)
    assigned_agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="leads")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    last_contact = models.DateTimeField(null=True, blank=True)
    next_follow_up = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.status})"


class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.OneToOneField(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name="client")
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    assigned_agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="clients")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
