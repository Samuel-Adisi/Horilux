import uuid
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=50)
    message = models.CharField(max_length=255)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.UUIDField(null=True, blank=True)
    related_object = GenericForeignKey("content_type", "object_id")
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class NotificationPreference(models.Model):
    """
    Per-user, per-event-type toggle for whether they receive this
    notification type. Defaults to True (opted in) for every event.
    Only event types actually emitted by notifications.tasks.create_notification
    call sites are listed here — keep in sync with signals.py/tasks.py across
    crm, viewings, transactions, properties, marketing.
    """
    class EventType(models.TextChoices):
        LEAD_ASSIGNED = "lead.assigned", "Lead assigned to you"
        VIEWING_COMPLETED = "viewing.completed", "Viewing outcome recorded"
        FOLLOWUP_DUE = "followup.due", "Follow-up due"
        FOLLOWUP_OVERDUE = "followup.overdue", "Follow-up overdue"
        TRANSACTION_CLOSED = "transaction.closed", "Transaction closed"
        TRANSACTION_COMMISSION_DUE = "transaction.commission_due", "Commission due for review"
        PROPERTY_PUBLISHED = "property.published", "Listing published"
        CAMPAIGN_PUBLISHED = "campaign.published", "Marketing campaign published"
        PROPERTY_PENDING_VERIFICATION = "property.pending_verification", "Property submitted for verification"
        PROPERTY_PENDING_APPROVAL = "property.pending_approval", "Property awaiting approval"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_preferences")
    event_type = models.CharField(max_length=64, choices=EventType.choices)
    enabled = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "event_type"], name="unique_user_event_preference"),
        ]

    def __str__(self):
        return f"{self.user}: {self.event_type} = {self.enabled}"
