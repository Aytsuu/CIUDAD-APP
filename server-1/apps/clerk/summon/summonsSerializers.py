from rest_framework import serializers
from apps.clerk.models import *
from apps.complaint.models import *
from utils.supabase_client import upload_to_storage
from django.utils import timezone
from django.db import transaction
from apps.profiling.serializers.business_serializers import FileInputSerializer

# ======================== SUMMON DATE AND TIME ========================
class SummonDateAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SummonDateAvailability
        fields = '__all__'

class SummonTimeAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SummonTimeAvailability
        fields = '__all__'


# ======================== COMPLAINT RELATED SERIALIZERS  ========================
class AccusedDetailsSerializer(serializers.ModelSerializer):
    # address = AddressDetailsSerializer(source='add')
    
    class Meta:
        model = Accused
        fields = [
            'acsd_id', 
            'acsd_name',
            'acsd_age',
            'acsd_gender',
            'acsd_description',
            # 'address'
        ]

# ======================== COUNCIL MEDIATION / CONCILIATION PROCEEDINGS ========================
class HearingScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = HearingSchedule
        fields = '__all__'


class HearingMinutesSerializer(serializers.ModelSerializer):
    class Meta:
        model = HearingMinutes
        fields = '__all__'

class RemarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Remark
        fields = '__all__'

class RemarkSuppDocSerializer(serializers.ModelSerializer):
    class Meta:
        model = RemarkSuppDocs
        fields = '__all__'

class SummonCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SummonCase
        fields = '__all__'  

class ServiceChargePaymentReqSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceChargePaymentRequest
        fields = '__all__'  

class SummonCasesSerializer(serializers.ModelSerializer):
    complainant_names = serializers.SerializerMethodField()
    complainant_addresses = serializers.SerializerMethodField()
    complainant_rp_ids = serializers.SerializerMethodField()  
    incident_type = serializers.SerializerMethodField()
    accused_names = serializers.SerializerMethodField()
    accused_addresses = serializers.SerializerMethodField()
    
    class Meta:
        model = SummonCase
        fields = [
            'sc_id', 
            'sc_code',
            'sc_mediation_status', 
            'sc_conciliation_status',
            'sc_date_marked', 
            'sc_reason', 
            'comp_id', 
            'complainant_names', 
            'complainant_addresses',
            'complainant_rp_ids',  
            'incident_type', 
            'accused_names',
            'accused_addresses'
        ]
    
    def get_complainant_names(self, obj):
        if obj.comp_id:
            try:
                complainants = obj.comp_id.complaintcomplainant_set.all()
                return [cc.cpnt.cpnt_name for cc in complainants]
            except Exception as e:
                print(f"Error getting complainants: {e}")
                return []
        return []
    
    def get_complainant_addresses(self, obj):
        if obj.comp_id:
            try:
                complainants = obj.comp_id.complaintcomplainant_set.all()
                return [cc.cpnt.cpnt_address or "N/A" for cc in complainants]
            except Exception as e:
                print(f"Error getting complainant addresses: {e}")
                return []
        return []
    
    def get_complainant_rp_ids(self, obj):
        if obj.comp_id:
            try:
                complainants = obj.comp_id.complaintcomplainant_set.all()
                # Get rp_id for each complainant
                return [cc.cpnt.rp_id_id for cc in complainants]
            except Exception as e:
                print(f"Error getting complainant rp_ids: {e}")
                return []
        return []
    
    def get_incident_type(self, obj):
        if obj.comp_id:
            return getattr(obj.comp_id, 'comp_incident_type', None)
        return None
    
    def get_accused_names(self, obj):
        if obj.comp_id:
            try:
                accused_list = obj.comp_id.complaintaccused_set.all()
                return [ca.acsd.acsd_name for ca in accused_list]
            except Exception as e:
                print(f"Error getting accused: {e}")
                return []
        return []
    
    def get_accused_addresses(self, obj):
        if obj.comp_id:
            try:
                accused_list = obj.comp_id.complaintaccused_set.all()
                return [ca.acsd.acsd_address or "N/A" for ca in accused_list]
            except Exception as e:
                print(f"Error getting accused addresses: {e}")
                return []
        return []
    
class RemarkDetailSerializer(serializers.ModelSerializer):
    supp_docs = serializers.SerializerMethodField()
    
    class Meta:
        model = Remark
        fields = [
            'rem_id',
            'rem_remarks',
            'rem_date',
            'supp_docs'
        ]
    
    def get_supp_docs(self, obj):
        try:
            supp_docs = RemarkSuppDocs.objects.filter(rem_id=obj.rem_id)
            return RemarkSuppDocSerializer(supp_docs, many=True).data
        except Exception as e:
            print(f"Error getting remark supp docs: {e}")
            return []

