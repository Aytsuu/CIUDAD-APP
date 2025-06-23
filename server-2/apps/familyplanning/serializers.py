from rest_framework import serializers
from django.db import transaction  # Import transaction for atomic operations
from .models import *
# Import models from other apps with their full paths for nested serializers
from apps.patientrecords.models import *
from apps.administration.models import *
from apps.inventory.models import *
from apps.healthProfiling.models import *

class FPRecordSerializer(serializers.ModelSerializer):
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

class PatientComprehensiveFpSerializer(serializers.ModelSerializer):
    # Ensure all these fields are properly mapped
    lastName = serializers.CharField(source='pat.rp_id.per.per_lname', allow_null=True)
    givenName = serializers.CharField(source='pat.rp_id.per.per_fname', allow_null=True)
    middleInitial = serializers.SerializerMethodField()
    dateOfBirth = serializers.DateField(source='pat.rp_id.per.per_dob', allow_null=True)
    age = serializers.SerializerMethodField()
    
    def get_middleInitial(self, obj):
        if obj.pat.rp_id.per.per_mname:
            return obj.pat.rp_id.per.per_mname[0]
        return ""
    
    def get_age(self, obj):
        if obj.pat.rp_id.per.per_dob:
            today = date.today()
            return today.year - obj.pat.rp_id.per.per_dob.year - (
                (today.month, today.day) < 
                (obj.pat.rp_id.per.per_dob.month, obj.pat.rp_id.per.per_dob.day)
            )
        return 0
    
    class Meta:
        model = FP_Record
        fields = [
            'pat_id', 'clientID', 'philhealthNo', 'nhts_status', 'pantawid_4ps',
            'lastName', 'givenName', 'middleInitial', 'dateOfBirth', 'age',
            'educationalAttainment', 'occupation',
            # Include all other fields needed by your frontend
        ]
        
class PersonalInfoForFpSerializer(serializers.ModelSerializer):
    # This serializer maps personal info to frontend-friendly names
    per_lname = serializers.CharField(source='per_lname')
    per_fname = serializers.CharField(source='per_fname')
    per_mname = serializers.CharField(source='per_mname', allow_null=True, allow_blank=True)
    per_dob = serializers.DateField(source='per_dob')
    per_sex = serializers.CharField(source='per_sex')
    per_edAttainment = serializers.CharField(source='per_edAttainment', allow_null=True, allow_blank=True)
    per_occupation = serializers.CharField(source='per_occupation', allow_null=True, allow_blank=True)
    per_religion = serializers.CharField(source='per_religion', allow_null=True, allow_blank=True)
    age = serializers.SerializerMethodField()
    educationalAttainment = serializers.SerializerMethodField() # Mapped value

    class Meta:
        model = Personal
        fields = [
            'per_id', 'per_lname', 'per_fname', 'per_mname', 'per_dob',
            'per_sex', 'per_edAttainment', 'per_occupation', 'per_religion',
            'age', 'educationalAttainment'
        ]

    def get_age(self, obj):
        # Calculate age from per_dob
        today = date.today()
        if obj.per_dob:
            age = today.year - obj.per_dob.year - ((today.month, today.day) < (obj.per_dob.month, obj.per_dob.day))
            return age
        return None

    def get_educationalAttainment(self, obj):
        # Map educational attainment value from backend to frontend
        value = obj.per_edAttainment
        if not value:
            return None
        value_lower = value.lower()
        if "elementary" in value_lower:
            return "elementary"
        elif "high school" in value_lower:
            return "highschool"
        elif "senior high school" in value_lower or "shs" in value_lower:
            return "shs"
        elif "college" in value_lower:
            return "collegelevel" # Can be college or college level
        elif "college graduate" in value_lower:
            return "collegegrad"
        return None # Default or unmapped


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
    # This serializer maps spouse info to frontend-friendly names
    s_lastName = serializers.CharField(source='spouse_lname')
    s_givenName = serializers.CharField(source='spouse_fname')
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
        fields = ['bmi', 'bmi_category', 'height', 'weight']

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


# --- COMPREHENSIVE PATIENT FP RECORD SERIALIZER for GET operations ---
class PatientComprehensiveFpSerializer(serializers.ModelSerializer):
    # Patient-level fields
    clientID = serializers.CharField(source='clientID', read_only=True)
    pat_id = serializers.CharField(read_only=True)

    # Personal Information (from Personal model, linked via Patient and ResidentProfile)
    personal_info = PersonalInfoForFpSerializer(source='rp_id.per', read_only=True, allow_null=True)

    # Address (from Address model, linked via PersonalAddress)
    address = AddressForFpSerializer(source='rp_id.per.addresses.first.add', read_only=True, allow_null=True) # Assuming one primary address

    # Spouse Information
    spouse = SpouseForFpSerializer(read_only=True, allow_null=True)

    # Health Related Details for PhilHealth and NHTS
    philhealthNo = serializers.SerializerMethodField()
    nhts_status = serializers.SerializerMethodField()
    numOfLivingChildren = serializers.IntegerField(source='hrd.hrd_no_living_children', read_only=True, allow_null=True)
    planToHaveMoreChildren = serializers.BooleanField(source='plan_more_children', read_only=True)
    averageMonthlyIncome = serializers.CharField(source='avg_monthly_income', read_only=True)
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


    class Meta:
        model = FP_Record
        # Include fields from FP_Record directly
        fields = [
            'fprecord_id', 'clientID', 'fourps', 'plan_more_children', 'avg_monthly_income', 'occupation',
            'pat_id', # Directly accessible through FP_Record
            'clientID', 'philhealthNo', 'nhts_status', 'numOfLivingChildren', 'planToHaveMoreChildren',
            'averageMonthlyIncome', 'pantawid_4ps',
            'personal_info', 'address', 'spouse', 'body_measurements', 'obstetricalHistory',
            'typeOfClient', 'subTypeOfClient', 'reasonForFP', 'otherReasonForFP'
        ]

    def get_philhealthNo(self, obj):
        # Get PhilHealth ID from HealthRelatedDetails linked to the patient's personal record
        if obj.hrd and obj.hrd.hrd_philhealth_id:
            return obj.hrd.hrd_philhealth_id
        return None

    def get_nhts_status(self, obj):
        # Get NHTS status from the Household linked to the patient's resident profile
        if obj.pat and obj.pat.rp_id and obj.pat.rp_id.household_id and obj.pat.rp_id.household_id.hh_nhts_status is not None:
             return obj.pat.rp_id.household_id.hh_nhts_status
        return False

