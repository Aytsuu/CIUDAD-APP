from rest_framework import serializers
from django.db import transaction 
from datetime import date
from django.utils import timezone
from django.db.models import Max

from apps.patientrecords.models import *
from apps.maternal.models import *
from apps.maternal.serializers.postpartum_serializer import *
from apps.patientrecords.serializers.patients_serializers import *
from apps.administration.models import Staff 

from utils.supabase_client import upload_to_storage


# serializer for models not in maternal
class MedicalHistorySerializer(serializers.ModelSerializer):
    illness_name = serializers.CharField(source='ill.illname', read_only=True)
    patrec_type = serializers.CharField(source='patrec.patrec_type', read_only=True)  # Add this line

    class Meta:
        model = MedicalHistory
        fields = '__all__'

class MedicalHistoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = ['ill_date', 'ill']
    
    def create(self, validated_data):
        cleaned_data = {k: v for k, v in validated_data.items() if v is not None}
        return super().create(cleaned_data)

class ObstetricalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Obstetrical_History
        fields = '__all__'

class BodyMeasurementReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = ['weight', 'height', 'created_at']

class IllnessCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Illness
        fields = ['ill_id', 'illname', 'created_at']
    
    def create(self, validated_data):
        return Illness.objects.create(
            illname=validated_data['illname'],
        )

class SpouseCreateSerializer(serializers.ModelSerializer):
    spouse_mname = serializers.CharField(required=False, allow_blank=True, default="N/A")
    
    class Meta:
        model = Spouse
        fields = ['spouse_type', 'spouse_lname', 'spouse_fname', 'spouse_mname', 
                 'spouse_occupation', 'spouse_dob']

class VitalSignsCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = ['vital_bp_systolic', 'vital_bp_diastolic'] 

class BodyMeasurementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = ['weight', 'height'] 

class ObstetricalHistoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Obstetrical_History
        fields = ['obs_ch_born_alive', 'obs_living_ch', 'obs_abortion', 'obs_still_birth', 'obs_lg_babies',
                  'obs_lg_babies_str', 'obs_gravida', 'obs_para', 'obs_fullterm', 'obs_preterm', 'obs_lmp']
# end of serializer for models not in maternal

class PreviousHospitalizationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Hospitalization
        fields = ['prev_hospitalization', 'prev_hospitalization_year']

class PreviousPregnancyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Pregnancy
        fields = ['date_of_delivery', 'outcome', 'type_of_delivery', 'babys_wt', 'gender', 'ballard_score', 'apgar_score']
        extra_kwargs = { 'date_of_delivery': {'required': False, 'allow_null': True} }

class TTStatusCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TT_Status
        fields = ['tts_status', 'tts_date_given', 'tts_tdap']

class LaboratoryResultImgCreateSerializer(serializers.ModelSerializer):
    # image_url, image_name, image_type, image_size will be handled in create method
    class Meta:
        model = LaboratoryResultImg
        fields = ['image_url', 'image_name', 'image_type', 'image_size'] 

