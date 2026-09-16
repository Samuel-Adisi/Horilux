from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.models import Notification
from notifications.serializers import NotificationSerializer


class NotificationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["read", "type"]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by("-created_at")

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if not notification.read:
            notification.read = True
            notification.save(update_fields=["read"])
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(read=False).update(read=True)
        return Response({"marked_read": updated})

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        return Response({"unread_count": self.get_queryset().filter(read=False).count()})


class NotificationPreferenceViewSet(mixins.ListModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    from notifications.models import NotificationPreference
    from notifications.serializers import NotificationPreferenceSerializer
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from notifications.models import NotificationPreference
        user = self.request.user
        existing_types = set(
            NotificationPreference.objects.filter(user=user).values_list("event_type", flat=True)
        )
        missing = [et for et, _ in NotificationPreference.EventType.choices if et not in existing_types]
        if missing:
            NotificationPreference.objects.bulk_create(
                [NotificationPreference(user=user, event_type=et, enabled=True) for et in missing]
            )
        return NotificationPreference.objects.filter(user=user).order_by("event_type")
