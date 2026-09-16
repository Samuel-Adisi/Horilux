from celery import shared_task
from django.contrib.contenttypes.models import ContentType

from notifications.models import Notification


def create_notification(recipient, type_, message, related_obj=None):
    if recipient is None:
        return None

    from notifications.models import NotificationPreference
    pref = NotificationPreference.objects.filter(user=recipient, event_type=type_).first()
    if pref is not None and not pref.enabled:
        return None

    content_type = None
    object_id = None
    if related_obj is not None:
        content_type = ContentType.objects.get_for_model(related_obj)
        object_id = related_obj.pk
    return Notification.objects.create(
        recipient=recipient,
        type=type_,
        message=message,
        content_type=content_type,
        object_id=object_id,
    )


@shared_task
def create_notification_async(recipient_id, type_, message, content_type_id=None, object_id=None):
    from django.conf import settings
    from django.apps import apps
    UserModel = apps.get_model(settings.AUTH_USER_MODEL)
    try:
        recipient = UserModel.objects.get(pk=recipient_id)
    except UserModel.DoesNotExist:
        return
    Notification.objects.create(
        recipient=recipient,
        type=type_,
        message=message,
        content_type_id=content_type_id,
        object_id=object_id,
    )
