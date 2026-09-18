from django.db.models.signals import post_save
from django.dispatch import receiver

from properties.models import Property, VerificationChecklist
from notifications.tasks import create_notification


@receiver(post_save, sender=Property)
def property_status_changed(sender, instance, created, **kwargs):
    if created:
        return

    if instance.status == Property.Status.PENDING_VERIFICATION:
        _notify_operations_and_ceo(
            instance,
            type_="property.pending_verification",
            message=f'Property "{instance.title}" submitted for verification.',
        )
        _create_task(instance, title=f'Verify property: {instance.title}')

    elif instance.status == Property.Status.PENDING_APPROVAL:
        _notify_operations_and_ceo(
            instance,
            type_="property.pending_approval",
            message=f'Property "{instance.title}" is awaiting manager approval.',
        )
        _create_task(instance, title=f'Approve property: {instance.title}')

    elif instance.status == Property.Status.PUBLISHED:
        if instance.agent:
            create_notification(
                recipient=instance.agent,
                type_="property.published",
                message=f'Your listing "{instance.title}" is now published.',
                related_obj=instance,
            )


def _notify_operations_and_ceo(instance, type_, message):
    from accounts.models import User
    recipients = User.objects.filter(
        user_roles__role__name__in=["Operations", "CEO"]
    ).distinct()
    for recipient in recipients:
        create_notification(recipient, type_, message, related_obj=instance)


def _create_task(instance, title):
    from operations.models import Task
    from django.contrib.contenttypes.models import ContentType
    Task.objects.create(
        title=title,
        content_type=ContentType.objects.get_for_model(instance),
        object_id=instance.pk,
        status=Task.Status.OPEN,
    )


@receiver(post_save, sender=VerificationChecklist)
def sync_completion_percent(sender, instance, **kwargs):
    """Keep Property.completion_percent = round(100 * ticked flags / 7).

    Uses queryset.update() so it doesn't re-fire Property post_save
    (which would re-send status notifications / create duplicate tasks).
    """
    percent = instance.compute_completion_percent()
    Property.objects.filter(pk=instance.property_id).exclude(
        completion_percent=percent
    ).update(completion_percent=percent)
    cached = instance._state.fields_cache.get("property") if hasattr(instance._state, "fields_cache") else None
    if cached is not None:
        cached.completion_percent = percent
