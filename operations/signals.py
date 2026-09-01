"""
Generic-relation cleanup.

operations.Task and notifications.Notification reference arbitrary objects
via GenericForeignKey (content_type + object_id), which Django does not
enforce at the DB level. Without this, deleting a Property/Lead/Transaction/
Client/MarketingCampaign leaves dangling Task/Notification rows pointing at
a dead object_id (confirmed via data-integrity check, Sep 2026).

This module wires pre_delete on every model known to be GFK-referenced and
deletes the matching Task/Notification rows before the parent is removed.
"""
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import pre_delete

from operations.models import Task
from notifications.models import Notification
from properties.models import Property
from crm.models import Lead, Client
from transactions.models import Transaction
from marketing.models import MarketingCampaign

GFK_REFERENCED_MODELS = [Property, Lead, Client, Transaction, MarketingCampaign]


def _cleanup_generic_relations(sender, instance, **kwargs):
    ct = ContentType.objects.get_for_model(sender)
    Task.objects.filter(content_type=ct, object_id=instance.pk).delete()
    Notification.objects.filter(content_type=ct, object_id=instance.pk).delete()


def connect_gfk_cleanup_signals():
    for model in GFK_REFERENCED_MODELS:
        pre_delete.connect(_cleanup_generic_relations, sender=model, weak=False)
