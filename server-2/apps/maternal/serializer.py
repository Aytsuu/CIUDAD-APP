from rest_framework import serializers
from django.db import transaction 
from datetime import date, timedelta, datetime
from django.utils import timezone
from django.db.models import Max

# Import models from patientrecords and maternal apps
from apps.patientrecords.models import Spouse, VitalSigns, FollowUpVisit, PatientRecord, Patient, BodyMeasurement, MedicalHistory, Obstetrical_History
from apps.maternal.models import (
    Pregnancy, Prenatal_Form, Previous_Hospitalization, Previous_Pregnancy, TT_Status, 
    LaboratoryResult, LaboratoryResultImg, LabRemarks, Guide4ANCVisit, Checklist, BirthPlan,
    PostpartumRecord, PostpartumDeliveryRecord, PostpartumAssessment,
    ObstetricRiskCode, PrenatalCare
)
from apps.administration.models import Staff # Assuming Staff model is here
from apps.patientrecords.serializers.patients_serializers import PatientSerializer, SpouseSerializer    


# serializer for models not in maternal
class MedicalHistorySerializer(serializers.ModelSerializer):
    illness_name = serializers.CharField(source='ill.illname', read_only=True)
    class Meta:
        model = MedicalHistory
        fields = ['medhist_id', 'year', 'ill', 'illness_name'] 


# class PrenatalPatientMedHistorySerializer(serializers.ModelSerializer):
#     med_history = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Patient
#         fields = ['pat_id', 'med_history']

#     def get_med_history(self, obj):
#         med_history = []

#         try:
#             patient_records = PatientRecord.objects.filter(pat_id=obj)
#             for record in patient_records:          
#                 # prenatal forms checking
#                 prenatal_forms = Prenatal_Form.objects.filter(patrec=record).select_related('medhist_id__ill')    
#                 for pf in prenatal_forms:
#                     if pf.medhist_id:
#                         med_history.append(pf.medhist_id)
                
#                 # family planning forms checking
#                 # family_planning_forms = FP_Record.objects.filter(patrec=record).select_related('medhist_id__ill')
#                 # for fp in family_planning_forms:
#                 #     if fp.medhist_id:
#                 #         med_history.append(fp.medhist_id)
                
#             return MedicalHistorySerializer(med_history, many=True).data

#         except Exception as e:
#             print(f"Error fetching medical history: {e}")
#             return []

class ObstetricalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Obstetrical_History
        fields = '__all__'


class BodyMeasurementReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = ['age', 'weight', 'height']


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
        fields = ['obs_ch_born_alive', 'obs_living_ch', 'obs_abortion', 'obs_still_birth',
                  'obs_lg_babies', 'obs_gravida', 'obs_para', 'obs_fullterm', 'obs_preterm', 'obs_record_from']

class PreviousHospitalizationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Hospitalization
        fields = ['prev_hospitalization', 'prev_hospitalization_year']

class PreviousPregnancyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Pregnancy
        fields = ['date_of_delivery', 'outcome', 'type_of_delivery', 'babys_wt', 'gender', 'ballard_score', 'apgar_score']

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
            LaboratoryResultImg.objects.create(lab_id=lab_result, **img_data)
        return lab_result

class LabRemarksCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabRemarks
        fields = ['remarks']

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

# New Serializers for the added models
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
            'pfpc_fundal_ht': {'required': False, 'allow_null': True},
            'pfpc_fetal_hr': {'required': False, 'allow_null': True},
            'pfpc_fetal_pos': {'required': False, 'allow_blank': True},
            'pfpc_complaints': {'required': False, 'allow_blank': True},
            'pfpc_advises': {'required': False, 'allow_blank': True},
        }



