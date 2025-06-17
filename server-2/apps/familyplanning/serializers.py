from rest_framework import serializers
from django.db import transaction  # Import transaction for atomic operations
from .models import *
# Import models from other apps with their full paths for nested serializers
from apps.patientrecords.models import *
from apps.administration.models import *
from apps.inventory.models import *
from apps.healthProfiling.models import *


# --- Individual Serializers (kept and adjusted for nesting) ---

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


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class HealthRelatedDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthRelatedDetails
        fields = '__all__'


class SpouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spouse
        fields = '__all__'


class BodyMeasurementRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = '__all__'


class VitalSignsRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = '__all__'


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'


class FollowUpVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUpVisit
        fields = '__all__'


class InventoryDeductionSerializer(serializers.ModelSerializer):
    class Meta:
        # model = InventoryDeduction
        fields = '__all__'


# --- Composite Serializer for Family Planning Record (Main Entry Point) ---
class FamilyPlanningRecordCompositeSerializer(serializers.Serializer):
    """
    Composite serializer for creating a complete Family Planning record,
    including nested related records.
    """
    # Patient Information (from FpPage1)
    pat_id = serializers.CharField(required=True)
    clientID = serializers.CharField(required=False, allow_blank=True)
    philhealthNo = serializers.CharField(required=False, allow_blank=True)
    nhts_status = serializers.BooleanField(default=False)
    pantawid_4ps = serializers.BooleanField(default=False)
    lastName = serializers.CharField(max_length=255)
    givenName = serializers.CharField(max_length=255)
    middleInitial = serializers.CharField(max_length=255, required=False, allow_blank=True)
    dateOfBirth = serializers.DateField()
    age = serializers.IntegerField()
    educationalAttainment = serializers.CharField(max_length=255, required=False, allow_blank=True)
    occupation = serializers.CharField(max_length=255, required=False, allow_blank=True)
    avg_monthly_income = serializers.CharField(max_length=15, required=False, allow_blank=True)
    religion = serializers.CharField(max_length=255, required=False, allow_blank=True)
    ethnicity = serializers.CharField(max_length=255, required=False, allow_blank=True)
    house_no = serializers.CharField(max_length=255, required=False, allow_blank=True)
    street = serializers.CharField(max_length=255, required=False, allow_blank=True)
    barangay = serializers.CharField(max_length=255, required=False, allow_blank=True)
    municipality = serializers.CharField(max_length=255, required=False, allow_blank=True)
    province = serializers.CharField(max_length=255, required=False, allow_blank=True)
    contactNo = serializers.CharField(max_length=20, required=False, allow_blank=True)
    isTransient = serializers.BooleanField(default=False)
    # Spouse Information
    spouse_lname = serializers.CharField(max_length=255, required=False, allow_blank=True)
    spouse_fname = serializers.CharField(max_length=255, required=False, allow_blank=True)
    spouse_mname = serializers.CharField(max_length=255, required=False, allow_blank=True)
    spouse_dob = serializers.DateField(required=False, allow_null=True)
    spouse_age = serializers.IntegerField(required=False, allow_null=True)
    spouse_occupation = serializers.CharField(max_length=255, required=False, allow_blank=True)
    spouse_contact_no = serializers.CharField(max_length=20, required=False, allow_blank=True)

    # Health-Related Details
    number_of_children = serializers.IntegerField(required=False, allow_null=True)
    number_of_living_children = serializers.IntegerField(required=False, allow_null=True)
    planToHaveMoreChildren = serializers.BooleanField(default=False)
    # Average monthly income is already covered above

    # FP Type (from FpPage1)
    typeOfClient = serializers.CharField(max_length=255)
    subTypeOfClient = serializers.CharField(max_length=255, required=False, allow_blank=True)
    reasonForFP = serializers.CharField(max_length=255)
    otherReasonForFP = serializers.CharField(max_length=255, required=False, allow_blank=True)
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True)
    otherReason = serializers.CharField(max_length=255, required=False, allow_blank=True)
    methodCurrentlyUsed = serializers.CharField(max_length=255)
    otherMethod = serializers.CharField(max_length=255, required=False, allow_blank=True)

    # Medical History (from FpPage2 - checkbox fields as booleans)
    medicalHistory = serializers.JSONField(binary=False, required=False) # Store as JSON

    # Obstetrical History (from FpPage2)
    gravida = serializers.IntegerField(required=False, allow_null=True)
    para = serializers.IntegerField(required=False, allow_null=True)
    full_term = serializers.IntegerField(required=False, allow_null=True)
    premature = serializers.IntegerField(required=False, allow_null=True)
    abortion = serializers.IntegerField(required=False, allow_null=True)
    living_children = serializers.IntegerField(required=False, allow_null=True)
    last_delivery_date = serializers.DateField(required=False, allow_null=True)
    last_menstrual_period = serializers.DateField(required=False, allow_null=True)
    type_of_last_delivery = serializers.CharField(max_length=255, required=False, allow_blank=True)
    menstrual_period_type = serializers.CharField(max_length=255, required=False, allow_blank=True)

    # Risk STI (from FpPage3 - checkbox fields as booleans)
    sexuallyTransmittedInfections = serializers.JSONField(binary=False, required=False) # Store as JSON
    # Risk VAW (from FpPage3 - checkbox fields as booleans and referral)
    violenceAgainstWomen = serializers.JSONField(binary=False, required=False) # Store as JSON
    vaw_referral = serializers.CharField(max_length=255, required=False, allow_blank=True)

    # Physical Exam (from FpPage4)
    weight = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    height = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    bloodPressure = serializers.CharField(max_length=20, required=False, allow_blank=True) # e.g., "120/80"
    pulseRate = serializers.IntegerField(required=False, allow_null=True)
    skinExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
    conjunctivaExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
    neckExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
    breastExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
    abdomenExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
    extremitiesExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)

    # Pelvic Exam (from FpPage4)
    pelvicExamination = serializers.CharField(max_length=255, required=False, allow_blank=True)
    cervicalConsistency = serializers.CharField(max_length=255, required=False, allow_blank=True)
    cervicalTenderness = serializers.CharField(max_length=255, required=False, allow_blank=True)
    cervicalAdnexalMassTenderness = serializers.CharField(max_length=255, required=False, allow_blank=True)
    uterinePosition = serializers.CharField(max_length=255, required=False, allow_blank=True)
    uterineDepth = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)

    # Acknowledgement (from FpPage5)
    client_signature = serializers.CharField(max_length=255, required=False, allow_blank=True)
    client_signature_date = serializers.DateField(required=False, allow_null=True)
    guardian_signature = serializers.CharField(max_length=255, required=False, allow_blank=True)
    guardian_signature_date = serializers.DateField(required=False, allow_null=True)

    # Pregnancy Check (from FpPage6)
    breastfeeding = serializers.BooleanField(default=False)
    abstained = serializers.BooleanField(default=False)
    recent_baby = serializers.BooleanField(default=False)
    recent_period = serializers.BooleanField(default=False)
    recent_abortion = serializers.BooleanField(default=False)
    using_contraceptive = serializers.BooleanField(default=False)

    # Service Provision Records (from FpPage6 - list of objects)
    serviceProvisionRecords = serializers.ListField(
        child=serializers.DictField(), write_only=True, required=False
    )

    # Assessment Record fields (if provided from a specific page or inferred)
    staff_id = serializers.IntegerField(required=False, allow_null=True) # Assuming staff_id is passed
    follow_up_visit_date = serializers.DateField(required=False, allow_null=True)
    follow_up_visit_remarks = serializers.CharField(max_length=255, required=False, allow_blank=True)

    # Dispensed items for FP_Assessment_Record
    dispensed_commodity_item_id = serializers.IntegerField(required=False, allow_null=True)
    dispensed_medicine_item_id = serializers.IntegerField(required=False, allow_null=True)
    dispensed_vaccine_item_id = serializers.IntegerField(required=False, allow_null=True)
    dispensed_item_name_for_report = serializers.CharField(max_length=255, required=False, allow_blank=True)


    def create(self, validated_data):
        with transaction.atomic():
            # Extract data for nested models
            # Personal/Patient/PatientRecord creation/update
            pat_id = validated_data.pop('pat_id')
            last_name = validated_data.pop('lastName')
            given_name = validated_data.pop('givenName')
            middle_initial = validated_data.pop('middleInitial')
            date_of_birth = validated_data.pop('dateOfBirth')
            age = validated_data.pop('age')
            philhealth_no = validated_data.pop('philhealthNo')
            educational_attainment = validated_data.pop('educationalAttainment')
            occupation = validated_data.pop('occupation')
            religion = validated_data.pop('religion')
            ethnicity = validated_data.pop('ethnicity')
            house_no = validated_data.pop('house_no')
            street = validated_data.pop('street')
            barangay = validated_data.pop('barangay')
            municipality = validated_data.pop('municipality')
            province = validated_data.pop('province')
            contact_no = validated_data.pop('contactNo')
            is_transient = validated_data.pop('isTransient')

            # Create or get Personal instance
            personal_data = {
                'per_fname': given_name,
                'per_mname': middle_initial,
                'per_lname': last_name,
                'per_dob': date_of_birth,
                'per_age': age,
                'per_philhealth': philhealth_no,
                'per_education': educational_attainment,
                'per_occupation': occupation,
                'per_religion': religion,
                'per_ethnicity': ethnicity,
                'per_house_no': house_no,
                'per_street': street,
                'per_barangay': barangay,
                'per_municipality': municipality,
                'per_province': province,
                'per_contact_no': contact_no,
                'per_is_transient': is_transient,
            }
            personal_instance, created = Personal.objects.update_or_create(
                per_fname=given_name, per_lname=last_name, per_dob=date_of_birth,
                defaults=personal_data
            )

            # Create or get Patient instance
            patient_instance, created = Patient.objects.update_or_create(
                pat_id=pat_id,
                defaults={
                    'personal_info': personal_instance,
                    # Add other patient-specific fields if necessary
                }
            )

            # Create PatientRecord
            patient_record_data = {
                'patrec_type': 'Family Planning',
                'pat': patient_instance,
            }
            patient_record_instance = PatientRecord.objects.create(**patient_record_data)

            # Spouse details
            spouse_lname = validated_data.pop('spouse_lname', None)
            spouse_fname = validated_data.pop('spouse_fname', None)
            spouse_mname = validated_data.pop('spouse_mname', None)
            spouse_dob = validated_data.pop('spouse_dob', None)
            spouse_age = validated_data.pop('spouse_age', None)
            spouse_occupation = validated_data.pop('spouse_occupation', None)
            spouse_contact_no = validated_data.pop('spouse_contact_no', None)

            spouse_instance = None
            if spouse_lname and spouse_fname:
                spouse_instance, created = Spouse.objects.update_or_create(
                    spouse_fname=spouse_fname,
                    spouse_lname=spouse_lname,
                    defaults={
                        'spouse_mname': spouse_mname,
                        'spouse_dob': spouse_dob,
                        'spouse_age': spouse_age,
                        'spouse_occupation': spouse_occupation,
                        'spouse_contact_no': spouse_contact_no,
                    }
                )

            # Health Related Details
            number_of_children = validated_data.pop('number_of_children', None)
            number_of_living_children = validated_data.pop('number_of_living_children', None)
            plan_more_children = validated_data.pop('planToHaveMoreChildren', False)
            avg_monthly_income = validated_data.pop('avg_monthly_income', '0')

            hrd_instance, created = HealthRelatedDetails.objects.update_or_create(
                patient_record=patient_record_instance, # Link to the patient record
                defaults={
                    'hrd_no_children': number_of_children,
                    'hrd_no_living_children': number_of_living_children,
                }
            )

            # FP_Record
            fp_record_data = {
                'client_id': validated_data.pop('clientID', ''),
                'fourps': validated_data.pop('pantawid_4ps', False),
                'plan_more_children': plan_more_children,
                'avg_monthly_income': avg_monthly_income,
                'occupation': occupation, # Use occupation from patient details
                'hrd': hrd_instance,
                'patrec': patient_record_instance,
                'spouse': spouse_instance,
                'pat': patient_instance,
            }
            fp_record = FP_Record.objects.create(**fp_record_data)

            # Nested Data Extraction
            fp_type_data = {
                'type_of_client': validated_data.pop('typeOfClient'),
                'subtype_of_client': validated_data.pop('subTypeOfClient', ''),
                'reason_for_fp': validated_data.pop('reasonForFP'),
                'other_reason_for_fp': validated_data.pop('otherReasonForFP', ''),
                'reason': validated_data.pop('reason', ''),
                'other_reason': validated_data.pop('otherReason', ''),
                'method_currently_used': validated_data.pop('methodCurrentlyUsed'),
                'other_method': validated_data.pop('otherMethod', ''),
            }

            medical_history_data = validated_data.pop('medicalHistory', {})

            fp_obstetrical_history_data = {
                'gravida': validated_data.pop('gravida', None),
                'para': validated_data.pop('para', None),
                'full_term': validated_data.pop('full_term', None),
                'premature': validated_data.pop('premature', None),
                'abortion': validated_data.pop('abortion', None),
                'living_children': validated_data.pop('living_children', None),
                'last_delivery_date': validated_data.pop('last_delivery_date', None),
                'last_menstrual_period': validated_data.pop('last_menstrual_period', None),
                'type_of_last_delivery': validated_data.pop('type_of_last_delivery', ''),
                'menstrual_period_type': validated_data.pop('menstrual_period_type', ''),
            }

            fp_risk_sti_data = {
                'sti_risk': validated_data.pop('sexuallyTransmittedInfections', {})
            }

            fp_risk_vaw_data = {
                'vaw_risk': validated_data.pop('violenceAgainstWomen', {}),
                'vaw_referral': validated_data.pop('vaw_referral', '')
            }

            # Body Measurement and Vital Signs (part of Assessment Record for now, but can be separate)
            weight = validated_data.pop('weight', None)
            height = validated_data.pop('height', None)
            blood_pressure = validated_data.pop('bloodPressure', '')
            pulse_rate = validated_data.pop('pulseRate', None)

            body_measurement_instance = None
            if weight is not None or height is not None:
                body_measurement_instance = BodyMeasurement.objects.create(
                    body_weight=weight,
                    body_height=height
                )

            vital_signs_instance = None
            if blood_pressure or pulse_rate is not None:
                systolic = None
                diastolic = None
                if blood_pressure:
                    try:
                        bp_parts = blood_pressure.split('/')
                        if len(bp_parts) == 2:
                            systolic = int(bp_parts[0])
                            diastolic = int(bp_parts[1])
                    except ValueError:
                        pass # Handle invalid BP format if necessary

                vital_signs_instance = VitalSigns.objects.create(
                    vs_bp_systolic=systolic,
                    vs_bp_diastolic=diastolic,
                    vs_pulse_rate=pulse_rate
                )

            fp_physical_exam_data = {
                'skin_exam': validated_data.pop('skinExamination', ''),
                'conjunctiva_exam': validated_data.pop('conjunctivaExamination', ''),
                'neck_exam': validated_data.pop('neckExamination', ''),
                'breast_exam': validated_data.pop('breastExamination', ''),
                'abdomen_exam': validated_data.pop('abdomenExamination', ''),
                'extremities_exam': validated_data.pop('extremitiesExamination', ''),
            }

            fp_pelvic_exam_data = {
                'pelvic_exam': validated_data.pop('pelvicExamination', ''),
                'cervical_consistency': validated_data.pop('cervicalConsistency', ''),
                'cervical_tenderness': validated_data.pop('cervicalTenderness', ''),
                'cervical_adnexal_mass_tenderness': validated_data.pop('cervicalAdnexalMassTenderness', ''),
                'uterine_position': validated_data.pop('uterinePosition', ''),
                'uterine_depth': validated_data.pop('uterineDepth', None),
            }

            fp_acknowledgement_data = {
                'client_signature': validated_data.pop('client_signature', ''),
                'client_signature_date': validated_data.pop('client_signature_date', None),
                'guardian_signature': validated_data.pop('guardian_signature', ''),
                'guardian_signature_date': validated_data.pop('guardian_signature_date', None),
            }

            fp_pregnancy_check_data = {
                'breastfeeding': validated_data.pop('breastfeeding', False),
                'abstained': validated_data.pop('abstained', False),
                'recent_baby': validated_data.pop('recent_baby', False),
                'recent_period': validated_data.pop('recent_period', False),
                'recent_abortion': validated_data.pop('recent_abortion', False),
                'using_contraceptive': validated_data.pop('using_contraceptive', False),
            }

            fp_service_provision_records_data = validated_data.pop('serviceProvisionRecords', [])

            # FP_Assessment_Record related fields
            staff_id = validated_data.pop('staff_id', None)
            follow_up_visit_date = validated_data.pop('follow_up_visit_date', None)
            follow_up_visit_remarks = validated_data.pop('follow_up_visit_remarks', '')
            dispensed_commodity_item_id = validated_data.pop('dispensed_commodity_item_id', None)
            dispensed_medicine_item_id = validated_data.pop('dispensed_medicine_item_id', None)
            dispensed_vaccine_item_id = validated_data.pop('dispensed_vaccine_item_id', None)
            dispensed_item_name_for_report = validated_data.pop('dispensed_item_name_for_report', '')

            # Create Staff and FollowUpVisit instances
            staff_instance = None
            if staff_id:
                staff_instance = Staff.objects.get(staff_id=staff_id) # Or get_object_or_404

            followv_instance = None
            if follow_up_visit_date:
                followv_instance = FollowUpVisit.objects.create(
                    visit_date=follow_up_visit_date,
                    remarks=follow_up_visit_remarks
                )

            # Retrieve dispensed items
            dispensed_commodity = None
            if dispensed_commodity_item_id:
                dispensed_commodity = CommodityList.objects.get(commodity_id=dispensed_commodity_item_id)

            dispensed_medicine = None
            if dispensed_medicine_item_id:
                dispensed_medicine = Medicinelist.objects.get(medicine_id=dispensed_medicine_item_id)

            dispensed_vaccine = None
            if dispensed_vaccine_item_id:
                dispensed_vaccine = VaccineList.objects.get(vaccine_id=dispensed_vaccine_item_id)

            # Create InventoryDeduction if any items are dispensed
            # inventory_deduction_ref = None
            # if dispensed_commodity or dispensed_medicine or dispensed_vaccine:
            #     # inventory_deduction_ref = InventoryDeduction.objects.create(
            #         # You might need to add quantity/item type to InventoryDeduction model
            #         # For now, just create a reference
            #     )

            # Create individual records linked to fp_record
            FP_type.objects.create(fprecord=fp_record, **fp_type_data)
            # Medical History is now a JSONField in FP_RiskSti
            FP_Obstetrical_History.objects.create(fprecord=fp_record, **fp_obstetrical_history_data)
            FP_RiskSti.objects.create(fprecord=fp_record, **fp_risk_sti_data)
            FP_RiskVaw.objects.create(fprecord=fp_record, **fp_risk_vaw_data)
            FP_Physical_Exam.objects.create(fprecord=fp_record, **fp_physical_exam_data)
            FP_Pelvic_Exam.objects.create(fprecord=fp_record, **fp_pelvic_exam_data)
            FP_Acknowledgement.objects.create(fprecord=fp_record, **fp_acknowledgement_data)
            FP_pregnancy_check.objects.create(fprecord=fp_record, **fp_pregnancy_check_data)


            # Create service provision records
            for record_data in fp_service_provision_records_data:
                FP_Assessment_Record.objects.create(fprecord=fp_record, **record_data)

            # Create FP_Assessment_Record
            if any([body_measurement_instance, vital_signs_instance, staff_instance, followv_instance,
                    dispensed_commodity, dispensed_medicine, dispensed_vaccine, inventory_deduction_ref,
                    dispensed_item_name_for_report]):
                FP_Assessment_Record.objects.create(
                    fprecord=fp_record,
                    fpt=FP_type.objects.get(fprecord=fp_record), # Assuming one FP_type per FP_Record
                    bm=body_measurement_instance,
                    vital_signs=vital_signs_instance,
                    staff=staff_instance,
                    followv=followv_instance,
                    dispensed_commodity_item=dispensed_commodity,
                    dispensed_medicine_item=dispensed_medicine,
                    dispensed_vaccine_item=dispensed_vaccine,
                    dispensed_item_name_for_report=dispensed_item_name_for_report,
                    inventory_deduction_ref=inventory_deduction_ref,
                    # Add any other assessment-specific fields here
                )

            return fp_record

    def update(self, instance, validated_data):
        # Update logic would be similar but more complex due to nested updates.
        # For a single-page submission, it's often simpler to delete and recreate related records
        # or handle individual updates for each nested serializer.
        # This implementation focuses on initial creation as per "insert one record for a patient".
        # If full update functionality is needed for composite, it will require more detailed logic.
        raise NotImplementedError("Update method for composite serializer is not implemented.")