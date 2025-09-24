from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from ..serializers.sitio_serializers import *
from ..double_queries import *
from django.db import transaction

class SitioListView(generics.ListAPIView):
  serializer_class = SitioBaseSerializer
  queryset = Sitio.objects.all()

class SitioCreateView(generics.CreateAPIView):
  serializer_class = SitioBaseSerializer
  queryset = Sitio.objects.all()
  
  @transaction.atomic
  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)

    instances = [Sitio(**item) for item in serializer.validated_data]
    created_instances = Sitio.objects.bulk_create(instances)
    
    if len(created_instances) > 0:
      double_queries = PostQueries()
      response = double_queries.sitio(request.data)
      if not response.ok:
        try:
          error_details = response.json()
        except ValueError:
          error_details = response.text
        raise serializers.ValidationError({"error": error_details })
      return Response(data=SitioBaseSerializer(created_instances, many=True).data, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST)
  
class SitioDeleteView(generics.DestroyAPIView):
  serializer_class = SitioBaseSerializer
  queryset = Sitio.objects.all()
  lookup_field = "sitio_id"

  def delete(self, request, *args, **kwargs):
    instance = self.get_object()
    sitio_id = instance.sitio_id
    instance.delete()

    double_queries = DeleteQueries()
    response = double_queries.sitio(sitio_id)
    if not response.ok:
      try:
        error_details = response.json()
      except ValueError:
        error_details = response.text
      raise serializers.ValidationError({"error": error_details})
    return Response(status=status.HTTP_200_OK)
