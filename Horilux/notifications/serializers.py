from rest_framework import serializers
from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    related_model = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ["id", "type", "message", "related_model", "object_id", "read", "created_at"]
        read_only_fields = fields

    def get_related_model(self, obj):
        return obj.content_type.model if obj.content_type else None


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    event_type_display = serializers.CharField(source="get_event_type_display", read_only=True)

    class Meta:
        from notifications.models import NotificationPreference
        model = NotificationPreference
        fields = ["id", "event_type", "event_type_display", "enabled"]
        read_only_fields = ["id", "event_type_display"]
