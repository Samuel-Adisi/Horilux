from django.db.models.signals import post_save
from django.dispatch import receiver

from properties.models import Property
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
