from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from .serializers import *
from .models import *
from apps.patientrecords.models import PatientRecord, Patient, Personal
from django.db.models import Count, OuterRef, Subquery, Max, Min # Import necessary for aggregations

# FP Record CRUD
class FP_RecordListCreateView(generics.ListCreateAPIView):
    serializer_class = FPRecordSerializer
    queryset = FP_Record.objects.all()

class FP_RecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPRecordSerializer
    queryset = FP_Record.objects.all()
    lookup_field = 'fprecord_id'

# views.py
class FPRecordListAPIView(generics.ListAPIView):
    queryset = FP_Record.objects.all()
    serializer_class = FPRecordSerializer

# --- NEW: View for creating PatientRecord instances ---
class PatientRecordCreateView(generics.CreateAPIView):
    serializer_class = PatientRecordSerializer
    queryset = PatientRecord.objects.all() # Define queryset even for CreateAPIView

# FP Type CRUD
class FP_TypeListCreateView(generics.ListCreateAPIView):
    serializer_class = FPTypeSerializer
    queryset = FP_type.objects.all()

class FP_TypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPTypeSerializer
    queryset = FP_type.objects.all()
    lookup_field = 'fpt_id'

# Medical History CRUD
class FP_MedicalHistoryListCreateView(generics.ListCreateAPIView):
    serializer_class = FPMedicalHistorySerializer
    queryset = FP_Medical_History.objects.all()

class FP_MedicalHistoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPMedicalHistorySerializer
    queryset = FP_Medical_History.objects.all()
    lookup_field = 'fp_medhistory_id'

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

class FPAssessmentListCreateView(generics.ListCreateAPIView):
    serializer_class = FPAssessmentkSerializer
    queryset = FP_Assessment_Record.objects.all()

class FPAssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPAssessmentkSerializer
    queryset = FP_Assessment_Record.objects.all()
    lookup_field = 'fp_assessment_id'

# Pelvic Exam CRUD
class PelvicExamListCreateView(generics.ListCreateAPIView):
    serializer_class = FPPelvicExamSerializer
    queryset = FP_Pelvic_Exam.objects.all()

class PelvicExamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPPelvicExamSerializer
    queryset = FP_Pelvic_Exam.objects.all()
    lookup_field = 'pelvic_id'

# Acknowledgement CRUD
class AcknowledgementListCreateView(generics.ListCreateAPIView):
    serializer_class = FPAcknowledgementSerializer
    queryset = FP_Acknowledgement.objects.all()

class AcknowledgementDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPAcknowledgementSerializer
    queryset = FP_Acknowledgement.objects.all()
    lookup_field = 'ack_id'

# Obstetrical History CRUD
class FP_ObstetricalListCreateView(generics.ListCreateAPIView):
    serializer_class = FPObstetricalHistorySerializer
    queryset = FP_Obstetrical_History.objects.all()

class FP_ObstetricalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPObstetricalHistorySerializer
    queryset = FP_Obstetrical_History.objects.all()
    lookup_field = 'fpob_id'

# Pregnancy Check CRUD
class FP_PregnancyCheckListCreateView(generics.ListCreateAPIView):
    serializer_class = FPPregnancyCheckSerializer
    queryset = FP_pregnancy_check.objects.all()

class FP_PregnancyCheckDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPPregnancyCheckSerializer
    queryset = FP_pregnancy_check.objects.all()
    lookup_field = 'fp_pc_id'

