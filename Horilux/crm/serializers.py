from rest_framework import serializers

from .models import Lead, Client


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            "id", "name", "phone", "email", "source", "budget", "currency",
            "location_preference", "property_type_preference", "bedrooms_preference",
            "purpose", "assigned_agent", "status", "last_contact", "next_follow_up",
            "notes", "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            "id", "lead", "name", "phone", "email", "preferences", "budget",
            "assigned_agent", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
