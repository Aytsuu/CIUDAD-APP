from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from datetime import datetime, timedelta
from django.db.models import Count, Q, OuterRef, Subquery, Max
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
        # Subquery to get the latest consultation date for each patient
        latest_consultation_subquery = MedicalConsultation_Record.objects.filter(
            patrec__pat_id=OuterRef('pat_id'),
            medrec_status='completed'
        ).order_by('-created_at').values('created_at')[:1]

        # Base queryset with annotations for count and latest date
        queryset = Patient.objects.annotate(
            medicalrec_count=Count(
                'patient_records__medical_consultation_record',
                filter=Q(
                    patient_records__medical_consultation_record__medrec_status='completed'
                ),
                distinct=True
            ),
            latest_consultation_date=Subquery(latest_consultation_subquery)
        ).filter(
            patient_records__medical_consultation_record__medrec_status='completed'
        ).select_related(
            'rp_id__per', 
            'trans_id'
        ).prefetch_related(
            'rp_id__per__personal_addresses__add__sitio',
            'patient_records__medical_consultation_record'
        ).distinct()

        # Order by latest consultation date (most recent first) then by count
        queryset = queryset.order_by('-latest_consultation_date', '-medicalrec_count')
        
        # Track if any filter is applied
        filters_applied = False
        original_count = queryset.count()
        
        # Combined search (patient name, patient ID, household number, and sitio)
        search_query = self.request.query_params.get('search', '').strip()
        
        # Combine search and sitio parameters
        combined_search_terms = []
        if search_query and len(search_query) >= 2:  # Allow shorter search terms
            combined_search_terms.append(search_query)
    
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
        return queryset.filter(patient_records__medical_consultation_record__medrec_status=status)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
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
        current_consultation_id = self.request.GET.get('current_consultation_id', '').strip()
        
        queryset = MedicalConsultation_Record.objects.filter(
            patrec__pat_id=pat_id,
            medrec_status='completed' 
        ).order_by('-created_at')
        
        # FILTER OUT CONSULTATIONS AFTER THE CURRENT ONE
        if current_consultation_id:
            try:
                # Get the current consultation's date
                current_consultation = MedicalConsultation_Record.objects.get(
                    medrec_id=current_consultation_id,
                    patrec__pat_id=pat_id
                )
                current_date = current_consultation.created_at
                
                # Only include consultations on or before the current consultation date
                queryset = queryset.filter(created_at__lte=current_date)
                
            except MedicalConsultation_Record.DoesNotExist:
                # If current consultation not found, return all
                pass
        
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
# class CreateMedicalConsultationView(APIView):
#     @transaction.atomic
#     def post(self, request):
#         data = request.data
#         try:
#             # 🔹 Required fields (excluding staff if optional)
#             required_fields = ["pat_id", "medrec_chief_complaint", "height", "weight"]

#             missing_fields = []
#             for field in required_fields:
#                 value = data.get(field, None)
#                 if value is None or str(value).strip() == "":
#                     missing_fields.append(field)

#             if missing_fields:
#                 return Response(
#                     {
#                         "success": False,
#                         "error": "Missing required fields",
#                         "missing_fields": missing_fields,
#                         "received_data": data,
#                     },
#                     status=status.HTTP_400_BAD_REQUEST,
#                 )

#             # 🔹 Handle staff (optional)
#             staff = None
#             staff_id = data.get("staff")
#             if staff_id not in [None, "", "null"]:
#                 try:
#                     staff = Staff.objects.get(pk=staff_id)
#                 except Staff.DoesNotExist:
#                     return Response(
#                         {"error": f"Invalid staff ID: {staff_id}"},
#                         status=status.HTTP_400_BAD_REQUEST,
#                     )
            
#             # 🔹 Get Patient instance (ADD THIS)
#             try:
#                 patient = Patient.objects.get(pat_id=data["pat_id"])
#             except Patient.DoesNotExist:
#                 return Response(
#                     {"error": f"Invalid patient ID: {data['pat_id']}"},
#                     status=status.HTTP_400_BAD_REQUEST,
#                 )

#             # 1. Create PatientRecord
#             patrec = PatientRecord.objects.create(
#                 pat_id_id=data["pat_id"],  # This might also need fixing if it expects a Patient instance
#                 patrec_type="Medical Consultation",
#             )

#             # 2. Create VitalSigns
#             vital = VitalSigns.objects.create(
#                 vital_bp_systolic=data.get("vital_bp_systolic", ""),
#                 vital_bp_diastolic=data.get("vital_bp_diastolic", ""),
#                 vital_temp=data.get("vital_temp", ""),
#                 vital_RR=data.get("vital_RR", ""),
#                 vital_o2="N/A",
#                 vital_pulse=data.get("vital_pulse", ""),
#                 patrec=patrec,
#                 staff=staff,
#             )

