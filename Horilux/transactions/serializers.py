from rest_framework import serializers

from .models import Transaction, Payment, Commission, CommissionRule, ApprovalThreshold


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


def _user_name(user):
    if user is None:
        return None
    return f"{user.first_name} {user.last_name}".strip() or user.email


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
        # status only changes through POST transactions/{id}/advance/.
        read_only_fields = [
            "id", "expected_commission", "amount_received", "outstanding_amount", "status", "created_at",
        ]

    def get_agent_name(self, obj):
        if not obj.agent_id:
            return None
        return _user_name(obj.agent)


class TransactionDetailSerializer(serializers.ModelSerializer):
    payments = serializers.SerializerMethodField()
    commission = CommissionSerializer(read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True, default=None)
    client_name = serializers.CharField(source="client.name", read_only=True, default=None)
    owner_name = serializers.CharField(source="owner.name", read_only=True, default=None)
    agent_name = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id", "property", "property_title", "client", "client_name", "owner", "owner_name",
            "agent", "agent_name", "price",
            "commission_percent", "expected_commission", "amount_received",
            "outstanding_amount", "status", "status_label", "created_at", "updated_at",
            "payments", "commission",
        ]
        read_only_fields = [
            "id", "expected_commission", "amount_received", "outstanding_amount", "status",
            "created_at", "updated_at",
        ]

    def get_agent_name(self, obj):
        if not obj.agent_id:
            return None
        return _user_name(obj.agent)

    def get_payments(self, obj):
        return PaymentSerializer(obj.payments.order_by("-date", "id"), many=True).data


class ApprovalThresholdSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalThreshold
        fields = ["id", "ceo_approval_min_price", "updated_at", "updated_by"]
        read_only_fields = ["id", "updated_at", "updated_by"]