# --- FamilyPlanningRecordCompositeSerializer for CREATE/UPDATE (from your existing file) ---
# Keep this serializer for handling POST/PUT requests
class FamilyPlanningRecordCompositeSerializer(serializers.ModelSerializer):
    # This composite serializer is used for creating/updating the entire record across pages.

    clientID = serializers.CharField(required=False, allow_blank=True)
    philhealthNo = serializers.CharField(required=False, allow_blank=True)
    nhts_status = serializers.BooleanField(default=False)
    pantawid_4ps = serializers.BooleanField(default=False)
    lastName = serializers.CharField(max_length=255)
    givenName = serializers.CharField(max_length=255)
    middleInitial = serializers.CharField(max_length=255, required=False, allow_blank=True)
    dateOfBirth = serializers.DateField()
    age = serializers.IntegerField() # This will be ignored for create/update, age is derived
    educationalAttainment = serializers.CharField(max_length=255, required=False, allow_blank=True)
    occupation = serializers.CharField(max_length=255, required=False, allow_blank=True)
    avg_monthly_income = serializers.CharField(max_length=15, required=False, allow_blank=True)
    religion = serializers.CharField(max_length=255, required=False, allow_blank=True)
    sex = serializers.CharField(max_length=10) # Gender

    # Address fields (might be nested or flattened depending on frontend structure)
    houseNumber = serializers.CharField(required=False, allow_blank=True)
    street = serializers.CharField(required=False, allow_blank=True)
    barangay = serializers.CharField(required=255, allow_blank=True)
    municipality = serializers.CharField(required=255, allow_blank=True)
    province = serializers.CharField(required=255, allow_blank=True)

    # Spouse Information
    s_lastName = serializers.CharField(required=False, allow_blank=True)
    s_givenName = serializers.CharField(required=False, allow_blank=True)
    s_middleInitial = serializers.CharField(required=False, allow_blank=True)
    s_dateOfBirth = serializers.DateField(required=False, allow_null=True)
    s_occupation = serializers.CharField(required=False, allow_blank=True)

    # Children and Income (from FP_Record / HealthRelatedDetails)
    numOfLivingChildren = serializers.IntegerField(required=False, allow_null=True)
    planToHaveMoreChildren = serializers.BooleanField(default=False)
    averageMonthlyIncome = serializers.CharField(required=False, allow_blank=True)

    # FP Type (from FpPage1)
    typeOfClient = serializers.CharField(required=True)
    subTypeOfClient = serializers.CharField(required=False, allow_blank=True)
    reasonForFP = serializers.CharField(required=False, allow_blank=True)
    otherReasonForFP = serializers.CharField(required=False, allow_blank=True)

    # Body Measurements (from FpPage2/3, linked to Patient)
    weight = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    height = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    bmi = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True) # Calculated or sent
    bmi_category = serializers.CharField(max_length=50, required=False, allow_blank=True)

    # Obstetrical History (from FpPage3)
    g_pregnancies = serializers.IntegerField(required=False, allow_null=True)
    p_pregnancies = serializers.IntegerField(required=False, allow_null=True)
    fullTerm = serializers.IntegerField(required=False, allow_null=True)
    premature = serializers.IntegerField(required=False, allow_null=True)
    abortion = serializers.IntegerField(required=False, allow_null=True)
    livingChildren = serializers.IntegerField(required=False, allow_null=True)
    lastDeliveryDate = serializers.DateField(required=False, allow_null=True)
    typeOfLastDelivery = serializers.CharField(max_length=255, required=False, allow_blank=True)
    lastMenstrualPeriod = serializers.CharField(max_length=255, required=False, allow_blank=True) # Should be DateField?
    previousMenstrualPeriod = serializers.CharField(max_length=255, required=False, allow_blank=True) # Should be DateField?
    menstrualFlow = serializers.CharField(max_length=255, required=False, allow_blank=True)
    dysmenorrhea = serializers.BooleanField(default=False)
    hydatidiformMole = serializers.BooleanField(default=False)
    ectopicPregnancyHistory = serializers.BooleanField(default=False)

    # Vital Signs (from FpPage4)
    bp_systolic = serializers.IntegerField(required=False, allow_null=True)
    bp_diastolic = serializers.IntegerField(required=False, allow_null=True)
    temperature = serializers.DecimalField(max_digits=4, decimal_places=2, required=False, allow_null=True)
    pulse_rate = serializers.IntegerField(required=False, allow_null=True)
    respiration_rate = serializers.IntegerField(required=False, allow_null=True)
    skin = serializers.CharField(max_length=255, required=False, allow_blank=True)
    conjunctiva = serializers.CharField(max_length=255, required=False, allow_blank=True)
    neck = serializers.CharField(max_length=255, required=False, allow_blank=True)
    breast = serializers.CharField(max_length=255, required=False, allow_blank=True)
    abdomen = serializers.CharField(max_length=255, required=False, allow_blank=True)
    extremities = serializers.CharField(max_length=255, required=False, allow_blank=True)

    # Risk STI (from FpPage4)
    abnormal_discharge = serializers.BooleanField(default=False)
    sores_lesions = serializers.BooleanField(default=False)
    genital_warts = serializers.BooleanField(default=False)
    bubues = serializers.BooleanField(default=False)
    risk_factors_sti = serializers.CharField(max_length=255, required=False, allow_blank=True)
    partner_with_sti = serializers.BooleanField(default=False)
    recurrent_uti = serializers.BooleanField(default=False)

    # Risk VAW (from FpPage4)
    vaw_physical = serializers.BooleanField(default=False)
    vaw_sexual = serializers.BooleanField(default=False)
    vaw_emotional = serializers.BooleanField(default=False)

    # Physical Exam (from FpPage5)
    thyroidEnlargement = serializers.BooleanField(default=False)
    mass = serializers.BooleanField(default=False)
    nippleDischarge = serializers.BooleanField(default=False)
    pelvicExam = serializers.CharField(max_length=255, required=False, allow_blank=True)
    cervicalConsistency = serializers.CharField(max_length=255, required=False, allow_blank=True)
    cervicalTenderness = serializers.CharField(max_length=255, required=False, allow_blank=True)
    cervicalAdnexalMassTenderness = serializers.CharField(max_length=255, required=False, allow_blank=True)
    uterinePosition = serializers.CharField(max_length=255, required=False, allow_blank=True)
    uterineDepth = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)

    # Acknowledgement (from FpPage5)
    client_signature = serializers.CharField(max_length=255, required=False, allow_blank=True)
    client_signature_date = serializers.DateField(required=False, allow_null=True)
    guardian_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    guardian_signature = serializers.CharField(max_length=255, required=False, allow_blank=True)
    guardian_signature_date = serializers.DateField(required=False, allow_null=True)

    # Service Provision (from FpPage6)
    dateOfVisit = serializers.DateTimeField(required=False, allow_null=True)
    methodCurrentlyUsed = serializers.CharField(max_length=255, required=False, allow_blank=True)
    otherMethod = serializers.CharField(max_length=255, required=False, allow_blank=True)
    appointmentDate = serializers.DateField(required=False, allow_null=True)
    staffId = serializers.IntegerField(required=False, allow_null=True) # Link to Staff model
    staffName = serializers.CharField(max_length=255, required=False, allow_blank=True) # For display only
    dispensedCommodityItemId = serializers.IntegerField(required=False, allow_null=True) # Link to CommodityList
    dispensedMedicineItemId = serializers.IntegerField(required=False, allow_null=True) # Link to Medicinelist
    dispensedVaccineItemId = serializers.IntegerField(required=False, allow_null=True) # Link to VaccineList
    dispensedItemNameForReport = serializers.CharField(max_length=255, required=False, allow_blank=True)
    inventoryDeductionRef = serializers.CharField(max_length=255, required=False, allow_blank=True)


    class Meta:
        model = FP_Record
        fields = [
            'fprecord_id', 'clientID', 'philhealthNo', 'nhts_status', 'pantawid_4ps',
            'lastName', 'givenName', 'middleInitial', 'dateOfBirth', 'age',
            'educationalAttainment', 'occupation', 'avg_monthly_income', 'religion', 'sex',
            'houseNumber', 'street', 'barangay', 'municipality', 'province',
            's_lastName', 's_givenName', 's_middleInitial', 's_dateOfBirth', 's_occupation',
            'numOfLivingChildren', 'planToHaveMoreChildren', 'averageMonthlyIncome',
            'typeOfClient', 'subTypeOfClient', 'reasonForFP', 'otherReasonForFP',
            'weight', 'height', 'bmi', 'bmi_category',
            'g_pregnancies', 'p_pregnancies', 'fullTerm', 'premature', 'abortion',
            'livingChildren', 'lastDeliveryDate', 'typeOfLastDelivery', 'lastMenstrualPeriod',
            'previousMenstrualPeriod', 'menstrualFlow', 'dysmenorrhea', 'hydatidiformMole', 'ectopicPregnancyHistory',
            'bp_systolic', 'bp_diastolic', 'temperature', 'pulse_rate', 'respiration_rate',
            'skin', 'conjunctiva', 'neck', 'breast', 'abdomen', 'extremities',
            'abnormal_discharge', 'sores_lesions', 'genital_warts', 'bubues', 'risk_factors_sti',
            'partner_with_sti', 'recurrent_uti',
            'vaw_physical', 'vaw_sexual', 'vaw_emotional',
            'thyroidEnlargement', 'mass', 'nippleDischarge', 'pelvicExam',
            'cervicalConsistency', 'cervicalTenderness', 'cervicalAdnexalMassTenderness',
            'uterinePosition', 'uterineDepth',
            'client_signature', 'client_signature_date', 'guardian_name', 'guardian_signature', 'guardian_signature_date',
            'dateOfVisit', 'methodCurrentlyUsed', 'otherMethod', 'appointmentDate',
            'staffId', 'staffName', 'dispensedCommodityItemId', 'dispensedMedicineItemId',
            'dispensedVaccineItemId', 'dispensedItemNameForReport', 'inventoryDeductionRef'
        ]

    def create(self, validated_data):
        # Your existing create logic for the composite serializer
        with transaction.atomic():
            # Pop data for related models
            clientID = validated_data.pop('clientID', None)
            philhealth_no = validated_data.pop('philhealthNo', None)
            nhts_status = validated_data.pop('nhts_status', False)
            pantawid_4ps = validated_data.pop('pantawid_4ps', False)
            last_name = validated_data.pop('lastName', None)
            given_name = validated_data.pop('givenName', None)
            middle_initial = validated_data.pop('middleInitial', None)
            date_of_birth = validated_data.pop('dateOfBirth', None)
            age = validated_data.pop('age', None) # Age is derived, not saved directly
            educational_attainment = validated_data.pop('educationalAttainment', None)
            occupation = validated_data.pop('occupation', None)
            avg_monthly_income_personal = validated_data.pop('avg_monthly_income', None) # For Personal model
            religion = validated_data.pop('religion', None)
            sex = validated_data.pop('sex', None)

            house_number = validated_data.pop('houseNumber', None)
            street = validated_data.pop('street', None)
            barangay = validated_data.pop('barangay', None)
            municipality = validated_data.pop('municipality', None)
            province = validated_data.pop('province', None)

            s_last_name = validated_data.pop('s_lastName', None)
            s_given_name = validated_data.pop('s_givenName', None)
            s_middle_initial = validated_data.pop('s_middleInitial', None)
            s_date_of_birth = validated_data.pop('s_dateOfBirth', None)
            s_occupation = validated_data.pop('s_occupation', None)

            number_of_children = validated_data.pop('numOfLivingChildren', None)
            plan_more_children = validated_data.pop('planToHaveMoreChildren', False)
            avg_monthly_income_fp = validated_data.pop('averageMonthlyIncome', '0') # For FP_Record model

            type_of_client = validated_data.pop('typeOfClient', None)
            sub_type_of_client = validated_data.pop('subTypeOfClient', None)
            reason_for_fp = validated_data.pop('reasonForFP', None)
            other_reason_for_fp = validated_data.pop('otherReasonForFP', None)

            weight = validated_data.pop('weight', None)
            height = validated_data.pop('height', None)
            bmi = validated_data.pop('bmi', None)
            bmi_category = validated_data.pop('bmi_category', None)

            g_pregnancies = validated_data.pop('g_pregnancies', None)
            p_pregnancies = validated_data.pop('p_pregnancies', None)
            full_term = validated_data.pop('fullTerm', None)
            premature = validated_data.pop('premature', None)
            abortion = validated_data.pop('abortion', None)
            living_children = validated_data.pop('livingChildren', None)
            last_delivery_date = validated_data.pop('lastDeliveryDate', None)
            type_of_last_delivery = validated_data.pop('typeOfLastDelivery', None)
            last_menstrual_period = validated_data.pop('lastMenstrualPeriod', None)
            previous_menstrual_period = validated_data.pop('previousMenstrualPeriod', None)
            menstrual_flow = validated_data.pop('menstrualFlow', None)
            dysmenorrhea = validated_data.pop('dysmenorrhea', False)
            hydatidiform_mole = validated_data.pop('hydatidiformMole', False)
            ectopic_pregnancy_history = validated_data.pop('ectopicPregnancyHistory', False)

            bp_systolic = validated_data.pop('bp_systolic', None)
            bp_diastolic = validated_data.pop('bp_diastolic', None)
            temperature = validated_data.pop('temperature', None)
            pulse_rate = validated_data.pop('pulse_rate', None)
            respiration_rate = validated_data.pop('respiration_rate', None)
            skin = validated_data.pop('skin', None)
            conjunctiva = validated_data.pop('conjunctiva', None)
            neck = validated_data.pop('neck', None)
            breast = validated_data.pop('breast', None)
            abdomen = validated_data.pop('abdomen', None)
            extremities = validated_data.pop('extremities', None)

            abnormal_discharge = validated_data.pop('abnormal_discharge', False)
            sores_lesions = validated_data.pop('sores_lesions', False)
            genital_warts = validated_data.pop('genital_warts', False)
            bubues = validated_data.pop('bubues', False)
            risk_factors_sti = validated_data.pop('risk_factors_sti', None)
            partner_with_sti = validated_data.pop('partner_with_sti', False)
            recurrent_uti = validated_data.pop('recurrent_uti', False)

            vaw_physical = validated_data.pop('vaw_physical', False)
            vaw_sexual = validated_data.pop('vaw_sexual', False)
            vaw_emotional = validated_data.pop('vaw_emotional', False)

            thyroid_enlargement = validated_data.pop('thyroidEnlargement', False)
            mass = validated_data.pop('mass', False)
            nipple_discharge = validated_data.pop('nippleDischarge', False)
            pelvic_exam_result = validated_data.pop('pelvicExam', None)
            cervical_consistency = validated_data.pop('cervicalConsistency', None)
            cervical_tenderness = validated_data.pop('cervicalTenderness', None)
            cervical_adnexal_mass_tenderness = validated_data.pop('cervicalAdnexalMassTenderness', None)
            uterine_position = validated_data.pop('uterinePosition', None)
            uterine_depth = validated_data.pop('uterineDepth', None)

            client_signature_data = validated_data.pop('client_signature', None)
            client_signature_date_data = validated_data.pop('client_signature_date', None)
            guardian_name_data = validated_data.pop('guardian_name', None)
            guardian_signature_data = validated_data.pop('guardian_signature', None)
            guardian_signature_date_data = validated_data.pop('guardian_signature_date', None)

            date_of_visit = validated_data.pop('dateOfVisit', None)
            method_currently_used = validated_data.pop('methodCurrentlyUsed', None)
            other_method = validated_data.pop('otherMethod', None)
            appointment_date = validated_data.pop('appointmentDate', None)
            staff_id = validated_data.pop('staffId', None)
            dispensed_commodity_item_id = validated_data.pop('dispensedCommodityItemId', None)
            dispensed_medicine_item_id = validated_data.pop('dispensedMedicineItemId', None)
            dispensed_vaccine_item_id = validated_data.pop('dispensedVaccineItemId', None)
            dispensed_item_name_for_report = validated_data.pop('dispensedItemNameForReport', None)
            inventory_deduction_ref = validated_data.pop('inventoryDeductionRef', None)


            # --- Create/Update Personal and Address ---
            personal_instance, personal_created = Personal.objects.update_or_create(
                per_lname=last_name,
                per_fname=given_name,
                per_dob=date_of_birth,
                defaults={
                    'per_mname': middle_initial,
                    'per_sex': sex,
                    'per_edAttainment': educational_attainment,
                    'per_occupation': occupation,
                    'per_religion': religion,
                }
            )

            # Update or create ResidentProfile
            resident_profile_instance, rp_created = ResidentProfile.objects.update_or_create(
                per=personal_instance,
                defaults={
                    'rp_date_registered': date.today(), # Or a date from frontend if applicable
                    # 'household_id': Household.objects.get(hh_nhts_status=nhts_status) if nhts_status else None
                    # You need logic to find or create the correct Household based on NHTS status
                    # For now, let's assume household_id is handled if needed
                }
            )

            # Update or create PatientRecord
            patient_record_instance, pr_created = PatientRecord.objects.update_or_create(
                rp_id=resident_profile_instance,
                defaults={
                    # 'patrec_date_registered': date.today(),
                }
            )

            # Update or create Patient
            patient_instance, patient_created = Patient.objects.update_or_create(
                rp_id=resident_profile_instance,
                defaults={
                    'clientID': clientID,
                    'pat_type': 'FP Client', # Assuming a type here
                    # 'pat_status': 'active',
                }
            )

            # Address: Find or create Address and link via PersonalAddress
            if street or house_number or barangay or municipality or province:
                address_instance, address_created = Address.objects.update_or_create(
                    add_street=street,
                    add_barangay=barangay,
                    add_city=municipality,
                    add_province=province,
                    defaults={'add_houseno': house_number}
                )
                PersonalAddress.objects.update_or_create(
                    per=personal_instance,
                    add=address_instance
                )

            # Spouse: Update or create Spouse record
            if s_last_name and s_given_name:
                spouse_instance, spouse_created = Spouse.objects.update_or_create(
                    rp=resident_profile_instance, # Link spouse to the same resident profile for simplicity if it's patient's spouse
                    spouse_lname=s_last_name,
                    spouse_fname=s_given_name,
                    defaults={
                        'spouse_mname': s_middle_initial,
                        'spouse_dob': s_date_of_birth,
                        'spouse_occupation': s_occupation,
                        'spouse_type': 'Spouse' # Default type
                    }
                )
            else:
                spouse_instance = None

            # Health Related Details
            hrd_instance, hrd_created = HealthRelatedDetails.objects.update_or_create(
                per=personal_instance, # Link HRD to Personal
                defaults={
                    'hrd_philhealth_id': philhealth_no,
                    'hrd_no_children': number_of_children,
                    'hrd_no_living_children': number_of_children, # Assuming same for now
                    # 'hrd_nhts_status': nhts_status, # This needs to be set on Household
                }
            )

            # Update or create Household for NHTS status if resident_profile exists
            if resident_profile_instance and resident_profile_instance.household_id:
                Household.objects.filter(household_id=resident_profile_instance.household_id.household_id).update(
                    hh_nhts_status=nhts_status
                )
            elif resident_profile_instance and nhts_status: # If no household linked but NHTS is true, create one
                household_instance, household_created = Household.objects.get_or_create(
                    # Define unique fields for Household if creating
                    defaults={'hh_nhts_status': nhts_status}
                )
                resident_profile_instance.household_id = household_instance
                resident_profile_instance.save()


            # --- Create FP_Record ---
            fp_record = FP_Record.objects.create(
                clientID=clientID,
                fourps=pantawid_4ps,
                plan_more_children=plan_more_children,
                avg_monthly_income=avg_monthly_income_fp,
                occupation=occupation, # This occupation is for FP_Record, not Personal
                hrd=hrd_instance,
                patrec=patient_record_instance,
                spouse=spouse_instance,
                pat=patient_instance,
            )

            # --- Create related FP_ sub-records ---

            # FP_type
            FP_type.objects.create(
                fprecord=fp_record,
                fpt_client_type=type_of_client,
                fpt_subtype=sub_type_of_client,
                fpt_reason_fp=reason_for_fp,
                fpt_other_reason_fp=other_reason_for_fp,
            )

            # BodyMeasurement
            if weight is not None or height is not None or bmi is not None:
                BodyMeasurement.objects.create(
                    pat=patient_instance,
                    bmi=bmi,
                    bmi_category=bmi_category,
                    height=height,
                    weight=weight,
                )

            # ObstetricalHistory
            if g_pregnancies is not None or p_pregnancies is not None:
                Obstetrical_History.objects.create(
                    patrec=patient_record_instance, # Linked to PatientRecord
                    obs_gravida=g_pregnancies,
                    obs_para=p_pregnancies,
                    obs_fullterm=full_term,
                    obs_preterm=premature,
                    obs_abortion=abortion,
                    obs_living_ch=living_children,
                    obs_last_delivery=last_delivery_date,
                    obs_type_last_delivery=type_of_last_delivery,
                    obs_last_period=last_menstrual_period,
                    obs_previous_period=previous_menstrual_period,
                    obs_mens_flow=menstrual_flow,
                    obs_dysme=dysmenorrhea,
                    obs_hydatidiform=hydatidiform_mole,
                    obs_ectopic_pregnancy=ectopic_pregnancy_history,
                )
            # VitalSigns
            if bp_systolic is not None or temperature is not None:
                vital_signs_instance = VitalSigns.objects.create(
                    patient=patient_instance,
                    vs_bp_systolic=bp_systolic,
                    vs_bp_diastolic=bp_diastolic,
                    vs_temp=temperature,
                    vs_pulse_rate=pulse_rate,
                    vs_respiration_rate=respiration_rate,
                    vs_skin=skin,
                    vs_conjunctiva=conjunctiva,
                    vs_neck=neck,
                    vs_breast=breast,
                    vs_abdomen=abdomen,
                    vs_extremities=extremities,
                )
            else:
                vital_signs_instance = None

            # FP_RiskSti
            FP_RiskSti.objects.create(
                fprecord=fp_record,
                sti_ab_discharge=abnormal_discharge,
                sti_sores=sores_lesions,
                sti_gen_warts=genital_warts,
                sti_bubues=bubues,
                sti_risk_factors=risk_factors_sti,
                sti_partner=partner_with_sti,
                sti_recurrent_uti=recurrent_uti,
            )

            # FP_RiskVaw
            FP_RiskVaw.objects.create(
                fprecord=fp_record,
                vaw_physical=vaw_physical,
                vaw_sexual=vaw_sexual,
                vaw_emotional=vaw_emotional,
            )

            # FP_Physical_Exam
            FP_Physical_Exam.objects.create(
                fprecord=fp_record,
                fppe_thyroid_enlargement=thyroid_enlargement,
                fppe_mass=mass,
                fppe_nipple_discharge=nipple_discharge,
                fppe_pelvic_exam=pelvic_exam_result,
                fppe_cervical_consistency=cervical_consistency,
                fppe_cervical_tenderness=cervical_tenderness,
                fppe_cervical_adnexal_mass_tenderness=cervical_adnexal_mass_tenderness,
                fppe_uterine_position=uterine_position,
                fppe_uterine_depth=uterine_depth,
            )

            # FP_Acknowledgement
            FP_Acknowledgement.objects.create(
                fprecord=fp_record,
                fpa_client_sig=client_signature_data,
                fpa_client_sig_date=client_signature_date_data,
                fpa_guardian_name=guardian_name_data,
                fpa_guardian_sig=guardian_signature_data,
                fpa_guardian_sig_date=guardian_signature_date_data,
            )

            # Staff (Assuming you have a Staff model and the ID is passed)
            staff_instance = None
            if staff_id:
                staff_instance = Staff.objects.get(staff_id=staff_id)

            # Dispensed Items (assuming IDs are passed for linking)
            dispensed_commodity = None
            if dispensed_commodity_item_id:
                dispensed_commodity = CommodityList.objects.get(comm_id=dispensed_commodity_item_id)
            dispensed_medicine = None
            if dispensed_medicine_item_id:
                dispensed_medicine = Medicinelist.objects.get(med_id=dispensed_medicine_item_id)
            dispensed_vaccine = None
            if dispensed_vaccine_item_id:
                dispensed_vaccine = VaccineList.objects.get(vac_id=dispensed_vaccine_item_id)

            # FP_Assessment_Record (Service Provision)
            FP_Assessment_Record.objects.create(
                fprecord=fp_record,
                fpt=FP_type.objects.get(fprecord=fp_record), # Assuming one FP_type per FP_Record
                bm=BodyMeasurement.objects.filter(pat=patient_instance).first(), # Assuming one body measurement per patient
                vital_signs=vital_signs_instance,
                staff=staff_instance,
                # followv=followv_instance, # Assuming followv is not part of this initial creation or needs to be provided
                dispensed_commodity_item=dispensed_commodity,
                dispensed_medicine_item=dispensed_medicine,
                dispensed_vaccine_item=dispensed_vaccine,
                dispensed_item_name_for_report=dispensed_item_name_for_report,
                inventory_deduction_ref=inventory_deduction_ref,
                # Add any other assessment-specific fields here
            )

            return fp_record

    def update(self, instance, validated_data):
        raise NotImplementedError("Update method for composite serializer is not implemented yet. Focus on GET/CREATE for now.")

