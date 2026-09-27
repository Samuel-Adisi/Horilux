"""Cookie-based anonymous visitor identity, used in place of Customer auth
for SavedProperty / PropertyInquiry on the public site."""
from rest_framework import exceptions
from .models import AnonymousVisitor

VISITOR_COOKIE_NAME = "horilux_visitor"
VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365  # 1 year


def get_visitor_cookie_kwargs(request):
    """Cookie flags shared by the mint endpoint. Secure only outside DEBUG
    so it still works over plain http on localhost."""
    from django.conf import settings
    return {
        "max_age": VISITOR_COOKIE_MAX_AGE,
        "httponly": True,
        "secure": not settings.DEBUG,
        "samesite": "Lax",
    }


def resolve_visitor(request, required=True):
    """Looks up the AnonymousVisitor from the request cookie. Does NOT create
    one — creation only happens via VisitorView. Raises 401 if required and
    missing/invalid, matching prior IsAuthenticated behavior."""
    visitor_id = request.COOKIES.get(VISITOR_COOKIE_NAME)
    visitor = None
    if visitor_id:
        visitor = AnonymousVisitor.objects.filter(id=visitor_id).first()
    if required and visitor is None:
        raise exceptions.AuthenticationFailed(
            "No visitor identity found. Call /public/visitor/ first to establish one."
        )
    return visitor
