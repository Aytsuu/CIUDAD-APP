from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from ..models import *
from ..serializers.personal_serializers import *
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
    mname = serializers.CharField(source='per.per_mname')
    suffix = serializers.CharField(source='per.per_suffix')
    household_no = serializers.SerializerMethodField()
    sitio_name = serializers.SerializerMethodField()
    family_no = serializers.SerializerMethodField()
    registered_by = serializers.SerializerMethodField()
    has_account = serializers.SerializerMethodField()
    
    class Meta:
        model = ResidentProfile
        fields = [ 'rp_id', 'rp_date_registered', 'lname', 'fname', 'mname', 
                  'suffix', 'household_no', 'sitio_name', 'family_no', 'registered_by', 'has_account']
    
    def get_household_no(self, obj):
        if hasattr(obj, 'family_compositions') and obj.family_compositions.exists():
            return obj.family_compositions.first().fam.hh.hh_id
        return ""
    
    def get_sitio_name(self, obj):
        if hasattr(obj, 'family_compositions') and obj.family_compositions.exists():
            return obj.family_compositions.first().fam.hh.sitio.sitio_name
        return ""
    
    def get_family_no(self, obj):
        if hasattr(obj, 'family_compositions') and obj.family_compositions.exists():
            return obj.family_compositions.first().fam.fam_id
        return ""
    
    def get_registered_by(self, obj):
        if obj.staff and hasattr(obj.staff, 'rp'):
            staff = obj.staff.rp.per
            return f"{staff.per_lname}, {staff.per_fname}" + \
                   (f" {staff.per_mname[0]}." if staff.per_mname else "")
        return '-'
    
    def get_has_account(self, obj):
        return hasattr(obj, 'account')


class ResidentPersonalCreateSerializer(serializers.ModelSerializer):
    per = PersonalBaseSerializer()
    staff = serializers.CharField() 

    class Meta:
        model = ResidentProfile
        fields = ['per', 'staff', 'rp_id', 'rp_date_registered']
        read_only_fields = ['rp_id', 'rp_date_registered']

    @transaction.atomic
    def create(self, validated_data):
        # Extract personal data
        personal_data = validated_data.pop('per')
        
        # Create Personal record
        personal_serializer = PersonalBaseSerializer(data=personal_data)
        personal_serializer.is_valid(raise_exception=True)
        personal = personal_serializer.save()

        # Create ResidentProfile record
        resident_profile = ResidentProfile.objects.create(
            rp_id = self.generate_resident_no(),
            rp_date_registered = timezone.now().date(),
            per = personal,
            staff_id = validated_data['staff']
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
    per_address = serializers.CharField(source="per.per_address")
    per_edAttainment = serializers.CharField(source="per.per_edAttainment")
    per_religion = serializers.CharField(source="per.per_religion")
    per_contact = serializers.CharField(source="per.per_contact")

    class Meta:
        model = ResidentProfile
        fields = ['per_id', 'per_lname', 'per_fname', 'per_mname', 'per_suffix', 'per_sex', 'per_dob', 
                  'per_status', 'per_address', 'per_edAttainment', 'per_religion', 'per_contact']
        read_only_fields = fields

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