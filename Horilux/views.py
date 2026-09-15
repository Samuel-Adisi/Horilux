from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from audit.models import AuditLog
from audit.serializers import AuditLogSerializer
from accounts.permissions import RBACPermission


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only per spec: CEO + Operations view, company scope, no export listed in §1.5."""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, RBACPermission]
    rbac_resource = "audit_log"
    rbac_action_map = {"list": "view", "retrieve": "view"}
    filterset_fields = ["model_name", "action", "actor"]

    def get_queryset(self):
        qs = AuditLog.objects.select_related("actor").all()
        model_name = self.request.query_params.get("model_name")
        if model_name:
            qs = qs.filter(model_name=model_name)
        return qs
