from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.db import transaction 
from django.utils import timezone # Import timezone for age calculation

from .serializers import *
from .models import *
# Ensure Patient, PatientRecord, Personal are imported with full app path
from apps.patientrecords.models import PatientRecord, Patient
from apps.healthProfiling.models import Personal # For PersonalInfoSerializer if Personal is used directly

# --- Import necessary serializers from other apps ---
from apps.patientrecords.serializers import PatientRecordSerializer, PatientSerializer # Added for Patient and PatientRecord
from apps.healthProfiling.serializers import *


# --- NEW: Composite View for creating/updating a complete FP record ---
class FamilyPlanningCreateUpdateView(generics.CreateAPIView):
    """
    API view for creating a complete Family Planning record, including all
    related sub-records (FP_type, Risk STI, Physical Exam, etc.) and
    handling Vital Signs, Body Measurements, and Inventory deductions.
    """
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

# View for creating PatientRecord instances (as used in Animal Bites, might be shared)
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
def get_complete_fp_record(request, fprecord_id):
    """
    Retrieves a complete Family Planning record including all its nested data.
    """
    try:
        # Use select_related and prefetch_related for efficiency
        fp_record = get_object_or_404(
            FP_Record.objects.select_related(
                'pat', 'patrec', 'hrd', 'spouse'
            ).prefetch_related(
                'fp_types', 'fp_obstetrical_histories', 'fp_risk_stis', 
                'fp_risk_vaw_data', 'fp_physical_exams', 'fp_pelvic_exams', # Corrected risk_vaw_data to fp_risk_vaws
                'fp_acknowledgements', 'fp_pregnancy_checks', 'fp_assessments'
            ), 
            fprecord_id=fprecord_id
        )

        # Serialize main FP_Record
        fp_record_data = FPRecordSerializer(fp_record).data

        # Get related data
        fp_type = fp_record.fp_types.first()
        obstetrical = fp_record.fp_obstetrical_histories.first()
        risk_sti = fp_record.fp_risk_stis.first()
        risk_vaw = fp_record.fp_risk_vaws.first() # Corrected from fp_risk_vaw_data
        physical_exam = fp_record.fp_physical_exams.first()
        pelvic_exam = fp_record.fp_pelvic_exams.first()
        acknowledgement = fp_record.fp_acknowledgements.first()
        pregnancy_check = fp_record.fp_pregnancy_checks.first()
        assessment_record = fp_record.fp_assessments.first() # Get the assessment record

        # Also fetch patient's personal info
        patient_instance = fp_record.pat
        patient_info_data = {}
        if patient_instance.pat_type == 'Resident' and patient_instance.rp_id and patient_instance.rp_id.per:
            personal_info = patient_instance.rp_id.per
            patient_info_data = PatientSerializer(personal_info).data # Use PersonalInfoSerializer
        elif patient_instance.pat_type == 'Transient' and patient_instance.trans_id:
             transient_info = patient_instance.trans_id
             patient_info_data = {
                'per_fname': transient_info.tran_fname,
                'per_lname': transient_info.tran_lname,
                'per_mname': transient_info.tran_mname,
                'per_dob': transient_info.tran_dob,
                'per_age': (timezone.now().year - transient_info.tran_dob.year), # Basic age calc
                'per_sex': transient_info.tran_sex,
                # Add address from TransientAddress if PersonalInfoSerializer for Transient doesn't handle it
             }


        data = {
            'fp_record': fp_record_data,
            'patient_info': patient_info_data,
            'fp_type': FPTypeSerializer(fp_type).data if fp_type else None,
            'obstetrical_history': FP_ObstetricalHistorySerializer(obstetrical).data if obstetrical else None,
            'risk_sti': FPRiskStiSerializer(risk_sti).data if risk_sti else None,
            'risk_vaw': FPRiskVawSerializer(risk_vaw).data if risk_vaw else None,
            'physical_exam': FPPhysicalExamSerializer(physical_exam).data if physical_exam else None,
            'pelvic_exam': PelvicExamSerializer(pelvic_exam).data if pelvic_exam else None,
            'acknowledgement': AcknowledgementSerializer(acknowledgement).data if acknowledgement else None,
            'pregnancy_check': FP_PregnancyCheckSerializer(pregnancy_check).data if pregnancy_check else None,
            'assessment_record': FP_Assessment_Record(assessment_record).data if assessment_record else None,
        }

        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- NEW VIEW FOR OVERALL TABLE: Get unique patients with FP records and conditional details ---
