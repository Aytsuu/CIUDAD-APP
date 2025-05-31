#
#
#     NOTE: THIS FILE WILL BE REMOVED IN THE FUTURE (DEPRECATED)
#
#
#

from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import *
from .serializers.base import *
from .serializers.minimal import *
from .serializers.full import *

# Personal Views ------------------------------------------------------------------------
class PersonalView(generics.ListCreateAPIView):
    serializer_class = PersonalSerializer
    queryset = Personal.objects.all()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Skip the full model clean if not needed
        instance = Personal(**serializer.validated_data)
        instance.save(force_insert=True)

        response_data = serializer.data
        response_data['per_id'] = instance.per_id
        
        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

class PersonalUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = PersonalSerializer
    queryset = Personal.objects.all()
    lookup_field = 'per_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Family Views ------------------------------------------------------------------------
class FamilyView(generics.ListCreateAPIView):
    serializer_class = FamilyFullSerializer
    queryset = Family.objects.all()

class FamilyUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = FamilyFullSerializer
    queryset = Family.objects.all()
    lookup_field = 'fam_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Family Composition Views ------------------------------------------------------------
class FamilyCompositionView(generics.ListCreateAPIView):
    serializer_class = FamilyCompositionFullSerializer
    queryset = FamilyComposition.objects.all()

class FamilyCompositionDeleteView(generics.DestroyAPIView):
    serializer_class = FamilyCompositionSerializer
    queryset = FamilyComposition.objects.all()
    
    def get_object(self):
        fam_id = self.kwargs.get('fam')
        rp_id = self.kwargs.get('rp')

        obj = get_object_or_404(FamilyComposition, fam_id=fam_id, rp_id=rp_id)
        return obj

# Sitio Views --------------------------------------------------------------------------
class SitioView(generics.ListCreateAPIView):
    serializer_class = SitioSerializer
    queryset = Sitio.objects.all()

# Household Views ------------------------------------------------------------------------
class HouseholdView(generics.ListCreateAPIView):
    serializer_class = HouseholdFullSerializer
    queryset = Household.objects.all()  

# ResidentProfile Views -----------------------------------------------------------------
class ResidentProfileView(generics.ListCreateAPIView):
    serializer_class = ResidentProfileFullSerializer
    
    def get_queryset(self):
        """
        Optimized queryset with:
        - select_related for foreign keys
        - prefetch_related for many-to-many/reverse relations
        - only() to select specific fields
        - Annotated is_staff flag to avoid N+1 queries
        """
        from django.db.models import Exists, OuterRef
        from apps.administration.models import Staff

        base_query = ResidentProfile.objects.select_related(
            'per',
            'staff',
            'account',
        ).prefetch_related(
            'family_compositions',
            'family_compositions__fam',
            'staff_assignments'
        ).annotate(
            is_staff_flag=Exists(Staff.objects.filter(rp=OuterRef('pk'))),
        )
    
        if self.request.method == 'GET':
            return base_query.only(
                'rp_id',
                'rp_date_registered',
                'per__per_id',
                'staff__staff_id',
                'account__id'  # Must include all select_related fields used
            )
        return base_query

# Request Views --------------------------------------------------------------------------

class RequestRegistrationView(generics.ListCreateAPIView):
    serializer_class = RequestRegistrationSerializer
    queryset = RequestRegistration.objects.all()

class RequestDeleteView(generics.DestroyAPIView):
    serializer_class = RequestRegistrationSerializer
    queryset = RequestRegistration.objects.all()
    lookup_field = 'req_id'

class RequestFileView(generics.ListCreateAPIView):
    serializer_class = RequestFileMinimalSerializer
    queryset = RequestFile.objects.all()

# Business Views --------------------------------------------------------------------------
class BusinessView(generics.ListCreateAPIView):
    serializer_class = BusinessSerializer
    queryset = Business.objects.all()

class BusinessFileView(generics.ListCreateAPIView):
    serializer_class = BusinessFileSerializer
    queryset = BusinessFile.objects.all()
