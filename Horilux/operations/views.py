from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import RBACPermission, filter_queryset_for_user
from notifications.tasks import create_notification

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """
    Schedule Exec Briefing (CEO Overview page) and any future task use
    create real Task rows here, notifying the assigned owner via the
    existing notification pipeline.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, RBACPermission]
    rbac_resource = "task"
    filter_backends = [filters.SearchFilter]
    search_fields = ["title"]

    def get_queryset(self):
        # CEO/Operations hold task:view at company scope (all tasks); every
        # other role holds it at "own" scope, i.e. task.owner == user.
        qs = filter_queryset_for_user(
            self.request.user, "view", "task", Task.objects.select_related("owner"), agent_field="owner",
        )
        params = self.request.query_params
        status_filter = params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if (params.get("mine") or "").lower() in ("true", "1", "yes"):
            qs = qs.filter(owner=self.request.user)
        return qs.order_by("due_date", "-created_at")

    def perform_create(self, serializer):
        task = serializer.save()
        due_str = f" (due {task.due_date})" if task.due_date else ""
        create_notification(
            recipient=task.owner,
            type_="task.assigned",
            message=f'New task scheduled: "{task.title}"{due_str}',
            related_obj=task,
        )
