from rest_framework import serializers
from ..models import *
from datetime import date
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.serializers.minimal import ResidentProfileMinimalSerializer,HouseholdMinimalSerializer
from apps.healthProfiling.models import FamilyComposition,Household, ResidentProfile, Personal, PersonalAddress, Address, HealthRelatedDetails, MotherHealthInfo
from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
from apps.maternal.models import *
from apps.healthProfiling.serializers.minimal import *
from apps.healthProfiling.models import *
from apps.healthProfiling.serializers.resident_profile_serializers import *
from apps.familyplanning.models import *
from .spouse_serializers import SpouseSerializer


class PartialUpdateMixin:  
    def to_internal_value(self, data):
        if self.instance:
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)
    
class ResidentProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    per_add_philhealth_id = serializers.SerializerMethodField()
    mhi_immun_status = serializers.SerializerMethodField()
    personal_info = ResidentPersonalInfoSerializer(source='*')

    class Meta:
        model = ResidentProfile
        fields = ['rp_id', 'name', 'personal_info', 'per_add_philhealth_id', 'mhi_immun_status']

    def get_name(self, obj):
        info = obj.per
        return f"{info.per_lname}, {info.per_fname}" + \
            (f" {info.per_mname[0]}." if info.per_mname else "")
    
    def get_per_add_philhealth_id(self, obj):
        detail = HealthRelatedDetails.objects.filter(rp=obj).first()
        return detail.per_add_philhealth_id if detail else None

    def get_mhi_immun_status(self, obj):
        mhi = MotherHealthInfo.objects.filter(rp=obj).first()
        return mhi.mhi_immun_status if mhi else None
    
class TransientAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransientAddress
        fields = '__all__'

