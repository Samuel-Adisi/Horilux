from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MeView

app_name = "accounts"

router = DefaultRouter()
# TODO: register ViewSets here as they're built, e.g.:
# router.register(r"properties", PropertyViewSet, basename="property")

urlpatterns = [
    path("accounts/me/", MeView.as_view(), name="me"),
] + router.urls

