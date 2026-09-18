from datetime import date as date_cls
from decimal import Decimal, InvalidOperation

from django.db import transaction as db_transaction
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import viewsets, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from accounts.permissions import RBACPermission, filter_queryset_for_user, has_permission
from rest_framework.exceptions import PermissionDenied

from .models import Transaction, Payment, Commission, CommissionRule, ApprovalThreshold
from .serializers import (
    ApprovalThresholdSerializer,
    TransactionListSerializer, TransactionDetailSerializer,
    PaymentSerializer, CommissionSerializer, CommissionRuleSerializer,
)
from .services import calculate_commission, NoCommissionRuleError, sync_commission_received

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

    filterset_fields = ["status"]

    def get_serializer_class(self):
        return TransactionDetailSerializer if self.action == "retrieve" else TransactionListSerializer

    def get_queryset(self):
        qs = filter_queryset_for_user(
            self.request.user, "view", "transaction", Transaction.objects.all(), agent_field="agent"
        ).select_related("property", "client", "agent")

        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(property__title__icontains=search) | Q(client__name__icontains=search)
            )

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        price = serializer.validated_data.get("price")
        commission_percent = serializer.validated_data.get("commission_percent")
        expected_commission = (price * commission_percent / 100) if price and commission_percent else 0
        # Default agent to the creator so Sales (assigned scope) can see it afterwards.
        agent = serializer.validated_data.get("agent") or self.request.user
        serializer.save(status=Transaction.Status.OFFER, expected_commission=expected_commission, agent=agent)

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

        # Atomic: compute the commission BEFORE persisting the new status so a
        # missing CommissionRule leaves the transaction exactly as it was.
        try:
            with db_transaction.atomic():
                if next_status == Transaction.Status.COMMISSION:
                    calculate_commission(txn)
                txn.status = next_status
                txn.save(update_fields=["status", "updated_at"])
        except NoCommissionRuleError as exc:
            txn.refresh_from_db()
            raise ValidationError(str(exc))

        return Response(TransactionDetailSerializer(txn).data)

    @action(detail=True, methods=["post"])
    def record_payment(self, request, pk=None):
        """Log a payment against this transaction and keep received/outstanding totals in sync."""
        txn = self.get_object()
        raw_amount = request.data.get("amount")
        if raw_amount in (None, ""):
            raise ValidationError("amount is required.")
        try:
            amount = Decimal(str(raw_amount))
        except (InvalidOperation, ValueError, TypeError):
            raise ValidationError("amount must be a valid decimal number.")
        if not amount.is_finite():
            raise ValidationError("amount must be a valid decimal number.")
        if amount <= 0:
            raise ValidationError("amount must be greater than zero.")
        if amount >= Decimal("1000000000000"):
            raise ValidationError("amount is too large.")
        amount = amount.quantize(Decimal("0.01"))

        raw_date = request.data.get("date")
        if raw_date in (None, ""):
            payment_date = timezone.localdate()
        elif isinstance(raw_date, date_cls):
            payment_date = raw_date
        else:
            try:
                payment_date = parse_date(str(raw_date))
            except ValueError:
                payment_date = None
            if payment_date is None:
                raise ValidationError("date must be a date in YYYY-MM-DD format.")

        payment = Payment.objects.create(
            transaction=txn,
            amount=amount,
            date=payment_date,
            method=request.data.get("method", "") or "",
            reference=request.data.get("reference", "") or "",
            status=Payment.Status.PAID,
        )

        txn.amount_received = (txn.amount_received or 0) + payment.amount
        txn.outstanding_amount = max(txn.price - txn.amount_received, 0)
        txn.save(update_fields=["amount_received", "outstanding_amount", "updated_at"])

        try:
            sync_commission_received(txn, txn.commission)
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
        ).order_by("-date", "id")


class CommissionViewSet(viewsets.ReadOnlyModelViewSet):
    """Commission records are computed by the service layer, never created/edited directly via API."""
    serializer_class = CommissionSerializer
    permission_classes = [RBACPermission]
    rbac_resource = "payment_commission"

    def get_queryset(self):
        return filter_queryset_for_user(
            self.request.user, "view", "payment_commission", Commission.objects.all(),
            agent_field="transaction__agent",
        ).order_by("-transaction__created_at")


class CommissionRuleViewSet(viewsets.ModelViewSet):
    """Manage per-role commission splits. Company-policy data -- CEO/Finance scope only."""
    serializer_class = CommissionRuleSerializer
    queryset = CommissionRule.objects.select_related("role").order_by("role__name", "created_at")
    permission_classes = [RBACPermission]
    rbac_resource = "payment_commission"
    rbac_action_map = {
        "list": "view", "retrieve": "view", "create": "edit",
        "update": "edit", "partial_update": "edit", "destroy": "edit",
    }


class ApprovalThresholdView(generics.RetrieveUpdateAPIView):
    """
    Singleton — GET returns the current threshold, PATCH/PUT updates it.
    Gated under company_settings (CEO-only), same as CompanyProfileView.
    """
    serializer_class = ApprovalThresholdSerializer

    def get_object(self):
        method_to_action = {"GET": "view", "PUT": "edit", "PATCH": "edit"}
        action = method_to_action.get(self.request.method)
        if not action or not has_permission(self.request.user, action, "company_settings"):
            raise PermissionDenied("You do not have permission to access approval settings.")
        return ApprovalThreshold.get_solo()

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
