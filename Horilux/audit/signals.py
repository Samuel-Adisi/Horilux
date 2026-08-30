"""
Wires generic audit logging onto the key business models identified in
the ERD/spec as needing an audit trail: Property, Transaction, Commission,
Lead, MarketingCampaign, and CommissionRule (company-policy data).

Uses pre_save + post_save pairs to capture old_value/new_value diffs.
Actor attribution: pulled from a thread-local set by AuditActorMiddleware
(see audit/middleware.py) since signals don\'t have direct access to the
request. Falls back to None (system-triggered change) if no request context.
"""
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

from audit.utils import log_audit_event, _serializable_snapshot
from audit.middleware import get_current_user

from properties.models import Property
from transactions.models import Transaction, Commission, CommissionRule
from crm.models import Lead
from marketing.models import MarketingCampaign

AUDITED_MODELS = [Property, Transaction, Commission, CommissionRule, Lead, MarketingCampaign]


def _stash_old_snapshot(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._audit_old_snapshot = _serializable_snapshot(old_instance)
        except sender.DoesNotExist:
            instance._audit_old_snapshot = None
    else:
        instance._audit_old_snapshot = None


def _log_save(sender, instance, created, **kwargs):
    action = "create" if created else "update"
    old_snapshot = None if created else getattr(instance, "_audit_old_snapshot", None)
    log_audit_event(get_current_user(), action, instance, old_snapshot=old_snapshot)


def _log_delete(sender, instance, **kwargs):
    log_audit_event(get_current_user(), "delete", instance, old_snapshot=_serializable_snapshot(instance))


for model in AUDITED_MODELS:
    pre_save.connect(_stash_old_snapshot, sender=model, weak=False)
    post_save.connect(_log_save, sender=model, weak=False)
    post_delete.connect(_log_delete, sender=model, weak=False)
