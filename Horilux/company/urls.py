from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import CompanyProfileView, IntegrationStatusViewSet

app_name = "company"

router = DefaultRouter()
router.register(r"integrations", IntegrationStatusViewSet, basename="integrationstatus")

urlpatterns = [
    path("company-profile/", CompanyProfileView.as_view(), name="company-profile"),
] + router.urls
