from rest_framework.routers import DefaultRouter
from audit.views import AuditLogViewSet

app_name = "audit"

router = DefaultRouter()
router.register(r"audit-log", AuditLogViewSet, basename="auditlog")

urlpatterns = router.urls
