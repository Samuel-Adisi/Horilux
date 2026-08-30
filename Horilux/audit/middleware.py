"""
Thread-local storage of the current request\'s user, so signal handlers
(which don\'t receive the request) can attribute audit log entries to
the acting user.
"""
import threading

_thread_locals = threading.local()


def get_current_user():
    return getattr(_thread_locals, "user", None)


class AuditActorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, "user", None)
        _thread_locals.user = user if user and getattr(user, "is_authenticated", False) else None
        try:
            response = self.get_response(request)
        finally:
            _thread_locals.user = None
        return response
