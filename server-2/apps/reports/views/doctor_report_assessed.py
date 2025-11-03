from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from apps.childhealthservices.models import ChildHealth_History
from apps.childhealthservices.serializers import *
from apps.medicalConsultation.models import MedicalConsultation_Record
from apps.medicalConsultation.serializers import MedicalConsultationRecordSerializer
from apps.patientrecords.models import Patient
from pagination import StandardResultsPagination


class MonthlyConsultedSummariesAPIView(APIView):
    def get(self, request):
        try:
            # Get filter parameters - using staff_id for both
            staff_id = request.GET.get('staff_id')  # Use staff_id for both medical consultation and child health
            year_param = request.GET.get('year')  # '2025' or '2025-07'

            # Base querysets for both record types
            child_health_queryset = ChildHealth_History.objects.select_related(
                'chrec__patrec__pat_id__rp_id__per',
                'chrec__patrec__pat_id__trans_id__tradd_id',
                'assigned_to',
                'assigned_doc'
            ).filter(status="recorded", assigned_doc__isnull=False)
            
            med_consult_queryset = MedicalConsultation_Record.objects.select_related(
                'patrec__pat_id__rp_id__per',
                'patrec__pat_id__trans_id__tradd_id',
                'vital',
                'bm',
                'find',
                'staff__rp__per',
                'assigned_to'
            ).filter(medrec_status='completed')

            # Apply staff_id filter for both record types
            if staff_id:
                # For medical consultation: filter by assigned_to
                med_consult_queryset = med_consult_queryset.filter(assigned_to_id=staff_id)
                # For child health: filter by assigned_doc
                child_health_queryset = child_health_queryset.filter(assigned_doc=staff_id)

            # Apply year/month filtering
            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        year, month = map(int, year_param.split('-'))
                        # Filter both querysets by year and month
                        child_health_queryset = child_health_queryset.filter(
                            created_at__year=year,
                            created_at__month=month
                        )
                        med_consult_queryset = med_consult_queryset.filter(
                            created_at__year=year,
                            created_at__month=month
                        )
                    else:
                        year = int(year_param)
                        # Filter both querysets by year only
                        child_health_queryset = child_health_queryset.filter(
                            created_at__year=year
                        )
                        med_consult_queryset = med_consult_queryset.filter(
                            created_at__year=year
                        )
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Combine both querysets and annotate by month
            from itertools import chain
            combined_queryset = list(chain(
                child_health_queryset,
                med_consult_queryset
            ))
            
            # Create a dictionary to count records by month and type
            monthly_data = {}
            for record in combined_queryset:
                if hasattr(record, 'created_at') and record.created_at:
                    month_key = record.created_at.strftime('%Y-%m')
                    if month_key not in monthly_data:
                        monthly_data[month_key] = {
                            'total_count': 0,
                            'child_health_count': 0,
                            'medical_consultation_count': 0,
                            'residents': 0,
                            'transients': 0
                        }
                    
                    monthly_data[month_key]['total_count'] += 1
                    
                    # Count by record type
                    if isinstance(record, ChildHealth_History):
                        monthly_data[month_key]['child_health_count'] += 1
                    elif isinstance(record, MedicalConsultation_Record):
                        monthly_data[month_key]['medical_consultation_count'] += 1
                    
                    # Count by patient type
                    patient_type = self._get_patient_type_from_record(record)
                    if patient_type == 'Resident':
                        monthly_data[month_key]['residents'] += 1
                    elif patient_type == 'Transient':
                        monthly_data[month_key]['transients'] += 1
            
            # Convert to list format and sort by month (descending)
            formatted_data = []
            for month_str, data in sorted(monthly_data.items(), reverse=True):
                formatted_data.append({
                    'month': month_str,
                    'record_count': data['total_count'],
                    'breakdown': {
                        'child_health': data['child_health_count'],
                        'medical_consultation': data['medical_consultation_count'],
                        'residents': data['residents'],
                        'transients': data['transients']
                    }
                })

            # Build response with filter info
            response_data = {
                'success': True,
                'data': formatted_data,
                'total_months': len(formatted_data),
                'summary': {
                    'total_records': sum(item['record_count'] for item in formatted_data),
                    'total_child_health': sum(item['breakdown']['child_health'] for item in formatted_data),
                    'total_medical_consultation': sum(item['breakdown']['medical_consultation'] for item in formatted_data),
                    'total_residents': sum(item['breakdown']['residents'] for item in formatted_data),
                    'total_transients': sum(item['breakdown']['transients'] for item in formatted_data)
                },
                'filters_applied': {
                    'staff_id': staff_id,
                    'year': year_param
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({ 
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_patient_type_from_record(self, record):
        """Helper method to extract patient type from record"""
        try:
            if isinstance(record, ChildHealth_History):
                if hasattr(record, 'chrec') and hasattr(record.chrec, 'patrec'):
                    patient = record.chrec.patrec.pat_id
                    return patient.pat_type if hasattr(patient, 'pat_type') else 'Unknown'
            
            elif isinstance(record, MedicalConsultation_Record):
                if hasattr(record, 'patrec'):
                    patient = record.patrec.pat_id
                    return patient.pat_type if hasattr(patient, 'pat_type') else 'Unknown'
        
        except Exception:
            return 'Unknown'
        
        return 'Unknown'


class MonthlyConsultedDetailsAPIView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request, month):
        try:
            # Validate month format (YYYY-MM)
            try:
                year, month_num = map(int, month.split('-'))
                if month_num < 1 or month_num > 12:
                    raise ValueError
            except ValueError:
                return Response({
                    'success': False,
                    'error': 'Invalid month format. Use YYYY-MM.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get query parameters for filtering within the month
            search_query = request.query_params.get('search', '')
            record_type = request.query_params.get('record_type', 'all')
            staff_id = request.query_params.get('staff_id')  # Use staff_id for both
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            
            # Prefetch related data for child health records
            child_health_queryset = ChildHealth_History.objects.select_related(
                'chrec__patrec__pat_id__rp_id__per',
                'chrec__patrec__pat_id__trans_id__tradd_id',
                'assigned_to',
                'assigned_doc'
            ).prefetch_related(
                'child_health_vital_signs__vital',
                'child_health_vital_signs__bm',
                'child_health_vital_signs__find',
                'child_health_notes',
                'child_health_supplements__medrec',
                'exclusive_bf_checks',
                'immunization_tracking__vachist',
                'supplements_statuses'
            ).filter(
                created_at__year=year,
                created_at__month=month_num,
                status="recorded",
                assigned_doc__isnull=False
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
            ).filter(
                created_at__year=year,
                created_at__month=month_num,
                medrec_status='completed'
            )
            
            # Apply staff_id filter for both record types
            if staff_id:
                # For medical consultation: filter by assigned_to
                med_consult_queryset = med_consult_queryset.filter(assigned_to_id=staff_id)
                # For child health: filter by assigned_doc
                child_health_queryset = child_health_queryset.filter(assigned_doc=staff_id)
            
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
            residents = 0
            transients = 0
            child_health_count = 0
            medical_consultation_count = 0
            
            # Process child health records
            for record in child_health_queryset:
                serializer = ChildHealthMinimalSerializer(record)
                serialized_data = serializer.data
                
                chrec = record.chrec
                patrec = chrec.patrec
                patient = patrec.pat_id
                patient_details = self._get_patient_details(patient)
                
                # Count patient types
                if patient_details.get('pat_type') == 'Resident':
                    residents += 1
                else:
                    transients += 1
                
                child_health_count += 1
                
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
                
                patient_details = self._get_patient_details(patient)
                
                # Count patient types
                if patient_details.get('pat_type') == 'Resident':
                    residents += 1
                else:
                    transients += 1
                
                medical_consultation_count += 1
                
                combined_data.append({
                    'record_type': 'medical-consultation',
                    'data': serialized_data
                })
            
            # Sort by created_at (most recent first)
            combined_data.sort(key=lambda x: x['data'].get('created_at', ''), reverse=True)
            
            # Manual pagination
            total_count = len(combined_data)
            start_index = (page - 1) * page_size
            end_index = start_index + page_size
            paginated_data = combined_data[start_index:end_index]

            return Response({
                'success': True,
                'data': {
                    'month': month,
                    'record_count': total_count,
                    'records': paginated_data,
                    'summary': {
                        'child_health': child_health_count,
                        'medical_consultation': medical_consultation_count,
                        'residents': residents,
                        'transients': transients,
                        'total_patients': total_count
                    },
                    'pagination': {
                        'current_page': page,
                        'page_size': page_size,
                        'total_pages': (total_count + page_size - 1) // page_size,
                        'total_records': total_count
                    },
                    'filters_applied': {
                        'staff_id': staff_id,
                        'record_type': record_type,
                        'search_query': search_query
                    }
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                'households': []
            }
        
        return {}