# Get complete FP record with all related data AND patient info
@api_view(['GET'])
def get_complete_fp_record(request, fprecord_id):
    try:
        fp_record = get_object_or_404(FP_Record, fprecord_id=fprecord_id)
        patient_record_instance = fp_record.patrec
        patient_instance = patient_record_instance.pat_details
        personal_info_instance = patient_instance.personal_info

        patient_info = PersonalInfoSerializer(personal_info_instance).data

        fp_type = FP_type.objects.filter(fprecord_id=fprecord_id).first()
        medical_history = FP_Medical_History.objects.filter(fprecord_id=fprecord_id).first()
        obstetrical = FP_Obstetrical_History.objects.filter(fprecord_id=fprecord_id).first()
        risk_sti = FP_RiskSti.objects.filter(fprecord_id=fprecord_id).first()
        risk_vaw = FP_RiskVaw.objects.filter(fprecord_id=fprecord_id).first()
        physical_exam = FP_Physical_Exam.objects.filter(fprecord_id=fprecord_id).first()
        pelvic_exam = FP_Pelvic_Exam.objects.filter(fprecord_id=fprecord_id).first()
        acknowledgement = FP_Acknowledgement.objects.filter(fprecord_id=fprecord_id).first()
        pregnancy_check = FP_pregnancy_check.objects.filter(fprecord_id=fprecord_id).first()

        data = {
            'fp_record': FPRecordSerializer(fp_record).data,
            'patient_info': patient_info,
            'fp_type': FPTypeSerializer(fp_type).data if fp_type else None,
            'medical_history': FPMedicalHistorySerializer(medical_history).data if medical_history else None,
            'obstetrical': FPObstetricalHistorySerializer(obstetrical).data if obstetrical else None,
            'risk_sti': FPRiskStiSerializer(risk_sti).data if risk_sti else None,
            'risk_vaw': FPRiskVawSerializer(risk_vaw).data if risk_vaw else None,
            'physical_exam': FPPhysicalExamSerializer(physical_exam).data if physical_exam else None,
            'pelvic_exam': FPPelvicExamSerializer(pelvic_exam).data if pelvic_exam else None,
            'acknowledgement': FPAcknowledgementSerializer(acknowledgement).data if acknowledgement else None,
            'pregnancy_check': FPPregnancyCheckSerializer(pregnancy_check).data if pregnancy_check else None,
        }

        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- NEW VIEW FOR OVERALL TABLE: Get unique patients with FP records and conditional details ---
class PatientListForOverallTable(generics.ListAPIView):
    """
    API view to list unique patients who have family planning records.
    - If a patient has exactly one FP record, its details (method, date) are included.
    - If a patient has multiple FP records, only basic patient info is shown,
      and a flag indicates multiple records exist.
    """
    serializer_class = PatientSerializer # PatientSerializer for basic patient info

    def get_queryset(self):
        # Annotate each Patient with the count of their related FP_Records
        # Filter to include only patients who have at least one FP record
        queryset = Patient.objects.annotate(
            fp_record_count=Count('patientrecord__fp_record')
        ).filter(fp_record_count__gt=0).select_related('personal_info')
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        response_data = []

        for patient in queryset:
            personal_info = patient.personal_info

            patient_data = {
                'pat_id': patient.pat_id,
                'patient_name': f"{personal_info.per_lname}, {personal_info.per_fname} {personal_info.per_mname or ''}".strip(),
                'patient_age': personal_info.per_age if hasattr(personal_info, 'per_age') else None,
                'sex': personal_info.per_sex if hasattr(personal_info, 'per_sex') else "Unknown",
                'has_multiple_records': False, # Default to false
                'fprecord_id': None,
                'client_type': 'N/A',
                'method_used': 'N/A',
                'created_at': None,
            }

            if patient.fp_record_count == 1:
                # If only one record, fetch its details directly
                single_fp_record = FP_Record.objects.filter(
                    patrec__pat_details=patient
                ).select_related('fptype').first()

                if single_fp_record:
                    fp_type_instance = single_fp_record.fptype
                    patient_data['fprecord_id'] = single_fp_record.fprecord_id
                    patient_data['client_type'] = fp_type_instance.fpt_client_type if fp_type_instance and hasattr(fp_type_instance, 'fpt_client_type') else 'N/A'
                    patient_data['method_used'] = fp_type_instance.fpt_method_used if fp_type_instance and hasattr(fp_type_instance, 'fpt_method_used') else 'N/A'
                    patient_data['created_at'] = single_fp_record.created_at
            elif patient.fp_record_count > 1:
                # If multiple records, set flag and indicate "Multiple" for method/type
                patient_data['has_multiple_records'] = True
                patient_data['method_used'] = 'Multiple Records'
                patient_data['client_type'] = 'Multiple Records'


            response_data.append(patient_data)

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
            patrec__pat_details__pat_id=patient_id
        ).select_related(
            'patrec__pat_details__personal_info',
            'fptype'
        ).order_by('-created_at')

        data = []
        for record in records:
            patient_record = record.patrec
            personal_info = patient_record.pat_details.personal_info
            fp_type_instance = record.fptype

            patient_name = f"{personal_info.per_lname}, {personal_info.per_fname} {personal_info.per_mname or ''}".strip()
            patient_age = personal_info.per_age if hasattr(personal_info, 'per_age') else None
            patient_sex = personal_info.per_sex if hasattr(personal_info, 'per_sex') else "Unknown"

            client_type = fp_type_instance.fpt_client_type if fp_type_instance and hasattr(fp_type_instance, 'fpt_client_type') else 'N/A'
            method_used = fp_type_instance.fpt_method_used if fp_type_instance and hasattr(fp_type_instance, 'fpt_method_used') else 'N/A'

            data.append({
                'fprecord_id': record.fprecord_id,
                'client_id': record.client_id,
                'patient_name': patient_name,
                'patient_age': patient_age,
                'sex': patient_sex,
                'client_type': client_type,
                'method_used': method_used,
                'created_at': record.created_at,
                'updated_at': record.updated_at,
            })

        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': f"Error fetching FP records for patient: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# Delete complete FP record and all related data
