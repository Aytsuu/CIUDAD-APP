from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers.resident_profile_serializers import *
from django.db.models import Prefetch, Q
from apps.pagination import *
from apps.account.models import *

class ResidentProfileTableView(generics.ListCreateAPIView):
    serializer_class = ResidentProfileTableSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = ResidentProfile.objects.select_related(
          'per',
        ).prefetch_related(
            Prefetch('family_compositions', 
                queryset=FamilyComposition.objects.select_related(
                    'fam',
                    'fam__hh',
                ).only('fam')),
        ).only(
          'rp_id',
          'rp_date_registered',
          'per__per_lname',
          'per__per_fname',
          'per__per_mname',
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(per__per_lname__icontains=search_query) |
                Q(per__per_fname__icontains=search_query) |
                Q(per__per_mname__icontains=search_query) |
                Q(rp_id__icontains=search_query) |
                Q(family_compositions__fam__hh__hh_id__icontains=search_query)).distinct()

        return queryset
    
class ResidentPersonalCreateView(generics.CreateAPIView):
    serializer_class = ResidentPersonalCreateSerializer
    queryset = ResidentProfile.objects.all()

class ResidentPersonalInfoView(generics.RetrieveAPIView):
    serializer_class = ResidentPersonalInfoSerializer
    queryset=ResidentProfile.objects.all()
    lookup_field='rp_id'

class ResidentProfileListExcludeFamView(generics.ListAPIView):
    serializer_class = ResidentProfileListSerializer
    
    def get_queryset(self):
        excluded_fam_id = self.kwargs.get('fam_id', None)
        is_staff = self.request.query_params.get('is_staff', False).lower() == "true"
        if excluded_fam_id:
            return ResidentProfile.objects.filter(~Q(family_compositions__fam_id=excluded_fam_id))
        
        if is_staff:
            from apps.administration.models import Staff
            staffs = Staff.objects.all()
            residents = ResidentProfile.objects.all()
            
            filtered_residents = [
                res for res in residents 
                if res.rp_id not in
                [staff.staff_id for staff in staffs]
            ]

            return filtered_residents
        
        return ResidentProfile.objects.all()
    
class ResidentProfileFamSpecificListView(generics.ListAPIView):
    serializer_class = ResidentProfileListSerializer
    
    def get_queryset(self):
        fam_id = self.kwargs['fam']
        return ResidentProfile.objects.filter(family_compositions__fam_id=fam_id)

# For verification in link registration
class LinkRegVerificationView(APIView):

    def post(self, request):
        residentId = request.data.get('resident_id')
        profile = ResidentProfile.objects.filter(rp_id=residentId).first()
        if not profile:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        dob = profile.per.per_dob
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if age < 13:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        return Response(status=status.HTTP_200_OK, data=profile)
        