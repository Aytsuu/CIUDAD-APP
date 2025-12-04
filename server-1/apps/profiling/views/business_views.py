from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q, Count
from ..models import Business, BusinessFile
from apps.account.models import Account
from ..serializers.business_serializers import *
from apps.pagination import StandardResultsPagination
from ..utils import generate_busrespondent_no


class BusinessCreateView(generics.CreateAPIView):
  permission_classes = [AllowAny]
  serializer_class = BusinessCreateUpdateSerializer
  queryset = Business.objects.all()

class BRCreateView(APIView):
  @transaction.atomic
  def post(self, request, *args, **kwargs):
    data = request.data
    acc = data.pop("acc", None)
    
    respondent = BusinessRespondent.objects.create(
      **data,
      br_id=generate_busrespondent_no(),
    )

    if acc and respondent:
      account = Account.objects.create_user(
        phone=acc.get('phone'),
        email=acc.get('email',None),
        br=respondent,
        username=acc.get('phone'),
        password='!'
      )

      if account:
        return Response(BusinessRespondentBaseSerializer(respondent).data, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST)

class ActiveBusinessTableView(generics.ListAPIView):
  permission_classes = [AllowAny]
  serializer_class = BusinessTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    search_query = self.request.query_params.get('search', '').strip()
    size = self.request.query_params.get('size', None)

    queryset = Business.objects.filter(~Q(bus_status='PENDING')).select_related(
      'staff',
    ).prefetch_related(
      'business_files'
    ).only(
      'bus_id',
      'bus_name',
      'bus_gross_sales',
      'bus_location',
      'bus_date_verified',
      'staff__rp__per__per_lname',
      'staff__rp__per__per_fname',
      'staff__rp__per__per_mname',
    )

    if size and size != "all":
      if size == "micro":
        queryset = queryset.filter(bus_gross_sales__lt=3000000)
      elif size == "small":
        queryset = queryset.filter(Q(bus_gross_sales__gte=3000000) & Q(bus_gross_sales__lt=20000000))
      elif size == "medium":
        queryset = queryset.filter(Q(bus_gross_sales__gte=20000000) & Q(bus_gross_sales__lt=1000000000))
      else:
        queryset = queryset.filter(bus_gross_sales__gte=1000000000)

    if search_query:
      queryset = queryset.filter(
        Q(bus_id__icontains=search_query) |
        Q(bus_name__icontains=search_query) |
        Q(bus_gross_sales__icontains=search_query) |
        Q(bus_location=search_query) 
      ).distinct()

    return queryset.order_by('-bus_id')
  
class PendingBusinessTableView(generics.ListAPIView):
  permission_classes = [AllowAny]
  serializer_class = BusinessTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = Business.objects.filter(bus_status='PENDING')

    return queryset
  
class BusinessRespondentTableView(generics.ListAPIView):
  permission_classes = [AllowAny]
  serializer_class = BusinessRespondentTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = BusinessRespondent.objects.annotate(
      business_count=Count('owned_business')
    ).filter(business_count__gt=0)

    search = self.request.query_params.get('search', '').strip()
    if search:
      queryset = queryset.filter(
        Q(br_lname__icontains=search) | 
        Q(br_fname__icontains=search) | 
        Q(br_mname__icontains=search)
      )

    return queryset.order_by('-br_id')


class BusinessFileCreateView(generics.CreateAPIView):
  permission_classes = [AllowAny]
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
  permission_classes = [AllowAny]
  serializer_class = BusinessInfoSerializer
  queryset = Business.objects.all()
  lookup_field = 'bus_id'

class BusinessRespondentInfoView(generics.RetrieveAPIView):
  permission_classes = [AllowAny]
  serializer_class = BusinessRespondentInfoSerializer
  queryset = BusinessRespondent.objects.all()
  lookup_field = 'br_id'

class BusinessUpdateView(generics.UpdateAPIView):
  permission_classes = [AllowAny]
  serializer_class = BusinessCreateUpdateSerializer
  queryset = Business.objects.all()
  lookup_field = 'bus_id'

  def update(self, request, *args, **kwargs):
    super().update(request, *args, **kwargs)  # performs the update
    instance = self.get_object()
    return Response(BusinessInfoSerializer(instance).data)

class VerifyBusinessRespondent(APIView):
  permission_classes = [AllowAny]
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
  permission_classes = [AllowAny]
  serializer_class = ForSpecificOwnerSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
      rp = self.request.query_params.get('rp')
      br = self.request.query_params.get('br')

      # Build query to match businesses by either rp or br (or both)
      query_filter = Q()
      if rp:
          query_filter |= Q(rp=rp)
      if br:
          query_filter |= Q(br=br)
      
      if query_filter:
          queryset = Business.objects.filter(query_filter)
      else:
          queryset = Business.objects.none()

      search = self.request.query_params.get("search", "").strip()
      if search:
        queryset = queryset.filter(
          Q(bus_name__icontains=search)
        )
      
      return queryset

class BusinessModificationCreateView(generics.CreateAPIView):
  permission_classes = [AllowAny]
  serializer_class = BusinessModificationCreateSerializer
  queryset = BusinessModification.objects.all()

  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    instance = serializer.save()

    return Response(
        BusinessModificationListSerializer(instance).data,
        status=status.HTTP_200_OK
    )

class BusinessModificationListView(generics.ListAPIView):
  permission_classes = [AllowAny]
  serializer_class = BusinessModificationListSerializer
  queryset = BusinessModification.objects.all()

class BusinessModificationDeleteView(generics.DestroyAPIView):
  permission_classes = [AllowAny]
  serializer_class = BusinessModificationBaseSerializer
  queryset = BusinessModification.objects.all()

class BusinessModificationUpdateView(generics.UpdateAPIView):
  permission_classes = [AllowAny]
  serializer_class = BusinessModificationBaseSerializer
  queryset = BusinessModification.objects.all()
  lookup_field = 'bm_id'

  def update(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=True)
    
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST)
  
class BusinessHistoryView(APIView):
  permission_classes = [AllowAny]
  def get(self, request, *args, **kwargs):
    bus_id = request.query_params.get('bus_id', None)

    if bus_id:
      query = Business.history.filter(bus_id=bus_id, bus_status='ACTIVE')
      return Response(data=BusinessHistoryBaseSerializer(query, many=True).data, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_404_NOT_FOUND)