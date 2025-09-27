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
from apps.childhealthservices.serializers import ChildHealthHistoryFullSerializer
from apps.inventory.models import MedicineInventory
from pagination import *
from apps.healthProfiling.models import *
from apps.medicineservices.serializers import MedicineRequestItemSerializer

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
            'rp_id__per__personal_addresses__add__sitio',
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
    
    
    
    
#================== MEDICAL CONSULTAION FORWARDED TABLE==================
class CombinedHealthRecordsView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request, assigned_to=None):
        # Get query parameters
        search_query = request.query_params.get('search', '')
        record_type = request.query_params.get('record_type', 'all')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        # Prefetch related data for child health records with proper joins
        child_health_queryset = ChildHealth_History.objects.select_related(
            'chrec__patrec__pat_id__rp_id__per',
            'chrec__patrec__pat_id__trans_id__tradd_id',
            'assigned_to'
        ).prefetch_related(
            'child_health_vital_signs__vital',
            'child_health_vital_signs__bm',  # Important: prefetch body measurements
            'child_health_vital_signs__find',  # Important: prefetch findings
            'child_health_notes',
            'child_health_supplements__medrec',
            'exclusive_bf_checks',
            'immunization_tracking__vachist',
            'supplements_statuses'
        )
        
        # Prefetch related data for medical consultation records
        med_consult_queryset = MedicalConsultation_Record.objects.select_related(
            'patrec__pat_id__rp_id__per',
            'patrec__pat_id__trans_id__tradd_id',
            'vital',
            'bm',
            'find',
            'staff__rp__per',
            'assigned_to'
        ).filter(medrec_status='pending')
        
        # Apply assigned_to filter
        if assigned_to:
            child_health_queryset = child_health_queryset.filter(assigned_to_id=assigned_to, status="check-up")
            med_consult_queryset = med_consult_queryset.filter(assigned_to_id=assigned_to)
        
        # Apply search filter
        if search_query:
            child_health_queryset = child_health_queryset.filter(
                Q(chrec__ufc_no__icontains=search_query) |
                Q(chrec__family_no__icontains=search_query) |
                Q(tt_status__icontains=search_query) |
                Q(chrec__patrec__pat_id__rp_id__per__per_lname__icontains=search_query) |
                Q(chrec__patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(chrec__patrec__pat_id__trans_id__tran_lname__icontains=search_query) |
                Q(chrec__patrec__pat_id__trans_id__tran_fname__icontains=search_query)
            )
            
            med_consult_queryset = med_consult_queryset.filter(
                Q(medrec_chief_complaint__icontains=search_query) |
                Q(patrec__pat_id__rp_id__per__per_lname__icontains=search_query) |
                Q(patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tran_lname__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tran_fname__icontains=search_query)
            )
        
        # Apply record type filter
        if record_type != 'all':
            if record_type == 'child-health':
                med_consult_queryset = MedicalConsultation_Record.objects.none()
            elif record_type == 'medical-consultation':
                child_health_queryset = ChildHealth_History.objects.none()
        
        combined_data = []
        
        # Process child health records using serializers
        for record in child_health_queryset:
            # Use the ChildHealthHistoryFullSerializer to get all related data properly
            serializer = ChildHealthHistoryFullSerializer(record)
            serialized_data = serializer.data
            
            # Extract patient details using your existing method
            chrec = record.chrec
            patrec = chrec.patrec
            patient = patrec.pat_id
            patient_details = self._get_patient_details(patient)
            
            # Add patient details to the serialized data
            if 'chrec_details' not in serialized_data:
                serialized_data['chrec_details'] = {}
            if 'patrec_details' not in serialized_data['chrec_details']:
                serialized_data['chrec_details']['patrec_details'] = {}
            
            serialized_data['chrec_details']['patrec_details']['pat_details'] = patient_details
            
            combined_data.append({
                'record_type': 'child-health',
                'data': serialized_data
            })
        
        # Process medical consultation records
        for record in med_consult_queryset:
            patrec = record.patrec
            patient = patrec.pat_id
            serializer = MedicalConsultationRecordSerializer(record)
            serialized_data = serializer.data
            # Get patient details
            patient_details = self._get_patient_details(patient)
            
            # Get staff details
            staff_details = None
            if record.staff and hasattr(record.staff, 'rp') and record.staff.rp:
                staff_details = {
                    'rp': {
                        'per': {
                            'per_fname': record.staff.rp.per.per_fname if hasattr(record.staff.rp.per, 'per_fname') else '',
                            'per_lname': record.staff.rp.per.per_lname if hasattr(record.staff.rp.per, 'per_lname') else '',
                            'per_mname': record.staff.rp.per.per_mname if hasattr(record.staff.rp.per, 'per_mname') else '',
                            'per_suffix': record.staff.rp.per.per_suffix if hasattr(record.staff.rp.per, 'per_suffix') else '',
                            'per_dob': record.staff.rp.per.per_dob.isoformat() if hasattr(record.staff.rp.per, 'per_dob') and record.staff.rp.per.per_dob else ''
                        }
                    }
                }
            
            # Get vital signs
            vital_data = {}
            if record.vital:
                vital_data = {
                    'vital_bp_systolic': record.vital.vital_bp_systolic,
                    'vital_bp_diastolic': record.vital.vital_bp_diastolic,
                    'vital_temp': record.vital.vital_temp,
                    'vital_pulse': record.vital.vital_pulse,
                    'vital_RR': record.vital.vital_RR
                }
            
            # Get BMI details
            bmi_data = {}
            if record.bm:
                bmi_data = {
                    'height': record.bm.height,
                    'weight': record.bm.weight
                }
            
            combined_data.append({
                'record_type': 'medical-consultation',
                'data': serialized_data  # This contains ALL attributes from your serializer

            })
        
        # Sort by created_at (most recent first)
        combined_data.sort(key=lambda x: x['data'].get('created_at', ''), reverse=True)
        
        # Manual pagination
        total_count = len(combined_data)
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_data = combined_data[start_index:end_index]
        
        # Calculate totals
        residents = 0
        transients = 0
        
        for record in combined_data:
            pat_details = None
            if record['record_type'] == 'child-health':
                pat_details = record['data'].get('chrec_details', {}).get('patrec_details', {}).get('pat_details', {})
            else:
                pat_details = record['data'].get('patrec_details', {}).get('patient_details', {})
            
            if pat_details and pat_details.get('pat_type') == 'Resident':
                residents += 1
            elif pat_details:
                transients += 1
        
        total_patients = residents + transients
        
        # Build response
        response_data = {
            'count': total_count,
            'next': None if end_index >= total_count else page + 1,
            'previous': None if page == 1 else page - 1,
            'results': paginated_data,
            'totals': {
                'residents': residents,
                'transients': transients,
                'total_patients': total_patients
            }
        }
        
        return Response(response_data)
    
    def _get_patient_details(self, patient):
        """Helper method to extract patient details"""
        if patient.pat_type == 'Resident' and patient.rp_id and hasattr(patient.rp_id, 'per'):
            per = patient.rp_id.per
            address = getattr(patient.rp_id, 'address', None)
            
            return {
                'pat_id': patient.pat_id,
                'pat_type': patient.pat_type,
                'personal_info': {
                    'per_fname': per.per_fname,
                    'per_lname': per.per_lname,
                    'per_mname': per.per_mname,
                    'per_sex': per.per_sex,
                    'per_dob': per.per_dob.isoformat() if per.per_dob else None
                },
                'address': {
                    'add_street': address.add_street if address else '',
                    'add_sitio': address.add_sitio if address else '',
                    'add_barangay': address.add_barangay if address else '',
                    'add_city': address.add_city if address else '',
                    'add_province': address.add_province if address else '',
                    'full_address': f"{address.add_street if address else ''}, {address.add_sitio if address else ''}, {address.add_barangay if address else ''}, {address.add_city if address else ''}, {address.add_province if address else ''}".strip(', ')
                },
                'households': [{'hh_id': hh.hh_id} for hh in patient.rp_id.households.all()] if hasattr(patient.rp_id, 'households') else []
            }
        
        elif patient.pat_type == 'Transient' and patient.trans_id:
            trans = patient.trans_id
            
            # Get address from TransientAddress if available
            address = trans.tradd_id if hasattr(trans, 'tradd_id') else None
            
            return {
                'pat_id': patient.pat_id,
                'pat_type': patient.pat_type,
                'personal_info': {
                    'per_fname': trans.tran_fname,
                    'per_lname': trans.tran_lname,
                    'per_mname': trans.tran_mname,
                    'per_sex': trans.tran_sex,
                    'per_dob': trans.tran_dob.isoformat() if trans.tran_dob else None
                },
                'address': {
                    'add_street': address.tradd_street if address else '',
                    'add_sitio': address.tradd_sitio if address else '',
                    'add_barangay': address.tradd_barangay if address else '',
                    'add_city': address.tradd_city if address else '',
                    'add_province': address.tradd_province if address else '',
                    'full_address': f"{address.tradd_street if address else ''}, {address.tradd_sitio if address else ''}, {address.tradd_barangay if address else ''}, {address.tradd_city if address else ''}, {address.tradd_province if address else ''}".strip(', ')
                } if address else {
                    'add_street': '',
                    'add_sitio': '',
                    'add_barangay': '',
                    'add_city': '',
                    'add_province': '',
                    'full_address': ''
                },
                'households': []  # Transients typically don't have households
            }
        
        return {}

# # USE FOR ADDING MEDICAL RECORD
# class MedicalConsultationRecordView(generics.CreateAPIView):
#     serializer_class = MedicalConsultationRecordSerializer
#     queryset  =MedicalConsultation_Record.objects.all()
    
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
    
# class UpdateMedicalConsultationRecordView(generics.UpdateAPIView):
#     serializer_class = MedicalConsultationRecordSerializer
#     queryset = MedicalConsultation_Record.objects.all()
#     lookup_field = 'medrec_id'


class ViewMedicalConsultationRecordView(generics.ListAPIView):
    serializer_class = MedicalConsultationRecordSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        search_query = self.request.GET.get('search', '').strip()
        
        queryset = MedicalConsultation_Record.objects.filter(
            patrec__pat_id=pat_id,
            medrec_status='completed' 
        ).order_by('-created_at')
        
        # Add search functionality
        if search_query:
            queryset = queryset.filter(
                Q(created_at__icontains=search_query) |
                Q(find__assessment_summary__icontains=search_query) |
                Q(find__subj_summary__icontains=search_query) |
                Q(find__obj_summary__icontains=search_query) |
                Q(find__plantreatment_summary__icontains=search_query) |
                Q(medrec_chief_complaint__icontains=search_query)
            )
        
        return queryset

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
    
    
# class MedicalConsultationTotalCountAPIView(APIView):
#     def get(self, request):
#         try:
#             # Count total unique medical consultation records
#             total_records = MedicalConsultation_Record.objects.count()
            
#             return Response({
#                 'success': True,
#                 'total_records': total_records
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 'success': False,
#                 'error': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



#================================ CREATE STEP1
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
                        "received_data": data,
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
            
            # 🔹 Get Patient instance (ADD THIS)
            try:
                patient = Patient.objects.get(pat_id=data["pat_id"])
            except Patient.DoesNotExist:
                return Response(
                    {"error": f"Invalid patient ID: {data['pat_id']}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 1. Create PatientRecord
            patrec = PatientRecord.objects.create(
                pat_id_id=data["pat_id"],  # This might also need fixing if it expects a Patient instance
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

            # 3. Create BodyMeasurement - FIXED
            bm = BodyMeasurement.objects.create(
                height=float(data.get("height", 0)),
                weight=float(data.get("weight", 0)),
                pat=patient,  # ✅ Now passing Patient instance instead of string
                staff=staff,
            )

            assigned_staff = None
            selected_staff_id = data.get('selectedDoctorStaffId')
            if selected_staff_id:  # This checks for truthy values (not None, not empty string)
                try:
                    assigned_staff = Staff.objects.get(staff_id=selected_staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {selected_staff_id} does not exist")
       
            # 4. Create MedicalConsultation_Record
            medrec = MedicalConsultation_Record.objects.create(
                patrec=patrec,
                vital=vital,
                bm=bm,
                find=None,
                medrec_chief_complaint=data["medrec_chief_complaint"],
                staff=staff,
                assigned_to=assigned_staff
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
                    {
                        'patrec_id': patrec_id,
                        'ill_id': ill_id,
                        'ill_date': date.today().strftime('%Y-%m-%d'),  # Corrected year format
                        'is_for_surveillance': True  # Added field for surveillance
                    }
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
                    'rp_id': medicine_request_data.get('rp_id'),  
                    'pat_id': medicine_request_data.get('pat_id'), 
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
                    requested_qty = medicine.get('medrec_qty', 0)  # Note: using 'quantity' key for child health
                    
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
                        ill_date=date.today().strftime('%y-%m-%d'),
                        is_for_surveillance=True  
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
            

class FamilyPHIllnessCheckAPIView(APIView):
    """
    API view that checks family medical history for PH illnesses
    Gets family members through FamilyComposition and checks their medical history
    """
    
    def get(self, request, pat_id):
        try:
            # First, find the patient using the string ID
            patient = Patient.objects.get(pat_id=pat_id)
            
            # Get the ResidentProfile for this patient
            try:
                resident_profile = ResidentProfile.objects.get(patients=patient)
            except ResidentProfile.DoesNotExist:
                return Response({
                    'status': 'error',
                    'message': 'Resident profile not found for patient',
                    'error': f'No resident profile found for patient ID {pat_id}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get family compositions where this resident profile is involved
            family_compositions = FamilyComposition.objects.filter(rp=resident_profile)
            
            if not family_compositions.exists():
                return Response({
                    'status': 'success',
                    'message': 'No family members found',
                    'patient_id': pat_id,
                    'family_members_count': 0,
                    'ph_illnesses': {
                        'count': 0,
                        'data': []
                    },
                    'other_illnesses': "None"
                }, status=status.HTTP_200_OK)
            
            # Get all family members from the same families
            family_ids = family_compositions.values_list('fam_id', flat=True)
            
            # For MedicalHistory: exclude the patient themselves
            family_members_excluding_patient = FamilyComposition.objects.filter(
                fam_id__in=family_ids
            ).exclude(rp=resident_profile)
            
            family_rp_ids_excluding_patient = family_members_excluding_patient.values_list('rp_id', flat=True)
            family_patients_excluding_patient = Patient.objects.filter(rp_id__in=family_rp_ids_excluding_patient)
            family_patient_ids_excluding_patient = list(family_patients_excluding_patient.values_list('pat_id', flat=True))
            
            # Get patient records for family members (excluding patient)
            family_patient_records = PatientRecord.objects.filter(
                pat_id__in=family_patient_ids_excluding_patient
            )
            family_record_ids = list(family_patient_records.values_list('patrec_id', flat=True))
            
            # For FamilyPastMedicalHistory: include the patient themselves
            all_family_members_including_patient = FamilyComposition.objects.filter(
                fam_id__in=family_ids
            )
            
            all_family_rp_ids = all_family_members_including_patient.values_list('rp_id', flat=True)
            all_family_patients = Patient.objects.filter(rp_id__in=all_family_rp_ids)
            all_family_patient_ids = list(all_family_patients.values_list('pat_id', flat=True))
            
            # Get all PH illnesses (PH-1 to PH-20)
            ph_codes = [f'PH-{i}' for i in range(1, 21)]
            # Get all FP illnesses (FP-1 to FP-11)
            fp_codes = [f'FP-{i}' for i in range(1, 12)]
            # Combine excluded codes
            excluded_codes = ph_codes + fp_codes
            
            ph_illnesses = Illness.objects.filter(ill_code__in=ph_codes).order_by('ill_code')
            
            # Get family medical history from both MedicalHistory and FamilyPastMedicalHistory
            # MedicalHistory: Only from family members (excluding patient)
            family_medical_history = MedicalHistory.objects.filter(
                patrec_id__in=family_record_ids
            ).select_related('ill')
            
            # FamilyPastMedicalHistory: Include patient and all family members
            family_past_medical_history = FamilyPastMedicalHistory.objects.filter(
                pat_id__in=all_family_patient_ids
            ).select_related('ill')
            
            # Combine all illness IDs that family members have
            family_illness_ids = set()
            
            # From MedicalHistory
            for history in family_medical_history:
                if history.ill_id:
                    family_illness_ids.add(history.ill_id)
            
            # From FamilyPastMedicalHistory
            for history in family_past_medical_history:
                if history.ill_id:
                    family_illness_ids.add(history.ill_id)
            
            # Prepare PH illnesses data with check if family has them
            ph_illnesses_data = []
            for illness in ph_illnesses:
                has_family_history = illness.ill_id in family_illness_ids
                
                # Get year information if available
                year_info = None
                if has_family_history:
                    # Check MedicalHistory first
                    med_history = family_medical_history.filter(ill_id=illness.ill_id).first()
                    if med_history and med_history.year:
                        year_info = med_history.year
                
                ph_illnesses_data.append({
                    'ill_id': illness.ill_id,
                    'illname': illness.illname,
                    'ill_description': illness.ill_description,
                    'ill_code': illness.ill_code,
                    'has_family_history': has_family_history,
                    'year': year_info
                })
            
            # Get other non-PH and non-FP illnesses that family has
            other_illnesses_names = set()
            
            # From MedicalHistory
            for history in family_medical_history:
                if history.ill and history.ill.ill_code not in excluded_codes:
                    other_illnesses_names.add(history.ill.illname)
            
            # From FamilyPastMedicalHistory
            for history in family_past_medical_history:
                if history.ill and history.ill.ill_code not in excluded_codes:
                    other_illnesses_names.add(history.ill.illname)
            
            # Convert set to sorted list and format as comma-separated string
            other_illnesses_list = sorted(list(other_illnesses_names)) if other_illnesses_names else []
            other_illnesses_string = ", ".join(other_illnesses_list) if other_illnesses_list else "None"
            
            return Response({
                'status': 'success',
                'message': 'Family illness check completed successfully',
                'patient_id': pat_id,
                'family_members_count': len(family_patient_ids_excluding_patient),
                'ph_illnesses': {
                    'count': len(ph_illnesses_data),
                    'data': ph_illnesses_data
                },
                'other_illnesses': other_illnesses_string
            }, status=status.HTTP_200_OK)
            
        except Patient.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Patient not found',
                'error': f'Patient with ID {pat_id} does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve family illness data',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)