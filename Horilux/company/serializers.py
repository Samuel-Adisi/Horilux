from rest_framework import serializers
from .models import CompanyProfile, IntegrationStatus


class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = [
            "id", "name", "logo", "registered_address", "contact_email",
            "contact_phone", "license_number", "default_currency", "timezone",
            "theme_primary_color", "theme_secondary_color", "theme_accent_color",
            "updated_at", "updated_by",
        ]
        read_only_fields = ["id", "updated_at", "updated_by"]


class IntegrationStatusSerializer(serializers.ModelSerializer):
    provider_display = serializers.CharField(source="get_provider_display", read_only=True)

    class Meta:
        model = IntegrationStatus
        fields = ["id", "provider", "provider_display", "configured", "last_checked_at", "last_check_ok", "notes"]
        read_only_fields = ["id", "provider", "provider_display"]
