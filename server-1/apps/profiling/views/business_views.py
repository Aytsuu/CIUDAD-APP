from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Q
from ..models import Business, BusinessFile
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
    ).only(
      'bus_id',
      'bus_name',
      'bus_date_registered',
      'bus_respondentLname',
      'bus_respondentFname',
      'bus_respondentMname',
      'bus_respondentSex',
      'bus_respondentDob',
      'staff',
      'add__sitio__sitio_name',
      'add__add_street'
    )

    search_query = self.request.query_params.get('search', '').strip()
    if search_query:
      queryset = queryset.filter(
        Q(bus_id__icontains=search_query) |
        Q(bus_name__icontains=search_query) |
        Q(bus_date_registered__icontains=search_query) |
        Q(bus_respondentLname__icontains=search_query) |
        Q(bus_respondentFname__icontains=search_query) |
        Q(bus_respondentMname__icontains=search_query) |
        Q(add__sitio__sitio_name__icontains=search_query) |
        Q(add__add_street__icontains=search_query) 
      )

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

class BusinessUpdateView(generics.UpdateAPIView):
  serializer_class = BusinessCreateUpdateSerializer
  queryset = Business.objects.all()
  lookup_field = 'bus_id'