#             # 3. Create BodyMeasurement - FIXED
#             bm = BodyMeasurement.objects.create(
#                 height=float(data.get("height", 0)),
#                 weight=float(data.get("weight", 0)),
#                 pat=patient,  # ✅ Now passing Patient instance instead of string
#                 staff=staff,
#             )

#             assigned_staff = None
#             selected_staff_id = data.get('selectedDoctorStaffId')
#             if selected_staff_id:  # This checks for truthy values (not None, not empty string)
#                 try:
#                     assigned_staff = Staff.objects.get(staff_id=selected_staff_id)
#                 except Staff.DoesNotExist:
#                     print(f"Staff with ID {selected_staff_id} does not exist")
       
#             # 4. Create MedicalConsultation_Record
#             medrec = MedicalConsultation_Record.objects.create(
#                 patrec=patrec,
#                 vital=vital,
#                 bm=bm,
#                 find=None,
#                 medrec_chief_complaint=data["medrec_chief_complaint"],
#                 staff=staff,
#                 assigned_to=assigned_staff
#             )

#             return Response(
#                 {
#                     "success": True,
#                     "patrec_id": patrec.patrec_id,
#                     "vital_id": vital.vital_id,
#                     "bm_id": bm.bm_id,
#                     "medrec_id": medrec.medrec_id,
#                 },
#                 status=status.HTTP_201_CREATED,
#             )

#         except Exception as e:
#             return Response(
#                 {"error": str(e), "received_data": data},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )


