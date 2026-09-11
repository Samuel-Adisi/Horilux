from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.shortcuts import render
from .serializers import UserSerializer

# Create your views here.


class MeView(generics.RetrieveAPIView):
    """Return the currently authenticated user. No RBAC gate — identity only."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
