# council/serializers.py
from rest_framework import serializers
from .models import *
from django.apps import apps
from apps.treasurer.models import Purpose_And_Rates
from apps.gad.models import ProjectProposal
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
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = CouncilAttendance
        fields = '__all__'
        extra_kwargs = {
            'att_file_url': {'read_only': True},
            'att_file_path': {'read_only': True},
        }
    
    def _upload_file(self, files, ce_id=None):
        """Upload multiple attendance sheet files"""
        if not ce_id:
            raise serializers.ValidationError({"error": "ce_id is required"})

        try:
            event = CouncilScheduling.objects.get(pk=ce_id)
        except CouncilScheduling.DoesNotExist:
            raise serializers.ValidationError(f"Event with id {ce_id} does not exist")

        attendance_sheets = []
        for file_data in files:
            try:
                # Ensure required fields exist
                if not all(key in file_data for key in ['name', 'type', 'file']):
                    raise ValueError("Missing required file fields")
                
                # Upload file and get URL
                file_url = upload_to_storage(
                    file_data,
                    'meeting-attendance-bucket',
                    'images'
                )
                
                if not file_url:
                    raise ValueError("File upload failed (no URL returned)")

                # Create attendance sheet record
                attendance_sheet = CouncilAttendance(
                    att_file_name=file_data['name'],
                    att_file_type=file_data['type'],
                    att_file_path=f"attendance/{file_data['name']}",
                    att_file_url=file_url,
                    ce_id=event
                )
                attendance_sheets.append(attendance_sheet)
                
            except Exception as e:
                print(f"Failed to process file {file_data.get('name')}: {str(e)}")
                continue

        if attendance_sheets:
            CouncilAttendance.objects.bulk_create(attendance_sheets)
        return attendance_sheets


class TemplateFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateFile
        fields = '__all__'

    def _upload_files(self, files, temp_id=None):

        if not temp_id:
            return
        
        try:
            tracking_instance = Template.objects.get(pk=temp_id)
        except Template.DoesNotExist:
            
            raise ValueError(f"Income_Expense_Tracking with id {temp_id} does not exist")       
        
        tf_files = []
        for file_data in files:
            tf_file = TemplateFile(
                tf_name=file_data['name'],
                tf_type=file_data['type'],
                tf_path=file_data['name'],
                tf_logoType=file_data['logoType'],
                temp_id=tracking_instance  # THIS SETS THE FOREIGN KEY
            )

            url = upload_to_storage(file_data, 'template-bucket', '')
            tf_file.tf_url = url
            tf_files.append(tf_file)

        if tf_files:
            TemplateFile.objects.bulk_create(tf_files)    


class TemplateSerializer(serializers.ModelSerializer):
    template_files = TemplateFileSerializer(many=True, read_only=True)

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

            url = upload_to_storage(file_data, 'resolution-bucket', 'documents')
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

            url = upload_to_storage(file_data, 'resolution-bucket', 'images')
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

class GADProposalSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(read_only=True)
    gprl_id = serializers.SerializerMethodField()

    class Meta:
        model = ProjectProposal
        fields = ['gpr_id', 'project_title', 'gprl_id']

    def get_gprl_id(self, obj):
        # Get the latest approved log ID for this proposal
        latest_approved_log = obj.logs.filter(gprl_status='Approved').order_by('-gprl_date_approved_rejected').first()
        return latest_approved_log.gprl_id if latest_approved_log else None


class PurposeRatesListViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purpose_And_Rates
        fields = ['pr_id', 'pr_purpose', 'pr_is_archive']


# =================== MINUTES OF MEETING SERIALIZERS ======================

