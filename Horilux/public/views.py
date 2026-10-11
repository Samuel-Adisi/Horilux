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
from .models import Customer, SavedProperty, PropertyInquiry, AnonymousVisitor
from .authentication import issue_tokens, refresh_access_token, CustomerJWTAuthentication
from .visitor import resolve_visitor, get_visitor_cookie_kwargs, VISITOR_COOKIE_NAME
from django.conf import settings
from django.core.mail import send_mail
from .serializers import (
    PublicPropertyListSerializer, PublicPropertyDetailSerializer,
    CustomerRegisterSerializer, CustomerLoginSerializer, CustomerSerializer,
    SavedPropertySerializer, PropertyInquirySerializer, MARKETABLE_STATUSES,
    ContactSubmissionSerializer, AnonymousVisitorSerializer,
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
    """Kept dormant — not linked from the frontend, sign-up UI removed."""
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
    """Kept dormant — not linked from the frontend, login UI removed."""
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


class VisitorView(APIView):
    """Mints (or refreshes) the anonymous visitor cookie. Frontend calls this
    once on load; subsequent requests just carry the cookie automatically."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        visitor = resolve_visitor(request, required=False)
        if visitor is None:
            visitor = AnonymousVisitor.objects.create()
        else:
            visitor.save(update_fields=["last_seen_at"])  # bump last_seen_at via auto_now

        response = Response(AnonymousVisitorSerializer(visitor).data, status=status.HTTP_200_OK)
        response.set_cookie(VISITOR_COOKIE_NAME, str(visitor.id), **get_visitor_cookie_kwargs(request))
        return response

    def patch(self, request):
        """Optional: let the frontend attach a name/email/phone to the visitor
        once known (e.g. right before an inquiry submit), so future Leads
        created from this visitor aren't blank."""
        visitor = resolve_visitor(request, required=True)
        for field in ("name", "email", "phone"):
            if field in request.data:
                setattr(visitor, field, request.data[field])
        visitor.save()
        return Response(AnonymousVisitorSerializer(visitor).data)


class SavedPropertyViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    serializer_class = SavedPropertySerializer
    http_method_names = ["get", "post", "delete"]

    def get_queryset(self):
        visitor = resolve_visitor(self.request, required=True)
        return SavedProperty.objects.filter(visitor=visitor).select_related("property")

    def perform_create(self, serializer):
        visitor = resolve_visitor(self.request, required=True)
        serializer.save(visitor=visitor)


class PropertyInquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    serializer_class = PropertyInquirySerializer
    http_method_names = ["get", "post"]

    def get_queryset(self):
        visitor = resolve_visitor(self.request, required=True)
        return PropertyInquiry.objects.filter(visitor=visitor).select_related("property")

    @transaction.atomic
    def perform_create(self, serializer):
        visitor = resolve_visitor(self.request, required=True)
        prop = serializer.validated_data["property"]

        contact_name = serializer.validated_data.pop("contact_name", "") or visitor.name
        contact_email = serializer.validated_data.pop("contact_email", "") or visitor.email
        contact_phone = serializer.validated_data.pop("contact_phone", "") or visitor.phone

        # Keep the visitor record filled in for future inquiries/leads.
        changed = False
        if contact_name and not visitor.name:
            visitor.name, changed = contact_name, True
        if contact_email and not visitor.email:
            visitor.email, changed = contact_email, True
        if contact_phone and not visitor.phone:
            visitor.phone, changed = contact_phone, True
        if changed:
            visitor.save()

        lead = None
        if contact_email:
            lead, _ = Lead.objects.get_or_create(
                email=contact_email,
                defaults={
                    "name": contact_name,
                    "phone": contact_phone,
                    "source": "public_website",
                    "purpose": "buy" if prop.listing_type == "sale" else "rent",
                    "location_preference": prop.region,
                    "property_type_preference": prop.property_type,
                    "notes": f"Auto-created from public website inquiry on {prop.title}.",
                },
            )

        viewing = None
        if serializer.validated_data.get("requested_viewing") and lead is not None:
            client = getattr(lead, "client", None)
            if client is None:
                client = Client.objects.create(
                    lead=lead, name=contact_name, phone=contact_phone, email=contact_email,
                )
            req_dt = serializer.validated_data.get("requested_viewing_date")
            viewing = Viewing.objects.create(
                client=client,
                property=prop,
                date=req_dt.date() if req_dt else None,
                time=req_dt.time() if req_dt else None,
                notes="Requested via public website inquiry.",
            )

        serializer.save(visitor=visitor, lead=lead, viewing=viewing)


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
            lead = Lead.objects.create(
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
            vdate = submission.requested_viewing_date
            vtime = submission.requested_viewing_time
            if (vdate is None) != (vtime is None):
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Choose both a viewing date and a time.")
            if vdate and vtime:
                from django.utils import timezone
                if vdate < timezone.localdate():
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError("Viewing date cannot be in the past.")
                client = Client.objects.create(
                    lead=lead,
                    name=submission.name,
                    phone=(submission.phone or "")[:20],
                    email=submission.email,
                    assigned_agent=prop.agent,
                )
                Viewing.objects.create(
                    client=client,
                    property=prop,
                    agent=prop.agent,
                    date=vdate,
                    time=vtime,
                    notes="Requested via public website.",
                )
                try:
                    from accounts.models import User
                    from notifications.tasks import create_notification
                    msg = f"New viewing request for {prop.title} from {submission.name} on {vdate} at {str(vtime)[:5]}."
                    people = {}
                    if prop.agent:
                        people[prop.agent.pk] = prop.agent
                    for u in User.objects.filter(user_roles__role__name__in=["Operations", "CEO"]).distinct():
                        people[u.pk] = u
                    with transaction.atomic():
                        for u in people.values():
                            create_notification(u, "viewing.requested", msg, related_obj=prop)
                except Exception:
                    pass
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
