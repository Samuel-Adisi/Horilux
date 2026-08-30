from django.db.models.signals import post_save
from django.dispatch import receiver

from marketing.models import MarketingCampaign
from notifications.tasks import create_notification


@receiver(post_save, sender=MarketingCampaign)
def campaign_published(sender, instance, created, **kwargs):
    if created or instance.status != MarketingCampaign.Status.PUBLISHED:
        return
    agent = getattr(instance.property, "agent", None)
    if agent:
        create_notification(
            recipient=agent,
            type_="campaign.published",
            message=f'Marketing campaign for "{instance.property.title}" is live.',
            related_obj=instance,
        )
