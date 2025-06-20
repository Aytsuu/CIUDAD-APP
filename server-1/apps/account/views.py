from rest_framework import generics
from .serializers import UserAccountSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Account

class UserAccountListView(generics.ListAPIView):
    queryset = Account.objects.all()
    serializer_class = UserAccountSerializer

class UserAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = UserAccountSerializer
    