from rest_framework import serializers
from .models import *
from datetime import date
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.serializers.minimal import ResidentProfileMinimalSerializer,HouseholdMinimalSerializer
from apps.healthProfiling.models import FamilyComposition,Household, ResidentProfile, Personal, PersonalAddress, Address
from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
# serializers.py
from apps.healthProfiling.serializers.minimal import *

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

    class Meta:
        model = Patient
        fields = '__all__'

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
        if obj.pat_type == 'Resident' and obj.rp_id and hasattr(obj.rp_id, 'per'):
            rp_ids = obj.rp_id.per.personal_information.all()
            compositions = FamilyComposition.objects.filter(rp__in=rp_ids)
            return FCWithProfileDataSerializer(compositions, many=True, context=self.context).data
        return []
    

    def get_family(self, obj):
        if obj.pat_type == 'Resident' and obj.rp_id:
            try:
                # Get all family compositions for this resident
                all_compositions = FamilyComposition.objects.filter(rp=obj.rp_id).order_by('-fc_id')
                
                if not all_compositions.exists():
                    print(f'No family composition found for resident {obj.rp_id.rp_id}')
                    return None

                # Try to find mother role first (existing logic)
                mother_composition = all_compositions.filter(fc_role__iexact='Mother').first()
                if mother_composition:
                    print(f'Found mother role for resident {obj.rp_id.rp_id}, using fam_id: {mother_composition.fam_id}')
                    return {
                        'fam_id': mother_composition.fam_id,
                        'fc_role': 'Mother',
                        'fc_id': mother_composition.fc_id
                    }
                
                # Try to find father role
                father_composition = all_compositions.filter(fc_role__iexact='Father').first()
                if father_composition:
                    print(f'Found father role for resident {obj.rp_id.rp_id}, using fam_id: {father_composition.fam_id}')
                    return {
                        'fam_id': father_composition.fam_id,
                        'fc_role': 'Father',
                        'fc_id': father_composition.fc_id
                    }
                
                # Fallback to other roles (existing logic)
                other_composition = all_compositions.exclude(
                    fc_role__iexact='Mother'
                ).exclude(
                    fc_role__iexact='Father'
                ).first()

                if other_composition:
                    print(f'Using other role ({other_composition.fc_role}) for resident {obj.rp_id.rp_id}')
                    return {
                        'fam_id': other_composition.fam_id,
                        'fc_role': other_composition.fc_role,
                        'fc_id': other_composition.fc_id
                    }
                
                return None
            
            except Exception as e:
                print(f'Error fetching fam_id for resident {obj.rp_id.rp_id}: {str(e)}')
                return None
            
        return None

    def get_family_head_info(self, obj):
        if obj.pat_type == 'Resident' and obj.rp_id:
            try:
                # Get the family ID from the current resident
                fam_info = self.get_family(obj)
                if not fam_info or not fam_info.get('fam_id'):
                    return None
                
                fam_id = fam_info['fam_id']
                
                # Find all family members in the same family
                family_compositions = FamilyComposition.objects.filter(
                    fam_id=fam_id
                ).select_related('rp', 'rp__per')
                
                family_heads = {}
                
                # Look for mother and father in the family
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
                
                return {
                    'fam_id': fam_id,
                    'family_heads': family_heads,
                    'has_mother': 'mother' in family_heads,
                    'has_father': 'father' in family_heads,
                    'total_heads': len(family_heads)
                }
                
            except Exception as e:
                print(f'Error fetching family head info: {str(e)}')
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
                full_address = f"{sitio}, {address.add_barangay}, {address.add_city}, {address.add_province}, {address.add_street}"
                result = {
                    'add_street': address.add_street,
                    'add_barangay': address.add_barangay,
                    'add_city': address.add_city,
                    'add_province': address.add_province,
                    'sitio': sitio,
                    'full_address': full_address
                }
                print("✅ PersonalAddress used →", result)
                return result

            # Fallback: Try to fetch from Household
            household = Household.objects.select_related('add', 'add__sitio').filter(rp=obj.rp_id).first()
            if household and household.add:
                address = household.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                full_address = f"{sitio}, {address.add_barangay}, {address.add_city}, {address.add_province}, {address.add_street}"
                result = {
                    'add_street': address.add_street,
                    'add_barangay': address.add_barangay,
                    'add_city': address.add_city,
                    'add_province': address.add_province,
                    'sitio': sitio,
                    'full_address': full_address
                }
                print("⚠️ No PersonalAddress. Used Household instead →", result)
                return result

            print("❌ No PersonalAddress or Household address found.")
        
        # Transient fallback
        if obj.pat_type == 'Transient' and obj.trans_id and obj.trans_id.tradd_id:
            trans_addr = obj.trans_id.tradd_id
            sitio = trans_addr.tradd_sitio
            full_address = f"{sitio}, {trans_addr.tradd_barangay}, {trans_addr.tradd_city}, {trans_addr.tradd_province}, {trans_addr.tradd_street}"
            result = {
                'add_street': trans_addr.tradd_street,
                'add_barangay': trans_addr.tradd_barangay,
                'add_city': trans_addr.tradd_city,
                'add_province': trans_addr.tradd_province,
                'sitio': sitio,
                'full_address': full_address
            }
            print("📦 Transient Address →", result)
            return result

        print("❓ Address not found for any type.")
        return None
    

    def get_spouse_info(self, obj):
        try:
            # Handle Resident patients
            if obj.pat_type == 'Resident' and obj.rp_id:
                # Use existing methods to get family information
                family_heads_info = self.get_family_head_info(obj)
                current_family_info = self.get_family(obj)
                
                # If no family composition found, allow spouse insertion
                if not family_heads_info or not current_family_info:
                    # Check medical records first for residents without family composition
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
                
                # Only apply family composition spouse logic for Mother/Father roles
                if current_role not in ['mother', 'father']:
                    # For other roles (Son, Daughter, etc.) or no role yet, check medical records first
                    medical_spouse = self._check_medical_records_for_spouse(obj)
                    
                    # If no spouse in medical records, allow spouse insertion
                    if not medical_spouse.get('spouse_exists', False):
                        return {
                            'spouse_exists': False,
                            'allow_spouse_insertion': True,
                            'reason': f'Resident has {current_role} role - can add spouse independently'
                        }
                    
                    return medical_spouse
                
                # Mother's spouse is Father, Father's spouse is Mother
                spouse_role = 'father' if current_role == 'mother' else 'mother'
                
                if spouse_role in family_heads:
                    # Spouse exists in family composition
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
                    # No spouse in family composition, allow insertion
                    spouse_role_title = spouse_role.title()
                    return {
                        'spouse_exists': False,
                        'allow_spouse_insertion': True,
                        'reason': f'{current_role.title()} role found but no {spouse_role_title} in family composition'
                    }
            
            # Handle Transient patients
            elif obj.pat_type == 'Transient':
                # Check medical records first for transients
                medical_spouse = self._check_medical_records_for_spouse(obj)
                
                # If no spouse in medical records, allow spouse insertion
                if not medical_spouse.get('spouse_exists', False):
                    return {
                        'spouse_exists': False,
                        'allow_spouse_insertion': True,
                        'reason': 'Transient patient - can add spouse'
                    }
                
                return medical_spouse
            
            # Unknown patient type
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
            patient_records = PatientRecord.objects.filter(pat_id=obj)

            # Check prenatal records
            prenatal_records = patient_records.filter(patrec_type__icontains='Prenatal')
            for pat_record in prenatal_records:
                if hasattr(pat_record, 'prenatal_form') and pat_record.prenatal_form:
                    prenatal = pat_record.prenatal_form
                    if hasattr(prenatal, 'spouse_id') and prenatal.spouse_id:
                        return {
                            'spouse_exists': True,
                            'spouse_source': 'prenatal_record',
                            'spouse_info': SpouseSerializer(prenatal.spouse_id, context=self.context).data
                        }

            # Check postpartum records
            postpartum_records = patient_records.filter(patrec_type__icontains='Postpartum')
            for pat_record in postpartum_records:
                if hasattr(pat_record, 'postpartum_record') and pat_record.postpartum_record:
                    postpartum = pat_record.postpartum_record
                    if hasattr(postpartum, 'spouse_id') and postpartum.spouse_id:
                        return {
                            'spouse_exists': True,
                            'spouse_source': 'postpartum_record',
                            'spouse_info': SpouseSerializer(postpartum.spouse_id, context=self.context).data
                        }
            
            # No spouse found in medical records either
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
  
    
class VitalSignsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = '__all__'


class ObstetricalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Obstetrical_History
        fields = '__all__'


class FollowUpVisitSerializer(PartialUpdateMixin,serializers.ModelSerializer):
    class Meta:
        model = FollowUpVisit
        fields = '__all__'


class SpouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spouse
        fields = '__all__'

class SpouseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spouse
        fields = [ 'spouse_type', 'spouse_lname', 'spouse_fname', 'spouse_mname',
                  'spouse_occupation', 'spouse_dob', 'created_at']
        extra_kwargs = {
            'spouse_mname': { 'required': False, 'allow_blank': True },
            'spouse_dob': { 'required': False, 'allow_blank': True }
        }
    
    def validate(self, data):
        required_fields = ['spouse_lname', 'spouse_fname', 'spouse_occupation', 'spouse_dob', 'pat_id']
        
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError(f"{field} is required.")
            
        return data

class BodyMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = '__all__'

class IllnessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Illness
class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finding
        fields = '__all__'
        
class PhysicalExaminationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalExamination
        fields = '__all__'

class PhysicalExamListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalExamList
        fields = '__all__'
        
class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = '__all__'