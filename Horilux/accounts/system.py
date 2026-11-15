import os
import sys
import time

import django
from django.apps import apps
from django.conf import settings
from django.core.cache import cache
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.utils import timezone
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from .developer import is_developer
from .rbac_matrix import RBAC_MATRIX

PROJECT_APPS = [
    "accounts", "audit", "crm", "marketing", "notifications", "operations",
    "properties", "reporting", "transactions", "viewings", "workflow",
    "core", "company", "public",
]


class IsDeveloper(BasePermission):
    def has_permission(self, request, view):
        return is_developer(request.user)


def _database():
    start = time.perf_counter()
    with connection.cursor() as cur:
        cur.execute("SELECT 1")
    ms = round((time.perf_counter() - start) * 1000, 1)
    db = settings.DATABASES["default"]
    return {"vendor": connection.vendor, "host": db.get("HOST"), "latency_ms": ms}


def _migrations():
    executor = MigrationExecutor(connection)
    plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
    return {
        "applied": len(executor.loader.applied_migrations),
        "pending": [m.app_label + "." + m.name for m, _ in plan],
    }


def _cache():
    backend = settings.CACHES["default"]["BACKEND"]
    try:
        cache.set("system_probe", "ok", 10)
        return {"backend": backend, "ok": cache.get("system_probe") == "ok"}
    except Exception as exc:
        return {"backend": backend, "ok": False, "error": exc.__class__.__name__}


def _celery():
    try:
        from celery import current_app
        ping = current_app.control.inspect(timeout=1.0).ping() or {}
        return {"online": bool(ping), "workers": sorted(ping.keys())}
    except Exception as exc:
        return {"online": False, "workers": [], "error": exc.__class__.__name__}


def _counts():
    out = {}
    for label in PROJECT_APPS:
        try:
            config = apps.get_app_config(label)
        except LookupError:
            continue
        for model in config.get_models():
            key = label + "." + model.__name__
            try:
                out[key] = model._default_manager.count()
            except Exception:
                out[key] = None
    return out


def _matrix():
    return {
        role: {res: sorted(acts) for res, acts in grants.items()}
        for role, grants in RBAC_MATRIX.items()
    }


class SystemStatusView(APIView):
    """Developer-only. Health, versions and row counts. Never returns business records."""
    permission_classes = [IsDeveloper]

    def get(self, request):
        return Response({
            "time": timezone.now().isoformat(),
            "app": {
                "python": sys.version.split()[0],
                "django": django.get_version(),
                "debug": settings.DEBUG,
                "commit": os.environ.get("GIT_COMMIT"),
            },
            "database": _database(),
            "migrations": _migrations(),
            "cache": _cache(),
            "celery": _celery(),
            "row_counts": _counts(),
            "rbac_matrix": _matrix(),
        })
