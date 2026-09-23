from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from properties.models import Property


class Customer(models.Model):
    """Public-facing customer account — separate from staff User/RBAC."""
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=128)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return self.email


class SavedProperty(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="saved_properties")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("customer", "property")


class PropertyInquiry(models.Model):
    """Public inquiry submission — links to the Customer and the real CRM Lead it creates."""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="inquiries")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="public_inquiries")
    message = models.TextField(blank=True)
    requested_viewing = models.BooleanField(default=False)
    requested_viewing_date = models.DateTimeField(null=True, blank=True)
    lead = models.ForeignKey("crm.Lead", on_delete=models.SET_NULL, null=True, blank=True, related_name="public_inquiry")
    viewing = models.ForeignKey("viewings.Viewing", on_delete=models.SET_NULL, null=True, blank=True, related_name="public_inquiry")
    created_at = models.DateTimeField(auto_now_add=True)
