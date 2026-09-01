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
