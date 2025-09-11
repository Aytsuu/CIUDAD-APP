from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from datetime import datetime
from django.db.models import Count, Q
from apps.patientrecords.models import Patient,PatientRecord
from apps.patientrecords.models import *
from .utils import get_medcon_record_count
from django.db.models import Count, Q
from django.db import transaction
from datetime import date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.medicineservices.serializers import MedicineRequestSerializer
from apps.patientrecords.serializers.findings_serializers import FindingSerializer
from apps.patientrecords.serializers.physicalexam_serializers import PEResultSerializer
from apps.medicineservices.models import FindingsPlanTreatment
from apps.childhealthservices.models import ChildHealthVitalSigns,ChildHealth_History


# ALL RECORDS
class PatientMedConsultationRecordView(generics.ListAPIView):
    serializer_class = PatientMedConsultationRecordSerializer
    def get_queryset(self):
        return Patient.objects.annotate(
            medicalrec_count=Count(
                'patient_records__medical_consultation_record',
                filter=Q(
                    patient_records__medical_consultation_record__medrec_status='completed'
                ),
                distinct=True  # ✅ Prevents overcounting due to join duplicates
            )
        ).filter(
            patient_records__medical_consultation_record__medrec_status='completed'
        ).distinct()


# USE FOR ADDING MEDICAL RECORD
class MedicalConsultationRecordView(generics.CreateAPIView):
    serializer_class = MedicalConsultationRecordSerializer
    queryset  =MedicalConsultation_Record.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class UpdateMedicalConsultationRecordView(generics.UpdateAPIView):
    serializer_class = MedicalConsultationRecordSerializer
    queryset = MedicalConsultation_Record.objects.all()
    lookup_field = 'medrec_id'


# INDIVIDUAL PATIENT RECORDS
class ViewMedicalConsultationRecordView(generics.ListAPIView):
    serializer_class = MedicalConsultationRecordSerializer
    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return MedicalConsultation_Record.objects.filter(
            patrec__pat_id=pat_id,
            medrec_status='completed' 
        ).order_by('-created_at')



class PendingPatientMedConsultationRecordView(generics.ListAPIView):
    serializer_class = MedicalConsultationRecordSerializer

    def get_queryset(self):
        return MedicalConsultation_Record.objects.filter(
            medrec_status='pending'
        ).order_by('-created_at')


class ViewMedicalWithPendingRecordView(generics.ListAPIView):
    serializer_class = MedicalConsultationRecordSerializer
    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return MedicalConsultation_Record.objects.filter(
            patrec__pat_id=pat_id
        ).order_by('-created_at')
        
        
