import uuid
from django.conf import settings
from django.db import models
from properties.models import Property


class MarketingCampaign(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        IN_REVIEW = "in_review", "In Review"
        SCHEDULED = "scheduled", "Scheduled"
        PUBLISHED = "published", "Published"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="campaigns")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    content = models.JSONField(default=dict, blank=True)
    scheduled_date = models.DateTimeField(null=True, blank=True)
    published_date = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class CampaignPerformance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(MarketingCampaign, on_delete=models.CASCADE, related_name="performance_records")
    views = models.PositiveIntegerField(default=0)
    enquiries = models.PositiveIntegerField(default=0)
    leads_generated = models.PositiveIntegerField(default=0)
    viewings_booked = models.PositiveIntegerField(default=0)
    conversions = models.PositiveIntegerField(default=0)
    recorded_at = models.DateTimeField(auto_now_add=True)
