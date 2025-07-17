from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from ..models import Business, BusinessFile
from apps.account.models import Account
from ..serializers.business_serializers import *
from apps.pagination import StandardResultsPagination

class BusinessCreateView(generics.CreateAPIView):
  serializer_class = BusinessCreateUpdateSerializer
  queryset = Business.objects.all()

class BusinessTableView(generics.ListAPIView):
  serializer_class = BusinessTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = Business.objects.select_related(
      'add',
      'staff',
    ).prefetch_related(
      'business_files'
    ).only(
      'bus_id',
      'bus_name',
      'bus_gross_sales',
      'bus_date_registered',
      'staff__rp__per__per_lname',
      'staff__rp__per__per_fname',
      'staff__rp__per__per_mname',
      'add__sitio__sitio_name',
      'add__add_street'
    )

    search_query = self.request.query_params.get('search', '').strip()
    if search_query:
      queryset = queryset.filter(
        Q(bus_id__icontains=search_query) |
        Q(bus_name__icontains=search_query) |
        Q(bus_gross_sales__icontains=search_query) |
        Q(bus_date_registered__icontains=search_query) |
        Q(add__sitio__sitio_name__icontains=search_query) |
        Q(add__add_street__icontains=search_query) 
      ).distinct()

    return queryset.order_by('bus_id')

class BusinessFileCreateView(generics.CreateAPIView):
  serializer_class = BusinessFileBaseSerializer
  queryset = BusinessFile.objects.all()

  def create(self, request, *args, **kwargs):
    serializer = BusinessFileBaseSerializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)

    instances = [
      BusinessFile(**item)
      for item in serializer.validated_data
    ]

    created_instances = BusinessFile.objects.bulk_create(instances)

    return Response(status=status.HTTP_201_CREATED, data=created_instances)

class BusinessUpdateView(generics.UpdateAPIView):
  serializer_class = BusinessCreateUpdateSerializer
  queryset = Business.objects.all()
  lookup_field = 'bus_id'

class VerifyBusinessRespondent(APIView):
  def post(self, request, *args, **kwargs):
    br_id = request.data.get('br_id',None)
    personal_info = request.data.get('personal_info', None)

    exists = None 
    has_account = None

    if br_id:
      exists = BusinessRespondent.objects.filter(br_id=br_id).first()
      if exists:
        has_account = Account.objects.filter(br=exists).first()
    elif personal_info:
      exists = BusinessRespondent.objects.filter(
        br_lname=personal_info['lname'],
        br_fname=personal_info['fname'],
        br_dob=personal_info['dob'],
        br_contact=personal_info['contact']
      ).first()
      if exists:
        has_account = Account.objects.filter(br=exists).first()
    
    if has_account:
      return Response(status=status.HTTP_409_CONFLICT)
    
    if exists:
      data = {
        'br_id': exists.br_id
      }
      return Response(data=data, status=status.HTTP_200_OK)
    
    return Response(status=status.HTTP_404_NOT_FOUND)