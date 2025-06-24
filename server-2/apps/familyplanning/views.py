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
from apps.patientrecords.serializers import PatientRecordSerializer, PatientSerializer
from apps.healthProfiling.serializers import *


@api_view(['GET'])
def get_patient_details(request, patient_id):
    try:
        # Use the existing PatientDetailView logic to get patient data
        patient = get_object_or_404(Patient, pat_id=patient_id)
        
        # Use the PatientSerializer to get the same data structure as patientrecords/patient/
        serializer = PatientSerializer(patient)
        patient_data = serializer.data
        
        # Transform the patient data to match FP form structure
        fp_form_data = {
            'pat_id': patient_data.get('pat_id', ''),
            'clientID': patient_data.get('clientID', ''),  # Use pat_id as clientID if no specific clientID
            'philhealthNo': patient_data.get('philhealthNo',''),
            'nhts_status': patient_data.get('nhts_status'),
            'pantawid_4ps': patient_data.get('fourps'),
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
            'bmi': 0,
            'bmi_category': '',
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

        # Extract personal information
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

        # Try to get additional data from related models
        try:
            # Get body measurements if available
            body_measurement = BodyMeasurement.objects.filter(pat=patient).first()
            if body_measurement:
                fp_form_data.update({
                    'weight': float(body_measurement.weight) if body_measurement.weight else 0,
                    'height': float(body_measurement.height) if body_measurement.height else 0,
                    'bmi': float(body_measurement.bmi) if body_measurement.bmi else 0,
                    'bmi_category': body_measurement.bmi_category or '',
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
        if patient.pat_type == 'Resident' and patient.rp_id:
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
def get_complete_fp_record(request, patient_id):
    try:
        # First, get the patient
        patient = get_object_or_404(Patient, pat_id=patient_id)
        
        # Initialize response data with patient basic info
        data = {
            'pat_id': patient.pat_id,
            'clientID': "",
            'philhealthNo': "",
            'nhts_status': False,
            'pantawid_4ps': False,
            'lastName': "",
            'givenName': "",
            'middleInitial': "",
            'dateOfBirth': "",
            'age': 0,
            'educationalAttainment': "",
            'occupation': "",
            'address': {
                'houseNumber': "",
                'street': "",
                'barangay': "",
                'municipality': "",
                'province': "",
            },
            'spouse': {
                's_lastName': "",
                's_givenName': "",
                's_middleInitial': "",
                's_dateOfBirth': "",
                's_age': 0,
                's_occupation': "",
            },
            'numOfLivingChildren': 0,
            'planToHaveMoreChildren': False,
            'averageMonthlyIncome': "",
            'typeOfClient': "",
            'subTypeOfClient': "",
            'reasonForFP': "",
            'otherReasonForFP': "",
            'methodCurrentlyUsed': "",
            'otherMethod': "",
            'weight': 0,
            'height': 0,
            'bmi': 0,
            'bmi_category': "",
            'obstetricalHistory': {
                'g_pregnancies': 0,
                'p_pregnancies': 0,
                'fullTerm': 0,
                'premature': 0,
                'abortion': 0,
                'livingChildren': 0,
                'lastDeliveryDate': "",
                'typeOfLastDelivery': "",
                'lastMenstrualPeriod': "",
                'previousMenstrualPeriod': "",
                'menstrualFlow': "Scanty",
                'dysmenorrhea': False,
                'hydatidiformMole': False,
                'ectopicPregnancyHistory': False,
            }
        }

        # Get personal information if patient is a resident
        if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
            personal = patient.rp_id.per
            data.update({
                'lastName': personal.per_lname or "",
                'givenName': personal.per_fname or "",
                'middleInitial': (personal.per_mname[0] if personal.per_mname else "") or "",
                'dateOfBirth': personal.per_dob.isoformat() if personal.per_dob else "",
                'age': calculate_age_from_dob(personal.per_dob) if personal.per_dob else 0,
                'educationalAttainment': map_education_attainment(personal.per_edAttainment) if personal.per_edAttainment else "",
                'occupation': personal.per_occupation or "",
            })

            # Get address information
            try:
                personal_address = PersonalAddress.objects.filter(per=personal).first()
                if personal_address and personal_address.add:
                    address = personal_address.add
                    data['address'] = {
                        'houseNumber': getattr(address, 'add_houseno', "") or "",
                        'street': address.add_street or "",
                        'barangay': address.add_barangay or "",
                        'municipality': address.add_city or "",
                        'province': address.add_province or "",
                    }
            except Exception as e:
                print(f"Error fetching address: {e}")

            # Get spouse information
            try:
                spouse = Spouse.objects.filter(rp_id=patient.rp_id).first()
                if spouse:
                    data['spouse'] = {
                        's_lastName': spouse.spouse_lname or "",
                        's_givenName': spouse.spouse_fname or "",
                        's_middleInitial': (spouse.spouse_mname[0] if spouse.spouse_mname else "") or "",
                        's_dateOfBirth': spouse.spouse_dob.isoformat() if spouse.spouse_dob else "",
                        's_age': calculate_age_from_dob(spouse.spouse_dob) if spouse.spouse_dob else 0,
                        's_occupation': spouse.spouse_occupation or "",
                    }
                    print(spouse)
            except Exception as e:
                print(f"Error fetching spouse: {e}")

            # Get health related details
            try:
                hrd = HealthRelatedDetails.objects.filter(per=personal).first()
                if hrd:
                    data.update({
                        'philhealthNo': hrd.hrd_philhealth_id or "",
                        'numOfLivingChildren': getattr(hrd, 'hrd_no_living_children', 0) or 0,
                    })
            except Exception as e:
                print(f"Error fetching health details: {e}")

            # Get NHTS status from household
            try:
                household = Household.objects.filter(rp=patient.rp_id).first()
                if household:
                    data['nhts_status'] = household.hh_nhts == 'Yes' if hasattr(household, 'hh_nhts') else False
            except Exception as e:
                print(f"Error fetching household: {e}")

        # Get body measurements
        try:
            body_measurement = BodyMeasurement.objects.filter(pat=patient).first()
            if body_measurement:
                data.update({
                    'weight': float(body_measurement.weight) if body_measurement.weight else 0,
                    'height': float(body_measurement.height) if body_measurement.height else 0,
                    'bmi': float(body_measurement.bmi) if body_measurement.bmi else 0,
                    'bmi_category': body_measurement.bmi_category or "",
                })
        except Exception as e:
            print(f"Error fetching body measurements: {e}")

        # Get obstetrical history
        try:
            # Get patient records for this patient
            patient_records = PatientRecord.objects.filter(pat_id=patient)
            for patient_record in patient_records:
                obs_history = Obstetrical_History.objects.filter(patrec_id=patient_record).first()
                if obs_history:
                    data['obstetricalHistory'] = {
                        'g_pregnancies': obs_history.obs_gravida or 0,
                        'p_pregnancies': obs_history.obs_para or 0,
                        'fullTerm': obs_history.obs_fullterm or 0,
                        'premature': obs_history.obs_preterm or 0,
                        'abortion': obs_history.obs_abortion or 0,
                        'livingChildren': obs_history.obs_living_ch or 0,
                        'lastDeliveryDate': "",
                        'typeOfLastDelivery': "",
                        'lastMenstrualPeriod': "",
                        'previousMenstrualPeriod': "",
                        'menstrualFlow': "Scanty",
                        'dysmenorrhea': False,
                        'hydatidiformMole': False,
                        'ectopicPregnancyHistory': False,
                    }
                    break
        except Exception as e:
            print(f"Error fetching obstetrical history: {e}")

        # Check if patient has existing FP records
        try:
            fp_record = FP_Record.objects.filter(pat=patient).first()
            if fp_record:
                data.update({
                    'pantawid_4ps': fp_record.fourps,
                    'planToHaveMoreChildren': fp_record.plan_more_children,
                    'averageMonthlyIncome': fp_record.avg_monthly_income or "",
                })
                
                # Get FP type information
                fp_type = FP_type.objects.filter(fprecord_id=fp_record).first()
                if fp_type:
                    data.update({
                        'typeOfClient': fp_type.fpt_client_type or "",
                        'subTypeOfClient': fp_type.fpt_subtype or "",
                        'reasonForFP': fp_type.fpt_reason_fp or "",
                        'methodCurrentlyUsed': fp_type.fpt_method_used or "",
                    })
        except Exception as e:
            print(f"Error fetching FP records: {e}")

        return Response(data, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in get_complete_fp_record: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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

# Obstetrical History CRUD
class FP_ObstetricalListCreateView(generics.ListCreateAPIView):
    serializer_class = FP_ObstetricalHistorySerializer
    queryset = FP_Obstetrical_History.objects.all()

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

# --- NEW VIEW FOR OVERALL TABLE: Get unique patients with FP records and conditional details ---
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


# Delete complete FP record and all related data
@api_view(['DELETE'])
def delete_complete_fp_record(request, fprecord_id):
    """
    Deletes a complete Family Planning record and all its associated sub-records.
    """
    try:
        with transaction.atomic(): # Ensure atomic deletion
            fp_record = get_object_or_404(FP_Record, fprecord_id=fprecord_id)
            # Delete related records. Using .filter().delete() is more efficient than iterating.
            FP_type.objects.filter(fprecord_id=fprecord_id).delete()
            FP_Obstetrical_History.objects.filter(fprecord_id=fprecord_id).delete()
            FP_RiskSti.objects.filter(fprecord_id=fprecord_id).delete()
            FP_RiskVaw.objects.filter(fprecord_id=fprecord_id).delete()
            FP_Physical_Exam.objects.filter(fprecord_id=fprecord_id).delete()
            FP_Pelvic_Exam.objects.filter(fprecord_id=fprecord_id).delete()
            FP_Acknowledgement.objects.filter(fprecord_id=fprecord_id).delete()
            FP_pregnancy_check.objects.filter(fprecord_id=fprecord_id).delete()
            FP_Assessment_Record.objects.filter(fprecord_id=fprecord_id).delete()
            
            # Finally, delete the main FP_Record
            fp_record.delete()
            return Response({'message': 'FP record and all related data deleted successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': f"Error deleting FP record: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

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

# --- Original PatientListAPIView (can be replaced by PatientListForOverallTable if only distinct patients are needed here) ---
class PatientListAPIView(generics.ListAPIView):
    # This serializer is for FP_Record. If you want a list of unique Patients, use PatientListForOverallTable
    serializer_class = FPRecordSerializer 
    queryset = FP_Record.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset

            
            
            
# from rest_framework import generics, status
# from rest_framework.response import Response
# from rest_framework.decorators import api_view
# from django.shortcuts import get_object_or_404
# from django.db import transaction
# from django.utils import timezone
# from datetime import date

# # Import all necessary models and serializers
# from .serializers import *
# from .models import *
# from apps.patientrecords.models import *
# from apps.healthProfiling.models import *
# from apps.patientrecords.serializers import *


# # Helper functions (already present, ensuring they are used correctly)
# def calculate_age_from_dob(dob_string):
#     """Helper function to calculate age from date of birth string"""
#     if not dob_string:
#         return 0
#     try:
#         from datetime import datetime
#         # Handle cases where DOB might be a date object already or a string
#         if isinstance(dob_string, date):
#             birth_date = dob_string
#         else:
#             birth_date = datetime.strptime(dob_string, '%Y-%m-%d').date()
#         today = date.today()
#         return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
#     except:
#         return 0


# def map_education_attainment(education):
#     """Helper function to map education attainment to form options"""
#     if not education:
#         return ''
    
#     education_lower = education.lower()
    
#     if 'elementary' in education_lower:
#         return 'elementary'
#     elif 'high school' in education_lower and 'senior' not in education_lower:
#         return 'highschool'
#     elif 'senior high school' in education_lower or 'shs' in education_lower:
#         return 'shs'
#     elif 'college' in education_lower and 'graduate' not in education_lower:
#         return 'collegelevel'
#     elif 'college graduate' in education_lower or 'graduate' in education_lower:
#         return 'collegegrad'
#     else:
#         return ''

# @api_view(['GET'])
# def get_patient_details(request, patient_id):
#     """
#     Retrieves and formats comprehensive patient details for initial population of FP form.
#     This now fetches from Patient, Personal, Address, Spouse, HealthRelatedDetails, Household,
#     BodyMeasurement, and Obstetrical_History, mapping them to frontend FormData structure.
#     """
#     try:
#         patient = get_object_or_404(Patient, pat_id=patient_id)
        
#         # Initialize with default values corresponding to your FormData schema
#         fp_form_data = {
#             'pat_id': str(patient.pat_id), # Ensure it's string as frontend expects
#             'clientID': patient.client_id if hasattr(patient, 'client_id') else "", # Assuming client_id exists on Patient model or derived
#             'philhealthNo': "",
#             'nhts_status': False,
#             'pantawid_4ps': False, # Will be updated if an FP_Record exists
#             'lastName': "",
#             'givenName': "",
#             'middleInitial': "",
#             'dateOfBirth': "",
#             'age': 0,
#             'educationalAttainment': "",
#             'occupation': "",
#             'religion': "",
#             'ethnicity': "",
#             'contactNo': "",
#             'isTransient': patient.pat_type == 'Transient', # Assuming pat_type determines transient status
#             'address': {
#                 'houseNumber': "",
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
#                 's_contactNo': "",
#             },
#             'numOfLivingChildren': 0,
#             'planToHaveMoreChildren': False,
#             'averageMonthlyIncome': "",
#             'typeOfClient': "",
#             'subTypeOfClient': "",
#             'reasonForFP': "",
#             'otherReasonForFP': "",
#             'reason': "",
#             'otherReason': "",
#             'methodCurrentlyUsed': "",
#             'otherMethod': "",
#             'medicalHistory': {}, # Will be fetched via FP_Record later if exists
#             'obstetricalHistory': {
#                 'g_pregnancies': 0,
#                 'p_pregnancies': 0,
#                 'fullTerm': 0,
#                 'premature': 0,
#                 'abortion': 0,
#                 'livingChildren': 0,
#                 'lastDeliveryDate': '',
#                 'typeOfLastDelivery': '',
#                 'lastMenstrualPeriod': '',
#                 'previousMenstrualPeriod': '',
#                 'menstrualFlow': 'Scanty',
#                 'dysmenorrhea': False,
#                 'hydatidiformMole': False,
#                 'ectopicPregnancyHistory': False,
#             },
#             'sexuallyTransmittedInfections': {}, # Will be fetched via FP_Record later if exists
#             'violenceAgainstWomen': {}, # Will be fetched via FP_Record later if exists
#             'weight': 0,
#             'occupation': "",
#             'height': 0,
#             'bloodPressure': "",
#             'pulseRate': 0,
#             'skinExamination': "normal",
#             'conjunctivaExamination': "normal",
#             'neckExamination': "normal",
#             'breastExamination': "normal",
#             'abdomenExamination': "normal",
#             'extremitiesExamination': "normal",
#             'pelvicExamination': "normal",
#             'cervicalConsistency': "firm",
#             'cervicalTenderness': False,
#             'cervicalAdnexalMassTenderness': False,
#             'uterinePosition': "mid",
#             'uterineDepth': 0,
#             'acknowledgement': {
#                 'selectedMethod': "coc",
#                 'clientSignature': "",
#                 'clientSignatureDate': "",
#                 'clientName': "",
#                 'guardianName': "",
#                 'guardianSignature': "",
#                 'guardianSignatureDate': "",
#             },
#             'serviceProvisionRecords': [],
#             'pregnancyCheck': {}, # Will be fetched via FP_Record later if exists
#         }

#         # --- Populate Personal Information ---
#         if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
#             personal = patient.rp_id.per
#             fp_form_data.update({
#                 'lastName': personal.per_lname or "",
#                 'givenName': personal.per_fname or "",
#                 'middleInitial': (personal.per_mname[0] if personal.per_mname else "") or "", # Frontend expects char, not just first letter
#                 'dateOfBirth': personal.per_dob.isoformat() if personal.per_dob else "",
#                 'age': calculate_age_from_dob(personal.per_dob) if personal.per_dob else 0,
#                 'educationalAttainment': map_education_attainment(personal.per_edAttainment) if personal.per_edAttainment else "",
#                 # 'occupation': personal.occupation or "",
#                 'religion': personal.per_religion or "",
#                 # 'ethnicity': personal.per_ethnicity or "",
#                 # 'contactNo': personal.per_contact_no or "",
#             })

#             # --- Populate Address Information ---
#             try:
#                 # Assuming PersonalAddress links Personal to Address
#                 personal_address = PersonalAddress.objects.filter(per=personal).first()
#                 if personal_address and personal_address.add:
#                     address = personal_address.add
#                     fp_form_data['address'] = {
#                         'houseNumber': getattr(address, 'add_houseno', "") or "", # Using getattr for safety
#                         'street': address.add_street or "",
#                         'barangay': address.add_barangay or "",
#                         'municipality': address.add_city or "",
#                         'province': address.add_province or "",
#                     }
#             except Exception as e:
#                 print(f"DEBUG: Error fetching address for patient {patient_id}: {e}")

#             # --- Populate Spouse Information ---
#             try:
#                 # Assuming Spouse model has a FK to ResidentProfile
#                 spouse = Spouse.objects.filter(rp_id=patient.rp_id).first()
#                 if spouse:
#                     fp_form_data['spouse'] = {
#                         's_lastName': spouse.spouse_lname or "",
#                         's_givenName': spouse.spouse_fname or "",
#                         's_middleInitial': (spouse.spouse_mname[0] if spouse.spouse_mname else "") or "",
#                         's_dateOfBirth': spouse.spouse_dob.isoformat() if spouse.spouse_dob else "",
#                         's_age': calculate_age_from_dob(spouse.spouse_dob) if spouse.spouse_dob else 0,
#                         's_occupation': spouse.spouse_occupation or "",
#                         's_contactNo': spouse.spouse_contact_no or "",
#                     }
#             except Exception as e:
#                 print(f"DEBUG: Error fetching spouse for patient {patient_id}: {e}")

#             try:
#                 hrd = HealthRelatedDetails.objects.filter(per=personal).first()
#                 if hrd:
#                     fp_form_data.update({
#                         'philhealthNo': hrd.hrd_philhealth_id or "",
#                         'numOfLivingChildren': hrd.hrd_no_living_children if hrd.hrd_no_living_children is not None else 0,
#                     })
#             except Exception as e:
#                 print(f"DEBUG: Error fetching health details for patient {patient_id}: {e}")

#             # --- Populate NHTS Status from Household ---
#             try:
#                 household = Household.objects.filter(rp=patient.rp_id).first()
#                 if household and household.hh_nhts is not None:
#                     fp_form_data['nhts_status'] = household.hh_nhts # Assuming hh_nhts is already boolean or "Yes"/"No"
#             except Exception as e:
#                 print(f"DEBUG: Error fetching household NHTS for patient {patient_id}: {e}")

#         # --- Populate Body Measurements ---
#         try:
#             body_measurement = BodyMeasurement.objects.filter(pat=patient).order_by('-created_at').first()
#             if body_measurement:
#                 fp_form_data.update({
#                     'weight': float(body_measurement.body_weight) if body_measurement.body_weight else 0,
#                     'height': float(body_measurement.body_height) if body_measurement.body_height else 0,
#                     'bmi': float(body_measurement.bmi) if body_measurement.bmi else 0, # Assuming BMI field exists
#                     'bmi_category': body_measurement.bmi_category or '', # Assuming BMI category field exists
#                 })
#         except Exception as e:
#             print(f"DEBUG: Error fetching body measurements for patient {patient_id}: {e}")

#         # --- Populate Obstetrical History (from patientrecords.models.Obstetrical_History) ---
#         try:
#             # Get the patient's record (patrec) to find related obstetrical histories
#             patient_record_inst = PatientRecord.objects.filter(pat=patient).first()
#             if patient_record_inst:
#                 obs_history = Obstetrical_History.objects.filter(patrec=patient_record_inst).order_by('-created_at').first()
#                 if obs_history:
#                     fp_form_data['obstetricalHistory'] = {
#                         'g_pregnancies': obs_history.obs_gravida if obs_history.obs_gravida is not None else 0,
#                         'p_pregnancies': obs_history.obs_para if obs_history.obs_para is not None else 0,
#                         'fullTerm': obs_history.obs_fullterm if obs_history.obs_fullterm is not None else 0,
#                         'premature': obs_history.obs_preterm if obs_history.obs_preterm is not None else 0,
#                         'abortion': obs_history.obs_abortion if obs_history.obs_abortion is not None else 0,
#                         'livingChildren': obs_history.obs_living_ch if obs_history.obs_living_ch is not None else 0,
#                         # The following fields come from FP_Obstetrical_History, will be merged later
#                         'lastDeliveryDate': '',
#                         'typeOfLastDelivery': '',
#                         'lastMenstrualPeriod': '',
#                         'previousMenstrualPeriod': '',
#                         'menstrualFlow': 'Scanty',
#                         'dysmenorrhea': False,
#                         'hydatidiformMole': False,
#                         'ectopicPregnancyHistory': False,
#                     }
#         except Exception as e:
#             print(f"DEBUG: Error fetching patient Obstetrical_History for patient {patient_id}: {e}")

#         return Response(fp_form_data, status=status.HTTP_200_OK)

#     except Patient.DoesNotExist:
#         return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         print(f"DEBUG: Error in get_patient_details (overall): {e}")
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['GET'])
# def get_complete_fp_record(request, fprecord_id):
#     """
#     Retrieves a complete Family Planning record including all nested data for a given fprecord_id.
#     This view uses PatientComprehensiveFpSerializer for a read-only representation.
#     """
#     try:
#         fp_record_instance = get_object_or_404(FP_Record, fprecord_id=fprecord_id)
        
#         # Use the comprehensive serializer to get all related data
#         serializer = PatientComprehensiveFpSerializer(fp_record_instance)
        
#         # Manually assemble additional fields from related FP models
#         response_data = serializer.data

#         # Populate FP_Type data
#         fp_type_instance = FP_type.objects.filter(fprecord=fp_record_instance).first()
#         if fp_type_instance:
#             response_data.update({
#                 'typeOfClient': fp_type_instance.fpt_client_type or "",
#                 'subTypeOfClient': fp_type_instance.fpt_subtype or "",
#                 'reasonForFP': fp_type_instance.fpt_reason_fp or "",
#                 'otherReasonForFP': fp_type_instance.fpt_other_reason_fp or "",
#                 'reason': fp_type_instance.fpt_reason or "",
#                 'otherReason': fp_type_instance.fpt_other_reason or "",
#                 'methodCurrentlyUsed': fp_type_instance.fpt_method_used or "",
#                 'otherMethod': fp_type_instance.fpt_other_method or "",
#             })
        
#         # Populate FP_Obstetrical_History (the FP-specific part)
#         fp_obs_history_instance = FP_Obstetrical_History.objects.filter(fprecord=fp_record_instance).first()
#         if fp_obs_history_instance:
#             # Merge with existing obstetricalHistory from patientrecords.models.Obstetrical_History
#             # Ensure proper field mapping as per your frontend schema
#             response_data['obstetricalHistory'].update({
#                 'lastDeliveryDate': fp_obs_history_instance.fpob_last_delivery.isoformat() if fp_obs_history_instance.fpob_last_delivery else "",
#                 'typeOfLastDelivery': fp_obs_history_instance.fpob_type_last_delivery or "",
#                 'lastMenstrualPeriod': fp_obs_history_instance.fpob_last_period or "", # This should ideally be a DateField
#                 'previousMenstrualPeriod': fp_obs_history_instance.fpob_previous_period or "", # This should ideally be a DateField
#                 'menstrualFlow': fp_obs_history_instance.fpob_mens_flow or "Scanty",
#                 'dysmenorrhea': fp_obs_history_instance.fpob_dysme,
#                 'hydatidiformMole': fp_obs_history_instance.fpob_hydatidiform,
#                 'ectopicPregnancyHistory': fp_obs_history_instance.fpob_ectopic_pregnancy,
#             })
        
#         # Populate FP_RiskSti data
#         fp_risk_sti_instance = FP_RiskSti.objects.filter(fprecord=fp_record_instance).first()
#         if fp_risk_sti_instance and fp_risk_sti_instance.sti_risk:
#             response_data['sexuallyTransmittedInfections'] = fp_risk_sti_instance.sti_risk # Assuming sti_risk is JSONField
#             response_data['sexuallyTransmittedInfections']['dischargeFrom'] = fp_risk_sti_instance.discharge_from if hasattr(fp_risk_sti_instance, 'discharge_from') else None
#         else:
#              response_data['sexuallyTransmittedInfections'] = { # Default structure if no data
#                 'abnormalDischarge': False, 'dischargeFrom': None, 'sores': False, 'pain': False, 'history': False, 'hiv': False
#             }


#         # Populate FP_RiskVaw data
#         fp_risk_vaw_instance = FP_RiskVaw.objects.filter(fprecord=fp_record_instance).first()
#         if fp_risk_vaw_instance and fp_risk_vaw_instance.vaw_risk:
#             response_data['violenceAgainstWomen'] = fp_risk_vaw_instance.vaw_risk # Assuming vaw_risk is JSONField
#             response_data['violenceAgainstWomen']['referredTo'] = fp_risk_vaw_instance.vaw_referral if hasattr(fp_risk_vaw_instance, 'vaw_referral') else None
#         else:
#              response_data['violenceAgainstWomen'] = { # Default structure if no data
#                 'unpleasantRelationship': False, 'partnerDisapproval': False, 'domesticViolence': False, 'referredTo': None
#             }


#         # Populate FP_Physical_Exam data
#         fp_physical_exam_instance = FP_Physical_Exam.objects.filter(fprecord=fp_record_instance).first()
#         if fp_physical_exam_instance:
#             response_data.update({
#                 'skinExamination': fp_physical_exam_instance.skin_exam or "normal",
#                 'conjunctivaExamination': fp_physical_exam_instance.conjunctiva_exam or "normal",
#                 'neckExamination': fp_physical_exam_instance.neck_exam or "normal",
#                 'breastExamination': fp_physical_exam_instance.breast_exam or "normal",
#                 'abdomenExamination': fp_physical_exam_instance.abdomen_exam or "normal",
#                 'extremitiesExamination': fp_physical_exam_instance.extremities_exam or "normal",
#             })
#             # Blood Pressure and Pulse Rate from Vital_Signs_Record (latest for patient)
#             latest_vs = VitalSigns.objects.filter(pat=fp_record_instance.pat).order_by('-created_at').first()
#             if latest_vs:
#                 response_data['bloodPressure'] = f"{latest_vs.vs_bp_systolic}/{latest_vs.vs_bp_diastolic}" if latest_vs.vs_bp_systolic and latest_vs.vs_bp_diastolic else ""
#                 response_data['pulseRate'] = latest_vs.vs_pulse_rate if latest_vs.vs_pulse_rate is not None else 0

#         # Populate FP_Pelvic_Exam data
#         fp_pelvic_exam_instance = FP_Pelvic_Exam.objects.filter(fprecord=fp_record_instance).first()
#         if fp_pelvic_exam_instance:
#             response_data.update({
#                 'pelvicExamination': fp_pelvic_exam_instance.pelvic_exam or "normal",
#                 'cervicalConsistency': fp_pelvic_exam_instance.cervical_consistency or "firm",
#                 'cervicalTenderness': fp_pelvic_exam_instance.cervical_tenderness,
#                 'cervicalAdnexalMassTenderness': fp_pelvic_exam_instance.cervical_adnexal_mass_tenderness,
#                 'uterinePosition': fp_pelvic_exam_instance.uterine_position or "mid",
#                 'uterineDepth': fp_pelvic_exam_instance.uterine_depth if fp_pelvic_exam_instance.uterine_depth is not None else 0,
#             })

#         # Populate FP_Acknowledgement data
#         fp_acknowledgement_instance = FP_Acknowledgement.objects.filter(fprecord=fp_record_instance).first()
#         if fp_acknowledgement_instance:
#             response_data['acknowledgement'].update({
#                 'selectedMethod': fp_acknowledgement_instance.ack_method_selected or response_data.get('methodCurrentlyUsed', ""), # Fallback to methodCurrentlyUsed
#                 'clientSignature': fp_acknowledgement_instance.client_signature or "",
#                 'clientSignatureDate': fp_acknowledgement_instance.client_signature_date.isoformat() if fp_acknowledgement_instance.client_signature_date else "",
#                 'clientName': fp_acknowledgement_instance.client_name or response_data.get('givenName', "") + " " + response_data.get('lastName', ""),
#                 'guardianSignature': fp_acknowledgement_instance.guardian_signature or "",
#                 'guardianSignatureDate': fp_acknowledgement_instance.guardian_signature_date.isoformat() if fp_acknowledgement_instance.guardian_signature_date else "",
#                 'guardianName': fp_acknowledgement_instance.guardian_name or "", # Assuming guardian_name field exists
#             })
        
#         # Populate FP_pregnancy_check data
#         fp_pregnancy_check_instance = FP_pregnancy_check.objects.filter(fprecord=fp_record_instance).first()
#         if fp_pregnancy_check_instance:
#             response_data['pregnancyCheck'] = {
#                 'breastfeeding': fp_pregnancy_check_instance.breastfeeding,
#                 'abstained': fp_pregnancy_check_instance.abstained,
#                 'recent_baby': fp_pregnancy_check_instance.recent_baby,
#                 'recent_period': fp_pregnancy_check_instance.recent_period,
#                 'recent_abortion': fp_pregnancy_check_instance.recent_abortion,
#                 'using_contraceptive': fp_pregnancy_check_instance.using_contraceptive,
#             }
        
#         # Populate FP_Assessment_Record data
#         service_provision_records = FP_Assessment_Record.objects.filter(fprecord=fp_record_instance)
#         response_data['serviceProvisionRecords'] = [
#             {
#                 'dateOfVisit': record.date_of_visit.isoformat() if record.date_of_visit else "",
#                 'methodAccepted': record.method_accepted or "",
#                 'nameOfServiceProvider': record.name_of_service_provider or "",
#                 'dateOfFollowUp': record.date_of_follow_up.isoformat() if record.date_of_follow_up else "",
#                 'methodQuantity': record.method_quantity or "",
#                 'methodUnit': record.method_unit or "",
#                 'serviceProviderSignature': record.service_provider_signature or "",
#                 'medicalFindings': record.medical_findings or "",
#                 'weight': float(record.weight) if record.weight else 0,
#                 'bp_systolic': record.bp_systolic if record.bp_systolic is not None else 0,
#                 'bp_diastolic': record.bp_diastolic if record.bp_diastolic is not None else 0,
#                 'assessmentFindings': record.assessment_findings or "",
#             } for record in service_provision_records
#         ]


#         return Response(response_data, status=status.HTTP_200_OK)

#     except FP_Record.DoesNotExist:
#         return Response({'error': 'Family Planning Record not found'}, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         print(f"DEBUG: Error in get_complete_fp_record (with fprecord_id): {e}")
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class FamilyPlanningCreateUpdateView(generics.CreateAPIView):
#     """
#     API view for creating or updating a complete Family Planning record, including all
#     related sub-records (FP_type, Risk STI, Physical Exam, etc.) and
#     handling Vital Signs, Body Measurements, and Inventory deductions.
#     """
#     serializer_class = FamilyPlanningRecordCompositeSerializer

#     def create(self, request, *args, **kwargs):
#         # Use the composite serializer to handle the entire payload
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         fp_record_instance = serializer.save() # Call save on the serializer
#         headers = self.get_success_headers(serializer.data)
#         return Response(
#             {"message": "Family Planning record created successfully", "fprecord_id": fp_record_instance.fprecord_id},
#             status=status.HTTP_201_CREATED,
#             headers=headers
#         )

#     def put(self, request, *args, **kwargs):
#         fprecord_id = kwargs.get('fprecord_id')
#         if not fprecord_id:
#             return Response({"detail": "fprecord_id is required for update."}, status=status.HTTP_400_BAD_REQUEST)
        
#         instance = get_object_or_404(FP_Record, fprecord_id=fprecord_id)
#         serializer = self.get_serializer(instance, data=request.data, partial=False) # Use partial=True for PATCH
#         serializer.is_valid(raise_exception=True)
#         fp_record_instance = serializer.save()
        
#         return Response(
#             {"message": "Family Planning record updated successfully", "fprecord_id": fp_record_instance.fprecord_id},
#             status=status.HTTP_200_OK
#         )


# # --- Overall records for all patients ---
# @api_view(['GET'])
# def get_patients_with_fp_records(request):
#     """
#     Returns a list of patients with their latest family planning record summary.
#     """
#     data = []
#     # Get all patients who have at least one FP_Record
#     patients_with_fp_records = Patient.objects.filter(fp_records__isnull=False).distinct()

#     for patient in patients_with_fp_records:
#         latest_fp_record = patient.fp_records.order_by('-created_at').first()
#         if not latest_fp_record:
#             continue

#         # Fetch personal info
#         personal_info = {}
#         if patient.rp_id and patient.rp_id.per:
#             personal = patient.rp_id.per
#             personal_info = {
#                 'per_fname': personal.per_fname or '',
#                 'per_lname': personal.per_lname or '',
#                 'per_mname': personal.per_mname or '',
#                 'per_dob': personal.per_dob.isoformat() if personal.per_dob else '',
#                 'per_sex': personal.per_sex or '',
#                 'per_age': calculate_age_from_dob(personal.per_dob) if personal.per_dob else 0,
#             }
        
#         # Fetch latest FP_type for method used
#         method_used = "N/A"
#         fp_type_instance = FP_type.objects.filter(fprecord=latest_fp_record).first()
#         if fp_type_instance:
#             method_used = fp_type_instance.fpt_method_used or "N/A"

#         # Count total FP records for this patient
#         record_count = patient.fp_records.count()

#         data.append({
#             'fprecord_id': latest_fp_record.fprecord_id,
#             'pat_id': patient.pat_id,
#             'patient_name': f"{personal_info.get('per_lname', '')}, {personal_info.get('per_fname', '')} {personal_info.get('per_mname', '')}".strip(),
#             'patient_age': personal_info.get('per_age', 'N/A'),
#             'patient_gender': personal_info.get('per_sex', 'N/A'),
#             'record_count': record_count,
#             'method_used': method_used,
#             'created_at': latest_fp_record.created_at.isoformat(),
#         })
    
#     return Response(data, status=status.HTTP_200_OK)

# @api_view(['GET'])
# def get_fp_records_for_patient(request, patient_id):
#     """
#     Returns all family planning records for a specific patient.
#     """
#     try:
#         patient = get_object_or_404(Patient, pat_id=patient_id)
#         fp_records = FP_Record.objects.filter(pat=patient).order_by('-created_at')
        
#         serialized_records = []
#         for fp_record in fp_records:
#             # You can customize what details to include for each record
#             # For simplicity, let's use a basic serializer and add method used
#             serializer = FPRecordSerializer(fp_record)
#             record_data = serializer.data

#             fp_type_instance = FP_type.objects.filter(fprecord=fp_record).first()
#             if fp_type_instance:
#                 record_data['method_used'] = fp_type_instance.fpt_method_used or "N/A"
#             else:
#                 record_data['method_used'] = "N/A"
            
#             # Add the fprecord_id to the top level for easy access in frontend
#             record_data['fprecord_id'] = fp_record.fprecord_id

#             serialized_records.append(record_data)

#         return Response(serialized_records, status=status.HTTP_200_OK)
#     except Patient.DoesNotExist:
#         return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # --- Existing Individual CRUD Views (kept for granular access if needed) ---
# class FP_RecordListCreateView(generics.ListCreateAPIView):
#     serializer_class = FPRecordSerializer
#     queryset = FP_Record.objects.all()

# class FP_RecordDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = FPRecordSerializer
#     queryset = FP_Record.objects.all()
#     lookup_field = 'fprecord_id'

# class PatientRecordCreateView(generics.CreateAPIView):
#     # This might be redundant if PatientRecord is created directly in CompositeSerializer
#     serializer_class = PatientRecordSerializer
#     queryset = PatientRecord.objects.all()

# class FP_TypeListCreateView(generics.ListCreateAPIView):
#     serializer_class = FPTypeSerializer
#     queryset = FP_type.objects.all()

# class FP_TypeDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = FPTypeSerializer
#     queryset = FP_type.objects.all()
#     lookup_field = 'fpt_id'

# class RiskStiListCreateView(generics.ListCreateAPIView):
#     serializer_class = FPRiskStiSerializer
#     queryset = FP_RiskSti.objects.all()

# class RiskStiDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = FPRiskStiSerializer
#     queryset = FP_RiskSti.objects.all()
#     lookup_field = 'sti_id'

# class RiskVawListCreateView(generics.ListCreateAPIView):
#     serializer_class = FPRiskVawSerializer
#     queryset = FP_RiskVaw.objects.all()

# class RiskVawDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = FPRiskVawSerializer
#     queryset = FP_RiskVaw.objects.all()
#     lookup_field = 'vaw_id'

# class PhysicalExamListCreateView(generics.ListCreateAPIView):
#     serializer_class = FPPhysicalExamSerializer
#     queryset = FP_Physical_Exam.objects.all()

# class PhysicalExamDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = FPPhysicalExamSerializer
#     queryset = FP_Physical_Exam.objects.all()
#     lookup_field = 'fp_pe_id'

# class FPAssessmentListCreateView(generics.ListCreateAPIView):
#     serializer_class = FPAssessmentSerializer
#     queryset = FP_Assessment_Record.objects.all()

# class FPAssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = FPAssessmentSerializer
#     queryset = FP_Assessment_Record.objects.all()
#     lookup_field = 'fpassessment_id' # Assuming fpassessment_id is the lookup field

# class PelvicExamListCreateView(generics.ListCreateAPIView):
#     serializer_class = PelvicExamSerializer
#     queryset = FP_Pelvic_Exam.objects.all()

# class PelvicExamDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = PelvicExamSerializer
#     queryset = FP_Pelvic_Exam.objects.all()
#     lookup_field = 'pelvic_id'

# class AcknowledgementListCreateView(generics.ListCreateAPIView):
#     serializer_class = AcknowledgementSerializer
#     queryset = FP_Acknowledgement.objects.all()

# class AcknowledgementDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = AcknowledgementSerializer
#     queryset = FP_Acknowledgement.objects.all()
#     lookup_field = 'ack_id'

# class FP_ObstetricalListCreateView(generics.ListCreateAPIView):
#     serializer_class = FP_ObstetricalHistorySerializer
#     queryset = FP_Obstetrical_History.objects.all()

# class FP_ObstetricalDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = FP_ObstetricalHistorySerializer
#     queryset = FP_Obstetrical_History.objects.all()
#     lookup_field = 'fpob_id'

# class FP_PregnancyCheckListCreateView(generics.ListCreateAPIView):
#     serializer_class = FP_PregnancyCheckSerializer
#     queryset = FP_pregnancy_check.objects.all()

# class FP_PregnancyCheckDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = FP_PregnancyCheckSerializer
#     queryset = FP_pregnancy_check.objects.all()
#     lookup_field = 'fp_pc_id'

# class PatientListForOverallTable(generics.ListAPIView):
#     # This view is for your overall.tsx
#     serializer_class = PatientComprehensiveFpSerializer # Use the comprehensive serializer for read-only
#     queryset = FP_Record.objects.all() # Fetch FP Records directly

# # Old imports you had, ensuring they are covered or removed if redundant.
# # from apps.patientrecords.serializers import PatientRecordSerializer, PatientSerializer # No longer needed directly here, handled by custom serializers
# # from apps.healthProfiling.serializers import * # No longer needed directly here, handled by custom serializers


# # If you had a 'delete_complete_fp_record' function, keep it here or recreate if necessary
# @api_view(['DELETE'])
# def delete_complete_fp_record(request, fprecord_id):
#     try:
#         with transaction.atomic():
#             fp_record = get_object_or_404(FP_Record, fprecord_id=fprecord_id)
            
#             # Delete related records (order matters due to foreign key constraints)
#             # Delete FP_Assessment_Record first if it exists
#             FP_Assessment_Record.objects.filter(fprecord=fp_record).delete()
            
#             # Delete service provision records
#             FP_Assessment_Record.objects.filter(fprecord=fp_record).delete()

#             # Delete other FP-specific related records
#             FP_type.objects.filter(fprecord=fp_record).delete()
#             # FP_Medical_History.objects.filter(fprecord=fp_record).delete() # If you re-add this model
#             FP_Obstetrical_History.objects.filter(fprecord=fp_record).delete()
#             FP_RiskSti.objects.filter(fprecord=fp_record).delete()
#             FP_RiskVaw.objects.filter(fprecord=fp_record).delete()
#             FP_Physical_Exam.objects.filter(fprecord=fp_record).delete()
#             FP_Pelvic_Exam.objects.filter(fprecord=fp_record).delete()
#             FP_Acknowledgement.objects.filter(fprecord=fp_record).delete()
#             FP_pregnancy_check.objects.filter(fprecord=fp_record).delete()

#             # Delete the main FP_Record
#             fp_record.delete()
        
#         return Response(status=status.HTTP_204_NO_CONTENT)
#     except FP_Record.DoesNotExist:
#         return Response({'error': 'Family Planning Record not found'}, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)