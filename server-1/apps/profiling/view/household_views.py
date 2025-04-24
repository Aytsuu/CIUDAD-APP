from rest_framework import generics
from django.db.models import Q
from ..serializers.household_serializers import *
from ..pagination import *

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
    queryset = Household.objects.all()
    search_query = self.request.query_params.get('search', '').strip()
    if search_query:
      queryset = queryset.filter(
        Q(hh_id__icontains=search_query) |
        Q(sitio__icontains=search_query) |
        Q(total_families__icontains=search_query) |
        Q(street__icontains=search_query) |
        Q(nhts__icontains=search_query) |
        Q(head__icontains=search_query )
      ).distinct()

    return queryset

class HouseholdCreateView(generics.CreateAPIView):
  serializer_class = HouseholdCreateSerializer
  
  def create(self, request, *args, **kwargs):
    return super().create(request, *args, **kwargs)

    