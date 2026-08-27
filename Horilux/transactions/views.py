from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from accounts.permissions import RBACPermission, filter_queryset_for_user

from .models import Transaction, Payment, Commission, CommissionRule
from .serializers import (
    TransactionListSerializer, TransactionDetailSerializer,
    PaymentSerializer, CommissionSerializer, CommissionRuleSerializer,
)
from .services import calculate_commission, NoCommissionRuleError

STATUS_ORDER = [
    Transaction.Status.OFFER,
    Transaction.Status.NEGOTIATION,
    Transaction.Status.AGREEMENT,
    Transaction.Status.DOCUMENTATION,
    Transaction.Status.PAYMENT,
    Transaction.Status.CLOSING,
    Transaction.Status.COMMISSION,
    Transaction.Status.CLOSED,
]


class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [RBACPermission]
    rbac_resource = "transaction"
    rbac_action_map = {
        "list": "view", "retrieve": "view", "create": "create",
        "update": "edit", "partial_update": "edit", "destroy": "delete",
        "advance": "edit", "record_payment": "edit",
    }

    def get_serializer_class(self):
        return TransactionDetailSerializer if self.action == "retrieve" else TransactionListSerializer

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "transaction", Transaction.objects.all(), agent_field="agent"
        )

    def perform_create(self, serializer):
        price = serializer.validated_data.get("price")
        commission_percent = serializer.validated_data.get("commission_percent")
        expected_commission = (price * commission_percent / 100) if price and commission_percent else 0
        serializer.save(status=Transaction.Status.OFFER, expected_commission=expected_commission)

    @action(detail=True, methods=["post"])
    def advance(self, request, pk=None):
        """Move the transaction to the next status in the linear state machine."""
        txn = self.get_object()
        try:
            current_index = STATUS_ORDER.index(txn.status)
        except ValueError:
            raise ValidationError(f"Transaction has unrecognized status \'{txn.status}\'.")

        if current_index == len(STATUS_ORDER) - 1:
            raise ValidationError("Transaction is already closed; cannot advance further.")

        next_status = STATUS_ORDER[current_index + 1]

        if next_status == Transaction.Status.PAYMENT and (not txn.price or not txn.commission_percent):
            raise ValidationError("price and commission_percent must be set before entering the payment stage.")

        txn.status = next_status
        txn.save(update_fields=["status"])

        if next_status == Transaction.Status.COMMISSION:
            try:
                calculate_commission(txn)
            except NoCommissionRuleError as exc:
                raise ValidationError(str(exc))

        return Response(TransactionDetailSerializer(txn).data)

    @action(detail=True, methods=["post"])
    def record_payment(self, request, pk=None):
        """Log a payment against this transaction and keep received/outstanding totals in sync."""
        txn = self.get_object()
        amount = request.data.get("amount")
        if not amount:
            raise ValidationError("amount is required.")

        payment = Payment.objects.create(
            transaction=txn,
            amount=amount,
            date=request.data.get("date"),
            method=request.data.get("method", ""),
            reference=request.data.get("reference", ""),
            status=Payment.Status.PAID,
        )

        txn.amount_received = (txn.amount_received or 0) + payment.amount
        txn.outstanding_amount = max(txn.price - txn.amount_received, 0)
        txn.save(update_fields=["amount_received", "outstanding_amount"])

        try:
            commission = txn.commission
            commission.received = (commission.received or 0) + payment.amount
            commission.outstanding = max(commission.expected - commission.received, 0)
            commission.save(update_fields=["received", "outstanding"])
        except Commission.DoesNotExist:
            pass

        return Response(TransactionDetailSerializer(txn).data)


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "transaction"

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "transaction", Payment.objects.all(), agent_field="transaction__agent"
        )


class CommissionViewSet(viewsets.ReadOnlyModelViewSet):
    """Commission records are computed by the service layer, never created/edited directly via API."""
    serializer_class = CommissionSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "payment_commission"

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "payment_commission", Commission.objects.all(),
            agent_field="transaction__agent",
        )


class CommissionRuleViewSet(viewsets.ModelViewSet):
    """Manage per-role commission splits. Company-policy data -- CEO/Finance scope only."""
    serializer_class = CommissionRuleSerializer
    queryset = CommissionRule.objects.all()
    permission_classes = [RBACPermission]
    rbac_resource = "payment_commission"
    rbac_action_map = {
        "list": "view", "retrieve": "view", "create": "edit",
        "update": "edit", "partial_update": "edit", "destroy": "edit",
    }