class GetMedConCountView(APIView):
    def get(self, request, pat_id):
        try:
            count = get_medcon_record_count(pat_id)
            return Response({'pat_id': pat_id, 'medcon_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class PendingMedConCountView(APIView):
    def get(self, request, *args, **kwargs):
        # Count pending medical consultations
        med_con_count = (
            MedicalConsultation_Record.objects
            .filter(medrec_status="pending")
            .count()
        )
        
        # Count child health check-ups (where status is "check-up")
        child_checkup_count = (
            ChildHealth_History.objects
            .filter(status="check-up")
            .count()
        )
        
        # Total count
        total_count = med_con_count + child_checkup_count
        
        return Response({
            "count": total_count
        })
    
class MedicalConsultationTotalCountAPIView(APIView):
    def get(self, request):
        try:
            # Count total unique medical consultation records
            total_records = MedicalConsultation_Record.objects.count()
            
            return Response({
                'success': True,
                'total_records': total_records
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# CREATE STEP1
class CreateMedicalConsultationView(APIView):
    @transaction.atomic
    def post(self, request):
        data = request.data
        try:
            # 🔹 Required fields (excluding staff if optional)
            required_fields = ["pat_id", "medrec_chief_complaint", "height", "weight"]

            missing_fields = []
            for field in required_fields:
                value = data.get(field, None)
                if value is None or str(value).strip() == "":
                    missing_fields.append(field)

            if missing_fields:
                return Response(
                    {
                        "success": False,
                        "error": "Missing required fields",
                        "missing_fields": missing_fields,
                        "received_data": data,   # ✅ so you see what was actually sent
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 🔹 Handle staff (optional)
            staff = None
            staff_id = data.get("staff")
            if staff_id not in [None, "", "null"]:
                try:
                    staff = Staff.objects.get(pk=staff_id)
                except Staff.DoesNotExist:
                    return Response(
                        {"error": f"Invalid staff ID: {staff_id}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # 1. Create PatientRecord
            patrec = PatientRecord.objects.create(
                pat_id_id=data["pat_id"],
                patrec_type="Medical Consultation",
            )

            # 2. Create VitalSigns
            vital = VitalSigns.objects.create(
                vital_bp_systolic=data.get("vital_bp_systolic", ""),
                vital_bp_diastolic=data.get("vital_bp_diastolic", ""),
                vital_temp=data.get("vital_temp", ""),
                vital_RR=data.get("vital_RR", ""),
                vital_o2="N/A",
                vital_pulse=data.get("vital_pulse", ""),
                patrec=patrec,
                staff=staff,
            )

            # 3. Create BodyMeasurement
            bm = BodyMeasurement.objects.create(
                height=float(data.get("height", 0)),
                weight=float(data.get("weight", 0)),
                patrec=patrec,
                staff=staff,
            )

            # 4. Create MedicalConsultation_Record
            medrec = MedicalConsultation_Record.objects.create(
                patrec=patrec,
                vital=vital,
                bm=bm,
                find=None,
                medrec_chief_complaint=data["medrec_chief_complaint"],
                
                staff=staff,
            )

            return Response(
                {
                    "success": True,
                    "patrec_id": patrec.patrec_id,
                    "vital_id": vital.vital_id,
                    "bm_id": bm.bm_id,
                    "medrec_id": medrec.medrec_id,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e), "received_data": data},
                status=status.HTTP_400_BAD_REQUEST,
            ) 


# ========MEDICAL CONSULTATION END SOAP FORM
class SoapFormSubmissionView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            data = request.data
            staff_id = data.get('staff_id') or None
            medrec_id = data.get('medrec_id') or None
            patrec_id = data.get('patrec_id') or None

            
            #  only enforce medrec_id and patrec_id as required
            if not all([medrec_id, patrec_id]):
                raise ValidationError("Missing required fields: medrec_id and patrec_id")

            # 1. Create Findings
            finding_data = {
                'assessment_summary': data.get('assessment_summary', ''),
                'plantreatment_summary': data.get('plantreatment_summary', ''),
                'subj_summary': data.get('subj_summary', ''),
                'obj_summary': data.get('obj_summary', ''),
                'staff': staff_id  # 👈 this will be None if missing
            }
            finding_serializer = FindingSerializer(data=finding_data)
            finding_serializer.is_valid(raise_exception=True)
            finding = finding_serializer.save()

            # 2. Medicine Request (only if medicines exist)
            med_request_id = None
            medicine_request_data = data.get('medicine_request')
            if medicine_request_data and medicine_request_data.get('medicines'):
                med_request_serializer = MedicineRequestSerializer(data=medicine_request_data)
                med_request_serializer.is_valid(raise_exception=True)
                med_request = med_request_serializer.save()
                med_request_id = med_request.medreq_id

                FindingsPlanTreatment.objects.create(
                    medreq=med_request,
                    find=finding
                )

            # 3. Physical Exam Results
            if data.get('physical_exam_results'):
                per_data = [
                    {'pe_option': pe, 'find': finding.find_id}
                    for pe in data['physical_exam_results']
                ]
                per_serializer = PEResultSerializer(data=per_data, many=True)
                per_serializer.is_valid(raise_exception=True)
                per_serializer.save()

            # 4. Update Medical Consultation Record
            MedicalConsultation_Record.objects.filter(medrec_id=medrec_id).update(
                medrec_status='completed',
                find=finding,
                medreq_id=med_request_id,
            )

            # 5. Medical History
            if data.get('selected_illnesses'):
                medical_history_data = [
                    {'patrec_id': patrec_id, 'ill_id': ill_id, 'year': datetime.now().year}
                    for ill_id in data['selected_illnesses']
                ]
                MedicalHistory.objects.bulk_create([
                    MedicalHistory(**item) for item in medical_history_data
                ])

            return Response({
                'success': True,
                'finding_id': finding.find_id,
                'med_request_id': med_request_id,  # will be None if no medicines
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': 'Internal server error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )






# CHILD HEALTH SOAP FORM
class ChildHealthSoapFormSubmissionView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            data = request.data
            staff_id = data.get("staff_id")  # can be null
            patrec_id = data.get("patrec_id")  # required
            chhist_id = data.get("chhist_id")  # can be null
            chvital_id = data.get("chvital_id")  # can be null

            # Require only patrec_id
            if not patrec_id:
                raise ValidationError("Missing required field: patrec_id")

            # 1. Findings (staff may be null)
            finding_data = {
                "assessment_summary": data.get("assessment_summary", ""),
                "plantreatment_summary": data.get("plantreatment_summary", ""),
                "subj_summary": data.get("subj_summary", ""),
                "obj_summary": data.get("obj_summary", ""),
                "staff": staff_id,  # will be None if not provided
            }
            finding_serializer = FindingSerializer(data=finding_data)
            finding_serializer.is_valid(raise_exception=True)
            finding = finding_serializer.save()

            # 2. Medicine Request (only if medicines exist)
            med_request = None
            med_request_id = None
            medicine_request_data = data.get("medicine_request")
            if medicine_request_data and medicine_request_data.get("medicines"):
                med_request_serializer = MedicineRequestSerializer(data=medicine_request_data)
                med_request_serializer.is_valid(raise_exception=True)
                med_request = med_request_serializer.save()
                med_request_id = med_request.medreq_id

                FindingsPlanTreatment.objects.create(
                    medreq=med_request,
                    find=finding
                )

            # 3. Physical Exam Results
            if data.get("physical_exam_results"):
                per_data = [
                    {"pe_option": pe, "find": finding.find_id}
                    for pe in data["physical_exam_results"]
                ]
                per_serializer = PEResultSerializer(data=per_data, many=True)
                per_serializer.is_valid(raise_exception=True)
                per_serializer.save()

            # 4. Update Vital Signs link
            if chhist_id:
                ChildHealth_History.objects.filter(pk=chhist_id).update(status="recorded")
                
            if chvital_id:
                ChildHealthVitalSigns.objects.filter(pk=chvital_id).update(find=finding)

            # 5. Medical History
            if data.get("selected_illnesses"):
                MedicalHistory.objects.bulk_create([
                    MedicalHistory(
                        patrec_id=patrec_id,
                        ill_id=ill_id,
                        year=date.today()
                    )
                    for ill_id in data["selected_illnesses"]
                ])

            return Response(
                {
                    "success": True,
                    "finding_id": finding.find_id,
                    "med_request_id": med_request_id,  # only set if medicines exist
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": "Internal server error", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
