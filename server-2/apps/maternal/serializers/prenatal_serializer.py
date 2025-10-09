from rest_framework import serializers
from django.db import transaction 
from datetime import date
from django.utils import timezone
from django.db.models import Max

from apps.patientrecords.models import *
from apps.maternal.models import *
from ..serializers.serializer import *
from apps.maternal.serializers.postpartum_serializer import *
from apps.patientrecords.serializers.patients_serializers import *
from apps.administration.models import Staff 
from apps.healthProfiling.models import PersonalAddress, FamilyComposition

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
            'pf_id', 'pf_lmp', 'pf_edc', 'pf_occupation', 'previous_complications', 'created_at',
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
        tt_statuses = obj.tt_status.all()
        return [{
            'tts_id': tt.tts_id,
            'tts_status': tt.tts_status,
            'tts_date_given': tt.tts_date_given,
            'tts_tdap': tt.tts_tdap
        } for tt in tt_statuses]

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
    
    class Meta:
        model = Prenatal_Form
        fields = [
            'pf_id', 'pf_lmp', 'pf_edc', 'pf_occupation', 'previous_complications', 'created_at',
            'patient_details', 'pregnancy_details', 'vital_signs_details', 'tt_statuses',
            'body_measurement_details', 'spouse_details', 'follow_up_visit_details', 'obstetric_history',
            'staff_details', 'previous_hospitalizations','previous_pregnancy', 'medical_history',
            'laboratory_results', 'anc_visit_guide', 'checklist_data', 'birth_plan_details',
            'obstetric_risk_codes', 'prenatal_care_entries'
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
                }
            return None

        except Exception as e:
            print(f'Error retrieving obstetrical history details: {e}')
            return None
        
    def get_medical_history(self, obj):
        if obj.patrec_id:
            medical_history = MedicalHistory.objects.filter(patrec=obj.patrec_id).select_related('ill')
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
        if obj.patrec_id:
            tts = TT_Status.objects.filter(pf_id=obj).prefetch_related('pf_id')
            return [{
                'tts_id': tt.tts_id,
                'tts_status': tt.tts_status,
                'tts_date_given': tt.tts_date_given,
            } for tt in tts]
    
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
        hospitalizations = obj.pf_previous_hospitalization.all()
        return [{
            'pfph_id': hosp.pfph_id,
            'prev_hospitalization': hosp.prev_hospitalization,
            'prev_hospitalization_year': hosp.prev_hospitalization_year,
        } for hosp in hospitalizations]

    
    def get_laboratory_results(self, obj):
        lab_results = obj.lab_result.all()
        return [{
            'lab_id': str(lab.lab_id),
            'lab_type': lab.lab_type,
            'result_date': lab.result_date,
            'to_be_followed': lab.to_be_followed,
            'is_completed': lab.is_completed,
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

    # Assessed by staff
    assessed_by = serializers.CharField(write_only=True, required=False, allow_blank=True) # Assuming staff ID is passed as string

    class Meta:
        model = Prenatal_Form
        fields = [
            'pat_id', 'patrec_type', 'pf_lmp', 'pf_edc', 'pf_occupation', 'previous_complications',
            'spouse_data', 'body_measurement', 'obstetrical_history', 'previous_hospitalizations',
            'medical_history', 'previous_pregnancy_data', 'tt_statuses', 'lab_results_data', 
            'anc_visit_data', 'checklist_data', 'birth_plan_data',
            'obstetric_risk_code_data', 'prenatal_care_data', 'vital_bp_systolic', 
            'vital_bp_diastolic', 'followup_date', 'followup_description', 'assessed_by'
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

    # creation of tt_status logic
    def create_tt_status_logic(self, prenatal_form, tt_statuses_data, patient):
        if not tt_statuses_data:
            return
        
        try:
            created_count = 0

            # check for existing tt records
            existing_tt = TT_Status.objects.filter(
                pf_id__patrec_id__pat_id=patient.pat_id
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
                
                TT_Status.objects.create(
                    pf_id=prenatal_form,
                    tts_status=tt_data.get('tts_status'),
                    tts_date_given=tt_data.get('tts_date_given'),
                    tts_tdap=tt_data.get('tts_tdap', False)
                )

                created_count += 1
                print(f'Created {created_count} TT Record')

        except Exception as e:
            print(f'Error creating TT Record: {str(e)}')
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

                created_count =+ 1
                print(f'Created {created_count} hospitalizations record/s')
        
        except Exception as e:
            print(f'Error creating hospitalization records: {str(e)}')
            raise

    def create_medical_history_logic(self, medical_history_data, patient_record):
        if not medical_history_data:
            return

        try:
            created_count = 0
            
            with transaction.atomic():
                for med_history_data_item in medical_history_data:
                    ill = med_history_data_item.get('ill')
                    ill_date = med_history_data_item.get('ill_date')
                    
                    if not ill:
                        continue
                    
                    # Check if this illness already exists for this patient (across all their records)
                    existing_record = MedicalHistory.objects.filter(
                        patrec__pat_id=patient_record.pat_id,
                        ill=ill,
                        ill_date=ill_date
                    ).first()
                    
                    if existing_record:
                        print(f'Medical history record already exists for patient {patient_record.pat_id} - skipping')
                        continue
                    
                    # Create the new record
                    MedicalHistory.objects.create(
                        patrec=patient_record,
                        ill=ill,
                        ill_date=ill_date
                    )
                    
                    created_count += 1
                    print(f'Created medical history record for patient {patient_record.pat_id}')
            
            print(f'Total created: {created_count} medical history record/s')
            
        except Exception as e:
            print(f'Error creating medical history records: {str(e)}')
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
        assessed_by = validated_data.pop('assessed_by', None)

        try:
            with transaction.atomic():
                patient = Patient.objects.get(pat_id=pat_id)
                print(f"Found patient: {patient.pat_id}")

                # --- NEW LOGIC: Check for latest prenatal form with follow-up visit and pending status ---
                latest_prenatal_form = Prenatal_Form.objects.filter(
                    pregnancy_id__pat_id=patient,
                    followv_id__isnull=False
                ).order_by('-created_at').first()

                if latest_prenatal_form and latest_prenatal_form.followv_id and latest_prenatal_form.followv_id.followv_status == 'pending':
                    followup_dt = latest_prenatal_form.followv_id.followv_date
                    today_dt = date.today()
                    days_diff = (today_dt - followup_dt).days
                    # If follow-up date is today or earlier, mark as completed
                    if followup_dt <= today_dt and days_diff <= 0:
                        latest_prenatal_form.followv_id.followv_status = 'completed'
                        latest_prenatal_form.followv_id.save()
                        print(f"Marked previous follow-up as completed.")
                    # If follow-up date is before today, mark as missed
                    elif followup_dt < today_dt:
                        latest_prenatal_form.followv_id.followv_status = 'missed'
                        latest_prenatal_form.followv_id.save()
                        print(f"Marked previous follow-up as missed.")

                # If last follow-up is missed and more than 7 days have passed, do not mark as completed ever
                if latest_prenatal_form and latest_prenatal_form.followv_id and latest_prenatal_form.followv_id.followv_status == 'missed':
                    followup_dt = latest_prenatal_form.followv_id.followv_date
                    today_dt = date.today()
                    days_diff = (today_dt - followup_dt).days
                    if days_diff > 7:
                        print(f"Last missed follow-up is beyond 7 days; will not mark as completed.")

                # --- END NEW LOGIC ---

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
                        status='active',
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
                staff = None
                if assessed_by:
                    try:
                        staff = Staff.objects.get(staff_id=assessed_by)
                        print(f"✅ Found staff: {staff.staff_id} - {staff}")
                    except Staff.DoesNotExist:
                        print(f"❌ Staff with ID {assessed_by} not found. Proceeding without staff link.")
                        staff = None

                # create Prenatal_Form
                print(f"🔍 Creating prenatal form with staff: {staff}")
                prenatal_form = Prenatal_Form.objects.create(
                    patrec_id=patient_record,
                    pregnancy_id=pregnancy,
                    vital_id=vital_signs,
                    spouse_id=spouse,
                    bm_id=body_measurement,
                    followv_id=follow_up_visit,
                    staff=staff if staff else None,
                    **validated_data 
                )
                print(f"✅ Created prenatal form: {prenatal_form.pf_id}")
                print(f"🔍 Prenatal form staff field after creation: {prenatal_form.staff}")

                # create Previous_Hospitalization records
                if previous_hospitalizations_data:
                    self.create_previous_hospitalization_logic(prenatal_form, previous_hospitalizations_data, patient)
                    print(f"Created {len(previous_hospitalizations_data)} previous hospitalization records.")

                # create TT_Status records
                if tt_statuses_data:
                    self.create_tt_status_logic(prenatal_form, tt_statuses_data, patient)
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
        
        if hasattr(instance, 'pf_obstetric_risk_code') and instance.pf_obstetric_risk_code.exists():
            representation['obstetric_risk_code_id'] = instance.pf_obstetric_risk_code.first().pforc_id
        else:
            representation['obstetric_risk_code_id'] = None
        
        representation['prenatal_care_count'] = instance.pf_prenatal_care.count()
        return representation
    

class PrenatalRequestAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrenatalAppointmentRequest
        fields = ['requested_at', 'approved_at', 'cancelled_at', 'completed_at', 'rejected_at', 'reason', 'status', 'rp_id', 'pat_id']
        extra_kwargs = {
            'pat_id': {'required': False, 'allow_null': True},
        }


class PrenatalAppointmentCancellationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrenatalAppointmentRequest
        fields = ['cancelled_at', 'status']