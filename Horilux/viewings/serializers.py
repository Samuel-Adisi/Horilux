from rest_framework import serializers

from .models import Viewing, FollowUp


class ViewingSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True)
    property_location = serializers.CharField(source="property.location", read_only=True)
    property_image_url = serializers.SerializerMethodField()
    agent_name = serializers.SerializerMethodField()

    class Meta:
        model = Viewing
        fields = [
            "id", "client", "client_name", "property", "property_title", "property_location",
            "property_image_url", "agent", "agent_name", "date", "time",
            "status", "notes", "outcome", "next_action", "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def get_agent_name(self, obj):
        if not obj.agent:
            return None
        return f"{obj.agent.first_name} {obj.agent.last_name}".strip() or obj.agent.email

    def get_property_image_url(self, obj):
        first_photo = obj.property.media.filter(media_type="photo").order_by("order").first()
        if not first_photo or not first_photo.file:
            return None
        request = self.context.get("request")
        url = first_photo.file.url
        return request.build_absolute_uri(url) if request else url


class FollowUpSerializer(serializers.ModelSerializer):
    # Display names so lists don't need a lookup per row.
    lead_name = serializers.CharField(source="lead.name", read_only=True, default=None)
    client_name = serializers.CharField(source="client.name", read_only=True, default=None)
    property_title = serializers.CharField(source="viewing.property.title", read_only=True, default=None)
    responsible_agent_name = serializers.SerializerMethodField()

    class Meta:
        model = FollowUp
        fields = [
            "id", "viewing", "lead", "lead_name", "client", "client_name", "property_title",
            "due_date", "completed", "notes", "responsible_agent", "responsible_agent_name",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_responsible_agent_name(self, obj):
        agent = obj.responsible_agent
        if not agent:
            return None
        return f"{agent.first_name} {agent.last_name}".strip() or agent.email
