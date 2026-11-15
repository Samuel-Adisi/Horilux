from contextlib import contextmanager

from django.core.exceptions import PermissionDenied
from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver

from .developer import DEVELOPER_ROLE
from .models import User, UserRole

_guard = {"on": True}


@contextmanager
def developer_guard_off():
    """Explicit shell-only escape hatch: with developer_guard_off(): ..."""
    _guard["on"] = False
    try:
        yield
    finally:
        _guard["on"] = True


def _is_dev(user):
    return bool(user.pk) and UserRole.objects.filter(user_id=user.pk, role__name=DEVELOPER_ROLE).exists()


@receiver(pre_delete, sender=User)
def protect_developer_delete(sender, instance, **kwargs):
    if _guard["on"] and _is_dev(instance):
        raise PermissionDenied("The Developer account cannot be deleted.")


@receiver(pre_save, sender=User)
def protect_developer_active(sender, instance, **kwargs):
    if _guard["on"] and not instance.is_active and _is_dev(instance):
        raise PermissionDenied("The Developer account cannot be deactivated.")


@receiver(pre_delete, sender=UserRole)
def protect_developer_role(sender, instance, **kwargs):
    if _guard["on"] and instance.role.name == DEVELOPER_ROLE:
        raise PermissionDenied("The Developer role cannot be removed.")
