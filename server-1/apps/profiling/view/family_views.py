from rest_framework import generics
from django.db.models import Prefetch, Q
from ..serializers.family_serializers import *
from ..serializers.resident_profile_serializers import *
from ..pagination import *

class FamilyTableView(generics.ListCreateAPIView):
  serializer_class = FamilyTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = Family.objects.select_related('staff').prefetch_related(
      Prefetch('family_compositions', 
              queryset=FamilyComposition.objects.select_related('fam').only('fam'))
    ).only(
      'fam_id',
      'fam_date_registered',
      'fam_building',
      'fam_indigenous',
      'staff__staff_id',
    )

    search_query = self.request.query_params.get('search', '').strip()
    if search_query:
      queryset = queryset.filter(
        Q(fam_id__icontains=search_query) |
        Q(fam_date_registered__icontains=search_query) |
        Q(fam_building__icontains=search_query) |
        Q(fam_indigenous__icontains=search_query) 
      ).distinct()
      
    return queryset
  
class FamilyDataView(generics.RetrieveAPIView):
  serializer_class = FamilyTableSerializer
  lookup_field = 'fam_id'
  
  def get_queryset(self):
    fam_id = self.kwargs['fam_id']
    return Family.objects.filter(fam_id=fam_id)
  
class FamilyCreateView(generics.CreateAPIView):
  serializer_class = FamilyCreateSerializer
  
  def create(self, request, *args, **kwargs):
    return super().create(request, *args, **kwargs)

class FamilyFilteredByHouseholdView(generics.ListAPIView):
  serializer_class = FamilyListSerializer
  lookup_field = 'hh'
  
  def get_queryset(self):
    household_no = self.kwargs['hh']
    return Family.objects.filter(hh=household_no)
