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
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import *
from apps.childhealthservices.serializers import NutritionalStatusSerializerBase

class YearlyOPTChildHealthSummariesAPIView(APIView):
    """
    API View to get yearly summaries of nutritional status records for children aged 0-23 months
    Returns years with record counts for yearly tracking
    Only counts the LATEST records per child in each year
    Filters automatically to children aged 0-23 months
    Only includes residents (excludes transients)
    """
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            # Search query (year)
            search_query = request.GET.get('search', '').strip()

            # Get all distinct years from the database
            years_data = NutritionalStatus.objects.dates('created_at', 'year', order='DESC')
            
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

        # Get latest records for the year - only residents
        yearly_latest = NutritionalStatus.objects.filter(
            pat=OuterRef('pat'),  # Changed to use pat instead of complex path
            created_at__range=(start_date, end_date),
            pat__pat_type='Resident'  # Only residents
        ).order_by('-created_at').values('nutstat_id')[:1]

        # Get the actual records
        yearly_records = NutritionalStatus.objects.filter(
            nutstat_id__in=Subquery(yearly_latest)
        ).select_related(
            'pat', 'pat__rp_id', 'pat__rp_id__per'  # Simplified relationships
        )

        def filter_children_by_age(records):
            ids = set()
            for record in records:
                pat = record.pat
                dob = None
                
                # Only residents are included, so we only check resident data
                if pat.pat_type == 'Resident' and hasattr(pat, 'rp_id') and pat.rp_id:
                    dob = pat.rp_id.per.per_dob
                
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
    Returns each child's monthly measurements (Jan-Dec) for children aged 0-23 months
    Only includes residents (excludes transients)
    """
    serializer_class = NutritionalStatusSerializerBase
    pagination_class = StandardResultsPagination

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

    def get_queryset(self):
        year = self.kwargs.get('year')
        try:
            year = int(year)
        except ValueError:
            return NutritionalStatus.objects.none()

        start_date = datetime(year, 1, 1)
        end_date = datetime(year, 12, 31, 23, 59, 59)

        # Get all records for the year (not just latest per child) - only residents
        records = NutritionalStatus.objects.filter(
            created_at__range=(start_date, end_date),
            pat__pat_type='Resident'  # Only residents
        ).select_related(
            'bm', 'pat', 'pat__rp_id', 'pat__rp_id__per'
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
        
        for record in records:
            if record.created_at:
                pat = record.pat
                dob = None
                
                # Only residents are included
                if pat.pat_type == 'Resident' and hasattr(pat, 'rp_id') and pat.rp_id:
                    dob = pat.rp_id.per.per_dob

                age_months = self._calculate_age_in_months(dob, record.created_at)
                
                # Filter for children aged 0-23 months (changed from 0-71)
                if 0 <= age_months <= 23:  # Age range 0-23 months
                    child_id = pat.pat_id
                    if child_id not in seen_children:
                        seen_children.add(child_id)
                    filtered_records.append(record)

        return self._apply_filters(filtered_records)

    def _apply_filters(self, records):
        # Track if any filter is applied
        filters_applied = False
        original_count = len(records)

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
            records = self._apply_search_filter(records, combined_search)
            if len(records) == 0 and original_count > 0:
                return []

        # Nutritional status filter
        nutritional_search = self.request.query_params.get('nutritional_status', '').strip()
        if nutritional_search:
            filters_applied = True
            records = self._apply_nutritional_search(records, nutritional_search)
            if len(records) == 0 and original_count > 0:
                return []

        return records

    def _apply_search_filter(self, records, search_query):
        """Search by child/patient name, family number, and sitio - only residents now"""
        search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return records

        filtered_records = []
        
        for record in records:
            pat = record.pat
            match_found = False
            
            for term in search_terms:
                # Check child name - only residents now
                if pat.pat_type == 'Resident' and hasattr(pat, 'rp_id') and pat.rp_id:
                    per = pat.rp_id.per
                    if (term.lower() in per.per_fname.lower() or 
                        term.lower() in per.per_mname.lower() or 
                        term.lower() in per.per_lname.lower()):
                        match_found = True
                        break
                
                # Check family number (adjust if you have this data)
                # family_no = ... # Add logic if you have family number data
                
                # Check sitio
                address, sitio, is_transient = ChildHealthReportUtils.get_patient_address(pat)
                if sitio and term.lower() in sitio.lower():
                    match_found = True
                    break
            
            if match_found:
                filtered_records.append(record)

        return filtered_records

    def _apply_nutritional_search(self, records, search_query):
        """Search by nutritional status"""
        search_terms = [term.strip().lower() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return records
        
        filtered_records = []
        for record in records:
            for term in search_terms:
                if (record.wfa and term in record.wfa.lower()) or \
                   (record.lhfa and term in record.lhfa.lower()) or \
                   (record.wfl and term in record.wfl.lower()) or \
                   (record.muac_status and term in record.muac_status.lower()):
                    filtered_records.append(record)
                    break
        return filtered_records

    def _format_monthly_report_data(self, data, queryset_objects=None):
        children_data = {}
        
        if queryset_objects:
            # Initialize month template
            month_template = {
                'measurement_exists': False,
                'date_of_weighing': None,
                'age_at_weighing': None,
                'weight': None,
                'height': None,
                'nutritional_status': None,
                'type_of_feeding': None
            }

            for i, entry in enumerate(data):
                try:
                    ns_obj = queryset_objects[i]
                    pat = entry.get('patient_details', {})

                    # Get child ID for grouping
                    child_id = ns_obj.pat.pat_id

                    # Initialize child data if not exists
                    if child_id not in children_data:
                        address, sitio, is_transient = ChildHealthReportUtils.get_patient_address(ns_obj.pat)

                        # Get patient's date of birth
                        pat_obj = ns_obj.pat
                        dob = None
                        if pat_obj.pat_type == 'Resident' and hasattr(pat_obj, 'rp_id') and pat_obj.rp_id:
                            dob = pat_obj.rp_id.per.per_dob

                        children_data[child_id] = {
                            'child_id': child_id,
                            'household_no': 'N/A',  # Adjust if you have this data
                            'child_name': f"{pat.get('first_name', '')} {pat.get('middle_name', '')} {pat.get('last_name', '')}",
                            'sex': pat.get('gender', ''),
                            'date_of_birth': pat.get('date_of_birth', ''),
                            'parents': {},  # Adjust if you have parent data
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
                    if ns_obj.created_at:
                        month = ns_obj.created_at.month
                        month_name = [
                            'january', 'february', 'march', 'april', 'may', 'june',
                            'july', 'august', 'september', 'october', 'november', 'december'
                        ][month - 1]

                        # Calculate age at weighing
                        dob = None
                        pat_obj = ns_obj.pat
                        if pat_obj.pat_type == 'Resident' and hasattr(pat_obj, 'rp_id') and pat_obj.rp_id:
                            dob = pat_obj.rp_id.per.per_dob
                        
                        age_months = self._calculate_age_in_months(dob, ns_obj.created_at)

                        # Format nutritional status
                        nutritional_status = {
                            'wfa': ns_obj.wfa,
                            'lhfa': ns_obj.lhfa,
                            'wfl': ns_obj.wfl,
                            'muac': ns_obj.muac,
                            'edema': ns_obj.edemaSeverity,
                            'muac_status': ns_obj.muac_status
                        }

                        # Update monthly data
                        children_data[child_id]['monthly_data'][month_name] = {
                            'measurement_exists': True,
                            'date_of_weighing': entry.get('created_at', '')[:10],
                            'age_at_weighing': age_months,
                            'weight': entry.get('bm_details', {}).get('weight'),
                            'height': entry.get('bm_details', {}).get('height'),
                            'nutritional_status': nutritional_status,
                            'type_of_feeding': 'N/A'  # Adjust if you have this data
                        }

                except Exception as e:
                    print(f"Error formatting report entry {i}: {e}")
                    continue

        # Convert to list format
        children_list = list(children_data.values())
        
        return {
            'year': self.kwargs['year'],
            'children_data': children_list
        }

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get unique child IDs for pagination count
        child_ids = set()
        for record in queryset:
            child_id = record.pat.pat_id
            child_ids.add(child_id)
        
        # Paginate based on unique children
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(list(child_ids), request)
        
        if page is not None:
            # Get all records for the children in this page
            records_for_page = [record for record in queryset 
                             if record.pat.pat_id in page]
            
            serializer = self.get_serializer(records_for_page, many=True)
            return paginator.get_paginated_response(
                self._format_monthly_report_data(serializer.data, records_for_page)
            )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(self._format_monthly_report_data(serializer.data, queryset))