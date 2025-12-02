from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Q, Count
from ..serializers.household_serializers import *
from apps.pagination import *

class HouseholdListView(generics.ListAPIView):
  serializer_class = HouseholdListSerialzer
  
  def get_queryset(self):
    is_search = self.request.query_params.get('is_search', 'false') == 'true'
    if is_search:
      queryset = None
      search = self.request.query_params.get('search', '').strip()
      if search:
        queryset = Household.objects.filter(
            Q(hh_id__icontains=search) |
            Q(rp__per__per_lname__icontains=search) |
            Q(rp__per__per_fname__icontains=search) |
            Q(rp__per__per_mname__icontains=search)
        )
    else:
       return Household.objects.all()
    return queryset

class HouseholdDataView(generics.RetrieveAPIView):
   serializer_class = HouseholdListSerialzer
   queryset = Household.objects.all()
   lookup_field = 'hh_id'
  
class OwnedHousesListView(generics.ListAPIView):
    serializer_class = HouseholdTableSerializer

    def get_queryset(self):
        rp = self.kwargs.get("rp")
        return Household.objects.filter(rp=rp)


class HouseholdTableView(generics.ListAPIView):
  serializer_class = HouseholdTableSerializer
  pagination_class = StandardResultsPagination
  
  def get_queryset(self):
    # Request data
    search_query = self.request.query_params.get('search', '').strip()
    nhts = self.request.query_params.get('nhts', 'all')

    # Filtering
    queryset = Household.objects.select_related(
        'add',
        'staff'
    ).annotate(
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
        'rp__per__per_mname',
        'add__sitio__sitio_name',
        'add__add_street',
        'staff__staff_id',
        'staff__staff_type',
    )

    if nhts != 'all':
       queryset = queryset.filter(
          Q(hh_nhts__iexact=nhts)
       )

    if search_query:
        queryset = queryset.filter(
            Q(hh_id__icontains=search_query) |
            Q(add__sitio__sitio_name__icontains=search_query) |
            Q(add__add_street__icontains=search_query) |
            Q(hh_nhts__icontains=search_query) |
            Q(hh_date_registered__icontains=search_query) |
            Q(rp__per__per_lname__icontains=search_query) |
            Q(rp__per__per_fname__icontains=search_query) |
            Q(rp__per__per_mname__icontains=search_query) |  
            Q(family_count__icontains=search_query)
        ).distinct()

    return queryset.order_by('-hh_id')

class HouseholdCreateView(generics.CreateAPIView):
  serializer_class = HouseholdCreateSerializer
  queryset = Household.objects.all()

class HouseholdUpdateView(generics.UpdateAPIView):
  serializer_class = HouseholdBaseSerializer
  queryset = Household.objects.all()
  lookup_field = 'hh_id'

  def update(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        # Re-fetch the updated instance from the database (optional but recommended)
        instance.refresh_from_db()
        # Serialize the full instance
        return Response(HouseholdListSerialzer(instance).data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
