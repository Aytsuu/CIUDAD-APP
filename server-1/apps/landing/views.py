from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import *

class LandingPageView(generics.RetrieveAPIView):
  serializer_class = LandingBaseSerializer
  queryset = LandingPage.objects.all()
  lookup_field = "lp_id"

class LandingPageUpdateView(generics.UpdateAPIView):
  serializer_class =  LandingUpdateSerializer
  queryset = LandingPage.objects.all()
  lookup_field = "lp_id"
  
