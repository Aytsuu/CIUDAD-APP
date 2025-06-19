from rest_framework import generics, status
from django.db import transaction
from apps.pagination import StandardResultsPagination
from ..models import RequestRegistration
from ..serializers.request_registration_serializers import *

class RequestTableView(generics.ListAPIView):
  serializer_class = RequestTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = RequestRegistration.objects.all()
    

    return queryset
  
class RequestFileCreateView(generics.CreateAPIView):
  serializer_class = RequestBaseSerializer
  queryset = RequestRegistration.objects.all()

  @transaction.atomic
  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    instances = [
      RequestFileBaseSerializer(**item)
      for item in serializer.validated_data
    ]

    create_instances = RequestFile.objects.bulk_create(instances)
    return create_instances