from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import CompanyBrandView, CompanyProfileView, IntegrationStatusViewSet

app_name = "company"

router = DefaultRouter()
router.register(r"integrations", IntegrationStatusViewSet, basename="integrationstatus")

urlpatterns = [
    path("company-profile/", CompanyProfileView.as_view(), name="company-profile"),
    path("company-brand/", CompanyBrandView.as_view(), name="company-brand"),
] + router.urls
