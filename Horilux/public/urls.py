from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicPropertyViewSet, CustomerRegisterView, CustomerLoginView, CustomerRefreshView,
    CustomerMeView, SavedPropertyViewSet, PropertyInquiryViewSet, ContactSubmissionView,
)

router = DefaultRouter()
router.register(r"properties", PublicPropertyViewSet, basename="public-properties")
router.register(r"saved-properties", SavedPropertyViewSet, basename="saved-properties")
router.register(r"inquiries", PropertyInquiryViewSet, basename="public-inquiries")

urlpatterns = [
    path("auth/register/", CustomerRegisterView.as_view(), name="customer-register"),
    path("auth/login/", CustomerLoginView.as_view(), name="customer-login"),
    path("auth/refresh/", CustomerRefreshView.as_view(), name="customer-refresh"),
    path("auth/me/", CustomerMeView.as_view(), name="customer-me"),
    path("contact/", ContactSubmissionView.as_view(), name="contact-submit"),
    path("", include(router.urls)),
]
