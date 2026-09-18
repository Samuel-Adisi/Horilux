from django.utils.dateparse import parse_date
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from accounts.permissions import RBACPermission, filter_queryset_for_user

from .models import Viewing, FollowUp
from .serializers import ViewingSerializer, FollowUpSerializer


def _parse_date_param(params, name):
    raw = params.get(name)
    if not raw:
        return None
    try:
        value = parse_date(raw)
    except ValueError:
        value = None
    if value is None:
        raise ValidationError(f"{name} must be a date in YYYY-MM-DD format.")
    return value


class ViewingViewSet(viewsets.ModelViewSet):
    serializer_class = ViewingSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "viewing"
    rbac_action_map = {
        "list": "view", "retrieve": "view", "create": "create",
        "update": "edit", "partial_update": "edit", "destroy": "delete",
        "confirm": "edit", "complete": "edit", "cancel": "edit",
    }

    def get_queryset(self):
        qs = filter_queryset_for_user(
            self.request.user, "view", "viewing", Viewing.objects.all(), agent_field="agent"
        ).select_related("client", "property", "agent")

        params = self.request.query_params
        status_filter = params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        date_from = _parse_date_param(params, "date_from")
        if date_from:
            qs = qs.filter(date__gte=date_from)
        date_to = _parse_date_param(params, "date_to")
        if date_to:
            qs = qs.filter(date__lte=date_to)

        return qs.order_by("-date", "-time")

    def perform_create(self, serializer):
        # Default agent to the creating user if not explicitly set -- otherwise
        # a newly created viewing is invisible to its own creator under the
        # "assigned" RBAC scope (same bug class fixed on Lead creation in Phase 9).
        agent = serializer.validated_data.get("agent") or self.request.user
        serializer.save(status=Viewing.Status.SCHEDULED, agent=agent)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        viewing = self.get_object()
        if viewing.status != Viewing.Status.SCHEDULED:
            raise ValidationError(f"Cannot confirm a viewing in status '{viewing.status}'.")
        viewing.status = Viewing.Status.CONFIRMED
        viewing.save(update_fields=["status"])
        return Response(ViewingSerializer(viewing).data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """Records outcome (Hot/Warm/Cold) and next action — required per spec on completion."""
        viewing = self.get_object()
        outcome = request.data.get("outcome")
        next_action = request.data.get("next_action", "")

        follow_up_due_date = request.data.get("follow_up_due_date")

        if viewing.status not in [Viewing.Status.SCHEDULED, Viewing.Status.CONFIRMED]:
            raise ValidationError(f"Cannot complete a viewing in status '{viewing.status}'.")
        if outcome not in dict(Viewing.Outcome.choices):
            raise ValidationError("outcome must be one of: hot, warm, cold.")
        if outcome in (Viewing.Outcome.WARM, Viewing.Outcome.COLD) and not follow_up_due_date:
            raise ValidationError(
                "follow_up_due_date is required when outcome is 'warm' or 'cold'."
            )

        viewing.status = Viewing.Status.COMPLETED
        viewing.outcome = outcome
        viewing.next_action = next_action
        viewing.save(update_fields=["status", "outcome", "next_action"])

        if follow_up_due_date:
            FollowUp.objects.create(
                viewing=viewing,
                client=viewing.client,
                due_date=follow_up_due_date,
                notes=next_action,
                responsible_agent=viewing.agent,
            )

        return Response(ViewingSerializer(viewing).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        viewing = self.get_object()
        if viewing.status in (Viewing.Status.COMPLETED, Viewing.Status.CANCELLED, Viewing.Status.NO_SHOW):
            raise ValidationError(f"Cannot cancel a viewing in status '{viewing.status}'.")
        reason = request.data.get("reason", "")
        no_show = request.data.get("no_show", False)
        if isinstance(no_show, str):
            no_show = no_show.strip().lower() in ("true", "1", "yes")
        viewing.status = Viewing.Status.NO_SHOW if no_show else Viewing.Status.CANCELLED
        if reason:
            viewing.notes = f"{viewing.notes}\n{reason}".strip()
        viewing.save(update_fields=["status", "notes"])
        return Response(ViewingSerializer(viewing).data)


class FollowUpViewSet(viewsets.ModelViewSet):
    serializer_class = FollowUpSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "followup"
    rbac_action_map = {
        "list": "view", "retrieve": "view", "create": "create",
        "update": "edit", "partial_update": "edit", "destroy": "delete",
        "mark_complete": "edit",
    }

    def get_queryset(self):
        qs = filter_queryset_for_user(
            self.request.user, "view", "followup",
            FollowUp.objects.select_related("lead", "client", "viewing__property", "responsible_agent"),
            agent_field="responsible_agent"
        )
        completed = (self.request.query_params.get("completed") or "").lower()
        if completed in ("true", "1", "yes"):
            qs = qs.filter(completed=True)
        elif completed in ("false", "0", "no"):
            qs = qs.filter(completed=False)
        return qs.order_by("due_date", "-created_at")

    def perform_create(self, serializer):
        serializer.save(
            responsible_agent=serializer.validated_data.get("responsible_agent") or self.request.user
        )

    @action(detail=True, methods=["post"])
    def mark_complete(self, request, pk=None):
        follow_up = self.get_object()
        follow_up.completed = True
        follow_up.save(update_fields=["completed"])
        return Response(FollowUpSerializer(follow_up).data)
