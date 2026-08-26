"""
URL configuration for Horilux project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # App routers — each app should expose urlpatterns/router in its urls.py
    path('api/v1/', include('accounts.urls')),
    path('api/v1/', include('properties.urls')),
    path('api/v1/', include('crm.urls')),
    path('api/v1/', include('viewings.urls')),
    path('api/v1/', include('transactions.urls')),
    path('api/v1/', include('marketing.urls')),
    path('api/v1/', include('operations.urls')),
    path('api/v1/', include('notifications.urls')),
    path('api/v1/', include('reporting.urls')),
]