# # apps/familyplanning/serializers.py
# from rest_framework import serializers
# from django.db import transaction  # Import transaction for atomic operations
# from datetime import date # Import date for age calculation

# # Import models from other apps with their full paths for nested serializers
# from .models import *
# from apps.patientrecords.models import PatientRecord,FollowUpVisit, Patient, ResidentProfile, Spouse, Obstetrical_History # Ensure all these are imported
# from apps.administration.models import Staff
# from apps.inventory.models import CommodityList, Medicinelist, VaccineList
# from apps.healthProfiling.models import HealthRelatedDetails, Household, Personal, Address,PersonalAddress


# # --- Individual ModelSerializers (unchanged from your review) ---
# # (These are kept for individual CRUD operations if you have them,
# # but the Composite serializer will handle creation/update of their instances)

# class FPRecordSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Record
#         fields = '__all__'

# class FPTypeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_type
#         fields = '__all__'
#         extra_kwargs = {'fprecord_id': {'required': False}}

# class FPRiskStiSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_RiskSti
#         fields = '__all__'
#         extra_kwargs = {'fprecord_id': {'required': False}}

# class FPRiskVawSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_RiskVaw
#         fields = '__all__'
#         extra_kwargs = {'fprecord_id': {'required': False}}

# class FPPhysicalExamSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Physical_Exam
#         fields = '__all__'
#         extra_kwargs = {'fprecord_id': {'required': False}}

# class FPAssessmentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Assessment_Record
#         fields = '__all__'
#         extra_kwargs = {'fprecord_id': {'required': False}}

# class PelvicExamSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Pelvic_Exam
#         fields = '__all__'
#         extra_kwargs = {'fprecord_id': {'required': False}}

# class AcknowledgementSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Acknowledgement
#         fields = '__all__'
#         extra_kwargs = {'fprecord_id': {'required': False}}

# class FP_ObstetricalHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Obstetrical_History
#         fields = '__all__'
#         extra_kwargs = {'fprecord_id': {'required': False}}

# class FP_PregnancyCheckSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_pregnancy_check
#         fields = '__all__'
#         extra_kwargs = {'fprecord_id': {'required': False}}

# class FP_ServiceProvisionRecordSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Assessment_Record # Corrected model here, was FP_Assessment_Record
#         fields = '__all__'
#         extra_kwargs = {'fprecord_id': {'required': False}}


# # --- Supporting Serializers for Nested Data (Reading from Backend to Frontend) ---
# # These are used by PatientComprehensiveFpSerializer to map complex model relationships
# # to the flat structure expected by your frontend FormData.

# class PersonalInfoForFpSerializer(serializers.ModelSerializer):
#     """ Maps Personal model fields to frontend-friendly names """
#     lastName = serializers.CharField(source='per_lname')
#     givenName = serializers.CharField(source='per_fname')
#     middleInitial = serializers.CharField(source='per_mname', allow_null=True, allow_blank=True)
#     dateOfBirth = serializers.DateField(source='per_dob')
#     age = serializers.SerializerMethodField()
#     educationalAttainment = serializers.SerializerMethodField() # Mapped value
#     occupation = serializers.CharField(source='per_occupation', allow_null=True, allow_blank=True)
#     religion = serializers.CharField(source='per_religion', allow_null=True, allow_blank=True)
#     ethnicity = serializers.CharField(source='per_ethnicity', allow_null=True, allow_blank=True)
#     contactNo = serializers.CharField(source='per_contact_no', allow_null=True, allow_blank=True)
    
#     class Meta:
#         model = Personal
#         fields = [
#             'per_id', 'lastName', 'givenName', 'middleInitial', 'dateOfBirth',
#             'age', 'educationalAttainment', 'occupation', 'religion', 'ethnicity', 'contactNo'
#         ]

#     def get_age(self, obj):
#         today = date.today()
#         if obj.per_dob:
#             age = today.year - obj.per_dob.year - ((today.month, today.day) < (obj.per_dob.month, obj.per_dob.day))
#             return age
#         return None

#     def get_educationalAttainment(self, obj):
#         value = obj.per_edAttainment
#         if not value:
#             return None
#         value_lower = value.lower()
#         if "elementary" in value_lower:
#             return "elementary"
#         elif "high school" in value_lower:
#             return "highschool"
#         elif "senior high school" in value_lower or "shs" in value_lower:
#             return "shs"
#         elif "college" in value_lower: # This covers both college level and graduate for mapping from DB
#             return "collegelevel"
#         elif "college graduate" in value_lower:
#             return "collegegrad"
#         return value # Return original if no specific map, or define a default


# class AddressForFpSerializer(serializers.ModelSerializer):
#     """ Maps Address model fields to frontend-friendly names """
#     houseNumber = serializers.CharField(source='add_houseno', allow_null=True, allow_blank=True)
#     street = serializers.CharField(source='add_street', allow_null=True, allow_blank=True)
#     barangay = serializers.CharField(source='add_barangay', allow_null=True, allow_blank=True)
#     municipality = serializers.CharField(source='add_city', allow_null=True, allow_blank=True)
#     province = serializers.CharField(source='add_province', allow_null=True, allow_blank=True)

