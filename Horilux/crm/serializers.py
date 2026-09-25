from rest_framework import serializers

from .models import Lead, Client, Interaction


class LeadSerializer(serializers.ModelSerializer):
    assigned_agent_name = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    property_interest_title = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            "id", "name", "phone", "email", "source", "budget", "currency",
            "location_preference", "property_type_preference", "bedrooms_preference",
            "purpose", "property_interest", "property_interest_title",
            "assigned_agent", "assigned_agent_name", "status", "status_label",
            "last_contact", "next_follow_up", "notes", "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def get_assigned_agent_name(self, obj):
        if not obj.assigned_agent_id:
            return None
        return f"{obj.assigned_agent.first_name} {obj.assigned_agent.last_name}".strip() or obj.assigned_agent.email

    def get_property_interest_title(self, obj):
        return obj.property_interest.title if obj.property_interest_id else None


class ClientSerializer(serializers.ModelSerializer):
    assigned_agent_name = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id", "lead", "name", "phone", "email", "preferences", "budget",
            "assigned_agent", "assigned_agent_name", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_assigned_agent_name(self, obj):
        if not obj.assigned_agent_id:
            return None
        return f"{obj.assigned_agent.first_name} {obj.assigned_agent.last_name}".strip() or obj.assigned_agent.email


class InteractionSerializer(serializers.ModelSerializer):
    agent_name = serializers.SerializerMethodField()
    lead_name = serializers.CharField(source="lead.name", read_only=True, default=None)
    client_name = serializers.CharField(source="client.name", read_only=True, default=None)
    type_label = serializers.CharField(source="get_type_display", read_only=True)
    direction_label = serializers.CharField(source="get_direction_display", read_only=True)

    class Meta:
        model = Interaction
        fields = [
            "id", "lead", "lead_name", "client", "client_name", "agent", "agent_name",
            "type", "type_label", "direction", "direction_label",
            "summary", "notes", "occurred_at", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_agent_name(self, obj):
        if not obj.agent_id:
            return None
        return f"{obj.agent.first_name} {obj.agent.last_name}".strip() or obj.agent.email

    def validate(self, attrs):
        lead = attrs.get("lead", getattr(self.instance, "lead", None))
        client = attrs.get("client", getattr(self.instance, "client", None))
        if not lead and not client:
            raise serializers.ValidationError("An interaction must be linked to a lead or a client.")
        return attrs
