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
from apps.servicescheduler.models import *
from django.http import Http404
from datetime import date, timedelta
from dateutil import parser


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

from apps.medicineservices.serializers import MedicineRequestItemSerializer

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
                    requested_qty = medicine.get('medrec_qty', 0)
                    
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
            
            
# FOR MOBILE APP /////////////////////////////////////////////////////////////////////////////////////////

# class AvailableSlotsView(APIView):
#     def get(self, request):
#         today = date.today()
#         available = []
#         try:
#             service = Service.objects.get(service_name='Medical Consultation')
#         except Service.DoesNotExist:
#             raise Http404("Medical Consultation service not found")

#         for i in range(30):
#             d = today + timedelta(days=i)
#             if d.weekday() >= 5:  # Skip weekends (5=Sat, 6=Sun)
#                 continue
#             day_name = d.strftime('%A')
#             try:
#                 day_obj = Day.objects.get(day=day_name)
#             except Day.DoesNotExist:
#                 continue

#             am_scheduled = ServiceScheduler.objects.filter(service_id=service, day_id=day_obj, meridiem='AM').exists()
#             pm_scheduled = ServiceScheduler.objects.filter(service_id=service, day_id=day_obj, meridiem='PM').exists()

#             if not am_scheduled and not pm_scheduled:
#                 continue

#             try:
#                 date_slot, created = DateSlot.objects.get_or_create(
#                     date=d,
#                     defaults={
#                         'am_max_slots': 10 if am_scheduled else 0,
#                         'pm_max_slots': 10 if pm_scheduled else 0,
#                         'am_current_bookings': 0,
#                         'pm_current_bookings': 0
#                     }
#                 )
#             except Exception as e:
#                 return Response(
#                     {'error': f'Failed to create/get DateSlot: {str(e)}'},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )

#             am_available = date_slot.am_available_slots > 0 and am_scheduled
#             pm_available = date_slot.pm_available_slots > 0 and pm_scheduled

#             if am_available or pm_available:
#                 available.append({
#                     'date': d.isoformat(),
#                     'am_available': am_available,
#                     'pm_available': pm_available,
#                     'am_remaining': date_slot.am_available_slots if am_scheduled else 0,
#                     'pm_remaining': date_slot.pm_available_slots if pm_scheduled else 0,
#                 })

#         return Response(available)

# class BookAppointmentView(APIView):
#     @transaction.atomic
#     def post(self, request):
#         data = request.data
#         patient_id = data.get('patient_id')
#         scheduled_date_str = data.get('scheduled_date')
#         meridiem = data.get('meridiem')
#         chief_complaint = data.get('chief_complaint')
#         is_pregnant = data.get('is_pregnant', False)

#         if not all([patient_id, scheduled_date_str, meridiem, chief_complaint]):
#             return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             d = date.fromisoformat(scheduled_date_str)
#         except ValueError:
#             return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

#         if d.weekday() >= 5:
#             return Response({'error': 'Appointments not available on weekends'}, status=status.HTTP_400_BAD_REQUEST)

#         day_name = d.strftime('%A')
#         try:
#             day_obj = Day.objects.get(day=day_name)
#             service = Service.objects.get(service_name='Medical Consultation')
#         except (Day.DoesNotExist, Service.DoesNotExist):
#             return Response({'error': 'Service or day configuration missing'}, status=status.HTTP_400_BAD_REQUEST)

#         if not ServiceScheduler.objects.filter(service_id=service, day_id=day_obj, meridiem=meridiem).exists():
#             return Response({'error': 'Service not scheduled for this day/time'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             date_slot, created = DateSlot.objects.get_or_create(
#                 date=d,
#                 defaults={
#                     'am_max_slots': 10 if meridiem == 'AM' else 0,
#                     'pm_max_slots': 10 if meridiem == 'PM' else 0,
#                     'am_current_bookings': 0,
#                     'pm_current_bookings': 0
#                 }
#             )
#         except Exception as e:
#             return Response(
#                 {'error': f'Failed to create/get DateSlot: {str(e)}'},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#         if meridiem == 'AM' and date_slot.am_available_slots <= 0:
#             return Response({'error': 'No available AM slots'}, status=status.HTTP_400_BAD_REQUEST)
#         elif meridiem == 'PM' and date_slot.pm_available_slots <= 0:
#             return Response({'error': 'No available PM slots'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             patient = Patient.objects.get(pat_id=patient_id)
#         except Patient.DoesNotExist:
#             return Response({'error': 'Patient not found'}, status=status.HTTP_400_BAD_REQUEST)

