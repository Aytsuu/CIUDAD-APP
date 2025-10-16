from rest_framework import serializers
from django.db import transaction 
from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Max

from apps.patientrecords.models import *
from apps.maternal.models import *
from ..serializers.serializer import *
from apps.maternal.serializers.postpartum_serializer import *
from apps.patientrecords.serializers.patients_serializers import *
from apps.administration.models import Staff 
from apps.healthProfiling.models import PersonalAddress, FamilyComposition
from apps.vaccination.models import VaccinationRecord, VaccinationHistory
from apps.inventory.models import VaccineStock
from apps.medicineservices.models import MedicineRecord

from ..utils import check_medical_records_for_spouse, handle_spouse_logic


# serializer for Complete Prenatal Form for Comparison Table
class PrenatalDetailSerializer(serializers.ModelSerializer):
    # Related model serializers for reading
    pregnancy_details = serializers.SerializerMethodField()
    patient_record_details = serializers.SerializerMethodField()
    
    spouse_details = SpouseSerializer(source='spouse_id', read_only=True)
    body_measurement_details = BodyMeasurementReadSerializer(source='bm_id', read_only=True)
    vital_signs_details = serializers.SerializerMethodField()
    follow_up_visit_details = serializers.SerializerMethodField()
    staff_details = serializers.SerializerMethodField()
    
    # Related nested data
    previous_hospitalizations = serializers.SerializerMethodField()
    previous_pregnancy = serializers.SerializerMethodField()
    tt_statuses = serializers.SerializerMethodField()
    laboratory_results = serializers.SerializerMethodField()
    anc_visit_guide = serializers.SerializerMethodField()
    checklist_data = serializers.SerializerMethodField()
    birth_plan_details = serializers.SerializerMethodField()
    obstetric_risk_codes = serializers.SerializerMethodField()
    prenatal_care_entries = PrenatalCareCreateSerializer(source='pf_prenatal_care', many=True, read_only=True)

    class Meta:
        model = Prenatal_Form
        fields = [
            'pf_id', 'pf_edc', 'pf_occupation', 'previous_complications', 'created_at',
            'pregnancy_details', 'patient_record_details', 'spouse_details', 
            'body_measurement_details', 'vital_signs_details', 'follow_up_visit_details',
            'staff_details', 'previous_hospitalizations', 'tt_statuses', 
            'laboratory_results', 'anc_visit_guide', 'checklist_data', 'previous_pregnancy',
            'birth_plan_details', 'obstetric_risk_codes', 'prenatal_care_entries'
        ]

    def get_pregnancy_details(self, obj):
        if obj.pregnancy_id:
            return {
                'pregnancy_id': obj.pregnancy_id.pregnancy_id,
                'status': obj.pregnancy_id.status,
                'created_at': obj.pregnancy_id.created_at,
                'updated_at': obj.pregnancy_id.updated_at,
                'prenatal_end_date': obj.pregnancy_id.prenatal_end_date,
                'postpartum_end_date': obj.pregnancy_id.postpartum_end_date,
            }
        return None

    def get_patient_record_details(self, obj):
        if obj.patrec_id:
            return {
                'patrec_id': obj.patrec_id.patrec_id,
                'patrec_type': obj.patrec_id.patrec_type,
                'created_at': obj.patrec_id.created_at,
                'patient_id': obj.patrec_id.pat_id.pat_id
            }
        return None
    
    def get_spouse_details(self, obj):
        try:
            # handle Resident patients
            if obj.pat_type == 'Resident' and obj.rp_id:
                family_heads_info = self.get_family_head_info(obj)
                current_family_info = self.get_family(obj)
                
                # if no family composition found, allow spouse insertion
                if not family_heads_info or not current_family_info:
                    medical_spouse = check_medical_records_for_spouse(self, obj)
                    if not medical_spouse.get('spouse_exists', False):
                        return {
                            'spouse_exists': False,
                            'allow_spouse_insertion': True,
                            'reason': 'No family composition found - can add spouse'
                        }
                    return medical_spouse
                
                current_role = current_family_info['fc_role'].lower()
                family_heads = family_heads_info['family_heads']
                
                # only apply family composition spouse logic for Mother/Father roles
                if current_role not in ['mother', 'father']:
                    medical_spouse = check_medical_records_for_spouse(self, obj)
                    
                    # if no spouse in patient records, allow spouse insertion
                    if not medical_spouse.get('spouse_exists', False):
                        return {
                            'spouse_exists': False,
                            'allow_spouse_insertion': True,
                            'reason': f'Resident has {current_role} role - can add spouse independently'
                        }
                    
                    return medical_spouse
                
                # mother's spouse is Father, Father's spouse is Mother
                spouse_role = 'father' if current_role == 'mother' else 'mother'
                
                if spouse_role in family_heads:
                    # spouse exists in family composition
                    spouse_info = family_heads[spouse_role]
                    personal_info = spouse_info['personal_info']
                    
                    return {
                        'spouse_exists': True,
                        'spouse_source': 'family_composition',
                        'spouse_info': {
                            'rp_id': spouse_info['rp_id'],
                            'spouse_lname': personal_info.get('per_lname', ''),
                            'spouse_fname': personal_info.get('per_fname', ''),
                            'spouse_mname': personal_info.get('per_mname', ''),
                            'spouse_dob': personal_info.get('per_dob', ''),
                            'spouse_occupation': personal_info.get('per_occupation', ''),
                            'fc_role': spouse_info['role'],
                            'composition_id': spouse_info['composition_id']
                        }
                    }
                else:
                    # no spouse in family composition, allow insertion
                    spouse_role_title = spouse_role.title()
                    return {
                        'spouse_exists': False,
                        'allow_spouse_insertion': True,
                        'reason': f'{current_role.title()} role found but no {spouse_role_title} in family composition'
                    }
            
            # handle transient patients
            elif obj.pat_type == 'Transient':
                # check patient records first for transients
                medical_spouse = check_medical_records_for_spouse(self, obj)
                
                # ff no spouse in medical records, allow spouse insertion
                if not medical_spouse.get('spouse_exists', False):
                    return {
                        'spouse_exists': False,
                        'allow_spouse_insertion': True,
                        'reason': 'Transient patient - can add spouse'
                    }
                
                return medical_spouse
            
            else:
                return {
                    'spouse_exists': False,
                    'allow_spouse_insertion': True,
                    'reason': 'Unknown patient type - can add spouse'
                }
        
        except Exception as e:
            print(f"Error in get_spouse_info: {str(e)}")
            return {
                'spouse_exists': False,
                'allow_spouse_insertion': True,
                'reason': f'Error occurred: {str(e)}'
            }
        
    def get_previous_pregnancy(self, obj):
        if obj.patrec_id:
            try:
                latest_prev_pregnancy = Previous_Pregnancy.objects.filter(
                    patrec_id=obj.patrec_id
                ).select_related('patrec_id').order_by('-pfpp_id').first()

                if not latest_prev_pregnancy:
                    return None
                
                return{
                    'pfpp_id':latest_prev_pregnancy.pfpp_id,
                    'date_of_delivery': latest_prev_pregnancy.date_of_delivery,
                    'outcome': latest_prev_pregnancy.outcome,
                    'type_of_delivery': latest_prev_pregnancy.type_of_delivery,
                    'babys_wt': latest_prev_pregnancy.babys_wt,
                    'gender': latest_prev_pregnancy.gender,
                    'ballard_score': latest_prev_pregnancy.ballard_score,
                    'apgar_score': latest_prev_pregnancy.apgar_score
                }
            
            except Exception as e:
                print(f"Error getting previous pregnancy: {e}")
                return None

    def get_vital_signs_details(self, obj):
        if obj.vital_id:
            return {
                'vital_id': obj.vital_id.vital_id,
                'vital_bp_systolic': obj.vital_id.vital_bp_systolic,
                'vital_bp_diastolic': obj.vital_id.vital_bp_diastolic,
                'vital_temp': obj.vital_id.vital_temp,
                'vital_RR': obj.vital_id.vital_RR,
                'vital_o2': obj.vital_id.vital_o2,
                'vital_pulse': obj.vital_id.vital_pulse,
                'created_at': obj.vital_id.created_at
            }
        return None

    def get_follow_up_visit_details(self, obj):
        if obj.followv_id:
            return {
                'followv_id': obj.followv_id.followv_id,
                'followv_date': obj.followv_id.followv_date,
                'followv_status': obj.followv_id.followv_status,
                'followv_description': obj.followv_id.followv_description,
                'created_at': obj.followv_id.created_at,
                'completed_at': obj.followv_id.completed_at
            }
        return None

    def get_staff_details(self, obj):
        if obj.staff:
            return {
                'staff_id': obj.staff.staff_id,
                'staff_fname': getattr(obj.staff, 'staff_fname', 'Unknown'),
                'staff_lname': getattr(obj.staff, 'staff_lname', 'Unknown'),
            }
        return None

    def get_previous_hospitalizations(self, obj):
        hospitalizations = obj.pf_previous_hospitalization.all()
        return [{
            'pfph_id': hosp.pfph_id,
            'prev_hospitalization': hosp.prev_hospitalization,
            'prev_hospitalization_year': hosp.prev_hospitalization_year
        } for hosp in hospitalizations]

    def get_tt_statuses(self, obj):
        # TT_Status now links to Patient via pat_id. Retrieve by patient on the related patient record.
        if obj.patrec_id and obj.patrec_id.pat_id:
            patient = obj.patrec_id.pat_id
            tts_qs = TT_Status.objects.filter(pat_id=patient).order_by('-tts_date_given', '-tts_id')
            return [{
                'tts_id': tt.tts_id,
                'tts_status': tt.tts_status,
                'tts_date_given': tt.tts_date_given,
                'tts_tdap': tt.tts_tdap
            } for tt in tts_qs]
        return []

    def get_laboratory_results(self, obj):
        lab_results = obj.lab_result.all()
        lab_data = []
        for lab in lab_results:
            lab_images = [{
                'lab_img_id': img.lab_img_id,
                'image_url': img.image_url,
                'image_name': img.image_name,
                'image_type': img.image_type,
                'image_size': img.image_size
            } for img in lab.lab_result_img.all()]
            
            lab_data.append({
                'lab_id': str(lab.lab_id),
                'lab_type': lab.lab_type,
                'result_date': lab.result_date,
                'is_completed': lab.is_completed,
                'to_be_followed': lab.to_be_followed,
                'document_path': lab.document_path,
                'remarks': lab.remarks,
                'images': lab_images,
                'created_at': lab.created_at
            })
        return lab_data

    def get_anc_visit_guide(self, obj):
        anc_visit = obj.pf_anc_visit.first()
        if anc_visit:
            return {
                'pfav_id': anc_visit.pfav_id,
                'pfav_1st_tri': anc_visit.pfav_1st_tri,
                'pfav_2nd_tri': anc_visit.pfav_2nd_tri,
                'pfav_3rd_tri_one': anc_visit.pfav_3rd_tri_one,
                'pfav_3rd_tri_two': anc_visit.pfav_3rd_tri_two
            }
        return None

    def get_checklist_data(self, obj):
        checklist = obj.pf_checklist.first()
        if checklist:
                return {
                    'pfc_id': checklist.pfc_id,
                    'increased_bp': checklist.increased_bp,
                    'nausea': checklist.nausea,
                    'edema': checklist.edema,
                    'abno_vaginal_disch': checklist.abno_vaginal_disch,
                    'chills_fever': checklist.chills_fever,
                    'varicosities': checklist.varicosities,
                    'epigastric_pain': checklist.epigastric_pain,
                    'blurring_vision': checklist.blurring_vision,
                    'severe_headache': checklist.severe_headache,
                    'vaginal_bleeding': checklist.vaginal_bleeding,
                    'diff_in_breathing': checklist.diff_in_breathing,
                    'abdominal_pain': checklist.abdominal_pain,
                    'created_at': checklist.created_at
                }
        return None

    def get_birth_plan_details(self, obj):
        birth_plan = obj.pf_birth_plan.first()
        if birth_plan:
            return {
                'pfbp_id': birth_plan.pfbp_id,
                'place_of_delivery_plan': birth_plan.place_of_delivery_plan,
                'newborn_screening_plan': birth_plan.newborn_screening_plan,
                'created_at': birth_plan.created_at
            }
        return None

    def get_obstetric_risk_codes(self, obj):
        risk_codes = obj.pf_obstetric_risk_code.first()
        if risk_codes:
            return {
                'pforc_id': risk_codes.pforc_id,
                'pforc_prev_c_section': risk_codes.pforc_prev_c_section,
                'pforc_3_consecutive_miscarriages': risk_codes.pforc_3_consecutive_miscarriages,
                'pforc_postpartum_hemorrhage': risk_codes.pforc_postpartum_hemorrhage
            }
        return None


