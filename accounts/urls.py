from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MeView, UserListView

app_name = "accounts"

router = DefaultRouter()
# TODO: register ViewSets here as they're built, e.g.:
# router.register(r"properties", PropertyViewSet, basename="property")

urlpatterns = [
    path("accounts/me/", MeView.as_view(), name="me"),
    path("accounts/users/", UserListView.as_view(), name="user-list"),
] + router.urls
