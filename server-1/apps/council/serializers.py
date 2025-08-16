# council/serializers.py
from rest_framework import serializers
from .models import *
from django.apps import apps
from apps.treasurer.models import Purpose_And_Rates
from apps.file.serializers.base import FileSerializer
from apps.administration.serializers.staff_serializers import StaffMinimalSerializer

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
    file_url = serializers.SerializerMethodField()
    file_id = serializers.SerializerMethodField()
    areas_of_focus = serializers.SerializerMethodField()
    supporting_docs = MOMSuppDocSerializer(source='momsuppdoc_set', many=True, read_only=True)

    class Meta:
        model = MinutesOfMeeting
        fields = '__all__'
        extra_fields = [
            'file_url',
            'file_id',
            'areas_of_focus',
            'supporting_docs'
        ]

    def get_file_url(self, obj):
        file = obj.momfile_set.first()
        return file.momf_url if file else None

    def get_file_id(self, obj):
        file = obj.momfile_set.first()
        return file.momf_id if file else None

    def get_areas_of_focus(self, obj):
        return [
            area.mof_area
            for area in obj.momareaoffocus_set.all()
            if area.mof_area
        ]


class MOMAreaOfFocusSerializer(serializers.ModelSerializer):
    class Meta:
        model = MOMAreaOfFocus
        fields = '__all__'

class MOMFileSerialzer(serializers.ModelSerializer):
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


