from rest_framework import serializers
from ..models import *
from datetime import date
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.serializers.minimal import ResidentProfileMinimalSerializer,HouseholdMinimalSerializer
from apps.healthProfiling.models import FamilyComposition,Household, ResidentProfile, Personal, PersonalAddress, Address
from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
from apps.maternal.models import PostpartumRecord, TT_Status, Prenatal_Form
from apps.familyplanning.models import FP_Record, FP_type
from apps.healthProfiling.serializers.minimal import *
from .spouse_serializers import SpouseSerializer


class PartialUpdateMixin:  
    def to_internal_value(self, data):
        if self.instance:
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)
    
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
    family_planning_record = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'

    def get_family_planning_record(self, obj):
        try:
            fp_record = FP_Record.objects.filter(pat_id=obj).order_by('-created_at').first()

            if fp_record:
                # Find the FP_type associated with the record
                fp_type = FP_type.objects.filter(fprecord_id=fp_record).first()
                if fp_type:
                    return {
                        'has_fp_record': True,
                        'fp_method': fp_type.fpt_method_used,
                        'client_type': fp_type.fpt_client_type
                    }

            return {'has_fp_record': False}
        except Exception as e:
            # You might want to log this error instead of returning it in the response
            print(f'Error checking family planning record: {str(e)}')
            return {'has_fp_record': False, 'error': str(e)}


    def get_personal_info(self, obj):
        # Resident personal data
        if obj.pat_type == 'Resident' and obj.rp_id and hasattr(obj.rp_id, 'per'):
            personal = obj.rp_id.per
            return PersonalSerializer(personal, context=self.context).data
        #
        # Transient personal data
        if obj.pat_type == 'Transient' and obj.trans_id:
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
                ).select_related('rp_id', 'rp_id__per')
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
                    print(f'Found mother role for resident {obj.rp_id.rp_id}, using fam_id: {mother_composition.fam_id}')
                    print(f'Mother Info: {mother_composition}')
                    return {
                        'fam_id': str(mother_composition.fam_id),
                        'fc_role': 'Mother',
                        'fc_id': mother_composition.fc_id
                    }
                
                # try to find father role
                father_composition = all_compositions.filter(fc_role__iexact='Father').first()
                if father_composition:
                    print(f'Found father role for resident {obj.rp_id.rp_id}, using fam_id: {father_composition.fam_id}')
                    print(f'Father Info: {father_composition}')
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
                    print(f'Using other role ({other_composition.fc_role}) for resident {obj.rp_id.rp_id}')
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
            # check if mother is registered as patient
            mother_patient = Patient.objects.filter(rp_id=mother_rp, pat_type='Resident').first()

            if not mother_patient:
                return f'TT Status not found - Not a patient'

            mom_prenatal_record = PatientRecord.objects.filter(
                pat_id=mother_patient,
                patrec_type__icontains='Prenatal'
            ).order_by('-created_at')

            if not mom_prenatal_record.exists():
                return f'TT Status not found - No prenatal record'
            
            for i, pat_record in enumerate(mom_prenatal_record[:2]):
                try:
                    if hasattr(pat_record, 'prenatal_form') and pat_record.prenatal_form:
                        prenatal = pat_record.prenatal_form
                        
                        tt_status_record = TT_Status.objects.filter(pf_id=prenatal).first()
                        if tt_status_record:
                            record_rank = "latest" if i == 0 else "previous"
                            print(f'Found tt status in record {record_rank}')

                            if hasattr(tt_status_record, 'tts_status'):
                                return tt_status_record.tts_status
                except Exception as record_error:
                    print(f'Error fetching in record {i+1}: {str(record_error)}')   
                    continue
            return f'TT Status not found - No TT Status records'
        
        except Exception as e:
            print(f'Error in getting mother tt status: {str(e)}')
            return f'TT Status not found - {str(e)}'


    def get_family_head_info(self, obj):
        family_heads = {}
        if obj.pat_type == 'Resident' and obj.rp_id:
            try:
                # family of current resident
                current_composition = FamilyComposition.objects.filter(rp=obj.rp_id).order_by('-fam_id__fam_date_registered','-fc_id').first()
                if not current_composition:
                    return None
                
                fam_id = current_composition.fam_id
                
                # all family members in the same family
                family_compositions = FamilyComposition.objects.filter(
                    fam_id=fam_id
                ).select_related('rp', 'rp__per')
                
                for composition in family_compositions:
                    role = composition.fc_role.lower()
                    if role in ['mother', 'father'] and composition.rp and hasattr(composition.rp, 'per'):
                        personal = composition.rp.per
                        family_heads[role] = {
                            'rp_id': composition.rp.rp_id,
                            'role': composition.fc_role,
                            'personal_info': PersonalSerializer(personal, context=self.context).data,
                            'composition_id': composition.fc_id
                        }

                        # check if mother has TT status
                        if role == 'mother':
                            tt_status = self.get_mother_tt_status(composition.rp)
                            family_heads['tt_status'] = tt_status
                
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
                        }
                    }
                    print(f"Transient Mother Info: {family_heads['mother']}")

                if trans.father_fname or trans.father_lname:
                    family_heads['father'] = {
                        'role': 'Father',
                        'personal_info': {
                            'per_fname': trans.father_fname,
                            'per_lname': trans.father_lname,
                            'per_mname': trans.father_mname,
                            'per_dob': trans.father_dob,
                        }
                    }
                    print(f"Transient Father Info: {family_heads['father']}")
                
                return {
                    'fam_id': None,  # Transient has no `fam_id` because no FamilyComposition
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
        if obj.pat_type == 'Resident' and obj.rp_id:
            # First: Try to fetch PersonalAddress
            personal_address = PersonalAddress.objects.select_related('add', 'add__sitio').filter(per=obj.rp_id.per).first()
            if personal_address and personal_address.add:
                address = personal_address.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                # Construct full address dynamically based on available fields
                address_parts = [
                    f"Sitio {sitio}" if sitio else None,
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
                print("✅ PersonalAddress used →", result)
                return result

            # Fallback: Try to fetch from Household
            household = Household.objects.select_related('add', 'add__sitio').filter(rp=obj.rp_id).first()
            if household and household.add:
                address = household.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                # Construct full address dynamically based on available fields
                address_parts = [
                    f"Sitio {sitio}" if sitio else None,
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
        if obj.pat_type == 'Transient' and obj.trans_id and obj.trans_id.tradd_id:
            trans_addr = obj.trans_id.tradd_id
            sitio = trans_addr.tradd_sitio
            # Construct full address dynamically based on available fields
            address_parts = [
                f"Sitio {sitio}" if sitio else None,
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
            # family_planning_with_spouse = PostpartumRecord.objects.filter(
            #     patrec_id__pat_id=obj,
            #     spouse_id__isnull=False
            # ).select_related('spouse_id').order_by('-created_at').first()
            
            # if family_planning_with_spouse and family_planning_with_spouse.spouse_id:
            #     return {
            #         'spouse_exists': True,
            #         'spouse_source': 'postpartum_record',
            #         'spouse_info': SpouseSerializer(family_planning_with_spouse.spouse_id, context=self.context).data
            #     }

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
            
            # Check prenatal records if no postpartum spouse found
            # patient_records = PatientRecord.objects.filter(
            #     pat_id=obj,
            #     patrec_type__icontains='Prenatal'
            # )
            
            # for pat_record in patient_records:
            #     if hasattr(pat_record, 'prenatal_form') and pat_record.prenatal_form:
            #         prenatal = pat_record.prenatal_form
            #         if hasattr(prenatal, 'spouse_id') and prenatal.spouse_id:
            #             return {
            #                 'spouse_exists': True,
            #                 'spouse_source': 'prenatal_record',
            #                 'spouse_info': SpouseSerializer(prenatal.spouse_id, context=self.context).data
            #             }
            
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

   
class PatientRecordSerializer(serializers.ModelSerializer):
    pat_details = PatientSerializer(source='pat_id', read_only=True)

    class Meta:
        model = PatientRecord
        fields = '__all__'
  