from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from ..serializers.resident_profile_serializers import *
from django.db.models import Prefetch, Q, F, Count, Value, CharField, Subquery, IntegerField, OuterRef, ExpressionWrapper, Func, BooleanField, Case, When
from django.db.models.functions import Concat, Length
from datetime import date
from apps.pagination import *
from apps.account.models import *

class ResidentProfileTableView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResidentProfileTableSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        search_query = self.request.query_params.get('search', '').strip()
        age = self.request.query_params.get('age', None).lower()
        voter = self.request.query_params.get('voter', None).lower()
        disable = self.request.query_params.get('disable', None).lower()

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
          'per__per_suffix',
          'per__per_dob',
          'per__per_disability',
          'per__per_is_deceased',
        )

        # Filter by age
        if age != "all":
            seconds_in_year = 365.25 * 24 * 60 * 60
            today = date.today()

            age_expression = ExpressionWrapper(
                Func(
                    today - F('per__per_dob'),
                    function='EXTRACT',
                    template="EXTRACT(EPOCH FROM %(expressions)s)"
                     
                ) / seconds_in_year, 
                output_field=IntegerField()
            )

            queryset = queryset.annotate(calculated_age=age_expression)

            if age == "child":
                queryset = queryset.filter(calculated_age__lte=14)
            elif age == "youth":
                queryset = queryset.filter(calculated_age__range=(15,24))
            elif age == "adult":
                queryset = queryset.filter(calculated_age__range=(25,64))
            else: 
                queryset = queryset.filter(calculated_age__gte=65)
        
        # Filter by voter status
        if voter != "all":
            if voter == "yes":
                queryset = queryset.filter(~Q(voter=None))
            elif voter == "no":
                queryset = queryset.filter(voter=None)
            else:
                name = Concat(
                    OuterRef('per__per_lname'), Value(', '),
                    OuterRef('per__per_fname'), Value(' '),
                    OuterRef('per__per_mname'),
                    output_field=CharField()
                )
                
                voter_match_count_subquery = Voter.objects.filter(
                    voter_name=name
                ).annotate(
                    count_matches=Count('pk')
                ).values('count_matches')[:1]

                queryset = queryset.annotate(
                    exist_count=Subquery(
                        voter_match_count_subquery,
                        output_field=IntegerField()
                    )
                )

                if voter == "link":
                    queryset = queryset.filter(exist_count=1)
                else:
                    queryset = queryset.filter(exist_count__gt=1)

        # Filter by disability status
        if disable != "all":
            
            disability_check_expression = Case(
                When(
                    **{
                        'per__per_disability__isnull': False,
                        'per__per_disability__gt': ''
                    },
                    then=Value(True)
                ),
                default=Value(False),
                output_field=BooleanField()
            )

            queryset = queryset.annotate(
                is_disable=disability_check_expression
            )
            
            if disable == "yes":
                queryset = queryset.filter(is_disable=True)
            else:
                queryset = queryset.filter(is_disable=False)
        
        # Filter by search
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
                        Q(per__per_mname__icontains=part) |
                        Q(per__per_suffix__icontains=part) |
                        Q(per__per_disability__icontains=part)
                    )
                
                queryset = queryset.filter(
                    name_q |
                    Q(per__personal_addresses__add__sitio__sitio_name__icontains=search_query)
                ).distinct()

        return queryset.order_by('-rp_id')
    
class ResidentPersonalCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResidentPersonalCreateSerializer
    queryset = ResidentProfile.objects.all()

class ResidentPersonalInfoView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResidentPersonalInfoSerializer
    queryset=ResidentProfile.objects.all()
    lookup_field='rp_id'

class ResidentProfileListWithOptions(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResidentProfileListSerializer
    
    def get_queryset(self):
        excluded_fam_id = self.kwargs.get('fam_id', None)
        is_staff = self.request.query_params.get('is_staff', 'false').lower() == "true"
        exclude_independent = self.request.query_params.get('exclude_independent', "false").lower() == "true"
        search = self.request.query_params.get('search', '').strip()
        is_search_only = self.request.query_params.get('is_search_only', "false").lower() == "true"
        deceased_only = self.request.query_params.get('deceased_only', "false").lower() == "true"
        queryset = ResidentProfile.objects.all()
        
        # Filter for deceased residents only if requested
        if deceased_only:
            queryset = queryset.filter(per__per_is_deceased=True).select_related('per')

        # Search functionality
        if search:
            queryset = queryset.filter(
                Q(rp_id__icontains=search) |
                Q(per__per_lname__icontains=search) |
                Q(per__per_fname__icontains=search) |
                Q(per__per_mname__icontains=search)
            )
            
            # if is_search_only:
            #     return queryset
        
        # For staff assignment, the list should not contain staff members
        if is_staff:
            from apps.administration.models import Staff
            staffs = Staff.objects.all()
            
            return [
                res for res in queryset 
                if not staffs.filter(staff_id=res.rp_id)
            ]
        
        # Fetch only what's being searched
        if is_search_only and not search:
            return None

        # When adding new member to a family, the list shoud not contain members of the family
        if excluded_fam_id:
            queryset = queryset.filter(~Q(family_compositions__fam_id=excluded_fam_id))

        # Family registration, living independently
        # Exclude those that are already registered as independent from the list
        if exclude_independent:
            queryset = queryset.filter(~Q(family_compositions__fc_role='INDEPENDENT'))
        
        # Returns all residents by default if no parameters were provided 
        return queryset
    
class ResidentProfileFamSpecificListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResidentProfileListSerializer
    
    def get_queryset(self):
        fam_id = self.kwargs['fam']
        return ResidentProfile.objects.filter(family_compositions__fam_id=fam_id)

# For verification in link registration
class LinkRegVerificationView(APIView):
    permission_classes = [AllowAny]
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

class LinkVoterView(generics.UpdateAPIView):
    serializer_class = ResidentProfileBaseSerializer
    queryset = ResidentProfile.objects.all()
    lookup_field = "rp_id"

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        name = f'{instance.per.per_lname.upper()}, {instance.per.per_fname.upper()}' \
                f'{" " + instance.per.per_mname.upper() if instance.per.per_mname else ""}'
        print(name)
        retrieved = {
            "voter": Voter.objects.filter(voter_name=name).first().voter_id
        }

        serializer = self.get_serializer(instance, data=retrieved, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)