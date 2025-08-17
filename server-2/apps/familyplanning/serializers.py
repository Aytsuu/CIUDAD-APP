from rest_framework import serializers
from django.db import transaction  # Import transaction for atomic operations
from .models import *
from apps.patientrecords.models import *
from apps.administration.models import *
from apps.inventory.models import *
from apps.healthProfiling.models import *

class FPRecordSerializer(serializers.ModelSerializer):
    patrec = serializers.PrimaryKeyRelatedField(queryset=PatientRecord.objects.all())
    class Meta:
        model = FP_Record
        fields = '__all__'

class FPTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_type
        fields = '__all__'
        extra_kwargs = {'fprecord_id': {'required': False}}

class FPRiskStiSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_RiskSti
        fields = '__all__'
        extra_kwargs = {'fprecord_id': {'required': False}}

class FPRiskVawSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_RiskVaw
        fields = '__all__'
        extra_kwargs = {'fprecord_id': {'required': False}}


class FPPhysicalExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_Physical_Exam
        fields = '__all__'
        extra_kwargs = {'fprecord_id': {'required': False}}

class FPAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_Assessment_Record
        fields = '__all__'
        extra_kwargs = {'fprecord_id': {'required': False}}


class PelvicExamSerializer(serializers.ModelSerializer):
    # uterinePosition = serializers.ChoiceField(
    #     choices=['midline', 'anteflexed', 'retroflexed']
    #   )
    class Meta:
        model = FP_Pelvic_Exam
        fields = '__all__'
        extra_kwargs = {'fprecord_id': {'required': False}}


class AcknowledgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_Acknowledgement
        fields = '__all__'
        extra_kwargs = {'fprecord_id': {'required': False}}


class FP_ObstetricalHistorySerializer(serializers.ModelSerializer):
    fpob_last_period = serializers.DateField(
        required=False,
        allow_null=True
    )
    
    fpob_previous_period = serializers.DateField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = FP_Obstetrical_History
        fields = '__all__'
        extra_kwargs = {'fprecord_id': {'required': False}}


class FP_PregnancyCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_pregnancy_check
        fields = '__all__'
        extra_kwargs = {'fprecord_id': {'required': False}}


class FP_ServiceProvisionRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_Assessment_Record
        fields = '__all__'
        extra_kwargs = {'fprecord_id': {'required': False}}


# --- Additional Serializers for related models not directly part of FP_Record but linked ---
class PatientRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientRecord
        fields = '__all__'

# This serializer is used for fetching patient details, not for FP_Record itself
class PersonalInfoForFpSerializer(serializers.ModelSerializer):
    # This serializer maps personal info to frontend-friendly names
    per_lname = serializers.CharField(source='per_lname')
    per_fname = serializers.CharField(source='per_fname')
    per_mname = serializers.CharField(source='per_mname', allow_null=True, allow_blank=True)
    per_dob = serializers.DateField(source='per_dob')
    per_sex = serializers.CharField(source='per_sex')
    per_edAttainment = serializers.CharField(source='per_edAttainment', allow_null=True, allow_blank=True)
    # per_occupation = serializers.CharField(source='per_occupation', allow_null=True, allow_blank=True)
    per_religion = serializers.CharField(source='per_religion', allow_null=True, allow_blank=True)
    age = serializers.SerializerMethodField()
    # educationalAttainment = serializers.SerializerMethodField() # Mapped value

    class Meta:
        model = Personal
        fields = [
            'per_id', 'per_lname', 'per_fname', 'per_mname', 'per_dob',
            'per_sex', 'per_edAttainment', 'per_religion',
            'age',
        ]

    def get_age(self, obj):
        # Calculate age from per_dob
        today = date.today()
        if obj.per_dob:
            age = today.year - obj.per_dob.year - ((today.month, today.day) < (obj.per_dob.month, obj.per_dob.day))
            return age
        return None

class AddressForFpSerializer(serializers.ModelSerializer):
    # This serializer maps address info to frontend-friendly names
    houseNumber = serializers.CharField(source='add_houseno', allow_null=True, allow_blank=True)
    street = serializers.CharField(source='add_street', allow_null=True, allow_blank=True)
    barangay = serializers.CharField(source='add_barangay', allow_null=True, allow_blank=True)
    municipality = serializers.CharField(source='add_city', allow_null=True, allow_blank=True)
    province = serializers.CharField(source='add_province', allow_null=True, allow_blank=True)

    class Meta:
        model = Address
        fields = ['add_id', 'houseNumber', 'street', 'barangay', 'municipality', 'province']


class SpouseForFpSerializer(serializers.ModelSerializer):
    s_lastName = serializers.CharField(source='spouse_lname', allow_null=True, allow_blank=True)
    s_givenName = serializers.CharField(source='spouse_fname', allow_null=True, allow_blank=True)
    s_middleInitial = serializers.CharField(source='spouse_mname', allow_null=True, allow_blank=True)
    s_dateOfBirth = serializers.DateField(source='spouse_dob', allow_null=True)
    s_occupation = serializers.CharField(source='spouse_occupation', allow_null=True, allow_blank=True)
    s_age = serializers.SerializerMethodField()

    class Meta:
        model = Spouse
        fields = [
            'spouse_id', 's_lastName', 's_givenName', 's_middleInitial',
            's_dateOfBirth', 's_age', 's_occupation'
        ]

    def get_s_age(self, obj):
        today = date.today()
        if obj.spouse_dob:
            age = today.year - obj.spouse_dob.year - ((today.month, today.day) < (obj.spouse_dob.month, obj.spouse_dob.day))
            return age
        return None

