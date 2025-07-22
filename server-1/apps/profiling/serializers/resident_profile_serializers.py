from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from ..models import *
from ..serializers.personal_serializers import *
from ..serializers.address_serializers import *
from apps.account.serializers import UserAccountSerializer
from apps.administration.models import Staff
from datetime import datetime

class ResidentProfileBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResidentProfile
        fields = '__all__'
        extra_kwargs = {
            'per': {'write_only': True}, 
            'staff': {'write_only': True}
        }

class ResidentProfileTableSerializer(serializers.ModelSerializer):
    lname = serializers.CharField(source='per.per_lname')
    fname = serializers.CharField(source='per.per_fname')
    mname = serializers.SerializerMethodField()
    sex = serializers.CharField(source='per.per_sex')
    household_no = serializers.SerializerMethodField()
    family_no = serializers.SerializerMethodField()
    business_owner = serializers.SerializerMethodField()
    has_account = serializers.SerializerMethodField()
    dob = serializers.DateField(source="per.per_dob")
    age = serializers.SerializerMethodField()
    registered_by = serializers.SerializerMethodField()

    class Meta:
        model = ResidentProfile
        fields = [ 'rp_id', 'rp_date_registered', 'lname', 'fname', 'mname', 'dob', 
                  'age', 'sex', 'household_no', 'family_no', 'business_owner', 'has_account', 'registered_by']
    
    def get_mname(self, obj):
        return obj.per.per_mname if obj.per.per_mname else ''
    
    def get_household_no(self, obj):
        if hasattr(obj, 'family_compositions') and obj.family_compositions.exists():
            return obj.family_compositions.first().fam.hh.hh_id
        return ""
    
    def get_family_no(self, obj):
        if hasattr(obj, 'family_compositions') and obj.family_compositions.exists():
            return obj.family_compositions.first().fam.fam_id
        return ""
    
    def get_business_owner(self, obj):
        if hasattr(obj, 'owned_business') and obj.owned_business.exists():
            return True
        return False
    
    def get_has_account(self, obj):
        return hasattr(obj, 'account')
    
    def get_registered_by(self, obj):
        if obj.staff:
            staff_type = obj.staff.staff_type
            staff_id = obj.staff.staff_id
            
            # Determine prefix based on staff type
            if staff_type == "Barangay Staff":
                prefix = "B-"
            elif staff_type == "Health Staff":
                prefix = "H-"
            else:
                prefix = ""  # Default for unknown types
                
            return f"{prefix}{staff_id}"
        return "-"
    
    def get_age(self, obj):
        dob = obj.per.per_dob
        today = datetime.today().date()

        age = today.year - dob.year - (
            (today.month, today.day) < (dob.month, dob.day)
        )
        return age


class ResidentPersonalCreateSerializer(serializers.ModelSerializer):
    per = PersonalBaseSerializer()
    per_id = serializers.IntegerField(write_only=True, allow_null=True, required=False)
    staff = serializers.CharField(allow_null=True, required=False) 

    class Meta:
        model = ResidentProfile
        fields = ['per', 'per_id', 'staff', 'rp_id']
        read_only_fields = ['rp_id']
        extra_kwargs = {
            'staff': {'required': False}
        }

    @transaction.atomic
    def create(self, validated_data):   
        # Extract personal data
        personal_data = validated_data.pop('per')
        per = validated_data.pop('per_id', None)
        if per:
            personal = Personal.objects.get(per_id=per)
        else:
            # Create Personal record
            personal_serializer = PersonalBaseSerializer(data=personal_data)
            personal_serializer.is_valid(raise_exception=True)
            personal = personal_serializer.save()

        # Create ResidentProfile record
        resident_profile = ResidentProfile.objects.create(
            rp_id = self.generate_resident_no(),
            per = personal,
            staff_id = validated_data.get('staff', None)
        )
        
        return resident_profile

    def generate_resident_no(self):
        next_val = ResidentProfile.objects.count() + 1
        date = datetime.now()
        year = str(date.year - 2000)
        month = str(date.month).zfill(2)
        day = str(date.day).zfill(2)

        formatted = f"{next_val:05d}"
        resident_id = f"{formatted}{year}{month}{day}"
        
        return resident_id

class ResidentPersonalInfoSerializer(serializers.ModelSerializer):
    per_id = serializers.IntegerField(source='per.per_id')
    per_lname = serializers.CharField(source='per.per_lname')
    per_fname = serializers.CharField(source='per.per_fname')
    per_mname = serializers.CharField(source='per.per_mname')
    per_suffix = serializers.CharField(source='per.per_suffix')
    per_sex = serializers.CharField(source="per.per_sex")
    per_dob = serializers.DateField(source="per.per_dob")
    per_status = serializers.CharField(source="per.per_status")
    per_edAttainment = serializers.CharField(source="per.per_edAttainment")
    per_religion = serializers.CharField(source="per.per_religion")
    per_contact = serializers.CharField(source="per.per_contact")
    per_addresses = serializers.SerializerMethodField()
    per_age = serializers.SerializerMethodField()

    class Meta:
        model = ResidentProfile
        fields = ['per_id', 'per_lname', 'per_fname', 'per_mname', 'per_suffix', 'per_sex', 'per_dob', 
                  'per_status', 'per_edAttainment', 'per_religion', 'per_contact', 'per_addresses', 
                  'per_age']
        read_only_fields = fields

    def get_per_age(self, obj):
        dob = obj.per.per_dob
        today = datetime.today().date()

        age = today.year - dob.year - (
            (today.month, today.day) < (dob.month, dob.day)
        )
        return age
    
    def get_per_addresses(self, obj):
        per_addresses = PersonalAddress.objects.filter(per=obj.per)
        addresses = [pa.add for pa in per_addresses.select_related('add')]
        return AddressBaseSerializer(addresses, many=True).data

class ResidentProfileListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    personal_info = ResidentPersonalInfoSerializer(source='*')

    class Meta:
        model = ResidentProfile
        fields = ['rp_id', 'name', 'personal_info']

    def get_name(self, obj):
        info = obj.per
        return f"{info.per_lname}, {info.per_fname}" + \
            (f" {info.per_mname[0]}." if info.per_mname else "")
    
class ResidentProfileFullSerializer(serializers.ModelSerializer):
    per = PersonalBaseSerializer(read_only=True)
    per_id = serializers.PrimaryKeyRelatedField(
        queryset=Personal.objects.all(), 
        write_only=True, 
        source='per'
    )
    is_staff = serializers.SerializerMethodField()
    account = UserAccountSerializer(read_only=True)
    staff = serializers.SerializerMethodField()
    staff_id = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), write_only=True, source="staff", allow_null=True)

    class Meta:
        model = ResidentProfile
        fields = '__all__'
    
    def get_staff(self, obj):
        from apps.administration.serializers.staff_serializers import StaffFullSerializer
        return StaffFullSerializer(obj.staff).data

    def get_is_staff(self, obj):
        return hasattr(obj, 'staff_assignments') and bool(obj.staff_assignments.all())    