#     class Meta:
#         model = Address
#         fields = ['add_id', 'houseNumber', 'street', 'barangay', 'municipality', 'province']


# class SpouseForFpSerializer(serializers.ModelSerializer):
#     """ Maps Spouse model fields to frontend-friendly names """
#     s_lastName = serializers.CharField(source='spouse_lname')
#     s_givenName = serializers.CharField(source='spouse_fname')
#     s_middleInitial = serializers.CharField(source='spouse_mname', allow_null=True, allow_blank=True)
#     s_dateOfBirth = serializers.DateField(source='spouse_dob', allow_null=True)
#     s_occupation = serializers.CharField(source='spouse_occupation', allow_null=True, allow_blank=True)
#     s_contactNo = serializers.CharField(source='spouse_contact_no', allow_null=True, allow_blank=True) # Added contactNo
#     s_age = serializers.SerializerMethodField()

#     class Meta:
#         model = Spouse
#         fields = [
#             'spouse_id', 's_lastName', 's_givenName', 's_middleInitial',
#             's_dateOfBirth', 's_age', 's_occupation', 's_contactNo'
#         ]

#     def get_s_age(self, obj):
#         today = date.today()
#         if obj.spouse_dob:
#             age = today.year - obj.spouse_dob.year - ((today.month, today.day) < (obj.spouse_dob.month, obj.spouse_dob.day))
#             return age
#         return None

# class BodyMeasurementForFpSerializer(serializers.ModelSerializer):
#     """ Maps BodyMeasurement fields """
#     weight = serializers.DecimalField(source='body_weight', max_digits=5, decimal_places=2, allow_null=True)
#     height = serializers.DecimalField(source='body_height', max_digits=5, decimal_places=2, allow_null=True)
#     bmi = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True) # Assuming BMI field exists in model
#     bmi_category = serializers.CharField(max_length=50, allow_null=True, allow_blank=True) # Assuming bmi_category exists

#     class Meta:
#         model = BodyMeasurement
#         fields = ['bmi', 'bmi_category', 'weight', 'height']

# class ObstetricalHistoryForFpSerializer(serializers.ModelSerializer):
#     """ Maps Obstetrical_History fields from patientrecords app """
#     g_pregnancies = serializers.IntegerField(source='obs_gravida', allow_null=True)
#     p_pregnancies = serializers.IntegerField(source='obs_para', allow_null=True)
#     fullTerm = serializers.IntegerField(source='obs_fullterm', allow_null=True)
#     premature = serializers.IntegerField(source='obs_preterm', allow_null=True)
#     abortion = serializers.IntegerField(source='obs_abortion', allow_null=True)
#     livingChildren = serializers.IntegerField(source='obs_living_ch', allow_null=True)
#     # Fields below are from FP_Obstetrical_History, will be handled in composite serializer directly for GET
#     # lastDeliveryDate = serializers.DateField(source='fpob_last_delivery', allow_null=True)
#     # typeOfLastDelivery = serializers.CharField(source='fpob_type_last_delivery', allow_null=True, allow_blank=True)
#     # lastMenstrualPeriod = serializers.CharField(source='fpob_last_period', allow_null=True, allow_blank=True)
#     # previousMenstrualPeriod = serializers.CharField(source='fpob_previous_period', allow_null=True, allow_blank=True)
#     # menstrualFlow = serializers.CharField(source='fpob_mens_flow', allow_null=True, allow_blank=True)
#     # dysmenorrhea = serializers.BooleanField(source='fpob_dysme')
#     # hydatidiformMole = serializers.BooleanField(source='fpob_hydatidiform')
#     # ectopicPregnancyHistory = serializers.BooleanField(source='fpob_ectopic_pregnancy')

#     class Meta:
#         model = Obstetrical_History
#         fields = [
#             'obs_id', 'g_pregnancies', 'p_pregnancies', 'fullTerm', 'premature', 'abortion',
#             'livingChildren'
#         ]


# # --- COMPREHENSIVE PATIENT FP RECORD SERIALIZER for GET operations (Reading Backend to Frontend) ---
# class PatientComprehensiveFpSerializer(serializers.ModelSerializer):
#     """
#     Serializes a complete Family Planning record for GET operations, mapping
#     data from various related models into the frontend FormData structure.
#     This serializer is primarily for fetching data.
#     """
#     # Direct fields from FP_Record
#     clientID = serializers.CharField(source='clientID', read_only=True)
#     pat_id = serializers.CharField(source='pat.pat_id', read_only=True) # Ensure pat_id is available

#     # Personal Information (from Personal model, linked via Patient.rp_id.per)
#     personal_info = PersonalInfoForFpSerializer(source='pat.rp_id.per', read_only=True, allow_null=True)

#     # Address (from Address model, linked via PersonalAddress -> Personal -> Patient.rp_id.per)
#     # This might require custom logic or a SerializerMethodField if the relationship is complex
#     address = serializers.SerializerMethodField()

#     # Spouse Information (from Spouse model, linked via Patient.rp_id)
#     spouse = SpouseForFpSerializer(source='pat.rp_id.spouse', read_only=True, allow_null=True) # Assuming ResidentProfile has a spouse FK

#     # Health Related Details for PhilHealth and NHTS (from HealthRelatedDetails)
#     philhealthNo = serializers.SerializerMethodField()
#     nhts_status = serializers.SerializerMethodField() # From Household
#     numOfLivingChildren = serializers.IntegerField(source='hrd.hrd_no_living_children', read_only=True, allow_null=True)
#     planToHaveMoreChildren = serializers.BooleanField(source='plan_more_children', read_only=True)
#     averageMonthlyIncome = serializers.CharField(source='avg_monthly_income', read_only=True)
#     pantawid_4ps = serializers.BooleanField(source='fourps', read_only=True)

#     # Body Measurements (from BodyMeasurement, linked to Patient)
#     # Get the latest body measurement
#     body_measurements = serializers.SerializerMethodField()

#     # Obstetrical History (from patientrecords.models.Obstetrical_History, linked via PatientRecord)
#     # Get the latest obstetrical history
#     obstetricalHistory = serializers.SerializerMethodField()

#     # FP_Type (First Page client type and reason from FP_type)
#     typeOfClient = serializers.CharField(source='fp_types.first.fpt_client_type', read_only=True, allow_null=True)
#     subTypeOfClient = serializers.CharField(source='fp_types.first.fpt_subtype', read_only=True, allow_null=True)
#     reasonForFP = serializers.CharField(source='fp_types.first.fpt_reason_fp', read_only=True, allow_null=True)
#     otherReasonForFP = serializers.CharField(source='fp_types.first.fpt_other_reason_fp', read_only=True, allow_null=True)
#     reason = serializers.CharField(source='fp_types.first.fpt_reason', read_only=True, allow_null=True)
#     otherReason = serializers.CharField(source='fp_types.first.fpt_other_reason', read_only=True, allow_null=True)
#     methodCurrentlyUsed = serializers.CharField(source='fp_types.first.fpt_method_used', read_only=True, allow_null=True)
#     otherMethod = serializers.CharField(source='fp_types.first.fpt_other_method', read_only=True, allow_null=True)

#     # Medical History (FP_RiskSti, FP_RiskVaw etc. as JSONFields)
#     sexuallyTransmittedInfections = serializers.SerializerMethodField()
#     violenceAgainstWomen = serializers.SerializerMethodField()

#     # Physical Examination (FP_Physical_Exam)
#     skinExamination = serializers.CharField(source='fp_physical_exams.first.skin_exam', read_only=True, allow_null=True)
#     conjunctivaExamination = serializers.CharField(source='fp_physical_exams.first.conjunctiva_exam', read_only=True, allow_null=True)
#     neckExamination = serializers.CharField(source='fp_physical_exams.first.neck_exam', read_only=True, allow_null=True)
#     breastExamination = serializers.CharField(source='fp_physical_exams.first.breast_exam', read_only=True, allow_null=True)
#     abdomenExamination = serializers.CharField(source='fp_physical_exams.first.abdomen_exam', read_only=True, allow_null=True)
#     extremitiesExamination = serializers.CharField(source='fp_physical_exams.first.extremities_exam', read_only=True, allow_null=True)
    
#     # Vital Signs (from VitalSigns, linked to Patient)
#     bloodPressure = serializers.SerializerMethodField()
#     pulseRate = serializers.SerializerMethodField()

#     # Pelvic Exam (FP_Pelvic_Exam)
#     pelvicExamination = serializers.CharField(source='fp_pelvic_exams.first.pelvic_exam', read_only=True, allow_null=True)
#     cervicalConsistency = serializers.CharField(source='fp_pelvic_exams.first.cervical_consistency', read_only=True, allow_null=True)
#     cervicalTenderness = serializers.BooleanField(source='fp_pelvic_exams.first.cervical_tenderness', read_only=True, allow_null=True)
#     cervicalAdnexalMassTenderness = serializers.BooleanField(source='fp_pelvic_exams.first.cervical_adnexal_mass_tenderness', read_only=True, allow_null=True)
#     uterinePosition = serializers.CharField(source='fp_pelvic_exams.first.uterine_position', read_only=True, allow_null=True)
#     uterineDepth = serializers.DecimalField(source='fp_pelvic_exams.first.uterine_depth', max_digits=5, decimal_places=2, read_only=True, allow_null=True)

#     # Acknowledgement (FP_Acknowledgement)
#     acknowledgement = AcknowledgementSerializer(source='fp_acknowledgements.first', read_only=True, allow_null=True)

#     # Pregnancy Check (FP_pregnancy_check)
#     pregnancyCheck = FP_PregnancyCheckSerializer(source='fp_pregnancy_checks.first', read_only=True, allow_null=True)

#     # Service Provision Records (FP_Assessment_Record)
#     serviceProvisionRecords = FP_ServiceProvisionRecordSerializer(source='FP_Assessment_Records', many=True, read_only=True)


#     class Meta:
#         model = FP_Record
#         fields = (
#             'fprecord_id', 'clientID', 'fourps', 'plan_more_children', 'avg_monthly_income', 'occupation',
#             'pat_id', 'clientID', 'philhealthNo', 'nhts_status', 'numOfLivingChildren',
#             'planToHaveMoreChildren', 'averageMonthlyIncome', 'pantawid_4ps',
#             'personal_info', 'address', 'spouse', 'body_measurements', 'obstetricalHistory',
#             'typeOfClient', 'subTypeOfClient', 'reasonForFP', 'otherReasonForFP', 'reason', 'otherReason',
#             'methodCurrentlyUsed', 'otherMethod',
#             'sexuallyTransmittedInfections', 'violenceAgainstWomen',
#             'skinExamination', 'conjunctivaExamination', 'neckExamination', 'breastExamination',
#             'abdomenExamination', 'extremitiesExamination', 'bloodPressure', 'pulseRate',
#             'pelvicExamination', 'cervicalConsistency', 'cervicalTenderness', 'cervicalAdnexalMassTenderness',
#             'uterinePosition', 'uterineDepth',
#             'acknowledgement', 'pregnancyCheck', 'serviceProvisionRecords'
#         )

#     def get_address(self, obj):
#         if obj.pat and obj.pat.rp_id and obj.pat.rp_id.per:
#             personal_address = PersonalAddress.objects.filter(per=obj.pat.rp_id.per).first()
#             if personal_address and personal_address.add:
#                 return AddressForFpSerializer(personal_address.add).data
#         return None

#     def get_philhealthNo(self, obj):
#         if obj.hrd and obj.hrd.hrd_philhealth_id:
#             return obj.hrd.hrd_philhealth_id
#         return None

#     def get_nhts_status(self, obj):
#         if obj.pat and obj.pat.rp_id and obj.pat.rp_id.household_id and obj.pat.rp_id.household_id.hh_nhts is not None:
#              # Assuming hh_nhts stores boolean or string "Yes"/"No"
#             return obj.pat.rp_id.household_id.hh_nhts
#         return False # Default to False if no NHTS status is found

#     def get_body_measurements(self, obj):
#         # Fetch the latest body measurement for the patient linked to this FP record
#         latest_bm = BodyMeasurement.objects.filter(pat=obj.pat).order_by('-created_at').first()
#         if latest_bm:
#             return BodyMeasurementForFpSerializer(latest_bm).data
#         return None

