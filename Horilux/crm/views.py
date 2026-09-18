from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from accounts.models import User
from accounts.permissions import RBACPermission, filter_queryset_for_user

from .models import Lead, Client, Interaction
from .serializers import LeadSerializer, ClientSerializer, InteractionSerializer


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "lead"
    rbac_action_map = {
        "list": "view", "retrieve": "view", "create": "create",
        "update": "edit", "partial_update": "edit", "destroy": "delete",
        "assign": "assign", "qualify": "edit", "convert_to_client": "edit",
        "transition": "edit",
    }

    # Allowed manual status moves via POST leads/{id}/transition/.
    OPEN_STATUSES = (
        Lead.Status.NEW, Lead.Status.CONTACTED, Lead.Status.QUALIFIED,
        Lead.Status.PROPERTY_MATCHED, Lead.Status.VIEWING, Lead.Status.NEGOTIATION,
    )
    TRANSITIONS = {
        Lead.Status.NEW: {Lead.Status.CONTACTED},
        Lead.Status.CONTACTED: {Lead.Status.QUALIFIED},
        Lead.Status.QUALIFIED: {Lead.Status.PROPERTY_MATCHED},
        Lead.Status.PROPERTY_MATCHED: {Lead.Status.VIEWING},
        Lead.Status.VIEWING: {Lead.Status.NEGOTIATION},
        Lead.Status.NEGOTIATION: {Lead.Status.CLOSED},
        Lead.Status.LOST: {Lead.Status.CONTACTED},  # reopen
    }

    filterset_fields = ["status"]

    def get_queryset(self):
        qs = filter_queryset_for_user(
            self.request.user, "view", "lead", Lead.objects.all(), agent_field="assigned_agent"
        ).select_related("assigned_agent")

        unassigned = (self.request.query_params.get("unassigned") or "").lower()
        if unassigned in ("true", "1", "yes"):
            qs = qs.filter(assigned_agent__isnull=True)
        elif unassigned in ("false", "0", "no"):
            qs = qs.filter(assigned_agent__isnull=False)

        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(location_preference__icontains=search)
                | Q(phone__icontains=search)
                | Q(email__icontains=search)
            )

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        # Website enquiries and manual entries both land here; default status is 'new'.
        # Default assigned_agent to the creating Sales user if not explicitly set --
        # otherwise a newly created lead is invisible to its own creator under
        # "assigned" scope (filter_queryset_for_user filters on assigned_agent).
        assigned_agent = serializer.validated_data.get("assigned_agent") or self.request.user
        serializer.save(status=Lead.Status.NEW, assigned_agent=assigned_agent)

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
    def transition(self, request, pk=None):
        """Move a lead along the pipeline. Body: {"status": "<target>"}."""
        lead = self.get_object()
        target = request.data.get("status")
        if not target:
            raise ValidationError("status is required.")
        if target not in Lead.Status.values:
            raise ValidationError(f"Unknown lead status '{target}'.")

        allowed = set(self.TRANSITIONS.get(lead.status, set()))
        if lead.status in self.OPEN_STATUSES:
            allowed.add(Lead.Status.LOST)
        if target not in allowed:
            raise ValidationError(f"Cannot move a lead from '{lead.status}' to '{target}'.")

        lead.status = target
        update_fields = ["status"]
        if target == Lead.Status.CONTACTED:
            lead.last_contact = timezone.now()
            update_fields.append("last_contact")
        lead.save(update_fields=update_fields)
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
        qs = filter_queryset_for_user(
            self.request.user, "view", "client", Client.objects.all(), agent_field="assigned_agent"
        )

        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(name__icontains=search) | Q(email__icontains=search) | Q(phone__icontains=search))

        return qs.select_related("assigned_agent").order_by("-created_at")

    def perform_create(self, serializer):
        # Default to the creator so Sales (assigned scope) can see what they create.
        serializer.save(assigned_agent=serializer.validated_data.get("assigned_agent") or self.request.user)


class InteractionViewSet(viewsets.ModelViewSet):
    serializer_class = InteractionSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "interaction"

    def get_queryset(self):
        qs = filter_queryset_for_user(
            self.request.user, "view", "interaction", Interaction.objects.all(), agent_field="agent"
        ).select_related("lead", "client", "agent")

        lead_id = self.request.query_params.get("lead")
        if lead_id:
            qs = qs.filter(lead_id=lead_id)

        client_id = self.request.query_params.get("client")
        if client_id:
            qs = qs.filter(client_id=client_id)

        type_filter = self.request.query_params.get("type")
        if type_filter:
            qs = qs.filter(type=type_filter)

        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(summary__icontains=search)
                | Q(lead__name__icontains=search)
                | Q(client__name__icontains=search)
            )

        return qs

    def perform_create(self, serializer):
        serializer.save(agent=serializer.validated_data.get("agent") or self.request.user)


from django.db.models import Count, Q as DjangoQ


class LeadSourceStatsViewSet(viewsets.ViewSet):
    """Read-only aggregation: lead volume + conversion rate per source. Real data only, no spend/ROAS."""
    permission_classes = [RBACPermission]
    rbac_resource = "lead_source_stats"

    def list(self, request):
        # Normalize casing/whitespace so "Referral" and "referral" merge into one row,
        # while keeping a readable display label (first-seen original casing per group).
        raw_leads = Lead.objects.values("id", "source", "status", "client__id")
        groups = {}
        for row in raw_leads:
            raw_source = (row["source"] or "").strip()
            key = raw_source.lower() or "unknown"
            display = raw_source or "Unknown"

            g = groups.setdefault(key, {
                "source": display,
                "total_leads": 0,
                "converted": 0,
                "lost": 0,
                "qualified": 0,
            })
            g["total_leads"] += 1
            if row["status"] == Lead.Status.CLOSED or row["client__id"] is not None:
                g["converted"] += 1
            if row["status"] == Lead.Status.LOST:
                g["lost"] += 1
            if row["status"] == Lead.Status.QUALIFIED:
                g["qualified"] += 1

        results = []
        for g in groups.values():
            total = g["total_leads"]
            converted = g["converted"]
            results.append({
                **g,
                "conversion_rate": round((converted / total) * 100, 1) if total else 0,
            })
        results.sort(key=lambda r: r["total_leads"], reverse=True)
        return Response({"results": results})