class BodyMeasurementForFpSerializer(serializers.ModelSerializer):
    # Maps body measurement fields
    bmi_category = serializers.CharField(source='bmi_category', allow_null=True, allow_blank=True)

    class Meta:
        model = BodyMeasurement
        fields = ['height', 'weight']


        
class ObstetricalHistoryForFpSerializer(serializers.ModelSerializer):
    # Maps obstetrical history fields
    g_pregnancies = serializers.IntegerField(source='obs_gravida')
    p_pregnancies = serializers.IntegerField(source='obs_para')
    fullTerm = serializers.IntegerField(source='obs_fullterm')
    premature = serializers.IntegerField(source='obs_preterm')
    abortion = serializers.IntegerField(source='obs_abortion')
    livingChildren = serializers.IntegerField(source='obs_living_ch')
    lastDeliveryDate = serializers.DateField(source='obs_last_delivery', allow_null=True)
    typeOfLastDelivery = serializers.CharField(source='obs_type_last_delivery', allow_null=True, allow_blank=True)
    lastMenstrualPeriod = serializers.CharField(source='obs_last_period', allow_null=True, allow_blank=True)
    previousMenstrualPeriod = serializers.CharField(source='obs_previous_period', allow_null=True, allow_blank=True)
    menstrualFlow = serializers.CharField(source='obs_mens_flow', allow_null=True, allow_blank=True)
    dysmenorrhea = serializers.BooleanField(source='obs_dysme')
    hydatidiformMole = serializers.BooleanField(source='obs_hydatidiform')
    ectopicPregnancyHistory = serializers.BooleanField(source='obs_ectopic_pregnancy')

    class Meta:
        model = Obstetrical_History
        fields = [
            'obs_id', 'g_pregnancies', 'p_pregnancies', 'fullTerm', 'premature', 'abortion',
            'livingChildren', 'lastDeliveryDate', 'typeOfLastDelivery', 'lastMenstrualPeriod',
            'previousMenstrualPeriod', 'menstrualFlow', 'dysmenorrhea',
            'hydatidiformMole', 'ectopicPregnancyHistory'
        ]


        

class PatientComprehensiveFpSerializer(serializers.ModelSerializer):
    client_id = serializers.CharField(source='client_id', read_only=True)
    pat_id = serializers.CharField(read_only=True)
    personal_info = PersonalInfoForFpSerializer(source='rp_id.per', read_only=True, allow_null=True)
    # Address (from Address model, linked via PersonalAddress)
    address = AddressForFpSerializer(source='rp_id.per.addresses.first.add', read_only=True, allow_null=True) # Assuming one primary address

    # Spouse Information
    spouse = SpouseForFpSerializer(read_only=True, allow_null=True)

    # Health Related Details for PhilHealth and NHTS
    philhealthNo = serializers.SerializerMethodField()
    nhts_status = serializers.SerializerMethodField()
    numOfLivingChildren = serializers.IntegerField(source='hrd.hrd_no_living_children', read_only=True, allow_null=True)
    plan_more_children = serializers.BooleanField(source='plan_more_children', read_only=True)
    avg_monthly_income = serializers.CharField(source='avg_monthly_income', read_only=True)
    pantawid_4ps = serializers.BooleanField(source='fourps', read_only=True)


    # Body Measurements
    body_measurements = BodyMeasurementForFpSerializer(source='pat.body_measurements.first', read_only=True, allow_null=True) # Assuming first measurement for the patient

    # Obstetrical History
    obstetricalHistory = ObstetricalHistoryForFpSerializer(source='patrec.obstetrical_histories.first', read_only=True, allow_null=True) # Assuming first history for the patient record

    # FP_Type (First Page client type and reason)
    typeOfClient = serializers.CharField(source='fp_types.first.fpt_client_type', read_only=True, allow_null=True)
    subTypeOfClient = serializers.CharField(source='fp_types.first.fpt_subtype', read_only=True, allow_null=True)
    reasonForFP = serializers.CharField(source='fp_types.first.fpt_reason_fp', read_only=True, allow_null=True)
    otherReasonForFP = serializers.CharField(source='fp_types.first.fpt_other_reason_fp', read_only=True, allow_null=True)

    def get_family_planning_record(self, obj):
        try:
            fp_record = FP_Record.objects.filter(pat_id=obj).order_by('-created_at').first()

            if fp_record:
                # Find the FP_type associated with the record
                fp_type = FP_type.objects.filter(fprecord_id=fp_record).first()
                if fp_type:
                    return {
                        'has_fp_record': True,
                        'fp_method': fp_type.fpt_method_used,
                        'client_type': fp_type.fpt_client_type
                    }
            
            return {'has_fp_record': False}
        except Exception as e:
            print(f'Error checking family planning record: {str(e)}')
            return {'has_fp_record': False, 'error': str(e)}
        
    def get_numOfLivingChildren(self, obj: Patient) -> int:
        try:
            # Find the latest patient record associated with the patient
            latest_record = PatientRecord.objects.filter(pat_id=obj).order_by('-created_at').first()
            if latest_record:
                # Find the obstetrical history associated with that specific record
                obs_history = Obstetrical_History.objects.filter(patrec_id=latest_record).first()
                if obs_history and obs_history.obs_living_ch is not None:
                    return obs_history.obs_living_ch
        except (PatientRecord.DoesNotExist, Obstetrical_History.DoesNotExist):
            return 0
        return 0

 
    class Meta:
        model = FP_Record
        fields = '__all__'
