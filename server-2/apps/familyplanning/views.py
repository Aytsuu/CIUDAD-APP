from venv import logger
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.db import transaction 
from django.utils import timezone
from datetime import date
from .serializers import *
from .models import *
from apps.patientrecords.models import  *
from apps.healthProfiling.models import *
from apps.patientrecords.serializers import *
from apps.healthProfiling.serializers import *

@api_view(['GET'])
def get_patient_details(request, patient_id):
    try:
        patient = get_object_or_404(Patient, pat_id=patient_id)
        # Use the PatientSerializer to get the same data structure as patientrecords/patient/
        serializer = PatientSerializer(patient)
        patient_data = serializer.data
        
        # Transform the patient data to match FP form structure
        fp_form_data = {
            'pat_id': patient_data.get('pat_id', ''),
            'clientID': patient_data.get('clientID', ''),  # Use pat_id as clientID if no specific clientID
            'philhealthNo': "",
            'nhts_status': '',
            'pantawid_4ps': '',
            'lastName': '',
            'givenName': '',
            'middleInitial': '',
            'dateOfBirth': '',
            'age': 0,
            'educationalAttainment': '',
            'occupation': '',
            'address': {
                'houseNumber': '',
                'street': '',
                'barangay': '',
                'municipality': '',
                'province': '',
            },
            'spouse': {
                's_lastName': '',
                's_givenName': '',
                's_middleInitial': '',
                's_dateOfBirth': '',
                's_age': 0,
                's_occupation': '',
            },
            'numOfLivingChildren': 0,
            'planToHaveMoreChildren': False,
            'averageMonthlyIncome': '',
            'weight': patient_data.get('weight'),
            'height': patient_data.get('height'),
            'obstetricalHistory': {
                'g_pregnancies': 0,
                'p_pregnancies': 0,
                'fullTerm': 0,
                'premature': 0,
                'abortion': 0,
                'livingChildren': 0,
                'lastDeliveryDate': '',
                'typeOfLastDelivery': '',
                'lastMenstrualPeriod': '',
                'previousMenstrualPeriod': '',
                'menstrualFlow': 'Scanty',
                'dysmenorrhea': False,
                'hydatidiformMole': False,
                'ectopicPregnancyHistory': False,
            }
        }

    
        personal_info = patient_data.get('personal_info')
        if personal_info:
            fp_form_data.update({
                'lastName': personal_info.get('per_lname', ''),
                'givenName': personal_info.get('per_fname', ''),
                'middleInitial': personal_info.get('per_mname', '')[:1] if personal_info.get('per_mname') else '',
                'dateOfBirth': personal_info.get('per_dob', ''),
                'age': calculate_age_from_dob(personal_info.get('per_dob')) if personal_info.get('per_dob') else 0,
                'educationalAttainment': map_education_attainment(personal_info.get('per_edAttainment', '')),
                'occupation': personal_info.get('per_occupation', ''),
            })

        # Extract address information
        address_info = patient_data.get('address')
        if address_info:
            fp_form_data['address'] = {
                'houseNumber': '',  # Not available in current structure
                'street': address_info.get('add_street', ''),
                'barangay': address_info.get('add_barangay', ''),
                'municipality': address_info.get('add_city', ''),
                'province': address_info.get('add_province', ''),
            }

        try:
            # Get body measurements if available
            body_measurement = BodyMeasurement.objects.filter(pat=patient).first()
            if body_measurement:
                fp_form_data.update({
                    'weight': float(body_measurement.weight) if body_measurement.weight else 0,
                    'height': float(body_measurement.height) if body_measurement.height else 0,

                })
        except Exception as e:
            print(f"Error fetching body measurements: {e}")

    
                
        # Try to get obstetrical history
        try:
            patient_records = PatientRecord.objects.filter(pat_id=patient)
            for patient_record in patient_records:
                obs_history = Obstetrical_History.objects.filter(patrec_id=patient_record).first()
                if obs_history:
                    fp_form_data['obstetricalHistory'] = {
                        'g_pregnancies': obs_history.obs_gravida or 0,
                        'p_pregnancies': obs_history.obs_para or 0,
                        'fullTerm': obs_history.obs_fullterm or 0,
                        'premature': obs_history.obs_preterm or 0,
                        'abortion': obs_history.obs_abortion or 0,
                        'livingChildren': obs_history.obs_living_ch or 0,
                        'lastDeliveryDate': '',
                        'typeOfLastDelivery': '',
                        'lastMenstrualPeriod': '',
                        'previousMenstrualPeriod': '',
                        'menstrualFlow': 'Scanty',
                        'dysmenorrhea': False,
                        'hydatidiformMole': False,
                        'ectopicPregnancyHistory': False,
                    }
                    break
        except Exception as e:
            print(f"Error fetching obstetrical history: {e}")

        # Try to get spouse information if patient is resident
        if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
            personal = patient.rp_id.per
            
        #Get PhilhealthNo
        try:
            hrd = HealthRelatedDetails.objects.filter(per=personal).first()
            if hrd:
                    fp_form_data['philhealthNo'] = hrd.hrd_philhealth_id or ""
        except Exception as e:
            print(f"Error fetching health details: {e}")

        # Get Household for NHTS status
        try:
            household = Household.objects.filter(rp=patient.rp_id).first()
            if household:
                fp_form_data['nhts_status'] = household.hh_nhts == 'Yes'
        except Exception as e:
            print(f"Error fetching household: {e}")

        try:
            from apps.patientrecords.models import Spouse
            spouse = Spouse.objects.filter(rp_id=patient.rp_id).first()
            if spouse:
                fp_form_data['spouse'] = {
                    's_lastName': spouse.spouse_lname or '',
                    's_givenName': spouse.spouse_fname or '',
                    's_middleInitial': spouse.spouse_mname[:1] if spouse.spouse_mname else '',
                    's_dateOfBirth': spouse.spouse_dob.isoformat() if spouse.spouse_dob else '',
                    's_age': calculate_age_from_dob(spouse.spouse_dob.isoformat()) if spouse.spouse_dob else 0,
                    's_occupation': spouse.spouse_occupation or '',
                }
        except Exception as e:
            print(f"Error fetching spouse information: {e}")

        return Response(fp_form_data, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in get_patient_details: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_complete_fp_record(request, patient_id):
    try:
        # First get the basic patient details
        patient_details_response = get_patient_details(request, patient_id)
        
        if patient_details_response.status_code != 200:
            return patient_details_response
            
        fp_form_data = patient_details_response.data

        # Now check if patient has existing FP records and merge them
        try:
            patient = get_object_or_404(Patient, pat_id=patient_id)
            fp_record = FP_Record.objects.filter(pat=patient).first()
            
            if fp_record:
                # Update with existing FP record data
                fp_form_data.update({
                    'pantawid_4ps': fp_record.fourps if hasattr(fp_record, 'fourps') else False,
                    'planToHaveMoreChildren': fp_record.plan_more_children if hasattr(fp_record, 'plan_more_children') else False,
                    'averageMonthlyIncome': fp_record.avg_monthly_income or '',
                })
                
                # Get FP type information if available
                fp_type = FP_type.objects.filter(fprecord_id=fp_record).first()
                if fp_type:
                    fp_form_data.update({
                        'typeOfClient': fp_type.fpt_client_type or '',
                        'subTypeOfClient': fp_type.fpt_subtype or '',
                        'reasonForFP': fp_type.fpt_reason_fp or '',
                        'methodCurrentlyUsed': fp_type.fpt_method_used or '',
                    })
        except Exception as e:
            print(f"Error fetching existing FP records: {e}")
            # Continue with basic patient data even if FP records fail

        return Response(fp_form_data, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error in get_complete_fp_record: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def calculate_age_from_dob(dob_string):
    """Helper function to calculate age from date of birth string"""
    if not dob_string:
        return 0
    try:
        from datetime import datetime
        birth_date = datetime.strptime(dob_string, '%Y-%m-%d').date()
        today = date.today()
        return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    except:
        return 0


def map_education_attainment(education):
    """Helper function to map education attainment to form options"""
    if not education:
        return ''
    
    education_lower = education.lower()
    
    if 'elementary' in education_lower:
        return 'elementary'
    elif 'high school' in education_lower and 'senior' not in education_lower:
        return 'highschool'
    elif 'senior high school' in education_lower or 'shs' in education_lower:
        return 'shs'
    elif 'college' in education_lower and 'graduate' not in education_lower:
        return 'collegelevel'
    elif 'college graduate' in education_lower or 'graduate' in education_lower:
        return 'collegegrad'
    else:
        return ''


@api_view(['GET'])
def get_complete_fp_record(request, fprecord_id): # CRITICAL FIX: fprecord_id parameter
    try:
        # 1. Fetch the main FP_Record
        fprecord_id = get_object_or_404(FP_Record, fprecord_id=fprecord_id)

        # Initialize a dictionary to hold all combined data
        complete_data = FPRecordSerializer(fprecord_id).data # Start with main FP record data

        # 2. Fetch related FP_Type data (assuming one-to-one or one per FP_Record)
        try:
            fp_type = FP_type.objects.get(fprecord_id=fprecord_id)
            complete_data['fp_type'] = FPTypeSerializer(fp_type).data
        except FP_type.DoesNotExist:
            complete_data['fp_type'] = None

        # 3. Fetch Patient and Personal Info (via PatientRecord and Patient)
        try:
            patient_record_main_fp = fprecord_id.patrec # Get the PatientRecord linked to FP_Record
            patient = patient_record_main_fp.pat_id # Get the Patient linked to that PatientRecord
            complete_data['patient_info'] = PatientSerializer(patient).data # Use PatientSerializer
            
            # Additional Personal Info (if needed directly from Personal model, via ResidentProfile)
            # This depends on your PatientSerializer and how it exposes personal info.
            # If PatientSerializer already includes personal_info, this might be redundant.
            if patient.pat_type == 'Resident' and hasattr(patient.rp_id, 'per'):
                personal_info = patient.rp_id.per
                complete_data['personal_info_details'] = PersonalSerializer(personal_info).data
                # Also fetch address if available via Personal
                if hasattr(personal_info, 'peradd') and personal_info.peradd:
                    complete_data['address_details'] = AddressForFpSerializer(personal_info.peradd.add).data
            elif patient.pat_type == 'Transient' and hasattr(patient, 'trans_id'):
                 # Manually populate transient address/info if needed
                 complete_data['personal_info_details'] = {
                     'per_fname': patient.trans_id.tran_fname,
                     'per_lname': patient.trans_id.tran_lname,
                     'per_mname': patient.trans_id.tran_mname,
                     'per_dob': patient.trans_id.tran_dob,
                     'per_sex': patient.trans_id.tran_sex,
                     'per_age': (timezone.now().year - patient.trans_id.tran_dob.year),
                 }
                 complete_data['address_details'] = { # Assuming transient has tradd_id linked
                    'tradd_province': patient.trans_id.tradd_id.tradd_province,
                    'tradd_city': patient.trans_id.tradd_id.tradd_city,
                    'tradd_barangay': patient.trans_id.tradd_id.tradd_barangay,
                    'tradd_street': patient.trans_id.tradd_id.tradd_street,
                    'tradd_sitio': patient.trans_id.tradd_id.tradd_sitio,
                 }


            # Spouse Info
            if fprecord_id.spouse: # Check if spouse FK exists on FP_Record
                complete_data['spouse_info'] = SpouseSerializer(fprecord_id.spouse).data
            else:
                complete_data['spouse_info'] = None

        except (PatientRecord.DoesNotExist, Patient.DoesNotExist):
            complete_data['patient_info'] = None
            complete_data['personal_info_details'] = None
            complete_data['address_details'] = None
            complete_data['spouse_info'] = None # Clear if patient info missing

        # 4. Fetch FP_Obstetrical_History (linked to this FP_Record)
        try:
            fp_obstetrical_history = fprecord_id.fp_obstetrical_histories.first() # Use related_name
            if fp_obstetrical_history:
                complete_data['fp_obstetrical_history'] = FP_ObstetricalHistorySerializer(fp_obstetrical_history).data
                # Also fetch the main Obstetrical_History linked to it
                if fp_obstetrical_history.obs:
                    complete_data['main_obstetrical_history'] = ObstetricalHistorySerializer(fp_obstetrical_history.obs).data
                else:
                    complete_data['main_obstetrical_history'] = None
            else:
                complete_data['fp_obstetrical_history'] = None
                complete_data['main_obstetrical_history'] = None # Ensure consistent output even if no FP_OH
        except Exception as e:
            # Log this specific error for debugging during development
            print(f"Error fetching FP Obstetrical History or main Obstetrical History: {e}")
            complete_data['fp_obstetrical_history'] = None
            complete_data['main_obstetrical_history'] = None


        # 5. Fetch Risk STI
        try:
            risk_sti = FP_RiskSti.objects.get(fprecord_id=fprecord_id)
            complete_data['risk_sti'] = FPRiskStiSerializer(risk_sti).data
        except FP_RiskSti.DoesNotExist:
            complete_data['risk_sti'] = None

        # 6. Fetch Risk VAW
        try:
            risk_vaw = FP_RiskVaw.objects.get(fprecord_id=fprecord_id)
            complete_data['risk_vaw'] = FPRiskVawSerializer(risk_vaw).data
        except FP_RiskVaw.DoesNotExist:
            complete_data['risk_vaw'] = None

        # 7. Fetch FP_Physical_Exam and associated BodyMeasurement
        try:
            fp_physical_exam = FP_Physical_Exam.objects.get(fprecord_id=fprecord_id)
            complete_data['fp_physical_exam'] = FPPhysicalExamSerializer(fp_physical_exam).data
            if fp_physical_exam.bm: # Check if bm FK exists and is populated
                complete_data['body_measurement'] = BodyMeasurementSerializer(fp_physical_exam.bm).data
            else:
                complete_data['body_measurement'] = None
        except FP_Physical_Exam.DoesNotExist:
            complete_data['fp_physical_exam'] = None
            complete_data['body_measurement'] = None

        # 8. Fetch FP_Pelvic_Exam
        try:
            fp_pelvic_exam = FP_Pelvic_Exam.objects.get(fprecord_id=fprecord_id)
            complete_data['fp_pelvic_exam'] = PelvicExamSerializer(fp_pelvic_exam).data
        except FP_Pelvic_Exam.DoesNotExist:
            complete_data['fp_pelvic_exam'] = None

        # 9. Fetch FP_Acknowledgement
        try:
            fp_acknowledgement = FP_Acknowledgement.objects.get(fprecord_id=fprecord_id)
            complete_data['fp_acknowledgement'] = AcknowledgementSerializer(fp_acknowledgement).data
        except FP_Acknowledgement.DoesNotExist:
            complete_data['fp_acknowledgement'] = None

        # 10. Fetch FP_PregnancyCheck
        try:
            fp_pregnancy_check = FP_pregnancy_check.objects.get(fprecord_id=fprecord_id)
            complete_data['fp_pregnancy_check'] = FP_PregnancyCheckSerializer(fp_pregnancy_check).data
        except FP_pregnancy_check.DoesNotExist:
            complete_data['fp_pregnancy_check'] = None

        # 11. Fetch FP_Assessment_Record and associated FollowUpVisit
        try:
            fp_assessment = FP_Assessment_Record.objects.get(fprecord_id=fprecord_id)
            complete_data['fp_assessment'] = FPAssessmentSerializer(fp_assessment).data
            if fp_assessment.followv: # Check if followv FK exists and is populated
                complete_data['follow_up_visit'] = FollowUpVisitSerializer(fp_assessment.followv).data
            else:
                complete_data['follow_up_visit'] = None
        except FP_Assessment_Record.DoesNotExist:
            complete_data['fp_assessment'] = None
            complete_data['follow_up_visit'] = None


        return Response(complete_data, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        traceback.print_exc() # Print full traceback for debugging
        return Response({'error': f"Error fetching complete FP record: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# @api_view(['GET'])
# def get_complete_fp_record(request, patient_id):
#     try:
#         # First, get the patient
#         patient = get_object_or_404(Patient, pat_id=patient_id)
        
#         # Initialize response data with patient basic info
#         data = {
#             'pat_id': patient.pat_id,
#             'clientID': "",
#             'philhealthNo': '',
#             'nhts_status': False,
#             'pantawid_4ps': False,
#             'lastName': "",
#             'givenName': "",
#             'middleInitial': "",
#             'dateOfBirth': "",
#             'age': 0,
#             'educationalAttainment': "",
#             'occupation': "",
#             'address': {
#                 'houseNumber':"",
#                 'street': "",
#                 'barangay': "",
#                 'municipality': "",
#                 'province': "",
#             },
#             'spouse': {
#                 's_lastName': "",
#                 's_givenName': "",
#                 's_middleInitial': "",
#                 's_dateOfBirth': "",
#                 's_age': 0,
#                 's_occupation': "",
#             },
#             'numOfLivingChildren': 0,
#             'planToHaveMoreChildren': False,
#             'averageMonthlyIncome': "",
#             'typeOfClient': "",
#             'subTypeOfClient': "",
#             'reasonForFP': "",
#             'otherReasonForFP': "",
#             'methodCurrentlyUsed': "",
#             'otherMethod': "",
#             'weight': 0,
#             'height': 0,
#             'bmi': 0,
#             'bmi_category': "",
#             'obstetricalHistory': {
#                 'g_pregnancies': 0,
#                 'p_pregnancies': 0,
#                 'fullTerm': 0,
#                 'premature': 0,
#                 'abortion': 0,
#                 'livingChildren': 0,
#                 'lastDeliveryDate': "",
#                 'typeOfLastDelivery': "",
#                 'lastMenstrualPeriod': "",
#                 'previousMenstrualPeriod': "",
#                 'menstrualFlow': "Scanty",
#                 'dysmenorrhea': False,
#                 'hydatidiformMole': False,
#                 'ectopicPregnancyHistory': False,
#             }
#         }

#         # Get personal information if patient is a resident
#         if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
#             personal = patient.rp_id.per
#             data.update({
#                 'lastName': personal.per_lname or "",
#                 'givenName': personal.per_fname or "",
#                 'middleInitial': (personal.per_mname[0] if personal.per_mname else "") or "",
#                 'dateOfBirth': personal.per_dob.isoformat() if personal.per_dob else "",
#                 'age': calculate_age_from_dob(personal.per_dob) if personal.per_dob else 0,
#                 'educationalAttainment': map_education_attainment(personal.per_edAttainment) if personal.per_edAttainment else "",
#                 'occupation': personal.per_occupation or "",
#             })

#             # Get address information
#             try:
#                 personal_address = PersonalAddress.objects.filter(per=personal).first()
#                 if personal_address and personal_address.add:
#                     address = personal_address.add
#                     data['address'] = {
#                         'houseNumber': getattr(address, 'add_houseno', "") or "",
#                         'street': address.add_street or "",
#                         'barangay': address.add_barangay or "",
#                         'municipality': address.add_city or "",
#                         'province': address.add_province or "",
#                     }
#             except Exception as e:
#                 print(f"Error fetching address: {e}")

#             # Get spouse information
#             try:
#                 spouse = Spouse.objects.filter(rp_id=patient.rp_id).first()
#                 if spouse:
#                     data['spouse'] = {
#                         's_lastName': spouse.spouse_lname or "",
#                         's_givenName': spouse.spouse_fname or "",
#                         's_middleInitial': (spouse.spouse_mname[0] if spouse.spouse_mname else "") or "",
#                         's_dateOfBirth': spouse.spouse_dob.isoformat() if spouse.spouse_dob else "",
#                         's_age': calculate_age_from_dob(spouse.spouse_dob) if spouse.spouse_dob else 0,
#                         's_occupation': spouse.spouse_occupation or "",
#                     }
#                     print(spouse)
#             except Exception as e:
#                 print(f"Error fetching spouse: {e}")

#             # Get health related details
#             try:
#                 hrd = HealthRelatedDetails.objects.filter(per=personal).first()
#                 if hrd:
#                     data.update({
#                         'philhealthNo': hrd.hrd_philhealth_id or "",
#                         'numOfLivingChildren': getattr(hrd, 'hrd_no_living_children', 0) or 0,
#                     })
#             except Exception as e:
#                 print(f"Error fetching health details: {e}")

#             # Get NHTS status from household
#             try:
#                 household = Household.objects.filter(rp=patient.rp_id).first()
#                 if household:
#                     data['nhts_status'] = household.hh_nhts == 'Yes' if hasattr(household, 'hh_nhts') else False
#             except Exception as e:
#                 print(f"Error fetching household: {e}")

#         # Get body measurements
#         try:
#             body_measurement = BodyMeasurement.objects.filter(pat=patient).first()
#             if body_measurement:
#                 data.update({
#                     'weight': float(body_measurement.weight) if body_measurement.weight else 0,
#                     'height': float(body_measurement.height) if body_measurement.height else 0,
#                     'bmi': float(body_measurement.bmi) if body_measurement.bmi else 0,
#                     'bmi_category': body_measurement.bmi_category or "",
#                 })
#         except Exception as e:
#             print(f"Error fetching body measurements: {e}")

#         # Get obstetrical history
#         try:
#             # Get patient records for this patient
#             patient_records = PatientRecord.objects.filter(pat_id=patient)
#             for patient_record in patient_records:
#                 obs_history = Obstetrical_History.objects.filter(patrec_id=patient_record).first()
#                 if obs_history:
#                     data['obstetricalHistory'] = {
#                         'g_pregnancies': obs_history.obs_gravida or 0,
#                         'p_pregnancies': obs_history.obs_para or 0,
#                         'fullTerm': obs_history.obs_fullterm or 0,
#                         'premature': obs_history.obs_preterm or 0,
#                         'abortion': obs_history.obs_abortion or 0,
#                         'livingChildren': obs_history.obs_living_ch or 0,
#                         'lastDeliveryDate': "",
#                         'typeOfLastDelivery': "",
#                         'lastMenstrualPeriod': "",
#                         'previousMenstrualPeriod': "",
#                         'menstrualFlow': "Scanty",
#                         'dysmenorrhea': False,
#                         'hydatidiformMole': False,
#                         'ectopicPregnancyHistory': False,
#                     }
#                     break
#         except Exception as e:
#             print(f"Error fetching obstetrical history: {e}")

#         # Check if patient has existing FP records
#         try:
#             fp_record = FP_Record.objects.filter(pat=patient).first()
#             if fp_record:
#                 data.update({
#                     'pantawid_4ps': fp_record.fourps,
#                     'planToHaveMoreChildren': fp_record.plan_more_children,
#                     'averageMonthlyIncome': fp_record.avg_monthly_income or "",
#                 })
                
#                 # Get FP type information
#                 fp_type = FP_type.objects.filter(fprecord_id=fp_record).first()
#                 if fp_type:
#                     data.update({
#                         'typeOfClient': fp_type.fpt_client_type or "",
#                         'subTypeOfClient': fp_type.fpt_subtype or "",
#                         'reasonForFP': fp_type.fpt_reason_fp or "",
#                         'methodCurrentlyUsed': fp_type.fpt_method_used or "",
#                     })
#         except Exception as e:
#             print(f"Error fetching FP records: {e}")

#         return Response(data, status=status.HTTP_200_OK)

#     except Patient.DoesNotExist:
#         return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         print(f"Error in get_complete_fp_record: {e}")
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class FamilyPlanningCreateUpdateView(generics.CreateAPIView):
    serializer_class = FamilyPlanningRecordCompositeSerializer

    def create(self, request, *args, **kwargs):
        # Use the composite serializer to handle the entire payload
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "Family Planning record created successfully", "fprecord_id": serializer.instance.fprecord_id},
            status=status.HTTP_201_CREATED,
            headers=headers
        )

# --- Existing Individual CRUD Views (kept for granular access if needed) ---
# FP Record CRUD
class FP_RecordListCreateView(generics.ListCreateAPIView):
    serializer_class = FPRecordSerializer
    queryset = FP_Record.objects.all()

class FP_RecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPRecordSerializer
    queryset = FP_Record.objects.all()
    lookup_field = 'fprecord_id'

# View for creating PatientRecord instances (if applicable, possibly shared with other apps)
class PatientRecordCreateView(generics.CreateAPIView):
    serializer_class = PatientRecordSerializer # Now imported from apps.patientrecords.serializers
    queryset = PatientRecord.objects.all() 

# FP Type CRUD
class FP_TypeListCreateView(generics.ListCreateAPIView):
    serializer_class = FPTypeSerializer
    queryset = FP_type.objects.all()

class FP_TypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPTypeSerializer
    queryset = FP_type.objects.all()
    lookup_field = 'fpt_id'

# Risk STI CRUD
class RiskStiListCreateView(generics.ListCreateAPIView):
    serializer_class = FPRiskStiSerializer
    queryset = FP_RiskSti.objects.all()

class RiskStiDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPRiskStiSerializer
    queryset = FP_RiskSti.objects.all()
    lookup_field = 'sti_id'

# Risk VAW CRUD
class RiskVawListCreateView(generics.ListCreateAPIView):
    serializer_class = FPRiskVawSerializer
    queryset = FP_RiskVaw.objects.all()

class RiskVawDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPRiskVawSerializer
    queryset = FP_RiskVaw.objects.all()
    lookup_field = 'vaw_id'

# Physical Exam CRUD
class PhysicalExamListCreateView(generics.ListCreateAPIView):
    serializer_class = FPPhysicalExamSerializer
    queryset = FP_Physical_Exam.objects.all()

class PhysicalExamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPPhysicalExamSerializer
    queryset = FP_Physical_Exam.objects.all()
    lookup_field = 'fp_pe_id'

# Assessment CRUD 
class FPAssessmentListCreateView(generics.ListCreateAPIView):
    serializer_class = FP_ServiceProvisionRecordSerializer
    queryset = FP_Assessment_Record.objects.all()

class FPAssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FP_ServiceProvisionRecordSerializer
    queryset = FP_Assessment_Record.objects.all()
    lookup_field = 'assessment_id' # Corrected lookup field

# Pelvic Exam CRUD
class PelvicExamListCreateView(generics.ListCreateAPIView):
    serializer_class = PelvicExamSerializer
    queryset = FP_Pelvic_Exam.objects.all()

class PelvicExamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PelvicExamSerializer
    queryset = FP_Pelvic_Exam.objects.all()
    lookup_field = 'pelvic_id'

# Acknowledgement CRUD
class AcknowledgementListCreateView(generics.ListCreateAPIView):
    serializer_class = AcknowledgementSerializer
    queryset = FP_Acknowledgement.objects.all()

class AcknowledgementDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AcknowledgementSerializer
    queryset = FP_Acknowledgement.objects.all()
    lookup_field = 'ack_id'

class FP_ObstetricalListCreateView(generics.ListCreateAPIView):
    queryset = FP_Obstetrical_History.objects.all()
    serializer_class = FP_ObstetricalHistorySerializer
    
class FP_ObstetricalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FP_ObstetricalHistorySerializer
    queryset = FP_Obstetrical_History.objects.all()
    lookup_field = 'fpob_id'

# Pregnancy Check CRUD
class FP_PregnancyCheckListCreateView(generics.ListCreateAPIView):
    serializer_class = FP_PregnancyCheckSerializer
    queryset = FP_pregnancy_check.objects.all()

class FP_PregnancyCheckDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FP_PregnancyCheckSerializer
    queryset = FP_pregnancy_check.objects.all()
    lookup_field = 'fp_pc_id'

# Get complete FP record with all related data AND patient info
@api_view(['GET'])
def get_patient_fp_record(request, patient_id):
    try:
        # Try to find an existing FP record for this patient
        fp_record = FP_Record.objects.filter(pat__pat_id=patient_id).first()
        
        if fp_record:
            # If record exists, return it using the comprehensive serializer
            serializer = PatientComprehensiveFpSerializer(fp_record)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # If no record exists, return basic patient info to pre-fill the form
            patient = get_object_or_404(Patient, pat_id=patient_id)
            
            # Create a response with basic patient data
            data = {
                'pat_id': patient.pat_id,
                'clientID': patient.clientID,
                'lastName': '',
                'givenName': '',
                # Add other fields with empty defaults
            }
            
            # Add personal info if available
            if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
                personal = patient.rp_id.per
                data.update({
                    'lastName': personal.per_lname,
                    'givenName': personal.per_fname,
                    'middleInitial': personal.per_mname[0] if personal.per_mname else '',
                    'dateOfBirth': personal.per_dob,
                    'educationalAttainment': personal.per_edAttainment,
                    'occupation': personal.per_occupation,
                })
            
            return Response(data, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_fp_records_for_patient(request, patient_id):
    """
    Retrieves the most recent Family Planning record for a given patient ID.
    """
    try:
        # Fetch the Patient instance using the provided patient_id
        patient = get_object_or_404(Patient, pat_id=patient_id)

        # Retrieve the most recent FP_Record for this patient
        # Assuming a patient can have multiple FP records and we want the latest one
        fp_record = FP_Record.objects.filter(pat=patient).order_by('-created_at').first()

        if not fp_record:
            return Response({'detail': f'No Family Planning record found for patient ID: {patient_id}.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PatientComprehensiveFpSerializer(fp_record, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Patient.DoesNotExist:
        return Response({'detail': 'Patient not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': f"Error fetching FP records for patient: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class PatientListForOverallTable(generics.ListAPIView):
    serializer_class = FPRecordSerializer # Using FPRecordSerializer to represent the main record
    
    def get_queryset(self):
        # This queryset fetches FP_Record instances directly.
        # We then process them to group by patient for the "overall" table.
        return FP_Record.objects.select_related(
            'pat', 
            'pat__rp_id__per', # For resident patient personal info
            'pat__trans_id',   # For transient patient info
            'patrec'              # For FP_type details
        ).order_by('-created_at') # Order by latest for easy retrieval of the "latest" record

    def list(self, request, *args, **kwargs):
        all_fp_records = self.get_queryset()
        
        patient_data_map = {} # Use a dictionary to store the latest record for each patient

        for record in all_fp_records:
            patient_id = record.pat.pat_id
            
            if patient_id not in patient_data_map:
                patient_data_map[patient_id] = {
                    'patient_id': patient_id,
                    'patient_name': "",
                    'patient_age': None,
                    'sex': "",
                    'client_type': "",
                    'method_used': "",
                    'created_at': record.created_at, # This will be the created_at of the latest record
                    'fprecord_id': record.fprecord_id, # Latest record ID
                    'record_count': 0, # Will count all records for this patient
                    'has_multiple_records': False
                }
            
            patient_data_map[patient_id]['record_count'] += 1

            # Always update with the latest record's details
            patient_data_map[patient_id]['client_type'] = record.fpt.fpt_client_type if hasattr(record, 'fpt') and record.fpt else 'N/A'
            patient_data_map[patient_id]['method_used'] = record.fpt.fpt_method_used if hasattr(record, 'fpt') and record.fpt else 'N/A'
            patient_data_map[patient_id]['created_at'] = record.created_at # Ensure this is the latest date
            patient_data_map[patient_id]['fprecord_id'] = record.fprecord_id # Ensure this is the latest FP record ID

            # Populate patient details
            if record.pat.pat_type == 'Resident' and record.pat.rp_id and record.pat.rp_id.per:
                personal = record.pat.rp_id.per
                patient_data_map[patient_id]['patient_name'] = f"{personal.per_lname}, {personal.per_fname} {personal.per_mname or ''}".strip()
                # patient_data_map[patient_id]['patient_age'] = personal.age
                patient_data_map[patient_id]['sex'] = personal.per_sex
            elif record.pat.pat_type == 'Transient' and record.pat.trans_id:
                transient = record.pat.trans_id
                patient_data_map[patient_id]['patient_name'] = f"{transient.tran_lname}, {transient.tran_fname} {transient.tran_mname or ''}".strip()
                # Calculate age for transient if not stored directly
                patient_data_map[patient_id]['patient_age'] = (timezone.now().year - transient.tran_dob.year) 
                patient_data_map[patient_id]['sex'] = transient.tran_sex

        # Convert map values to a list and set the multiple records flag
        response_data = list(patient_data_map.values())
        for patient_entry in response_data:
            if patient_entry['record_count'] > 1:
                patient_entry['has_multiple_records'] = True
                patient_entry['method_used'] = 'Multiple Records' # Or other indicator
                patient_entry['client_type'] = 'Multiple Records' # Or other indicator

        # Sort by latest created_at date for display in the overall table
        response_data.sort(key=lambda x: x['created_at'], reverse=True)

        return Response(response_data, status=status.HTTP_200_OK)



# --- Original get_family_planning_patients (retained for now, but PatientListForOverallTable is preferred) ---
@api_view(['GET'])
def get_family_planning_patients(request):
    """
    NOTE: This view might be redundant if PatientListForOverallTable serves the same purpose.
    It has been updated to use PersonalInfoSerializer for patient details.
    """
    try:
        # Select patient records related to family planning, then prefetch personal info
        patients_with_fp_records = PatientRecord.objects.filter(
            patrec_type="Family Planning" # Filter for relevant PatientRecords
        ).select_related(
            'pat_id__rp_id__per', # For resident personal info
            'pat_id__trans_id'    # For transient personal info
        ).values_list('pat_id__pat_id', flat=True).distinct() # Get unique patient IDs

        # Now fetch the Patient objects based on these unique IDs
        patients = Patient.objects.filter(pat_id__in=patients_with_fp_records).select_related(
            'rp_id__per', # For Resident personal info
            'trans_id'    # For Transient personal info
        )

        data = []
        for patient in patients:
            personal_info_data = None
            if patient.pat_type == 'Resident' and patient.rp_id and hasattr(patient.rp_id, 'per'):
                personal_info_data = PatientSerializer(patient.rp_id.per).data
            elif patient.pat_type == 'Transient' and patient.trans_id:
                # Manually construct personal_info_data for transient if no dedicated serializer
                personal_info_data = {
                    'per_fname': patient.trans_id.tran_fname,
                    'per_lname': patient.trans_id.tran_lname,
                    'per_mname': patient.trans_id.tran_mname,
                    'per_dob': patient.trans_id.tran_dob,
                    'per_sex': patient.trans_id.tran_sex,
                    'per_age': (timezone.now().year - patient.trans_id.tran_dob.year),
                    # Add other transient fields if desired for personal_info
                }

            data.append({
                'pat_id': patient.pat_id,
                'personal_info': personal_info_data,
                'pat_type': patient.pat_type,
                'created_at': patient.created_at,
                'updated_at': patient.updated_at,
                'pat_status': patient.pat_status,
            })
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': f"Error fetching family planning patients: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


            
            