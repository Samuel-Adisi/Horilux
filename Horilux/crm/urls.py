from rest_framework.routers import DefaultRouter

from .views import LeadViewSet, ClientViewSet, InteractionViewSet, LeadSourceStatsViewSet

app_name = "crm"

router = DefaultRouter()
router.register(r"leads", LeadViewSet, basename="lead")
router.register(r"clients", ClientViewSet, basename="client")
router.register(r"interactions", InteractionViewSet, basename="interaction")
router.register(r"lead-source-stats", LeadSourceStatsViewSet, basename="lead-source-stats")

urlpatterns = router.urls