class CreateMedicalConsultationView(APIView):
    @transaction.atomic
    def post(self, request):
        data = request.data
        try:
            # 🔹 Required fields (excluding staff if optional)
            required_fields = ["pat_id", "medrec_chief_complaint"]

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

            # 🔹 FIX: Add proper boolean parsing function
            def parse_boolean(value):
                if isinstance(value, bool):
                    return value
                if isinstance(value, str):
                    if value.lower() in ['true', '1', 'yes', 'on']:
                        return True
                    elif value.lower() in ['false', '0', 'no', 'off', 'null', 'undefined', '']:
                        return False
                return bool(value)

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
            
            # 🔹 Get Patient instance
            try:
                patient = Patient.objects.get(pat_id=data["pat_id"])
            except Patient.DoesNotExist:
                return Response(
                    {"error": f"Invalid patient ID: {data['pat_id']}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 🔹 Handle Appointment if provided
            appointment = None
            app_id = data.get("app_id")
            if app_id and app_id not in [None, "", "null"]:
                try:
                    appointment = MedConsultAppointment.objects.get(id=app_id)
                    print(f"DEBUG: Found appointment with ID: {appointment.id}")
                except MedConsultAppointment.DoesNotExist:
                    print(f"DEBUG: Appointment with ID {app_id} not found")
                    appointment = None

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
                vital_o2=data.get("vital_o2", "N/A"),
                vital_pulse=data.get("vital_pulse", ""),
                patrec=patrec,
                staff=staff,
            )

            # 3. Create BodyMeasurement
            bm = BodyMeasurement.objects.create(
                height=float(data.get("height", 0)),
                weight=float(data.get("weight", 0)),
                pat=patient,
                staff=staff,
            )

            assigned_staff = None
            selected_staff_id = data.get('selectedDoctorStaffId')
            if selected_staff_id:
                try:
                    assigned_staff = Staff.objects.get(staff_id=selected_staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {selected_staff_id} does not exist")

            # 🔹 FIX: Use the boolean parsing function
            is_phrecord = parse_boolean(data.get('is_phrecord', False))
            
            print(f"DEBUG: is_phrecord value: {is_phrecord}, type: {type(is_phrecord)}")
            print(f"DEBUG: Raw is_phrecord from data: {data.get('is_phrecord')}")
            
            # Only process PhilHealth data if explicitly marked as PhilHealth record
            tts_instance = None
            obs_instance = None
            phil_details_instance = None

            if is_phrecord:
                print("DEBUG: Processing PhilHealth record")
                
                # 🔹 Handle TT Status - only if PhilHealth record
                tts_status = data.get('tts_status')
                tts_date_given = data.get('tts_date_given')
                tts_id = data.get('tts_id')
                
                # ✅ FIX: Ensure TT Status is properly handled and linked
                if tts_status and tts_status.strip():
                    # Check if TT Status with same status already exists
                    existing_tts = TT_Status.objects.filter(
                        tts_status=tts_status,
                        pat_id=patient
                    ).first()
                    
                    if existing_tts:
                        # Use existing TT Status
                        tts_instance = existing_tts
                        print(f"DEBUG: Using existing TT Status with ID: {tts_instance.tts_id}")
                    else:
                        # Create new TT Status - ✅ FIX: Parse boolean
                        tts_instance = TT_Status.objects.create(
                            tts_status=tts_status,
                            tts_date_given=tts_date_given if tts_date_given else None,
                            tts_tdap=parse_boolean(data.get('tts_tdap', False)),
                            pat_id=patient
                        )
                        print(f"DEBUG: Created new TT Status with ID: {tts_instance.tts_id}")
                elif tts_id and tts_id.strip():
                    # Use existing TT Status by ID
                    try:
                        tts_instance = TT_Status.objects.get(tts_id=tts_id)
                        print(f"DEBUG: Found TT Status by ID: {tts_instance.tts_id}")
                    except TT_Status.DoesNotExist:
                        print(f"DEBUG: TT Status with ID {tts_id} not found")
                        tts_instance = None
                else:
                    print("DEBUG: No TT Status data provided")

                # 🔹 Handle Obstetrical History - only if PhilHealth record
                obs_data = {
                    'obs_ch_born_alive': data.get('obs_ch_born_alive'),
                    'obs_living_ch': data.get('obs_living_ch'),
                    'obs_abortion': data.get('obs_abortions'),
                    'obs_still_birth': data.get('obs_still_birth'),
                    'obs_lg_babies': data.get('obs_lg_babies'),
                    'obs_lg_babies_str': data.get('obs_lg_babies_str'),  # BooleanField!
                    'obs_gravida': data.get('obs_gravida'),
                    'obs_para': data.get('obs_para'),
                    'obs_fullterm': data.get('obs_fullterm'),
                    'obs_preterm': data.get('obs_preterm'),
                    'patrec_id': patrec,
                }
                
                # Check if any obstetrical data is provided
                has_obs_data = any(
                    value not in [None, '', 'null'] 
                    for key, value in obs_data.items() 
                    if key not in ['patrec_id', 'obs_lg_babies_str']
                )
                
                if has_obs_data:
                    # ✅ FIX: Parse the boolean field FIRST
                    obs_data['obs_lg_babies_str'] = parse_boolean(obs_data.get('obs_lg_babies_str', False))
                    
                    # Convert string numbers to integers where applicable
                    for field in ['obs_ch_born_alive', 'obs_living_ch', 'obs_abortion', 
                                 'obs_still_birth', 'obs_lg_babies', 'obs_gravida', 
                                 'obs_para', 'obs_fullterm', 'obs_preterm']:
                        if obs_data[field] not in [None, '', 'null']:
                            try:
                                obs_data[field] = int(obs_data[field])
                            except (ValueError, TypeError):
                                obs_data[field] = None
                        else:
                            obs_data[field] = None
                    
                    obs_instance = Obstetrical_History.objects.create(**obs_data)
                    print(f"DEBUG: Created Obstetrical_History with ID: {obs_instance.obs_id}")

            # 4. Create MedicalConsultation_Record (CORE CONSULTATION ONLY)
            medrec = MedicalConsultation_Record.objects.create(
                patrec=patrec,
                vital=vital,
                bm=bm,
                find=None,
                medrec_chief_complaint=data["medrec_chief_complaint"],
                staff=staff,
                assigned_to=assigned_staff,
                is_phrecord=is_phrecord,
                app_id=appointment,  # Link the appointment if exists
            )

            # 🔹 Update appointment status if appointment exists
            if appointment:
                print(f"DEBUG: Updating appointment status from '{appointment.status}' to 'in queue'")
                appointment.status = "in queue"
                appointment.save()
                print(f"DEBUG: Appointment status updated to '{appointment.status}'")

            # 🔹 Create MedicalHistory records for FAMILY illnesses
            famselected_illnesses = data.get('famselectedIllnesses', [])
            if famselected_illnesses:
                print(f"DEBUG: Creating MedicalHistory records for {len(famselected_illnesses)} family illnesses")
                for illness_id in famselected_illnesses:
                    try:
                        illness = Illness.objects.get(ill_id=illness_id)
                        MedicalHistory.objects.create(
                            ill=illness,
                            patrec=patrec,
                            is_from_famhistory=True,  # This is family history
                            is_for_surveillance=False,
                            remarks="Family medical history",
                            ill_date=str(timezone.now().year)  # Current year as string
                        )
                        print(f"DEBUG: Created family medical history for illness ID: {illness_id}")
                    except Illness.DoesNotExist:
                        print(f"DEBUG: Illness with ID {illness_id} does not exist")
                    except Exception as e:
                        print(f"DEBUG: Error creating family medical history for illness {illness_id}: {str(e)}")

            # 🔹 Create MedicalHistory records for PERSONAL illnesses  
            myselected_illnesses = data.get('myselectedIllnesses', [])
            if myselected_illnesses:
                print(f"DEBUG: Creating MedicalHistory records for {len(myselected_illnesses)} personal illnesses")
                for illness_id in myselected_illnesses:
                    try:
                        illness = Illness.objects.get(ill_id=illness_id)
                        MedicalHistory.objects.create(
                            ill=illness,
                            patrec=patrec,
                            is_from_famhistory=False,  # This is personal medical history
                            is_for_surveillance=False,
                            remarks="Personal medical history",
                            ill_date=str(timezone.now().year)  # Current year as string
                        )
                        print(f"DEBUG: Created personal medical history for illness ID: {illness_id}")
                    except Illness.DoesNotExist:
                        print(f"DEBUG: Illness with ID {illness_id} does not exist")
                    except Exception as e:
                        print(f"DEBUG: Error creating personal medical history for illness {illness_id}: {str(e)}")

            # 🔹 Create PhilhealthDetails ONLY if it's explicitly a PhilHealth record
            if is_phrecord:
                print("DEBUG: Creating PhilhealthDetails")
                
                # ✅ FIX: Parse all boolean fields using the function
                phil_details_data = {
                    'iswith_atc': parse_boolean(data.get('iswith_atc', False)),
                    'civil_status': data.get('civil_status'),
                    'dependent_or_member': data.get('dependent_or_member'),
                    'ogtt_result': data.get('ogtt_result'),
                    'contraceptive_used': data.get('contraceptive_used'),
                    'smk_sticks_per_day': data.get('smk_sticks_per_day'),
                    'smk_years': data.get('smk_years'),
                    'is_passive_smoker': parse_boolean(data.get('is_passive_smoker', False)),
                    'alcohol_bottles_per_day': data.get('alcohol_bottles_per_day'),
                    'tts': tts_instance,  # ✅ This will be the FK - either existing or newly created
                    'obs': obs_instance,
                    'lab': None,  
                }
                
                print(f"DEBUG: PhilhealthDetails data - tts: {tts_instance}, obs: {obs_instance}")
                print(f"DEBUG: TT Status instance details: {tts_instance.tts_id if tts_instance else 'None'}")
                
                # ✅ FIX: Clean string fields to ensure empty strings become None
                string_fields = ['civil_status', 'dependent_or_member', 'ogtt_result', 
                               'contraceptive_used', 'smk_sticks_per_day', 'smk_years', 
                               'alcohol_bottles_per_day']
                
                for field in string_fields:
                    if phil_details_data[field] in ["", "null", "undefined"]:
                        phil_details_data[field] = None
                
                # Create PhilhealthDetails linked to the consultation
                try:
                    phil_details_instance = PhilhealthDetails.objects.create(
                        medrec=medrec,
                        **phil_details_data
                    )
                    print(f"DEBUG: PhilhealthDetails created with ID: {phil_details_instance.phil_id}")
                    # ✅ VERIFY: Check that the TT FK is properly set
                    if phil_details_instance.tts:
                        print(f"DEBUG: CONFIRMED - PhilhealthDetails.tts is set to: {phil_details_instance.tts.tts_id}")
                    else:
                        print("DEBUG: PhilhealthDetails.tts is None")
                except Exception as e:
                    print(f"DEBUG: Error creating PhilhealthDetails: {str(e)}")
                    raise e

            response_data = {
                "success": True,
                "patrec_id": patrec.patrec_id,
                "vital_id": vital.vital_id,
                "bm_id": bm.bm_id,
                "medrec_id": medrec.medrec_id,
                "is_phrecord": is_phrecord,
                "family_illnesses_count": len(famselected_illnesses),
                "personal_illnesses_count": len(myselected_illnesses),
            }

            # Add appointment info if appointment was linked
            if appointment:
                response_data["appointment_id"] = appointment.id
                response_data["appointment_status_updated"] = "in queue"

            # Add PhilHealth details info ONLY if it's a PhilHealth record
            if is_phrecord and phil_details_instance:
                response_data["phil_details_id"] = phil_details_instance.phil_id
                
                if tts_instance:
                    response_data["tts_id"] = tts_instance.tts_id
                    response_data["tts_status"] = tts_instance.tts_status
                    response_data["tts_linked_to_phil"] = True  # ✅ Confirm linkage

                if obs_instance:
                    response_data["obs_id"] = obs_instance.obs_id
                    response_data["obs_linked_to_phil"] = True  # ✅ Confirm linkage

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            # ✅ ROLLBACK happens automatically due to @transaction.atomic
            import traceback
            print(f"Error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    "error": str(e),
                    "traceback": traceback.format_exc(),
                    "received_data": data
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

# ========MEDICAL CONSULTATION END SOAP FORM

class SoapFormSubmissionView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            data = request.data
            print(data)
            staff_id = data.get('staff_id') or None
            medrec_id = data.get('medrec_id') or None
            patrec_id = data.get('patrec_id') or None
            app_id = data.get('app_id') or None  # Get appointment ID

            # only enforce medrec_id and patrec_id as required
            if not all([medrec_id, patrec_id]):
                raise ValidationError("Missing required fields: medrec_id and patrec_id")

            # Get the medical record to check PhilHealth status
            phil_id = data.get('phil_id')

            # 🔹 Handle Appointment if provided - Update status to "completed"
            appointment = None
            if app_id and app_id not in [None, "", "null"]:
                try:
                    appointment = MedConsultAppointment.objects.get(id=app_id)
                    print(f"DEBUG: Found appointment with ID: {appointment.id}, current status: '{appointment.status}'")
                except MedConsultAppointment.DoesNotExist:
                    print(f"DEBUG: Appointment with ID {app_id} not found")
                    appointment = None

            # 1. Create Findings
            finding_data = {
                'assessment_summary': data.get('assessment_summary', ''),
                'plantreatment_summary': data.get('plantreatment_summary', ''),
                'subj_summary': data.get('subj_summary', ''),
                'obj_summary': data.get('obj_summary', ''),
                'staff': staff_id
            }
            finding_serializer = FindingSerializer(data=finding_data)
            finding_serializer.is_valid(raise_exception=True)
            finding = finding_serializer.save()

            # 2. Medicine Request (only if medicines exist)
            med_request_id = None
            medicine_request_data = data.get('medicineRequest')  # Note: changed from medicine_request to medicineRequest
            if medicine_request_data and medicine_request_data.get('medicines'):
                # Create MedicineRequest first
                med_request_data = {
                    'rp_id': staff_id,  # Use staff_id as physician ID
                    'pat_id': medicine_request_data.get('pat_id'),  # Patient ID
                    'status': 'pending',
                    'mode': 'walk-in'
                }
                
                med_request_serializer = MedicineRequestSerializer(data=med_request_data)
                med_request_serializer.is_valid(raise_exception=True)
                med_request = med_request_serializer.save()
                med_request_id = med_request.medreq_id

                # Create MedicineRequestItem for each medicine and update inventory
                for medicine in medicine_request_data['medicines']:
                    minv_id = medicine.get('minv_id')
                    requested_qty = medicine.get('medrec_qty', 0)  # Note: changed from medreqitem_qty to medrec_qty
                    
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
            physical_exam_results = data.get('physicalExamResults')  # Note: changed from physical_exam_results to physicalExamResults
            if physical_exam_results:
                per_data = [
                    {'pe_option': pe, 'find': finding.find_id}
                    for pe in physical_exam_results
                ]
                per_serializer = PEResultSerializer(data=per_data, many=True)
                per_serializer.is_valid(raise_exception=True)
                per_serializer.save()

            # 4. Medical History
            selected_illnesses = data.get('selectedIllnesses')  # Note: changed from selected_illnesses to selectedIllnesses
            if selected_illnesses:
                medical_history_data = [
                    {
                        'patrec_id': patrec_id,
                        'ill_id': ill_id,
                        'ill_date': date.today().strftime('%Y-%m-%d'),
                        'is_for_surveillance': True
                    }
                    for ill_id in selected_illnesses
                ]
                MedicalHistory.objects.bulk_create([
                    MedicalHistory(**item) for item in medical_history_data
                ])

            # 5. Handle PhilHealth Laboratory Data if it's a PhilHealth record
            if phil_id:
                try:
                    # Get the existing PhilHealth details
                    philhealth_details = PhilhealthDetails.objects.get(phil_id=phil_id)
                    
                    # Create or update PhilHealth Laboratory record
                    lab_data = {
                        'is_cbc': data.get('is_cbc', False),
                        'is_urinalysis': data.get('is_urinalysis', False),
                        'is_fecalysis': data.get('is_fecalysis', False),
                        'is_sputum_microscopy': data.get('is_sputum_microscopy', False),
                        'is_creatine': data.get('is_creatine', False),
                        'is_hba1c': data.get('is_hba1c', False),
                        'is_chestxray': data.get('is_chestxray', False),
                        'is_papsmear': data.get('is_papsmear', False),
                        'is_fbs': data.get('is_fbs', False),
                        'is_oralglucose': data.get('is_oralglucose', False),
                        'is_lipidprofile': data.get('is_lipidprofile', False),
                        'is_fecal_occult_blood': data.get('is_fecal_occult_blood', False),
                        'is_ecg': data.get('is_ecg', False),
                        'others': data.get('others', ''),
                    }
                    
                    # Check if lab already exists for this PhilHealth record
                    if philhealth_details.lab:
                        # Update existing lab record
                        lab_serializer = PhilHealthLaboratorySerializer(
                            philhealth_details.lab, 
                            data=lab_data, 
                            partial=True
                        )
                    else:
                        # Create new lab record
                        lab_serializer = PhilHealthLaboratorySerializer(data=lab_data)
                    
                    lab_serializer.is_valid(raise_exception=True)
                    lab_instance = lab_serializer.save()
                    
                    # Link the lab to PhilHealth details
                    philhealth_details.lab = lab_instance
                    philhealth_details.save()
                    
                    print(f"PhilHealth laboratory data updated for phil_id: {phil_id}")
                    
                except PhilhealthDetails.DoesNotExist:
                    return Response(
                        {"error": f"PhilHealth details with ID {phil_id} not found"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                except Exception as e:
                    # Log the error but don't fail the entire request
                    print(f"Error updating PhilHealth laboratory: {str(e)}")

            # 6. Update Medical Consultation Record
            MedicalConsultation_Record.objects.filter(medrec_id=medrec_id).update(
                medrec_status='completed',
                find=finding,
                medreq_id=med_request_id,
            )

            # 🔹 Update appointment status to "completed" if appointment exists
            if appointment:
                print(f"DEBUG: Updating appointment status from '{appointment.status}' to 'completed'")
                appointment.status = "completed"
                appointment.save()
                print(f"DEBUG: Appointment status updated to '{appointment.status}'")

            response_data = {
                'success': True,
            }

            # Add appointment info to response if appointment was updated
            if appointment:
                response_data["appointment_id"] = appointment.id
                response_data["appointment_status_updated"] = "completed"

            return Response(response_data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except MedicalConsultation_Record.DoesNotExist:
            return Response(
                {'error': f'Medical consultation record with ID {medrec_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
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
   




# ===================FAMILY HISTORY===============================
class FamilyPHIllnessCheckAPIView(APIView):
    """
    API view that checks family medical history for illnesses
    Gets family members through FamilyComposition and checks their medical history
    """
    
    def get(self, request, pat_id):
        try: 
            # Get search parameter from query string
            search_query = request.GET.get('search', '').strip()
            
            # First, find the patient using the string ID
            patient = Patient.objects.get(pat_id=pat_id)
            
            # Get the ResidentProfile for this patient
            try:
                resident_profile = ResidentProfile.objects.get(patients=patient)
            except ResidentProfile.DoesNotExist:
                return Response({
                    'status': 'error',
                    'message': 'Resident profile not found for patient',
                    'error': f'No resident profile found for patient ID {pat_id}',
                    'search_query': search_query if search_query else None
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
                    'other_illnesses': "None",
                    'search_query': search_query if search_query else None
                }, status=status.HTTP_200_OK)
            
            # Get all family members from the same families
            family_ids = family_compositions.values_list('fam_id', flat=True)
            
            # Get all family members (excluding the patient themselves)
            family_members_excluding_patient = FamilyComposition.objects.filter(
                fam_id__in=family_ids
            ).exclude(rp=resident_profile)
            
            # Get ResidentProfile IDs of family members
            family_rp_ids_excluding_patient = family_members_excluding_patient.values_list('rp_id', flat=True)
            
            # Get Patient instances for family members
            family_patients_excluding_patient = Patient.objects.filter(rp_id__in=family_rp_ids_excluding_patient)
            family_patient_ids_excluding_patient = list(family_patients_excluding_patient.values_list('pat_id', flat=True))
            
            # Get PatientRecord instances for family members
            family_patient_records = PatientRecord.objects.filter(
                pat_id__in=family_patient_ids_excluding_patient
            )
            family_record_ids = list(family_patient_records.values_list('patrec_id', flat=True))
            
            # Get PatientRecord instance for the current patient
            current_patient_record = PatientRecord.objects.filter(pat_id=pat_id).first()
            current_patient_record_id = current_patient_record.patrec_id if current_patient_record else None
            
            # Get all PH illnesses (PH-1 to PH-20)
            ph_codes = [f'PH-{i}' for i in range(1, 21)]
            # Get all FP illnesses (FP-1 to FP-11)
            fp_codes = [f'FP-{i}' for i in range(1, 12)]
            
            # Get PH illnesses with search filter if provided
            ph_illnesses = Illness.objects.filter(ill_code__in=ph_codes)
            
            # Apply search filter to PH illnesses if search query is provided
            if search_query:
                ph_illnesses = ph_illnesses.filter(
                    models.Q(illname__icontains=search_query) |
                    models.Q(ill_code__icontains=search_query) |
                    models.Q(ill_description__icontains=search_query)
                )
            
            ph_illnesses = ph_illnesses.order_by('ill_code')
            
            # Get FP illnesses
            fp_illnesses = Illness.objects.filter(ill_code__in=fp_codes)
            
            # Get family medical history from MedicalHistory (family members + current patient's is_from_famhistory records)
            family_medical_history = MedicalHistory.objects.filter(
                models.Q(patrec_id__in=family_record_ids) |  # Family members' medical history
                models.Q(patrec_id=current_patient_record_id, is_from_famhistory=True)  # Current patient's family history records
            ).select_related('ill')
            
            # Apply search filter to family medical history if search query is provided
            if search_query:
                family_medical_history = family_medical_history.filter(
                    models.Q(ill__illname__icontains=search_query) |
                    models.Q(ill__ill_code__icontains=search_query) |
                    models.Q(ill__ill_description__icontains=search_query)
                )
            
            # Combine all illness IDs that family members have (using set for distinct)
            family_illness_ids = set()
            # Also store illness names for checking FP codes
            family_illness_names = set()
            
            # From MedicalHistory
            for history in family_medical_history:
                if history.ill_id:
                    family_illness_ids.add(history.ill_id)
                    if history.ill:
                        family_illness_names.add(history.ill.illname)
            
            # Prepare PH illnesses data with check if family has them
            ph_illnesses_data = []
            for illness in ph_illnesses:
                # Check if family has this PH illness by ID
                has_family_history = illness.ill_id in family_illness_ids
                
                # Get year information if available
                year_info = None
                if has_family_history:
                    # Check MedicalHistory
                    med_history = family_medical_history.filter(ill_id=illness.ill_id).first()
                    if med_history:
                        year_info = med_history.ill_date
                
                ph_illnesses_data.append({
                    'ill_id': illness.ill_id,
                    'illname': illness.illname,
                    'ill_description': illness.ill_description,
                    'ill_code': illness.ill_code,
                    'has_family_history': has_family_history,
                    'year': year_info
                })
            
            # Get other illnesses (illnesses that family has but are NOT in PH codes)
            # This includes FP codes that don't have matching PH codes
            other_illnesses_set = set()
            
            # From MedicalHistory - get distinct illnesses that family has
            for history in family_medical_history:
                if history.ill:
                    illness_name = history.ill.illname
                    illness_code = history.ill.ill_code
                    
                    # Check if this illness is a PH code
                    is_ph_code = illness_code in ph_codes
                    
                    # If it's NOT a PH code, include it in other illnesses
                    if not is_ph_code:
                        other_illnesses_set.add(illness_name)
            
            # Convert set to sorted list for consistent ordering
            other_illnesses_list = sorted(list(other_illnesses_set)) if other_illnesses_set else []
            
            # Format as comma-separated string (already distinct due to set)
            other_illnesses_string = ", ".join(other_illnesses_list) if other_illnesses_list else "None"
            
            # Filter other illnesses by search query if provided
            if search_query:
                other_illnesses_list = [illness for illness in other_illnesses_list if search_query.lower() in illness.lower()]
                other_illnesses_string = ", ".join(other_illnesses_list) if other_illnesses_list else "None"
            
            return Response({
                'status': 'success',
                'message': 'Family illness check completed successfully',
                'patient_id': pat_id,
                'family_members_count': len(family_patient_ids_excluding_patient),
                'ph_illnesses': {
                    'count': len([ill for ill in ph_illnesses_data if ill['has_family_history']]),
                    'total_count': len(ph_illnesses_data),
                    'data': ph_illnesses_data
                },
                'other_illnesses': other_illnesses_string,
                'other_illnesses_distinct_count': len(other_illnesses_list),
                'search_query': search_query if search_query else None,
                'search_applied': bool(search_query)
            }, status=status.HTTP_200_OK)
            
        except Patient.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Patient not found',
                'error': f'Patient with ID {pat_id} does not exist',
                'search_query': search_query if search_query else None
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve family illness data',
                'error': str(e),
                'search_query': search_query if search_query else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
# =============================APPOINTMENT
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
        
        
        
#================== WEBVIEW APPOINTMENT==============

class PendingMedicalUserAppointmentsView(generics.ListAPIView):
    serializer_class = MedConsultAppointmentSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Get the search query and date filter from request parameters
        search_query = self.request.GET.get('search', '').strip()
        date_filter = self.request.GET.get('date_filter', 'all').strip()
        
        # Base queryset for pending appointments with related data
        queryset = MedConsultAppointment.objects.filter(status='pending')
        
        # Apply search filter if provided
        if search_query:
            queryset = queryset.filter(
                # Search by patient information (through rp -> ResidentProfile -> Personal)
                Q(rp__per__per_lname__icontains=search_query) |
                Q(rp__per__per_fname__icontains=search_query) |
                Q(rp__per__per_mname__icontains=search_query) |
                Q(rp__per__per_contact__icontains=search_query) |
                
                # Search by appointment details
                Q(id__icontains=search_query) |
                Q(rp__rp_id__icontains=search_query) |
                Q(chief_complaint__icontains=search_query) |
                Q(notes__icontains=search_query) if hasattr(MedConsultAppointment, 'notes') else Q() |
                
                # Search by patient address information
                Q(rp__per__personal_addresses__add__add_province__icontains=search_query) |
                Q(rp__per__personal_addresses__add__add_city__icontains=search_query) |
                Q(rp__per__personal_addresses__add__add_barangay__icontains=search_query) |
                Q(rp__per__personal_addresses__add__add_street__icontains=search_query) |
                Q(rp__per__personal_addresses__add__sitio__sitio_name__icontains=search_query) |
                Q(rp__per__personal_addresses__add__add_external_sitio__icontains=search_query) |
                
                # Search by household and family information
                Q(rp__respondents_info__fam__fam_id__icontains=search_query) |
                Q(rp__respondents_info__fam__hh__hh_id__icontains=search_query)
            ).distinct()
        
        # Apply date filter if provided
        if date_filter != 'all':
            today = datetime.now().date()
            
            if date_filter == 'today':
                # Filter for today's appointments (by created date)
                queryset = queryset.filter(created_at__date=today)
                
            elif date_filter == 'this-week':
                # Filter for this week's appointments (Monday to Sunday)
                start_of_week = today - timedelta(days=today.weekday())
                queryset = queryset.filter(created_at__date__gte=start_of_week)
                
            elif date_filter == 'this-month':
                # Filter for this month's appointments
                start_of_month = today.replace(day=1)
                queryset = queryset.filter(created_at__date__gte=start_of_month)
                
            elif date_filter == 'tomorrow':
                # Filter for tomorrow's appointments (by scheduled_date)
                tomorrow = today + timedelta(days=1)
                queryset = queryset.filter(scheduled_date=tomorrow)
                
            elif date_filter == 'upcoming':
                # Filter for upcoming appointments (from tomorrow onwards)
                tomorrow = today + timedelta(days=1)
                queryset = queryset.filter(scheduled_date__gte=tomorrow)
                
            elif date_filter == 'past':
                # Filter for past appointments
                queryset = queryset.filter(scheduled_date__lt=today)
        
        return queryset.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response = self.get_paginated_response(serializer.data)
                response.data['total_confirmed_appointments'] = queryset.count()
                return response
            
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'success': True,
                'results': serializer.data,
                'count': len(serializer.data),
                'total_confirmed_appointments': queryset.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': f'Error fetching pending appointments: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ActionAppointmentView(generics.RetrieveUpdateAPIView):
    serializer_class=MedConsultAppointmentSerializer
    queryset = MedConsultAppointment.objects.all()

        
#================== WEBVIEW APPOINTMENT==============

class ConfirmedMedicalUserAppointmentsView(generics.ListAPIView):
    serializer_class = MedConsultAppointmentSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Get the search query and date filter from request parameters
        search_query = self.request.GET.get('search', '').strip()
        date_filter = self.request.GET.get('date_filter', 'all').strip()
        
        # Base queryset for pending appointments with related data
        queryset = MedConsultAppointment.objects.filter(status='confirmed')
        
        # Apply search filter if provided
        if search_query:
            queryset = queryset.filter(
                # Search by patient information (through rp -> ResidentProfile -> Personal)
                Q(rp__per__per_lname__icontains=search_query) |
                Q(rp__per__per_fname__icontains=search_query) |
                Q(rp__per__per_mname__icontains=search_query) |
                Q(rp__per__per_contact__icontains=search_query) |
                
                # Search by appointment details
                Q(id__icontains=search_query) |
                Q(rp__rp_id__icontains=search_query) |
                Q(chief_complaint__icontains=search_query) |
                Q(notes__icontains=search_query) if hasattr(MedConsultAppointment, 'notes') else Q() |
                
                # Search by patient address information
                Q(rp__per__personal_addresses__add__add_province__icontains=search_query) |
                Q(rp__per__personal_addresses__add__add_city__icontains=search_query) |
                Q(rp__per__personal_addresses__add__add_barangay__icontains=search_query) |
                Q(rp__per__personal_addresses__add__add_street__icontains=search_query) |
                Q(rp__per__personal_addresses__add__sitio__sitio_name__icontains=search_query) |
                Q(rp__per__personal_addresses__add__add_external_sitio__icontains=search_query) |
                
                # Search by household and family information
                Q(rp__respondents_info__fam__fam_id__icontains=search_query) |
                Q(rp__respondents_info__fam__hh__hh_id__icontains=search_query)
            ).distinct()
        
        # Apply date filter if provided
        if date_filter != 'all':
            today = datetime.now().date()
            
            if date_filter == 'today':
                # Filter for today's appointments (by created date)
                queryset = queryset.filter(created_at__date=today)
                
            elif date_filter == 'this-week':
                # Filter for this week's appointments (Monday to Sunday)
                start_of_week = today - timedelta(days=today.weekday())
                queryset = queryset.filter(created_at__date__gte=start_of_week)
                
            elif date_filter == 'this-month':
                # Filter for this month's appointments
                start_of_month = today.replace(day=1)
                queryset = queryset.filter(created_at__date__gte=start_of_month)
                
            elif date_filter == 'tomorrow':
                # Filter for tomorrow's appointments (by scheduled_date)
                tomorrow = today + timedelta(days=1)
                queryset = queryset.filter(scheduled_date=tomorrow)
                
            elif date_filter == 'upcoming':
                # Filter for upcoming appointments (from tomorrow onwards)
                tomorrow = today + timedelta(days=1)
                queryset = queryset.filter(scheduled_date__gte=tomorrow)
                
            elif date_filter == 'past':
                # Filter for past appointments
                queryset = queryset.filter(scheduled_date__lt=today)
        
        return queryset.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response = self.get_paginated_response(serializer.data)
                response.data['total_confirmed_appointments'] = queryset.count()
                return response
            
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'success': True,
                'results': serializer.data,
                'count': len(serializer.data),
                'total_confirmed_appointments': queryset.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': f'Error fetching pending appointments: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)