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
from apps.childhealthservices.models import ChildHealthrecord
from ..utils import (
    extract_personal_info, 
    extract_address, 
    get_personal_info, 
    get_address, 
    get_family, 
    get_family_head_info,
    get_additional_info,
    get_family_planning_method,
    get_mother_tt_status,
    get_family_head_address,
    check_medical_records_for_spouse,
    get_spouse_info,
    get_child_dependents_for_mother
)

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

class PatientMiniMalSerializer(serializers.ModelSerializer):
    personal_info = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    

    def get_personal_info(self, obj):
        return extract_personal_info(obj)

    def get_address(self, obj):
        return extract_address(obj)
    
    class Meta:
        model = Patient
        fields ='__all__'



class PatientMiniMalSerializerWithAddtionalInfo(serializers.ModelSerializer):
    personal_info = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    additional_info = serializers.SerializerMethodField()
    
     
    def get_personal_info(self, obj):
        return extract_personal_info(obj)

    def get_address(self, obj):
        return extract_address(obj)
    
    def get_additional_info(self, obj):
        return get_additional_info(obj)
    
    class Meta:
        model = Patient
        fields ='__all__'


class PatientMChildreniniMalSerializer(serializers.ModelSerializer):
    personal_info = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    family_head_info = serializers.SerializerMethodField()
    additional_info = serializers.SerializerMethodField()
     
    def get_personal_info(self, obj):
        return extract_personal_info(obj)

    def get_address(self, obj):
        return extract_address(obj)
    
    def get_family_head_info(self, obj):
        return get_family_head_info(obj, context=self.context)
    
    def get_additional_info(self, obj):
        return get_additional_info(obj)
    
    class Meta:
        model = Patient
        fields ='__all__'


class PatientSerializer(serializers.ModelSerializer):
    personal_info = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    rp_id = ResidentProfileMinimalSerializer(read_only=True)
    family_compositions = serializers.SerializerMethodField()
    households = serializers.SerializerMethodField()
    family = serializers.SerializerMethodField()
    family_head_info = serializers.SerializerMethodField()
    spouse_info = serializers.SerializerMethodField()
    additional_info = serializers.SerializerMethodField()
    completed_pregnancy_count = serializers.IntegerField(read_only=True)
    family_planning_method = serializers.SerializerMethodField()
    
    
    class Meta:
        model = Patient
        fields = '__all__'

    def get_family_planning_method(self, obj):
        """Use utility function from utils.py"""
        return get_family_planning_method(obj)
    
    def get_personal_info(self, obj):
        return get_personal_info(obj, context=self.context)

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
        """Use utility function from utils.py"""
        return get_family(obj)

    def get_family_head_info(self, obj):
        """Use utility function from utils.py"""
        return get_family_head_info(obj, context=self.context)

    def get_households(self, obj):
        if obj.pat_type == 'Resident' and obj.rp_id and hasattr(obj.rp_id, 'per'):
            rp_ids = obj.rp_id.per.personal_information.all()
            households = Household.objects.filter(rp__in=rp_ids)
            return HouseholdMinimalSerializer(households, many=True, context=self.context).data
        return []

    def get_address(self, obj):
        """Use utility function from utils.py"""
        return get_address(obj)

    def get_spouse_info(self, obj):
        """Use utility function from utils.py"""
        return get_spouse_info(obj, context=self.context)
        
    def get_additional_info(self, obj):
        """Use utility function from utils.py"""
        return get_additional_info(obj)


class PatientRecordChildrenSerializer(serializers.ModelSerializer):
    pat_details = PatientMChildreniniMalSerializer(source='pat_id', read_only=True)

    class Meta:
        model = PatientRecord
        fields = '__all__'

class PatientRecordMiniSerializer(serializers.ModelSerializer):
    pat_details = PatientMiniMalSerializer(source='pat_id', read_only=True)

    class Meta:
        model = PatientRecord 
        fields = '__all__'

class PatientRecordSerializer(serializers.ModelSerializer):
    pat_details = PatientSerializer(source='pat_id', read_only=True)

    class Meta:
        model = PatientRecord 
        fields = '__all__'