#     def get_obstetricalHistory(self, obj):
#         # Fetch the latest obstetrical history from PatientRecord for the patient
#         # This gets the main obstetrical data (G, P, Living children etc.)
#         patient_record_inst = PatientRecord.objects.filter(pat=obj.pat).first()
#         if patient_record_inst:
#             latest_obs = Obstetrical_History.objects.filter(patrec=patient_record_inst).order_by('-created_at').first()
#             if latest_obs:
#                 return ObstetricalHistoryForFpSerializer(latest_obs).data
#         return None
    
#     def get_sexuallyTransmittedInfections(self, obj):
#         # Assuming sti_risk is a JSONField in FP_RiskSti
#         fp_risk_sti_instance = FP_RiskSti.objects.filter(fprecord=obj).first()
#         if fp_risk_sti_instance and fp_risk_sti_instance.sti_risk:
#             # Also include the discharge_from field if it's separate
#             data = fp_risk_sti_instance.sti_risk
#             data['dischargeFrom'] = fp_risk_sti_instance.discharge_from if hasattr(fp_risk_sti_instance, 'discharge_from') else None
#             return data
#         return {
#             'abnormalDischarge': False, 'dischargeFrom': None, 'sores': False,
#             'pain': False, 'history': False, 'hiv': False
#         } # Return default structure

#     def get_violenceAgainstWomen(self, obj):
#         # Assuming vaw_risk is a JSONField in FP_RiskVaw
#         fp_risk_vaw_instance = FP_RiskVaw.objects.filter(fprecord=obj).first()
#         if fp_risk_vaw_instance and fp_risk_vaw_instance.vaw_risk:
#             data = fp_risk_vaw_instance.vaw_risk
#             data['referredTo'] = fp_risk_vaw_instance.vaw_referral if hasattr(fp_risk_vaw_instance, 'vaw_referral') else None
#             return data
#         return {
#             'unpleasantRelationship': False, 'partnerDisapproval': False,
#             'domesticViolence': False, 'referredTo': None
#         } # Return default structure

#     def get_bloodPressure(self, obj):
#         latest_vs = VitalSigns.objects.filter(pat=obj.pat).order_by('-created_at').first()
#         if latest_vs and latest_vs.vs_bp_systolic is not None and latest_vs.vs_bp_diastolic is not None:
#             return f"{latest_vs.vs_bp_systolic}/{latest_vs.vs_bp_diastolic}"
#         return ""

#     def get_pulseRate(self, obj):
#         latest_vs = VitalSigns.objects.filter(pat=obj.pat).order_by('-created_at').first()
#         if latest_vs and latest_vs.vs_pulse_rate is not None:
#             return latest_vs.vs_pulse_rate
#         return 0


# # --- FamilyPlanningRecordCompositeSerializer for CREATE/UPDATE (Write-only) ---
# # This serializer handles the incoming data from the frontend and saves it to the backend models.
# # It uses a combination of direct field mapping and custom create/update logic.

# class FamilyPlanningRecordCompositeSerializer(serializers.Serializer):
#     """
#     Composite serializer for creating or updating a complete Family Planning record,
#     including nested related records.
#     """
#     # Unique ID for existing FP Record for updates
#     fprecord_id = serializers.IntegerField(required=False, allow_null=True)

#     # Patient Information (from FpPage1, used for Patient/Personal/Address/Spouse)
#     pat_id = serializers.CharField(required=True)
#     clientID = serializers.CharField(required=False, allow_blank=True) # clientID on FP_Record
#     philhealthNo = serializers.CharField(required=False, allow_blank=True) # hrd_philhealth_id on HealthRelatedDetails
#     nhts_status = serializers.BooleanField(default=False) # hh_nhts on Household (boolean converted from "Yes"/"No")
#     pantawid_4ps = serializers.BooleanField(default=False) # fourps on FP_Record
#     lastName = serializers.CharField(max_length=255)
#     givenName = serializers.CharField(max_length=255)
#     middleInitial = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     dateOfBirth = serializers.DateField()
#     age = serializers.IntegerField(read_only=True) # Age is derived on frontend or backend, not directly saved here

#     educationalAttainment = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     occupation = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     avg_monthly_income = serializers.CharField(max_length=15, required=False, allow_blank=True)
#     religion = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     ethnicity = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     contactNo = serializers.CharField(max_length=20, required=False, allow_blank=True)
#     isTransient = serializers.BooleanField(default=False) # To determine pat_type for Patient
    
#     # Address fields (nested, for creating/updating Address)
#     address = AddressForFpSerializer(required=False, allow_null=True)

#     # Spouse Information (nested, for creating/updating Spouse)
#     spouse = SpouseForFpSerializer(required=False, allow_null=True) # Use the SpouseForFpSerializer for write ops too

#     # Health-Related Details for Living Children and Plan (on HealthRelatedDetails/FP_Record)
#     numOfLivingChildren = serializers.IntegerField(required=False, allow_null=True) # hrd_no_living_children on HealthRelatedDetails
#     planToHaveMoreChildren = serializers.BooleanField(default=False) # plan_more_children on FP_Record

#     # FP Type (from FpPage1, for FP_type model)
#     typeOfClient = serializers.CharField(required=True)
#     subTypeOfClient = serializers.CharField(required=False, allow_blank=True) # fpt_subtype
#     reasonForFP = serializers.CharField(required=False, allow_blank=True) # fpt_reason_fp
#     otherReasonForFP = serializers.CharField(required=False, allow_blank=True) # fpt_other_reason_fp
#     reason = serializers.CharField(required=False, allow_blank=True) # fpt_reason
#     otherReason = serializers.CharField(required=False, allow_blank=True) # fpt_other_reason
#     methodCurrentlyUsed = serializers.CharField(required=True) # fpt_method_used
#     otherMethod = serializers.CharField(required=False, allow_blank=True) # fpt_other_method

#     # Medical History (from FpPage2, JSONField in FP_RiskSti or other model)
#     medicalHistory = serializers.JSONField(binary=False, required=False, allow_null=True)

#     # Obstetrical History (from FpPage2)
#     # Fields for patientrecords.models.Obstetrical_History
#     g_pregnancies = serializers.IntegerField(required=False, allow_null=True) # obs_gravida
#     p_pregnancies = serializers.IntegerField(required=False, allow_null=True) # obs_para
#     fullTerm = serializers.IntegerField(required=False, allow_null=True) # obs_fullterm
#     premature = serializers.IntegerField(required=False, allow_null=True) # obs_preterm
#     abortion = serializers.IntegerField(required=False, allow_null=True) # obs_abortion
#     livingChildren = serializers.IntegerField(required=False, allow_null=True) # obs_living_ch
    
#     # Fields for familyplanning.models.FP_Obstetrical_History
#     lastDeliveryDate = serializers.DateField(required=False, allow_null=True) # fpob_last_delivery
#     typeOfLastDelivery = serializers.CharField(max_length=255, required=False, allow_blank=True) # fpob_type_last_delivery
#     lastMenstrualPeriod = serializers.CharField(max_length=255, required=False, allow_blank=True) # fpob_last_period
#     previousMenstrualPeriod = serializers.CharField(max_length=255, required=False, allow_blank=True) # fpob_previous_period
#     menstrualFlow = serializers.CharField(max_length=255, required=False, allow_blank=True) # fpob_mens_flow
#     dysmenorrhea = serializers.BooleanField(default=False) # fpob_dysme
#     hydatidiformMole = serializers.BooleanField(default=False) # fpob_hydatidiform
#     ectopicPregnancyHistory = serializers.BooleanField(default=False) # fpob_ectopic_pregnancy

#     # Risk STI (from FpPage3, JSONField in FP_RiskSti)
#     sexuallyTransmittedInfections = serializers.JSONField(binary=False, required=False, allow_null=True)
    
#     # Risk VAW (from FpPage3, JSONField in FP_RiskVaw)
#     violenceAgainstWomen = serializers.JSONField(binary=False, required=False, allow_null=True)
#     vaw_referral = serializers.CharField(max_length=255, required=False, allow_blank=True) # vaw_referral on FP_RiskVaw

#     # Physical Exam (from FpPage4)
#     # Body Measurements (from FpPage4, for BodyMeasurement)
#     weight = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True) # body_weight
#     height = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True) # body_height
#     # BMI/category will be calculated or fetched from BMI model if separate
#     # bmi = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
#     # bmi_category = serializers.CharField(max_length=50, required=False, allow_blank=True)

#     # Vital Signs (from FpPage4, for VitalSigns)
#     bloodPressure = serializers.CharField(max_length=20, required=False, allow_blank=True) # vs_bp_systolic/diastolic
#     pulseRate = serializers.IntegerField(required=False, allow_null=True) # vs_pulse_rate
    
#     # Physical Exam specific fields (for FP_Physical_Exam)
#     skinExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     conjunctivaExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     neckExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     breastExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     abdomenExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     extremitiesExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)

#     # Pelvic Exam (from FpPage4, for FP_Pelvic_Exam)
#     pelvicExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     cervicalConsistency = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     cervicalTenderness = serializers.BooleanField(default=False)
#     cervicalAdnexalMassTenderness = serializers.BooleanField(default=False)
#     uterinePosition = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     uterineDepth = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)

#     # Acknowledgement (from FpPage5, for FP_Acknowledgement)
#     client_signature = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     client_signature_date = serializers.DateField(required=False, allow_null=True)
#     # clientName will be derived from patient info
#     guardian_signature = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     guardian_signature_date = serializers.DateField(required=False, allow_null=True)
#     selectedMethod = serializers.CharField(max_length=255, required=False, allow_blank=True) # ack_method_selected
#     guardianName = serializers.CharField(max_length=255, required=False, allow_blank=True) # New field to save guardian name

#     # Pregnancy Check (from FpPage6, for FP_pregnancy_check)
#     breastfeeding = serializers.BooleanField(default=False)
#     abstained = serializers.BooleanField(default=False)
#     recent_baby = serializers.BooleanField(default=False)
#     recent_period = serializers.BooleanField(default=False)
#     recent_abortion = serializers.BooleanField(default=False)
#     using_contraceptive = serializers.BooleanField(default=False)

#     # Service Provision Records (from FpPage6 - list of dictionaries, for FP_Assessment_Record)
#     serviceProvisionRecords = serializers.ListField(
#         child=serializers.DictField(), write_only=True, required=False
#     )

#     # Assessment Record related fields (for FP_Assessment_Record and related models like FollowUpVisit, InventoryDeduction)
#     staff_id = serializers.IntegerField(required=False, allow_null=True)
#     follow_up_visit_date = serializers.DateField(required=False, allow_null=True)
#     follow_up_visit_remarks = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     dispensed_commodity_item_id = serializers.IntegerField(required=False, allow_null=True)
#     dispensed_medicine_item_id = serializers.IntegerField(required=False, allow_null=True)
#     dispensed_vaccine_item_id = serializers.IntegerField(required=False, allow_null=True)
#     dispensed_item_name_for_report = serializers.CharField(max_length=255, required=False, allow_blank=True)


#     def create(self, validated_data):
#         with transaction.atomic():
#             # --- 1. Patient, Personal, Address, Spouse, HealthRelatedDetails, Household ---
#             pat_id = validated_data.pop('pat_id')
#             personal_data = {
#                 'per_fname': validated_data.pop('givenName'),
#                 'per_mname': validated_data.pop('middleInitial', ''),
#                 'per_lname': validated_data.pop('lastName'),
#                 'per_dob': validated_data.pop('dateOfBirth'),
#                 'per_age': validated_data.pop('age', None), # This is read_only on FE, but if sent, handle
#                 'per_philhealth': validated_data.pop('philhealthNo', ''),
#                 'per_education': validated_data.pop('educationalAttainment', ''),
#                 'per_occupation': validated_data.pop('occupation', ''),
#                 'per_religion': validated_data.pop('religion', ''),
#                 'per_ethnicity': validated_data.pop('ethnicity', ''),
#                 'per_contact_no': validated_data.pop('contactNo', ''),
#                 'per_is_transient': validated_data.pop('isTransient', False),
#                 # Add per_sex here if available in FormData
#                 'per_sex': validated_data.pop('sex', '') # Assuming 'sex' field is present in validated_data
#             }
            
