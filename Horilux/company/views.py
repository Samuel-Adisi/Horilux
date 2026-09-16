from rest_framework import generics, viewsets, mixins
from rest_framework.exceptions import PermissionDenied
from accounts.permissions import RBACPermission, has_permission
from .models import CompanyProfile, IntegrationStatus
from .serializers import CompanyProfileSerializer, IntegrationStatusSerializer

METHOD_TO_ACTION = {"GET": "view", "PUT": "edit", "PATCH": "edit"}


class CompanyProfileView(generics.RetrieveUpdateAPIView):
    """
    Singleton — GET returns the one profile, PATCH/PUT updates it.
    Not a ViewSet, so RBACPermission's view.action resolution doesn't
    apply here — permission is checked explicitly per HTTP method instead.
    """
    serializer_class = CompanyProfileSerializer

    def get_object(self):
        action = METHOD_TO_ACTION.get(self.request.method)
        if not action or not has_permission(self.request.user, action, "company_settings"):
            raise PermissionDenied("You do not have permission to access company settings.")
        return CompanyProfile.get_solo()

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class IntegrationStatusViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Read-only — status is set by backend health-checks, not user edits."""
    queryset = IntegrationStatus.objects.all().order_by("provider")
    serializer_class = IntegrationStatusSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "company_settings"
    rbac_action_map = {"list": "view"}
