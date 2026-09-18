from rest_framework import serializers

from .models import MarketingCampaign, CampaignPerformance


class CampaignPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignPerformance
        fields = ["id", "campaign", "views", "enquiries", "leads_generated", "viewings_booked", "conversions", "recorded_at"]
        read_only_fields = ["id", "recorded_at"]


class MarketingCampaignSerializer(serializers.ModelSerializer):
    performance_records = serializers.SerializerMethodField()
    property_title = serializers.CharField(source="property.title", read_only=True, default=None)
    created_by_name = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = MarketingCampaign
        fields = [
            "id", "property", "property_title", "status", "status_label", "content", "scheduled_date",
            "published_date", "created_by", "created_by_name", "created_at", "performance_records",
        ]
        read_only_fields = ["id", "status", "published_date", "created_by", "created_at"]

    def get_created_by_name(self, obj):
        user = obj.created_by
        if user is None:
            return None
        return f"{user.first_name} {user.last_name}".strip() or user.email

    def get_performance_records(self, obj):
        return CampaignPerformanceSerializer(obj.performance_records.order_by("-recorded_at"), many=True).data
