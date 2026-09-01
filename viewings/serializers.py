from rest_framework import serializers

from .models import Viewing, FollowUp


class ViewingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Viewing
        fields = [
            "id", "client", "property", "agent", "date", "time",
            "status", "notes", "outcome", "next_action", "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]


class FollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUp
        fields = [
            "id", "viewing", "lead", "client", "due_date", "completed",
            "notes", "responsible_agent", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
