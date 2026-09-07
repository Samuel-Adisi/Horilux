from django.urls import path
from rest_framework.routers import DefaultRouter

from accounts.views import UserViewSet, RoleViewSet, DepartmentViewSet

app_name = "accounts"

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"roles", RoleViewSet, basename="role")
router.register(r"departments", DepartmentViewSet, basename="department")

urlpatterns = router.urls
