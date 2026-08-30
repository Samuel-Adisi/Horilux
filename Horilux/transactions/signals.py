from django.db.models.signals import post_save
from django.dispatch import receiver

from transactions.models import Transaction
from notifications.tasks import create_notification


@receiver(post_save, sender=Transaction)
def transaction_status_changed(sender, instance, created, **kwargs):
    if created:
        return

    if instance.status == Transaction.Status.COMMISSION:
        _notify_finance(instance)

    if instance.status == Transaction.Status.CLOSED and instance.agent:
        create_notification(
            recipient=instance.agent,
            type_="transaction.closed",
            message="Transaction closed.",
            related_obj=instance,
        )


def _notify_finance(instance):
    from accounts.models import User
    recipients = User.objects.filter(user_roles__role__name="Finance").distinct()
    for recipient in recipients:
        create_notification(
            recipient,
            type_="transaction.commission_due",
            message="Transaction reached commission stage -- payment/commission record needs review.",
            related_obj=instance,
        )
