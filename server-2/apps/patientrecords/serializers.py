from rest_framework import serializers
from .models import *
from datetime import date
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.serializers.minimal import ResidentProfileMinimalSerializer,HouseholdMinimalSerializer
from apps.healthProfiling.models import FamilyComposition,Household, ResidentProfile, Personal, PersonalAddress, Address
from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
from apps.healthProfiling.models import FamilyComposition,Household, ResidentProfile, Personal, PersonalAddress, Address
from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
# serializers.py
from apps.healthProfiling.serializers.minimal import (
    ResidentProfileMinimalSerializer,
    FCWithProfileDataSerializer,
    HouseholdMinimalSerializer
)
from apps.healthProfiling.serializers.minimal import (
    ResidentProfileMinimalSerializer,
    FCWithProfileDataSerializer,
    HouseholdMinimalSerializer
)

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
                  'spouse_occupation', 'spouse_dob', 'pat_id' ]
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


class SpouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spouse
        fields = '__all__'

class SpouseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spouse
        fields = [ 'spouse_type', 'spouse_lname', 'spouse_fname', 'spouse_mname',
                  'spouse_occupation', 'spouse_dob', 'pat_id' ]
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