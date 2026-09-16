from rest_framework.routers import DefaultRouter
from notifications.views import NotificationViewSet, NotificationPreferenceViewSet

app_name = "notifications"

router = DefaultRouter()
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"notification-preferences", NotificationPreferenceViewSet, basename="notification-preference")

urlpatterns = router.urls
