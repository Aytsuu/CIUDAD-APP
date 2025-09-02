from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from ..models import WaterSupply, SanitaryFacility, SolidWasteMgmt, Household
from ..serializers.base import WaterSupplySerializer, SanitaryFacilitySerializer, SolidWasteMgmtSerializer
from ..serializers.household_serializers import HouseholdBaseSerializer


class WaterSupplyListView(generics.ListAPIView):
    """
    Get all water supply options for dropdown/selection in frontend
    """
    queryset = WaterSupply.objects.all()
    serializer_class = WaterSupplySerializer

    def get_queryset(self):
        # Return unique water supply types for dropdown options
        # This returns all records, but frontend can group by type
        return WaterSupply.objects.all().order_by('water_sup_type')


class WaterSupplyCreateView(generics.CreateAPIView):
    """
    Create a new water supply record for a household
    """
    queryset = WaterSupply.objects.all()
    serializer_class = WaterSupplySerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        hh_id = data.get('hh')
        if not hh_id:
            return Response({'detail': 'hh (household id) is required'}, status=status.HTTP_400_BAD_REQUEST)
        # Ensure household exists
        get_object_or_404(Household, hh_id=hh_id)
        if not data.get('water_sup_id'):
            data['water_sup_id'] = f"{hh_id}_water"
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()


class WaterSupplyByHouseholdView(generics.ListAPIView):
    """
    Get water supply information for a specific household
    """
    serializer_class = WaterSupplySerializer

    def get_queryset(self):
        hh_id = self.kwargs['hh_id']
        return WaterSupply.objects.filter(hh__hh_id=hh_id)


