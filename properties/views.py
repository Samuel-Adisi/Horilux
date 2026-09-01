from audit.mixins import AuditActorMixin
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from accounts.permissions import RBACPermission
from accounts.permissions import filter_queryset_for_user

from .models import PropertyOwner, Property, PropertyMedia, PropertyDocument, VerificationChecklist
from .serializers import (
    PropertyOwnerSerializer,
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyMediaSerializer,
    PropertyDocumentSerializer,
    VerificationChecklistSerializer,
)


class PropertyOwnerViewSet(viewsets.ModelViewSet):
    queryset = PropertyOwner.objects.all()
    serializer_class = PropertyOwnerSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "property"  # owners are managed as part of property onboarding


class PropertyViewSet(AuditActorMixin, viewsets.ModelViewSet):
    permission_classes = [RBACPermission]
    rbac_resource = "property"
    rbac_action_map = {
        "list": "view",
        "retrieve": "view",
        "create": "create",
        "update": "edit",
        "partial_update": "edit",
        "destroy": "delete",
        "submit_for_verification": "edit",
        "approve": "approve",
        "publish": "publish",
    }

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "property", Property.objects.all(), agent_field="agent"
        )

    def get_serializer_class(self):
        if self.action == "list":
            return PropertyListSerializer
        return PropertyDetailSerializer

    def perform_create(self, serializer):
        property_obj = serializer.save(agent=self.request.user, status=Property.Status.DRAFT)
        # Every property gets a verification checklist at creation time.
        VerificationChecklist.objects.create(property=property_obj)

    @action(detail=True, methods=["post"])
    def submit_for_verification(self, request, pk=None):
        """Listing submits a Draft/Onboarding property for verification review."""
        property_obj = self.get_object()
        if property_obj.status not in [Property.Status.DRAFT, Property.Status.ONBOARDING]:
            raise ValidationError(f"Cannot submit property in status '{property_obj.status}' for verification.")
        property_obj.status = Property.Status.PENDING_VERIFICATION
        property_obj.save(update_fields=["status", "updated_at"])
        return Response(PropertyDetailSerializer(property_obj).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Manager approval — requires verification checklist to be complete."""
        property_obj = self.get_object()
        checklist = getattr(property_obj, "verification", None)

        if property_obj.status != Property.Status.PENDING_VERIFICATION:
            raise ValidationError(f"Property must be Pending Verification to approve, currently '{property_obj.status}'.")
        if not checklist or not checklist.is_complete():
            raise ValidationError("Verification checklist is incomplete.")

        checklist.manager_approved = True
        checklist.approved_by = request.user
        from django.utils import timezone
        checklist.approved_at = timezone.now()
        checklist.save(update_fields=["manager_approved", "approved_by", "approved_at"])

        property_obj.status = Property.Status.VERIFIED
        property_obj.save(update_fields=["status", "updated_at"])
        return Response(PropertyDetailSerializer(property_obj).data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """Marketing publishes a Marketing Ready property to the public site."""
        property_obj = self.get_object()
        if property_obj.status != Property.Status.MARKETING_READY:
            raise ValidationError(f"Property must be Marketing Ready to publish, currently '{property_obj.status}'.")
        property_obj.status = Property.Status.PUBLISHED
        property_obj.save(update_fields=["status", "updated_at"])
        return Response(PropertyDetailSerializer(property_obj).data)


class PropertyMediaViewSet(viewsets.ModelViewSet):
    queryset = PropertyMedia.objects.all()
    serializer_class = PropertyMediaSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "property"

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class PropertyDocumentViewSet(viewsets.ModelViewSet):
    queryset = PropertyDocument.objects.all()
    serializer_class = PropertyDocumentSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "property"

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class VerificationChecklistViewSet(viewsets.ModelViewSet):
    queryset = VerificationChecklist.objects.all()
    serializer_class = VerificationChecklistSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "property_verification"
    http_method_names = ["get", "patch"]  # created automatically with Property; never POST/DELETE directly
