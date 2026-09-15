from rest_framework import viewsets

from accounts.permissions import RBACPermission

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only — audit records are written exclusively via signals, never through the API."""
    serializer_class = AuditLogSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "audit_log"
    rbac_action_map = {"list": "view", "retrieve": "view"}

    def get_queryset(self):
        qs = AuditLog.objects.select_related("actor").all()

        model_name = self.request.query_params.get("model_name")
        if model_name:
            qs = qs.filter(model_name=model_name)

        action = self.request.query_params.get("action")
        if action:
            qs = qs.filter(action=action)

        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(object_id__icontains=search) | Q(actor__first_name__icontains=search) | Q(actor__last_name__icontains=search))

        return qs