class WaterSupplyTypesView(APIView):
    """
    Get distinct water supply types for form options
    Returns structured data that matches frontend RadioCardGroup format
    """

    def get(self, request):
        try:
            # Get unique water supply types
            water_supplies = WaterSupply.objects.values(
                'water_sup_type', 
                'water_conn_type', 
                'water_sup_desc'
            ).distinct().order_by('water_sup_type')

            # Format data for frontend RadioCardGroup
            options = []
            for supply in water_supplies:
                # Create value based on type (you can customize this logic)
                value = supply['water_sup_type'].lower().replace(' ', '_')
                if 'level i' in supply['water_sup_type'].lower():
                    value = 'level1'
                elif 'level ii' in supply['water_sup_type'].lower():
                    value = 'level2'
                elif 'level iii' in supply['water_sup_type'].lower():
                    value = 'level3'

                option = {
                    'value': value,
                    'title': supply['water_sup_type'],
                    'subtitle': supply['water_conn_type'],
                    'description': supply['water_sup_desc']
                }
                options.append(option)

            return Response({
                'success': True,
                'data': options,
                'message': 'Water supply types retrieved successfully'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error retrieving water supply types: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SanitaryFacilityListView(generics.ListAPIView):
    """
    Get all sanitary facility options
    """
    queryset = SanitaryFacility.objects.all()
    serializer_class = SanitaryFacilitySerializer


class SanitaryFacilityCreateView(generics.CreateAPIView):
    """
    Create a new sanitary facility record for a household
    """
    queryset = SanitaryFacility.objects.all()
    serializer_class = SanitaryFacilitySerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        hh_id = data.get('hh')
        if not hh_id:
            return Response({'detail': 'hh (household id) is required'}, status=status.HTTP_400_BAD_REQUEST)
        get_object_or_404(Household, hh_id=hh_id)
        if not data.get('sf_id'):
            data['sf_id'] = f"{hh_id}_sanitary"
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class SanitaryFacilityByHouseholdView(generics.ListAPIView):
    """
    Get sanitary facility information for a specific household
    """
    serializer_class = SanitaryFacilitySerializer

    def get_queryset(self):
        hh_id = self.kwargs['hh_id']
        return SanitaryFacility.objects.filter(hh__hh_id=hh_id)


# NEW: Update/Delete endpoints for Water Supply and Sanitary Facility
class WaterSupplyUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WaterSupplySerializer
    queryset = WaterSupply.objects.all()
    lookup_field = 'water_sup_id'


class SanitaryFacilityUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SanitaryFacilitySerializer
    queryset = SanitaryFacility.objects.all()
    lookup_field = 'sf_id'


# Solid Waste Management CRUD
class SolidWasteListView(generics.ListAPIView):
    queryset = SolidWasteMgmt.objects.all()
    serializer_class = SolidWasteMgmtSerializer


class SolidWasteCreateView(generics.CreateAPIView):
    queryset = SolidWasteMgmt.objects.all()
    serializer_class = SolidWasteMgmtSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        hh_id = data.get('hh')
        if not hh_id:
            return Response({'detail': 'hh (household id) is required'}, status=status.HTTP_400_BAD_REQUEST)
        get_object_or_404(Household, hh_id=hh_id)
        if not data.get('swm_id'):
            data['swm_id'] = f"{hh_id}_waste"
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class SolidWasteByHouseholdView(generics.ListAPIView):
    serializer_class = SolidWasteMgmtSerializer

    def get_queryset(self):
        hh_id = self.kwargs['hh_id']
        return SolidWasteMgmt.objects.filter(hh__hh_id=hh_id)


class SolidWasteUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SolidWasteMgmtSerializer
    queryset = SolidWasteMgmt.objects.all()
    lookup_field = 'swm_id'


class EnvironmentalDataView(APIView):
    """
    Get all environmental data for a specific household
    """

    def get(self, request, hh_id):
        try:
            # Get household
            household = get_object_or_404(Household, hh_id=hh_id)
            
            # Get related environmental data
            water_supply = WaterSupply.objects.filter(hh=household).first()
            sanitary_facility = SanitaryFacility.objects.filter(hh=household).first()
            waste_mgmt = SolidWasteMgmt.objects.filter(hh=household).first()

            # Serialize data
            data = {
                'household': HouseholdBaseSerializer(household).data,
                'water_supply': WaterSupplySerializer(water_supply).data if water_supply else None,
                'sanitary_facility': SanitaryFacilitySerializer(sanitary_facility).data if sanitary_facility else None,
                'waste_management': {
                    'swm_id': waste_mgmt.swm_id if waste_mgmt else None,
                    'disposal_type': waste_mgmt.swn_desposal_type if waste_mgmt else None,
                    'description': waste_mgmt.swm_desc if waste_mgmt else None
                } if waste_mgmt else None
            }

            return Response({
                'success': True,
                'data': data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error retrieving environmental data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EnvironmentalDataCreateView(APIView):
    """
    Create complete environmental data for a household
    """

    def post(self, request):
        try:
            data = request.data
            hh_id = data.get('household_id')
            
            if not hh_id:
                return Response({
                    'success': False,
                    'message': 'Household ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            household = get_object_or_404(Household, hh_id=hh_id)

            # Create water supply record
            if 'water_supply' in data:
                water_data = data['water_supply']
                water_data['hh'] = household.hh_id
                
                # Check if water supply already exists for this household
                water_supply, created = WaterSupply.objects.get_or_create(
                    hh=household,
                    defaults={
                        'water_sup_id': f"{hh_id}_water",
                        'water_sup_type': water_data.get('water_sup_type', ''),
                        'water_conn_type': water_data.get('water_conn_type', ''),
                        'water_sup_desc': water_data.get('water_sup_desc', '')
                    }
                )
                
                if not created:
                    # Update existing record
                    water_supply.water_sup_type = water_data.get('water_sup_type', water_supply.water_sup_type)
                    water_supply.water_conn_type = water_data.get('water_conn_type', water_supply.water_conn_type)
                    water_supply.water_sup_desc = water_data.get('water_sup_desc', water_supply.water_sup_desc)
                    water_supply.save()

            return Response({
                'success': True,
                'message': 'Environmental data created successfully'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error creating environmental data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