#             # Check for existing Personal record and update/create
#             personal_instance, created = Personal.objects.update_or_create(
#                 per_fname=personal_data['per_fname'],
#                 per_lname=personal_data['per_lname'],
#                 per_dob=personal_data['per_dob'],
#                 defaults=personal_data # Update other fields if existing
#             )

#             # Create or get ResidentProfile (if patient type is Resident)
#             resident_profile_instance = None
#             if not personal_data['per_is_transient']: # If not transient, it's a resident
#                 resident_profile_instance, rp_created = ResidentProfile.objects.update_or_create(
#                     per=personal_instance,
#                     defaults={'rp_status': 'active'} # Set a default status
#                 )
#                 # Link ResidentProfile to Household if data exists
#                 household_instance = None
#                 nhts_status_frontend = validated_data.pop('nhts_status', False) # Boolean from frontend
#                 if resident_profile_instance:
#                     household_instance, hh_created = Household.objects.update_or_create(
#                         rp=resident_profile_instance, # Link to ResidentProfile
#                         defaults={'hh_nhts': 'Yes' if nhts_status_frontend else 'No'} # Store as "Yes"/"No"
#                     )


#             # Update or create Patient instance
#             # Use pat_id from frontend if provided, otherwise assume new patient or find by personal info
#             patient_instance, created = Patient.objects.update_or_create(
#                 pat_id=pat_id, # Frontend generated pat_id
#                 defaults={
#                     'personal_info': personal_instance, # Link to Personal (deprecated, use rp_id)
#                     'rp_id': resident_profile_instance, # Link to ResidentProfile
#                     'pat_type': 'Transient' if personal_data['per_is_transient'] else 'Resident',
#                     'clientID': validated_data.pop('clientID', ''), # From FP record
#                 }
#             )

#             # Address: Update or create based on personal_instance
#             address_data = validated_data.pop('address', {})
#             if address_data and personal_instance:
#                 address_instance, addr_created = Address.objects.update_or_create(
#                     add_street=address_data.get('street'), # Assuming street + barangay as unique
#                     add_barangay=address_data.get('barangay'),
#                     defaults={
#                         'add_houseno': address_data.get('houseNumber'),
#                         'add_city': address_data.get('municipality'),
#                         'add_province': address_data.get('province'),
#                     }
#                 )
#                 PersonalAddress.objects.update_or_create(per=personal_instance, add=address_instance)


#             # Spouse: Update or create based on resident_profile_instance
#             spouse_data = validated_data.pop('spouse', {})
#             spouse_instance = None
#             if spouse_data and resident_profile_instance:
#                 spouse_instance, spouse_created = Spouse.objects.update_or_create(
#                     rp=resident_profile_instance, # Link to ResidentProfile
#                     defaults={
#                         'spouse_fname': spouse_data.get('s_givenName'),
#                         'spouse_mname': spouse_data.get('s_middleInitial'),
#                         'spouse_lname': spouse_data.get('s_lastName'),
#                         'spouse_dob': spouse_data.get('s_dateOfBirth'),
#                         'spouse_occupation': spouse_data.get('s_occupation'),
#                         'spouse_contact_no': spouse_data.get('s_contactNo'),
#                     }
#                 )

#             # HealthRelatedDetails: Update or create based on personal_instance
#             hrd_instance, hrd_created = HealthRelatedDetails.objects.update_or_create(
#                 per=personal_instance,
#                 defaults={
#                     'hrd_philhealth_id': validated_data.pop('philhealthNo', ''),
#                     'hrd_no_children': validated_data.pop('number_of_children', None), # This was in old FP_Record, moved here
#                     'hrd_no_living_children': validated_data.pop('numOfLivingChildren', None),
#                 }
#             )

#             # --- 2. Create PatientRecord instance ---
#             patient_record_instance, patient_rec_created = PatientRecord.objects.update_or_create(
#                 pat=patient_instance, # Link to patient
#                 patrec_type='Family Planning',
#                 defaults={'patrec_status': 'active'} # Default status
#             )

#             # --- 3. Create or Update FP_Record ---
#             fp_record_data = {
#                 'clientID': validated_data.pop('clientID', ''),
#                 'fourps': validated_data.pop('pantawid_4ps', False),
#                 'plan_more_children': validated_data.pop('planToHaveMoreChildren', False),
#                 'avg_monthly_income': validated_data.pop('averageMonthlyIncome', '0'),
#                 'occupation': validated_data.pop('occupation', ''), # From personal info
#                 'hrd': hrd_instance, # Link HRD
#                 'patrec': patient_record_instance, # Link PatientRecord
#                 'spouse': spouse_instance, # Link Spouse
#                 'pat': patient_instance, # Link Patient
#             }
            
#             fp_record_instance, fp_rec_created = FP_Record.objects.update_or_create(
#                 fprecord_id=validated_data.pop('fprecord_id', None), # Use fprecord_id if provided for update
#                 defaults=fp_record_data
#             )


#             # --- 4. Create/Update Nested FP-specific records ---

#             # FP_type
#             fp_type_data = {
#                 'fpt_client_type': validated_data.pop('typeOfClient'),
#                 'fpt_subtype': validated_data.pop('subTypeOfClient', ''),
#                 'fpt_reason_fp': validated_data.pop('reasonForFP', ''),
#                 'fpt_other_reason_fp': validated_data.pop('otherReasonForFP', ''),
#                 'fpt_reason': validated_data.pop('reason', ''),
#                 'fpt_other_reason': validated_data.pop('otherReason', ''),
#                 'fpt_method_used': validated_data.pop('methodCurrentlyUsed'),
#                 'fpt_other_method': validated_data.pop('otherMethod', ''),
#             }
#             FP_type.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_type_data)

#             # Medical History (from FormData.medicalHistory -> FP_Medical_History)
#             # Assuming medicalHistory is now a JSONField on FP_RiskSti or a new model
#             # Based on your previous models.py, medicalHistory was part of FP_RiskSti via sti_risk.
#             # Let's assume it's still intended for a MedicalHistory model.
#             # If medicalHistory is a JSON field directly on FP_Record, then update FP_Record.
#             # If it's a separate MedicalHistory model, ensure it's imported and link it here.
#             # For now, I'll place it here assuming you might have a MedicalHistory model.
#             # If it's part of FP_RiskSti's JSONField, it would be handled when processing FP_RiskSti.
#             # *** Assuming medicalHistory is a distinct model for now, if not, adjust. ***
#             # Example if FP_Medical_History model exists:
#             # medical_history_instance, created = FP_Medical_History.objects.update_or_create(
#             #     fprecord=fp_record_instance,
#             #     defaults=validated_data.pop('medicalHistory', {}) # Pass dictionary directly
#             # )
#             # If medicalHistory is stored directly on FP_Record as a JSONField:
#             # fp_record_instance.medical_history = validated_data.pop('medicalHistory', {})
#             # fp_record_instance.save()


#             # Obstetrical History (patientrecords.models.Obstetrical_History)
#             # This is the G, P, Full Term etc. part.
#             obs_history_patient_data = {
#                 'obs_gravida': validated_data.pop('g_pregnancies', None),
#                 'obs_para': validated_data.pop('p_pregnancies', None),
#                 'obs_fullterm': validated_data.pop('fullTerm', None),
#                 'obs_preterm': validated_data.pop('premature', None),
#                 'obs_abortion': validated_data.pop('abortion', None),
#                 'obs_living_ch': validated_data.pop('livingChildren', None),
#             }
#             # Find existing or create new Obstetrical_History linked to PatientRecord
#             obs_history_patient_instance, obs_patient_created = Obstetrical_History.objects.update_or_create(
#                 patrec=patient_record_instance, # Link to PatientRecord
#                 defaults=obs_history_patient_data
#             )


#             # FP_Obstetrical_History (familyplanning.models.FP_Obstetrical_History)
#             # This is the last delivery date, menstrual period etc. part.
#             fp_obstetrical_history_data = {
#                 'fpob_last_delivery': validated_data.pop('lastDeliveryDate', None),
#                 'fpob_type_last_delivery': validated_data.pop('typeOfLastDelivery', ''),
#                 'fpob_last_period': validated_data.pop('lastMenstrualPeriod', ''),
#                 'fpob_previous_period': validated_data.pop('previousMenstrualPeriod', ''),
#                 'fpob_mens_flow': validated_data.pop('menstrualFlow', 'Scanty'),
#                 'fpob_dysme': validated_data.pop('dysmenorrhea', False),
#                 'fpob_hydatidiform': validated_data.pop('hydatidiformMole', False),
#                 'fpob_ectopic_pregnancy': validated_data.pop('ectopicPregnancyHistory', False),
#             }
#             FP_Obstetrical_History.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_obstetrical_history_data)

#             # FP_RiskSti
#             fp_risk_sti_data = validated_data.pop('sexuallyTransmittedInfections', {})
#             # Ensure dischargeFrom is handled if exists on model
#             discharge_from = fp_risk_sti_data.pop('dischargeFrom', None)
#             FP_RiskSti.objects.update_or_create(
#                 fprecord=fp_record_instance,
#                 defaults={
#                     'sti_risk': fp_risk_sti_data, # Save the rest as JSON
#                     'discharge_from': discharge_from # Save the specific field
#                 }
#             )

#             # FP_RiskVaw
#             fp_risk_vaw_data = validated_data.pop('violenceAgainstWomen', {})
#             vaw_referral = validated_data.pop('vaw_referral', '') # This field exists separately in FD
#             FP_RiskVaw.objects.update_or_create(
#                 fprecord=fp_record_instance,
#                 defaults={
#                     'vaw_risk': fp_risk_vaw_data, # Save the rest as JSON
#                     'vaw_referral': vaw_referral
#                 }
#             )

#             # Body Measurements (for BodyMeasurement) - latest for patient
#             weight = validated_data.pop('weight', None)
#             height = validated_data.pop('height', None)
            
#             body_measurement_instance = BodyMeasurement.objects.filter(pat=patient_instance).order_by('-created_at').first()
#             if body_measurement_instance:
#                 # Update existing record if found
#                 body_measurement_instance.body_weight = weight
#                 body_measurement_instance.body_height = height
#                 # Calculate BMI here if not passed from frontend
#                 # body_measurement_instance.bmi = calculate_bmi(weight, height)
#                 body_measurement_instance.save()
#             elif weight is not None or height is not None:
#                 # Create new record if none exists or if new values are provided
#                 body_measurement_instance = BodyMeasurement.objects.create(
#                     pat=patient_instance,
#                     body_weight=weight,
#                     body_height=height,
#                     # bmi=calculate_bmi(weight, height) if weight and height else None,
#                     # bmi_category=get_bmi_category(...)
#                 )

#             # Vital Signs (for VitalSigns) - latest for patient
#             blood_pressure = validated_data.pop('bloodPressure', '')
#             pulse_rate = validated_data.pop('pulseRate', None)
            
#             systolic_bp, diastolic_bp = None, None
#             if blood_pressure and '/' in blood_pressure:
#                 try:
#                     systolic_bp, diastolic_bp = map(int, blood_pressure.split('/'))
#                 except ValueError:
#                     pass # Keep as None if parsing fails

#             vital_signs_instance = VitalSigns.objects.filter(pat=patient_instance).order_by('-created_at').first()
#             if vital_signs_instance:
#                 vital_signs_instance.vs_bp_systolic = systolic_bp
#                 vital_signs_instance.vs_bp_diastolic = diastolic_bp
#                 vital_signs_instance.vs_pulse_rate = pulse_rate
#                 vital_signs_instance.save()
#             elif systolic_bp is not None or diastolic_bp is not None or pulse_rate is not None:
#                  vital_signs_instance = VitalSigns.objects.create(
#                     pat=patient_instance,
#                     vs_bp_systolic=systolic_bp,
#                     vs_bp_diastolic=diastolic_bp,
#                     vs_pulse_rate=pulse_rate
#                 )

#             # FP_Physical_Exam
#             fp_physical_exam_data = {
#                 'skin_exam': validated_data.pop('skinExamination', ''),
#                 'conjunctiva_exam': validated_data.pop('conjunctivaExamination', ''),
#                 'neck_exam': validated_data.pop('neckExamination', ''),
#                 'breast_exam': validated_data.pop('breastExamination', ''),
#                 'abdomen_exam': validated_data.pop('abdomenExamination', ''),
#                 'extremities_exam': validated_data.pop('extremitiesExamination', ''),
#             }
#             FP_Physical_Exam.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_physical_exam_data)