class MOMSuppDocCreateSerializer(serializers.ModelSerializer):
    suppDocs = FileInputSerializer(write_only=True, required=False, many=True)

    class Meta:
        model = MOMSuppDoc
        fields = ['mom_id', 'suppDocs']

    @transaction.atomic
    def create(self, validated_data):   
        files = validated_data.pop('suppDocs', [])
        if not files:
            raise serializers.ValidationError({"files": "At least one file must be provided"})
            
        mom_id = validated_data.pop('mom_id')
        created_files = self._upload_files(files, mom_id)

        if not created_files:
            raise serializers.ValidationError("Failed to upload files")

        return created_files[0]

    def _upload_files(self, files, mom_id):
        momsp_files = []
        for file_data in files:
            momsp_file = MOMSuppDoc(
                momsp_name=file_data['name'],
                momsp_type=file_data['type'],
                momsp_path=f"images/{file_data['name']}",
                mom_id=mom_id
            )

            url = upload_to_storage(file_data, 'mom-bucket', 'images')
            momsp_file.momsp_url = url
            momsp_files.append(momsp_file)

        if momsp_files:
            return MOMSuppDoc.objects.bulk_create(momsp_files)
        return []
    
class MOMSuppDocViewSerializer(serializers.ModelSerializer):
    class Meta: 
        model = MOMSuppDoc
        fields = '__all__'
        
class MinutesOfMeetingSerializer(serializers.ModelSerializer):
    mom_file = serializers.SerializerMethodField(read_only=True)  # Combined field
    supporting_docs = MOMSuppDocViewSerializer(source='momsuppdoc_set', many=True, read_only=True)
    staff_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MinutesOfMeeting
        fields = '__all__'
        extra_fields = [
            'mom_file',  
            'supporting_docs',
            'staff_name'
        ]
        read_only_fields = [
            'mom_file',
            'supporting_docs',
            'staff_name'
        ]

    def get_mom_file(self, obj):
        try:
            mom_file = obj.momfile
            print('MOM File', mom_file)
            return {
                'momf_id': mom_file.momf_id,
                'momf_url': mom_file.momf_url,
                'momf_name': mom_file.momf_name
            }
        except MOMFile.DoesNotExist:
            return None
        
    def get_staff_name(self, obj):
        if obj.staff_id and obj.staff_id.rp and obj.staff_id.rp.per:
            per = obj.staff_id.rp.per

            full_name = f"{per.per_lname}, {per.per_fname}"

            if per.per_mname:
                full_name += f" {per.per_mname}"
            
            if per.per_suffix:
                full_name += f" {per.per_suffix}"
            
            return full_name

    def create(self, validated_data):
        return MinutesOfMeeting.objects.create(**validated_data)


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
                momf_path=f"documents/{file_data['name']}",
                mom_id=mom_id
            )

            url = upload_to_storage(file_data, 'mom-bucket', 'documents')
            mom_file.momf_url = url
            mom_files.append(mom_file)

        if mom_files:
            return MOMFile.objects.bulk_create(mom_files)
        return []


class MOMFileViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = MOMFile
        fields = '__all__'

# ================================== ORDINANCE SERIALIZERS (from secretary) =================================

class OrdinanceFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrdinanceFile
        fields = ['of_id', 'of_name', 'of_type', 'of_path', 'of_url']

class OrdinanceSerializer(serializers.ModelSerializer):
    staff = serializers.PrimaryKeyRelatedField(read_only=True)
    of_id = serializers.PrimaryKeyRelatedField(read_only=True)
    file = serializers.SerializerMethodField()

    class Meta:
        model = Ordinance
        fields = ['ord_num', 'ord_title', 'ord_date_created', 'ord_category',
                  'ord_details', 'ord_year', 'ord_is_archive', 'staff', 'of_id', 'file',
                  'ord_parent', 'ord_is_ammend', 'ord_ammend_ver']
        extra_kwargs = {
            'ord_num': {'required': False},  #
            'ord_title': {'required': True},
            'ord_date_created': {'required': True},
            'ord_category': {'required': True},
            'ord_details': {'required': True},
            'ord_year': {'required': True},
        }
        
    def get_file(self, obj):
        """Return file information if of_id exists"""
        if obj.of_id:
            return {
                'file_id': obj.of_id.of_id,
                'file_name': obj.of_id.of_name,
                'file_type': obj.of_id.of_type,
                'file_url': obj.of_id.of_url,
                'file_path': obj.of_id.of_path
            }
        return None
        
    def validate_ord_num(self, value):
        """
        Check that the ordinance number is unique if provided
        """
        if value and Ordinance.objects.filter(ord_num=value).exists():
            raise serializers.ValidationError("An ordinance with this number already exists.")
        return value
        
   


