from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

app_name = "operations"

router = DefaultRouter()
router.register(r"tasks", TaskViewSet, basename="task")

urlpatterns = router.urls