# serializer for url /prenatal/pf_id/complete/
class PrenatalFormCompleteViewSerializer(serializers.ModelSerializer):
    # Patient details
    patient_details = serializers.SerializerMethodField()
    pregnancy_details = serializers.SerializerMethodField()
    vital_signs_details = serializers.SerializerMethodField()
    body_measurement_details = serializers.SerializerMethodField()
    spouse_details = serializers.SerializerMethodField()
    follow_up_visit_details = serializers.SerializerMethodField()
    staff_details = serializers.SerializerMethodField()
    tt_statuses = serializers.SerializerMethodField()

    previous_pregnancy = serializers.SerializerMethodField()
    obstetric_history = serializers.SerializerMethodField()
    medical_history = serializers.SerializerMethodField()

    # Related data
    previous_hospitalizations = serializers.SerializerMethodField()
    laboratory_results = serializers.SerializerMethodField()
    anc_visit_guide = serializers.SerializerMethodField()
    checklist_data = serializers.SerializerMethodField()
    birth_plan_details = serializers.SerializerMethodField()
    obstetric_risk_codes = serializers.SerializerMethodField()
    prenatal_care_entries = serializers.SerializerMethodField()
    
    # Vaccination and Medicine records
    vaccination_records = serializers.SerializerMethodField()
    medicine_records = serializers.SerializerMethodField()
    
    class Meta:
        model = Prenatal_Form
        fields = [
            'pf_id', 'pf_edc', 'pf_occupation', 'previous_complications', 'created_at',
            'patient_details', 'pregnancy_details', 'vital_signs_details', 'tt_statuses',
            'body_measurement_details', 'spouse_details', 'follow_up_visit_details', 'obstetric_history',
            'staff_details', 'previous_hospitalizations','previous_pregnancy', 'medical_history',
            'laboratory_results', 'anc_visit_guide', 'checklist_data', 'birth_plan_details',
            'obstetric_risk_codes', 'prenatal_care_entries', 'vaccination_records', 'medicine_records'
        ]
    
    def get_patient_details(self, obj):
        if obj.patrec_id and obj.patrec_id.pat_id:
            patient = obj.patrec_id.pat_id
            
            # Initialize the response structure
            patient_data = {
                'pat_id': patient.pat_id,
                'pat_type': patient.pat_type,
                'personal_info': None,
                'address': None,
                'family': None
            }
            
            # Handle Resident patients
            if patient.pat_type == 'Resident' and patient.rp_id:
                try:
                    # Get personal info from ResidentProfile -> Personal
                    if hasattr(patient.rp_id, 'per') and patient.rp_id.per:
                        personal = patient.rp_id.per
                        patient_data['personal_info'] = {
                            'per_fname': personal.per_fname,
                            'per_lname': personal.per_lname,
                            'per_mname': personal.per_mname,
                            'per_dob': personal.per_dob,
                            'per_sex': personal.per_sex,
                            'per_contact': personal.per_contact,
                            'per_status': personal.per_status,
                            'per_religion': personal.per_religion,
                            'per_edAttainment': personal.per_edAttainment,
                        }
                        
                        # Get address from Personal -> PersonalAddress -> Address
                        try:
                            personal_address = PersonalAddress.objects.filter(
                                per=personal
                            ).select_related('add', 'add__sitio').first()
                            
                            if personal_address and personal_address.add:
                                address = personal_address.add
                                patient_data['address'] = {
                                    'add_street': address.add_street,
                                    'add_sitio': address.sitio.sitio_name if hasattr(address, 'sitio') and address.sitio else None,
                                    'add_barangay': address.add_barangay,
                                    'add_city': address.add_city,
                                    'add_province': address.add_province,
                                }
                            else:
                                print(f"No PersonalAddress found for personal ID: {personal.per_id}")
                                
                        except Exception as e:
                            print(f"Error getting resident address: {e}")
                            # Try alternative approach - check if address is directly on personal
                            try:
                                if hasattr(personal, 'add_street'):
                                    patient_data['address'] = {
                                        'add_street': getattr(personal, 'add_street', None),
                                        'add_sitio': getattr(personal, 'add_sitio', None),
                                        'add_barangay': getattr(personal, 'add_barangay', None),
                                        'add_city': getattr(personal, 'add_city', None),
                                        'add_province': getattr(personal, 'add_province', None),
                                    }
                            except Exception as e2:
                                print(f"Alternative address approach failed: {e2}")
                        
                        # Get family info from FamilyComposition
                        try:
                            family_composition = FamilyComposition.objects.filter(
                                rp=patient.rp_id
                            ).select_related('fam').first()

                            if family_composition and family_composition.fam:
                                # Get all family members to find MOTHER and FATHER roles
                                family_members = FamilyComposition.objects.filter(
                                    fam=family_composition.fam
                                ).select_related('rp', 'rp__per')
                                
                                family_heads = {}
                                for member in family_members:
                                    role = member.fc_role.lower()
                                    if role in ['father'] and member.rp and member.rp.per:
                                        family_heads[role] = {
                                            'rp_id': member.rp.rp_id,
                                            'role': member.fc_role,
                                            'composition_id': member.fc_id,
                                            'personal_info': {
                                                'per_lname': member.rp.per.per_lname,
                                                'per_fname': member.rp.per.per_fname,
                                                'per_mname': member.rp.per.per_mname,
                                                'per_dob': member.rp.per.per_dob,
                                                'per_sex': member.rp.per.per_sex,
                                                # 'per_occupation': getattr(ember.rp.per, 'per_occupation', ''),
                                            }
                                        }
                                
                                patient_data['family'] = {
                                    'fam_id': family_composition.fam.fam_id,
                                    'fc_role': family_composition.fc_role,
                                    'fam_date_registered': family_composition.fam.fam_date_registered,
                                    'family_heads': family_heads,  # Include MOTHER and FATHER details
                                }
                            else:
                                patient_data['family'] = {
                                    'fam': None,
                                    'note': 'No family composition found for this resident'
                                }
                        except Exception as e:
                            print(f"Error getting family info: {e}")
                            
                except Exception as e:
                    print(f"Error processing resident patient: {e}")
            
            # Handle Transient patients
            elif patient.pat_type == 'Transient' and patient.trans_id:
                try:
                    transient = patient.trans_id
                    patient_data['personal_info'] = {
                        'per_fname': transient.tran_fname,
                        'per_lname': transient.tran_lname,
                        'per_mname': transient.tran_mname,
                        'per_dob': transient.tran_dob,
                        'per_sex': transient.tran_sex,
                        'per_contact': transient.tran_contact,
                        'per_status': transient.tran_status,
                        'per_religion': transient.tran_religion,
                        'per_edAttainment': transient.tran_ed_attainment,
                    }
                    
                    # Get transient address
                    if transient.tradd_id:
                        trans_address = transient.tradd_id  # This is the TransientAddress object
                        patient_data['address'] = {
                            'add_street': trans_address.tradd_street,
                            'add_sitio': trans_address.tradd_sitio,
                            'add_barangay': trans_address.tradd_barangay,
                            'add_city': trans_address.tradd_city,
                            'add_province': trans_address.tradd_province,
                        }
                    else:
                        # No address associated with this transient
                        patient_data['address'] = None
                    
                    # Transients don't have family compositions
                    patient_data['family'] = {
                        'fam': None,
                        'note': 'Transient patients do not have family compositions'
                    }
                    
                    # Transients don't have family compositions
                    patient_data['family'] = {
                        'fam': None,
                        'note': 'Transient patients do not have family compositions'
                    }
                    
                except Exception as e:
                    print(f"Error processing transient patient: {e}")
            
            return patient_data
        return None
    
    def get_pregnancy_details(self, obj):
        if obj.pregnancy_id:
            return {
                'pregnancy_id': obj.pregnancy_id.pregnancy_id,
                'status': obj.pregnancy_id.status,
                'created_at': obj.pregnancy_id.created_at,
            }
        return None

    def get_previous_pregnancy(self, obj):
        try:
            prev_pregnancy = Previous_Pregnancy.objects.filter(patrec_id=obj.patrec_id).first()
            if prev_pregnancy:
                return {
                    'pfpp_id': prev_pregnancy.pfpp_id,
                    'date_of_delivery': prev_pregnancy.date_of_delivery,
                    'outcome': prev_pregnancy.outcome,
                    'type_of_delivery': prev_pregnancy.type_of_delivery,
                    'babys_wt': prev_pregnancy.babys_wt,
                    'gender': prev_pregnancy.gender,
                    'ballard_score': prev_pregnancy.ballard_score,
                    'apgar_score': prev_pregnancy.apgar_score,
                }
            return None
        
        except Exception as e:
            print(f'Error retrieving previous pregnancy details: {e}')
            return None

    def get_obstetric_history(self, obj):
        try:
            obs_history = Obstetrical_History.objects.filter(patrec_id=obj.patrec_id).order_by('obs_id').first()
            if obs_history:
                return {
                    'obs_id': obs_history.obs_id,
                    'obs_ch_born_alive': obs_history.obs_ch_born_alive,
                    'obs_living_ch': obs_history.obs_living_ch,
                    'obs_abortion': obs_history.obs_abortion,
                    'obs_still_birth': obs_history.obs_still_birth,
                    'obs_lg_babies': obs_history.obs_lg_babies,
                    'obs_lg_babies_str': obs_history.obs_lg_babies_str,
                    'obs_gravida': obs_history.obs_gravida,
                    'obs_para': obs_history.obs_para,
                    'obs_fullterm': obs_history.obs_fullterm,
                    'obs_preterm': obs_history.obs_preterm,
                    'obs_lmp': obs_history.obs_lmp,
                }
            return None

        except Exception as e:
            print(f'Error retrieving obstetrical history details: {e}')
            return None
        
    def get_medical_history(self, obj):
        if obj.patrec_id:
            # Use date() method to ensure we're comparing dates, not datetimes
            # This ensures medical history records created on the same day or before are included
            # prenatal_date = obj.created_at if isinstance(obj.created_at, date) else obj.created_at.date()
            cutoff_time = obj.created_at + timedelta(seconds=5)
            
            medical_history = MedicalHistory.objects.filter(
                patrec__pat_id=obj.patrec_id.pat_id,  # Filter by patient across all their records
                created_at__lte=cutoff_time  # Use __date lookup to compare date parts only
            ).select_related('ill').order_by('-created_at')
            
            return [{
                'ill_id': mh.ill.ill_id if mh.ill else None,
                'illness_name': mh.ill.illname if mh.ill else None,
                'ill_date': mh.ill_date,
            } for mh in medical_history]
        return []

    def get_vital_signs_details(self, obj):
        if obj.vital_id:
            return {
                'vital_bp_systolic': obj.vital_id.vital_bp_systolic,
                'vital_bp_diastolic': obj.vital_id.vital_bp_diastolic,
                'vital_temp': obj.vital_id.vital_temp,
                'vital_pulse_rate': obj.vital_id.vital_pulse,
            }
        return None

    def get_body_measurement_details(self, obj):
        if obj.bm_id:
            return {
                'weight': obj.bm_id.weight,
                'height': obj.bm_id.height,
                # 'age': obj.bm_id.age,
            }
        return None
    
    def get_spouse_details(self, obj):
        if obj.spouse_id:
            return {
                'spouse_fname': obj.spouse_id.spouse_fname,
                'spouse_lname': obj.spouse_id.spouse_lname,
                'spouse_mname': obj.spouse_id.spouse_mname,
                'spouse_occupation': obj.spouse_id.spouse_occupation,
            }
        return None
    
    def get_follow_up_visit_details(self, obj):
        if obj.followv_id:
            return {
                'followv_id': obj.followv_id.followv_id,
                'followv_date': obj.followv_id.followv_date,
                'followv_status': obj.followv_id.followv_status,
                'followv_description': obj.followv_id.followv_description,
            }
        return None
    
    def get_tt_statuses(self, obj):
        if obj.patrec_id and obj.patrec_id.pat_id:
            patient = obj.patrec_id.pat_id
            
            # Use date() method to ensure we're comparing dates, not datetimes
            # This ensures TT records created on the same day or before are included
            # prenatal_date = obj.created_at if isinstance(obj.created_at, date) else obj.created_at.date()
            cutoff_time = obj.created_at + timedelta(seconds=5)

            tts = TT_Status.objects.filter(
                pat_id=patient,
                created_at__lte=cutoff_time  # Use __date lookup to compare date parts only
            ).order_by('-tts_date_given', '-tts_id')
            return [{
                'tts_id': tt.tts_id,
                'tts_status': tt.tts_status,
                'tts_date_given': tt.tts_date_given,
                'tts_tdap': tt.tts_tdap  # Include tts_tdap field
            } for tt in tts]
        return []
    
    def get_staff_details(self, obj):
        if obj.staff:
            staff = obj.staff
            staff_name = None
            if hasattr(staff, 'rp') and staff.rp and hasattr(staff.rp, 'per') and staff.rp.per:
                personal = staff.rp.per
                name_parts = [personal.per_fname, personal.per_mname, personal.per_lname]
                staff_name = ' '.join([part for part in name_parts if part])
                
            return {
                'staff_id': staff.staff_id,
                'staff_name': staff_name
            }
        return None
    
    def get_previous_hospitalizations(self, obj):
        if not obj.patrec_id or not obj.patrec_id.pat_id:
            return []
        
        patient = obj.patrec_id.pat_id

        earlier_pfs = Prenatal_Form.objects.filter(
            patrec_id__pat_id=patient,
            created_at__lte=obj.created_at
        )
        prev_hospis = Previous_Hospitalization.objects.filter(
            pf_id__in=earlier_pfs,
        ).order_by('-pfph_id')

        return [{
            'pfph_id': hosp.pfph_id,
            'prev_hospitalization': hosp.prev_hospitalization,
            'prev_hospitalization_year': hosp.prev_hospitalization_year,
        } for hosp in prev_hospis]

    
    def get_laboratory_results(self, obj):
        if not obj.patrec_id or not obj.patrec_id.pat_id:
            return []
        patient = obj.patrec_id.pat_id
        
        # Use __date lookup to compare date parts only
        cutoff_time = obj.created_at + timedelta(seconds=5)
        
        lab_results = LaboratoryResult.objects.filter(
            pf_id__patrec_id__pat_id=patient,
            created_at__lte=cutoff_time  # Use __date lookup for proper comparison
        ).order_by('-result_date', '-lab_id')
        return [{
            'lab_id': str(lab.lab_id),
            'lab_type': lab.lab_type,
            'result_date': lab.result_date,
            'to_be_followed': lab.to_be_followed,
            'is_completed': lab.is_completed,
            'remarks': lab.remarks,
        } for lab in lab_results]


    def get_anc_visit_guide(self, obj):
        anc_visit = obj.pf_anc_visit.first()
        if anc_visit:
            return {
                'pfav_id': anc_visit.pfav_id,
                'pfav_1st_tri': anc_visit.pfav_1st_tri,
                'pfav_2nd_tri': anc_visit.pfav_2nd_tri,
                'pfav_3rd_tri_one': anc_visit.pfav_3rd_tri_one,
                'pfav_3rd_tri_two': anc_visit.pfav_3rd_tri_two,
            }
        return None
    
    def get_checklist_data(self, obj):
        checklist = obj.pf_checklist.first()
        if checklist:
            return {
                'pfc_id': checklist.pfc_id,
                'increased_bp': checklist.increased_bp,
                'nausea': checklist.nausea,
                'edema': checklist.edema,
                'abno_vaginal_disch': checklist.abno_vaginal_disch,
                'chills_fever': checklist.chills_fever,
                'varicosities': checklist.varicosities,
                'epigastric_pain': checklist.epigastric_pain,
                'blurring_vision': checklist.blurring_vision,
                'severe_headache': checklist.severe_headache,
                'vaginal_bleeding': checklist.vaginal_bleeding,
                'diff_in_breathing': checklist.diff_in_breathing,
                'abdominal_pain': checklist.abdominal_pain
            }
        return None
    
    def get_birth_plan_details(self, obj):
        birth_plan = obj.pf_birth_plan.first()
        if birth_plan:
            return {
                'pfbp_id': birth_plan.pfbp_id,
                'place_of_delivery_plan': birth_plan.place_of_delivery_plan,
                'newborn_screening_plan': birth_plan.newborn_screening_plan,
                'created_at': birth_plan.created_at,
            }
        return None
    
    def get_obstetric_risk_codes(self, obj):
        risk_codes = obj.pf_obstetric_risk_code.first()
        if risk_codes:
            return {
                'pforc_id': risk_codes.pforc_id,
                'pforc_prev_c_section': risk_codes.pforc_prev_c_section,
                'pforc_3_consecutive_miscarriages': risk_codes.pforc_3_consecutive_miscarriages,
                'pforc_postpartum_hemorrhage': risk_codes.pforc_postpartum_hemorrhage,
            }
        return None
    
    def get_prenatal_care_entries(self, obj):
        prenatal_care = obj.pf_prenatal_care.all().order_by('pfpc_date')
        return [{
            'pfpc_id': care.pfpc_id,
            'pfpc_date': care.pfpc_date,
            'pfpc_aog_wks': care.pfpc_aog_wks,
            'pfpc_aog_days': care.pfpc_aog_days,
            'pfpc_fundal_ht': care.pfpc_fundal_ht,
            'pfpc_fetal_hr': care.pfpc_fetal_hr,
            'pfpc_fetal_pos': care.pfpc_fetal_pos,
            'pfpc_complaints': care.pfpc_complaints,
            'pfpc_advises': care.pfpc_advises,
        } for care in prenatal_care]
    
    def get_vaccination_records(self, obj):
        """
        Get vaccination records administered during or before this prenatal visit.
        Returns records from vacrec_id and also queries by patrec_id.
        """
        if not obj.patrec_id:
            print("No patrec_id found")
            return []
        
        # Use cutoff_time to include records created during this prenatal visit
        # Add 3 seconds buffer to account for transaction timing and microsecond precision
        cutoff_time = obj.created_at + timedelta(seconds=3)
        
        try:
            print(f"Looking for vaccination records for patrec_id: {obj.patrec_id.patrec_id}, prenatal created_at: {obj.created_at}, cutoff_time: {cutoff_time}")
            
            # Get all VaccinationRecords for this patient record
            # Don't filter by created_at on VaccinationRecord - it's just a container
            vaccination_records = VaccinationRecord.objects.filter(
                patrec_id=obj.patrec_id
            ).prefetch_related(
                'vaccination_histories__vac', 
                'vaccination_histories__vacStck_id__vac_id',  # Fixed: vac_id is the correct field name
                'vaccination_histories__staff'
            )
            
            print(f"Found {vaccination_records.count()} vaccination records")
            
            result = []
            for vacrec in vaccination_records:
                print(f"Processing vacrec_id: {vacrec.vacrec_id}, created_at: {vacrec.created_at}")
                
                # Get ALL vaccination histories for this record (don't filter by created_at)
                # Filter by date_administered instead since that's the actual vaccine date
                all_histories = vacrec.vaccination_histories.all()
                print(f"Total histories for vacrec_id {vacrec.vacrec_id}: {all_histories.count()}")
                
                # Filter by date_administered being on or before the prenatal form date
                prenatal_date = obj.created_at.date() if hasattr(obj.created_at, 'date') else obj.created_at
                histories = all_histories.filter(
                    date_administered__lte=prenatal_date
                ).order_by('-date_administered')
                
                print(f"Found {histories.count()} histories with date_administered <= {prenatal_date}")
                
                for history in histories:
                    vaccine_name = None
                    # Try to get vaccine name from either direct vac reference or through vacStck_id
                    if history.vac:
                        vaccine_name = history.vac.vac_name
                    elif history.vacStck_id and history.vacStck_id.vac_id:
                        vaccine_name = history.vacStck_id.vac_id.vac_name  # Fixed: vac_id is the correct field
                    
                    print(f"History {history.vachist_id}: vaccine_name={vaccine_name}, date_administered={history.date_administered}, created_at={history.created_at}")
                    
                    result.append({
                        'vachist_id': history.vachist_id,
                        'vaccine_name': vaccine_name,
                        'dose_number': history.vachist_doseNo,
                        'date_administered': history.date_administered,
                        'status': history.vachist_status,
                        'staff_id': history.staff.staff_id if history.staff else None,
                    })
            
            print(f"Returning {len(result)} vaccination records")
            return result
            
        except Exception as e:
            print(f"Error fetching vaccination records: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def get_medicine_records(self, obj):
        """
        Get medicine records dispensed during or before this prenatal visit.
        Returns records from medrec_id and also queries by patrec_id.
        """
        if not obj.patrec_id:
            print("No patrec_id found")
            return []
        
        # Use cutoff_time to include records requested during this prenatal visit
        # Add 3 seconds buffer to account for transaction timing and microsecond precision
        cutoff_time = obj.created_at + timedelta(seconds=3)
        prenatal_date = obj.created_at.date() if hasattr(obj.created_at, 'date') else obj.created_at
        
        try:
            print(f"Looking for medicine records for patrec_id: {obj.patrec_id.patrec_id}, prenatal created_at: {obj.created_at}, cutoff_time: {cutoff_time}, prenatal_date: {prenatal_date}")
            
            # Get all MedicineRecords for this patient record
            # Filter by requested_at being within cutoff_time (to catch same-transaction records)
            medicine_records = MedicineRecord.objects.filter(
                patrec_id=obj.patrec_id,
                requested_at__lte=cutoff_time
            ).select_related(
                'minv_id__med_id',
                'staff'
            ).order_by('-requested_at')
            
            print(f"Found {medicine_records.count()} medicine records")
            
            # Debug: print details of each medicine record
            for medrec in medicine_records:
                print(f"MedicineRecord {medrec.medrec_id}: requested_at={medrec.requested_at}, minv_id={medrec.minv_id}, medicine={medrec.minv_id.med_id.med_name if medrec.minv_id and medrec.minv_id.med_id else 'N/A'}")
            
            result = [{
                'medrec_id': medrec.medrec_id,
                'medicine_name': medrec.minv_id.med_id.med_name if medrec.minv_id and medrec.minv_id.med_id else None,
                'quantity': medrec.medrec_qty,
                'reason': medrec.reason,
                'requested_at': medrec.requested_at,
                'fulfilled_at': medrec.fulfilled_at,
                'staff_id': medrec.staff.staff_id if medrec.staff else None,
            } for medrec in medicine_records]
            
            print(f"Returning {len(result)} medicine records")
            return result
            
        except Exception as e:
            print(f"Error fetching medicine records: {e}")
            import traceback
            traceback.print_exc()
            return []


# Main Prenatal Form Serializer for Complete Creation
class PrenatalCompleteSerializer(serializers.ModelSerializer):
    # Fields from motherPersonalInfo
    pat_id = serializers.CharField(write_only=True, required=True)
    patrec_type = serializers.CharField(default="Prenatal", write_only=True) 

    obstetrical_history = ObstetricalHistoryCreateSerializer(required=False, write_only=True)

    # Nested serializers for related models
    spouse_data = SpouseCreateSerializer(required=False, write_only=True)
    body_measurement = BodyMeasurementCreateSerializer(required=False, write_only=True)
    
    # Nested lists for multiple entries
    medical_history = MedicalHistoryCreateSerializer(many=True, required=False, write_only=True)
    previous_hospitalizations = PreviousHospitalizationCreateSerializer(many=True, required=False, write_only=True)
    previous_pregnancy_data = PreviousPregnancyCreateSerializer(required=False, write_only=True) # Assuming single for now based on schema
    tt_statuses = TTStatusCreateSerializer(many=True, required=False, write_only=True)
    lab_results_data = LaboratoryResultCreateSerializer(many=True, required=False, write_only=True)
    
    # Single nested objects
    anc_visit_data = Guide4ANCVisitCreateSerializer(required=False, write_only=True)
    checklist_data = ChecklistCreateSerializer(required=False, write_only=True)
    birth_plan_data = BirthPlanCreateSerializer(required=False, write_only=True)
    obstetric_risk_code_data = ObstetricRiskCodeCreateSerializer(required=False, write_only=True) # New
    prenatal_care_data = PrenatalCareCreateSerializer(many=True, required=False, write_only=True) # New

    # Vital signs for current visit (from prenatalCare.bp)
    vital_bp_systolic = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    vital_bp_diastolic = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    # Follow-up visit data
    followup_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    followup_description = serializers.CharField(default="Prenatal Follow-up Visit", write_only=True, required=False, allow_blank=True)

    # Medicine data - for micronutrient supplementation
    selected_medicines = serializers.ListField(
        child=serializers.DictField(), 
        write_only=True, 
        required=False,
        allow_empty=True
    )

    # Vaccination total dose - for conditional vaccines where user inputs total dose manually
    vacrec_totaldose = serializers.IntegerField(
        write_only=True, 
        required=False, 
        allow_null=True,
        help_text="Total dose count for conditional vaccines. If not provided, will auto-calculate based on vaccination history."
    )

    # Assessed by staff
    assessed_by = serializers.CharField(write_only=True, required=False, allow_blank=True) # Assuming staff ID is passed as string

    class Meta:
        model = Prenatal_Form
        fields = [
            'pat_id', 'patrec_type', 'pf_edc', 'pf_occupation', 'previous_complications',
            'spouse_data', 'body_measurement', 'obstetrical_history', 'previous_hospitalizations',
            'medical_history', 'previous_pregnancy_data', 'tt_statuses', 'lab_results_data', 
            'anc_visit_data', 'checklist_data', 'birth_plan_data',
            'obstetric_risk_code_data', 'prenatal_care_data', 'vital_bp_systolic', 
            'vital_bp_diastolic', 'followup_date', 'followup_description', 'selected_medicines', 
            'vacrec_totaldose', 'assessed_by'
        ]

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

    def validate_vacrec_totaldose(self, value):
        """Validate vaccination total dose"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Total dose count cannot be negative")
        if value is not None and value > 100:
            raise serializers.ValidationError("Total dose count seems unreasonably high (max 100)")
        return value

    def validate_selected_medicines(self, value):
        """Validate selected medicines data"""
        if not value:
            return value
        
        from apps.medicineservices.models import MedicineInventory
        
        for medicine in value:
            minv_id = medicine.get('minv_id')
            medrec_qty = medicine.get('medrec_qty', 0)
            
            if not minv_id:
                raise serializers.ValidationError("Medicine ID (minv_id) is required for each selected medicine")
            
            if not isinstance(medrec_qty, int) or medrec_qty <= 0:
                raise serializers.ValidationError("Medicine quantity must be a positive integer")
            
            try:
                medicine_inv = MedicineInventory.objects.get(minv_id=minv_id)
                if medicine_inv.minv_qty_avail < medrec_qty:
                    raise serializers.ValidationError(
                        f"Insufficient stock for medicine {medicine_inv.med_id.med_name}. "
                        f"Available: {medicine_inv.minv_qty_avail}, Requested: {medrec_qty}"
                    )
            except MedicineInventory.DoesNotExist:
                raise serializers.ValidationError(f"Medicine with ID {minv_id} does not exist")
        
        return value

    # creation of tt_status logic
    def create_tt_status_logic(self, prenatal_form, tt_statuses_data, patient):
        if not tt_statuses_data:
            return
        
        try:
            created_count = 0

            # check for existing tt records by patient
            existing_tt = TT_Status.objects.filter(
                pat_id=patient
            ).values('tts_status', 'tts_date_given')

            # create set of existing tt records for faster lookup
            existing_tt_set = set()
            for record in existing_tt:
                tt_key = (record['tts_status'], record['tts_date_given'])
                existing_tt_set.add(tt_key)

            for tt_data in tt_statuses_data:
                if not tt_data.get('tts_status'):
                    continue
                
                tt_key = (tt_data['tts_status'], tt_data.get('tts_date_given'))

                if tt_key in existing_tt_set:
                    print(f'TT Record already exists')
                    continue
                
                # TT_Status now expects pat_id referencing the Patient
                TT_Status.objects.create(
                    pat_id=patient,
                    tts_status=tt_data.get('tts_status'),
                    tts_date_given=tt_data.get('tts_date_given'),
                    tts_tdap=tt_data.get('tts_tdap', False)
                )

                created_count += 1
                print(f'Created {created_count} TT Record')

        except Exception as e:
            print(f'Error creating TT Record: {str(e)}')
            raise

    # creation of vaccination record logic for TT vaccines
    def create_vaccination_records_for_tt(self, prenatal_form, tt_statuses_data, patient_record, staff_instance, vital_signs, user_provided_total_dose=None):
        """
       Args:
            user_provided_total_dose: Total dose count manually entered by user (for conditional vaccines)
                                     If provided, placeholder VaccinationHistory records will be created
        """
        if not tt_statuses_data:
            print("No tt_statuses_data provided")
            return None
        
        print(f"📋 Received tt_statuses_data: {tt_statuses_data}")
        print(f"📋 User-provided total dose: {user_provided_total_dose}")
        
        try:
            # Filter TT records that have vaccine information
            # Note: JavaScript 'undefined' becomes None in Python when transmitted via JSON
            tt_with_vaccines = [tt for tt in tt_statuses_data if tt.get('vaccineType') not in (None, '', 'undefined')]
            
            if tt_with_vaccines:
                print(f"TT records with vaccines: {tt_with_vaccines}")
            
            # Check if this is a conditional vaccine case (user provided total dose without vaccine stock)
            is_conditional_vaccine = user_provided_total_dose is not None and not tt_with_vaccines
            
            if not tt_with_vaccines and not is_conditional_vaccine:
                print("No TT records with vaccine information to process and no conditional vaccine dose provided")
                return None
            
            # Check if this is a conditional vaccine case (user provided total dose without vaccine stock)
            is_conditional_vaccine = user_provided_total_dose is not None and not tt_with_vaccines
            
            if not tt_with_vaccines and not is_conditional_vaccine:
                print("No TT records with vaccine information to process and no conditional vaccine dose provided")
                return None
            
            # Create or get VaccinationRecord for this patient record
            vaccination_record, created = VaccinationRecord.objects.get_or_create(
                patrec_id=patient_record,
                defaults={'vacrec_totaldose': user_provided_total_dose or 0}
            )
            
            if created:
                print(f"✅ Created new VaccinationRecord: {vaccination_record.vacrec_id}")
                if user_provided_total_dose:
                    print(f"   Using user-provided total dose: {user_provided_total_dose}")
            else:
                print(f"♻️  Using existing VaccinationRecord: {vaccination_record.vacrec_id}")
            
            # CASE 1: Conditional vaccine
            if is_conditional_vaccine:
                print(f"🔄 Processing CONDITIONAL vaccine: Target total dose = {user_provided_total_dose}")
                
                # For conditional vaccines, we need to check existing history for the SAME vaccine type
                
                patient = patient_record.pat_id
                
                # Get ALL existing vaccination history records with vaccine stock for THIS PATIENT (across all services)
                all_existing_history = VaccinationHistory.objects.filter(
                    vacrec__patrec_id__pat_id=patient,
                    vacStck_id__vac_id__isnull=False
                ).select_related('vacStck_id__vac_id', 'vacrec', 'vacrec__patrec_id').order_by('-vachist_doseNo')
                
                # Get the vac_id from the first (most recent) existing record
                specific_vac_id = None
                if all_existing_history.exists():
                    specific_vac_id = all_existing_history.first().vacStck_id.vac_id.vac_id
                    print(f"   🔍 Detected existing vaccine type: vac_id={specific_vac_id} (patient: pat_id={patient.pat_id}, across all services)")
                
                # Filter records by that specific vac_id to get accurate dose count FOR THIS PATIENT (across all services)
                highest_dose = 0
                if specific_vac_id:
                    vaccine_specific_history = VaccinationHistory.objects.filter(
                        vacrec__patrec_id__pat_id=patient,  
                        vacStck_id__vac_id=specific_vac_id  
                    ).select_related('vacStck_id__vac_id', 'vacrec', 'vacrec__patrec_id').order_by('-vachist_doseNo')
                    
                    if vaccine_specific_history.exists():
                        highest_dose = vaccine_specific_history.first().vachist_doseNo
                        vaccine_name = vaccine_specific_history.first().vacStck_id.vac_id.vac_name
                        print(f"   📊 Found {vaccine_specific_history.count()} existing record(s) for vaccine '{vaccine_name}' (vac_id: {specific_vac_id}), highest dose: {highest_dose} (across all services)")
                else:
                    print(f"   📊 No existing vaccination history records found with vaccine stock for patient (across all services)")
                
                # If highest_dose = 1 and user_provided_total_dose = 3, create doses 2 and 3
                doses_to_create = []
                if user_provided_total_dose > highest_dose:
                    doses_to_create = range(highest_dose + 1, user_provided_total_dose + 1)
                    print(f"   🔢 Will create doses: {list(doses_to_create)}")
                else:
                    print(f"   ⚠️ User-provided total dose ({user_provided_total_dose}) is not greater than highest existing dose ({highest_dose})")
                    print(f"   ℹ️ No new vaccination history records will be created")
                
                # Create the new VaccinationHistory records
                created_count = 0
                for dose_number in doses_to_create:
                    vaccination_history = VaccinationHistory.objects.create(
                        vachist_doseNo=dose_number,
                        vachist_status='pending',  # Status is pending for conditional vaccines
                        date_administered=timezone.now().date(),
                        staff=staff_instance,
                        vital=vital_signs,
                        vacrec=vaccination_record,
                        # Leave these fields NULL for conditional vaccines:
                        vacStck_id=None,  # No vaccine stock
                        vac=None,  # No vaccine list reference
                        followv=None,  # No follow-up visit
                        signature=None,  # No signature
                        assigned_to=None  # No assigned staff
                    )
                    created_count += 1
                    print(f"   ✅ Created VaccinationHistory #{dose_number}: ID={vaccination_history.vachist_id} (conditional/placeholder)")
                
                # Update the total dose count
                vaccination_record.vacrec_totaldose = user_provided_total_dose
                vaccination_record.save()
                print(f"✅ Set vacrec_totaldose to: {user_provided_total_dose}")
                
                if created_count > 0:
                    print(f"✅ Conditional vaccine processing complete: {created_count} new placeholder record(s) created (total doses now: {user_provided_total_dose})")
                else:
                    print(f"✅ Conditional vaccine processing complete: No new records created (already at or above target dose)")
                
                return vaccination_record
            
            # CASE 2: Regular vaccine with stock - Process actual vaccine administrations
            print(f"💉 Processing REGULAR vaccines with stock: {len(tt_with_vaccines)} vaccine(s)")
            for tt_data in tt_with_vaccines:
                vaccine_type = tt_data.get('vaccineType', '')
                tts_status = tt_data.get('tts_status', '')
                tts_date_given = tt_data.get('tts_date_given')
                
                # Parse vaccine information from the format: "vacStck_id,vac_id,vac_name,expiry_date"
                if not vaccine_type or ',' not in vaccine_type:
                    print(f"Invalid vaccine type format: {vaccine_type}")
                    continue
                
                try:
                    vaccine_parts = vaccine_type.split(',')
                    vacStck_id = vaccine_parts[0]
                    vac_name = vaccine_parts[2] if len(vaccine_parts) > 2 else 'Unknown'
                    
                    # Get vaccine stock
                    vaccine_stock = VaccineStock.objects.get(vacStck_id=vacStck_id)
                    
                    # Check stock availability
                    if vaccine_stock.vacStck_qty_avail <= 0:
                        print(f"No stock available for {vac_name}")
                        continue
                    
                    # Calculate the correct dose number based on existing history for THIS specific vaccine
                    current_vac_id = vaccine_stock.vac_id.vac_id
                    current_vac_name = vaccine_stock.vac_id.vac_name
                    
                    # Get the patient ID to query across ALL their records (prenatal, child health, etc.)
                    patient = patient_record.pat_id
                    
                    all_patient_history = VaccinationHistory.objects.filter(
                        vacrec__patrec_id__pat_id=patient  # Traverse: VaccinationHistory -> VaccinationRecord -> PatientRecord -> Patient
                    ).select_related('vacStck_id', 'vacStck_id__vac_id', 'vacrec', 'vacrec__patrec_id')
                    
                    print(f"DEBUG: Total vaccination history records for patient {patient.pat_id} (all services): {all_patient_history.count()}")
                    if all_patient_history.exists():
                        print(f"DEBUG: All history records for this patient:")
                        for hist in all_patient_history[:10]:
                            vac_info = f"vac_id={hist.vacStck_id.vac_id.vac_id}" if hist.vacStck_id and hist.vacStck_id.vac_id else "NO STOCK/VAC"
                            print(f"      - vachist_id={hist.vachist_id}, dose={hist.vachist_doseNo}, patrec_type={hist.vacrec.patrec_id.patrec_type}, vacrec={hist.vacrec.vacrec_id}, vacStck={hist.vacStck_id.vacStck_id if hist.vacStck_id else 'NULL'}, {vac_info}")
                    
                    # Find ALL existing doses for this specific vaccine type for THIS PATIENT (across all services)
                    existing_doses = VaccinationHistory.objects.filter(
                        vacrec__patrec_id__pat_id=patient, 
                        vacStck_id__vac_id=current_vac_id
                    ).select_related('vacStck_id', 'vacStck_id__vac_id', 'vacrec', 'vacrec__patrec_id').order_by('-vachist_doseNo')
                    
                    # Debug: Show what we found
                    print(f"Found {existing_doses.count()} existing dose(s) for vac_id={current_vac_id} (across all patient services)")
                    
                    if existing_doses.exists():
                        # Show all existing doses
                        for idx, dose_record in enumerate(existing_doses[:5]):  # Show first 5
                            print(f"      - Dose #{dose_record.vachist_doseNo}: patrec_type={dose_record.vacrec.patrec_id.patrec_type}, vacrec={dose_record.vacrec.vacrec_id}, vacStck_id={dose_record.vacStck_id.vacStck_id}, vac_id={dose_record.vacStck_id.vac_id.vac_id}, status={dose_record.vachist_status}")
                    
                    # Calculate next dose number
                    if existing_doses.exists():
                        highest_existing_dose = existing_doses.first().vachist_doseNo
                        dose_no = highest_existing_dose + 1
                        print(f"   ✅ Next dose will be: {dose_no} (highest existing: {highest_existing_dose})")
                    else:
                        dose_no = 1
                        print(f"   ✅ Starting at dose: {dose_no} (no existing history)")
                    
                    # Deduct stock
                    vaccine_stock.vacStck_qty_avail -= 1
                    vaccine_stock.save()
                    print(f"Deducted 1 dose from {vac_name}, remaining: {vaccine_stock.vacStck_qty_avail}")
                    
                    # Create VaccinationHistory
                    vaccination_history = VaccinationHistory.objects.create(
                        vachist_doseNo=dose_no,
                        vachist_status='completed',
                        date_administered=tts_date_given or timezone.now().date(),
                        staff=staff_instance,
                        vital=vital_signs,
                        vacrec=vaccination_record,
                        vacStck_id=vaccine_stock,
                        vac=None  # Set to NULL - vaccine is referenced through vacStck_id.vac_id relationship
                    )
                    
                    print(f"   ✅ Created VaccinationHistory: {vaccination_history.vachist_id} for {vac_name} (vac_id: {current_vac_id}, Dose {dose_no}) with vac=NULL")
                    
                except VaccineStock.DoesNotExist:
                    print(f"   ❌ Vaccine stock not found for ID: {vacStck_id}")
                    continue
                except Exception as e:
                    print(f"   ❌ Error processing vaccine {vaccine_type}: {str(e)}")
                    continue
            
            # Update total doses for regular vaccines
            # If user provided a total dose count, use it (conditional vaccines already handled above)
            # Otherwise, auto-calculate based on vaccination history records
            if user_provided_total_dose is not None and not is_conditional_vaccine:
                vaccination_record.vacrec_totaldose = user_provided_total_dose
                print(f"✅ Set vacrec_totaldose to user-provided value: {user_provided_total_dose}")
            elif not is_conditional_vaccine:
                # Auto-calculate from vaccination history
                vaccination_record.vacrec_totaldose = VaccinationHistory.objects.filter(
                    vacrec=vaccination_record
                ).count()
                print(f"✅ Auto-calculated vacrec_totaldose: {vaccination_record.vacrec_totaldose}")
            
            vaccination_record.save()
            print(f"✅ VaccinationRecord saved: vacrec_id={vaccination_record.vacrec_id}, total_dose={vaccination_record.vacrec_totaldose}")
            
            return vaccination_record
            
        except Exception as e:
            print(f'Error creating vaccination records: {str(e)}')
            raise

    # creation of previous hospitalization logic
    def create_previous_hospitalization_logic(self, prenatal_form, previous_hospitalizations_data, patient):
        if not previous_hospitalizations_data:
            return
        
        try:
            created_count = 0

            existing_ph = Previous_Hospitalization.objects.filter(
                pf_id__patrec_id__pat_id=patient.pat_id
            ).values('prev_hospitalization', 'prev_hospitalization_year')

            existing_ph_set = set()
            for record in existing_ph:
                ph_key = (record['prev_hospitalization'], record['prev_hospitalization_year'])
                existing_ph_set.add(ph_key)
            
            for ph_data in previous_hospitalizations_data:
                if not ph_data.get('prev_hospitalization'):
                    continue

                ph_key = (ph_data.get('prev_hospitalization'), ph_data.get('prev_hospitalization_year'))

                if ph_key in existing_ph_set:
                    print(f'Previous hospitalization data already exists')
                    continue
                
                Previous_Hospitalization.objects.create(
                    pf_id=prenatal_form,
                    prev_hospitalization=ph_data.get('prev_hospitalization'),
                    prev_hospitalization_year=ph_data.get('prev_hospitalization_year')
                )

                created_count += 1
                print(f'Created {created_count} hospitalizations record/s')
        
        except Exception as e:
            print(f'Error creating hospitalization records: {str(e)}')
            raise

    def create_medical_history_logic(self, medical_history_data, patient_record):
        if not medical_history_data:
            return

        try:
            from datetime import datetime
            current_year = str(datetime.now().year)
            created_count = 0
            
            with transaction.atomic():
                for med_history_data_item in medical_history_data:
                    ill = med_history_data_item.get('ill')
                    
                    # Get the year/ill_date from the data
                    # The serializer will convert 'year' to 'ill_date', but handle both cases
                    ill_date = med_history_data_item.get('ill_date')
                    
                    # If no date provided, default to current year
                    if not ill_date or str(ill_date).strip() == '':
                        ill_date = current_year
                        print(f"No year provided for illness {ill}, defaulting to current year: {current_year}")
                    else:
                        # Ensure it's stored as string
                        ill_date = str(ill_date)
                    
                    if not ill:
                        print(f"Skipping medical history entry - no illness specified")
                        continue
                    
                    # Check if this illness already exists for this patient (across all their records)
                    existing_qs = MedicalHistory.objects.filter(
                        patrec__pat_id=patient_record.pat_id,
                        ill=ill,
                        ill_date=ill_date  # Always check with the date (defaulted to current year if empty)
                    )

                    existing_record = existing_qs.first()
                    if existing_record:
                        print(f'Medical history record already exists for patient {patient_record.pat_id}, illness {ill}, year {ill_date} - skipping')
                        continue
                    
                    # Create the new record
                    MedicalHistory.objects.create(
                        patrec=patient_record,
                        ill=ill,
                        ill_date=ill_date
                    )
                    
                    created_count += 1
                    print(f'Created medical history record for patient {patient_record.pat_id}, illness {ill}, year {ill_date}')
            
            print(f'Total created: {created_count} medical history record/s')
            
        except Exception as e:
            print(f'Error creating medical history records: {str(e)}')
            import traceback
            traceback.print_exc()
            raise


    # creation of all records logic
    def create(self, validated_data):
        print(f"Creating prenatal record with validated data: {validated_data}")
        # Pop nested data
        pat_id = validated_data.pop('pat_id')
        patrec_type = validated_data.pop('patrec_type', 'Prenatal')  
        spouse_data = validated_data.pop('spouse_data', None)
        body_measurement_data = validated_data.pop('body_measurement', None)
        obstetrical_history_data = validated_data.pop('obstetrical_history', None)
        medical_history_data = validated_data.pop('medical_history', [])
        previous_hospitalizations_data = validated_data.pop('previous_hospitalizations', [])
        previous_pregnancy_data = validated_data.pop('previous_pregnancy_data', None)
        tt_statuses_data = validated_data.pop('tt_statuses', [])
        lab_results_data = validated_data.pop('lab_results_data', [])
        anc_visit_data = validated_data.pop('anc_visit_data', None)
        checklist_data = validated_data.pop('checklist_data', None)
        birth_plan_data = validated_data.pop('birth_plan_data', None)
        obstetric_risk_code_data = validated_data.pop('obstetric_risk_code_data', None) 
        prenatal_care_data = validated_data.pop('prenatal_care_data', []) 
        vital_bp_systolic = validated_data.pop('vital_bp_systolic', None)
        vital_bp_diastolic = validated_data.pop('vital_bp_diastolic', None)
        followup_date = validated_data.pop('followup_date', None)
        followup_description = validated_data.pop('followup_description', "Prenatal follow-up visit")
        selected_medicines = validated_data.pop('selected_medicines', [])
        vacrec_totaldose = validated_data.pop('vacrec_totaldose', None)  # User-provided total dose for conditional vaccines
        assessed_by = validated_data.pop('assessed_by', None)

        try:
            with transaction.atomic():
                patient = Patient.objects.get(pat_id=pat_id)
                print(f"Found patient: {patient.pat_id}")

                # Check for existing prenatal record with pending follow up
                latest_prenatal_form = Prenatal_Form.objects.filter(
                    pregnancy_id__pat_id=patient,
                    followv_id__isnull=False,
                    followv_id__followv_status='pending'  # Only get pending ones
                ).order_by('-created_at').first()

                if latest_prenatal_form and latest_prenatal_form.followv_id:
                    latest_prenatal_form.followv_id.followv_status = 'completed'
                    latest_prenatal_form.followv_id.save()
                    print(f"Marked previous pending follow-up as completed (patient returned for new visit)")

                # handle Pregnancy (create new or link to existing active)
                pregnancy = None
                current_datetime = timezone.now()
                
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
                        status='active',
                        created_at=current_datetime,
                        updated_at=current_datetime,
                        prenatal_end_date=None,
                        postpartum_end_date=None
                    )
                    print(f'Created new Pregnancy: {pregnancy.pregnancy_id}')

                # Get or create PatientRecord for this pregnancy
                # Same pregnancy should reuse the same PatientRecord
                # Check if there's already a PatientRecord for this pregnancy
                existing_prenatal = Prenatal_Form.objects.filter(
                    pregnancy_id=pregnancy,
                    patrec_id__isnull=False
                ).select_related('patrec_id').first()
                
                if existing_prenatal:
                    # Reuse the PatientRecord from the existing prenatal form for this pregnancy
                    patient_record = existing_prenatal.patrec_id
                    print(f"Reusing existing PatientRecord: {patient_record.patrec_id} for pregnancy {pregnancy.pregnancy_id}")
                else:
                    # Create new PatientRecord for this pregnancy
                    patient_record = PatientRecord.objects.create(
                        patrec_type=patrec_type,
                        pat_id=patient
                    )
                    print(f"Created new PatientRecord: {patient_record.patrec_id} for pregnancy {pregnancy.pregnancy_id}")

                # create ObstetricalHistory
                obstetrical_history = Obstetrical_History.objects.create(
                    patrec_id=patient_record,
                    **obstetrical_history_data
                )
                print(f"Created obstetrical history: {obstetrical_history.obs_id}")

                # create Medical History
                if medical_history_data:
                    self.create_medical_history_logic(medical_history_data, patient_record)
                    print(f'Created medical history records for patient: {patient_record.patrec_id}')

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
                        pat=patient,
                        # patrec=patient_record,
                        **body_measurement_data
                    )
                    print(f"Created body measurement: {body_measurement.bm_id}")

                # handle Spouse logic
                spouse = handle_spouse_logic(patient, spouse_data)
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
                staff_instance = None
                if assessed_by:
                    try:
                        staff_instance = Staff.objects.get(staff_id=assessed_by)
                        print(f"Found staff: {staff_instance.staff_id}")
                    except Staff.DoesNotExist:
                        print(f"Staff with ID {assessed_by} not found")
                        # Validation should have caught this, but just in case
                        staff_instance = None
                validated_data['staff'] = staff_instance

                # create Prenatal_Form
                print(f"Creating prenatal form with staff: {staff_instance}")
                prenatal_form = Prenatal_Form.objects.create(
                    patrec_id=patient_record,
                    pregnancy_id=pregnancy,
                    vital_id=vital_signs,
                    spouse_id=spouse,
                    bm_id=body_measurement,
                    followv_id=follow_up_visit,
                    **validated_data 
                )

                # create Previous_Hospitalization records
                if previous_hospitalizations_data:
                    self.create_previous_hospitalization_logic(prenatal_form, previous_hospitalizations_data, patient)
                    print(f"Created {len(previous_hospitalizations_data)} previous hospitalization records.")

                # create TT_Status records
                if tt_statuses_data:
                    self.create_tt_status_logic(prenatal_form, tt_statuses_data, patient)
                    print(f"Created {len(tt_statuses_data)} TT status records.")
                    
                    # Create vaccination records for TT vaccines with stock information
                    vaccination_record = self.create_vaccination_records_for_tt(
                        prenatal_form, 
                        tt_statuses_data, 
                        patient_record, 
                        staff_instance, 
                        vital_signs,
                        user_provided_total_dose=vacrec_totaldose  # Pass user-provided total dose
                    )
                    
                    # Link vaccination record to prenatal form if created
                    if vaccination_record:
                        prenatal_form.vacrec_id = vaccination_record
                        prenatal_form.save()
                        print(f"Linked VaccinationRecord {vaccination_record.vacrec_id} to prenatal form")
                    else:
                        print(f"No vaccination record returned - nothing to link")

                # create LaboratoryResult and LaboratoryResultImg records
                for lab_data in lab_results_data:
                    images_data = lab_data.pop('images', [])
                    lab_result = LaboratoryResult.objects.create(pf_id=prenatal_form, **lab_data)
                    
                    # Upload images to Supabase and save the URL
                    for img_data in images_data:
                        try:
                            # Generate unique filename with timestamp to avoid duplicates
                            import time
                            original_name = img_data['image_name']
                            name_parts = original_name.rsplit('.', 1)
                            if len(name_parts) == 2:
                                unique_name = f"{name_parts[0]}_{int(time.time() * 1000)}.{name_parts[1]}"
                            else:
                                unique_name = f"{original_name}_{int(time.time() * 1000)}"
                            
                            # Prepare file data for upload
                            file_data = {
                                'file': img_data['image_url'],  # base64 string from frontend
                                'name': unique_name,
                                'type': img_data['image_type'],
                                'size': img_data['image_size'],
                            }
                            
                            print(f"   📤 Uploading lab image: {original_name} → {unique_name}")
                            
                            # Upload to Supabase bucket and get the public URL
                            uploaded_url = upload_to_storage(file_data, bucket='lab-result-documents', folder='lab-images')
                            
                            if not uploaded_url:
                                print(f"Failed to upload {original_name} to Supabase")
                                raise Exception(f"Failed to upload image {original_name}")
                            
                            # Save with the short Supabase URL instead of base64
                            LaboratoryResultImg.objects.create(
                                lab_id=lab_result,
                                image_url=uploaded_url,  # Short URL from Supabase
                                image_name=original_name,  # Original name for display
                                image_type=img_data['image_type'],
                                image_size=img_data['image_size'],
                            )
                            print(f"Uploaded: {original_name}")
                            print(f"URL: {uploaded_url}")
                            
                        except Exception as e:
                            print(f"Error uploading {img_data.get('image_name', 'unknown')}: {str(e)}")
                            # Clean up the lab_result if image upload fails
                            lab_result.delete()
                            raise Exception(f"Failed to upload lab images: {str(e)}")
                
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

                # Process selected medicines for micronutrient supplementation
                medicine_record = None
                if selected_medicines:
                    from apps.medicineservices.models import MedicineRecord, MedicineInventory, MedicineTransactions
                    
                    print(f"Processing {len(selected_medicines)} selected medicines")
                    
                    # Get staff instance for medicine transactions
                    staff_instance = None
                    if assessed_by:
                        try:
                            staff_instance = Staff.objects.get(staff_id=assessed_by)
                        except Staff.DoesNotExist:
                            print(f"Staff with ID {assessed_by} not found for medicine transactions")
                    
                    # Create medicine records for each selected medicine
                    for i, medicine_data in enumerate(selected_medicines):
                        minv_id = medicine_data.get('minv_id')
                        medrec_qty = medicine_data.get('medrec_qty')
                        reason = medicine_data.get('reason', 'Prenatal micronutrient supplementation')
                        
                        try:
                            # Get medicine inventory
                            medicine_inv = MedicineInventory.objects.get(minv_id=minv_id)
                            
                            # Check stock availability (already validated but double-check)
                            if medicine_inv.minv_qty_avail < medrec_qty:
                                raise Exception(f"Insufficient stock for {medicine_inv.med_id.med_name}")
                            
                            # Update inventory stock
                            medicine_inv.minv_qty_avail -= medrec_qty
                            medicine_inv.save()
                            print(f"Updated medicine inventory: {medicine_inv.med_id.med_name}, new stock: {medicine_inv.minv_qty_avail}")
                            
                            # Create medicine record
                            medicine_record = MedicineRecord.objects.create(
                                medrec_qty=medrec_qty,
                                reason=reason,
                                requested_at=timezone.now(),
                                fulfilled_at=timezone.now(),
                                patrec_id=patient_record,
                                minv_id=medicine_inv,
                                staff=staff_instance
                            )
                            print(f"Created medicine record {i+1}: {medicine_record.medrec_id}")
                            
                            # Create medicine transaction for audit trail
                            unit = medicine_inv.minv_qty_unit or 'pcs'
                            if unit.lower() == 'boxes':
                                mdt_qty = f"{medrec_qty} pcs"  # Convert boxes to pieces
                            else:
                                mdt_qty = f"{medrec_qty} {unit}"
                            
                            MedicineTransactions.objects.create(
                                mdt_qty=mdt_qty,
                                mdt_action="Deducted",
                                minv_id=medicine_inv,
                                staff=staff_instance
                            )
                            print(f"Created medicine transaction for {medicine_inv.med_id.med_name}")
                            
                            # Link medicine record to prenatal form if needed
                            # Update the first medicine record reference to prenatal form
                            if i == 0:
                                prenatal_form.medrec_id = medicine_record
                                prenatal_form.save()
                                print(f"Linked first medicine record to prenatal form")
                            
                        except MedicineInventory.DoesNotExist:
                            print(f"Medicine with ID {minv_id} not found")
                            continue
                        except Exception as e:
                            print(f"Error processing medicine {minv_id}: {str(e)}")
                            continue

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

        if instance.staff:
            representation['staff_id'] = instance.staff.staff_id
            representation['assessed_by'] = instance.staff.staff_id
        
        if hasattr(instance, 'pf_obstetric_risk_code') and instance.pf_obstetric_risk_code.exists():
            representation['obstetric_risk_code_id'] = instance.pf_obstetric_risk_code.first().pforc_id
        else:
            representation['obstetric_risk_code_id'] = None
        
        representation['prenatal_care_count'] = instance.pf_prenatal_care.count()
        return representation
    

class PrenatalRequestAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrenatalAppointmentRequest
        fields = ['requested_at', 'requested_date', 'approved_at', 'cancelled_at', 
                  'completed_at', 'rejected_at', 'missed_at', 'reason', 'status', 'rp_id', 
                  'pat_id']
        extra_kwargs = {
            'pat_id': {'required': False, 'allow_null': True},
        }


class PrenatalAppointmentCancellationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrenatalAppointmentRequest
        fields = ['cancelled_at', 'status', 'reason']


class PARequestConfirmSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrenatalAppointmentRequest
        fields = ['status']
        lookup_field = 'par_id'


class PARequestRejectSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrenatalAppointmentRequest
        fields = ['status', 'reason']
        lookup_field = 'par_id'