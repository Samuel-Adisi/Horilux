"""
Thread-local storage of the current request's user, so signal handlers
(which don't receive the request) can attribute audit log entries to
the acting user.

Why this works for JWT: plain Django middleware runs BEFORE DRF
authenticates the request, so capturing `request.user` eagerly here would
always yield AnonymousUser for API calls. Instead the middleware stores the
underlying HttpRequest and `get_current_user()` reads `request.user`
lazily at signal time. DRF's `Request.user` setter writes the authenticated
user back onto the wrapped HttpRequest (`request._request.user = user`),
so by the time a view saves a model, `request.user` is the JWT user.
This covers every DRF view (viewsets, APIViews, custom actions) without
per-view mixins.

`set_current_user()` still allows an explicit override (e.g. Celery tasks
or management commands that want to attribute changes to someone).
"""
import threading

_thread_locals = threading.local()


def _authenticated(user):
    return user if user is not None and getattr(user, "is_authenticated", False) else None


def get_current_user():
    explicit = getattr(_thread_locals, "user", None)
    if explicit is not None:
        return explicit
    request = getattr(_thread_locals, "request", None)
    if request is None:
        return None
    try:
        return _authenticated(getattr(request, "user", None))
    except Exception:  # never let audit attribution break a write
        return None


def set_current_user(user):
    _thread_locals.user = _authenticated(user)


def set_current_request(request):
    _thread_locals.request = request


def clear_current():
    _thread_locals.user = None
    _thread_locals.request = None


class AuditActorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        clear_current()
        set_current_request(request)
        try:
            return self.get_response(request)
        finally:
            clear_current()
