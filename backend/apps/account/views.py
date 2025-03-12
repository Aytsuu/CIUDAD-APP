from django.shortcuts import render
from rest_framework import generics
from .serializers import *

# Create your views here.
class AccountView(generics.ListCreateAPIView):
    serializer_class = AccountSerializer
    
    def get_queryset(self):
        return Account.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()