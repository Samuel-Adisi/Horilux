"""
DRF-level replacement for AuditActorMiddleware.

Plain Django middleware runs BEFORE DRF resolves request.user via
JWTAuthentication, so setting the thread-local actor there always
produced actor=None for JWT-authenticated API calls. This mixin sets
it in initial() (after DRF auth resolves request.user, before the
view body / signals run) and clears it in finalize_response().
"""
from audit.middleware import set_current_user


class AuditActorMixin:
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        set_current_user(getattr(request, "user", None))

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        set_current_user(None)
        return response
