from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from accounts.models import User
from accounts.permissions import RBACPermission, filter_queryset_for_user

from .models import Lead, Client
from .serializers import LeadSerializer, ClientSerializer


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "lead"
    rbac_action_map = {
        "list": "view", "retrieve": "view", "create": "create",
        "update": "edit", "partial_update": "edit", "destroy": "delete",
        "assign": "assign", "qualify": "edit", "convert_to_client": "edit",
    }

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "lead", Lead.objects.all(), agent_field="assigned_agent"
        )

    def perform_create(self, serializer):
        # Website enquiries and manual entries both land here; default status is 'new'.
        serializer.save(status=Lead.Status.NEW)

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        lead = self.get_object()
        agent_id = request.data.get("agent_id")
        if not agent_id:
            raise ValidationError("agent_id is required.")
        try:
            agent = User.objects.get(id=agent_id)
        except User.DoesNotExist:
            raise ValidationError("No such user.")

        lead.assigned_agent = agent
        if lead.status == Lead.Status.NEW:
            lead.status = Lead.Status.CONTACTED
        lead.save(update_fields=["assigned_agent", "status"])
        return Response(LeadSerializer(lead).data)

    @action(detail=True, methods=["post"])
    def qualify(self, request, pk=None):
        lead = self.get_object()
        if lead.status not in [Lead.Status.NEW, Lead.Status.CONTACTED]:
            raise ValidationError(f"Cannot qualify a lead in status '{lead.status}'.")
        lead.status = Lead.Status.QUALIFIED
        lead.last_contact = timezone.now()
        lead.save(update_fields=["status", "last_contact"])
        return Response(LeadSerializer(lead).data)

    @action(detail=True, methods=["post"])
    def convert_to_client(self, request, pk=None):
        """Creates a Client from a Qualified lead. Idempotent — returns existing client if already converted."""
        lead = self.get_object()
        if hasattr(lead, "client"):
            return Response(ClientSerializer(lead.client).data)

        if lead.status not in [Lead.Status.QUALIFIED, Lead.Status.PROPERTY_MATCHED]:
            raise ValidationError(f"Cannot convert a lead in status '{lead.status}' to a client.")

        client = Client.objects.create(
            lead=lead,
            name=lead.name,
            phone=lead.phone,
            email=lead.email,
            budget=lead.budget,
            assigned_agent=lead.assigned_agent,
        )
        return Response(ClientSerializer(client).data, status=201)


class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "client"

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "client", Client.objects.all(), agent_field="assigned_agent"
        )
