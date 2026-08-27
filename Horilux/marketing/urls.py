from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MarketingCampaignViewSet, CampaignPerformanceViewSet

app_name = "marketing"

router = DefaultRouter()
router.register(r"campaigns", MarketingCampaignViewSet, basename="campaign")
router.register(r"campaign-performance", CampaignPerformanceViewSet, basename="campaign-performance")

urlpatterns = router.urls
