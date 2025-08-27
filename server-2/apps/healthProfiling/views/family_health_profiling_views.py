from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from ..models import (
    Family, Household, ResidentProfile, FamilyComposition,
    WaterSupply, SanitaryFacility, SolidWasteMgmt,
    NonCommunicableDisease, TBsurveilance, SurveyIdentification
)
from ..serializers.ncd_serializers import NonCommunicableDiseaseSerializer
from ..serializers.tb_serializers import TBSurveilanceSerializer
from ..serializers.survey_serializers import SurveyIdentificationDetailSerializer
from ..serializers.base import (
    WaterSupplySerializer, SanitaryFacilitySerializer, 
    SolidWasteMgmtSerializer
)
from ..serializers.resident_profile_serializers import ResidentProfileListSerializer
import logging

logger = logging.getLogger(__name__)


class FamilyHealthProfilingDetailView(APIView):
    """
    Comprehensive view to fetch all health family profiling data for a specific family
    Returns: Demographics, Environmental data, NCD records, TB records, and Survey data
    """
    
    def get(self, request, fam_id):
        try:
            # Validate family exists
            family = get_object_or_404(Family, fam_id=fam_id)
            
            # Get household information
            household = None
            household_data = None
            if hasattr(family, 'household') and family.household:
                household = family.household
                household_data = {
                    'household_id': household.hh_id,
                    'household_no': household.hh_no,
                    'sitio': household.sitio.name if household.sitio else None,
                    'barangay': household.sitio.barangay if household.sitio else None,
                }
            
            # Get family members
            family_compositions = FamilyComposition.objects.filter(
                fam=family
            ).select_related('rp__per').order_by('rp__per__per_fname')
            
            family_members = []
            resident_ids = []
            
            for composition in family_compositions:
                resident = composition.rp
                resident_ids.append(resident.rp_id)
                
                member_data = {
                    'resident_id': resident.rp_id,
                    'role': composition.fc_role,
                    'personal_info': {
                        'first_name': resident.per.per_fname if resident.per else '',
                        'middle_name': resident.per.per_mname if resident.per else '',
                        'last_name': resident.per.per_lname if resident.per else '',
                        'suffix': resident.per.per_suffix if resident.per else '',
                        'sex': resident.per.per_sex if resident.per else '',
                        'date_of_birth': resident.per.per_dob if resident.per else None,
                        'contact': resident.per.per_contact if resident.per else '',
                        'civil_status': resident.per.per_civil_status if resident.per else '',
                        'citizenship': resident.per.per_citizenship if resident.per else '',
                        'occupation': resident.per.per_occupation if resident.per else '',
                        'education': resident.per.per_education if resident.per else '',
                    }
                }
                family_members.append(member_data)
            
            # Get environmental data (if household exists)
            environmental_data = {}
            if household:
                # Water supply data
                water_supply = WaterSupply.objects.filter(hh=household).first()
                if water_supply:
                    environmental_data['water_supply'] = {
                        'type': water_supply.water_sup_type,
                        'connection_type': water_supply.water_conn_type,
                        'description': water_supply.water_sup_desc
                    }
                
                # Sanitary facility data
                sanitary_facility = SanitaryFacility.objects.filter(hh=household).first()
                if sanitary_facility:
                    environmental_data['sanitary_facility'] = {
                        'facility_type': sanitary_facility.sf_facility_type,
                        'toilet_facility_type': sanitary_facility.sf_toilet_facility_type
                    }
                
                # Solid waste management data
                solid_waste = SolidWasteMgmt.objects.filter(hh=household).first()
                if solid_waste:
                    environmental_data['waste_management'] = {
                        'type': solid_waste.swm_type,
                        'others': solid_waste.swm_others if hasattr(solid_waste, 'swm_others') else None
                    }
            
            # Get NCD records for family members
            ncd_records = NonCommunicableDisease.objects.filter(
                rp__rp_id__in=resident_ids
            ).select_related('rp__per')
            
            ncd_serializer = NonCommunicableDiseaseSerializer(ncd_records, many=True)
            ncd_data = []
            for ncd in ncd_serializer.data:
                # Find the corresponding family member
                member = next((m for m in family_members if m['resident_id'] == ncd['rp']), None)
                if member:
                    ncd_data.append({
                        'ncd_id': ncd['ncd_id'],
                        'resident_info': member,
                        'health_data': {
                            'risk_class_age_group': ncd['ncd_risk_class_age_group'],
                            'comorbidities': ncd['ncd_comorbidities'],
                            'comorbidities_others': ncd.get('ncd_comorbidities_others', ''),
                            'lifestyle_risk': ncd['ncd_lifestyle_risk'],
                            'lifestyle_risk_others': ncd.get('ncd_lifestyle_risk_others', ''),
                            'in_maintenance': ncd['ncd_in_maintenance'],
                            'date_created': ncd['ncd_date_created']
                        }
                    })
            
            # Get TB surveillance records for family members
            tb_records = TBsurveilance.objects.filter(
                rp__rp_id__in=resident_ids
            ).select_related('rp__per')
            
            tb_serializer = TBSurveilanceSerializer(tb_records, many=True)
            tb_data = []
            for tb in tb_serializer.data:
                # Find the corresponding family member
                member = next((m for m in family_members if m['resident_id'] == tb['rp']), None)
                if member:
                    tb_data.append({
                        'tb_id': tb['tb_id'],
                        'resident_info': member,
                        'health_data': {
                            'src_anti_tb_meds': tb['tb_src_anti_tb_meds'],
                            'src_anti_tb_meds_others': tb.get('tb_src_anti_tb_meds_others', ''),
                            'no_of_days_taking_meds': tb['tb_no_of_days_taking_meds'],
                            'tb_status': tb['tb_status'],
                            'date_created': tb['tb_date_created']
                        }
                    })
            
            # Get survey identification data
            survey_identification = SurveyIdentification.objects.filter(fam=family).first()
            survey_data = None
            if survey_identification:
                survey_serializer = SurveyIdentificationDetailSerializer(survey_identification)
                survey_data = {
                    'survey_id': survey_serializer.data['si_id'],
                    'filled_by': survey_serializer.data['si_filled_by'],
                    'informant': survey_serializer.data['si_informant'],
                    'checked_by': survey_serializer.data['si_checked_by'],
                    'date': survey_serializer.data['si_date'],
                    'signature': survey_serializer.data['si_signature'],
                    'date_created': survey_serializer.data['si_date_created']
                }
            
            # Compile comprehensive response
            response_data = {
                'family_info': {
                    'family_id': family.fam_id,
                    'family_name': family.fam_name,
                    'date_created': family.fam_date_created,
                    'household': household_data
                },
                'family_members': family_members,
                'environmental_health': environmental_data,
                'ncd_records': ncd_data,
                'tb_surveillance_records': tb_data,
                'survey_identification': survey_data,
                'summary': {
                    'total_family_members': len(family_members),
                    'total_ncd_records': len(ncd_data),
                    'total_tb_records': len(tb_data),
                    'environmental_data_complete': bool(environmental_data),
                    'survey_completed': bool(survey_data)
                }
            }
            
            return Response({
                'success': True,
                'message': 'Family health profiling data retrieved successfully',
                'data': response_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving family health profiling data: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving family health profiling data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FamilyHealthProfilingSummaryView(APIView):
    """
    Get a summary of all families with their health profiling completion status
    """
    
    def get(self, request):
        try:
            families = Family.objects.all().select_related('household__sitio')
            
            summary_data = []
            
            for family in families:
                # Count family members
                member_count = FamilyComposition.objects.filter(fam=family).count()
                
                # Check environmental data completion
                environmental_complete = False
                if hasattr(family, 'household') and family.household:
                    water_supply = WaterSupply.objects.filter(hh=family.household).exists()
                    sanitary_facility = SanitaryFacility.objects.filter(hh=family.household).exists()
                    solid_waste = SolidWasteMgmt.objects.filter(hh=family.household).exists()
                    environmental_complete = water_supply and sanitary_facility and solid_waste
                
                # Count health records
                resident_ids = FamilyComposition.objects.filter(
                    fam=family
                ).values_list('rp__rp_id', flat=True)
                
                ncd_count = NonCommunicableDisease.objects.filter(
                    rp__rp_id__in=resident_ids
                ).count()
                
                tb_count = TBsurveilance.objects.filter(
                    rp__rp_id__in=resident_ids
                ).count()
                
                # Check survey completion
                survey_complete = SurveyIdentification.objects.filter(fam=family).exists()
                
                # Calculate completion percentage
                completion_criteria = [
                    environmental_complete,
                    ncd_count > 0 or tb_count > 0,  # At least some health records
                    survey_complete
                ]
                completion_percentage = (sum(completion_criteria) / len(completion_criteria)) * 100
                
                family_summary = {
                    'family_id': family.fam_id,
                    'family_name': family.fam_name,
                    'household_id': family.household.hh_id if hasattr(family, 'household') and family.household else None,
                    'household_no': family.household.hh_no if hasattr(family, 'household') and family.household else None,
                    'sitio': family.household.sitio.name if hasattr(family, 'household') and family.household and family.household.sitio else None,
                    'member_count': member_count,
                    'environmental_complete': environmental_complete,
                    'ncd_records_count': ncd_count,
                    'tb_records_count': tb_count,
                    'survey_complete': survey_complete,
                    'completion_percentage': round(completion_percentage, 1),
                    'date_created': family.fam_date_created
                }
                
                summary_data.append(family_summary)
            
            # Sort by completion percentage (descending) and then by family name
            summary_data.sort(key=lambda x: (-x['completion_percentage'], x['family_name']))
            
            return Response({
                'success': True,
                'message': 'Family health profiling summary retrieved successfully',
                'data': {
                    'families': summary_data,
                    'total_families': len(summary_data),
                    'completed_families': len([f for f in summary_data if f['completion_percentage'] == 100]),
                    'partial_completion': len([f for f in summary_data if 0 < f['completion_percentage'] < 100]),
                    'not_started': len([f for f in summary_data if f['completion_percentage'] == 0])
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving family health profiling summary: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving family health profiling summary: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
