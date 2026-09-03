import uuid
from django.conf import settings
from django.db import models
from crm.models import Client
from properties.models import Property


class Viewing(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        CONFIRMED = "confirmed", "Confirmed"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        NO_SHOW = "no_show", "No-show"

    class Outcome(models.TextChoices):
        HOT = "hot", "Hot"
        WARM = "warm", "Warm"
        COLD = "cold", "Cold"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="viewings")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="viewings")
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="viewings")
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.SCHEDULED)
    notes = models.TextField(blank=True)
    outcome = models.CharField(max_length=10, choices=Outcome.choices, null=True, blank=True)
    next_action = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class FollowUp(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    viewing = models.ForeignKey(Viewing, on_delete=models.CASCADE, related_name="follow_ups", null=True, blank=True)
    lead = models.ForeignKey("crm.Lead", on_delete=models.CASCADE, related_name="follow_ups", null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="follow_ups", null=True, blank=True)
    due_date = models.DateField()
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    responsible_agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
