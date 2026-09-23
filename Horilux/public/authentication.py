import jwt
from datetime import datetime, timedelta, timezone as dt_timezone
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import Customer

CUSTOMER_TOKEN_TYPE = "customer_access"
CUSTOMER_REFRESH_TYPE = "customer_refresh"


def _encode(customer_id, token_type, minutes):
    payload = {
        "customer_id": str(customer_id),
        "type": token_type,
        "exp": datetime.now(dt_timezone.utc) + timedelta(minutes=minutes),
        "iat": datetime.now(dt_timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def issue_tokens(customer):
    return {
        "access": _encode(customer.id, CUSTOMER_TOKEN_TYPE, 60 * 24),       # 24h
        "refresh": _encode(customer.id, CUSTOMER_REFRESH_TYPE, 60 * 24 * 14),  # 14d
    }


def refresh_access_token(refresh_token):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise exceptions.AuthenticationFailed("Invalid or expired refresh token.")
    if payload.get("type") != CUSTOMER_REFRESH_TYPE:
        raise exceptions.AuthenticationFailed("Invalid token type.")
    customer_id = payload.get("customer_id")
    if not Customer.objects.filter(id=customer_id, is_active=True).exists():
        raise exceptions.AuthenticationFailed("Customer account not found or inactive.")
    return _encode(customer_id, CUSTOMER_TOKEN_TYPE, 60 * 24)


class CustomerJWTAuthentication(authentication.BaseAuthentication):
    """Separate auth path from staff RBAC JWT — used only on customer-scoped views."""

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.PyJWTError:
            raise exceptions.AuthenticationFailed("Invalid or expired token.")
        if payload.get("type") != CUSTOMER_TOKEN_TYPE:
            raise exceptions.AuthenticationFailed("Invalid token type.")
        try:
            customer = Customer.objects.get(id=payload["customer_id"], is_active=True)
        except Customer.DoesNotExist:
            raise exceptions.AuthenticationFailed("Customer account not found or inactive.")
        return (customer, None)
