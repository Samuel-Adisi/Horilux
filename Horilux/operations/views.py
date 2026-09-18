from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import RBACPermission
from notifications.tasks import create_notification

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """
    Schedule Exec Briefing (CEO Overview page) and any future task use
    create real Task rows here, notifying the assigned owner via the
    existing notification pipeline.
    """
    queryset = Task.objects.select_related("owner").order_by("due_date", "-created_at")
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, RBACPermission]
    rbac_resource = "task"
    filter_backends = [filters.SearchFilter]
    search_fields = ["title"]

    def perform_create(self, serializer):
        task = serializer.save()
        due_str = f" (due {task.due_date})" if task.due_date else ""
        create_notification(
            recipient=task.owner,
            type_="task.assigned",
            message=f'New task scheduled: "{task.title}"{due_str}',
            related_obj=task,
        )