# Main Prenatal Form Serializer for complete creation
class PrenatalCompleteSerializer(serializers.ModelSerializer):
    # Fields from motherPersonalInfo
    pat_id = serializers.CharField(write_only=True, required=True)
    patrec_type = serializers.CharField(default="Prenatal", write_only=True) 

    obstetrical_history = ObstetricalHistoryCreateSerializer(required=False, write_only=True)

    # Nested serializers for related models
    spouse_data = SpouseCreateSerializer(required=False, write_only=True)
    body_measurement = BodyMeasurementCreateSerializer(required=False, write_only=True)
    
    # Nested lists for multiple entries
    previous_hospitalizations = PreviousHospitalizationCreateSerializer(many=True, required=False, write_only=True)
    previous_pregnancy_data = PreviousPregnancyCreateSerializer(required=False, write_only=True) # Assuming single for now based on schema
    tt_statuses = TTStatusCreateSerializer(many=True, required=False, write_only=True)
    lab_results_data = LaboratoryResultCreateSerializer(many=True, required=False, write_only=True)
    
    # Single nested objects
    # lab_remarks_data = LabRemarksCreateSerializer(required=False, write_only=True)
    anc_visit_data = Guide4ANCVisitCreateSerializer(required=False, write_only=True)
    checklist_data = ChecklistCreateSerializer(required=False, write_only=True)
    birth_plan_data = BirthPlanCreateSerializer(required=False, write_only=True)
    obstetric_risk_code_data = ObstetricRiskCodeCreateSerializer(required=False, write_only=True) # New
    prenatal_care_data = PrenatalCareCreateSerializer(many=True, required=False, write_only=True) # New

    # Vital signs for current visit (from prenatalCare.bp)
    vital_bp_systolic = serializers.IntegerField(write_only=True, required=False)
    vital_bp_diastolic = serializers.IntegerField(write_only=True, required=False)

    # Follow-up visit data
    followup_date = serializers.DateField(write_only=True, required=False)
    followup_description = serializers.CharField(default="Prenatal Follow-up Visit", write_only=True, required=False, allow_blank=True)

    # Assessed by staff
    assessed_by = serializers.CharField(write_only=True, required=False, allow_blank=True) # Assuming staff ID is passed as string

    class Meta:
        model = Prenatal_Form
        fields = [
            'pat_id', 'patrec_type', 'pf_lmp', 'pf_edc', 'pf_occupation',
            'spouse_data', 'body_measurement', 'obstetrical_history', 'previous_hospitalizations',
            'previous_pregnancy_data', 'tt_statuses', 'lab_results_data', 
            'anc_visit_data', 'checklist_data', 'birth_plan_data',
            'obstetric_risk_code_data', 'prenatal_care_data', 'vital_bp_systolic', 
            'vital_bp_diastolic', 'followup_date', 'followup_description', 'assessed_by'
        ]
        # extra_kwargs = {
        #     'pf_lmp': {'required': True},
        #     'pf_edc': {'required': True},
        # }

    def validate_pat_id(self, value):
        """Validate patient ID exists and is not null"""
        if not value or value.lower() == 'nan' or value.strip() == '':
            raise serializers.ValidationError("Patient ID is required")
        try:
            Patient.objects.get(pat_id=value.strip())
            return value.strip()
        except Patient.DoesNotExist:
            raise serializers.ValidationError(f"Patient with ID {value} does not exist")
        except Exception as e:
            raise serializers.ValidationError(f"Error validating patient ID {value}: {str(e)}")

    def validate_vital_bp_systolic(self, value):
        if value is not None and (value < 60 or value > 250):
            raise serializers.ValidationError("Systolic BP must be between 60 and 250")
        return value

    def validate_vital_bp_diastolic(self, value):
        if value is not None and (value < 40 or value > 150):
            raise serializers.ValidationError("Diastolic BP must be between 40 and 150")
        return value

    def validate_followup_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("Follow-up date cannot be in the past")
        return value

    def handle_spouse_logic(self, patient, spouse_data):
        """
        Handle spouse creation logic using your existing business rules
        """
        if not spouse_data:
            return None
        
        try:
            patient_serializer = PatientSerializer(patient)
            spouse_info = patient_serializer.get_spouse_info(patient)
            
            print(f"Spouse info for patient {patient.pat_id}: {spouse_info}")
            
            # check if spouse exists (either in family composition or medical records)
            if spouse_info.get('spouse_exists', False):
                spouse_source = spouse_info.get('spouse_source', '')
                existing_spouse_info = spouse_info.get('spouse_info', {})
                
                if spouse_source == 'family_composition':
                    # if father exists in family composition, don't create spouse
                    print("Father exists in family composition, not creating spouse")
                    return None
                
                elif spouse_source in ['prenatal_form', 'postpartum_record']:
                    # existing spouse in medical records, use it
                    spouse_id = existing_spouse_info.get('spouse_id')
                    if spouse_id:
                        existing_spouse = Spouse.objects.get(spouse_id=spouse_id)
                        print(f"Using existing spouse from {spouse_source}: {existing_spouse.spouse_id}")
                        return existing_spouse
            
            # check if spouse insertion is allowed
            if spouse_info.get('allow_spouse_insertion', False):
                print(f"Creating new spouse. Reason: {spouse_info.get('reason', 'Unknown')}")
                return Spouse.objects.create(**spouse_data)
            else:
                print("Spouse insertion not allowed")
                return None
                
        except Exception as e:
            print(f"Error in spouse logic: {str(e)}")
            # fallback: try to create spouse if there's an error
            try:
                return Spouse.objects.create(**spouse_data)
            except Exception as create_error:
                print(f"Error creating spouse: {str(create_error)}")
                return None

    def create(self, validated_data):
        print(f"Creating prenatal record with validated data: {validated_data}")
        
        # Pop nested data
        pat_id = validated_data.pop('pat_id')
        patrec_type = validated_data.pop('patrec_type', 'Prenatal')  
        spouse_data = validated_data.pop('spouse_data', None)
        body_measurement_data = validated_data.pop('body_measurement', None)
        obstetrical_history_data = validated_data.pop('obstetrical_history', None)
        previous_hospitalizations_data = validated_data.pop('previous_hospitalizations', [])
        previous_pregnancy_data = validated_data.pop('previous_pregnancy_data', None)
        tt_statuses_data = validated_data.pop('tt_statuses', [])
        lab_results_data = validated_data.pop('lab_results_data', [])
        # lab_remarks_data = validated_data.pop('lab_remarks_data', None)
        anc_visit_data = validated_data.pop('anc_visit_data', None)
        checklist_data = validated_data.pop('checklist_data', None)
        birth_plan_data = validated_data.pop('birth_plan_data', None)
        obstetric_risk_code_data = validated_data.pop('obstetric_risk_code_data', None) 
        prenatal_care_data = validated_data.pop('prenatal_care_data', []) 
        vital_bp_systolic = validated_data.pop('vital_bp_systolic', None)
        vital_bp_diastolic = validated_data.pop('vital_bp_diastolic', None)
        followup_date = validated_data.pop('followup_date', None)
        followup_description = validated_data.pop('followup_description', "Prenatal follow-up visit")
        assessed_by = validated_data.pop('assessed_by', None)

        try:
            with transaction.atomic():
                patient = Patient.objects.get(pat_id=pat_id)
                print(f"Found patient: {patient.pat_id}")

                # handle Pregnancy (create new or link to existing active)
                pregnancy = None
                current_datetime = timezone.now()
                # current_date = current_datetime.date()
                
                # Check for an active pregnancy for this patient
                active_pregnancy = Pregnancy.objects.filter(pat_id=patient, status='active').first()
                
                if active_pregnancy:
                    pregnancy = active_pregnancy
                    print(f"Linked to existing active pregnancy: {pregnancy.pregnancy_id}")
                else:
                    # If no active pregnancy, create a new one
                    current_yr = current_datetime.year
                    current_yr_suffix = str(current_yr)[-2:]
                    prefix = f'PREG-{current_yr}-{current_yr_suffix}'
                    existing_preg_max = Pregnancy.objects.filter(
                        pregnancy_id__startswith=prefix
                    ).aggregate(
                        max_num = Max('pregnancy_id')
                    )
                    
                    if existing_preg_max['max_num']:
                        last_preg_id = existing_preg_max['max_num']
                        last_num = int(last_preg_id[-4:])
                        new_num = last_num + 1
                    else:
                        new_num = 1
                    
                    new_pregnancy_id = f'{prefix}{str(new_num).zfill(4)}'

                    pregnancy = Pregnancy.objects.create(
                        pregnancy_id=new_pregnancy_id,
                        pat_id=patient,
                        status='active', # New pregnancy starts as active
                        created_at=current_datetime,
                        updated_at=current_datetime,
                        prenatal_end_date=None,
                        postpartum_end_date=None
                    )
                    print(f'Created new Pregnancy: {pregnancy.pregnancy_id}')

                # create PatientRecord
                patient_record = PatientRecord.objects.create(
                    patrec_type=patrec_type, # Use the patrec_type from validated_data (defaults to "Prenatal")
                    pat_id=patient
                )
                print(f"Created patient record: {patient_record.patrec_id}")

                # create ObstetricalHistory
                obstetrical_history = Obstetrical_History.objects.create(
                    patrec_id=patient_record,
                    **obstetrical_history_data
                )
                print(f"Created obstetrical history: {obstetrical_history.obs_id}")

                # create VitalSigns (always create, even with default values)
                vital_signs = VitalSigns.objects.create(
                    vital_bp_systolic=str(vital_bp_systolic),
                    vital_bp_diastolic=str(vital_bp_diastolic),
                    vital_temp="N/A", # Default values
                    vital_RR="N/A",
                    vital_o2="N/A",
                    vital_pulse="N/A",
                    patrec=patient_record 
                )
                print(f"Created vital signs: {vital_signs.vital_id}")
                
                # create BodyMeasurement
                body_measurement = None
                if body_measurement_data:
                    body_measurement = BodyMeasurement.objects.create(
                        patrec=patient_record,
                        **body_measurement_data
                    )
                    print(f"Created body measurement: {body_measurement.bm_id}")

                # handle Spouse logic
                spouse = self.handle_spouse_logic(patient, spouse_data)
                if spouse:
                    print(f"Using spouse: {spouse.spouse_id}")
                else:
                    print("No spouse created/used")

                # create FollowUpVisit
                follow_up_visit = None
                if followup_date:
                    follow_up_visit = FollowUpVisit.objects.create(
                        followv_date=followup_date,
                        followv_status="pending",
                        followv_description=followup_description,
                        patrec=patient_record
                    )
                    print(f"Created follow-up visit: {follow_up_visit.followv_id}")

                # create Previous_Pregnancy record
                if previous_pregnancy_data:
                    Previous_Pregnancy.objects.create(patrec_id=patient_record, **previous_pregnancy_data)
                    print("Created previous pregnancy record.")

                # 7. get Staff (to be modified)
                staff = None
                if assessed_by:
                    try:
                        staff = Staff.objects.get(staff_id=assessed_by)
                        print(f"Linked to staff: {staff.staff_id}")
                    except Staff.DoesNotExist:
                        print(f"Staff with ID {assessed_by} not found. Proceeding without staff link.")

                # create Prenatal_Form
                prenatal_form = Prenatal_Form.objects.create(
                    patrec_id=patient_record,
                    pregnancy_id=pregnancy,
                    vital_id=vital_signs,
                    spouse_id=spouse,
                    bm_id=body_measurement,
                    followv_id=follow_up_visit,
                    staff_id=staff,
                    **validated_data # This will include pf_lmp, pf_edc, and pf_occupation
                )
                print(f"Created prenatal form: {prenatal_form.pf_id}")

                # create Previous_Hospitalization records
                for hosp_data in previous_hospitalizations_data:
                    Previous_Hospitalization.objects.create(pf_id=prenatal_form, **hosp_data)
                if previous_hospitalizations_data:
                    print(f"Created {len(previous_hospitalizations_data)} previous hospitalization records.")

                # create TT_Status records
                for tt_data in tt_statuses_data:
                    # If vaccineType was passed, you might need to create/link VaccinationRecord here
                    # For now, directly create TT_Status
                    TT_Status.objects.create(pf_id=prenatal_form, **tt_data)
                if tt_statuses_data:
                    print(f"Created {len(tt_statuses_data)} TT status records.")

                # create LaboratoryResult and LaboratoryResultImg records
                for lab_data in lab_results_data:
                    images_data = lab_data.pop('images', [])
                    lab_result = LaboratoryResult.objects.create(pf_id=prenatal_form, **lab_data)
                    for img_data in images_data:
                        LaboratoryResultImg.objects.create(lab_id=lab_result, **img_data)
                if lab_results_data:
                    print(f"Created {len(lab_results_data)} laboratory result records.")


                # create Guide4ANCVisit
                if anc_visit_data:
                    Guide4ANCVisit.objects.create(pf_id=prenatal_form, **anc_visit_data)
                    print("Created ANC visit guide record.")

                # create Checklist
                if checklist_data:
                    Checklist.objects.create(pf_id=prenatal_form, **checklist_data)
                    print("Created checklist record.")

                # create BirthPlan
                if birth_plan_data:
                    BirthPlan.objects.create(pf_id=prenatal_form, **birth_plan_data)
                    print("Created birth plan record.")
                
                # create ObstetricRiskCode
                if obstetric_risk_code_data:
                    ObstetricRiskCode.objects.create(pf_id=prenatal_form, **obstetric_risk_code_data)
                    print("Created obstetric risk code record.")

                # create PrenatalCare entries 
                for pc_data in prenatal_care_data:
                    PrenatalCare.objects.create(pf_id=prenatal_form, **pc_data)
                if prenatal_care_data:
                    print(f"Created {len(prenatal_care_data)} prenatal care entries.")

                print(f"Successfully created complete prenatal record: {prenatal_form.pf_id}")
                return prenatal_form
                
        except Patient.DoesNotExist:
            error_msg = f"Patient with ID {pat_id} does not exist"
            print(error_msg)
            raise serializers.ValidationError(error_msg)
        except Exception as e:
            error_msg = f"Error creating prenatal record: {str(e)}"
            print(error_msg)
            raise serializers.ValidationError(error_msg)

    def to_representation(self, instance):
        # This method is for serialization (GET responses), not for creation.
        # It should return a representation of the created Prenatal_Form and its related IDs.
        representation = super().to_representation(instance)
        
        # Add the created patrec_id to the response
        representation['patrec_id'] = instance.patrec_id.patrec_id if instance.patrec_id else None
        representation['pf_id'] = instance.pf_id # Ensure pf_id is included
        
        # Add IDs of related objects for confirmation
        if instance.pregnancy_id:
            representation['pregnancy_id'] = instance.pregnancy_id.pregnancy_id
        if instance.vital_id:
            representation['vital_id'] = instance.vital_id.vital_id
        if instance.spouse_id:
            representation['spouse_id'] = instance.spouse_id.spouse_id
        if instance.bm_id:
            representation['bm_id'] = instance.bm_id.bm_id
        if instance.followv_id:
            representation['followv_id'] = instance.followv_id.followv_id
        if instance.staff_id:
            representation['staff_id'] = instance.staff_id.staff_id
        
        # New fields for representation
        if hasattr(instance, 'pf_obstetric_risk_code') and instance.pf_obstetric_risk_code.exists():
            representation['obstetric_risk_code_id'] = instance.pf_obstetric_risk_code.first().pforc_id
        else:
            representation['obstetric_risk_code_id'] = None
        
        representation['prenatal_care_count'] = instance.pf_prenatal_care.count()


        # You might want to add counts or IDs for nested lists if needed for response
        representation['previous_hospitalizations_count'] = instance.pf_previous_hospitalization.count()
        representation['tt_statuses_count'] = instance.tt_status.count()
        representation['lab_results_count'] = instance.lab_result.count()

        return representation

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


