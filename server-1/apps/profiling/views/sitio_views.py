from rest_framework import generics
from ..serializers.sitio_serializers import *

class SitioListView(generics.ListCreateAPIView):
  serializer_class = SitioBaseSerializer
  queryset = Sitio.objects.all()
  
