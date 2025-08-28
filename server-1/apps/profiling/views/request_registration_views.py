from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q, Count
from apps.pagination import StandardResultsPagination
from ..models import RequestRegistration
from ..serializers.request_registration_serializers import *
from rest_framework.permissions import AllowAny

class RequestTableView(generics.ListAPIView):
  permission_classes = [AllowAny]
  serializer_class = RequestTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    request_type = self.request.query_params.get('request_type', None) 

    queryset = RequestRegistration.objects.prefetch_related(
      'request_composition__per__personal_addresses__add'
    ).only(
      'req_id',
      'req_date',
      'request_composition__per__per_lname',
      'request_composition__per__per_fname',
      'request_composition__per__per_mname'
    )
    
    # Filter by request type
    if request_type == 'individual':
      queryset = queryset.annotate(comp_count=Count('request_composition')).filter(comp_count=1)
    elif request_type == 'family':
      queryset = queryset.annotate(comp_count=Count('request_composition')).filter(comp_count__gt=1)


    search_query = self.request.query_params.get('search', '').strip()
    if search_query:
      queryset = queryset.filter(
        Q(req_id__icontains=search_query) |
        Q(req_date__icontains=search_query) |
        Q(request_composition__per__per_lname__icontains=search_query) |
        Q(request_composition__per__per_fname__icontains=search_query) |
        Q(request_composition__per__per_mname__icontains=search_query)).distinct()
      
    return queryset.filter(req_is_archive=False)

class RequestCreateView(generics.CreateAPIView):
  permission_classes = [AllowAny]
  serializer_class = RequestCreateSerializer
  queryset = RequestRegistration.objects.all()

class RequestDeleteView(generics.DestroyAPIView):
  permission_classes = [AllowAny]
  serializer_class = RequestBaseSerializer
  queryset = RequestRegistration.objects.all()
  lookup_field = 'req_id'

class RequestCountView(APIView):
  permission_classes = [AllowAny]
  def get(self, request, *args, **kwargs):
    return Response(RequestRegistration.objects.count())