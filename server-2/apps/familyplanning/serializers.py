from rest_framework import serializers
from django.db import transaction  # Import transaction for atomic operations
from .models import *
# Import models from other apps with their full paths for nested serializers
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


# --- COMPREHENSIVE PATIENT FP RECORD SERIALIZER for GET operations ---
class PatientComprehensiveFpSerializer(serializers.ModelSerializer):
    clientID = serializers.CharField(source='clientID', read_only=True)
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

    def get_numOfLivingChildren(self, obj: Patient) -> int:
        """
        Finds the latest obstetrical history for the patient and returns the
        number of living children.
        """
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

class FamilyPlanningRecordCompositeSerializer(serializers.ModelSerializer):
    clientID = serializers.CharField(required=False, allow_blank=True)
    philhealthNo = serializers.CharField(required=False, allow_blank=True)
    nhts_status = serializers.BooleanField(default=False)
    pantawid_4ps = serializers.BooleanField(default=False)
    lastName = serializers.CharField(max_length=255,read_only=True)
    givenName = serializers.CharField(max_length=25/5, read_only=True)
    middleInitial = serializers.CharField(max_length=255, read_only=True, required=False, allow_blank=True)
    dateOfBirth = serializers.DateField(read_only=True)
    age = serializers.IntegerField(read_only=True) 
    educationalAttainment = serializers.CharField(max_length=255, required=False, allow_blank=True)
    occupation = serializers.CharField(max_length=255, required=False, allow_blank=True)
    avg_monthly_income = serializers.CharField(max_length=15, required=False, allow_blank=True)
    religion = serializers.CharField(max_length=255, required=False, allow_blank=True)
    sex = serializers.CharField(max_length=10,read_only=True) # Gender

    # Address fields (might be nested or flattened depending on frontend structure)
    houseNumber = serializers.CharField(allow_blank=True,read_only=True)
    street = serializers.CharField(required=False, allow_blank=True)
    barangay = serializers.CharField(allow_blank=True,read_only=True)
    municipality = serializers.CharField(allow_blank=True,read_only=True)
    province = serializers.CharField(allow_blank=True,read_only=True)

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

    # FP Type (from FpPage1) - Adjusted to match new FP_type model
    typeOfClient = serializers.CharField(allow_blank=True,read_only=True)
    subTypeOfClient = serializers.CharField(allow_blank=True,read_only=True)
    reasonForFP = serializers.CharField(allow_blank=True,read_only=True)
    reason = serializers.CharField(required=False, allow_blank=True) # For Current User's main reason
    otherReasonForFP = serializers.CharField(required=False, allow_blank=True) # The "specify" text for reasons
    methodCurrentlyUsed = serializers.CharField(max_length=255, required=False, allow_blank=True)
    otherMethod = serializers.CharField(max_length=255, required=False, allow_blank=True) # For "Specify other method"

    # Body Measurements (from FpPage2/3, linked to Patient)
    weight = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    height = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)


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

    # Vital Signs (from FpPage4) - Frontend sends 'bloodPressure' string
    bloodPressure = serializers.CharField(required=False, allow_blank=True) 
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
    cervicalTenderness = serializers.BooleanField(default=False, required=False)
    cervicalAdnexal = serializers.BooleanField(default=False, required=False)
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
    # methodCurrentlyUsed and otherMethod are already defined above for FP_Type
    appointmentDate = serializers.DateField(required=False, allow_null=True)
    staffId = serializers.IntegerField(required=False, allow_null=True) # Link to Staff model
    staffName = serializers.CharField(max_length=255, required=False, allow_blank=True) # For display only
    dispensedCommodityItemId = serializers.IntegerField(required=False, allow_null=True) # Link to CommodityList
    dispensedMedicineItemId = serializers.IntegerField(required=False, allow_null=True) # Link to Medicinelist
    dispensedVaccineItemId = serializers.IntegerField(required=False, allow_null=True) # Link to VaccineList
    dispensedItemNameForReport = serializers.CharField(max_length=255, required=False, allow_blank=True)
    inventoryDeductionRef = serializers.CharField(max_length=255, required=False, allow_blank=True)
    medicalFindings = serializers.CharField(max_length=255, required=False, allow_blank=True) # Added for service provision
    methodQuantity = serializers.IntegerField(required=False, allow_null=True) # Added for service provision
    serviceProviderSignature = serializers.CharField(max_length=255, required=False, allow_blank=True) # Added for service provision


    class Meta:
        model = FP_Record
        fields = '__all__'

    def create(self, validated_data):
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

            # Pop FP Type fields
            type_of_client = validated_data.pop('typeOfClient', None)
            sub_type_of_client = validated_data.pop('subTypeOfClient', None)
            frontend_reason_for_fp = validated_data.pop('reasonForFP', None) # From New Acceptor section
            frontend_reason = validated_data.pop('reason', None) # From Current User section
            frontend_other_reason_for_fp_text = validated_data.pop('otherReasonForFP', None) # The "specify" text

            method_currently_used = validated_data.pop('methodCurrentlyUsed', None)
            other_method_text = validated_data.pop('otherMethod', None)

            weight = validated_data.pop('weight', None)
            height = validated_data.pop('height', None)


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

            # Pop the bloodPressure string from validated_data for FP_Physical_Exam
            blood_pressure_str = validated_data.pop('bloodPressure', None)

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
            cervical_adnexal_mass_tenderness = validated_data.pop('cervicalAdnexal', None)
            uterine_position = validated_data.pop('uterinePosition', None)
            uterine_depth = validated_data.pop('uterineDepth', None)

            client_signature_data = validated_data.pop('client_signature', None)
            client_signature_date_data = validated_data.pop('client_signature_date', None)
            guardian_name_data = validated_data.pop('guardian_name', None)
            guardian_signature_data = validated_data.pop('guardian_signature', None)
            guardian_signature_date_data = validated_data.pop('guardian_signature_date', None)

            date_of_visit = validated_data.pop('dateOfVisit', None)
            # method_currently_used and other_method_text are popped above
            appointment_date = validated_data.pop('appointmentDate', None)
            staff_id = validated_data.pop('staffId', None)
            dispensed_commodity_item_id = validated_data.pop('dispensedCommodityItemId', None)
            dispensed_medicine_item_id = validated_data.pop('dispensedMedicineItemId', None)
            dispensed_vaccine_item_id = validated_data.pop('dispensedVaccineItemId', None)
            dispensed_item_name_for_report = validated_data.pop('dispensedItemNameForReport', None)
            inventory_deduction_ref = validated_data.pop('inventoryDeductionRef', None)
            medical_findings = validated_data.pop('medicalFindings', None) # New
            method_quantity = validated_data.pop('methodQuantity', None) # New
            service_provider_signature = validated_data.pop('serviceProviderSignature', None) # New


            # --- Create/Update Personal and Address ---
            personal_instance, personal_created = Personal.objects.update_or_create(
                per_lname=last_name,
                per_fname=given_name,
                per_dob=date_of_birth,
                defaults={
                    'per_mname': middle_initial,
                    'per_sex': sex,
                    'per_edAttainment': educational_attainment,
                    # 'per_occupation': occupation,
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

            # FP_type - Handle new fields
            fpt_reason_to_save = None
            fpt_otherreason_na_to_save = None
            fpt_otherreason_cu_to_save = None

            if type_of_client == 'New Acceptor':
                fpt_reason_to_save = frontend_reason_for_fp # Main reason for New Acceptor
                if frontend_reason_for_fp == 'Others':
                    fpt_otherreason_na_to_save = frontend_other_reason_for_fp_text
            elif type_of_client == 'Current User':
                fpt_reason_to_save = frontend_reason # Main reason for Current User
                if frontend_reason == 'Others':
                    fpt_otherreason_cu_to_save = frontend_other_reason_for_fp_text

            FP_type.objects.create(
                fprecord_id=fp_record, # Corrected to fprecord_id
                fpt_client_type=type_of_client,
                fpt_subtype=sub_type_of_client,
                fpt_reason=fpt_reason_to_save,
                fpt_otherreason_na=fpt_otherreason_na_to_save,
                fpt_otherreason_cu=fpt_otherreason_cu_to_save,
                fpt_method_used=method_currently_used,
                fpt_other_method=other_method_text,
            )

            # BodyMeasurement
            if weight is not None or height is not None or bmi is not None:
                BodyMeasurement.objects.create(
                    pat=patient_instance,
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
            if pulse_rate is not None: # Check for at least one vital sign
                vital_signs_instance = VitalSigns.objects.create(
                    patient=patient_instance,
                    # Assuming blood pressure is handled by FP_Physical_Exam, not VitalSigns directly
                    # vs_bp_systolic=bp_systolic, # Removed if BP is only in FP_Physical_Exam
                    # vs_bp_diastolic=bp_diastolic, # Removed if BP is only in FP_Physical_Exam
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
                bloodpressure=blood_pressure_str, # <-- Pass the string here to the correct model field
            )

            # FP_Acknowledgement
            FP_Acknowledgement.objects.create(
                fprecord=fp_record,
                ack_client_method_choice=method_currently_used, # Assuming this is the selected method
                ack_clientSignature=client_signature_data,
                ack_clientSignatureDate=client_signature_date_data,
                client_name=f"{last_name}, {given_name} {middle_initial or ''}".strip(), # Construct client name
                guardian_signature=guardian_signature_data,
                guardian_signature_date=guardian_signature_date_data,
                guardian_name=guardian_name_data,
            )

            # Staff (Assuming you have a Staff model and the ID is passed)
            staff_instance = None
            # You'll need to decide how staff_id is passed and if Staff model is linked
            # For now, let's assume staff_id is available and Staff model exists
            # if staff_id:
            #     staff_instance = Staff.objects.get(staff_id=staff_id)

            # Dispensed Items (assuming IDs are passed for linking)
            dispensed_commodity = None
            # if dispensed_commodity_item_id:
            #     dispensed_commodity = CommodityList.objects.get(comm_id=dispensed_commodity_item_id)
            dispensed_medicine = None
            # if dispensed_medicine_item_id:
            #     dispensed_medicine = Medicinelist.objects.get(med_id=dispensed_medicine_item_id)
            dispensed_vaccine = None
            FP_Assessment_Record.objects.create(
                fprecord=fp_record,
                fpt=FP_type.objects.get(fprecord_id=fp_record), # Corrected to fprecord_id
                bm=BodyMeasurement.objects.filter(pat=patient_instance).first(), # Assuming one body measurement per patient
                vital_signs=vital_signs_instance, # Link vital signs
                staff=staff_instance,
                # followv=followv_instance, # Assuming followv is not part of this initial creation or needs to be provided
                dispensed_commodity_item=dispensed_commodity,
                dispensed_medicine_item=dispensed_medicine,
                dispensed_vaccine_item=dispensed_vaccine,
                dispensed_item_name_for_report=dispensed_item_name_for_report,
                inventory_deduction_ref=inventory_deduction_ref,
                # Add any other assessment-specific fields here
                as_provider_name=staff_name, # Assuming staffName is passed
                as_findings=medical_findings, # Assuming medicalFindings is passed
                quantity=method_quantity, # Assuming methodQuantity is passed
                as_provider_signature=service_provider_signature, # Assuming signature is passed
            )
            
            FP_pregnancy_check.objects.create(
                fprecord=fp_record,
                breastfeeding=validated_data.pop('breastfeeding', False),
                abstained=validated_data.pop('abstained', False),
                recent_baby=validated_data.pop('recent_baby', False),
                recent_period=validated_data.pop('recent_period', False),
                recent_abortion=validated_data.pop('recent_abortion', False),
                using_contraceptive=validated_data.pop('using_contraceptive', False),
            )


            return fp_record

    def update(self, instance, validated_data):
        raise NotImplementedError("Update method for composite serializer is not fully implemented. Please implement updates for all nested models.")

