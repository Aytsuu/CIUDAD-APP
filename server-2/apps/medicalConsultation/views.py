from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from datetime import datetime
from django.db.models import Count, Q
from apps.patientrecords.models import Patient,PatientRecord
from apps.patientrecords.models import *
from .utils import *
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
from apps.inventory.models import MedicineInventory
from pagination import *
from apps.healthProfiling.models import *

# ALL RECORDS
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Q
from datetime import datetime, timedelta



class PatientMedConsultationRecordView(generics.ListAPIView):
    serializer_class = PatientMedConsultationRecordSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        queryset = Patient.objects.annotate(
            medicalrec_count=Count(
                'patient_records__medical_consultation_record',
                filter=Q(
                    patient_records__medical_consultation_record__medrec_status='completed'
                ),
                distinct=True
            )
        ).filter(
            patient_records__medical_consultation_record__medrec_status='completed'
        ).select_related(
            'rp_id__per', 
            'trans_id'
        ).prefetch_related(
            'rp_id__per__personaladdress_set__add__sitio',
            'patient_records__medical_consultation_record'
        ).distinct().order_by('-medicalrec_count')
        
        # Track if any filter is applied
        filters_applied = False
        original_count = queryset.count()
        
        # Combined search (patient name, patient ID, household number, and sitio)
        search_query = self.request.query_params.get('search', '').strip()
        sitio_search = self.request.query_params.get('sitio', '').strip()
        
        # Combine search and sitio parameters
        combined_search_terms = []
        if search_query and len(search_query) >= 2:  # Allow shorter search terms
            combined_search_terms.append(search_query)
        if sitio_search:
            combined_search_terms.append(sitio_search)
        
        if combined_search_terms:
            filters_applied = True
            combined_search = ','.join(combined_search_terms)
            queryset = apply_patient_search_filter(queryset, combined_search)
            if queryset.count() == 0 and original_count > 0:
                return Patient.objects.none()
        
        # Patient type filter
        patient_type_search = self.request.query_params.get('patient_type', '').strip()
        if patient_type_search:
            filters_applied = True
            queryset = apply_patient_type_filter(queryset, patient_type_search)
            if queryset.count() == 0 and original_count > 0:
                return Patient.objects.none()
        
        # Status filter (could be used for medical record status)
        status_search = self.request.query_params.get('status', '').strip()
        if status_search:
            filters_applied = True
            queryset = self._apply_status_filter(queryset, status_search)
            if queryset.count() == 0 and original_count > 0:
                return Patient.objects.none()
        
        return queryset
    
    def _apply_status_filter(self, queryset, status):
        """Filter by status - keep this in view if it's specific to this view"""
        # Implement your status filter logic here
        return queryset.filter(patient_records__medical_consultation_record__medrec_status=status)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            # You can add parents info and address to serialized data if needed
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    
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
# class ViewMedicalConsultationRecordView(generics.ListAPIView):
#     serializer_class = MedicalConsultationRecordSerializer
#     def get_queryset(self):
#         pat_id = self.kwargs['pat_id']
#         return MedicalConsultation_Record.objects.filter(
#             patrec__pat_id=pat_id,
#             medrec_status='completed' 
#         ).order_by('-created_at')
class ViewMedicalConsultationRecordView(generics.ListAPIView):
    serializer_class = MedicalConsultationRecordSerializer
    pagination_class = StandardResultsPagination
    
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
                pat=pat_id,
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



from apps.medicineservices.serializers import MedicineRequestItemSerializer

