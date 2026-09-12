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
        return f"{obj.agent.first_name} {obj.agent.last_name}".strip()

    def get_property_image_url(self, obj):
        first_photo = obj.property.media.filter(media_type="photo").order_by("order").first()
        if not first_photo or not first_photo.file:
            return None
        request = self.context.get("request")
        url = first_photo.file.url
        return request.build_absolute_uri(url) if request else url


class FollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUp
        fields = [
            "id", "viewing", "lead", "client", "due_date", "completed",
            "notes", "responsible_agent", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
