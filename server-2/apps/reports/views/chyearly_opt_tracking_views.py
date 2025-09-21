# Standard library imports
from datetime import datetime, timedelta
from django.db.models import Q, Prefetch, OuterRef, Subquery
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

# Local app imports
from apps.childhealthservices.models import *
from apps.childhealthservices.serializers import *
from ..utils import *
from apps.patientrecords.models import *
from apps.patientrecords.serializers.bodymesurement_serializers import BodyMeasurementSerializer
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import *


class YearlyOPTChildHealthSummariesAPIView(APIView):
    """
    API View to get yearly summaries of nutritional status records for children aged 0-23 months
    Returns years with record counts for yearly tracking
    Only counts the LATEST records per child in each year
    Filters automatically to children aged 0-23 months
    Includes both residents and transients
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
                    'yearly_count': counts['yearly']
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
        end_date = datetime(year, 12, 31, 23, 59, 59)

        # Get latest records for the year - both residents and transients
        yearly_latest = BodyMeasurement.objects.filter(
            is_opt=True,
            pat=OuterRef('pat'),
            created_at__range=(start_date, end_date)
            # Removed pat__pat_type='Resident' filter
        ).order_by('-created_at').values('bm_id')[:1]

        # Get the actual records
        yearly_records = BodyMeasurement.objects.filter(
            bm_id__in=Subquery(yearly_latest)
        ).select_related(
            'pat', 'pat__rp_id', 'pat__rp_id__per', 'pat__trans_id'  # Added pat__trans_id
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
                
                # Filter for children aged 0-23 months (changed from 0-71)
                if 0 <= age_months <= 23:  # Age range 0-23 months
                    ids.add(pat.pat_id)
            return ids

        yearly_ids = filter_children_by_age(yearly_records)

        return {
            'yearly': len(yearly_ids),
            'total': len(yearly_ids)
        }

class YearlyMonthlyOPTChildHealthReportAPIView(generics.ListAPIView):
    """
    API View to get monthly nutritional status report for a specific year
    Returns each child's LATEST monthly measurements (Jan-Dec) for children aged 0-23 months
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
        end_date = datetime(year, 12, 31, 23, 59, 59)

        # Get the LATEST record for each child in each month
        latest_per_month_subquery = BodyMeasurement.objects.filter(
            pat=OuterRef('pat'),
            created_at__year=year,
            created_at__month=OuterRef('created_at__month'),
            is_opt=True
        ).order_by('-created_at').values('bm_id')[:1]

        # Get all records for the year, but only the latest per month per child
        queryset = BodyMeasurement.objects.filter(
            created_at__range=(start_date, end_date),
            is_opt=True,
            bm_id=Subquery(latest_per_month_subquery)
        ).select_related(
            'pat', 'pat__rp_id', 'pat__rp_id__per', 'pat__trans_id'
        ).prefetch_related(
            Prefetch(
                'pat__rp_id__per__personaladdress_set',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_personal_addresses'
            ),
            Prefetch(
                'pat__rp_id__household_set',
                queryset=Household.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_households'
            )
        ).order_by('pat', 'created_at')

        # Filter to only include children aged 0-23 months at any point during the year
        filtered_records = []
        seen_children = set()
        
        for record in queryset:
            if record.created_at:
                pat = record.pat
                dob = None
                
                # Handle both residents and transients
                if pat.pat_type == 'Resident' and hasattr(pat, 'rp_id') and pat.rp_id:
                    dob = pat.rp_id.per.per_dob
                elif pat.pat_type == 'Transient' and hasattr(pat, 'trans_id') and pat.trans_id:
                    dob = pat.trans_id.tran_dob

                age_months = calculate_age_in_months(dob, record.created_at)
                
                # Filter for children aged 0-23 months
                if 0 <= age_months <= 23:
                    child_id = pat.pat_id
                    if child_id not in seen_children:
                        seen_children.add(child_id)
                    filtered_records.append(record)

        # Convert back to queryset for filtering
        record_ids = [record.bm_id for record in filtered_records]
        filtered_queryset = BodyMeasurement.objects.filter(bm_id__in=record_ids)
        
        # Apply search filters using the reusable function
        search_query = self.request.query_params.get('search', '').strip()
        sitio_search = self.request.query_params.get('sitio', '').strip()
        
        # Combine search and sitio parameters
        combined_search_terms = []
        if search_query and len(search_query) >= 3:
            combined_search_terms.append(search_query)
        if sitio_search:
            combined_search_terms.append(sitio_search)
        
        if combined_search_terms:
            combined_search = ','.join(combined_search_terms)
            filtered_queryset = apply_search_filter_to_body_measurement(filtered_queryset, combined_search)

        # Nutritional status filter
        nutritional_search = self.request.query_params.get('nutritional_status', '').strip()
        if nutritional_search:
            filtered_queryset = apply_nutritional_search_to_body_measurement(filtered_queryset, nutritional_search)

        return filtered_queryset

    def format_monthly_report_data(self, data, queryset_objects, year=None):
        """Format BodyMeasurement data for monthly report output"""
        children_data = {}
        
        if queryset_objects:
            # Initialize month template
            month_template = {
                'measurement_exists': False,
                'date_of_weighing': None,
                'age_at_weighing': None,
                'weight': None,
                'height': None,
                'body_measurement': None,
                'type_of_feeding': None
            }

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

                    # Initialize child data if not exists
                    if child_id not in children_data:
                        # Use utility function for address
                        address, sitio, is_transient = get_patient_address(bm_obj.pat)

                        # Get patient's date of birth and sex
                        pat_obj = bm_obj.pat
                        dob = None
                        sex = None
                        
                        if pat_obj.pat_type == 'Resident' and hasattr(pat_obj, 'rp_id') and pat_obj.rp_id:
                            dob = pat_obj.rp_id.per.per_dob
                            sex = pat_obj.rp_id.per.per_sex
                        elif pat_obj.pat_type == 'Transient' and hasattr(pat_obj, 'trans_id') and pat_obj.trans_id:
                            dob = pat_obj.trans_id.tran_dob
                            sex = pat_obj.trans_id.tran_sex

                        # Use utility function for household number
                        household_no = get_household_no(pat_obj)

                        # Use utility function for parents information
                        parents = get_parents_info(pat_obj)

                        children_data[child_id] = {
                            'child_id': child_id,
                            'household_no': household_no,
                            'child_name': child_name,
                            'sex': sex,
                            'date_of_birth': dob,
                            'parents': parents,
                            'address': address,
                            'sitio': sitio,
                            'transient': is_transient,
                            'monthly_data': {
                                'january': month_template.copy(),
                                'february': month_template.copy(),
                                'march': month_template.copy(),
                                'april': month_template.copy(),
                                'may': month_template.copy(),
                                'june': month_template.copy(),
                                'july': month_template.copy(),
                                'august': month_template.copy(),
                                'september': month_template.copy(),
                                'october': month_template.copy(),
                                'november': month_template.copy(),
                                'december': month_template.copy()
                            }
                        }

                    # Get measurement month
                    if bm_obj.created_at:
                        month = bm_obj.created_at.month
                        month_name = [
                            'january', 'february', 'march', 'april', 'may', 'june',
                            'july', 'august', 'september', 'october', 'november', 'december'
                        ][month - 1]

                        # Calculate age at weighing
                        dob = None
                        pat_obj = bm_obj.pat
                        if pat_obj.pat_type == 'Resident' and hasattr(pat_obj, 'rp_id') and pat_obj.rp_id:
                            dob = pat_obj.rp_id.per.per_dob
                        elif pat_obj.pat_type == 'Transient' and hasattr(pat_obj, 'trans_id') and pat_obj.trans_id:
                            dob = pat_obj.trans_id.tran_dob
                        
                        age_months = calculate_age_in_months(dob, bm_obj.created_at)

                        # Format nutritional status
                        body_measurement = {
                            'wfa': bm_obj.wfa,
                            'lhfa': bm_obj.lhfa,
                            'wfl': bm_obj.wfl,
                            'muac': bm_obj.muac,
                            'edema': bm_obj.edemaSeverity,
                            'muac_status': bm_obj.muac_status,
                            'remarks': bm_obj.remarks
                        }

                        # Only update if this is the latest record for this month
                        # (the query already ensures we only get latest, but double-check)
                        current_month_data = children_data[child_id]['monthly_data'][month_name]
                        if not current_month_data['measurement_exists'] or (
                            current_month_data['date_of_weighing'] and 
                            entry.get('created_at', '')[:10] > current_month_data['date_of_weighing']
                        ):
                            children_data[child_id]['monthly_data'][month_name] = {
                                'measurement_exists': True,
                                'date_of_weighing': entry.get('created_at', '')[:10],
                                'age_at_weighing': age_months,
                                'weight': entry.get('weight'),
                                'height': entry.get('height'),
                                'body_measurement': body_measurement,
                                'type_of_feeding': 'N/A'
                            }

                except Exception as e:
                    print(f"Error formatting report entry {i}: {e}")
                    continue

        # Convert to list format
        children_list = list(children_data.values())
        
        result = {
            'children_data': children_list
        }
        
        if year:
            result['year'] = year
            
        return result

    def list(self, request, *args, **kwargs):
        # Get the filtered queryset (this already has all the filters applied)
        filtered_queryset = self.filter_queryset(self.get_queryset())
        
        # Get unique child IDs from the FILTERED queryset
        child_ids = set()
        for record in filtered_queryset:
            child_id = record.pat.pat_id
            child_ids.add(child_id)
        
        # Paginate based on unique children
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(list(child_ids), request)
        
        if page is not None:
            # Get only the FILTERED records for the children in this page
            records_for_page = [record for record in filtered_queryset 
                             if record.pat.pat_id in page]
            
            serializer = self.get_serializer(records_for_page, many=True)
            formatted_data = self.format_monthly_report_data(serializer.data, records_for_page, self.kwargs['year'])
            return paginator.get_paginated_response(formatted_data)
        
        serializer = self.get_serializer(filtered_queryset, many=True)
        formatted_data = self.format_monthly_report_data(serializer.data, filtered_queryset, self.kwargs['year'])
        return Response(formatted_data)