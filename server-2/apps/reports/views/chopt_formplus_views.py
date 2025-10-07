# Standard library imports
from datetime import datetime, timedelta
from django.db.models import ( Q, Prefetch, Count)
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

# Local app imports
from apps.childhealthservices.models import *
from apps.childhealthservices.serializers import *
from ..utils import *
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import * 
from apps.patientrecords.serializers.bodymesurement_serializers import *

class MonthlyOPTChildHealthSummariesAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            # Include both residents and transients, filter for OPT records only
            queryset = BodyMeasurement.objects.filter(is_opt=True).select_related(
                 'pat', 'pat__rp_id', 'pat__trans_id'  # Added pat__trans_id for transient data
            ).order_by('-created_at')

            # Search query (month name or year)
            search_query = request.GET.get('search', '').strip()

            # Filter by year or year-month
            year_param = request.GET.get('year', 'all')
            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        year, month = map(int, year_param.split('-'))
                        queryset = queryset.filter(
                            created_at__year=year,
                            created_at__month=month
                        )
                    else:
                        year = int(year_param)
                        queryset = queryset.filter(created_at__year=year)
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Annotate and count records per month
            monthly_data = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                record_count=Count('bm_id')  # Changed from 'nutstat_id' to 'bm_id'
            ).order_by('-month')

            formatted_data = []
            for item in monthly_data:
                month_str = item['month'].strftime('%Y-%m')
                month_name = item['month'].strftime('%B %Y')

                # Apply search filter if provided
                if search_query and search_query.lower() not in month_name.lower():
                    continue

                formatted_data.append({
                    'month': month_str,
                    'month_name': month_name,
                    'record_count': item['record_count']
                })

            # Pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(formatted_data, request)
            if page is not None:
                return paginator.get_paginated_response({
                    'success': True,
                    'data': page,
                    'total_months': len(formatted_data)
                })

            return Response({
                'success': True,
                'data': formatted_data,
                'total_months': len(formatted_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
   

# NOW THE REFACTORED API VIEW USING THE REUSABLE FUNCTIONS
class MonthlyOPTChildHealthReportAPIView(generics.ListAPIView):
    serializer_class = BodyMeasurementSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        month = self.kwargs.get('month')
        try:
            year, month_num = map(int, month.split('-'))
            start_date = datetime(year, month_num, 1)
            end_date = datetime(year, month_num + 1, 1) if month_num < 12 else datetime(year + 1, 1, 1)
            end_date -= timedelta(microseconds=1)
        except ValueError:
            return BodyMeasurement.objects.none()

        # Include both residents and transients
        queryset = BodyMeasurement.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date,
            is_opt=True
        ).select_related(
            'pat', 'pat__rp_id', 'pat__rp_id__per', 'pat__trans_id'
        ).prefetch_related(
            Prefetch(
                'pat__rp_id__per__personal_addresses',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_personal_addresses'
            ),
            Prefetch(
                'pat__rp_id__household_set',
                queryset=Household.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_households'
            )
        ).order_by('created_at')

        # Track if any filter is applied
        filters_applied = False
        original_count = queryset.count()

        # Combined search (child/patient name, family number, and sitio)
        search_query = self.request.query_params.get('search', '').strip()
        sitio_search = self.request.query_params.get('sitio', '').strip()
        
        # Combine search and sitio parameters
        combined_search_terms = []
        if search_query and len(search_query) >= 3:
            combined_search_terms.append(search_query)
        if sitio_search:
            combined_search_terms.append(sitio_search)
        
        if combined_search_terms:
            filters_applied = True
            combined_search = ','.join(combined_search_terms)
            queryset = apply_search_filter_to_body_measurement(queryset, combined_search)
            if queryset.count() == 0 and original_count > 0:
                return BodyMeasurement.objects.none()

        # Nutritional status search
        nutritional_search = self.request.query_params.get('nutritional_status', '').strip()
        if nutritional_search:
            filters_applied = True
            queryset = apply_nutritional_search_to_body_measurement(queryset, nutritional_search)
            if queryset.count() == 0 and original_count > 0:
                return BodyMeasurement.objects.none()

        # Age range filter
        age_range = self.request.query_params.get('age_range', '').strip()
        if age_range:
            filters_applied = True
            queryset = apply_age_filter_to_body_measurement(queryset, age_range)
            if not queryset and original_count > 0:
                return BodyMeasurement.objects.none()

        return queryset

    def format_body_measurement_report_data(self, data, queryset_objects, month=None):
        """Format BodyMeasurement data for report output"""
        report_data = []
        
        if queryset_objects:
            for i, entry in enumerate(data):
                try:
                    bm_obj = queryset_objects[i]
                    pat = entry.get('patient_details', {})
                    # Get child name from pat_details.personal_info
                    pat_details = entry.get('pat_details', {})
                    personal_info = pat_details.get('personal_info', {})
                    
                    child_fname = personal_info.get('per_fname', '')
                    child_mname = personal_info.get('per_mname', '')
                    child_lname = personal_info.get('per_lname', '')
                    child_name = f"{child_fname} {child_mname} {child_lname}".strip()

                    
                    # Get address information for both residents and transients
                    address, sitio, is_transient = get_patient_address(bm_obj.pat)

                    # Get patient's date of birth, sex, and created_at date
                    pat_obj = bm_obj.pat
                    dob = None
                    sex = None
                    
                    if pat_obj.pat_type == 'Resident' and hasattr(pat_obj, 'rp_id') and pat_obj.rp_id:
                        dob = pat_obj.rp_id.per.per_dob
                        sex = pat_obj.rp_id.per.per_sex
                    elif pat_obj.pat_type == 'Transient' and hasattr(pat_obj, 'trans_id') and pat_obj.trans_id:
                        dob = pat_obj.trans_id.tran_dob
                        sex = pat_obj.trans_id.tran_sex
                    
                    # Get created_at date
                    created_at = bm_obj.created_at
                    
                    # Calculate age in months
                    age_in_months = calculate_age_in_months(dob, created_at)

                    # Get household number using the same logic as PatientSerializer
                    household_no = get_household_no(pat_obj)

                    # Get parents information using the same logic as PatientSerializer
                    parents = get_parents_info(pat_obj)

                    # Format nutritional status (direct from the object)
                    nutritional_status = {
                        'wfa': bm_obj.wfa,
                        'lhfa': bm_obj.lhfa,
                        'wfl': bm_obj.wfl,
                        'muac': bm_obj.muac,
                        'edema': bm_obj.edemaSeverity,
                        'muac_status': bm_obj.muac_status
                    }

                    report_entry = {
                        'household_no': household_no,
                        'child_name': child_name,
                        'sex': sex,
                        'date_of_birth': dob,
                        'age_in_months': age_in_months,
                        'parents': parents,
                        'address': address,
                        'sitio': sitio,
                        'transient': is_transient,
                        'date_of_weighing': entry.get('created_at', '')[:10],
                        'age_at_weighing': age_in_months,
                        'weight': entry.get('weight'),
                        'height': entry.get('height'),
                        'nutritional_status': nutritional_status,
                        'type_of_feeding': 'N/A'
                    }

                    report_data.append(report_entry)
                except Exception as e:
                    print(f"Error formatting report entry {i}: {e}")
                    continue

        result = {
            'total_entries': len(report_data),
            'report_data': report_data
        }
        
        if month:
            result['month'] = month
            
        return result

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            formatted_data = self.format_body_measurement_report_data(serializer.data, page, self.kwargs['month'])
            return self.get_paginated_response(formatted_data)

        serializer = self.get_serializer(queryset, many=True)
        formatted_data = self.format_body_measurement_report_data(serializer.data, queryset, self.kwargs['month'])
        return Response(formatted_data)