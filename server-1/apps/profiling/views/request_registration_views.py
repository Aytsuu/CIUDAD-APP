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

    queryset = RequestRegistration.objects.filter(~Q(req_is_archive=True)).prefetch_related(
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

class RequestCreateView(APIView):
  permission_classes = [AllowAny]

  @transaction.atomic
  def post(self, request, *args, **kwargs):
    comp = request.data.get('comp', None)
    request = RequestRegistration.objects.create()
    new_comp = []
    for data in comp:
      try: 
        new_data = { 
          'rrc_fam_role': data['role'],
          'per': self.create_personal_info(data['per']),
          'req': request
        } 
                
        if 'acc' in data:  
          acc = data['acc']  
          account = Account.objects.create(
              email=acc.get('email', None),
              phone=acc.get('phone', None),
              username=acc['username'],
              password=acc['password']
          )

          new_data['acc'] = account

      except Exception as e:
        print(f"Error processing composition: {str(e)}")
        raise serializers.ValidationError(str(e))
      
      new_comp.append(
        RequestRegistrationComposition(**new_data)
      )
    
    if len(new_comp) > 0:
      RequestRegistrationComposition.objects.bulk_create(new_comp)
      return Response(data=RequestBaseSerializer(request).data, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST)

  def create_personal_info(self, personal, staff=None):
    addresses = personal.pop("per_addresses", None)
    add_instances = [
      Address.objects.get_or_create(
        add_province=add["add_province"],
        add_city=add["add_city"],
        add_barangay = add["add_barangay"],
        sitio=Sitio.objects.filter(sitio_id=add["sitio"]).first(),
        add_external_sitio=add["add_external_sitio"],
        add_street=add["add_street"]
      )[0]
      for add in addresses
    ]

    # Create Personal record
    per_instance = Personal(**personal)
    per_instance._history_user = staff
    per_instance.save()

    try:
      latest_history = per_instance.history.latest()
      history_id = latest_history.history_id
    except per_instance.history.model.DoesNotExist:
      history_id = None  

    for add in add_instances:
      PersonalAddress.objects.create(add=add, per=per_instance) 
      history = PersonalAddressHistory(add=add, per=per_instance)
      history.history_id=history_id
      history.save()
    
    return per_instance

class RequestDeleteView(generics.DestroyAPIView):
  permission_classes = [AllowAny]
  serializer_class = RequestBaseSerializer
  queryset = RequestRegistration.objects.all()
  lookup_field = 'req_id'

class RequestCountView(APIView):
  permission_classes = [AllowAny]
  def get(self, request, *args, **kwargs):
    return Response(RequestRegistration.objects.filter(~Q(req_is_archive=True)).count())