from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id", "actor", "actor_name", "action", "model_name", "object_id",
            "old_value", "new_value", "timestamp",
        ]
        read_only_fields = fields

    def get_actor_name(self, obj):
        if not obj.actor_id:
            return "System"
        return f"{obj.actor.first_name} {obj.actor.last_name}".strip() or obj.actor.email