class HearingScheduleDetailSerializer(serializers.ModelSerializer):
    remark = RemarkDetailSerializer(read_only=True)
    hearing_minutes = serializers.SerializerMethodField()
    summon_date = SummonDateAvailabilitySerializer(source='sd_id', read_only=True)
    summon_time = SummonTimeAvailabilitySerializer(source='st_id', read_only=True)
    
    class Meta:
        model = HearingSchedule
        fields = [
            'hs_id',
            'hs_level',
            'hs_is_closed',
            'summon_date',
            'summon_time',
            'remark',
            'hearing_minutes'
        ]
    
    def get_remark(self, obj):
        try:
            remark = obj.remark  
            if remark:
                return RemarkDetailSerializer(remark).data
            return None
        except Exception as e:
            print(f"Error getting : {e}")
            return None
    
    def get_hearing_minutes(self, obj):
        try:
            # Now uses the related_name
            hearing_minutes = obj.hearing_minutes.all()
            return HearingMinutesSerializer(hearing_minutes, many=True).data
        except Exception as e:
            print(f"Error getting hearing minutes: {e}")
            return []

class SummonCaseDetailSerializer(serializers.ModelSerializer):
    hearing_schedules = serializers.SerializerMethodField()
    
    class Meta:
        model = SummonCase
        fields = [
            'sc_id', 
            'sc_code',
            'sc_mediation_status',
            'sc_conciliation_status',
            'sc_date_marked', 
            'sc_reason', 
            'comp_id',
            'hearing_schedules'
        ]
    
    def get_hearing_schedules(self, obj):
        try:
            # Now uses the related_name
            hearing_schedules = obj.hearing_schedules.all()
            return HearingScheduleDetailSerializer(hearing_schedules, many=True).data
        except Exception as e:
            print(f"Error getting hearing schedules: {e}")
            return []
        

class HearingMinutesCreateSerializer(serializers.ModelSerializer):
    files = FileInputSerializer(write_only=True, required=False, many=True)

    class Meta:
        model = HearingMinutes
        fields = '__all__'
        extra_kwargs={
            'hm_name': {'required': False},
            'hm_path': {'required': False},
            'hm_type': {'required': False},
            'hm_url': {'read_only': True}
        }

    @transaction.atomic
    def create(self, validated_data):   
        files_data = validated_data.pop('files', [])
        if not files_data:
            raise serializers.ValidationError({"files": "At least one file must be provided"})
            
        hs_id = validated_data.pop('hs_id')
        created_files = self._upload_files(files_data, hs_id)

        if not created_files:
            raise serializers.ValidationError("Failed to upload files")

        return created_files[0]

    def _upload_files(self, files_data, hs_id):
        hm_files = []
        for file_data in files_data:
            hm_file = HearingMinutes(
                hm_name=file_data['name'],
                hm_type=file_data['type'],
                hm_path=file_data['name'],
                hs_id=hs_id
            )

            url = upload_to_storage(file_data, 'summon-bucket', '')
            hm_file.hm_url = url
            hm_files.append(hm_file)

        if hm_files:
            return HearingMinutes.objects.bulk_create(hm_files)
        return []
    

class RemarkSuppDocCreateSerializer(serializers.ModelSerializer):
    files = FileInputSerializer(write_only=True, required=False, many=True)

    class Meta:
        model = RemarkSuppDocs
        fields = '__all__'
        extra_kwargs={
            'rsd_name': {'required': False},
            'rsd_path': {'required': False},
            'rsd_type': {'required': False},
            'rsd_url': {'read_only': True}
        }

    @transaction.atomic
    def create(self, validated_data):   
        files_data = validated_data.pop('files', [])
        if not files_data:
            raise serializers.ValidationError({"files": "At least one file must be provided"})
            
        rem_id = validated_data.pop('rem_id')
        created_files = self._upload_files(files_data, rem_id)

        if not created_files:
            raise serializers.ValidationError("Failed to upload files")
        
        return created_files[0]

    def _upload_files(self, files_data, rem_id):
        rsd_files = []
        for file_data in files_data:
            rsd_file = RemarkSuppDocs(
                rsd_name=file_data['name'],
                rsd_type=file_data['type'],
                rsd_path=file_data['name'],
                rem_id=rem_id
            )

            url = upload_to_storage(file_data, 'summon-bucket', '')
            rsd_file.rsd_url = url
            rsd_files.append(rsd_file)

        if rsd_files:
            return RemarkSuppDocs.objects.bulk_create(rsd_files)
        return []
    


