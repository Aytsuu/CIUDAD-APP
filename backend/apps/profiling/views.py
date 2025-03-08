from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import *

# Create your views here.
class PersonalView(generics.ListCreateAPIView):
    serializer_class = PersonalSerializer
    
    def get_queryset(self):
        return Personal.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()