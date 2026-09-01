from django.db.models.signals import post_save
from django.dispatch import receiver

from viewings.models import Viewing, FollowUp
from notifications.tasks import create_notification


@receiver(post_save, sender=Viewing)
def viewing_completed(sender, instance, created, **kwargs):
    if created or instance.status != Viewing.Status.COMPLETED:
        return
    if instance.agent:
        create_notification(
            recipient=instance.agent,
            type_="viewing.completed",
            message=f'Viewing outcome recorded: {instance.get_outcome_display() if instance.outcome else "no outcome"}.',
            related_obj=instance,
        )


@receiver(post_save, sender=FollowUp)
def followup_created(sender, instance, created, **kwargs):
    if created and instance.responsible_agent:
        create_notification(
            recipient=instance.responsible_agent,
            type_="followup.due",
            message=f"Follow-up due {instance.due_date}.",
            related_obj=instance,
        )