#         patrec, _ = PatientRecord.objects.get_or_create(pat_id=patient)
#         vital = VitalSigns.objects.create()
#         bm = BodyMeasurement.objects.create()

#         medrec_data = {
#             'medrec_status': 'pending',
#             'medrec_chief_complaint': chief_complaint,
#             'patrec': patrec,
#             'vital': vital,
#             'bm': bm,
#             'scheduled_date': d,
#             'meridiem': meridiem,
#         }
#         if is_pregnant:
#             medrec_data['lmp'] = data.get('lmp')

#         medrec = MedicalConsultation_Record.objects.create(**medrec_data)

#         if meridiem == 'AM':
#             date_slot.am_current_bookings += 1
#         else:
#             date_slot.pm_current_bookings += 1
#         date_slot.save()

#         return Response({'success': True, 'medrec_id': medrec.medrec_id}, status=status.HTTP_201_CREATED)
    
class AvailableMedicalConsultationSlotsView(APIView):
    def get(self, request):
        try:
            consultation_service = Service.objects.get(service_name='Medical Consultation')
            
            # Generate slots for the next 90 days
            today = date.today()
            future_date_limit = today + timedelta(days=90)
            response_data = []
            
            current_date = today
            while current_date <= future_date_limit:
                day_of_week_name = current_date.strftime('%A')
                is_weekend = current_date.weekday() in [5, 6]  # Saturday=5, Sunday=6

                # Check scheduler for AM and PM
                is_scheduled_am = ServiceScheduler.objects.filter(
                    service_id=consultation_service,
                    day_id__day=day_of_week_name,
                    meridiem='AM'
                ).exists()
                is_scheduled_pm = ServiceScheduler.objects.filter(
                    service_id=consultation_service,
                    day_id__day=day_of_week_name,
                    meridiem='PM'
                ).exists()

                # Rule: Available if scheduled OR weekend
                am_allowed = is_scheduled_am or is_weekend
                pm_allowed = is_scheduled_pm or is_weekend

                # FIX: Use DateSlots (with 's') instead of DateSlot
                date_slot = DateSlots.objects.filter(date=current_date).first()
                am_max_slots = date_slot.am_max_slots if date_slot else 20
                pm_max_slots = date_slot.pm_max_slots if date_slot else 20
                am_current_bookings = date_slot.am_current_bookings if date_slot else 0
                pm_current_bookings = date_slot.pm_current_bookings if date_slot else 0
                am_available_slots = am_max_slots - am_current_bookings
                pm_available_slots = pm_max_slots - pm_current_bookings

                # Only include dates with available slots
                if (am_allowed and am_available_slots > 0) or (pm_allowed and pm_available_slots > 0):
                    response_data.append({
                        'date': current_date.isoformat(),
                        'day_name': day_of_week_name,
                        'am_available': am_allowed and am_available_slots > 0,
                        'pm_available': pm_allowed and pm_available_slots > 0,
                        'am_available_count': am_available_slots,
                        'pm_available_count': pm_available_slots,
                    })

                current_date += timedelta(days=1)
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        except Service.DoesNotExist:
            return Response({'error': 'Service "Medical Consultation" not configured in the database.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class MedicalConsultationBookingView(APIView):
    @transaction.atomic
    def post(self, request):
        data = request.data

        # 1. Get and validate required data
        rp_id = data.get('rp_id')
        scheduled_date_str = data.get('scheduled_date')
        meridiem = data.get('meridiem')
        chief_complaint = data.get('chief_complaint')

        if not all([rp_id, scheduled_date_str, meridiem, chief_complaint]):
            return Response(
                {'error': 'Missing required fields.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from datetime import datetime
            scheduled_date = datetime.strptime(scheduled_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if scheduled_date < date.today():
            return Response(
                {'error': 'Scheduled date cannot be in the past.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get scheduler if exists
        try:
            consultation_service = Service.objects.get(service_name='Medical Consultation')
            scheduler = ServiceScheduler.objects.filter(
                service_id=consultation_service,
                day_id__day=scheduled_date.strftime('%A'),
                meridiem=meridiem
            ).first()
        except Service.DoesNotExist:
            scheduler = None

        # Check if scheduled or weekend
        is_weekend = scheduled_date.weekday() in [5, 6]
        if not (scheduler or is_weekend):
            return Response(
                {'error': 'No available schedule for this date/time.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create or get date slot - REMOVE service_scheduler field
        date_slot, created = DateSlots.objects.get_or_create(
            date=scheduled_date,
            defaults={
                'am_max_slots': 20,
                'pm_max_slots': 20,
                # Remove this line: 'service_scheduler': scheduler
            }
        )

        # Check availability and book
        if meridiem == 'AM':
            if date_slot.am_available_slots <= 0:
                return Response({'error': 'No AM slots available.'}, status=400)
            date_slot.am_current_bookings += 1
        else:
            if date_slot.pm_available_slots <= 0:
                return Response({'error': 'No PM slots available.'}, status=400)
            date_slot.pm_current_bookings += 1

        date_slot.save()

        # Create appointment
        try:
            resident_profile = ResidentProfile.objects.get(rp_id=rp_id)
            appointment = MedConsultAppointment.objects.create(
                rp=resident_profile,
                chief_complaint=chief_complaint,
                scheduled_date=scheduled_date,
                meridiem=meridiem,
                status='pending'
            )
            
            return Response({
                'success': True,
                'appointment_id': appointment.id,
                'scheduled_date': scheduled_date.isoformat(),
                'meridiem': meridiem
            }, status=201)
            
        except ResidentProfile.DoesNotExist:
            # Rollback
            if meridiem == 'AM':
                date_slot.am_current_bookings -= 1
            else:
                date_slot.pm_current_bookings -= 1
            date_slot.save()
            return Response({'error': 'Resident not found.'}, status=400)
        
class UserAppointmentsView(generics.ListAPIView):
    serializer_class = MedConsultAppointmentSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        rp_id = self.request.query_params.get('rp_id')
        include_archived = self.request.query_params.get('include_archived', 'false').lower() == 'true'

        if not rp_id:
            raise ValidationError({'error': 'rp_id is required.'})

        queryset = MedConsultAppointment.objects.filter(rp__rp_id=rp_id).select_related('rp')

        if not include_archived:
            queryset = queryset.exclude(status='cancelled')

        return queryset.order_by('-created_at')


class CancelAppointmentView(APIView):
    def patch(self, request, appointment_id):
        try:
            appointment = MedConsultAppointment.objects.get(id=appointment_id)
        except MedConsultAppointment.DoesNotExist:
            return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if appointment.status != 'pending':
            return Response({'error': 'Only pending appointments can be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        archive_reason = request.data.get('archive_reason')
        if not archive_reason:
            return Response({'error': 'Cancellation reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Update appointment status
                appointment.status = 'cancelled'
                appointment.archive_reason = archive_reason
                appointment.save()

                # Decrease slot booking count
                date_slot = DateSlots.objects.get(date=appointment.scheduled_date)
                if appointment.meridiem == 'AM':
                    date_slot.am_current_bookings = max(0, date_slot.am_current_bookings - 1)
                else:
                    date_slot.pm_current_bookings = max(0, date_slot.pm_current_bookings - 1)
                date_slot.save()

            return Response({'success': True, 'detail': 'Appointment cancelled successfully.'}, status=status.HTTP_200_OK)

        except DateSlots.DoesNotExist:
            # If date slot is missing, still allow cancellation but log the issue
            appointment.status = 'cancelled'
            appointment.archive_reason = archive_reason
            appointment.save()
            return Response({'success': True, 'detail': 'Appointment cancelled, but slot update failed.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)