#             # FP_Pelvic_Exam
#             # Only create/update if method is IUD-related
#             method_used = validated_data.get('methodCurrentlyUsed')
#             is_iud_selected = method_used in ["iud-interval", "iud-postpartum", "IUD-Interval", "IUD-Post Partum"]

#             if is_iud_selected:
#                 fp_pelvic_exam_data = {
#                     'pelvic_exam': validated_data.pop('pelvicExamination', ''),
#                     'cervical_consistency': validated_data.pop('cervicalConsistency', ''),
#                     'cervical_tenderness': validated_data.pop('cervicalTenderness', False),
#                     'cervical_adnexal_mass_tenderness': validated_data.pop('cervicalAdnexalMassTenderness', False),
#                     'uterine_position': validated_data.pop('uterinePosition', ''),
#                     'uterine_depth': validated_data.pop('uterineDepth', None),
#                 }
#                 FP_Pelvic_Exam.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_pelvic_exam_data)
#             else:
#                 # If IUD is not selected, ensure no pelvic exam data is saved for this FP_Record
#                 FP_Pelvic_Exam.objects.filter(fprecord=fp_record_instance).delete()


#             # FP_Acknowledgement
#             fp_acknowledgement_data = {
#                 'client_signature': validated_data.pop('client_signature', ''),
#                 'client_signature_date': validated_data.pop('client_signature_date', None),
#                 'client_name': validated_data.pop('clientName', ''), # Assuming clientName is passed from frontend
#                 'guardian_signature': validated_data.pop('guardian_signature', ''),
#                 'guardian_signature_date': validated_data.pop('guardian_signature_date', None),
#                 'ack_method_selected': validated_data.pop('selectedMethod', None),
#                 'guardian_name': validated_data.pop('guardianName', ''),
#             }
#             FP_Acknowledgement.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_acknowledgement_data)

#             # FP_pregnancy_check
#             fp_pregnancy_check_data = {
#                 'breastfeeding': validated_data.pop('breastfeeding', False),
#                 'abstained': validated_data.pop('abstained', False),
#                 'recent_baby': validated_data.pop('recent_baby', False),
#                 'recent_period': validated_data.pop('recent_period', False),
#                 'recent_abortion': validated_data.pop('recent_abortion', False),
#                 'using_contraceptive': validated_data.pop('using_contraceptive', False),
#             }
#             FP_pregnancy_check.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_pregnancy_check_data)

#             # FP_Assessment_Record (List of records)
#             service_provision_records_data = validated_data.pop('serviceProvisionRecords', [])
#             # Delete existing service provision records for this FP_Record to handle updates/deletions
#             FP_Assessment_Record.objects.filter(fprecord=fp_record_instance).delete()
#             for record_data in service_provision_records_data:
#                 FP_Assessment_Record.objects.create(fprecord=fp_record_instance, **record_data)

#             # FP_Assessment_Record (and related FollowUpVisit, InventoryDeduction)
#             staff_id = validated_data.pop('staff_id', None)
#             follow_up_visit_date = validated_data.pop('follow_up_visit_date', None)
#             follow_up_visit_remarks = validated_data.pop('follow_up_visit_remarks', '')
#             dispensed_commodity_item_id = validated_data.pop('dispensed_commodity_item_id', None)
#             dispensed_medicine_item_id = validated_data.pop('dispensed_medicine_item_id', None)
#             dispensed_vaccine_item_id = validated_data.pop('dispensed_vaccine_item_id', None)
#             dispensed_item_name_for_report = validated_data.pop('dispensed_item_name_for_report', '')

#             staff_instance = Staff.objects.filter(staff_id=staff_id).first()
#             followv_instance = None
#             if follow_up_visit_date:
#                 # Update or create FollowUpVisit for the patient record
#                 followv_instance, created = FollowUpVisit.objects.update_or_create(
#                     patrec=patient_record_instance, # Link to the patient record
#                     visit_date=follow_up_visit_date,
#                     defaults={'remarks': follow_up_visit_remarks}
#                 )

#             dispensed_commodity = CommodityList.objects.filter(commodity_id=dispensed_commodity_item_id).first()
#             dispensed_medicine = Medicinelist.objects.filter(medicine_id=dispensed_medicine_item_id).first()
#             dispensed_vaccine = VaccineList.objects.filter(vaccine_id=dispensed_vaccine_item_id).first()

#             inventory_deduction_ref = None
#             if dispensed_commodity or dispensed_medicine or dispensed_vaccine:
#                 inventory_deduction_ref = Inventory.objects.create(
#                     # item=..., quantity=...,
#                     # For now, just a placeholder if model allows empty creation
#                 )

#             # Update or create FP_Assessment_Record
#             # Assuming one FP_Assessment_Record per FP_Record
#             FP_Assessment_Record.objects.update_or_create(
#                 fprecord=fp_record_instance,
#                 defaults={
#                     'fpt': FP_type.objects.get(fprecord=fp_record_instance), # Ensure FP_type exists
#                     'bm': body_measurement_instance, # Link body measurement
#                     'vital_signs': vital_signs_instance, # Link vital signs
#                     'staff': staff_instance,
#                     'followv': followv_instance,
#                     'dispensed_commodity_item': dispensed_commodity,
#                     'dispensed_medicine_item': dispensed_medicine,
#                     'dispensed_vaccine_item': dispensed_vaccine,
#                     'dispensed_item_name_for_report': dispensed_item_name_for_report,
#                     'inventory_deduction_ref': inventory_deduction_ref,
#                 }
#             )

#             return fp_record_instance

#     def update(self, instance, validated_data):
#         # This update logic will mirror the create logic but focuses on updating existing records
#         with transaction.atomic():
#             fp_record_instance = instance # The existing FP_Record instance

#             # --- 1. Update Patient, Personal, Address, Spouse, HealthRelatedDetails, Household ---
#             # Get existing instances based on relationships from fp_record_instance
#             patient_instance = fp_record_instance.pat
#             patient_record_instance = fp_record_instance.patrec
#             hrd_instance = fp_record_instance.hrd
#             spouse_instance = fp_record_instance.spouse # Can be None
            
#             personal_instance = None
#             if patient_instance and patient_instance.rp_id and patient_instance.rp_id.per:
#                 personal_instance = patient_instance.rp_id.per
#             elif patient_instance and patient_instance.personal_info: # Fallback for older Patient model
#                 personal_instance = patient_instance.personal_info

#             # Update Personal fields
#             if personal_instance:
#                 personal_instance.per_fname = validated_data.pop('givenName', personal_instance.per_fname)
#                 personal_instance.per_mname = validated_data.pop('middleInitial', personal_instance.per_mname)
#                 personal_instance.per_lname = validated_data.pop('lastName', personal_instance.per_lname)
#                 personal_instance.per_dob = validated_data.pop('dateOfBirth', personal_instance.per_dob)
#                 personal_instance.per_age = validated_data.pop('age', personal_instance.per_age)
#                 personal_instance.per_philhealth = validated_data.pop('philhealthNo', personal_instance.per_philhealth)
#                 personal_instance.per_education = validated_data.pop('educationalAttainment', personal_instance.per_education)
#                 personal_instance.per_occupation = validated_data.pop('occupation', personal_instance.per_occupation)
#                 personal_instance.per_religion = validated_data.pop('religion', personal_instance.per_religion)
#                 personal_instance.per_ethnicity = validated_data.pop('ethnicity', personal_instance.per_ethnicity)
#                 personal_instance.per_contact_no = validated_data.pop('contactNo', personal_instance.per_contact_no)
#                 personal_instance.per_is_transient = validated_data.pop('isTransient', personal_instance.per_is_transient)
#                 personal_instance.per_sex = validated_data.pop('sex', personal_instance.per_sex)
#                 personal_instance.save()

#             # Update ResidentProfile and Household (if resident)
#             resident_profile_instance = patient_instance.rp_id if patient_instance else None
#             if resident_profile_instance:
#                 # Update ResidentProfile status or other fields if needed
#                 resident_profile_instance.save()

#                 household_instance = Household.objects.filter(rp=resident_profile_instance).first()
#                 nhts_status_frontend = validated_data.pop('nhts_status', household_instance.hh_nhts == 'Yes' if household_instance else False)
#                 if household_instance:
#                     household_instance.hh_nhts = 'Yes' if nhts_status_frontend else 'No'
#                     household_instance.save()
#                 else: # Create if it didn't exist
#                     Household.objects.create(rp=resident_profile_instance, hh_nhts='Yes' if nhts_status_frontend else 'No')

#             # Update Patient instance
#             if patient_instance:
#                 patient_instance.clientID = validated_data.pop('clientID', patient_instance.clientID)
#                 patient_instance.pat_type = 'Transient' if validated_data.pop('isTransient', patient_instance.pat_type == 'Transient') else 'Resident'
#                 patient_instance.save()

#             # Update Address
#             address_data = validated_data.pop('address', {})
#             if address_data and personal_instance:
#                 personal_address = PersonalAddress.objects.filter(per=personal_instance).first()
#                 if personal_address and personal_address.add:
#                     address_instance = personal_address.add
#                     address_instance.add_houseno = address_data.get('houseNumber', address_instance.add_houseno)
#                     address_instance.add_street = address_data.get('street', address_instance.add_street)
#                     address_instance.add_barangay = address_data.get('barangay', address_instance.add_barangay)
#                     address_instance.add_city = address_data.get('municipality', address_instance.add_city)
#                     address_instance.add_province = address_data.get('province', address_instance.add_province)
#                     address_instance.save()
#                 elif address_data.get('street') or address_data.get('barangay'): # Create if none exists
#                     address_instance = Address.objects.create(
#                         add_houseno=address_data.get('houseNumber'),
#                         add_street=address_data.get('street'),
#                         add_barangay=address_data.get('barangay'),
#                         add_city=address_data.get('municipality'),
#                         add_province=address_data.get('province'),
#                     )
#                     PersonalAddress.objects.create(per=personal_instance, add=address_instance)


#             # Update Spouse
#             spouse_data = validated_data.pop('spouse', {})
#             if spouse_instance: # If spouse already exists, update
#                 spouse_instance.spouse_fname = spouse_data.get('s_givenName', spouse_instance.spouse_fname)
#                 spouse_instance.spouse_mname = spouse_data.get('s_middleInitial', spouse_instance.spouse_mname)
#                 spouse_instance.spouse_lname = spouse_data.get('s_lastName', spouse_instance.spouse_lname)
#                 spouse_instance.spouse_dob = spouse_data.get('s_dateOfBirth', spouse_instance.spouse_dob)
#                 spouse_instance.spouse_occupation = spouse_data.get('s_occupation', spouse_instance.spouse_occupation)
#                 spouse_instance.spouse_contact_no = spouse_data.get('s_contactNo', spouse_instance.spouse_contact_no)
#                 spouse_instance.save()
#             elif spouse_data and resident_profile_instance: # Create if spouse data is provided and no existing spouse
#                 Spouse.objects.create(
#                     rp=resident_profile_instance,
#                     spouse_fname=spouse_data.get('s_givenName'),
#                     spouse_mname=spouse_data.get('s_middleInitial'),
#                     spouse_lname=spouse_data.get('s_lastName'),
#                     spouse_dob=spouse_data.get('s_dateOfBirth'),
#                     spouse_occupation=spouse_data.get('s_occupation'),
#                     spouse_contact_no=spouse_data.get('s_contactNo'),
#                 )

#             # Update HealthRelatedDetails
#             if hrd_instance:
#                 hrd_instance.hrd_philhealth_id = validated_data.pop('philhealthNo', hrd_instance.hrd_philhealth_id)
#                 hrd_instance.hrd_no_children = validated_data.pop('number_of_children', hrd_instance.hrd_no_children)
#                 hrd_instance.hrd_no_living_children = validated_data.pop('numOfLivingChildren', hrd_instance.hrd_no_living_children)
#                 hrd_instance.save()
#             elif personal_instance: # Create HRD if it didn't exist but personal_instance does
#                 HealthRelatedDetails.objects.create(
#                     per=personal_instance,
#                     hrd_philhealth_id=validated_data.pop('philhealthNo', ''),
#                     hrd_no_children=validated_data.pop('number_of_children', None),
#                     hrd_no_living_children=validated_data.pop('numOfLivingChildren', None),
#                 )

