from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from operations.models import Task
from operations.serializers import TaskSerializer
from accounts.permissions import RBACPermission, filter_queryset_for_user


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, RBACPermission]
    rbac_resource = "task"
    rbac_action_map = {
        "list": "view", "retrieve": "view",
        "create": "edit", "update": "edit", "partial_update": "edit",
        "destroy": "edit", "complete": "edit", "overdue": "view",
    }

    def get_queryset(self):
        qs = Task.objects.select_related("owner", "content_type").order_by("-created_at")
        return filter_queryset_for_user(self.request.user, "view", "task", qs, agent_field="owner")

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = Task.Status.DONE
        task.save(update_fields=["status"])
        return Response(self.get_serializer(task).data)

    @action(detail=False, methods=["get"])
    def overdue(self, request):
        qs = self.get_queryset().filter(
            due_date__lt=timezone.now().date()
        ).exclude(status=Task.Status.DONE)
        return Response(self.get_serializer(qs, many=True).data)
