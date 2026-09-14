from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.shortcuts import render
from .models import User
from .serializers import UserSerializer, UserListItemSerializer

# Create your views here.


class MeView(generics.RetrieveAPIView):
    """Return the currently authenticated user. No RBAC gate — identity only."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """Lightweight list of active users for agent-picker UI (e.g. Lead.assign).
    Identity data only, no pagination, no RBAC gate — any authenticated user
    can see who else is on the team."""
    serializer_class = UserListItemSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    queryset = User.objects.filter(is_active=True).order_by("first_name", "last_name")
