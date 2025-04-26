from rest_framework import generics
from django.db.models import Prefetch, Q, Count, Value, CharField, Subquery, OuterRef, F
from django.db.models.functions import Coalesce, Concat
from ..serializers.family_serializers import *
from ..serializers.resident_profile_serializers import *
from ..pagination import *

class FamilyTableView(generics.ListCreateAPIView):
  serializer_class = FamilyTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
        # Prefetch family compositions with related person data
        family_compositions = FamilyComposition.objects.select_related(
            'rp__per' 
        ).only(
            'fam', 'fc_role', 'rp__per__per_fname', 'rp__per__per_lname', 'rp__per__per_mname'
        )

        full_name = Concat(
           'rp__per__per_lname', Value(', '),
           'rp__per__per_fname', Value(' '),
           'rp__per__per_mname',
           output_field=CharField()

        )

        queryset = Family.objects.select_related('staff').prefetch_related(
            Prefetch('family_compositions', queryset=family_compositions)
        ).annotate(
            members=Count('family_compositions'),
            father=Coalesce(
                Subquery(
                    family_compositions.filter(
                        fam=OuterRef('pk'), 
                        fc_role='Father'
                    ).annotate(name=full_name).values('name')[:1],
                    output_field=CharField()
                ),
                Value('')
            ),
            mother=Coalesce(
                Subquery(
                    family_compositions.filter(
                        fam=OuterRef('pk'), 
                        fc_role='Mother'
                    ).annotate(name=full_name).values('name')[:1],
                    output_field=CharField()
                ),
                Value('')
            ), 
            guardian=Coalesce(
                Subquery(
                    family_compositions.filter(
                        fam=OuterRef('pk'), 
                        fc_role='Guardian'
                    ).annotate(name=full_name).values('name')[:1],
                    output_field=CharField()
                ),
                Value('')
            )
        ).only(
            'fam_id',
            'fam_date_registered',
            'fam_building',
            'staff__staff_id',
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(fam_id__icontains=search_query) |
                Q(fam_date_registered__icontains=search_query) |
                Q(fam_building__icontains=search_query) |
                Q(family_compositions__rp__per__per_fname__icontains=search_query) | 
                Q(family_compositions__rp__per__per_lname__icontains=search_query) |
                Q(family_compositions__rp__per__per_mname__icontains=search_query) |
                Q(family_compositions__rp__rp_id__icontains=search_query)
            ).distinct()

        return queryset
  
class FamilyDataView(generics.RetrieveAPIView):
  serializer_class = FamilyTableSerializer # To be modified
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