class TransientSerializer(serializers.ModelSerializer):
    tradd_id = TransientAddressSerializer(read_only=True)
    
    class Meta:
        model = Transient
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    personal_info = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    rp_id = ResidentProfileMinimalSerializer(read_only=True)
    family_compositions = serializers.SerializerMethodField()
    households = serializers.SerializerMethodField()
    family = serializers.SerializerMethodField()
    family_head_info = serializers.SerializerMethodField()
    spouse_info = serializers.SerializerMethodField()
    # family_planning_record = serializers.SerializerMethodField()
    additional_info = serializers.SerializerMethodField()
    completed_pregnancy_count = serializers.IntegerField(read_only=True)
    family_planning_method = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = '__all__'

    def get_family_planning_method(self, obj):
        """
        Returns the latest family planning method used (from FP_type.fpt_method_used).
        Fetches the most recent FP_Record, then its associated FP_type.
        Returns None if no records exist.
        """
        # Get the latest FP_Record for this patient (using related_name='fp_records')
        latest_fp_record = obj.fp_records.order_by('-created_at').first()
        
        if latest_fp_record:
            # Get the associated FP_type (default related_name='fp_type_set')
            fp_type = latest_fp_record.fp_type_set.first()  # Or FP_type.objects.filter(fprecord=latest_fp_record).first()
            if fp_type:
                return fp_type.fpt_method_used  # This is the method used (e.g., "Pill", "IUD", etc.)
        
        return None
    
    def get_personal_info(self, obj):
        """Get personal information for both resident and transient patients"""
        # Resident personal data
        if obj.pat_type == 'Resident' and obj.rp_id and hasattr(obj.rp_id, 'per'):
            return PersonalSerializer(obj.rp_id.per, context=self.context).data
        
        # Transient personal data
        elif obj.pat_type == 'Transient' and obj.trans_id:
            trans = obj.trans_id
            return {
                'per_fname': trans.tran_fname,
                'per_lname': trans.tran_lname,
                'per_mname': trans.tran_mname,
                'per_suffix': trans.tran_suffix,
                'per_dob': trans.tran_dob,
                'per_sex': trans.tran_sex,
                'per_status': trans.tran_status,
                'per_edAttainment': trans.tran_ed_attainment,
                'per_religion': trans.tran_religion,
                'per_contact': trans.tran_contact,
                'philhealth_id': trans.philhealth_id,
            }
        
        return None

    def get_family_compositions(self, obj):
        if obj.pat_type == 'Resident' and obj.rp_id:
            try:
                current_compositions = FamilyComposition.objects.filter(
                    rp=obj.rp_id
                ).order_by('-fam_id__fam_date_registered', '-fc_id').first()

                if not current_compositions:
                    return []

                all_fam_composition = FamilyComposition.objects.filter(
                    fam_id=current_compositions.fam_id
                ).select_related('rp', 'rp__per')
                return FCWithProfileDataSerializer(all_fam_composition, many=True, context=self.context).data
            except Exception as e:
                print(f'Error fetching family compositions for resident {obj.rp_id.rp_id}: {str(e)}')
                return []
        return []
    
    
    def get_family(self, obj):
        if obj.pat_type == 'Resident' and obj.rp_id:
            try:
                # get all family compositions for this resident
                current_composition = FamilyComposition.objects.filter(
                    rp=obj.rp_id
                ).order_by('-fam_id__fam_date_registered','-fc_id').first()
                
                if not current_composition:
                    print(f'No family composition found for resident {obj.rp_id.rp_id}')
                    return None

                fam_id = current_composition.fam_id

                all_compositions = FamilyComposition.objects.filter(
                    fam_id=fam_id
                ).select_related('rp', 'rp__per')

                current_role = FamilyComposition.objects.filter(rp=obj.rp_id).order_by('-fam_id__fam_date_registered','-fc_id').first()
                if current_role:
                    return{
                        'fam_id': str(current_role.fam_id),
                        'fc_role': current_role.fc_role,
                        'fc_id': current_role.fc_id
                    }

                # try to find mother role first (existing logic)
                mother_composition = all_compositions.filter(fc_role__iexact='Mother').first()
                if mother_composition:
                    # print(f'Found mother role for resident {obj.rp_id.rp_id}, using fam_id: {mother_composition.fam_id}')
                    # print(f'Mother Info: {mother_composition}')
                    return {
                        'fam_id': str(mother_composition.fam_id),
                        'fc_role': 'Mother',
                        'fc_id': mother_composition.fc_id
                    }
                
                # try to find father role
                father_composition = all_compositions.filter(fc_role__iexact='Father').first()
                if father_composition:
                    # print(f'Found father role for resident {obj.rp_id.rp_id}, using fam_id: {father_composition.fam_id}')
                    # print(f'Father Info: {father_composition}')
                    return {
                        'fam_id': str(father_composition.fam_id),
                        'fc_role': 'Father',
                        'fc_id': father_composition.fc_id
                    }
                
                # fallback to other roles
                other_composition = all_compositions.exclude(
                    fc_role__iexact='Mother'
                ).exclude(
                    fc_role__iexact='Father'
                ).first()

                if other_composition:
                    # print(f'Using other role ({other_composition.fc_role}) for resident {obj.rp_id.rp_id}')
                    return {
                        'fam_id': str(other_composition.fam_id),
                        'fc_role': other_composition.fc_role,
                        'fc_id': other_composition.fc_id
                    }
                
                return None
            
            
            except Exception as e:
                print(f'Error fetching fam_id for resident {obj.rp_id.rp_id}: {str(e)}')
                return None
            
        return None
    
    # method to retrieve a mother's TT Status
    def get_mother_tt_status(self, mother_rp):
        try:
            # TT_Status is now linked directly to pat_id. Query by pat_id for latest status.
            tt_qs = TT_Status.objects.filter(
                pat_id__rp_id=mother_rp
            ).order_by('-tts_date_given', '-tts_id')

            if tt_qs.exists():
                return tt_qs.first().tts_status
            return 'No TT Status found'
        
        except Exception as e:
            print(f'Error in getting mother tt status: {str(e)}')
            return f'TT Status not found - {str(e)}'


    def get_family_head_info(self, obj):
        """
        Get family head information, including family planning method for mother and/or father
        """
        family_heads = {}
        if obj.pat_type == 'Resident' and obj.rp_id:
            try:
                # Family of current resident
                current_composition = FamilyComposition.objects.filter(rp=obj.rp_id).order_by('-fam_id__fam_date_registered', '-fc_id').first()
                if not current_composition:
                    return None

                fam_id = current_composition.fam_id

                # All family members in the same family
                family_compositions = FamilyComposition.objects.filter(
                    fam_id=fam_id
                ).select_related('rp', 'rp__per')

                for composition in family_compositions:
                    role = composition.fc_role.lower()
                    if role in ['mother', 'father'] and composition.rp and hasattr(composition.rp, 'per'):
                        personal = composition.rp.per
                        # Fetch the Patient instance for this family member to get FP records
                        patient = Patient.objects.filter(rp_id=composition.rp).first()
                        family_planning_method = None
                        if patient:
                            latest_fp_record = patient.fp_records.order_by('-created_at').first()
                            if latest_fp_record:
                                fp_type = latest_fp_record.fp_type_set.first()
                                family_planning_method = fp_type.fpt_method_used if fp_type else None

                        family_heads[role] = {
                            'rp_id': composition.rp.rp_id,
                            'role': composition.fc_role,
                            'personal_info': PersonalSerializer(personal, context=self.context).data,
                            'composition_id': composition.fc_id,
                            'family_planning_method': family_planning_method  # Add FP method
                        }
                        # NOTE: mother TT status lookup moved to get_additional_info
                
                return {
                    'fam_id': fam_id,
                    'family_heads': family_heads,
                    'has_mother': 'mother' in family_heads,
                    'has_father': 'father' in family_heads,
                    'total_heads': len(family_heads)
                }
            except Exception as e:
                print(f"Error in get_family_head_info: {str(e)}")
                return None

        elif obj.pat_type == 'Transient' and obj.trans_id:
            try:
                trans = obj.trans_id
                if trans.mother_fname or trans.mother_lname:
                    family_heads['mother'] = {
                        'role': 'Mother',
                        'personal_info': {
                            'per_fname': trans.mother_fname,
                            'per_lname': trans.mother_lname,
                            'per_mname': trans.mother_mname,
                            'per_dob': trans.mother_dob,
                        },
                        'family_planning_method': None  # No FP records for transient mother
                    }

                if trans.father_fname or trans.father_lname:
                    family_heads['father'] = {
                        'role': 'Father',
                        'personal_info': {
                            'per_fname': trans.father_fname,
                            'per_lname': trans.father_lname,
                            'per_mname': trans.father_mname,
                            'per_dob': trans.father_dob,
                        },
                        'family_planning_method': None  # No FP records for transient father
                    }

                return {
                    'fam_id': None,  # Transient has no fam_id
                    'family_heads': family_heads,
                    'has_mother': 'mother' in family_heads,
                    'has_father': 'father' in family_heads,
                    'total_heads': len(family_heads)
                }
            except Exception as e:
                print(f"Error in get_family_head_info: {str(e)}")
                return None

        return None


    def get_households(self, obj):
        if obj.pat_type == 'Resident' and obj.rp_id and hasattr(obj.rp_id, 'per'):
            rp_ids = obj.rp_id.per.personal_information.all()
            households = Household.objects.filter(rp__in=rp_ids)
            return HouseholdMinimalSerializer(households, many=True, context=self.context).data
        return []

    def get_address(self, obj):
        """Get address information with improved error handling"""
        try:
            if obj.pat_type == 'Resident' and obj.rp_id:
                # First: Try to fetch PersonalAddress
                personal_address = PersonalAddress.objects.select_related('add', 'add__sitio').filter(per=obj.rp_id.per).first()
                if personal_address and personal_address.add:
                    address = personal_address.add
                    sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                    # Construct full address dynamically based on available fields
                    address_parts = [
                        address.add_barangay if address.add_barangay else None,
                        address.add_city if address.add_city else None,
                        address.add_province if address.add_province else None,
                        address.add_street if address.add_street else None,
                    ]
                    # Filter out None values and join with ", "
                    full_address = ", ".join(filter(None, address_parts))
                    result = {
                        'add_street': address.add_street,
                        'add_barangay': address.add_barangay,
                        'add_city': address.add_city,
                        'add_province': address.add_province,
                        'add_sitio': sitio,
                        'full_address': full_address
                    }
                    # print("✅ PersonalAddress used →", result)
                    return result

                # Fallback: Try to fetch from Household
                household = Household.objects.select_related('add', 'add__sitio').filter(rp=obj.rp_id).first()
                if household and household.add:
                    address = household.add
                    sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                    # Construct full address dynamically based on available fields
                    address_parts = [
                        address.add_barangay if address.add_barangay else None,
                        address.add_city if address.add_city else None,
                        address.add_province if address.add_province else None,
                        address.add_street if address.add_street else None,
                    ]
                    # Filter out None values and join with ", "
                    full_address = ", ".join(filter(None, address_parts))
                    result = {
                        'add_street': address.add_street,
                        'add_barangay': address.add_barangay,
                        'add_city': address.add_city,
                        'add_province': address.add_province,
                        'add_sitio': sitio,
                        'full_address': full_address
                    }
                    print("⚠️ No PersonalAddress. Used Household instead →", result)
                    return result

                print("❌ No PersonalAddress or Household address found.")
            
            # Transient fallback
            elif obj.pat_type == 'Transient' and obj.trans_id and obj.trans_id.tradd_id:
                trans_addr = obj.trans_id.tradd_id
                sitio = trans_addr.tradd_sitio
                # Construct full address dynamically based on available fields
                address_parts = [
                    trans_addr.tradd_barangay if trans_addr.tradd_barangay else None,
                    trans_addr.tradd_city if trans_addr.tradd_city else None,
                    trans_addr.tradd_province if trans_addr.tradd_province else None,
                    trans_addr.tradd_street if trans_addr.tradd_street else None,
                ]
                # Filter out None values and join with ", "
                full_address = ", ".join(filter(None, address_parts))
                result = {
                    'add_street': trans_addr.tradd_street,
                    'add_barangay': trans_addr.tradd_barangay,
                    'add_city': trans_addr.tradd_city,
                    'add_province': trans_addr.tradd_province,
                    'add_sitio': sitio,
                    'full_address': full_address
                }
                print("📦 Transient Address →", result)
                return result

            print("❓ Address not found for any type.")
            return None
            
        except Exception as e:
            print(f"Error retrieving address: {str(e)}")
            return None
    

    def get_spouse_info(self, obj):
        try:
            # handle Resident patients
            if obj.pat_type == 'Resident' and obj.rp_id:
                family_heads_info = self.get_family_head_info(obj)
                current_family_info = self.get_family(obj)
                
                # if no family composition found, allow spouse insertion
                if not family_heads_info or not current_family_info:
                    medical_spouse = self._check_medical_records_for_spouse(obj)
                    if not medical_spouse.get('spouse_exists', False):
                        return {
                            'spouse_exists': False,
                            'allow_spouse_insertion': True,
                            'reason': 'No family composition found - can add spouse'
                        }
                    return medical_spouse
                
                current_role = current_family_info['fc_role'].lower()
                family_heads = family_heads_info['family_heads']
                
                # only apply family composition spouse logic for Mother/Father roles
                if current_role not in ['mother', 'father']:
                    medical_spouse = self._check_medical_records_for_spouse(obj)
                    
                    # if no spouse in patient records, allow spouse insertion
                    if not medical_spouse.get('spouse_exists', False):
                        return {
                            'spouse_exists': False,
                            'allow_spouse_insertion': True,
                            'reason': f'Resident has {current_role} role - can add spouse independently'
                        }
                    
                    return medical_spouse
                
                # mother's spouse is Father, Father's spouse is Mother
                spouse_role = 'father' if current_role == 'mother' else 'mother'
                
                if spouse_role in family_heads:
                    # spouse exists in family composition
                    spouse_info = family_heads[spouse_role]
                    personal_info = spouse_info['personal_info']
                    
                    return {
                        'spouse_exists': True,
                        'spouse_source': 'family_composition',
                        'spouse_info': {
                            'rp_id': spouse_info['rp_id'],
                            'spouse_lname': personal_info.get('per_lname', ''),
                            'spouse_fname': personal_info.get('per_fname', ''),
                            'spouse_mname': personal_info.get('per_mname', ''),
                            'spouse_dob': personal_info.get('per_dob', ''),
                            'spouse_occupation': personal_info.get('per_occupation', ''),
                            'fc_role': spouse_info['role'],
                            'composition_id': spouse_info['composition_id']
                        }
                    }
                else:
                    # no spouse in family composition, allow insertion
                    spouse_role_title = spouse_role.title()
                    return {
                        'spouse_exists': False,
                        'allow_spouse_insertion': True,
                        'reason': f'{current_role.title()} role found but no {spouse_role_title} in family composition'
                    }
            
            # handle transient patients
            elif obj.pat_type == 'Transient':
                # check patient records first for transients
                medical_spouse = self._check_medical_records_for_spouse(obj)
                
                # ff no spouse in medical records, allow spouse insertion
                if not medical_spouse.get('spouse_exists', False):
                    return {
                        'spouse_exists': False,
                        'allow_spouse_insertion': True,
                        'reason': 'Transient patient - can add spouse'
                    }
                
                return medical_spouse
            
            else:
                return {
                    'spouse_exists': False,
                    'allow_spouse_insertion': True,
                    'reason': 'Unknown patient type - can add spouse'
                }
        
        except Exception as e:
            print(f"Error in get_spouse_info: {str(e)}")
            return {
                'spouse_exists': False,
                'allow_spouse_insertion': True,
                'reason': f'Error occurred: {str(e)}'
            }


    def _check_medical_records_for_spouse(self, obj):
        try:
            family_planning_with_spouse = FP_Record.objects.filter(
                patrec_id__pat_id=obj,
                spouse_id__isnull=False
            ).select_related('spouse').order_by('-created_at').first()
            
            if family_planning_with_spouse and family_planning_with_spouse.spouse_id:
                return {
                    'spouse_exists': True,
                    'spouse_source': 'postpartum_record',
                    'spouse_info': SpouseSerializer(family_planning_with_spouse.spouse_id, context=self.context).data
                }

            # query PostpartumRecord with spouse
            postpartum_with_spouse = PostpartumRecord.objects.filter(
                patrec_id__pat_id=obj,
                spouse_id__isnull=False
            ).select_related('spouse_id').order_by('-created_at').first()
            
            if postpartum_with_spouse and postpartum_with_spouse.spouse_id:
                return {
                    'spouse_exists': True,
                    'spouse_source': 'postpartum_record',
                    'spouse_info': SpouseSerializer(postpartum_with_spouse.spouse_id, context=self.context).data
                }
            
            # query Prenatal_Form with spouse
            prental_with_spouse = Prenatal_Form.objects.filter(
                patrec_id__pat_id=obj,
                spouse_id__isnull=False
            ).select_related('spouse_id').order_by('-created_at').first()
            
            if prental_with_spouse and prental_with_spouse.spouse_id:
                return {
                    'spouse_exists': True,
                    'spouse_source': 'prenatal_form',
                    'spouse_info': SpouseSerializer(prental_with_spouse.spouse_id, context=self.context).data
                }
            
            # No spouse found in medical records
            return {
                'spouse_exists': False,
                'allow_spouse_insertion': True,
                'reason': 'No spouse found in family composition or medical records'
            }

        except Exception as e:
            print(f"Error checking medical records for spouse: {str(e)}")
            return {
                'spouse_exists': False,
                'allow_spouse_insertion': True,
                'reason': f'Error in medical records check: {str(e)}'
            }

        
    def get_additional_info(self, obj):
        try:
            additional_info = {}

            # Case 1: Resident patient with rp_id
            if obj.pat_id and obj.rp_id:
                # philhealth from HealthRelatedDetails (resident)
                per_ph_id = HealthRelatedDetails.objects.filter(rp=obj.rp_id).first()
                if per_ph_id:
                    additional_info['philhealth_id'] = per_ph_id.per_add_philhealth_id

                # Try to find latest family composition for this resident
                current_composition = FamilyComposition.objects.filter(rp=obj.rp_id).order_by('-fam_id__fam_date_registered','-fc_id').first()
                if current_composition:
                    # If the current role for this resident is 'Father', skip fetching mother TT status
                    try:
                        current_role = (current_composition.fc_role or '').strip().lower()
                    except Exception:
                        current_role = ''

                    if current_role == 'father':
                        # don't attempt to fetch mother TT status when resident's role is Father
                        pass
                    else:
                        fam_id = current_composition.fam_id
                        all_compositions = FamilyComposition.objects.filter(fam_id=fam_id).select_related('rp', 'rp__per')
                        # find composition entry with role mother if present
                        mother_comp = all_compositions.filter(fc_role__iexact='Mother').first()
                        if mother_comp:
                            # get TT_Status for mother (resident rp)
                            try:
                                tt_status = TT_Status.objects.filter(
                                    pat_id__rp_id=mother_comp.rp.rp_id
                                ).order_by('-tts_date_given', '-tts_id').first()
                                if tt_status:
                                    additional_info['mother_tt_status'] = {
                                        'status': tt_status.tts_status,
                                        'date_given': tt_status.tts_date_given
                                    }
                                else:
                                    additional_info['mother_tt_status'] = None
                            except Exception as e:
                                additional_info['mother_tt_status'] = None

                # Check for latest pregnancy and AOG data
                try:
                    latest_pregnancy = Pregnancy.objects.filter(
                        pat_id=obj,
                        status='active'
                    ).order_by('-created_at').first()
                    
                    if latest_pregnancy:
                        # Get the latest prenatal form for this pregnancy
                        latest_prenatal = Prenatal_Form.objects.filter(
                            pregnancy_id=latest_pregnancy
                        ).order_by('-created_at').first()

                        additional_info['latest_pf_id'] = latest_prenatal.pf_id
                        
                        if latest_prenatal:
                            # Get the latest prenatal care entry with AOG data
                            latest_prenatal_care = PrenatalCare.objects.filter(
                                pf_id=latest_prenatal,
                                pfpc_aog_wks__isnull=False
                            ).order_by('-pfpc_date', '-created_at').first()
                            
                            if latest_prenatal_care:
                                additional_info['latest_aog_weeks'] = latest_prenatal_care.pfpc_aog_wks
                                additional_info['latest_aog_days'] = latest_prenatal_care.pfpc_aog_days
                except Exception as e:
                    print(f"Error fetching AOG data for resident: {str(e)}")

                return additional_info if additional_info else None

            # Case 2: Transient patient - check transient's philhealth and TT_Status via Transient or related records
            if obj.pat_id and obj.trans_id:
                trans = obj.trans_id
                # check transient philhealth
                if getattr(trans, 'philhealth_id', None):
                    additional_info['philhealth_id'] = trans.philhealth_id

                # For TT status, attempt to find latest TT_Status associated with this transient via patient records
                try:
                    tt_qs = TT_Status.objects.filter(
                        pat_id=obj
                    ).select_related('pat_id').order_by('-tts_date_given', '-tts_id')
                    if tt_qs.exists():
                        latest_tt_status = tt_qs.first()
                        additional_info['mother_tt_status'] = {
                            'status': latest_tt_status.tts_status,
                            'date_given': latest_tt_status.tts_date_given
                        }
                    else:
                        additional_info['mother_tt_status'] = None
                except Exception:
                    additional_info['mother_tt_status'] = None

                # Check for latest pregnancy and AOG data
                try:
                    latest_pregnancy = Pregnancy.objects.filter(
                        pat_id=obj,
                        status='active'
                    ).order_by('-created_at').first()
                    
                    if latest_pregnancy:
                        # Get the latest prenatal form for this pregnancy
                        latest_prenatal = Prenatal_Form.objects.filter(
                            pregnancy_id=latest_pregnancy
                        ).order_by('-created_at').first()

                        additional_info['latest_pf_id'] = latest_prenatal.pf_id
                        
                        if latest_prenatal:
                            # Get the latest prenatal care entry with AOG data
                            latest_prenatal_care = PrenatalCare.objects.filter(
                                pf_id=latest_prenatal,
                                pfpc_aog_wks__isnull=False
                            ).order_by('-pfpc_date', '-created_at').first()
                            
                            if latest_prenatal_care:
                                additional_info['latest_aog_weeks'] = latest_prenatal_care.pfpc_aog_wks
                                additional_info['latest_aog_days'] = latest_prenatal_care.pfpc_aog_days
                except Exception as e:
                    print(f"Error fetching AOG data for transient: {str(e)}")

                return additional_info if additional_info else None

            # Fallback: nothing found
            return None
        except Exception as e:
            print(f"Error in get_additional_info: {str(e)}")
            return None

   
class PatientRecordSerializer(serializers.ModelSerializer):
    pat_details = PatientSerializer(source='pat_id', read_only=True)

    class Meta:
        model = PatientRecord
        fields = '__all__'
  