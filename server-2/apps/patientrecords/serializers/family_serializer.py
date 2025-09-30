from rest_framework import serializers
from ..models import *
from datetime import date
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.serializers.minimal import ResidentProfileMinimalSerializer,HouseholdMinimalSerializer
from apps.healthProfiling.models import FamilyComposition,Household, ResidentProfile, Personal, PersonalAddress, Address, HealthRelatedDetails, MotherHealthInfo
from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
from apps.maternal.models import PostpartumRecord, TT_Status, Prenatal_Form
from apps.healthProfiling.serializers.minimal import *
from .spouse_serializers import SpouseSerializer


class ChildrenInfoSerializer(serializers.Serializer):
    """Serializer for children information in the frontend format"""
    
    # Main child identifier
    pat_id = serializers.CharField(source='patrec.pat_id.pat_id')
    chrec_id = serializers.IntegerField()
    
    # Child personal info (similar to personal_info in your frontend)
    personal_info = serializers.SerializerMethodField()
    
    # Address info (similar to address in your frontend)
    address = serializers.SerializerMethodField()
    
    # Household info (similar to households in your frontend)
    households = serializers.SerializerMethodField()
    
    # Family info
    family = serializers.SerializerMethodField()
    
    # Additional child-specific health info
    child_health_info = serializers.SerializerMethodField()
    
    # Parent info (since we're querying from parent's perspective)
    parent_info = serializers.SerializerMethodField()

    def get_personal_info(self, obj):
        """Get child's personal information similar to your frontend structure"""
        if obj.patrec.pat_id.pat_type == 'Resident' and obj.patrec.pat_id.rp_id:
            personal = obj.patrec.pat_id.rp_id.per
            return {
                'per_fname': personal.per_fname or "",
                'per_mname': personal.per_mname or "",
                'per_lname': personal.per_lname or "",
                'per_dob': personal.per_dob or "",
                'per_sex': personal.per_sex or "",
                'per_status': personal.per_status or "",
                'per_edAttainment': personal.per_edAttainment or "",
                'per_religion': personal.per_religion or "",
                'per_contact': personal.per_contact or "",
                'philhealth_id': getattr(obj.patrec.pat_id.rp_id, 'philhealth_id', "") or "",
            }
        return {}

    def get_address(self, obj):
        """Get child's address similar to your frontend structure"""
        try:
            if obj.patrec.pat_id.pat_type == 'Resident' and obj.patrec.pat_id.rp_id:
                # Try PersonalAddress first
                personal_address = PersonalAddress.objects.filter(
                    per=obj.patrec.pat_id.rp_id.per
                ).select_related('add', 'add__sitio').first()
                
                if personal_address and personal_address.add:
                    address = personal_address.add
                    sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                    
                    # Construct full address
                    address_parts = [
                        f"Sitio {sitio}" if sitio else None,
                        address.add_barangay if address.add_barangay else None,
                        address.add_city if address.add_city else None,
                        address.add_province if address.add_province else None,
                        address.add_street if address.add_street else None,
                    ]
                    full_address = ", ".join(filter(None, address_parts))
                    
                    return {
                        'add_street': address.add_street or "",
                        'add_barangay': address.add_barangay or "",
                        'add_city': address.add_city or "",
                        'add_province': address.add_province or "",
                        'add_sitio': sitio or "",
                        'full_address': full_address
                    }
                
                # Fallback to Household address
                household = Household.objects.filter(
                    rp=obj.patrec.pat_id.rp_id
                ).select_related('add', 'add__sitio').first()
                
                if household and household.add:
                    address = household.add
                    sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                    
                    address_parts = [
                        f"Sitio {sitio}" if sitio else None,
                        address.add_barangay if address.add_barangay else None,
                        address.add_city if address.add_city else None,
                        address.add_province if address.add_province else None,
                        address.add_street if address.add_street else None,
                    ]
                    full_address = ", ".join(filter(None, address_parts))
                    
                    return {
                        'add_street': address.add_street or "",
                        'add_barangay': address.add_barangay or "",
                        'add_city': address.add_city or "",
                        'add_province': address.add_province or "",
                        'add_sitio': sitio or "",
                        'full_address': full_address
                    }
            
            return {
                'add_street': "",
                'add_barangay': "",
                'add_city': "",
                'add_province': "",
                'add_sitio': "",
                'full_address': ""
            }
            
        except Exception as e:
            print(f"Error getting address: {str(e)}")
            return {
                'add_street': "",
                'add_barangay': "",
                'add_city': "",
                'add_province': "",
                'add_sitio': "",
                'full_address': ""
            }

    def get_households(self, obj):
        """Get child's household information"""
        try:
            if obj.patrec.pat_id.pat_type == 'Resident' and obj.patrec.pat_id.rp_id:
                households = Household.objects.filter(rp=obj.patrec.pat_id.rp_id)
                return [{
                    'hh_id': household.hh_id or "",
                    'hh_nhts': household.hh_nhts or "",
                    'hh_date_registered': household.hh_date_registered or ""
                } for household in households]
            return []
        except Exception as e:
            print(f"Error getting households: {str(e)}")
            return []

    def get_family(self, obj):
        """Get child's family information"""
        try:
            if obj.patrec.pat_id.pat_type == 'Resident' and obj.patrec.pat_id.rp_id:
                current_composition = FamilyComposition.objects.filter(
                    rp=obj.patrec.pat_id.rp_id
                ).order_by('-fam_id__fam_date_registered', '-fc_id').first()
                
                if current_composition:
                    return {
                        'fam_id': str(current_composition.fam_id) or "",
                        'fc_role': current_composition.fc_role or "",
                        'fc_id': current_composition.fc_id or ""
                    }
            return None
        except Exception as e:
            print(f"Error getting family: {str(e)}")
            return None

    def get_child_health_info(self, obj):
        """Get child-specific health information"""
        return {
            'ufc_no': obj.ufc_no or "",
            'family_no': obj.family_no or "",
            'type_of_feeding': obj.type_of_feeding or "",
            'newborn_screening': obj.newborn_screening or "",
            'nbscreening_result': obj.nbscreening_result or "",
            'birth_order': obj.birth_order or 0,
            'place_of_delivery_type': obj.place_of_delivery_type or "",
            'pod_location': obj.pod_location or "",
            'newbornInitiatedbf': obj.newbornInitiatedbf or False,
            'landmarks': obj.landmarks or "",
            'mother_occupation': obj.mother_occupation or "",
            'father_occupation': obj.father_occupation or "",
            'created_at': obj.created_at or "",
            'updated_at': obj.updated_at or ""
        }

    def get_parent_info(self, obj):
        """Get both mother and father information"""
        try:
            # Get the family composition for this child
            if obj.patrec.pat_id.pat_type == 'Resident' and obj.patrec.pat_id.rp_id:
                # Get the child's current family composition
                child_fc = FamilyComposition.objects.filter(
                    rp=obj.patrec.pat_id.rp_id
                ).select_related('fam').order_by('-fam_id__fam_date_registered', '-fc_id').first()
                
                if child_fc and child_fc.fam:
                    # Get both parents from the same family
                    parents = FamilyComposition.objects.filter(
                        fam=child_fc.fam,
                        fc_role__in=['MOTHER', 'FATHER']
                    ).select_related('rp__per')
                    
                    mother_info = None
                    father_info = None
                    
                    for parent in parents:
                        if parent.fc_role == 'MOTHER':
                            mother_info = {
                                'pat_id': parent.rp.patients.first().pat_id if hasattr(parent.rp, 'patients') else "",
                                'role': parent.fc_role,
                                'fname': parent.rp.per.per_fname or "",
                                'mname': parent.rp.per.per_mname or "",
                                'lname': parent.rp.per.per_lname or "",
                                'dob': parent.rp.per.per_dob or "",
                                'contact': parent.rp.per.per_contact or "",
                                'occupation': getattr(obj, 'mother_occupation', "") or ""  # From child record
                            }
                        elif parent.fc_role == 'FATHER':
                            father_info = {
                                'pat_id': parent.rp.patients.first().pat_id if hasattr(parent.rp, 'patients') else "",
                                'role': parent.fc_role,
                                'fname': parent.rp.per.per_fname or "",
                                'mname': parent.rp.per.per_mname or "",
                                'lname': parent.rp.per.per_lname or "",
                                'dob': parent.rp.per.per_dob or "",
                                'contact': parent.rp.per.per_contact or "",
                                'occupation': getattr(obj, 'father_occupation', "") or ""  # From child record
                            }
                    
                    return {
                        'mother': mother_info,
                        'father': father_info,
                        'family_id': child_fc.fam.fam_id or ""
                    }
            
            return {
                'mother': None,
                'father': None,
                'family_id': ""
            }
            
        except Exception as e:
            print(f"Error getting parent info: {str(e)}")
            return {
                'mother': None,
                'father': None,
                'family_id': ""
            }