from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import render
from .models import User, Department, Role
from .serializers import UserSerializer, UserListItemSerializer, StaffWriteSerializer, DepartmentSerializer, RoleSerializer
from .permissions import RBACPermission

# Create your views here.


class MeView(generics.RetrieveAPIView):
    """Return the currently authenticated user. No RBAC gate — identity only."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """Lightweight list of active users for agent-picker UI (e.g. Lead.assign).
    Identity data only, no pagination, no RBAC gate — any authenticated user
    can see who else is on the team."""
    serializer_class = UserListItemSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    queryset = User.objects.filter(is_active=True).order_by("first_name", "last_name")


class StaffViewSet(viewsets.ModelViewSet):
    """
    Full staff CRUD for the CEO Staff Directory page.
    Gated on user_management -- matches the same resource/scope already
    granted to CEO and Operations in the seeded RBAC matrix. "Delete" is
    a soft delete (is_active=False): agent/assigned_agent FKs use
    SET_NULL, so a hard delete wouldn't crash, but it would silently wipe
    who-closed-what off real transaction/lead history, which is a real
    business-data loss for a brokerage. No invite/email flow exists yet,
    so create takes an admin-set temporary password directly.
    """
    permission_classes = [RBACPermission]
    rbac_resource = "user_management"
    rbac_action_map = {
        "list": "view", "retrieve": "view", "create": "create",
        "update": "edit", "partial_update": "edit", "destroy": "delete",
        "deactivate": "delete", "reactivate": "edit",
    }
    queryset = User.objects.all().select_related("department").prefetch_related("user_roles__role")
    pagination_class = None

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return StaffWriteSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        # Soft delete only -- see class docstring.
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def reactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response(UserSerializer(user).data)


class DepartmentListView(generics.ListAPIView):
    """Read-only department list for staff-form dropdowns. No RBAC gate --
    department names are not sensitive, same reasoning as UserListView."""
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    queryset = Department.objects.all().order_by("name")


class RoleListView(generics.ListAPIView):
    """Read-only role list for staff-form dropdowns."""
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    queryset = Role.objects.all().order_by("name")