@api_view(['DELETE'])
def delete_complete_fp_record(request, fprecord_id):
    try:
        fp_record = get_object_or_404(FP_Record, fprecord_id=fprecord_id)
        FP_type.objects.filter(fprecord_id=fprecord_id).delete()
        FP_Medical_History.objects.filter(fprecord_id=fprecord_id).delete()
        FP_Obstetrical_History.objects.filter(fprecord_id=fprecord_id).delete()
        FP_RiskSti.objects.filter(fprecord_id=fprecord_id).delete()
        FP_RiskVaw.objects.filter(fprecord_id=fprecord_id).delete()
        FP_Physical_Exam.objects.filter(fprecord_id=fprecord_id).delete()
        FP_Pelvic_Exam.objects.filter(fprecord_id=fprecord_id).delete()
        FP_Acknowledgement.objects.filter(fprecord_id=fprecord_id).delete()
        FP_pregnancy_check.objects.filter(fprecord_id=fprecord_id).delete()
        fp_record.delete()
        return Response({'message': 'FP record deleted successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': f"Error deleting FP record: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# --- Original get_family_planning_patients (retained if needed for other endpoints, otherwise use PatientListAPIView) ---
@api_view(['GET'])
def get_family_planning_patients(request):
    try:
        patients = Patient.objects.select_related('personal_info').all()
        data = []
        for patient in patients:
            personal = patient.personal_info
            data.append({
                'pat_id': patient.pat_id if hasattr(patient, 'pat_id') else None,
                'personal_info': PersonalInfoSerializer(personal).data if personal else None,
                'pat_type': patient.pat_type if hasattr(patient, 'pat_type') else 'Unknown',
                'created_at': patient.created_at if hasattr(patient, 'created_at') else None,
                'updated_at': patient.updated_at if hasattr(patient, 'updated_at') else None,
                'pat_status': patient.pat_status if hasattr(patient, 'pat_status') else 'Unknown',
            })
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        import tracebackz
        traceback.print_exc()
        return Response({'error': f"Error fetching family planning patients: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# --- Original PatientListAPIView (can be replaced by PatientListForOverallTable if only distinct patients are needed here) ---
class PatientListAPIView(generics.ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset
