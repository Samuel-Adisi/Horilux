from rest_framework.routers import DefaultRouter

from .views import ViewingViewSet, FollowUpViewSet

app_name = "viewings"

router = DefaultRouter()
router.register(r"viewings", ViewingViewSet, basename="viewing")
router.register(r"follow-ups", FollowUpViewSet, basename="follow-up")

urlpatterns = router.urls
