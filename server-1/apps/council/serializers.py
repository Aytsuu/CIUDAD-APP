# council/serializers.py
from rest_framework import serializers
from .models import *
from django.apps import apps
from apps.treasurer.models import Purpose_And_Rates
from apps.file.serializers.base import FileSerializer
from apps.administration.serializers.staff_serializers import StaffMinimalSerializer
from django.db import transaction
from utils.supabase_client import upload_to_storage

class CouncilSchedulingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouncilScheduling
        fields = '__all__'

class CouncilAttendeesSerializer(serializers.ModelSerializer):
    atn_present_or_absent = serializers.ChoiceField(choices=['Present', 'Absent'])

    class Meta:
        model = CouncilAttendees
        fields = ['atn_id', 'atn_name','atn_designation', 'atn_present_or_absent', 'ce_id', 'staff_id']

class CouncilAttendanceSerializer(serializers.ModelSerializer):
    # file_url = serializers.CharField(source='file.file_url', read_only=True)
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, allow_null=True)
    class Meta:
        model = CouncilAttendance
        fields = '__all__'

class TemplateSerializer(serializers.ModelSerializer):

    temp_below_headerContent = serializers.CharField(
        required=False,
        allow_blank=True,
        trim_whitespace=False
    )
    
    temp_body = serializers.CharField(trim_whitespace=False)

    class Meta:
        model = Template
        fields = '__all__'

        

Staff = apps.get_model('administration', 'Staff')


class StaffSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    position_title = serializers.CharField(source='pos.pos_title', allow_null=True, default=None)  # Add position title

    class Meta:
        model = Staff
        fields = ['staff_id', 'full_name', 'position_title']

    def get_full_name(self, obj):
        try:
            return f"{obj.rp.per.per_fname} {obj.rp.per.per_lname}"
        except AttributeError:
            return "Unknown"

class StaffAttendanceRankingSerializer(serializers.Serializer):
    atn_name = serializers.CharField()
    atn_designation = serializers.CharField()
    attendance_count = serializers.IntegerField()

    class Meta:
        fields = ['atn_name', 'atn_designation', 'attendance_count']
        
# ==================================  RESOLUTION =================================

class ResolutionFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResolutionFile
        fields = '__all__'

class ResolutionSupDocsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResolutionSupDocs
        fields = '__all__'

class ResolutionSerializer(serializers.ModelSerializer):
    resolution_files = ResolutionFileSerializer(many=True, read_only=True)
    resolution_supp = ResolutionSupDocsSerializer(many=True, read_only=True)

    class Meta:
        model = Resolution
        fields = '__all__'


class PurposeRatesListViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purpose_And_Rates
        fields = ['pr_id', 'pr_purpose', 'pr_is_archive']


class MOMSuppDocSerializer(serializers.ModelSerializer):
    class Meta: 
        model = MOMSuppDoc
        fields = '__all__'
        
class MinutesOfMeetingSerializer(serializers.ModelSerializer):
    momf_url = serializers.SerializerMethodField(read_only=True)  # Read-only
    momf_id = serializers.SerializerMethodField(read_only=True)   # Read-only
    areas_of_focus = serializers.SerializerMethodField(read_only=True)  # Read-only
    supporting_docs = MOMSuppDocSerializer(source='momsuppdoc_set', many=True, read_only=True)  # Read-only

    class Meta:
        model = MinutesOfMeeting
        fields = '__all__'
        extra_fields = [
            'momf_url',
            'momf_id',
            'areas_of_focus',
            'supporting_docs'
        ]
        read_only_fields = [
            'momf_url',
            'momf_id',
            'areas_of_focus',
            'supporting_docs'
        ]

    def get_momf_url(self, obj):
        try:
            return obj.momfile.momf_url 
        except MOMFile.DoesNotExist:
            return None

    def get_momf_id(self, obj):
        try:
            return obj.momfile.momf_id  
        except MOMFile.DoesNotExist:
            return None

    def get_areas_of_focus(self, obj):
        return [
            area.mof_area
            for area in obj.momareaoffocus_set.all()
            if area.mof_area
        ]

    def create(self, validated_data):
        return MinutesOfMeeting.objects.create(**validated_data)

