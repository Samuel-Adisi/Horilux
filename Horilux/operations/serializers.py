from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ["id", "title", "owner", "owner_name", "status", "due_date", "created_at"]
        read_only_fields = ["id", "created_at", "owner_name"]

    def get_owner_name(self, obj):
        if obj.owner:
            full = f"{obj.owner.first_name} {obj.owner.last_name}".strip()
            return full or obj.owner.email
        return None
