import uuid
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

    @property
    def is_authenticated(self):
        """DRF's IsAuthenticated permission checks this attribute; Customer
        is not a Django auth user, so it must be provided explicitly."""
        return True

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return self.email


class AnonymousVisitor(models.Model):
    """A cookie-identified public-site visitor, used in place of a Customer
    account for saving properties and submitting inquiries without sign-up."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Visitor {self.id}"


class SavedProperty(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="saved_properties", null=True, blank=True)
    visitor = models.ForeignKey(AnonymousVisitor, on_delete=models.CASCADE, related_name="saved_properties", null=True, blank=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["customer", "property"], name="unique_customer_saved_property", condition=models.Q(customer__isnull=False)),
            models.UniqueConstraint(fields=["visitor", "property"], name="unique_visitor_saved_property", condition=models.Q(visitor__isnull=False)),
            models.CheckConstraint(
                check=(
                    models.Q(customer__isnull=False, visitor__isnull=True)
                    | models.Q(customer__isnull=True, visitor__isnull=False)
                ),
                name="saved_property_exactly_one_owner",
            ),
        ]


class PropertyInquiry(models.Model):
    """Public inquiry submission — links to the Customer or AnonymousVisitor
    and the real CRM Lead it creates."""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="inquiries", null=True, blank=True)
    visitor = models.ForeignKey(AnonymousVisitor, on_delete=models.CASCADE, related_name="inquiries", null=True, blank=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="public_inquiries")
    message = models.TextField(blank=True)
    requested_viewing = models.BooleanField(default=False)
    requested_viewing_date = models.DateTimeField(null=True, blank=True)
    lead = models.ForeignKey("crm.Lead", on_delete=models.SET_NULL, null=True, blank=True, related_name="public_inquiry")
    viewing = models.ForeignKey("viewings.Viewing", on_delete=models.SET_NULL, null=True, blank=True, related_name="public_inquiry")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(customer__isnull=False, visitor__isnull=True)
                    | models.Q(customer__isnull=True, visitor__isnull=False)
                ),
                name="inquiry_exactly_one_owner",
            ),
        ]


class ContactSubmission(models.Model):
    """General-purpose contact form submission. Optionally tied to a specific
    property when submitted from a property detail page's inquiry form."""
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    country = models.CharField(max_length=100, blank=True)
    message = models.TextField(blank=True)
    property = models.ForeignKey(
        Property, on_delete=models.SET_NULL, null=True, blank=True, related_name="contact_submissions"
    )
    requested_viewing_date = models.DateField(null=True, blank=True)
    requested_viewing_time = models.TimeField(null=True, blank=True)
    budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    bedrooms_preference = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} <{self.email}>"
