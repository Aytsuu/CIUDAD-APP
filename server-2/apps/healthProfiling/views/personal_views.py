from rest_framework import generics
from rest_framework.response import Response
from ..serializers.personal_serializers import *
from ..models import *

class PersonalCreateView(generics.CreateAPIView):
  serializer_class = PersonalBaseSerializer
  queryset=Personal.objects.all()

  def perform_create(self, serializer):
    serializer.save()

class PersonalUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = PersonalUpdateSerializer
    queryset = Personal.objects.all()
    lookup_field = 'per_id'
