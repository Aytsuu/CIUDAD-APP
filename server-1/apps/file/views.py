from django.shortcuts import render
from rest_framework import generics
from .serializers.base import *
from .models import *

class FileView(generics.ListCreateAPIView):
  serializer_class = FileSerializer
  queryset = File.objects.all()

