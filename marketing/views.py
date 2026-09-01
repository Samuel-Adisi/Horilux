from audit.mixins import AuditActorMixin
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from accounts.permissions import RBACPermission, filter_queryset_for_user
from properties.models import Property

from .models import MarketingCampaign, CampaignPerformance
from .serializers import MarketingCampaignSerializer, CampaignPerformanceSerializer

APPROVED_PROPERTY_STATUSES = {Property.Status.MARKETING_READY, Property.Status.PUBLISHED}


class MarketingCampaignViewSet(AuditActorMixin, viewsets.ModelViewSet):
    serializer_class = MarketingCampaignSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "marketing_campaign"
    rbac_action_map = {
        "list": "view", "retrieve": "view", "create": "create",
        "update": "edit", "partial_update": "edit", "destroy": "delete",
        "submit_for_review": "edit", "schedule": "edit", "publish": "publish",
    }

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "marketing_campaign", MarketingCampaign.objects.all(),
            agent_field="created_by",
        )

    def perform_create(self, serializer):
        prop = serializer.validated_data.get("property")
        if prop.status not in APPROVED_PROPERTY_STATUSES:
            raise ValidationError(
                f"Property must be approved for marketing (status: marketing_ready or published) "
                f"before a campaign can be created. Current status: \'{prop.status}\'."
            )
        serializer.save(status=MarketingCampaign.Status.DRAFT, created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def submit_for_review(self, request, pk=None):
        campaign = self.get_object()
        if campaign.status != MarketingCampaign.Status.DRAFT:
            raise ValidationError(f"Cannot submit a campaign in status \'{campaign.status}\' for review.")
        campaign.status = MarketingCampaign.Status.IN_REVIEW
        campaign.save(update_fields=["status"])
        return Response(MarketingCampaignSerializer(campaign).data)

    @action(detail=True, methods=["post"])
    def schedule(self, request, pk=None):
        campaign = self.get_object()
        if campaign.status != MarketingCampaign.Status.IN_REVIEW:
            raise ValidationError(f"Cannot schedule a campaign in status \'{campaign.status}\'; it must be in review first.")
        scheduled_date = request.data.get("scheduled_date")
        if not scheduled_date:
            raise ValidationError("scheduled_date is required.")

        if campaign.property.status not in APPROVED_PROPERTY_STATUSES:
            raise ValidationError(
                f"Property is no longer approved for marketing (status: \'{campaign.property.status}\')."
            )

        campaign.status = MarketingCampaign.Status.SCHEDULED
        campaign.scheduled_date = scheduled_date
        campaign.save(update_fields=["status", "scheduled_date"])
        return Response(MarketingCampaignSerializer(campaign).data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        campaign = self.get_object()
        if campaign.status not in (MarketingCampaign.Status.SCHEDULED, MarketingCampaign.Status.IN_REVIEW):
            raise ValidationError(f"Cannot publish a campaign in status \'{campaign.status}\'.")

        if campaign.property.status not in APPROVED_PROPERTY_STATUSES:
            raise ValidationError(
                f"Property is no longer approved for marketing (status: \'{campaign.property.status}\')."
            )

        if campaign.scheduled_date and campaign.scheduled_date > timezone.now():
            raise ValidationError(
                f"Campaign is scheduled for {campaign.scheduled_date.isoformat()}; cannot publish early."
            )

        campaign.status = MarketingCampaign.Status.PUBLISHED
        campaign.published_date = timezone.now()
        campaign.save(update_fields=["status", "published_date"])
        return Response(MarketingCampaignSerializer(campaign).data)


class CampaignPerformanceViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignPerformanceSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "marketing_campaign"

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "marketing_campaign", CampaignPerformance.objects.all(),
            agent_field="campaign__created_by",
        )
