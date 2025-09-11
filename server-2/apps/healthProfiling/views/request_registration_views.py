from rest_framework import generics, status
from rest_framework.response import Response
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

class RequestCreateView(generics.CreateAPIView):
  serializer_class = RequestBaseSerializer
  queryset = RequestRegistration.objects.all()


class RequestFileCreateView(generics.CreateAPIView):
  serializer_class = RequestFileBaseSerializer
  queryset = RequestFile.objects.all()

  @transaction.atomic
  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)

    instances = [
      RequestFile(**item)
      for item in serializer.validated_data
    ]

    created_instances = RequestFile.objects.bulk_create(instances)
    return (Response(status=status.HTTP_200_OK) if len(created_instances) > 0 
            else Response(status=status.HTTP_400_BAD_REQUEST))