from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from ..models import WaterSupply, SanitaryFacility, SolidWasteMgmt, Household
from ..serializers.base import WaterSupplySerializer, SanitaryFacilitySerializer, SolidWasteMgmtSerializer


class EnvironmentalFormSubmitView(APIView):
    """
    Submit environmental form data (water supply, sanitary facility, waste management)
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
            results = {}

            # Handle water supply data
            if 'water_supply' in data:
                water_data = data['water_supply']
                
                # Map frontend values to backend data
                water_supply_mapping = {
                    'level1': {
                        'water_sup_type': 'LEVEL I',
                        'water_conn_type': 'POINT SOURCE',
                        'water_sup_desc': 'Developed/protected/improved spring or dug well without distribution/piping system'
                    },
                    'level2': {
                        'water_sup_type': 'LEVEL II',
                        'water_conn_type': 'COMMUNAL (COMMON) FAUCET OR STAND POST',
                        'water_sup_desc': 'HH using point source with distribution system to a communal (common) faucet'
                    },
                    'level3': {
                        'water_sup_type': 'LEVEL III',
                        'water_conn_type': 'INDIVIDUAL CONNECTION',
                        'water_sup_desc': 'HH with faucet/tap (e.g. water supplied by MCWD, BWSA, Homeowner\'s Assoc)'
                    }
                }

                selected_type = water_data.get('type', '')
                if selected_type in water_supply_mapping:
                    mapping = water_supply_mapping[selected_type]
                    
                    water_supply, created = WaterSupply.objects.get_or_create(
                        hh=household,
                        defaults={
                            'water_sup_type': mapping['water_sup_type'],
                            'water_conn_type': mapping['water_conn_type'],
                            'water_sup_desc': mapping['water_sup_desc']
                        }
                    )
                    
                    if not created:
                        # Update existing record
                        water_supply.water_sup_type = mapping['water_sup_type']
                        water_supply.water_conn_type = mapping['water_conn_type']
                        water_supply.water_sup_desc = mapping['water_sup_desc']
                        water_supply.save()

                    results['water_supply'] = 'created' if created else 'updated'

            # Handle sanitary facility data
            if 'sanitary_facility' in data:
                sanitary_data = data['sanitary_facility']

                # Map the selected specific facility type ID to a human-readable description
                # The frontend selects use IDs like 'santype1', 'unsanType1', etc. We store the NAME into sf_desc.
                sanitary_options = {
                    'santype1': 'Pour/flush type with septic tank',
                    'santype2': 'Pour/flush toilet connected to septic tank AND to sewerage',
                    'santype3': 'Ventilated Pit (VIP) Latrine',
                }
                unsanitary_options = {
                    'unsanType1': 'Water-sealed toilet without septic tank',
                    'unsantype2': 'Overhung latrine',
                    'unsantype3': 'Open Pit Latrine',
                    'unsantype4': 'Without toilet',
                }

                facility_type = sanitary_data.get('facility_type', '')  # 'SANITARY' | 'UNSANITARY'
                # Accept both snake_case and camelCase keys from the client
                sanitary_specific_id = sanitary_data.get('sanitary_facility_type') or sanitary_data.get('sanitaryFacilityType')
                unsanitary_specific_id = sanitary_data.get('unsanitary_facility_type') or sanitary_data.get('unsanitaryFacilityType')

                # Prefer explicit name fields if the frontend sends them
                sanitary_specific_name = sanitary_data.get('sanitary_facility_type_name') or sanitary_data.get('sanitaryFacilityTypeName')
                unsanitary_specific_name = sanitary_data.get('unsanitary_facility_type_name') or sanitary_data.get('unsanitaryFacilityTypeName')

                sf_desc = None
                if facility_type == 'SANITARY':
                    if sanitary_specific_name:
                        sf_desc = sanitary_specific_name
                    elif sanitary_specific_id:
                        # If ID is provided map to name; if unknown, assume it's already a name
                        sf_desc = sanitary_options.get(sanitary_specific_id, sanitary_specific_id)
                elif facility_type == 'UNSANITARY':
                    if unsanitary_specific_name:
                        sf_desc = unsanitary_specific_name
                    elif unsanitary_specific_id:
                        sf_desc = unsanitary_options.get(unsanitary_specific_id, unsanitary_specific_id)

                sanitary_facility, created = SanitaryFacility.objects.get_or_create(
                    hh=household,
                    defaults={
                        'sf_type': facility_type,
                        'sf_toilet_type': sanitary_data.get('toilet_facility_type', ''),
                        'sf_desc': sf_desc or '',
                    }
                )

                if not created:
                    sanitary_facility.sf_type = facility_type or sanitary_facility.sf_type
                    sanitary_facility.sf_toilet_type = sanitary_data.get('toilet_facility_type', sanitary_facility.sf_toilet_type)
                    # Only update description when we can resolve it; otherwise leave as-is to avoid overwriting with None
                    if sf_desc is not None:
                        sanitary_facility.sf_desc = sf_desc
                    sanitary_facility.save()

                results['sanitary_facility'] = 'created' if created else 'updated'

            # Handle waste management data
            if 'waste_management' in data:
                waste_data = data['waste_management']
                
                waste_mgmt, created = SolidWasteMgmt.objects.get_or_create(
                    hh=household,
                    defaults={
                        'swn_desposal_type': waste_data.get('waste_management_type', ''),
                        'swm_desc': waste_data.get('description', '')
                    }
                )
                
                if not created:
                    waste_mgmt.swn_desposal_type = waste_data.get('waste_management_type', waste_mgmt.swn_desposal_type)
                    waste_mgmt.swm_desc = waste_data.get('description', waste_mgmt.swm_desc)
                    waste_mgmt.save()

                results['waste_management'] = 'created' if created else 'updated'

            return Response({
                'success': True,
                'message': 'Environmental data submitted successfully',
                'results': results
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error submitting environmental data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WaterSupplyOptionsView(APIView):
    """
    Get water supply options formatted for frontend RadioCardGroup
    This endpoint provides the same data structure as your frontend expects
    """

    def get(self, request):
        try:
            # Return the hardcoded options that match your frontend structure
            # You can later modify this to be fully dynamic from database
            options = [
                {
                    'value': 'level1',
                    'title': 'LEVEL I',
                    'subtitle': 'POINT SOURCE',
                    'description': 'Developed/protected/improved spring or dug well without distribution/piping system. This includes springs, dug wells, and other point sources that are protected from contamination.'
                },
                {
                    'value': 'level2',
                    'title': 'LEVEL II',
                    'subtitle': 'COMMUNAL (COMMON) FAUCET OR STAND POST',
                    'description': 'HH using point source with distribution system to a communal (common) faucet or stand post. Water is distributed through a simple distribution system to a shared public tap.'
                },
                {
                    'value': 'level3',
                    'title': 'LEVEL III',
                    'subtitle': 'INDIVIDUAL CONNECTION',
                    'description': 'HH with faucet/tap (e.g. water supplied by MCWD, BWSA, Homeowner\'s Association, or private deep well). Individual household connection with piped water supply system.'
                }
            ]

            return Response({
                'success': True,
                'data': options,
                'message': 'Water supply options retrieved successfully'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error retrieving water supply options: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