class PatientListForOverallTable(generics.ListAPIView):
    """
    API view to list unique patients who have family planning records.
    - If a patient has exactly one FP record, its details (method, date) are included.
    - If a patient has multiple FP records, only basic patient info is shown,
      and a flag indicates multiple records exist.
    """
    serializer_class = FPRecordSerializer # Using FPRecordSerializer to represent the main record
    
    def get_queryset(self):
        # This queryset fetches FP_Record instances directly.
        # We then process them to group by patient for the "overall" table.
        return FP_Record.objects.select_related(
            'pat', 
            'pat__rp_id__per', # For resident patient personal info
            'pat__trans_id',   # For transient patient info
            'fpt'              # For FP_type details
        ).order_by('-created_at') # Order by latest for easy retrieval of the "latest" record

    def list(self, request, *args, **kwargs):
        all_fp_records = self.get_queryset()
        
        patient_data_map = {} # Use a dictionary to store the latest record for each patient

        for record in all_fp_records:
            patient_id = record.pat.pat_id
            
            if patient_id not in patient_data_map:
                # If this is the first record for this patient, store it
                patient_data_map[patient_id] = {
                    'patient_id': patient_id,
                    'patient_name': "", # Will be filled below
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
                patient_data_map[patient_id]['patient_age'] = personal.per_age
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


# --- Modified get_fp_records_for_patient to fetch all FP records for a specific patient_id ---
@api_view(['GET'])
def get_fp_records_for_patient(request, patient_id):
    """
    API view to get all Family Planning records associated with a specific patient_id.
    This will be used by the Individual.tsx table.
    """
    try:
        records = FP_Record.objects.filter(
            pat__pat_id=patient_id # Filter by pat__pat_id as Patient is linked directly
        ).select_related(
            'pat__rp_id__per', # For resident patient personal info
            'pat__trans_id', # For transient patient info
            'fpt',
            'fp_physical_exams__bm', # For body measurements from physical exam
            'fp_assessments__vital_signs' # For vital signs from assessment
        ).order_by('-created_at')

        data = []
        for record in records:
            patient_instance = record.pat
            personal_info = None
            if patient_instance.pat_type == 'Resident' and patient_instance.rp_id and patient_instance.rp_id.per:
                personal_info = patient_instance.rp_id.per
            elif patient_instance.pat_type == 'Transient' and patient_instance.trans_id:
                personal_info = patient_instance.trans_id # For transient, treat tran_ as personal_info

            patient_name = ""
            patient_age = None
            patient_sex = ""
            
            if personal_info:
                if patient_instance.pat_type == 'Resident':
                    patient_name = f"{personal_info.per_lname}, {personal_info.per_fname} {personal_info.per_mname or ''}".strip()
                    patient_age = personal_info.per_age
                    patient_sex = personal_info.per_sex
                elif patient_instance.pat_type == 'Transient':
                    patient_name = f"{personal_info.tran_lname}, {personal_info.tran_fname} {personal_info.tran_mname or ''}".strip()
                    patient_age = (timezone.now().year - personal_info.tran_dob.year)
                    patient_sex = personal_info.tran_sex

            fp_type_instance = record.fp_types.first() # Get the related FP_type
            client_type = fp_type_instance.fpt_client_type if fp_type_instance else 'N/A'
            method_used = fp_type_instance.fpt_method_used if fp_type_instance else 'N/A'

            # Fetch related data (using .first() assuming one-to-one or latest)
            physical_exam_data = record.fp_physical_exams.first()
            assessment_record_data = record.fp_assessments.first()
            
            vital_signs_data = None
            if assessment_record_data and assessment_record_data.vital_signs:
                vital_signs_data = assessment_record_data.vital_signs
            
            body_measurement_data = None
            if physical_exam_data and physical_exam_data.bm:
                body_measurement_data = physical_exam_data.bm

            data.append({
                'fprecord_id': record.fprecord_id,
                'client_id': record.client_id,
                'patient_id': patient_instance.pat_id, # Include actual pat_id
                'patient_name': patient_name,
                'patient_age': patient_age,
                'sex': patient_sex,
                'client_type': client_type,
                'method_used': method_used,
                'created_at': record.created_at,
                'updated_at': record.updated_at,
                # Include data from related models for display in individual history
                'bloodpressure': physical_exam_data.bloodpressure if physical_exam_data else 'N/A',
                'pulserate': physical_exam_data.pulserate if physical_exam_data else 'N/A',
                'weight': body_measurement_data.weight if body_measurement_data else 'N/A',
                'height': body_measurement_data.height if body_measurement_data else 'N/A',
                'bmi': body_measurement_data.bmi if body_measurement_data else 'N/A',
                'bmi_category': body_measurement_data.bmi_category if body_measurement_data else 'N/A',
                'assessment_findings': assessment_record_data.as_findings if assessment_record_data else 'N/A',
                'dispensed_item': assessment_record_data.dispensed_item_name_for_report if assessment_record_data else 'N/A',
                'dispensed_quantity': assessment_record_data.quantity if assessment_record_data else 'N/A',
            })

        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': f"Error fetching FP records for patient: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

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