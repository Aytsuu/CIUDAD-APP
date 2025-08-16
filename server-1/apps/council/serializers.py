# council/serializers.py
from rest_framework import serializers
from .models import *
from django.apps import apps
from apps.treasurer.models import Purpose_And_Rates
from utils.supabase_client import upload_to_storage
from apps.treasurer.serializers import FileInputSerializer
from django.db import transaction


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
    
    def _upload_files(self, files, res_num=None):

        if not res_num:
            return
        
        try:
            tracking_instance = Resolution.objects.get(pk=res_num)
        except Resolution.DoesNotExist:
            
            raise ValueError(f"Resolution with id {res_num} does not exist")       
        
        rf_files = []
        for file_data in files:
            rf_file = ResolutionFile(
                rf_name=file_data['name'],
                rf_type=file_data['type'],
                rf_path=f"documents/{file_data['name']}",
                res_num=tracking_instance  # THIS SETS THE FOREIGN KEY
            )

            url = upload_to_storage(file_data, 'council-res-bucket', 'documents')
            rf_file.rf_url = url
            rf_files.append(rf_file)

        if rf_files:
            ResolutionFile.objects.bulk_create(rf_files)    

class ResolutionSupDocsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResolutionSupDocs
        fields = '__all__'
    
    def _upload_files(self, files, res_num=None):

        if not res_num:
            return
        
        try:
            tracking_instance = Resolution.objects.get(pk=res_num)
        except Resolution.DoesNotExist:
            
            raise ValueError(f"Resolution with id {res_num} does not exist")       
        
        rsd_files = []
        for file_data in files:
            rsd_file = ResolutionSupDocs(
                rsd_name=file_data['name'],
                rsd_type=file_data['type'],
                rsd_path=f"images/{file_data['name']}",
                res_num=tracking_instance  # THIS SETS THE FOREIGN KEY
            )

            url = upload_to_storage(file_data, 'council-res-bucket', 'images')
            rsd_file.rsd_url = url
            rsd_files.append(rsd_file)

        if rsd_files:
            ResolutionSupDocs.objects.bulk_create(rsd_files)       

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

class MOMFileCreateSerializer(serializers.ModelSerializer):
    files = serializers.ListField( child=serializers.DictField(), write_only=True, required=False)

    class Meta:
        model = MOMFile
        fields = ['mom_id', 'files']  

    @transaction.atomic
    def create(self, validated_data):
        files = validated_data.pop('files', [])
        mom_instance = validated_data.get('mom_id')
        
        # Create initial instance (if needed)
        mom_file_instance = super().create(validated_data)
        
        if files and mom_instance:
            self._upload_files(mom_instance, files)

        return mom_file_instance

    def _upload_files(self, mom_instance, files):
        mom_files = []
        for file_data in files:
            url = upload_to_storage(file_data, 'council-mom-bucket', 'documents')
            
            mom_files.append(MOMFile(
                mom_id=mom_instance,
                momf_name=file_data['name'],
                momf_type=file_data['type'],
                momf_path=f"documents/{file_data['name']}",
                momf_url=url
            ))

        if mom_files:
            MOMFile.objects.bulk_create(mom_files)



class MOMFileViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = MOMFile
        fields = '__all__'