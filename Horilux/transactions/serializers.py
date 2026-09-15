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
    property_title = serializers.CharField(source="property.title", read_only=True, default=None)
    client_name = serializers.CharField(source="client.name", read_only=True, default=None)
    agent_name = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id", "property", "property_title", "client", "client_name",
            "owner", "agent", "agent_name", "price",
            "commission_percent", "expected_commission", "amount_received",
            "outstanding_amount", "status", "status_label", "created_at",
        ]
        read_only_fields = ["id", "expected_commission", "amount_received", "outstanding_amount", "created_at"]

    def get_agent_name(self, obj):
        if not obj.agent_id:
            return None
        return f"{obj.agent.first_name} {obj.agent.last_name}".strip() or obj.agent.username


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
