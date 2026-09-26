from django.db import transaction
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from properties.models import Property
from crm.models import Lead, Client
from viewings.models import Viewing
from .models import Customer, SavedProperty, PropertyInquiry
from .authentication import issue_tokens, refresh_access_token, CustomerJWTAuthentication
from django.conf import settings
from django.core.mail import send_mail
from .serializers import (
    PublicPropertyListSerializer, PublicPropertyDetailSerializer,
    CustomerRegisterSerializer, CustomerLoginSerializer, CustomerSerializer,
    SavedPropertySerializer, PropertyInquirySerializer, MARKETABLE_STATUSES,
    ContactSubmissionSerializer,
)
from .models import Customer, SavedProperty, PropertyInquiry, ContactSubmission


class PublicPropertyPagination(PageNumberPagination):
    """Fixed page size for the public listings grid (2-col layout wants an even count)."""
    page_size = 26


class PublicPropertyViewSet(viewsets.ReadOnlyModelViewSet):
    """No auth required — only marketable-status properties, no RBAC scoping."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    pagination_class = PublicPropertyPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["region", "property_type", "listing_type", "bedrooms", "bathrooms"]
    search_fields = ["title", "region", "description"]
    ordering_fields = ["price", "published_at", "bedrooms", "building_size"]
    ordering = ["-published_at"]

    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        qs = Property.objects.filter(status__in=MARKETABLE_STATUSES).prefetch_related("media")
        params = self.request.query_params
        min_price, max_price = params.get("min_price"), params.get("max_price")
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        return qs

    def get_serializer_class(self):
        return PublicPropertyDetailSerializer if self.action == "retrieve" else PublicPropertyListSerializer


class CustomerRegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    serializer_class = CustomerRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = serializer.save()
        tokens = issue_tokens(customer)
        return Response(
            {"customer": CustomerSerializer(customer).data, **tokens},
            status=status.HTTP_201_CREATED,
        )


class CustomerLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = CustomerLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()
        password = serializer.validated_data["password"]
        try:
            customer = Customer.objects.get(email__iexact=email, is_active=True)
        except Customer.DoesNotExist:
            return Response({"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
        if not customer.check_password(password):
            return Response({"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
        tokens = issue_tokens(customer)
        return Response({"customer": CustomerSerializer(customer).data, **tokens})


class CustomerRefreshView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"detail": "refresh token required."}, status=status.HTTP_400_BAD_REQUEST)
        access = refresh_access_token(refresh)
        return Response({"access": access})


class CustomerMeView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CustomerJWTAuthentication]
    serializer_class = CustomerSerializer

    def get_object(self):
        return self.request.user


class SavedPropertyViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CustomerJWTAuthentication]
    serializer_class = SavedPropertySerializer
    http_method_names = ["get", "post", "delete"]

    def get_queryset(self):
        return SavedProperty.objects.filter(customer=self.request.user).select_related("property")

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)


class PropertyInquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CustomerJWTAuthentication]
    serializer_class = PropertyInquirySerializer
    http_method_names = ["get", "post"]

    def get_queryset(self):
        return PropertyInquiry.objects.filter(customer=self.request.user).select_related("property")

    @transaction.atomic
    def perform_create(self, serializer):
        customer = self.request.user
        prop = serializer.validated_data["property"]

        lead, _ = Lead.objects.get_or_create(
            email=customer.email,
            defaults={
                "name": customer.full_name,
                "phone": customer.phone,
                "source": "public_website",
                "purpose": "buy" if prop.listing_type == "sale" else "rent",
                "location_preference": prop.region,
                "property_type_preference": prop.property_type,
                "notes": f"Auto-created from public website inquiry on {prop.title}.",
            },
        )

        viewing = None
        if serializer.validated_data.get("requested_viewing"):
            client = getattr(lead, "client", None)
            if client is None:
                client = Client.objects.create(
                    lead=lead, name=customer.full_name, phone=customer.phone, email=customer.email,
                )
            req_dt = serializer.validated_data.get("requested_viewing_date")
            viewing = Viewing.objects.create(
                client=client,
                property=prop,
                date=req_dt.date() if req_dt else None,
                time=req_dt.time() if req_dt else None,
                notes="Requested via public website inquiry.",
            )

        serializer.save(customer=customer, lead=lead, viewing=viewing)


class ContactSubmissionView(generics.CreateAPIView):
    """No auth required — general contact form, sends an email to the company inbox."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    serializer_class = ContactSubmissionSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()

        prop = submission.property
        if prop:
            notes = f"Interested in: {prop.title} ({prop.region})."
            if submission.message:
                notes += f"\n\n{submission.message}"
            Lead.objects.create(
                name=submission.name,
                email=submission.email,
                phone=submission.phone,
                source="Contact Form",
                purpose="buy" if prop.listing_type == "sale" else "rent",
                location_preference=prop.region,
                property_type_preference=prop.property_type,
                property_interest=prop,
                budget=submission.budget,
                bedrooms_preference=submission.bedrooms_preference,
                notes=notes,
            )
        else:
            Lead.objects.create(
                name=submission.name,
                email=submission.email,
                phone=submission.phone,
                source="Contact Form",
                budget=submission.budget,
                bedrooms_preference=submission.bedrooms_preference,
                notes=submission.message or "Submitted via website contact form.",
            )

        recipient = getattr(settings, "CONTACT_RECIPIENT_EMAIL", None)
        if recipient:
            body_lines = [
                f"Name: {submission.name}",
                f"Email: {submission.email}",
                f"Phone: {submission.phone or ''}",
                f"Country: {submission.country or ''}",
                "",
                "Message:",
                submission.message or "",
            ]
            try:
                send_mail(
                    subject=f"New website contact form submission from {submission.name}",
                    message="\n".join(body_lines),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[recipient],
                    fail_silently=True,
                )
            except Exception:
                pass  # submission is already saved even if email delivery fails

        return Response(serializer.data, status=status.HTTP_201_CREATED)