#             # Update PatientRecord (if needed, usually static 'Family Planning')
#             if patient_record_instance:
#                 patient_record_instance.save()

#             # Update FP_Record fields
#             fp_record_instance.clientID = validated_data.pop('clientID', fp_record_instance.clientID)
#             fp_record_instance.fourps = validated_data.pop('pantawid_4ps', fp_record_instance.fourps)
#             fp_record_instance.plan_more_children = validated_data.pop('planToHaveMoreChildren', fp_record_instance.plan_more_children)
#             fp_record_instance.avg_monthly_income = validated_data.pop('averageMonthlyIncome', fp_record_instance.avg_monthly_income)
#             fp_record_instance.occupation = validated_data.pop('occupation', fp_record_instance.occupation)
#             fp_record_instance.save()

#             # --- Update Nested FP-specific records ---
#             # For each related FP model, get the existing instance and update, or create if not found.

#             # FP_type
#             fp_type_data = {
#                 'fpt_client_type': validated_data.pop('typeOfClient'),
#                 'fpt_subtype': validated_data.pop('subTypeOfClient', ''),
#                 'fpt_reason_fp': validated_data.pop('reasonForFP', ''),
#                 'fpt_other_reason_fp': validated_data.pop('otherReasonForFP', ''),
#                 'fpt_reason': validated_data.pop('reason', ''),
#                 'fpt_other_reason': validated_data.pop('otherReason', ''),
#                 'fpt_method_used': validated_data.pop('methodCurrentlyUsed'),
#                 'fpt_other_method': validated_data.pop('otherMethod', ''),
#             }
#             fp_type_instance, created = FP_type.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_type_data)
            

#             # Medical History (If FP_Medical_History model exists)
#             # Example if FP_Medical_History model exists:
#             # medical_history_instance, created = FP_Medical_History.objects.update_or_create(
#             #     fprecord=fp_record_instance,
#             #     defaults=validated_data.pop('medicalHistory', {}) # Pass dictionary directly
#             # )

#             # Obstetrical History (patientrecords.models.Obstetrical_History)
#             obs_history_patient_data = {
#                 'obs_gravida': validated_data.pop('g_pregnancies', None),
#                 'obs_para': validated_data.pop('p_pregnancies', None),
#                 'obs_fullterm': validated_data.pop('fullTerm', None),
#                 'obs_preterm': validated_data.pop('premature', None),
#                 'obs_abortion': validated_data.pop('abortion', None),
#                 'obs_living_ch': validated_data.pop('livingChildren', None),
#             }
#             # Update existing or create if patient record has no obstetrical history yet
#             obs_history_patient_instance, obs_patient_created = Obstetrical_History.objects.update_or_create(
#                 patrec=patient_record_instance, # Link to PatientRecord
#                 defaults=obs_history_patient_data
#             )

#             # FP_Obstetrical_History (familyplanning.models.FP_Obstetrical_History)
#             fp_obstetrical_history_data = {
#                 'fpob_last_delivery': validated_data.pop('lastDeliveryDate', None),
#                 'fpob_type_last_delivery': validated_data.pop('typeOfLastDelivery', ''),
#                 'fpob_last_period': validated_data.pop('lastMenstrualPeriod', ''),
#                 'fpob_previous_period': validated_data.pop('previousMenstrualPeriod', ''),
#                 'fpob_mens_flow': validated_data.pop('menstrualFlow', 'Scanty'),
#                 'fpob_dysme': validated_data.pop('dysmenorrhea', False),
#                 'fpob_hydatidiform': validated_data.pop('hydatidiformMole', False),
#                 'fpob_ectopic_pregnancy': validated_data.pop('ectopicPregnancyHistory', False),
#             }
#             FP_Obstetrical_History.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_obstetrical_history_data)

#             # FP_RiskSti
#             fp_risk_sti_data = validated_data.pop('sexuallyTransmittedInfections', {})
#             discharge_from = fp_risk_sti_data.pop('dischargeFrom', None)
#             FP_RiskSti.objects.update_or_create(
#                 fprecord=fp_record_instance,
#                 defaults={
#                     'sti_risk': fp_risk_sti_data,
#                     'discharge_from': discharge_from
#                 }
#             )

#             # FP_RiskVaw
#             fp_risk_vaw_data = validated_data.pop('violenceAgainstWomen', {})
#             vaw_referral = validated_data.pop('vaw_referral', '')
#             FP_RiskVaw.objects.update_or_create(
#                 fprecord=fp_record_instance,
#                 defaults={
#                     'vaw_risk': fp_risk_vaw_data,
#                     'vaw_referral': vaw_referral
#                 }
#             )

#             # Body Measurements (for BodyMeasurement)
#             weight = validated_data.pop('weight', None)
#             height = validated_data.pop('height', None)
            
#             body_measurement_instance = BodyMeasurement.objects.filter(pat=patient_instance).order_by('-created_at').first()
#             if body_measurement_instance:
#                 body_measurement_instance.body_weight = weight
#                 body_measurement_instance.body_height = height
#                 body_measurement_instance.save()
#             elif weight is not None or height is not None:
#                 BodyMeasurement.objects.create(
#                     pat=patient_instance,
#                     body_weight=weight,
#                     body_height=height,
#                 )

#             # Vital Signs (for VitalSigns)
#             blood_pressure = validated_data.pop('bloodPressure', '')
#             pulse_rate = validated_data.pop('pulseRate', None)
            
#             systolic_bp, diastolic_bp = None, None
#             if blood_pressure and '/' in blood_pressure:
#                 try:
#                     systolic_bp, diastolic_bp = map(int, blood_pressure.split('/'))
#                 except ValueError:
#                     pass

#             vital_signs_instance = VitalSigns.objects.filter(pat=patient_instance).order_by('-created_at').first()
#             if vital_signs_instance:
#                 vital_signs_instance.vs_bp_systolic = systolic_bp
#                 vital_signs_instance.vs_bp_diastolic = diastolic_bp
#                 vital_signs_instance.vs_pulse_rate = pulse_rate
#                 vital_signs_instance.save()
#             elif systolic_bp is not None or diastolic_bp is not None or pulse_rate is not None:
#                  VitalSigns.objects.create(
#                     pat=patient_instance,
#                     vs_bp_systolic=systolic_bp,
#                     vs_bp_diastolic=diastolic_bp,
#                     vs_pulse_rate=pulse_rate
#                 )

#             # FP_Physical_Exam
#             fp_physical_exam_data = {
#                 'skin_exam': validated_data.pop('skinExamination', ''),
#                 'conjunctiva_exam': validated_data.pop('conjunctivaExamination', ''),
#                 'neck_exam': validated_data.pop('neckExamination', ''),
#                 'breast_exam': validated_data.pop('breastExamination', ''),
#                 'abdomen_exam': validated_data.pop('abdomenExamination', ''),
#                 'extremities_exam': validated_data.pop('extremitiesExamination', ''),
#             }
#             FP_Physical_Exam.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_physical_exam_data)

#             # FP_Pelvic_Exam
#             method_used = validated_data.get('methodCurrentlyUsed')
#             is_iud_selected = method_used in ["iud-interval", "iud-postpartum", "IUD-Interval", "IUD-Post Partum"]

#             if is_iud_selected:
#                 fp_pelvic_exam_data = {
#                     'pelvic_exam': validated_data.pop('pelvicExamination', ''),
#                     'cervical_consistency': validated_data.pop('cervicalConsistency', ''),
#                     'cervical_tenderness': validated_data.pop('cervicalTenderness', False),
#                     'cervical_adnexal_mass_tenderness': validated_data.pop('cervicalAdnexalMassTenderness', False),
#                     'uterine_position': validated_data.pop('uterinePosition', ''),
#                     'uterine_depth': validated_data.pop('uterineDepth', None),
#                 }
#                 FP_Pelvic_Exam.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_pelvic_exam_data)
#             else:
#                 FP_Pelvic_Exam.objects.filter(fprecord=fp_record_instance).delete()


#             # FP_Acknowledgement
#             fp_acknowledgement_data = {
#                 'client_signature': validated_data.pop('client_signature', ''),
#                 'client_signature_date': validated_data.pop('client_signature_date', None),
#                 'client_name': validated_data.pop('clientName', ''),
#                 'guardian_signature': validated_data.pop('guardian_signature', ''),
#                 'guardian_signature_date': validated_data.pop('guardian_signature_date', None),
#                 'ack_method_selected': validated_data.pop('selectedMethod', None),
#                 'guardian_name': validated_data.pop('guardianName', ''),
#             }
#             FP_Acknowledgement.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_acknowledgement_data)

#             # FP_pregnancy_check
#             fp_pregnancy_check_data = {
#                 'breastfeeding': validated_data.pop('breastfeeding', False),
#                 'abstained': validated_data.pop('abstained', False),
#                 'recent_baby': validated_data.pop('recent_baby', False),
#                 'recent_period': validated_data.pop('recent_period', False),
#                 'recent_abortion': validated_data.pop('recent_abortion', False),
#                 'using_contraceptive': validated_data.pop('using_contraceptive', False),
#             }
#             FP_pregnancy_check.objects.update_or_create(fprecord=fp_record_instance, defaults=fp_pregnancy_check_data)

#             # FP_Assessment_Record (List of records)
#             service_provision_records_data = validated_data.pop('serviceProvisionRecords', [])
#             FP_Assessment_Record.objects.filter(fprecord=fp_record_instance).delete() # Clear existing
#             for record_data in service_provision_records_data:
#                 FP_Assessment_Record.objects.create(fprecord=fp_record_instance, **record_data)

#             # FP_Assessment_Record (and related FollowUpVisit, InventoryDeduction)
#             staff_id = validated_data.pop('staff_id', None)
#             follow_up_visit_date = validated_data.pop('follow_up_visit_date', None)
#             follow_up_visit_remarks = validated_data.pop('follow_up_visit_remarks', '')
#             dispensed_commodity_item_id = validated_data.pop('dispensed_commodity_item_id', None)
#             dispensed_medicine_item_id = validated_data.pop('dispensed_medicine_item_id', None)
#             dispensed_vaccine_item_id = validated_data.pop('dispensed_vaccine_item_id', None)
#             dispensed_item_name_for_report = validated_data.pop('dispensed_item_name_for_report', '')

#             staff_instance = Staff.objects.filter(staff_id=staff_id).first()
#             followv_instance = None
#             if follow_up_visit_date:
#                 followv_instance, created = FollowUpVisit.objects.update_or_create(
#                     patrec=patient_record_instance,
#                     visit_date=follow_up_visit_date,
#                     defaults={'remarks': follow_up_visit_remarks}
#                 )

#             dispensed_commodity = CommodityList.objects.filter(commodity_id=dispensed_commodity_item_id).first()
#             dispensed_medicine = Medicinelist.objects.filter(medicine_id=dispensed_medicine_item_id).first()
#             dispensed_vaccine = VaccineList.objects.filter(vaccine_id=dispensed_vaccine_item_id).first()
                
#             inventory_deduction_ref = None
#             if dispensed_commodity or dispensed_medicine or dispensed_vaccine:
#                 inventory_deduction_ref, created = Inventory.objects.update_or_create(
#                     # Add unique fields to look up if updating an existing InventoryDeduction
#                     # For now, if no unique ID, it will always create a new one.
#                     defaults={} # Add relevant fields here based on your model
#                 )

#             # Update or create FP_Assessment_Record
#             FP_Assessment_Record.objects.update_or_create(
#                 fprecord=fp_record_instance,
#                 defaults={
#                     'fpt': fp_type_instance,
#                     'bm': body_measurement_instance,
#                     'vital_signs': vital_signs_instance,
#                     'staff': staff_instance,
#                     'followv': followv_instance,
#                     'dispensed_commodity_item': dispensed_commodity,
#                     'dispensed_medicine_item': dispensed_medicine,
#                     'dispensed_vaccine_item': dispensed_vaccine,
#                     'dispensed_item_name_for_report': dispensed_item_name_for_report,
#                     'inventory_deduction_ref': inventory_deduction_ref,
#                 }
#             )

#             return fp_record_instance