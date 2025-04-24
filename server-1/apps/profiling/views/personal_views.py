from rest_framework import generics
from ..serializers.personal_serializers import *
from ..models import *

class PersonalCreateView(generics.CreateAPIView):
  serializer_class = PersonalBaseSerializer
  queryset=Personal.objects.all()

  def perform_create(self, serializer):
    serializer.save()