# Renamed from PrenatalFormSerializer to PrenatalDetailViewSerializer for clarity
class PrenatalDetailViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prenatal_Form
        fields = ['pf_id', 'pf_lmp', 'pf_edc', 'created_at']



# ************** postpartum serializers **************
class PostpartumDetailViewSerializer(serializers.ModelSerializer):
    delivery_date = serializers.SerializerMethodField()
    vital_systolic = serializers.CharField(source='vital_id.vital_bp_systolic', read_only=True)
    vital_diastolic = serializers.CharField(source='vital_id.vital_bp_diastolic', read_only=True)

    class Meta:
        model = PostpartumRecord
        fields = ['ppr_id', 'ppr_lochial_discharges', 'ppr_vit_a_date_given', 'ppr_num_of_pads',
                 'ppr_mebendazole_date_given', 'ppr_date_of_bf', 'ppr_time_of_bf', 'created_at',
                 'delivery_date', 'vital_systolic', 'vital_diastolic']
        
    def get_delivery_date(self, obj):
        delivery_record = obj.postpartum_delivery_record.first()
        return delivery_record.ppdr_date_of_delivery if delivery_record else None




class PostpartumDeliveryRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostpartumDeliveryRecord
        fields = ['ppdr_date_of_delivery', 'ppdr_time_of_delivery', 'ppdr_place_of_delivery', 
                 'ppdr_attended_by', 'ppdr_outcome']


class PostpartumAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostpartumAssessment
        fields = ['ppa_date_of_visit', 'ppa_feeding', 'ppa_findings', 'ppa_nurses_notes']





class PostpartumCompleteSerializer(serializers.ModelSerializer):
    # Nested serializers for related data
    delivery_record = PostpartumDeliveryRecordSerializer(write_only=True)
    assessments = PostpartumAssessmentSerializer(many=True, write_only=True)
    spouse_data = SpouseCreateSerializer(required=False)
    
    # Vital signs data
    vital_bp_systolic = serializers.CharField(write_only=True)
    vital_bp_diastolic = serializers.CharField(write_only=True)
    
    # Follow-up visit data
    followup_date = serializers.DateField(write_only=True)
    followup_description = serializers.CharField(default="Postpartum follow-up visit", write_only=True)
    
    # Patient data - we'll create the PatientRecord here
    pat_id = serializers.CharField(write_only=True, required=True)
    patrec_type = serializers.CharField(default="Postpartum Care", write_only=True)  # Fixed: was "Postpartum"

    def validate_pat_id(self, value):
        """Validate patient ID exists and is not null"""
        print(f"Validating pat_id: {value} (type: {type(value)})")
        
        if value is None or value == "":
            raise serializers.ValidationError("Patient ID is required")
        
        # Handle string patient IDs like "PT20050001"
        if isinstance(value, str):
            if value.lower() == 'nan' or value.strip() == '':
                raise serializers.ValidationError("Invalid patient ID: received NaN or empty string")
            # Don't try to convert to int - keep as string
            patient_id = value.strip()
        else:
            patient_id = str(value)
        
        try:
            # Import your Patient model here if not already imported
            from apps.patientrecords.models import Patient  
            # Use the string patient ID directly
            patient = Patient.objects.get(pat_id=patient_id)
            print(f"Found patient: {patient.pat_id}")
            return patient_id
        except Patient.DoesNotExist:
            raise serializers.ValidationError(f"Patient with ID {patient_id} does not exist")
        except Exception as e:
            raise serializers.ValidationError(f"Error validating patient ID {patient_id}: {str(e)}")

    class Meta:
        model = PostpartumRecord
        fields = [
            'ppr_lochial_discharges', 'ppr_vit_a_date_given',
            'ppr_num_of_pads', 'ppr_mebendazole_date_given', 'ppr_date_of_bf',
            'ppr_time_of_bf', 'pat_id', 'patrec_type', 'delivery_record', 'assessments',
            'spouse_data', 'vital_bp_systolic', 'vital_bp_diastolic', 'followup_date',
            'followup_description'
        ]

    def validate_ppr_lochial_discharges(self, value):
        """Ensure lochial discharges is not blank"""
        if not value or (isinstance(value, str) and value.strip() == ""):
            return ""  # Default value
        return value

    def validate_assessments(self, value):
        """Validate assessment data"""
        from datetime import datetime, date
        
        if not value or len(value) == 0:
            raise serializers.ValidationError("At least one assessment is required")
        
        for assessment in value:
            # Ensure date is in correct format
            date_value = assessment.get('ppa_date_of_visit', '')
            
            if not date_value:
                raise serializers.ValidationError("Assessment date is required")
            
            # Handle both string and date objects
            if isinstance(date_value, date):
                # Already a date object, no need to validate format
                continue
            elif isinstance(date_value, str):
                try:
                    datetime.strptime(date_value, '%Y-%m-%d')
                except ValueError:
                    raise serializers.ValidationError(
                        f"Date '{date_value}' has wrong format. Use YYYY-MM-DD format."
                    )
            else:
                raise serializers.ValidationError(
                    f"Invalid date type for ppa_date_of_visit: {type(date_value)}"
                )
        return value

    def validate_delivery_record(self, value):
        """Validate delivery record data"""
        required_fields = ['ppdr_date_of_delivery', 'ppdr_place_of_delivery', 'ppdr_attended_by']
        
        for field in required_fields:
            if not value.get(field):
                raise serializers.ValidationError(f"{field} is required in delivery record")
        
        return value

    def validate_vital_bp_systolic(self, value):
        """Validate systolic BP"""
        try:
            bp_value = int(value)
            if bp_value < 60 or bp_value > 250:
                raise serializers.ValidationError("Systolic BP must be between 60 and 250")
        except (ValueError, TypeError):
            raise serializers.ValidationError("Systolic BP must be a valid number")
        return value

    def validate_vital_bp_diastolic(self, value):
        """Validate diastolic BP"""
        try:
            bp_value = int(value)
            if bp_value < 40 or bp_value > 150:
                raise serializers.ValidationError("Diastolic BP must be between 40 and 150")
        except (ValueError, TypeError):
            raise serializers.ValidationError("Diastolic BP must be a valid number")
        return value

    def validate_followup_date(self, value):
        """Validate follow-up date"""
        if not value:
            raise serializers.ValidationError("Follow-up date is required")
        
        from datetime import date
        if isinstance(value, str):
            try:
                value = datetime.strptime(value, '%Y-%m-%d').date()
            except ValueError:
                raise serializers.ValidationError("Follow-up date must be in YYYY-MM-DD format")
        
        if value < date.today():
            raise serializers.ValidationError("Follow-up date cannot be in the past")
        
        return value


    def handle_spouse_logic(self, patient, spouse_data):
        """
        Handle spouse creation logic using your existing business rules
        """
        if not spouse_data:
            return None
        
        try:
            patient_serializer = PatientSerializer(patient)
            spouse_info = patient_serializer.get_spouse_info(patient)
            
            print(f"Spouse info for patient {patient.pat_id}: {spouse_info}")
            
            # check if spouse exists (either in family composition or medical records)
            if spouse_info.get('spouse_exists', False):
                spouse_source = spouse_info.get('spouse_source', '')
                existing_spouse_info = spouse_info.get('spouse_info', {})
                
                if spouse_source == 'family_composition':
                    # if father exists in family composition, don't create spouse
                    print("Father exists in family composition, not creating spouse")
                    return None
                
                elif spouse_source in ['prenatal_form', 'postpartum_record']:
                    # existing spouse in medical records, use it
                    spouse_id = existing_spouse_info.get('spouse_id')
                    if spouse_id:
                        existing_spouse = Spouse.objects.get(spouse_id=spouse_id)
                        print(f"Using existing spouse from {spouse_source}: {existing_spouse.spouse_id}")
                        return existing_spouse
            
            # check if spouse insertion is allowed
            if spouse_info.get('allow_spouse_insertion', False):
                print(f"Creating new spouse. Reason: {spouse_info.get('reason', 'Unknown')}")
                return Spouse.objects.create(**spouse_data)
            else:
                print("Spouse insertion not allowed")
                return None
                
        except Exception as e:
            print(f"Error in spouse logic: {str(e)}")
            # fallback: try to create spouse if there's an error
            try:
                return Spouse.objects.create(**spouse_data)
            except Exception as create_error:
                print(f"Error creating spouse: {str(create_error)}")
                return None

    def create(self, validated_data):
        print(f"Creating postpartum record with validated data: {validated_data}")
        
        # validated data
        delivery_data = validated_data.pop('delivery_record')
        assessments_data = validated_data.pop('assessments', [])
        spouse_data = validated_data.pop('spouse_data', None)
        
        vital_bp_systolic = validated_data.pop('vital_bp_systolic')
        vital_bp_diastolic = validated_data.pop('vital_bp_diastolic')
        
        followup_date = validated_data.pop('followup_date')
        followup_description = validated_data.pop('followup_description')
        
        pat_id = validated_data.pop('pat_id')
        patrec_type = validated_data.pop('patrec_type')

        try:
            with transaction.atomic():
                # Verify patient exists
                patient = Patient.objects.get(pat_id=pat_id)
                print(f"Found patient: {patient.pat_id}")
                
				#  pregnancy creation logic
                pregnancy = None
                current_datetime = timezone.now()
                current_date = current_datetime.date()
                
				# first, check if patient has an active pregnancy
                recent_active_pregnancy = Pregnancy.objects.filter(pat_id=patient, status='active').first()
                if recent_active_pregnancy:
                    print("Found active pregnancy: {recently_active_pregnancy.pregnancy_id}. Marking as completed")
                    recent_active_pregnancy.status = "completed"
                    recent_active_pregnancy.updated_at = current_datetime
                    recent_active_pregnancy.prenatal_end_date = current_date
                    recent_active_pregnancy.postpartum_end_date = None
                    recent_active_pregnancy.save()
                    pregnancy = recent_active_pregnancy
                
				# second, check if there are any completed pregnancies that is within 45 days
                else:
                    forty_five_days_ago = current_date - timedelta(days=45)
                    recent_completed_pregnancy = Pregnancy.objects.filter(
                        pat_id=patient, 
                        status='completed', 
                        prenatal_end_date__gte=forty_five_days_ago,
                        prenatal_end_date__lte=current_date
                    ).order_by('-prenatal_end_date').first()
                    
                    if recent_completed_pregnancy:
                        print(f'Found recent completed pregnancy: {recent_completed_pregnancy.pregnancy_id}')
                        pregnancy = recent_completed_pregnancy
                    
                    # if no completed then create new pregnancy
                    else:
                        current_yr = current_datetime.year
                        current_yr_suffix = str(current_yr)[-2:]
                        prefix = f'PREG-{current_yr}-{current_yr_suffix}'
                        existing_preg_max = Pregnancy.objects.filter(
                            pregnancy_id__startswith=prefix
                        ).aggregate(
                            max_num = Max('pregnancy_id')
                        )
                        
                        if existing_preg_max['max_num']:
                            last_preg_id = existing_preg_max['max_num']
                            last_num = int(last_preg_id[-4:])
                            new_num = last_num + 1
                        else:
                            new_num = 1
                        
                        new_pregnancy_id = f'{prefix}{str(new_num).zfill(4)}'

                        pregnancy = Pregnancy.objects.create(
                            pregnancy_id=new_pregnancy_id,
                            pat_id=patient,
                            status='active',
                            created_at=current_date,
                            updated_at=current_date,
                            prenatal_end_date=None,
                            postpartum_end_date=None
                        )
                        print(f'Created new Pregnancy: {pregnancy.pregnancy_id}')
                
                # Create PatientRecord first
                patient_record = PatientRecord.objects.create(
                    patrec_type=patrec_type,
                    pat_id=patient  # Pass the patient object, not the ID
                )
                print(f"Created patient record: {patient_record.patrec_id}")
                
                # Create VitalSigns with only BP data
                vital_signs = VitalSigns.objects.create(
                    vital_bp_systolic=vital_bp_systolic,
                    vital_bp_diastolic=vital_bp_diastolic,
                    vital_temp="N/A",
                    vital_RR="N/A",
                    vital_o2="N/A",
                    vital_pulse="N/A"
                )
                print(f"Created vital signs: {vital_signs.vital_id}")
                
                # Handle spouse logic using your existing business rules
                spouse = self.handle_spouse_logic(patient, spouse_data)
                if spouse:
                    print(f"Using spouse: {spouse.spouse_id}")
                else:
                    print("No spouse created/used")
                
                # Create FollowUpVisit with pending status
                follow_up_visit = FollowUpVisit.objects.create(
                    followv_date=followup_date,
                    followv_status="pending",
                    followv_description=followup_description,
                    patrec=patient_record
                )
                print(f"Created follow-up visit: {follow_up_visit.followv_id}")
                
                # create PostpartumRecord - check if pf_id column exists first
                # existing_ppr = PostpartumRecord.objects.filter(
                #     patrec_id__pat_id=patient,
                #     pregnancy_id=pregnancy,
                # ).first()

                # if existing_ppr:
                #     postpartum_history = PostpartumHistory.objects.create(
                #         ppr_id=existing_ppr,
                #         created_at=current_datetime,
                #     )
                #     return existing_ppr
                # else:


                postpartum_data = {
                    'patrec_id': patient_record,
                    'vital_id': vital_signs,
                    'spouse_id': spouse,
                    'followv_id': follow_up_visit,
                    'pregnancy_id': pregnancy,
                    # **validated_data
                }
                postpartum_data.update(validated_data)
                
                postpartum_record = PostpartumRecord.objects.create(**postpartum_data)
                print(f"Created postpartum record: {postpartum_record.ppr_id}")
                
                # postpartum_history = PostpartumHistory.objects.create(
                #     ppr_id=postpartum_record,
                # )

                # create PostpartumDeliveryRecord
                delivery_record = PostpartumDeliveryRecord.objects.create(
                    ppr_id=postpartum_record,
                    **delivery_data
                )
                print(f"Created delivery record: {delivery_record.ppdr_id}")
                
                # create PostpartumAssessments
                for i, assessment_data in enumerate(assessments_data):
                    assessment = PostpartumAssessment.objects.create(
                        ppr_id=postpartum_record,
                        **assessment_data
                    )
                    print(f"Created assessment {i+1}: {assessment.ppa_id}")
                
                print(f"Successfully created complete postpartum record: {postpartum_record.ppr_id}")
                return postpartum_record
                
        except Patient.DoesNotExist:
            error_msg = f"Patient with ID {pat_id} does not exist"
            print(error_msg)
            raise serializers.ValidationError(error_msg)
        except Exception as e:
            error_msg = f"Error creating postpartum record: {str(e)}"
            print(error_msg)
            raise serializers.ValidationError(error_msg)

    def to_representation(self, instance):
        # Get the base representation but exclude the nested fields that don't exist on the instance
        representation = super().to_representation(instance)
        
        # Only include fields that actually exist on the PostpartumRecord instance
        for field_name, field in self.fields.items():
            if field_name in ['delivery_record', 'assessments', 'spouse_data', 
				'vital_bp_systolic', 'vital_bp_diastolic', 
				'followup_date', 'followup_description', 
				'pat_id', 'patrec_type']:
                continue
            
            if hasattr(instance, field_name):
                attribute = field.get_attribute(instance)
                if attribute is not None:
                    representation[field_name] = field.to_representation(attribute)
        
        if instance.pregnancy_id:
            representation['pregnancy'] = {
                'pregnancy_id': instance.pregnancy_id.pregnancy_id,
                'status': instance.pregnancy_id.status,
                'created_at': instance.pregnancy_id.created_at,
                'updated_at': instance.pregnancy_id.updated_at,
                'prenatal_end_date': instance.pregnancy_id.prenatal_end_date,
                'postpartum_end_date': instance.pregnancy_id.postpartum_end_date,
                'pat_id': instance.pregnancy_id.pat_id.pat_id
            }
        else:
            representation['pregnancy'] = None
        
        # Add the created patrec_id to the response
        representation['patrec_id'] = instance.patrec_id.patrec_id if instance.patrec_id else None
        
        # Add delivery records using the correct related name
        try:
            delivery_records = instance.postpartum_delivery_record.all()
            representation['delivery_records'] = PostpartumDeliveryRecordSerializer(
                delivery_records, many=True
            ).data
        except Exception as e:
            print(f"Error getting delivery records: {e}")
            representation['delivery_records'] = []
        
        # Add assessments - you'll need to provide the correct related name for PostpartumAssessment
        try:
            assessments = instance.postpartum_assessment.all()
            representation['assessments'] = PostpartumAssessmentSerializer(
                assessments, many=True
            ).data
        except Exception as e:
            print(f"Error getting assessments: {e}")
            representation['assessments'] = []
        
        
        # Add vital signs data
        if instance.vital_id:
            representation['vital_signs'] = {
                'vital_id': instance.vital_id.vital_id,
                'vital_bp_systolic': instance.vital_id.vital_bp_systolic,
                'vital_bp_diastolic': instance.vital_id.vital_bp_diastolic
            }
        else:
            representation['vital_signs'] = None
        
        # Add spouse data
        if instance.spouse_id:
            representation['spouse'] = {
                'spouse_id': instance.spouse_id.spouse_id,
                'spouse_lname': instance.spouse_id.spouse_lname,
                'spouse_fname': instance.spouse_id.spouse_fname,
                'spouse_mname': instance.spouse_id.spouse_mname,
                'spouse_occupation': instance.spouse_id.spouse_occupation
            }
        else:
            representation['spouse'] = None
        
        # Add follow-up visit data
        if instance.followv_id:
            representation['follow_up_visit'] = {
                'followv_id': instance.followv_id.followv_id,
                'followv_date': instance.followv_id.followv_date,
                'followv_status': instance.followv_id.followv_status,
                'followv_description': instance.followv_id.followv_description
            }
        else:
            representation['follow_up_visit'] = None
        
        return representation


class PrenatalCareSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrenatalCare
        fields = [
            'pfpc_id', 'pf_id', 'pfpc_date', 'pfpc_aog_wks', 'pfpc_aog_days', 'pfpc_fundal_ht',
            'pfpc_fetal_hr', 'pfpc_fetal_pos', 'pfpc_complaints', 'pfpc_advises'
        ]



class PregnancyDetailSerializer(serializers.ModelSerializer):
    prenatal_form = PrenatalDetailViewSerializer(many=True, read_only=True)
    postpartum_record = PostpartumDetailViewSerializer(many=True, read_only=True)
    pat_id = serializers.CharField(source='pat_id.pat_id', read_only=True)
    prenatal_care = serializers.SerializerMethodField()

    class Meta:
        model = Pregnancy
        fields = ['pregnancy_id', 'status', 'created_at', 'updated_at',
                  'prenatal_end_date', 'postpartum_end_date', 'pat_id',
                 'prenatal_form', 'prenatal_care', 'postpartum_record']

    def get_prenatal_care(self, obj):
        """
        Get prenatal_care entry for a specific record
        """
        try:
            prenatal_forms = obj.prenatal_form.all()  # related_name='prenatal_form'
            
            prenatal_care_data = []
            
            for pf in prenatal_forms:
                # Get prenatal care records for each prenatal form
                prenatal_care_records = pf.pf_prenatal_care.all()  # related_name='pf_prenatal_care'
                
                for pc_record in prenatal_care_records:
                    prenatal_care_serializer = PrenatalCareSerializer(
                        pc_record, 
                        context=self.context
                    )
                    prenatal_care_data.append(prenatal_care_serializer.data)
            
            return prenatal_care_data
                
        except Exception as e:
            print(f'Error getting prenatal care: {str(e)}')
            return []