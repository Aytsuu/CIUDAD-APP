from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from ..models import Business, BusinessFile
from apps.account.models import Account
from ..serializers.business_serializers import *
from apps.pagination import StandardResultsPagination

class BusRespondentCreateView(generics.CreateAPIView):
  serializer_class = BusinessRespondentBaseSerializer
  queryset = BusinessRespondent.objects.all()

class BusinessCreateView(generics.CreateAPIView):
  serializer_class = BusinessCreateUpdateSerializer
  queryset = Business.objects.all()

class ActiveBusinessTableView(generics.ListAPIView):
  serializer_class = BusinessTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = Business.objects.filter(~Q(bus_status='Pending')).select_related(
      'add',
      'staff',
    ).prefetch_related(
      'business_files'
    ).only(
      'bus_id',
      'bus_name',
      'bus_gross_sales',
      'bus_date_verified',
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
  
class PendingBusinessTableView(generics.ListAPIView):
  serializer_class = BusinessTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = Business.objects.filter(bus_status='Pending')

    return queryset
  
class BusinessRespondentTableView(generics.ListAPIView):
  serializer_class = BusinessRespondentTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = BusinessRespondent.objects.all()

    return queryset


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
  
class BusinessInfoView(generics.RetrieveAPIView):
  serializer_class = BusinessInfoSerializer
  queryset = Business.objects.all()
  lookup_field = 'bus_id'

class BusinessRespondentInfoView(generics.RetrieveAPIView):
  serializer_class = BusinessRespondentInfoSerializer
  queryset = BusinessRespondent.objects.all()
  lookup_field = 'br_id'

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

class SpecificOwnerView(generics.ListAPIView):
  serializer_class = ForSpecificOwnerSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
      rp = self.request.query_params.get('rp')
      br = self.request.query_params.get('br')

      if rp:
          return Business.objects.filter(rp=rp)
      elif br:
          return Business.objects.filter(br=br)
      else:
          return Business.objects.none()

