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
            if hasattr(family, 'hh') and family.hh:
                household = family.hh
            household_data = {
                'household_id': household.hh_id,
                'household_no': household.hh_id,  # Use hh_id as household_no
                'nhts_status': household.hh_nhts if hasattr(household, 'hh_nhts') else None,
                'date_registered': household.hh_date_registered if hasattr(household, 'hh_date_registered') else None,
                'address': {
                    'sitio': household.add.sitio.sitio_name if household.add and household.add.sitio else None,
                    'street': household.add.add_street if household.add else None,
                    'barangay': household.add.add_barangay if household.add else None,
                    'city': household.add.add_city if household.add else None,
                    'province': household.add.add_province if household.add else None,
                } if hasattr(household, 'add') and household.add else None,
                # Add household head information (the resident the household is registered to)
                'head_resident': {
                    'resident_id': household.rp.rp_id if household.rp else None,
                    'personal_info': {
                        'first_name': household.rp.per.per_fname if household.rp and household.rp.per else '',
                        'middle_name': household.rp.per.per_mname if household.rp and household.rp.per else '',
                        'last_name': household.rp.per.per_lname if household.rp and household.rp.per else '',
                        'suffix': household.rp.per.per_suffix if household.rp and household.rp.per else '',
                        'contact': household.rp.per.per_contact if household.rp and household.rp.per else '',
                        'sex': household.rp.per.per_sex if household.rp and household.rp.per else '',
                        'date_of_birth': household.rp.per.per_dob if household.rp and household.rp.per else None,
                        'civil_status': household.rp.per.per_status if household.rp and household.rp.per else '',
                        'education': household.rp.per.per_edAttainment if household.rp and household.rp.per else '',
                        'religion': household.rp.per.per_religion if household.rp and household.rp.per else '',
                    }
                } if household.rp else None
            }            # Get family members
            family_compositions = FamilyComposition.objects.filter(
                fam=family
            ).select_related('rp__per').order_by('rp__per__per_fname')
            
            family_members = []
            resident_ids = []
            
            # Import placed here to avoid circulars in type checkers
            from ..models import Dependents_Under_Five

            for composition in family_compositions:
                resident = composition.rp
                resident_ids.append(resident.rp_id)
                
                # Get health-related details (per_additional_status)
                from ..models import HealthRelatedDetails
                health_details = HealthRelatedDetails.objects.filter(rp=resident).first()
                
                # Get mother health info if resident is MOTHER
                mother_health_info = None
                if composition.fc_role == 'MOTHER':
                    from ..models import MotherHealthInfo
                    mother_health_info_obj = MotherHealthInfo.objects.filter(rp=resident, fam=family).first()
                    if mother_health_info_obj:
                        mother_health_info = {
                            'health_risk_class': mother_health_info_obj.mhi_healthRisk_class,
                            'immunization_status': mother_health_info_obj.mhi_immun_status,
                            'family_planning_method': mother_health_info_obj.mhi_famPlan_method,
                            'family_planning_source': mother_health_info_obj.mhi_famPlan_source,
                            'lmp_date': mother_health_info_obj.mhi_lmp_date
                        }
                
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
                        'civil_status': resident.per.per_status if resident.per else '',
                        'education': resident.per.per_edAttainment if resident.per else '',
                        'religion': resident.per.per_religion if resident.per else '',
                    },
                    'health_details': {
                        'blood_type': health_details.per_add_bloodType if health_details else '',
                        'relationship_to_hh_head': health_details.per_add_rel_to_hh_head if health_details else ''
                    },
                    'per_additional_details': {
                        'per_add_philhealth_id': health_details.per_add_philhealth_id if health_details else '',
                        'per_add_covid_vax_status': health_details.per_add_covid_vax_status if health_details else ''
                    },
                    'mother_health_info': mother_health_info
                }

                # Attach under-five dependent health fields if available for this composition
                try:
                    duf = Dependents_Under_Five.objects.filter(rp=resident, fc=composition).first()
                except Exception:
                    duf = None
                if duf:
                    member_data['under_five'] = {
                        'fic': duf.duf_fic,
                        'nutritional_status': duf.duf_nutritional_status,
                        'exclusive_bf': duf.duf_exclusive_bf,
                    }
                family_members.append(member_data)
            
            # Get environmental data (if household exists)
            environmental_data = {}
            if household:
                # Water supply data
                water_supply = WaterSupply.objects.filter(hh=household).first()
                if water_supply:
                    environmental_data['water_supply'] = {
                        'id': water_supply.water_sup_id,  # Added ID for update operations
                        'type': water_supply.water_sup_type,
                        'connection_type': water_supply.water_conn_type,
                        'description': water_supply.water_sup_desc
                    }
                
                # Sanitary facility data
                sanitary_facility = SanitaryFacility.objects.filter(hh=household).first()
                if sanitary_facility:
                    environmental_data['sanitary_facility'] = {
                        'id': sanitary_facility.sf_id,  # Added ID for update operations
                        'facility_type': sanitary_facility.sf_type,  # Fixed: sf_type instead of sf_facility_type
                        'description': sanitary_facility.sf_desc,    # Added: human-readable subtype description
                        'toilet_facility_type': sanitary_facility.sf_toilet_type  # Fixed: sf_toilet_type instead of sf_toilet_facility_type
                    }
                
                # Solid waste management data
                solid_waste = SolidWasteMgmt.objects.filter(hh=household).first()
                if solid_waste:
                    environmental_data['waste_management'] = {
                        'id': solid_waste.swm_id,  # Added ID for update operations
                        'type': solid_waste.swn_desposal_type,  # Fixed: swn_desposal_type instead of swm_type
                        'description': solid_waste.swm_desc  # Fixed: swm_desc instead of checking for swm_others
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
                            'risk_class_age_group': ncd['ncd_riskclass_age'],
                            'comorbidities': ncd['ncd_comorbidities'],
                            'comorbidities_others': ncd.get('ncd_comorbidities_others', ''),
                            'lifestyle_risk': ncd['ncd_lifestyle_risk'],
                            'lifestyle_risk_others': ncd.get('ncd_lifestyle_risk_others', ''),
                            'in_maintenance': ncd['ncd_maintenance_status'],
                            'date_created': ncd.get('ncd_date_created', '')
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
                            'src_anti_tb_meds': tb['tb_meds_source'],
                            'src_anti_tb_meds_others': tb.get('tb_meds_source_others', ''),
                            'no_of_days_taking_meds': tb['tb_days_taking_meds'],
                            'tb_status': tb['tb_status'],
                            'date_created': tb.get('tb_date_created', '')
                        }
                    })
            
            # Get survey identification data
            survey_identification = SurveyIdentification.objects.filter(fam=family).first()
            survey_data = None
            if survey_identification:
                survey_serializer = SurveyIdentificationDetailSerializer(survey_identification)

                # Try to fetch respondent (name + contact) linked to this family
                try:
                    from ..models import RespondentsInfo
                    respondent = (
                        RespondentsInfo.objects
                        .filter(fam=family)
                        .select_related('rp__per')
                        .first()
                    )
                except Exception:
                    respondent = None

                respondent_name = None
                respondent_contact = None
                if respondent and getattr(respondent, 'rp', None) and getattr(respondent.rp, 'per', None):
                    per = respondent.rp.per
                    # Format: Lastname, Firstname Middlename (include suffix at the end if available)
                    ln = per.per_lname or ''
                    fn = per.per_fname or ''
                    mn = per.per_mname or ''
                    sx = per.per_suffix or ''
                    name_core = f"{ln}, {fn}{(' ' + mn) if mn else ''}".strip()
                    respondent_name = f"{name_core}{(' ' + sx) if sx else ''}".strip()
                    respondent_contact = per.per_contact or ''

                survey_data = {
                    'survey_id': survey_serializer.data['si_id'],
                    'filled_by': survey_serializer.data['si_filled_by'],
                    'informant': respondent_name or survey_serializer.data['si_informant'],
                    'informant_contact': respondent_contact or '',
                    'checked_by': survey_serializer.data['si_checked_by'],
                    'date': survey_serializer.data['si_date'],
                    'signature': survey_serializer.data['si_signature'],
                    'date_created': survey_serializer.data['si_created_at']  # Fixed: si_created_at instead of si_date_created
                }
            
            # Compile comprehensive response
            response_data = {
                'family_info': {
                    'family_id': family.fam_id,
                    'family_building': family.fam_building,  # Changed: family doesn't have fam_name
                    'family_indigenous': family.fam_indigenous,  # Added: useful family info
                    'date_created': family.fam_date_registered,  # Fixed: fam_date_registered instead of fam_date_created
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
