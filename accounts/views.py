from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.models import User, Role, Department
from accounts.serializers import UserSerializer, RoleSerializer, DepartmentSerializer
from accounts.permissions import RBACPermission, filter_queryset_for_user


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, RBACPermission]
    rbac_resource = "user_management"
    rbac_action_map = {
        "list": "view", "retrieve": "view",
        "create": "create", "update": "edit", "partial_update": "edit",
        "destroy": "delete",
    }

    def get_queryset(self):
        qs = User.objects.select_related("department").prefetch_related("roles").order_by("last_name", "first_name")
        return filter_queryset_for_user(self.request.user, "view", "user_management", qs, agent_field="department")


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only: roles are seeded via seed_rbac, not created ad hoc through the API."""
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, RBACPermission]
    rbac_resource = "user_management"
    rbac_action_map = {"list": "view", "retrieve": "view"}
    queryset = Role.objects.select_related("department").order_by("name")


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, RBACPermission]
    rbac_resource = "user_management"
    rbac_action_map = {"list": "view", "retrieve": "view"}
    queryset = Department.objects.all().order_by("name")
