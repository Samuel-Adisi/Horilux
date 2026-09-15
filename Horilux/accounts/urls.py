from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MeView, UserListView, StaffViewSet, DepartmentListView, RoleListView

app_name = "accounts"

router = DefaultRouter()
router.register(r"accounts/staff", StaffViewSet, basename="staff")

urlpatterns = [
    path("accounts/me/", MeView.as_view(), name="me"),
    path("accounts/users/", UserListView.as_view(), name="user-list"),
    path("accounts/departments/", DepartmentListView.as_view(), name="department-list"),
    path("accounts/roles/", RoleListView.as_view(), name="role-list"),
] + router.urls
