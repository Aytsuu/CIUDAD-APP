from rest_framework import generics, status
from rest_framework.response import Response
from ..serializers.resident_profile_serializers import *
from django.db.models import Prefetch, Q
from ..pagination import *
from apps.account.models import *

class ResidentProfileCreateView(generics.CreateAPIView):
  serializer_class = ResidentProfileBaseSerializer
  queryset=ResidentProfile.objects.all()

  def perform_create(self, serializer):
    serializer.save()

class ResidentProfileTableView(generics.ListCreateAPIView):
    serializer_class = ResidentProfileTableSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = ResidentProfile.objects.select_related(
            'per',
            'staff',
        ).prefetch_related(
            Prefetch('family_compositions', 
                   queryset=FamilyComposition.objects.select_related(
                       'fam',
                       'fam__hh',
                       'fam__hh__sitio'
                   ).only('fam')),
        ).only(
            'rp_id',
            'rp_date_registered',
            'per__per_lname',
            'per__per_fname',
            'per__per_mname',
            'per__per_suffix',
            'staff__staff_id',
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(per__per_lname__icontains=search_query) |
                Q(per__per_fname__icontains=search_query) |
                Q(per__per_mname__icontains=search_query) |
                Q(rp_id__icontains=search_query) |
                Q(family_compositions__fam__hh__hh_id__icontains=search_query) |
                Q(family_compositions__fam__hh__sitio__sitio_name__icontains=search_query)
            ).distinct()

        return queryset
    
class ResidentPersonalCreateView(generics.CreateAPIView):
    serializer_class = ResidentPersonalCreateSerializer
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class ResidentPersonalInfoView(generics.RetrieveAPIView):
    serializer_class = ResidentPersonalInfoSerializer
    queryset=ResidentProfile.objects.all()
    lookup_field='rp_id'

class ResidentProfileListView(generics.ListAPIView):
    serializer_class = ResidentProfileListSerializer
    
    def get_queryset(self):
        excluded_fam_id = self.kwargs.get('fam_id', None)
        if excluded_fam_id:
            return ResidentProfile.objects.filter(~Q(family_compositions__fam_id=excluded_fam_id))
        
        return ResidentProfile.objects.all()
   
