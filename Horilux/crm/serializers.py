from rest_framework import serializers

from .models import Lead, Client


class LeadSerializer(serializers.ModelSerializer):
    assigned_agent_name = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id", "name", "phone", "email", "source", "budget", "currency",
            "location_preference", "property_type_preference", "bedrooms_preference",
            "purpose", "assigned_agent", "assigned_agent_name", "status", "status_label",
            "last_contact", "next_follow_up", "notes", "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def get_assigned_agent_name(self, obj):
        if not obj.assigned_agent_id:
            return None
        return f"{obj.assigned_agent.first_name} {obj.assigned_agent.last_name}".strip() or obj.assigned_agent.username


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            "id", "lead", "name", "phone", "email", "preferences", "budget",
            "assigned_agent", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
