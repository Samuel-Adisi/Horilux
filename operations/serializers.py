from rest_framework import serializers
from operations.models import Task


class TaskSerializer(serializers.ModelSerializer):
    owner_email = serializers.CharField(source="owner.email", read_only=True, default=None)
    related_model = serializers.CharField(source="content_type.model", read_only=True, default=None)

    class Meta:
        model = Task
        fields = [
            "id", "title", "owner", "owner_email", "status",
            "due_date", "created_at", "related_model", "object_id",
        ]
        read_only_fields = ["id", "created_at", "content_type", "object_id"]
