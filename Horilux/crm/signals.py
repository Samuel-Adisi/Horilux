from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from crm.models import Lead
from notifications.tasks import create_notification


@receiver(pre_save, sender=Lead)
def _stash_previous_agent(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._previous_agent_id = Lead.objects.only("assigned_agent_id").get(pk=instance.pk).assigned_agent_id
        except Lead.DoesNotExist:
            instance._previous_agent_id = None
    else:
        instance._previous_agent_id = None


@receiver(post_save, sender=Lead)
def lead_assigned(sender, instance, created, **kwargs):
    previous_agent_id = getattr(instance, "_previous_agent_id", None)
    if instance.assigned_agent_id and instance.assigned_agent_id != previous_agent_id:
        create_notification(
            recipient=instance.assigned_agent,
            type_="lead.assigned",
            message=f'Lead "{instance.name}" has been assigned to you.',
            related_obj=instance,
        )
