import uuid
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from properties.models import Property, PropertyOwner
from crm.models import Client
from accounts.models import Role


class Transaction(models.Model):
    class Status(models.TextChoices):
        OFFER = "offer", "Offer"
        NEGOTIATION = "negotiation", "Negotiation"
        AGREEMENT = "agreement", "Agreement"
        DOCUMENTATION = "documentation", "Documentation"
        PAYMENT = "payment", "Payment"
        CLOSING = "closing", "Closing"
        COMMISSION = "commission", "Commission"
        CLOSED = "closed", "Closed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, on_delete=models.PROTECT, related_name="transactions")
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name="transactions")
    owner = models.ForeignKey(PropertyOwner, on_delete=models.PROTECT, related_name="transactions")
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="transactions")
    price = models.DecimalField(max_digits=14, decimal_places=2)
    commission_percent = models.DecimalField(max_digits=5, decimal_places=2)
    expected_commission = models.DecimalField(max_digits=14, decimal_places=2)
    amount_received = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    outstanding_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OFFER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PARTIAL = "partial", "Partial"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    method = models.CharField(max_length=50, blank=True)
    reference = models.CharField(max_length=100, blank=True)


class CommissionRule(models.Model):
    """
    Per-role commission split. `role=None` is the fallback/default rule used
    when the closing agent's role has no specific rule defined.

    Editable data, not code -- mirrors how RBAC permissions are seeded/managed,
    so the split can change without a redeploy. `agent_split_percent` is the
    agent's share of the transaction's total commission; company keeps the rest.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.OneToOneField(
        Role, on_delete=models.CASCADE, related_name="commission_rule",
        null=True, blank=True,
        help_text="Leave blank for the default/fallback rule.",
    )
    agent_split_percent = models.DecimalField(max_digits=5, decimal_places=2)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(agent_split_percent__gte=0) & models.Q(agent_split_percent__lte=100),
                name="commission_rule_split_between_0_and_100",
            ),
        ]

    def clean(self):
        if not (0 <= self.agent_split_percent <= 100):
            raise ValidationError("agent_split_percent must be between 0 and 100.")

    def __str__(self):
        label = self.role.name if self.role else "Default"
        return f"{label}: {self.agent_split_percent}% agent"


class Commission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name="commission")
    expected = models.DecimalField(max_digits=14, decimal_places=2)
    received = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    outstanding = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    agent_share = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    company_share = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payment_date = models.DateField(null=True, blank=True)
    payment_status = models.CharField(max_length=10, choices=Payment.Status.choices, default=Payment.Status.PENDING)


class ApprovalThreshold(models.Model):
    """
    Singleton — one active threshold value.
    Properties with a price >= this value require CEO approval;
    below it, any role with property.approve permission can approve.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ceo_approval_min_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )

    def save(self, *args, **kwargs):
        self.pk = self.pk or uuid.UUID(int=0)
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=uuid.UUID(int=0))
        return obj

    def __str__(self):
        return f"CEO approval required over GHS {self.ceo_approval_min_price}"
