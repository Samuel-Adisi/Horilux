from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ApprovalThresholdView,
    TransactionViewSet, PaymentViewSet, CommissionViewSet, CommissionRuleViewSet,
)

app_name = "transactions"

urlpatterns_extra = [path("approval-threshold/", ApprovalThresholdView.as_view(), name="approval-threshold")]

router = DefaultRouter()
router.register(r"transactions", TransactionViewSet, basename="transaction")
router.register(r"payments", PaymentViewSet, basename="payment")
router.register(r"commissions", CommissionViewSet, basename="commission")
router.register(r"commission-rules", CommissionRuleViewSet, basename="commission-rule")

urlpatterns = urlpatterns_extra + router.urls
