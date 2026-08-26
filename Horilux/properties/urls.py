from rest_framework.routers import DefaultRouter

from .views import (
    PropertyOwnerViewSet,
    PropertyViewSet,
    PropertyMediaViewSet,
    PropertyDocumentViewSet,
    VerificationChecklistViewSet,
)

app_name = "properties"

router = DefaultRouter()
router.register(r"property-owners", PropertyOwnerViewSet, basename="property-owner")
router.register(r"properties", PropertyViewSet, basename="property")
router.register(r"property-media", PropertyMediaViewSet, basename="property-media")
router.register(r"property-documents", PropertyDocumentViewSet, basename="property-document")
router.register(r"verification-checklists", VerificationChecklistViewSet, basename="verification-checklist")

urlpatterns = router.urls
