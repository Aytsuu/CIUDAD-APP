from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Q, Count
from ..serializers.household_serializers import *
from apps.pagination import *

class HouseholdListView(generics.ListAPIView):
  serializer_class = HouseholdListSerialzer
  
  def get_queryset(self):
    hh_id = self.kwargs.get('hh_id', None)
    if hh_id:
      return Household.objects.filter(hh_id=hh_id)

    return Household.objects.all()

class HouseholdTableView(generics.ListAPIView):
  serializer_class = HouseholdTableSerializer
  pagination_class = StandardResultsPagination
  
  def get_queryset(self):
        queryset = Household.objects.annotate(
           family_count=Count('family_set', distinct=True)
        ).prefetch_related(
            'family_set'  # For counting families (assuming Family has hh FK)
        ).only(
            'hh_id',
            'hh_nhts',
            'hh_date_registered',
            'rp__rp_id',
            'rp__per__per_lname',
            'rp__per__per_fname',
            'rp__per__per_mname'
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(hh_id__icontains=search_query) |
                Q(sitio__sitio_name__icontains=search_query) |
                Q(hh_street__icontains=search_query) |
                Q(hh_nhts__icontains=search_query) |
                Q(rp__per__per_lname__icontains=search_query) |
                Q(rp__per__per_fname__icontains=search_query) | 
                Q(family_count__icontains=search_query)
            ).distinct()

        return queryset

class HouseholdCreateView(generics.CreateAPIView):
  serializer_class = HouseholdCreateSerializer

class HouseholdUpdateView(generics.UpdateAPIView):
  serializer_class = HouseholdBaseSerializer
  queryset = Household.objects.all()
  lookup_field = 'hh_id'

  def update(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
