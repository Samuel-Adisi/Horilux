from rest_framework import serializers

from .models import Transaction, Payment, Commission, CommissionRule


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "transaction", "amount", "date", "status", "method", "reference"]
        read_only_fields = ["id"]


class CommissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commission
        fields = [
            "id", "transaction", "expected", "received", "outstanding",
            "agent_share", "company_share", "payment_date", "payment_status",
        ]
        read_only_fields = fields


class CommissionRuleSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True, default=None)

    class Meta:
        model = CommissionRule
        fields = ["id", "role", "role_name", "agent_split_percent", "active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class TransactionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id", "property", "client", "owner", "agent", "price",
            "commission_percent", "expected_commission", "amount_received",
            "outstanding_amount", "status", "created_at",
        ]
        read_only_fields = ["id", "expected_commission", "amount_received", "outstanding_amount", "created_at"]


class TransactionDetailSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)
    commission = CommissionSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id", "property", "client", "owner", "agent", "price",
            "commission_percent", "expected_commission", "amount_received",
            "outstanding_amount", "status", "created_at", "updated_at",
            "payments", "commission",
        ]
        read_only_fields = ["id", "expected_commission", "amount_received", "outstanding_amount", "created_at", "updated_at"]
