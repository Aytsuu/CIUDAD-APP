# council/serializers.py
from rest_framework import serializers
from .models import *
from django.apps import apps
from apps.treasurer.models import Purpose_And_Rates
from apps.gad.models import ProjectProposal
from utils.supabase_client import upload_to_storage
from apps.treasurer.serializers import FileInputSerializer
from django.db import transaction
from datetime import datetime, timedelta
from apps.announcement.models import Announcement, AnnouncementRecipient
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

class CouncilSchedulingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouncilScheduling
        fields = '__all__'
    
    @transaction.atomic
    def create(self, validated_data):
        # Extract staff_id if it exists
        staff_id = self.initial_data.get('staff_id')
        
        # Create the council event
        council_event = CouncilScheduling.objects.create(**validated_data)
        
        # Always create announcement on creation
        self._create_staff_announcement(council_event, staff_id)
        
        return council_event

    @transaction.atomic
    def update(self, instance, validated_data):
        staff_id = self.initial_data.get('staff_id')
        
        # Fields that should trigger announcement creation
        announcement_trigger_fields = ['ce_title', 'ce_date', 'ce_time', 'ce_place', 'ce_description']
        
        # Check if any announcement-relevant fields were changed
        should_create_announcement = False
        for field in announcement_trigger_fields:
            if field in validated_data:
                old_value = getattr(instance, field)
                new_value = validated_data[field]
                if old_value != new_value:
                    should_create_announcement = True
                    break
        
        # Update the council event
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Only create announcement if relevant fields changed
        if should_create_announcement:
            try:
                self._create_staff_announcement(instance, staff_id, is_update=True)
            except Exception as e:
                logger.error(f"Failed to create update announcement: {str(e)}")
                # Event is still updated successfully even if announcement fails
        
        return instance
    
    def _create_staff_announcement(self, council_event, staff_id=None, is_update=False):
        staff = None
        
        # Try to get staff from staff_id parameter
        if staff_id:
            try:
                Staff = apps.get_model('administration', 'Staff')
                staff = Staff.objects.get(staff_id=staff_id)
            except Staff.DoesNotExist:
                logger.error(f"Staff with id {staff_id} does not exist")
            except Exception as e:
                logger.error(f"Error getting staff: {str(e)}")
        
        # Try to get from council_event if it has staff_id field
        if not staff and hasattr(council_event, 'staff_id') and council_event.staff_id:
            staff = council_event.staff_id
        
        # Try to get from request context
        if not staff and self.context.get('request'):
            request = self.context.get('request')
            if hasattr(request.user, 'staff'):
                staff = request.user.staff
        
        # If still no staff, raise error since it's required
        if not staff:
            error_msg = f"staff_id is required to create an announcement. Provided staff_id: {staff_id}"
            logger.error(error_msg)
            raise serializers.ValidationError(error_msg)
        
        # Create the announcement title based on whether it's an update
        announcement_title = f"Council {'Meeting (Update)' if is_update else 'Meeting'}: {council_event.ce_title}"
        
        # Combine event date and time, make it timezone-aware
        naive_event_datetime = datetime.combine(council_event.ce_date, council_event.ce_time)
        event_datetime = timezone.make_aware(naive_event_datetime, timezone.get_current_timezone())
        
        # Set announcement to start now and end 24 hours after the event time
        now = timezone.now()
        end_time = event_datetime + timedelta(hours=24)
        
        # Format the announcement details with event information
        announcement_details = (
            f"{council_event.ce_description}\n\n"
            f"Location: {council_event.ce_place}\n"
            f"Date: {council_event.ce_date.strftime('%B %d, %Y')}\n"
            f"Time: {council_event.ce_time.strftime('%I:%M %p')}"
        )
        
        if is_update:
            announcement_details += "This event has been updated. Please take note of the changes."
        
        # Create the announcement
        announcement = Announcement.objects.create(
            ann_title=announcement_title,
            ann_details=announcement_details,
            ann_type="GENERAL",
            ann_event_start=None, 
            ann_event_end=None,
            ann_start_at=now, 
            ann_end_at=end_time, 
            ann_to_sms=True,
            ann_to_email=True,
            ann_status="ACTIVE",
            staff=staff,
        )
        
        # Create recipient record for all staff
        AnnouncementRecipient.objects.create(
            ann=announcement,
            ar_category="staff",
            ar_type=None  # None means all staff positions
        )
        
        return announcement

# class CouncilAttendeesSerializer(serializers.ModelSerializer):
#     atn_present_or_absent = serializers.ChoiceField(choices=['Present', 'Absent'])

#     class Meta:
#         model = CouncilAttendees
#         fields = ['atn_id', 'atn_name','atn_designation', 'atn_present_or_absent', 'ce_id', 'staff_id']

class CouncilAttendanceSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, allow_null=True)
    ce_id = serializers.IntegerField(source='ce.ce_id', read_only=True)
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
                    ce=event
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
    dev_project = serializers.CharField(source='dev.dev_project', read_only=True)
    
    class Meta:
        model = ProjectProposal
        fields = ['gpr_id', 'dev_project']


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
                  'ord_details', 'ord_year', 'ord_is_archive', 'ord_repealed', 'staff', 'of_id', 'file',
                  'ord_parent', 'ord_is_ammend', 'ord_ammend_ver']
        extra_kwargs = {
            'ord_num': {'required': False, 'allow_blank': True},
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
        if value and value.strip() and Ordinance.objects.filter(ord_num=value).exists():
            raise serializers.ValidationError("An ordinance with this number already exists.")
        return value
        
   

