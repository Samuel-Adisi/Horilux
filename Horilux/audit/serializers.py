from rest_framework import serializers

from accounts.developer import is_developer

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

    def to_representation(self, obj):
        data = super().to_representation(obj)
        request = self.context.get('request')
        if request is not None and is_developer(request.user):
            old = obj.old_value if isinstance(obj.old_value, dict) else {}
            new = obj.new_value if isinstance(obj.new_value, dict) else {}
            data['changed_fields'] = sorted(set(old) | set(new))
            data['old_value'] = None
            data['new_value'] = None
        return data

    def get_actor_name(self, obj):
        if not obj.actor_id:
            return "System"
        return f"{obj.actor.first_name} {obj.actor.last_name}".strip() or obj.actor.email