# ========MEDICAL CONSULTATION END SOAP FORM
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
                # Create MedicineRequest first
                med_request_data = {
                    'rp_id': medicine_request_data.get('rp_id'),  # Physician ID
                    'pat_id': medicine_request_data.get('pat_id'),  # Patient ID
                    'status': 'pending',
                    'mode': medicine_request_data.get('mode', 'walk-in')
                }
                
                med_request_serializer = MedicineRequestSerializer(data=med_request_data)
                med_request_serializer.is_valid(raise_exception=True)
                med_request = med_request_serializer.save()
                med_request_id = med_request.medreq_id

                # Create MedicineRequestItem for each medicine and update inventory
                for medicine in medicine_request_data['medicines']:
                    minv_id = medicine.get('minv_id')
                    requested_qty = medicine.get('medreqitem_qty', 0)
                    
                    # Update MedicineInventory with temporary deduction
                    if minv_id and requested_qty > 0:
                        try:
                            medicine_inventory = MedicineInventory.objects.get(minv_id=minv_id)
                            
                            # Add the requested quantity to existing temporary_deduction
                            current_temp_deduction = medicine_inventory.temporary_deduction or 0
                            medicine_inventory.temporary_deduction = current_temp_deduction + requested_qty
                            medicine_inventory.save()
                            
                        except MedicineInventory.DoesNotExist:
                            # Log warning or handle missing inventory
                            return Response(
                                {"error": f"Medicine inventory with ID {minv_id} not found"},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Create the medicine request item
                    medicine_item_data = {
                        'medreqitem_qty': requested_qty,
                        'reason': medicine.get('reason', ''),
                        'minv_id': minv_id,  # Medicine inventory ID
                        'med_id': medicine.get('med_id'),  # Medicine list ID
                        'medreq_id': med_request.medreq_id,  # Link to the parent request
                        'status': 'confirmed'
                    }
                    
                    medicine_item_serializer = MedicineRequestItemSerializer(data=medicine_item_data)
                    medicine_item_serializer.is_valid(raise_exception=True)
                    medicine_item_serializer.save()

                # Link medicine request to findings
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
                    {'patrec_id': patrec_id, 'ill_id': ill_id, 'year': date.today().strftime('%y-%m-%d')}
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
                # Create MedicineRequest first
                med_request_data = {
                    'rp_id': medicine_request_data.get('rp_id'),  # Physician ID
                    'pat_id': medicine_request_data.get('pat_id'),  # Patient ID
                    'status': 'pending',
                    'mode': medicine_request_data.get('mode', 'walk-in')
                }
                
                med_request_serializer = MedicineRequestSerializer(data=med_request_data)
                med_request_serializer.is_valid(raise_exception=True)
                med_request = med_request_serializer.save()
                med_request_id = med_request.medreq_id

                # Create MedicineRequestItem for each medicine and update inventory
                for medicine in medicine_request_data['medicines']:
                    minv_id = medicine.get('minv_id')
                    requested_qty = medicine.get('quantity', 0)  # Note: using 'quantity' key for child health
                    
                    # Update MedicineInventory with temporary deduction
                    if minv_id and requested_qty > 0:
                        try:
                            medicine_inventory = MedicineInventory.objects.get(minv_id=minv_id)
                            
                            # Add the requested quantity to existing temporary_deduction
                            current_temp_deduction = medicine_inventory.temporary_deduction or 0
                            medicine_inventory.temporary_deduction = current_temp_deduction + requested_qty
                            medicine_inventory.save()
                            
                        except MedicineInventory.DoesNotExist:
                            # Log warning or handle missing inventory
                            return Response(
                                {"error": f"Medicine inventory with ID {minv_id} not found"},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Create the medicine request item
                    medicine_item_data = {
                        'medreqitem_qty': requested_qty,
                        'reason': medicine.get('reason', ''),
                        'minv_id': minv_id,  # Medicine inventory ID
                        'med_id': medicine.get('med_id'),  # Medicine list ID
                        'medreq_id': med_request.medreq_id,  # Link to the parent request
                        'status': 'confirmed'
                    }
                    
                    medicine_item_serializer = MedicineRequestItemSerializer(data=medicine_item_data)
                    medicine_item_serializer.is_valid(raise_exception=True)
                    medicine_item_serializer.save()

                # Link medicine request to findings
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
                        year=date.today().strftime('%y-%m-%d')
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