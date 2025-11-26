from .models import *
from rest_framework import serializers
from apps.administration.serializers.staff_serializers import *
from apps.patientrecords.models import BodyMeasurement, Illness, Patient
from utils.supabase_client import upload_to_storage

from rest_framework import serializers
from .models import *
from supabase import create_client, Client
from django.conf import settings
import base64
import logging

logger = logging.getLogger(__name__)

supabase: Client = create_client(
    settings.SUPABASE_URL, 
    settings.SUPABASE_ANON_KEY,
)



class MonthlyRCPReportSerializer(serializers.ModelSerializer):
    staff_details = StaffFullSerializer(source='staff', read_only=True)
    class Meta:
        model = MonthlyRecipientListReport
        fields = '__all__'

class HeaderRecipientListReportTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeaderRecipientListReporTemplate
        fields = '__all__'
    
class FileInputSerializer(serializers.Serializer):
    file = serializers.CharField()
    name = serializers.CharField()
    type = serializers.CharField()

class UpdateMonthlyRecipientListReportSerializer(serializers.ModelSerializer):
    logo = FileInputSerializer(write_only=True, required=False)
    signature = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = MonthlyRecipientListReport
        fields = "__all__"

    def update(self, instance, validated_data):
        logo_data = validated_data.pop('logo', None)
        
        # Handle logo upload
        if logo_data:
            url = upload_to_storage(logo_data, 'manage-images', 'reports')
            if url:
                instance.logo = url
            else:
                logger.error("Failed to upload logo to storage")
        
        # Handle logo clearing if empty value is sent
        # elif 'logo' in self.initial_data and self.initial_data['logo'] in ['', None]:
        #     instance.logo = None
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['logo'] = instance.logo
        return representation


class UpdateHeaderReportTemplateSerializer(serializers.ModelSerializer):
    doh_logo = FileInputSerializer(write_only=True, required=False)
    
    class Meta:
        model = HeaderRecipientListReporTemplate
        fields = "__all__"
     

    def update(self, instance, validated_data):
        doh_logo_data = validated_data.pop('doh_logo', None)
        
        # Handle doh_logo upload
        if doh_logo_data:
            url = upload_to_storage(doh_logo_data, 'manage-images', 'reports')
            if url:
                instance.doh_logo = url
            else:
                logger.error("Failed to upload DOH logo to storage")
        
        # # Handle doh_logo clearing if empty value is sent
        # elif 'doh_logo' in self.initial_data and self.initial_data['doh_logo'] in ['', None]:
        #     instance.doh_logo = None
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['doh_logo'] = instance.doh_logo
        return representation


# BHW Daily Notes Serializers
class BHWReferOrFollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = BHWReferOrFollowUp
        fields = ['bhwrof_id', 'referred_follow_up_count', 'ill_id']


class BHWAttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BHWAttendanceRecord
        fields = ['bhwa_id', 'num_working_days', 'days_present', 'days_absent', 'noted_by', 'approved_by']


class BHWDailyNotesSerializer(serializers.ModelSerializer):
    illnesses = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    attendance = serializers.DictField(write_only=True, required=False)
    body_measurement = serializers.DictField(write_only=True, required=True)
    
    class Meta:
        model = BHWDailyNotes
        fields = ['bhwdn_id', 'staff', 'description', 'disease_surv_count', 'illnesses', 'attendance', 'body_measurement', 'created_at', 'updated_at']
        read_only_fields = ['bhwdn_id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        illnesses_data = validated_data.pop('illnesses', [])
        attendance_data = validated_data.pop('attendance', None)
        bm_data = validated_data.pop('body_measurement')
        # Resolve Staff FK: DRF will already convert primary key to instance; support both string pk and instance
        staff_value = validated_data.pop('staff', None)
        if isinstance(staff_value, Staff):
            staff_instance = staff_value
        else:
            staff_instance = Staff.objects.filter(pk=staff_value).first()
        if not staff_instance:
            raise serializers.ValidationError({'staff': 'Invalid staff ID provided.'})

        # Resolve Patient FK if provided
        pat_pk = bm_data.get('pat_id')
        patient_instance = None
        if pat_pk:
            patient_instance = Patient.objects.filter(pk=pat_pk).first()
            if not patient_instance:
                raise serializers.ValidationError({'pat_id': 'Invalid patient ID provided.'})

        nutri = bm_data.get('nutritionalStatus', {}) or {}

        # Create BodyMeasurement (map wfh -> wfl)
        body_measurement = BodyMeasurement.objects.create(
            height=bm_data.get('height') or 0,
            weight=bm_data.get('weight') or 0,
            wfa=nutri.get('wfa'),
            lhfa=nutri.get('lhfa'),
            wfl=nutri.get('wfh'),
            muac=str(nutri.get('muac') or ''),
            muac_status=nutri.get('muac_status'),
            staff=staff_instance,
            pat=patient_instance
        )
        
        # Create BHWDailyNotes
        daily_note = BHWDailyNotes.objects.create(
            bm=body_measurement,
            disease_surv_count=len(illnesses_data),
            staff=staff_instance,
            **validated_data
        )
        
        # Create BHWReferOrFollowUp records
        for illness_item in illnesses_data:
            illness_name = illness_item.get('illnessName')
            count = illness_item.get('count', 0)
            
            if illness_name:
                # Get or create illness by name (case-insensitive)
                illness, _ = Illness.objects.get_or_create(
                    illname__iexact=illness_name,
                    defaults={'illname': illness_name}
                )
                
                BHWReferOrFollowUp.objects.create(
                    bhwdn=daily_note,
                    ill=illness,
                    referred_follow_up_count=count
                )
        
        # Create BHWAttendanceRecord if attendance data provided
        if attendance_data:
            BHWAttendanceRecord.objects.create(
                bhwdn=daily_note,
                num_working_days=attendance_data.get('numOfWorkingDays', 0),
                days_present=attendance_data.get('daysPresent', 0),
                days_absent=attendance_data.get('daysAbsent', 0),
                noted_by_id=attendance_data.get('notedBy'),
                approved_by_id=attendance_data.get('approvedBy')
            )
        
        return daily_note

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['bm'] = {
            'bm_id': instance.bm.bm_id,
            'height': str(instance.bm.height),
            'weight': str(instance.bm.weight),
            'wfa': instance.bm.wfa,
            'lhfa': instance.bm.lhfa,
            'wfl': instance.bm.wfl,
            'muac': instance.bm.muac,
            'muac_status': instance.bm.muac_status,
            'pat_id': instance.bm.pat.pat_id if instance.bm.pat else None
        }
        # Build illnesses list with select_related to ensure Illness instance is fetched
        illnesses_list = []
        for r in instance.bhwreferorfollowup_set.select_related('ill').all():
            illness_obj = getattr(r, 'ill_id', None)
            illnesses_list.append({
                'illnessName': getattr(illness_obj, 'illname', None),
                'count': r.referred_follow_up_count
            })
        rep['illnesses'] = illnesses_list
        return rep

