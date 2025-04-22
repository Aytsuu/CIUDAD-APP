from rest_framework import generics, status
from rest_framework.response import Response
from ..serializers.resident_profile_serializers import *
from django.db.models import Prefetch, Q
from ..pagination import *

class ResidentProfileCreateView(generics.CreateAPIView):
  serializer_class = ResidentProfileSerializer
  queryset=ResidentProfile.objects.all()

  def perform_create(self, serializer):
    serializer.save()

class ResidentProfileTableView(generics.ListCreateAPIView):
    serializer_class = ResidentProfileTableSerializer
    pagination_class = StandardResultsPagination

    def get(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

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
                   ).only('fam'))
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
    
class ResidentPersonalCreateSerializer(generics.CreateAPIView):
    serializer_class = ResidentPersonalCreateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)