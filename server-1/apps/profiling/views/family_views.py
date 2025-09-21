from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Prefetch, Q, Count, Value, CharField, Subquery, OuterRef, F
from django.db.models.functions import Coalesce, Concat
from ..serializers.family_serializers import *
from ..serializers.resident_profile_serializers import *
from apps.pagination import *

class FamilyTableView(generics.ListCreateAPIView):
  permission_classes = [AllowAny]
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

        queryset = Family.objects.select_related('staff', 'hh__add__sitio').prefetch_related(
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
        ).filter(
           members__gt=0
        ).only(
            'fam_id',
            'fam_date_registered',
            'fam_building',
            'fam_indigenous',
            'staff__staff_id',
            'staff__staff_type',
            'hh__hh_id',
            'hh__add__sitio__sitio_name',
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
  permission_classes = [AllowAny]
  serializer_class = FamilyTableSerializer # To be modified
  lookup_field = 'fam_id'
  
  def get_queryset(self):
    fam_id = self.kwargs['fam_id']
    return Family.objects.filter(fam_id=fam_id)
  
class FamilyCreateView(generics.CreateAPIView):
  permission_classes = [AllowAny]
  serializer_class = FamilyCreateSerializer
  queryset = Family.objects.all()

class FamilyFilteredByHouseholdView(generics.ListAPIView):
  permission_classes = [AllowAny]
  serializer_class = FamilyListSerializer
  lookup_field = 'hh'
  
  def get_queryset(self):
    household_no = self.kwargs['hh']
    return Family.objects.annotate(
       members=Count('family_compositions')
    ).filter(hh=household_no, members__gt=0)
  
class FamilyUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = FamilyBaseSerializer
    queryset = Family.objects.all()
    lookup_field = 'fam_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyFamily(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
      fam_id = request.data.get('fam_id')
      exists = Family.objects.filter(fam_id=fam_id).first()

      if exists:
         return Response(status=status.HTTP_200_OK)
      
      return Response(status=status.HTTP_404_NOT_FOUND)

         
    