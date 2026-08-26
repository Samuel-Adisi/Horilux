import uuid
from django.conf import settings
from django.db import models
from properties.models import Property, PropertyOwner
from crm.models import Client


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
