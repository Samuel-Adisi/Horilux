"""
Generic AuditLog writer. Called from model-level signals across apps
to record actor/action/model/object_id/old_value/new_value per change,
matching the AuditLog schema defined in audit/models.py.

Design choice: NOT using django-simple-history (installed but unused)
because it stores full historical row snapshots per model -- a different
shape than the actor/action/old-vs-new-value log the spec/ERD calls for.
This is a lighter, purpose-built writer against the actual AuditLog model.
"""
from django.contrib.auth import get_user_model
from django.forms.models import model_to_dict

from audit.models import AuditLog


# Fields to exclude from snapshots -- noisy, not meaningful for audit diffs,
# or binary/file data that shouldn\'t be duplicated into JSONField.
EXCLUDED_FIELDS = {"id", "created_at", "updated_at"}


def _serializable_snapshot(instance):
    """
    Best-effort dict snapshot of an instance's field values, safe for
    JSONField storage. Non-JSON-safe values (UUID, Decimal, date/time,
    FK objects) are stringified.
    """
    raw = model_to_dict(instance)
    snapshot = {}
    for key, value in raw.items():
        if key in EXCLUDED_FIELDS:
            continue
        if value is None or isinstance(value, (str, int, float, bool)):
            snapshot[key] = value
        elif isinstance(value, list):
            snapshot[key] = [str(v) for v in value]
        else:
            snapshot[key] = str(value)
    return snapshot


def log_audit_event(actor, action, instance, old_snapshot=None):
    """
    Write an AuditLog row.

    actor: the acting User, or None (e.g. system/celery-triggered changes,
           or a non-staff actor such as a public-website Customer -- the
           AuditLog.actor FK only accepts staff User instances, so anything
           else is recorded as None rather than raising)
    action: short string, e.g. "create", "update", "delete", "status_change"
    instance: the model instance being logged (its current/new state)
    old_snapshot: optional dict of the pre-change field values (pass None
                  for creates, or when the prior state wasn\'t captured)
    """
    if actor is not None and not isinstance(actor, get_user_model()):
        actor = None
    AuditLog.objects.create(
        actor=actor,
        action=action,
        model_name=instance.__class__.__name__,
        object_id=str(instance.pk),
        old_value=old_snapshot,
        new_value=_serializable_snapshot(instance),
    )
