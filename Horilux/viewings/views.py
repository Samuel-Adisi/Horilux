from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from accounts.permissions import RBACPermission, filter_queryset_for_user

from .models import Viewing, FollowUp
from .serializers import ViewingSerializer, FollowUpSerializer


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
        return filter_queryset_for_user(
            self.request.user, "view", "viewing", Viewing.objects.all(), agent_field="agent"
        )

    def perform_create(self, serializer):
        serializer.save(status=Viewing.Status.SCHEDULED)

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

        if viewing.status not in [Viewing.Status.SCHEDULED, Viewing.Status.CONFIRMED]:
            raise ValidationError(f"Cannot complete a viewing in status '{viewing.status}'.")
        if outcome not in dict(Viewing.Outcome.choices):
            raise ValidationError("outcome must be one of: hot, warm, cold.")

        viewing.status = Viewing.Status.COMPLETED
        viewing.outcome = outcome
        viewing.next_action = next_action
        viewing.save(update_fields=["status", "outcome", "next_action"])

        # Auto-create a follow-up per spec §8/§9: every completed viewing needs a next action.
        FollowUp.objects.create(
            viewing=viewing,
            client=viewing.client,
            due_date=request.data.get("follow_up_due_date"),
            notes=next_action,
            responsible_agent=viewing.agent,
        ) if request.data.get("follow_up_due_date") else None

        return Response(ViewingSerializer(viewing).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        viewing = self.get_object()
        reason = request.data.get("reason", "")
        no_show = request.data.get("no_show", False)
        viewing.status = Viewing.Status.NO_SHOW if no_show else Viewing.Status.CANCELLED
        if reason:
            viewing.notes = f"{viewing.notes}\n{reason}".strip()
        viewing.save(update_fields=["status", "notes"])
        return Response(ViewingSerializer(viewing).data)


class FollowUpViewSet(viewsets.ModelViewSet):
    serializer_class = FollowUpSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "viewing"  # follow-ups share the viewing resource's permission scope

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "viewing", FollowUp.objects.all(), agent_field="responsible_agent"
        )

    @action(detail=True, methods=["post"])
    def mark_complete(self, request, pk=None):
        follow_up = self.get_object()
        follow_up.completed = True
        follow_up.save(update_fields=["completed"])
        return Response(FollowUpSerializer(follow_up).data)
