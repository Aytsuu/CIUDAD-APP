from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q
from apps.pagination import StandardResultsPagination
from utils.email import send_email
from ..models import RequestRegistration
from ..serializers.request_registration_serializers import *

class RequestTableView(generics.ListAPIView):
  serializer_class = RequestTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = RequestRegistration.objects.select_related(
      'per'
    ).prefetch_related(
      'per__personal_addresses__add'
    ).only(
      'req_id',
      'req_date',
      'per__per_lname',
      'per__per_fname',
      'per__per_mname'
    )

    search_query = self.request.query_params.get('search', '').strip()
    if search_query:
      queryset = queryset.filter(
        Q(req_id__icontains=search_query) |
        Q(req_date__icontains=search_query) |
        Q(per__per_lname__icontains=search_query) |
        Q(per__per_fname__icontains=search_query) |
        Q(per__per_mname__icontains=search_query)).distinct()
      
    return queryset.filter(req_is_archive=False)

class RequestCreateView(generics.CreateAPIView):
  serializer_class = RequestCreateSerializer
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

class RequestDeleteView(generics.DestroyAPIView):
  serializer_class = RequestBaseSerializer
  queryset = RequestRegistration.objects.all()
  lookup_field = 'req_id'

  def delete(self, request, *args, **kwargs):
    reason = request.query_params.get('reason', None)
    instance = self.get_object()
    recipient_email = instance.acc.email
    if recipient_email:
      context = {
        "reason": reason,
      }

      send_email("Request Result", context, recipient_email, 'request_rejection.html')
      self.perform_destroy(instance)
      
    return Response(status=status.HTTP_204_NO_CONTENT)


class RequestCountView(APIView):
  def get(self, request, *args, **kwargs):
    return Response(RequestRegistration.objects.count())