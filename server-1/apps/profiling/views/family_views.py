from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Prefetch, Q, Count, Value, CharField, Subquery, OuterRef, F
from django.db.models.functions import Coalesce, Concat
from ..serializers.family_serializers import *
from ..serializers.resident_profile_serializers import *
from apps.pagination import *
from apps.account.models import Account
from ..double_queries import PostQueries
import copy
import logging

logger = logging.getLogger(__name__)

class FamilyTableView(generics.ListCreateAPIView):
  permission_classes = [AllowAny]
  serializer_class = FamilyTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
        search_query = self.request.query_params.get('search', '').strip()
        occupancy = self.request.query_params.get('occupancy', 'all')

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

        if occupancy != 'all':
           queryset = queryset.filter(
              Q(fam_building__iexact=occupancy)
           )

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
        
        return queryset.order_by('-fam_id')
  
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

class FamilyDataResidentSpecificView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = FamilyTableSerializer

    def get(self, request, *args, **kwargs):
        rp = request.query_params.get('residentId', None)
        if not rp:
            return Response(status=400)

        comp = FamilyComposition.objects.filter(rp=rp).order_by("-fam__fam_date_registered").first()
        if not comp:
            return Response(status=404)

        family = Family.objects.filter(fam_id=comp.fam.fam_id).first()
        if not family:
            return Response(status=404)

        serializer = self.get_serializer(family)
        return Response(serializer.data)

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

class FamilyRegistrationRequestView(APIView):
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        data_copy = copy.deepcopy(request.data)
        req_id = data_copy.get('req_id', None)
        compositions = data_copy.get('compositions', [])
        family_data = data_copy.get('family', None)
        hh_id = data_copy.get('hh_id', None)
        house = data_copy.get('house', None)
        staff_id = data_copy.get('staff_id', None)

        if staff_id:
           staff = Staff.objects.filter(staff_id=staff_id).first()
        
        if len(compositions) > 0:
            house_owner = None
            new_composition = []
            
            # Register each member as resident
            for member in compositions:
                member.pop('per_addresses', None)
                per = member.pop('per_id', None)
                acc = member.pop('acc', None)
                role = member.pop('role', None)

                if per:
                    personal = Personal.objects.filter(per_id=per).first()
                else:
                    # Create Personal record
                    personal = Personal(**member)
                    personal._history_user = staff
                    personal.save()
                
                # Create ResidentProfile record
                resident_profile = ResidentProfile.objects.create(
                    rp_id = generate_resident_no(),
                    per = personal,
                    staff = staff
                )
                
                # Assign resident profile to existing account if applicable
                if acc:
                   account = Account.objects.filter(acc_id=acc).first()
                   account.rp = resident_profile
                   account.save()


                # Set house owner for new house registration
                if house and int(resident_profile.per.per_id) == int(house['householdHead']):
                   house_owner = resident_profile

                new_composition.append({
                   'rp': resident_profile,
                   'fc_role': role 
                })
            
            # Register house if applicable
            if house:
                address = house["address"].split("-") 
                hh = Household.objects.create(
                    hh_id = generate_hh_no(),
                    hh_nhts = house['nhts'],
                    add=Address.objects.get_or_create(
                        add_province="CEBU",
                        add_city="CEBU CITY",
                        add_barangay="SAN ROQUE (CIUDAD)",
                        sitio=Sitio.objects.filter(sitio_name=address[1]).first(),
                        add_street=address[2]
                    )[0],
                    rp=house_owner,
                    staff=staff
                )

            # Register family
            family = Family.objects.create(
                fam_id=generate_fam_no(family_data['building']),
                fam_indigenous=family_data['indigenous'],
                fam_building=family_data['building'],
                hh=hh if house else Household.objects.filter(hh_id=hh_id).first(),
                staff=staff
            )

            # Add all family members
            for comp in new_composition:
                FamilyComposition.objects.create(
                    fc_role=comp['fc_role'],
                    rp=comp['rp'],
                    fam=family,
                )

            # Perform double query
            response = PostQueries().family_registration_request(request.data)
            if not response.ok:
                try:
                    error_details = response.json()
                except ValueError:
                    error_details = response.text
                raise serializers.ValidationError({'error': error_details})
            
            # Remove request after approval
            reg_request = RequestRegistration.objects.filter(req_id=req_id).first()
            if reg_request:
               reg_request.delete()
            
            return Response(status=status.HTTP_200_OK)
            




