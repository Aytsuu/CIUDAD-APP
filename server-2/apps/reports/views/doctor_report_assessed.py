from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from apps.childhealthservices.models import ChildHealth_History
from apps.childhealthservices.serializers import ChildHealthHistoryFullSerializer
from apps.medicalConsultation.models import MedicalConsultation_Record
from apps.medicalConsultation.serializers import MedicalConsultationRecordSerializer
from apps.patientrecords.models import Patient
from pagination import StandardResultsPagination





    
#================== MEDICAL CONSULTAION FORWARDED TABLE==================
class  MonthlyReportConsulted(APIView):
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
        ).filter(medrec_status='completed')
        
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
