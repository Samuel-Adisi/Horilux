from django.db.models import ProtectedError, Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from accounts.permissions import RBACPermission
from accounts.permissions import filter_queryset_for_user, get_user_scopes

from .models import PropertyOwner, Property, PropertyMedia, PropertyDocument, VerificationChecklist
from .serializers import (
    PropertyOwnerSerializer,
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyMediaSerializer,
    PropertyDocumentSerializer,
    VerificationChecklistSerializer,
)


MARKETING_VISIBLE_STATUSES = (Property.Status.MARKETING_READY, Property.Status.PUBLISHED)


def is_marketing_user(user) -> bool:
    """Marketing-department users (or Marketing role holders) only browse
    properties that are approved for marketing."""
    if not user or not user.is_authenticated or user.is_superuser:
        return False
    dept = getattr(user, "department", None)
    if dept is not None and dept.name == "marketing":
        return True
    return user.user_roles.filter(role__name="Marketing").exists() and not user.user_roles.exclude(
        role__name="Marketing"
    ).exists()


class ProtectedDestroyMixin:
    """Turn ProtectedError (PROTECT FKs) on DELETE into a 400 instead of a 500."""
    protected_message = "This record is referenced by other records and cannot be deleted."

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError as exc:
            related = sorted({str(obj.__class__._meta.verbose_name_plural) for obj in exc.protected_objects})
            detail = self.protected_message
            if related:
                detail = f"{detail} Referenced by: {', '.join(related)}."
            return Response({"detail": detail}, status=status.HTTP_400_BAD_REQUEST)


class PropertyOwnerViewSet(ProtectedDestroyMixin, viewsets.ModelViewSet):
    queryset = PropertyOwner.objects.all().order_by("-created_at")
    serializer_class = PropertyOwnerSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "property"  # owners are managed as part of property onboarding
    protected_message = "This owner has properties or transactions and cannot be deleted."


class PropertyViewSet(viewsets.ModelViewSet):
    permission_classes = [RBACPermission]
    rbac_resource = "property"

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            if instance.status != Property.Status.ARCHIVED:
                instance.status = Property.Status.ARCHIVED
                instance.save(update_fields=["status"])
            return Response(
                {
                    "detail": "This property has linked transactions and was archived instead of deleted.",
                    "archived": True,
                },
                status=status.HTTP_200_OK,
            )
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
        "mark_marketing_ready": "approve",
        "mark_under_offer": "edit",
        "mark_sold": "edit",
        "archive": "edit",
    }
    protected_message = "This property is referenced by transactions and cannot be deleted."

    filterset_fields = ["status", "property_type", "listing_type"]

    def get_queryset(self):
        qs = filter_queryset_for_user(
            self.request.user, "view", "property", Property.objects.all(), agent_field="agent"
        ).select_related("agent")

        if is_marketing_user(self.request.user):
            qs = qs.filter(status__in=MARKETING_VISIBLE_STATUSES)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(location__icontains=search) | Q(region__icontains=search))

        return qs

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

        self._check_ceo_threshold(request.user, property_obj)

        checklist.manager_approved = True
        checklist.approved_by = request.user
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
        property_obj.published_at = timezone.now()
        property_obj.save(update_fields=["status", "published_at", "updated_at"])
        return Response(PropertyDetailSerializer(property_obj).data)

    # -- helpers -----------------------------------------------------------

    @staticmethod
    def _check_ceo_threshold(user, property_obj):
        """Properties priced at/above the ApprovalThreshold need company-scope approve (CEO)."""
        from transactions.models import ApprovalThreshold
        threshold = ApprovalThreshold.get_solo()
        if property_obj.price >= threshold.ceo_approval_min_price:
            scopes = get_user_scopes(user, "approve", "property")
            if "company" not in scopes:
                raise ValidationError(
                    f"Properties priced at or above GHS {threshold.ceo_approval_min_price} "
                    "require CEO approval."
                )

    def _transition(self, property_obj, allowed_from, target, verb):
        if property_obj.status not in allowed_from:
            allowed = ", ".join(f"'{s}'" for s in allowed_from)
            raise ValidationError(
                f"Cannot {verb} a property in status '{property_obj.status}' "
                f"(allowed from: {allowed})."
            )
        property_obj.status = target
        property_obj.save(update_fields=["status", "updated_at"])
        return Response(PropertyDetailSerializer(property_obj, context=self.get_serializer_context()).data)

    # -- workflow transitions -----------------------------------------------

    @action(detail=True, methods=["post"])
    def mark_marketing_ready(self, request, pk=None):
        """verified -> marketing_ready. Same CEO price-threshold rule as approve."""
        property_obj = self.get_object()
        if property_obj.status != Property.Status.VERIFIED:
            raise ValidationError(
                f"Property must be Verified to mark Marketing Ready, currently '{property_obj.status}'."
            )
        self._check_ceo_threshold(request.user, property_obj)
        return self._transition(
            property_obj, [Property.Status.VERIFIED], Property.Status.MARKETING_READY, "mark marketing ready",
        )

    @action(detail=True, methods=["post"])
    def mark_under_offer(self, request, pk=None):
        """published -> under_offer."""
        return self._transition(
            self.get_object(), [Property.Status.PUBLISHED], Property.Status.UNDER_OFFER, "mark under offer",
        )

    @action(detail=True, methods=["post"])
    def mark_sold(self, request, pk=None):
        """published / under_offer -> sold_rented."""
        return self._transition(
            self.get_object(),
            [Property.Status.PUBLISHED, Property.Status.UNDER_OFFER],
            Property.Status.SOLD_RENTED,
            "mark sold/rented",
        )

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        """Any status except archived -> archived."""
        allowed = [s for s in Property.Status.values if s != Property.Status.ARCHIVED]
        property_obj = self.get_object()
        if property_obj.status == Property.Status.ARCHIVED:
            raise ValidationError("Property is already archived.")
        return self._transition(property_obj, allowed, Property.Status.ARCHIVED, "archive")


class PropertyMediaViewSet(viewsets.ModelViewSet):
    serializer_class = PropertyMediaSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "property"

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "property", PropertyMedia.objects.all(), agent_field="property__agent",
        ).order_by("property_id", "order", "uploaded_at")

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class PropertyDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = PropertyDocumentSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "property"

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "property", PropertyDocument.objects.all(), agent_field="property__agent",
        ).order_by("-uploaded_at")

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class VerificationChecklistViewSet(viewsets.ModelViewSet):
    serializer_class = VerificationChecklistSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "property_verification"
    http_method_names = ["get", "patch"]  # created automatically with Property; never POST/DELETE directly

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "property_verification",
            VerificationChecklist.objects.select_related("property", "property__agent"),
            agent_field="property__agent",
        ).order_by("-property__created_at")