class LaboratoryResultCreateSerializer(serializers.ModelSerializer):
    images = LaboratoryResultImgCreateSerializer(many=True, required=False, write_only=True) # Nested images
    
    class Meta:
        model = LaboratoryResult
        fields = ['lab_type', 'result_date', 'is_completed', 'to_be_followed', 'document_path', 'remarks', 'images']
        extra_kwargs = {
            'result_date': {'required': False, 'allow_null': True},
            'is_completed': {'required': False, 'default': False},
            'to_be_followed': {'required': False, 'default': False},
            'remarks': {'required': False, 'allow_blank': True},
            'document_path': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        lab_result = LaboratoryResult.objects.create(**validated_data)
        for img_data in images_data:
            file_data = {
                'file': img_data['image_url'],
                'name': img_data['image_name'],
                'type': img_data['image_type'],
                'size': img_data['image_size'],
            }
            url = upload_to_storage(file_data, bucket='lab-result-documents', folder='lab-images')
            LaboratoryResultImg.objects.create(
                lab_id=lab_result, 
                image_url=url, 
                image_name=img_data['image_name'],
                image_type=img_data['image_type'],
                image_size=img_data['image_size'],
            )
        return lab_result

class Guide4ANCVisitCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guide4ANCVisit
        fields = ['pfav_1st_tri', 'pfav_2nd_tri', 'pfav_3rd_tri_one', 'pfav_3rd_tri_two']

class ChecklistCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checklist
        fields = [
            'increased_bp', 'nausea', 'edema', 'abno_vaginal_disch', 'chills_fever',
            'varicosities', 'epigastric_pain', 'blurring_vision', 'severe_headache',
            'vaginal_bleeding', 'diff_in_breathing', 'abdominal_pain'
        ]

class BirthPlanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BirthPlan
        fields = ['place_of_delivery_plan', 'newborn_screening_plan']

class ObstetricRiskCodeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObstetricRiskCode
        fields = ['pforc_prev_c_section', 'pforc_3_consecutive_miscarriages', 'pforc_postpartum_hemorrhage']

class PrenatalCareCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrenatalCare
        fields = [
            'pfpc_date', 'pfpc_aog_wks', 'pfpc_aog_days', 'pfpc_fundal_ht',
            'pfpc_fetal_hr', 'pfpc_fetal_pos', 'pfpc_complaints', 'pfpc_advises'
        ]
        extra_kwargs = {
            'pfpc_aog_wks': {'required': False, 'allow_null': True},
            'pfpc_aog_days': {'required': False, 'allow_null': True},
            'pfpc_fundal_ht': {'required': False, 'allow_null': True},
            'pfpc_fetal_hr': {'required': False, 'allow_null': True},
            'pfpc_fetal_pos': {'required': False, 'allow_blank': True},
            'pfpc_complaints': {'required': False, 'allow_blank': True, 'allow_null': True},
            'pfpc_advises': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

# serializer for prenatal-care comparison table
class PrenatalCareDetailSerializer(serializers.ModelSerializer):
    weight = serializers.SerializerMethodField()
    height = serializers.SerializerMethodField()
    bp_systolic = serializers.SerializerMethodField()
    bp_diastolic = serializers.SerializerMethodField()

    class Meta:
        model = PrenatalCare
        fields = [
            'pfpc_date', 'pfpc_aog_wks', 'pfpc_aog_days', 'pfpc_fundal_ht',
            'pfpc_fetal_hr', 'pfpc_fetal_pos', 'pfpc_complaints', 'pfpc_advises',
            'weight', 'height', 'bp_systolic', 'bp_diastolic'
        ]

    def get_weight(self, obj):
        try:
            prenatal_form = obj.pf_id
            if prenatal_form and prenatal_form.bm_id:
                return prenatal_form.bm_id.weight
            return None
        except:
            return None

    def get_height(self, obj):
        try:
            prenatal_form = obj.pf_id
            if prenatal_form and prenatal_form.bm_id:
                return prenatal_form.bm_id.height
            return None
        except:
            return None

    def get_bp_systolic(self, obj):
        try:
            prenatal_form = obj.pf_id
            if prenatal_form and prenatal_form.vital_id:
                return prenatal_form.vital_id.vital_bp_systolic
            return None
        except:
            return None

    def get_bp_diastolic(self, obj):
        try:
            prenatal_form = obj.pf_id
            if prenatal_form and prenatal_form.vital_id:
                return prenatal_form.vital_id.vital_bp_diastolic
            return None
        except:
            return None


class PrenatalPatientObstetricalHistorySerializer(serializers.ModelSerializer):
    obstetrical_history = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = ['pat_id', 'obstetrical_history']

    def get_obstetrical_history(self, obj):
        try:
            obs_record = Obstetrical_History.objects.filter(patrec_id__pat_id=obj).order_by('-obs_id').first()
        
            if obs_record:
                return ObstetricalHistorySerializer(obs_record).data
            else: 
                return None
        
        except Exception as e:
            return None
        

class PrenatalDetailViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prenatal_Form
        fields = ['pf_id', 'pf_edc', 'created_at']


class PrenatalCareSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrenatalCare
        fields = [
            'pfpc_id', 'pf_id', 'pfpc_date', 'pfpc_aog_wks', 'pfpc_aog_days', 'pfpc_fundal_ht',
            'pfpc_fetal_hr', 'pfpc_fetal_pos', 'pfpc_complaints', 'pfpc_advises'
        ]