class MOMAreaOfFocusSerializer(serializers.ModelSerializer):
    class Meta:
        model = MOMAreaOfFocus
        fields = '__all__'

class MOMFileCreateSerializer(serializers.ModelSerializer):
    files = serializers.ListField( child=serializers.DictField(), write_only=True, required=False)

    class Meta:
        model = MOMFile
        fields = ['mom_id', 'files']

    @transaction.atomic
    def create(self, validated_data):   
        files = validated_data.pop('files', [])
        if not files:
            raise serializers.ValidationError({"files": "At least one file must be provided"})
            
        mom_id = validated_data.pop('mom_id')
        created_files = self._upload_files(files, mom_id)

        if not created_files:
            raise serializers.ValidationError("Failed to upload files")

        return created_files[0]

    def _upload_files(self, files, mom_id):
        mom_files = []
        for file_data in files:
            mom_file = MOMFile(
                momf_name=file_data['name'],
                momf_type=file_data['type'],
                momf_path=file_data['name'],
                mom_id=mom_id
            )

            url = upload_to_storage(file_data, 'council-mom-bucket', 'documents')
            mom_file.momf_url = url
            mom_files.append(mom_file)

        if mom_files:
            return MOMFile.objects.bulk_create(mom_files)
        return []



class MOMFileViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = MOMFile
        fields = '__all__'

# ==================================  ORDINANCE =================================
# Ordinance Serializers (moved from secretary app)

class OrdinanceSupplementaryDocSerializer(serializers.ModelSerializer):
    file = FileSerializer(read_only=True)
    
    class Meta:
        model = OrdinanceSupplementaryDoc
        fields = ['osd_id', 'osd_title', 'osd_is_archive', 'ordinance', 'file']

class OrdinanceTemplateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = OrdinanceTemplate
        fields = ['template_id', 'title', 'template_body', 'with_seal', 'with_signature', 
                 'pdf_url', 'created_at', 'updated_at', 'is_active']
        extra_kwargs = {
            'template_id': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }

class OrdinanceSerializer(serializers.ModelSerializer):
    file = FileSerializer(read_only=True)
    staff = StaffMinimalSerializer(read_only=True)
    supplementary_docs = OrdinanceSupplementaryDocSerializer(many=True, read_only=True)
    
    class Meta:
        model = Ordinance
        fields = ['ord_num', 'ord_title', 'ord_date_created', 'ord_category', 
                 'ord_details', 'ord_year', 'ord_is_archive', 'file', 'staff', 
                 'supplementary_docs']
        extra_kwargs = {
            'ord_num': {'required': False}  # Make it optional for creation
        }
        
    def validate_ord_num(self, value):
        """
        Check that the ordinance number is unique
        """
        if value and Ordinance.objects.filter(ord_num=value).exists():
            raise serializers.ValidationError("An ordinance with this number already exists.")
        return value
        
    def create(self, validated_data):
        """
        Auto-generate ord_num if not provided
        """
        if 'ord_num' not in validated_data or not validated_data['ord_num']:
            # Generate ordinance number: ORD-YYYY-XXXX
            year = validated_data.get('ord_year', 2024)
            import random
            import string
            
            # Generate a unique number
            while True:
                # Generate 4 random digits
                random_digits = ''.join(random.choices(string.digits, k=4))
                ord_num = f"ORD-{year}-{random_digits}"
                
                # Check if it's unique
                if not Ordinance.objects.filter(ord_num=ord_num).exists():
                    validated_data['ord_num'] = ord_num
                    break
        
        return super().create(validated_data)


