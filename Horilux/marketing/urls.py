from django.urls import path
from rest_framework.routers import DefaultRouter

app_name = "marketing"

router = DefaultRouter()
# TODO: register ViewSets here as they're built, e.g.:
# router.register(r"properties", PropertyViewSet, basename="property")

urlpatterns = router.urls
