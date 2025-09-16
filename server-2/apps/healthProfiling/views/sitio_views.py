from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from ..serializers.sitio_serializers import *

class SitioListView(generics.ListAPIView):
  serializer_class = SitioBaseSerializer
  queryset = Sitio.objects.all()

class SitioCreateView(generics.CreateAPIView):
  serializer_class = SitioBaseSerializer
  queryset = Sitio.objects.all()

  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)

    instances = [Sitio(**item) for item in serializer.validated_data]
    created_instances = Sitio.objects.bulk_create(instances)
    
    if len(created_instances) > 0:
      return Response(data=SitioBaseSerializer(created_instances, many=True).data, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST)
  
class SitioDeleteView(generics.DestroyAPIView):
  serializer_class = SitioBaseSerializer
  queryset = Sitio.objects.all()
  lookup_field = "sitio_id"