from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..serializers.sitio_serializers import *

class SitioListView(generics.ListCreateAPIView):
  permission_classes = [AllowAny]
  serializer_class = SitioBaseSerializer
  queryset = Sitio.objects.all()
  
