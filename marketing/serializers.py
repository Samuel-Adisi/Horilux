from rest_framework import serializers

from .models import MarketingCampaign, CampaignPerformance


class CampaignPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignPerformance
        fields = ["id", "campaign", "views", "enquiries", "leads_generated", "viewings_booked", "conversions", "recorded_at"]
        read_only_fields = ["id", "recorded_at"]


class MarketingCampaignSerializer(serializers.ModelSerializer):
    performance_records = CampaignPerformanceSerializer(many=True, read_only=True)

    class Meta:
        model = MarketingCampaign
        fields = [
            "id", "property", "status", "content", "scheduled_date",
            "published_date", "created_by", "created_at", "performance_records",
        ]
        read_only_fields = ["id", "status", "published_date", "created_by", "created_at"]
