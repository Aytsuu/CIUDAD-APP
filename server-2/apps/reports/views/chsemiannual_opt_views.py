# Standard library imports
from datetime import datetime, timedelta
from django.db.models import (Q, Prefetch)
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import OuterRef, Subquery


# Local app imports
from apps.childhealthservices.models import *
from apps.childhealthservices.serializers import *
from ..utils import *
from apps.patientrecords.models import *
from apps.patientrecords.serializers.bodymesurement_serializers import BodyMeasurementSerializer
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import *


class YearlySemiOPTChildHealthSummariesAPIView(APIView):
    """
    API View to get yearly summaries of nutritional status records
    Returns years with record counts for semi-annual tracking
    Only counts the LATEST records per child in each semi-annual period
    Filters automatically to children aged 0–71 months
    Includes both residents and transients
    Only counts records where is_opt==TRUE
    """
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            # Search query (year)
            search_query = request.GET.get('search', '').strip()

            # Get all distinct years from the database
            years_data = BodyMeasurement.objects.dates('created_at', 'year', order='DESC')
            
            formatted_data = []
            for year_date in years_data:
                year = year_date.year
                year_str = str(year)
                year_name = f"Year {year}"

                # Apply search filter if provided
                if search_query and search_query not in year_str:
                    continue

                # Count latest records for this year (with age filter)
                counts = self._get_latest_records_count_for_year(year)

                formatted_data.append({
                    'year': year_str,
                    'year_name': year_name,
                    'total_records': counts['total'],
                    'first_semi_count': counts['first_semi'],
                    'second_semi_count': counts['second_semi']
                })

            # Pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(formatted_data, request)
            if page is not None:
                return paginator.get_paginated_response({
                    'success': True,
                    'data': page,
                    'total_years': len(formatted_data)
                })

            return Response({
                'success': True,
                'data': formatted_data,
                'total_years': len(formatted_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _calculate_age_in_months(self, dob, reference_date):
        try:
            if not dob or not reference_date:
                return 0
            if hasattr(reference_date, 'date'):
                reference_date = reference_date.date()
            if hasattr(dob, 'date'):
                dob = dob.date()
            age_months = (reference_date.year - dob.year) * 12 + (reference_date.month - dob.month)
            if reference_date.day < dob.day:
                age_months -= 1
            return max(0, age_months)
        except:
            return 0

    def _get_latest_records_count_for_year(self, year):
        start_date = datetime(year, 1, 1)
        mid_date = datetime(year, 7, 31, 23, 59, 59)
        end_date = datetime(year, 12, 31, 23, 59, 59)

        # Get latest records for first semester (Jan-Jul) - both residents and transients
        # Added is_opt=True filter
        first_semi_latest = BodyMeasurement.objects.filter(
            pat=OuterRef('pat'),
            created_at__range=(start_date, mid_date),
            is_opt=True  # Filter for OPT records only
        ).order_by('-created_at').values('bm_id')[:1]

        # Get latest records for second semester (Aug-Dec) - both residents and transients
        # Added is_opt=True filter
        second_semi_latest = BodyMeasurement.objects.filter(
            pat=OuterRef('pat'),
            created_at__range=(mid_date + timedelta(seconds=1), end_date),
            is_opt=True  # Filter for OPT records only
        ).order_by('-created_at').values('bm_id')[:1]

        # Get the actual records for first semester
        # Added is_opt=True filter
        first_semi_records = BodyMeasurement.objects.filter(
            bm_id__in=Subquery(first_semi_latest),
            is_opt=True  # Filter for OPT records only
        ).select_related(
            'pat', 'pat__rp_id', 'pat__rp_id__per', 'pat__trans_id'
        )

        # Get the actual records for second semester
        # Added is_opt=True filter
        second_semi_records = BodyMeasurement.objects.filter(
            bm_id__in=Subquery(second_semi_latest),
            is_opt=True  # Filter for OPT records only
        ).select_related(
            'pat', 'pat__rp_id', 'pat__rp_id__per', 'pat__trans_id'
        )

        def filter_children_by_age(records):
            ids = set()
            for record in records:
                pat = record.pat
                dob = None
                
                # Handle both residents and transients
                if pat.pat_type == 'Resident' and hasattr(pat, 'rp_id') and pat.rp_id:
                    dob = pat.rp_id.per.per_dob
                elif pat.pat_type == 'Transient' and hasattr(pat, 'trans_id') and pat.trans_id:
                    dob = pat.trans_id.tran_dob
                
                age_months = self._calculate_age_in_months(dob, record.created_at)
                
                # Filter for children aged 0-71 months
                if 0 <= age_months <= 71:
                    ids.add(pat.pat_id)
            return ids

        first_ids = filter_children_by_age(first_semi_records)
        second_ids = filter_children_by_age(second_semi_records)

        return {
            'first_semi': len(first_ids),
            'second_semi': len(second_ids),
            'total': len(first_ids | second_ids)  # unique children across both periods
        }
        
        
class SemiAnnualOPTChildHealthReportAPIView(generics.ListAPIView):
    """
    API View to get semi-annual nutritional status report for a specific year
    Automatically filters to children aged 0–71 months
    Includes both residents and transients
    """
    serializer_class = BodyMeasurementSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        year = self.kwargs.get('year')
        try:
            year = int(year)
        except ValueError:
            return BodyMeasurement.objects.none()

        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1) - timedelta(microseconds=1)

        # Get latest records for first semester (Jan-Jul) - both residents and transients
        first_semi_latest = BodyMeasurement.objects.filter(
            pat=OuterRef('pat'),
            is_opt=True,
            created_at__gte=start_date,
            created_at__month__lte=7,
            created_at__year=year
        ).order_by('-created_at').values('bm_id')[:1]

        # Get latest records for second semester (Aug-Dec) - both residents and transients
        second_semi_latest = BodyMeasurement.objects.filter(
            pat=OuterRef('pat'),
            is_opt=True,
            created_at__month__gte=8,
            created_at__year=year,
            created_at__lte=end_date
        ).order_by('-created_at').values('bm_id')[:1]

        # Get all latest records
        queryset = BodyMeasurement.objects.filter(
            Q(bm_id=Subquery(first_semi_latest)) |
            Q(bm_id=Subquery(second_semi_latest))
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
        ).order_by('pat', '-created_at')

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

        # Age range filter (0-71 months default, but can be overridden)
        age_range = self.request.query_params.get('age_range', '0-71').strip()
        if age_range:
            filters_applied = True
            queryset = apply_age_filter_to_body_measurement(queryset, age_range)
            if not queryset and original_count > 0:
                return BodyMeasurement.objects.none()

        # Semi-period filter
        semi_period = self.request.query_params.get('semi_period', '').strip()
        if semi_period and semi_period in ['1st', '2nd']:
            # Filter based on month
            if semi_period == '1st':
                queryset = queryset.filter(created_at__month__lte=7)
            else:
                queryset = queryset.filter(created_at__month__gte=8)

        return queryset

    def format_semi_annual_report_data(self, data, queryset_objects, year=None):
        """Format BodyMeasurement data for semi-annual report output"""
        children_data = {}  # Group by child_id
        
        if queryset_objects:
            for i, entry in enumerate(data):
                try:
                    bm_obj = queryset_objects[i]

                    # Get child ID for grouping
                    child_id = bm_obj.pat.pat_id
                    
                    # Get child name from pat_details.personal_info
                    pat_details = entry.get('pat_details', {})
                    personal_info = pat_details.get('personal_info', {})
                    
                    child_fname = personal_info.get('per_fname', '')
                    child_mname = personal_info.get('per_mname', '')
                    child_lname = personal_info.get('per_lname', '')
                    child_name = f"{child_fname} {child_mname} {child_lname}".strip()

                    # Use utility function for address
                    address, sitio, is_transient = get_patient_address(bm_obj.pat)

                    # Get patient's date of birth and created_at date
                    pat_obj = bm_obj.pat
                    dob = None
                    sex = None
                    
                    if pat_obj.pat_type == 'Resident' and hasattr(pat_obj, 'rp_id') and pat_obj.rp_id:
                        dob = pat_obj.rp_id.per.per_dob
                        sex = pat_obj.rp_id.per.per_sex
                    elif pat_obj.pat_type == 'Transient' and hasattr(pat_obj, 'trans_id') and pat_obj.trans_id:
                        dob = pat_obj.trans_id.tran_dob
                        sex = pat_obj.trans_id.tran_sex
                    
                    # Use utility function for age calculation
                    age_in_months = calculate_age_in_months(dob, bm_obj.created_at)

                    # Use utility function for household number
                    household_no = get_household_no(pat_obj)

                    # Use utility function for parents information
                    parents = get_parents_info(pat_obj)

                    # Format nutritional status
                    nutritional_status = {
                        'wfa': bm_obj.wfa,
                        'lhfa': bm_obj.lhfa,
                        'wfl': bm_obj.wfl,
                        'muac': bm_obj.muac,
                        'edema': bm_obj.edemaSeverity,
                        'muac_status': bm_obj.muac_status
                    }

                    # Determine semi-annual period
                    month = bm_obj.created_at.month
                    semi_period = '1st' if month <= 7 else '2nd'
                    semi_label = 'First Semi (Jan-Jul)' if month <= 7 else 'Second Semi (Aug-Dec)'

                    # Create weighing data for this semi-annual period
                    weighing_data = {
                        'date_of_weighing': entry.get('created_at', '')[:10],
                        'age_at_weighing': age_in_months,
                        'weight': entry.get('weight'),
                        'height': entry.get('height'),
                        'nutritional_status': nutritional_status,
                        'type_of_feeding': 'N/A'
                    }

                    # Initialize child data if not exists
                    if child_id not in children_data:
                        children_data[child_id] = {
                            'child_id': child_id,
                            'household_no': household_no,
                            'child_name': child_name,
                            'sex': sex,
                            'date_of_birth': dob,
                            'age_in_months': age_in_months,
                            'parents': parents,
                            'address': address,
                            'sitio': sitio,
                            'transient': is_transient,
                            'first_semi_annual': None,
                            'second_semi_annual': None,
                            'was_weighed': False
                        }

                    # Mark as weighed in at least one period
                    children_data[child_id]['was_weighed'] = True
                    
                    # Add weighing data to appropriate semi-annual period
                    if semi_period == '1st':
                        children_data[child_id]['first_semi_annual'] = weighing_data
                    elif semi_period == '2nd':
                        children_data[child_id]['second_semi_annual'] = weighing_data

                except Exception as e:
                    print(f"Error formatting report entry {i}: {e}")
                    continue

        # Filter to only include children who were actually weighed in at least one period
        children_list = [child for child in children_data.values() if child['was_weighed']]
        
        # Calculate summary statistics
        first_semi_count = sum(1 for child in children_list if child['first_semi_annual'] is not None)
        second_semi_count = sum(1 for child in children_list if child['second_semi_annual'] is not None)
        both_periods_count = sum(1 for child in children_list 
                            if child['first_semi_annual'] and child['second_semi_annual'])

        result = {
            'summary': {
                'total_children': len(children_list),
                'children_with_first_semi': first_semi_count,
                'children_with_second_semi': second_semi_count,
                'children_with_both_periods': both_periods_count
            },
            'children_data': children_list
        }
        
        if year:
            result['year'] = year
            
        return result

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # For semi-annual reports, we need to handle pagination differently
        # since we group by children, not individual records
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            formatted_data = self.format_semi_annual_report_data(serializer.data, page, self.kwargs['year'])
            return self.get_paginated_response(formatted_data)
        
        serializer = self.get_serializer(queryset, many=True)
        formatted_data = self.format_semi_annual_report_data(serializer.data, queryset, self.kwargs['year'])
        return Response(formatted_data)