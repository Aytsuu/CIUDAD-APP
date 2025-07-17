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
                ).only(
                    'fam',
                    'fam__hh__hh_id', # Only what's needed for search
                )),
            Prefetch('per__personal_addresses',
                queryset=PersonalAddress.objects.select_related(
                    'add',
                    'add__sitio',
                ).only(
                    'add__sitio__sitio_name',  # Only what's needed for search
                ))
        ).only(
          'rp_id',
          'rp_date_registered',
          'per__per_lname',
          'per__per_fname',
          'per__per_mname',
          'per__per_sex',
          'per__per_dob'
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            if search_query.isdigit():
                queryset = queryset.filter(
                    Q(rp_id__icontains=search_query) |
                    Q(family_compositions__fam__hh__hh_id__icontains=search_query)
                ).distinct()
            else:
                # Split name into parts for more accurate matching
                name_parts = search_query.split()
                name_q = Q()
                for part in name_parts:
                    name_q &= (
                        Q(per__per_lname__icontains=part) |
                        Q(per__per_fname__icontains=part) |
                        Q(per__per_mname__icontains=part)
                    )
                
                queryset = queryset.filter(
                    name_q |
                    Q(per__personal_addresses__add__sitio__sitio_name__icontains=search_query)
                ).distinct()

        return queryset.order_by('rp_id')
    
class ResidentPersonalCreateView(generics.CreateAPIView):
    serializer_class = ResidentPersonalCreateSerializer
    queryset = ResidentProfile.objects.all()

class ResidentPersonalInfoView(generics.RetrieveAPIView):
    serializer_class = ResidentPersonalInfoSerializer
    queryset=ResidentProfile.objects.all()
    lookup_field='rp_id'

class ResidentProfileListWithOptions(generics.ListAPIView):
    serializer_class = ResidentProfileListSerializer
    
    def get_queryset(self):
        excluded_fam_id = self.kwargs.get('fam_id', None)
        is_staff = self.request.query_params.get('is_staff', "false").lower() == "true"
        exclude_independent = self.request.query_params.get('exclude_independent', "false").lower() == "true"

        # When adding new member to a family, the list shoud not contain members of the family
        if excluded_fam_id:
            return ResidentProfile.objects.filter(~Q(family_compositions__fam_id=excluded_fam_id))
        
        # For staff assignment, the list should not contain staff members
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

        # Family registration, living independently
        # Exclude those that are already registered as independent from the list
        if exclude_independent:
            return ResidentProfile.objects.filter(~Q(family_compositions__fc_role='Independent'))
        
        # Returns all residents by default if no parameters were provided 
        return ResidentProfile.objects.all()
    
class ResidentProfileFamSpecificListView(generics.ListAPIView):
    serializer_class = ResidentProfileListSerializer
    
    def get_queryset(self):
        fam_id = self.kwargs['fam']
        return ResidentProfile.objects.filter(family_compositions__fam_id=fam_id)

# For verification in link registration
class LinkRegVerificationView(APIView):
    def post(self, request, *args, **kwargs):
        rp_id = request.data.get('rp_id', None)
        personal_info = request.data.get('personal_info', None)

        if rp_id:
            exists = ResidentProfile.objects.filter(rp_id=rp_id).first()
            if exists:
                has_account = Account.objects.filter(rp=exists).first()
            else:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            exists = ResidentProfile.objects.filter(
                per__per_lname=personal_info['lname'],
                per__per_fname=personal_info['fname'],
                per__per_dob=personal_info['dob'],
                per__per_contact=personal_info['contact']
            ).first()
            if exists:
                has_account = Account.objects.filter(rp=exists).first()
            else:
                return Response(status=status.HTTP_404_NOT_FOUND)

        if has_account: 
            return Response(status=status.HTTP_409_CONFLICT)
        
        if exists:
            data = {
                'rp_id': exists.rp_id
            }
            return Response(data=data, status=status.HTTP_200_OK)
            
        return Response(status=status.HTTP_404_NOT_FOUND)
