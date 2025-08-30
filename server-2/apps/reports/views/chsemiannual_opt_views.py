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
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import *


class YearlyOPTChildHealthSummariesAPIView(APIView):
    """
    API View to get yearly summaries of child health records
    Returns years with record counts for semi-annual tracking
    Only counts the LATEST records per child in each semi-annual period
    Filters automatically to children aged 0–71 months
    """
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            # Search query (year)
            search_query = request.GET.get('search', '').strip()

            # Get all distinct years from the database
            years_data = ChildHealthVitalSigns.objects.dates('bm__created_at', 'year', order='DESC')
            
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

        first_semi_latest = ChildHealthVitalSigns.objects.filter(
            chhist__chrec__patrec__pat_id=OuterRef('chhist__chrec__patrec__pat_id'),
            bm__created_at__range=(start_date, mid_date),
            bm__weight__isnull=False
        ).order_by('-bm__created_at').values('vital_id')[:1]

        second_semi_latest = ChildHealthVitalSigns.objects.filter(
            chhist__chrec__patrec__pat_id=OuterRef('chhist__chrec__patrec__pat_id'),
            bm__created_at__range=(mid_date + timedelta(seconds=1), end_date),
            bm__weight__isnull=False
        ).order_by('-bm__created_at').values('vital_id')[:1]

        first_semi_records = ChildHealthVitalSigns.objects.filter(
            vital_id__in=Subquery(first_semi_latest)
        ).select_related(
            'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec',
            'chhist__chrec__patrec__pat_id', 'chhist__chrec__patrec__pat_id__rp_id',
            'chhist__chrec__patrec__pat_id__rp_id__per', 'chhist__chrec__patrec__pat_id__trans_id'
        )

        second_semi_records = ChildHealthVitalSigns.objects.filter(
            vital_id__in=Subquery(second_semi_latest)
        ).select_related(
            'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec',
            'chhist__chrec__patrec__pat_id', 'chhist__chrec__patrec__pat_id__rp_id',
            'chhist__chrec__patrec__pat_id__rp_id__per', 'chhist__chrec__patrec__pat_id__trans_id'
        )

        def filter_children_by_age(records):
            ids = set()
            for record in records:
                pat_id = record.chhist.chrec.patrec.pat_id
                dob = None
                if pat_id.pat_type == 'Resident' and getattr(pat_id, 'rp_id', None):
                    dob = pat_id.rp_id.per.per_dob
                elif pat_id.pat_type == 'Transient' and getattr(pat_id, 'trans_id', None):
                    dob = pat_id.trans_id.tran_dob

                age_months = self._calculate_age_in_months(
                    dob, record.bm.created_at if record.bm else None
                )
                if 0 <= age_months <= 71:
                    ids.add(pat_id)
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
    API View to get semi-annual child health report for a specific year
    Automatically filters to children aged 0–71 months
    """
    serializer_class = OPTTrackingSerializer
    pagination_class = StandardResultsPagination

    def _calculate_age_in_months(self, dob, reference_date):
        """
        Calculate age in months based on date of birth and reference date (bm.created_at)
        Similar to how it's done in the supplements report
        """
        try:
            if not dob or not reference_date:
                return 0
            
            # Convert reference_date to date if it's datetime
            if hasattr(reference_date, 'date'):
                reference_date = reference_date.date()
            
            # Convert dob to date if it's datetime
            if hasattr(dob, 'date'):
                dob = dob.date()
                
            # Calculate age in months
            age_months = (reference_date.year - dob.year) * 12 + (reference_date.month - dob.month)
            
            # Adjust if the day hasn't been reached yet in the current month
            if reference_date.day < dob.day:
                age_months -= 1
                
            return max(0, age_months)  # Ensure non-negative age
            
        except (AttributeError, TypeError, ValueError) as e:
            print(f"Error calculating age: {e}")
            return 0

    def get_queryset(self):
        year = self.kwargs.get('year')
        try:
            year = int(year)
        except ValueError:
            return ChildHealthVitalSigns.objects.none()

        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1) - timedelta(microseconds=1)
        from django.db.models import OuterRef, Subquery

        first_semi_latest = ChildHealthVitalSigns.objects.filter(
            chhist__chrec__patrec__pat_id=OuterRef('chhist__chrec__patrec__pat_id'),
            bm__created_at__gte=start_date,
            bm__created_at__month__lte=7,
            bm__created_at__year=year
        ).order_by('-bm__created_at').values('vital_id')[:1]

        second_semi_latest = ChildHealthVitalSigns.objects.filter(
            chhist__chrec__patrec__pat_id=OuterRef('chhist__chrec__patrec__pat_id'),
            bm__created_at__month__gte=8,
            bm__created_at__year=year,
            bm__created_at__lte=end_date
        ).order_by('-bm__created_at').values('vital_id')[:1]

        # Get all records first, then filter by age
        latest_records = ChildHealthVitalSigns.objects.filter(
            Q(vital_id__in=Subquery(first_semi_latest)) |
            Q(vital_id__in=Subquery(second_semi_latest))
        ).select_related(
            'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec',
            'chhist__chrec__patrec__pat_id', 'chhist__chrec__patrec__pat_id__rp_id',
            'chhist__chrec__patrec__pat_id__rp_id__per', 'chhist__chrec__patrec__pat_id__trans_id'
        ).prefetch_related(
            'nutritional_status',
            Prefetch(
                'chhist__chrec__patrec__pat_id__rp_id__per__personaladdress_set',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_personal_addresses'
            ),
            Prefetch(
                'chhist__chrec__patrec__pat_id__rp_id__household_set',
                queryset=Household.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_households'
            )
        ).order_by('chhist__chrec__patrec__pat_id', '-bm__created_at')

        # Filter by age 0-71 months using BMI created_at date
        filtered_records = []
        seen_children = set()
        
        for record in latest_records:
            if record.bm and record.bm.created_at:
                # Get patient's date of birth
                pat_id = record.chhist.chrec.patrec.pat_id
                dob = None
                
                if pat_id.pat_type == 'Resident' and hasattr(pat_id, 'rp_id') and pat_id.rp_id:
                    dob = pat_id.rp_id.per.per_dob
                elif pat_id.pat_type == 'Transient' and hasattr(pat_id, 'trans_id') and pat_id.trans_id:
                    dob = pat_id.trans_id.tran_dob
                
                # Calculate age in months using BMI created_at date
                age_months = self._calculate_age_in_months(dob, record.bm.created_at)
                
                # Filter to only 0–71 months old
                if 0 <= age_months <= 71:
                    month = record.bm.created_at.month
                    record.semi_period = '1st' if month <= 7 else '2nd'
                    record.semi_label = 'First Semi (Jan-Jul)' if month <= 7 else 'Second Semi (Aug-Dec)'

                    child_id = pat_id.pat_id
                    
                    # Only add if we haven't seen this child yet (to avoid duplicates in pagination count)
                    if child_id not in seen_children:
                        seen_children.add(child_id)
                        # Add a marker to indicate this is the "primary" record for this child
                        record.is_primary_record = True
                        filtered_records.append(record)
                    else:
                        # Still add the record but mark it as secondary (for data collection)
                        record.is_primary_record = False
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

        nutritional_search = self.request.query_params.get('nutritional_status', '').strip()
        if nutritional_search:
            filters_applied = True
            records = self._apply_nutritional_search(records, nutritional_search)
            if len(records) == 0 and original_count > 0:
                return []

        semi_period = self.request.query_params.get('semi_period', '').strip()
        if semi_period and semi_period in ['1st', '2nd']:
            records = [r for r in records if getattr(r, 'semi_period', None) == semi_period]

        # Add age range filter similar to monthly report
        age_range = self.request.query_params.get('age_range', '').strip()
        if age_range:
            filters_applied = True
            records = self._apply_age_filter(records, age_range)
            if len(records) == 0 and original_count > 0:
                return []

        return records

    def _apply_age_filter(self, records, age_range):
        """Apply age range filter to records list"""
        try:
            min_age, max_age = map(int, age_range.split('-'))
            filtered_records = []
            for record in records:
                # Get patient's date of birth
                pat_id = record.chhist.chrec.patrec.pat_id
                dob = None
                
                if pat_id.pat_type == 'Resident' and hasattr(pat_id, 'rp_id') and pat_id.rp_id:
                    dob = pat_id.rp_id.per.per_dob
                elif pat_id.pat_type == 'Transient' and hasattr(pat_id, 'trans_id') and pat_id.trans_id:
                    dob = pat_id.trans_id.tran_dob
                
                # Get BM created_at date
                bm_created_at = record.bm.created_at if record.bm else None
                
                # Calculate age in months
                age_months = self._calculate_age_in_months(dob, bm_created_at)
                
                if min_age <= age_months <= max_age:
                    filtered_records.append(record)
            return filtered_records
        except ValueError:
            return records

    def _apply_search_filter(self, records, search_query):
        """Search by child/patient name, family number, and sitio"""
        search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return records

        filtered_records = []
        
        for record in records:
            pat_id = record.chhist.chrec.patrec.pat_id
            match_found = False
            
            for term in search_terms:
                # Check child name
                if pat_id.pat_type == 'Resident' and hasattr(pat_id, 'rp_id') and pat_id.rp_id:
                    per = pat_id.rp_id.per
                    if (term.lower() in per.per_fname.lower() or 
                        term.lower() in per.per_mname.lower() or 
                        term.lower() in per.per_lname.lower()):
                        match_found = True
                        break
                elif pat_id.pat_type == 'Transient' and hasattr(pat_id, 'trans_id') and pat_id.trans_id:
                    trans = pat_id.trans_id
                    if (term.lower() in trans.tran_fname.lower() or 
                        term.lower() in trans.tran_mname.lower() or 
                        term.lower() in trans.tran_lname.lower()):
                        match_found = True
                        break
                
                # Check family number
                family_no = record.chhist.chrec.family_no
                if family_no and term.lower() in family_no.lower():
                    match_found = True
                    break
                
                # Check sitio
                address, sitio, is_transient = ChildHealthReportUtils.get_patient_address(pat_id)
                if sitio and term.lower() in sitio.lower():
                    match_found = True
                    break
            
            if match_found:
                filtered_records.append(record)

        return filtered_records

    def _apply_nutritional_search(self, records, search_query):
        search_terms = [term.strip().lower() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return records
        filtered_records = []
        for record in records:
            if hasattr(record, 'nutritional_status') and record.nutritional_status.exists():
                ns = record.nutritional_status.first()
                for term in search_terms:
                    if (ns.wfa and term in ns.wfa.lower()) or \
                       (ns.lhfa and term in ns.lhfa.lower()) or \
                       (ns.wfl and term in ns.wfl.lower()) or \
                       (ns.muac_status and term in ns.muac_status.lower()):
                        filtered_records.append(record)
                        break
        return filtered_records

    def _format_report_data(self, data, queryset_objects=None):
        children_data = {}  # Group by child_id
        
        if queryset_objects:
            for i, entry in enumerate(data):
                try:
                    vs_obj = queryset_objects[i]
                    vs = entry['vital_signs']
                    chist = entry['chist_details']
                    patrec = chist['chrec_details']['patrec_details']['pat_details']

                    # Get child ID for grouping
                    child_id = vs_obj.chhist.chrec.patrec.pat_id.pat_id

                    address, sitio, is_transient = ChildHealthReportUtils.get_patient_address(
                        vs_obj.chhist.chrec.patrec.pat_id
                    )

                    # Get patient's date of birth and BM created_at date
                    pat_id = vs_obj.chhist.chrec.patrec.pat_id
                    dob = None
                    
                    if pat_id.pat_type == 'Resident' and hasattr(pat_id, 'rp_id') and pat_id.rp_id:
                        dob = pat_id.rp_id.per.per_dob
                    elif pat_id.pat_type == 'Transient' and hasattr(pat_id, 'trans_id') and pat_id.trans_id:
                        dob = pat_id.trans_id.tran_dob
                    
                    # Get BM created_at date
                    bm_created_at = vs_obj.bm.created_at if vs_obj.bm else None
                    
                    # Calculate age in months using the consistent method
                    age_in_months = self._calculate_age_in_months(dob, bm_created_at)

                    # Format parents information
                    parents = {}
                    family_info = patrec.get('family_head_info', {})
                    if family_info.get('has_mother'):
                        mother = family_info['family_heads']['mother']['personal_info']
                        parents['mother'] = f"{mother['per_fname']} {mother['per_mname']} {mother['per_lname']}"
                    if family_info.get('has_father'):
                        father = family_info['family_heads']['father']['personal_info']
                        parents['father'] = f"{father['per_fname']} {father['per_mname']} {father['per_lname']}"

                    # Format nutritional status
                    nutritional_status = {}
                    if vs.get('nutritional_status'):
                        ns = vs['nutritional_status']
                        nutritional_status = {
                            'wfa': ns.get('wfa'),
                            'lhfa': ns.get('lhfa'),
                            'wfl': ns.get('wfl'),
                            'muac': ns.get('muac'),
                            'edema': ns.get('edemaSeverity'),
                            'muac_status': ns.get('muac_status')
                        }

                    # Get semi-annual information
                    semi_period = getattr(vs_obj, 'semi_period', 'Unknown')

                    # Create weighing data for this semi-annual period
                    weighing_data = {
                        'date_of_weighing': vs['bm_details']['created_at'][:10] if vs.get('bm_details') else None,
                        'age_at_weighing': age_in_months,  # Use calculated age instead of vs['bm_details']['age']
                        'weight': vs['bm_details']['weight'] if vs.get('bm_details') else None,
                        'height': vs['bm_details']['height'] if vs.get('bm_details') else None,
                        'nutritional_status': nutritional_status,
                        'type_of_feeding': chist['chrec_details'].get('type_of_feeding')
                    }

                    # Initialize child data if not exists
                    if child_id not in children_data:
                        children_data[child_id] = {
                            'child_id': child_id,
                            'household_no': chist['chrec_details'].get('family_no', 'N/A'),
                            'child_name': f"{patrec['personal_info']['per_fname']} {patrec['personal_info']['per_mname']} {patrec['personal_info']['per_lname']}",
                            'sex': patrec['personal_info']['per_sex'],
                            'date_of_birth': patrec['personal_info']['per_dob'],
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

        return {
            'year': self.kwargs['year'],
            'summary': {
                'total_children': len(children_list),
                'children_with_first_semi': first_semi_count,
                'children_with_second_semi': second_semi_count,
                'children_with_both_periods': both_periods_count
            },
            'children_data': children_list
        }

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filter queryset to only primary records for pagination count
        primary_records = [record for record in queryset if getattr(record, 'is_primary_record', True)]
        
        page = self.paginate_queryset(primary_records)
        
        if page is not None:
            # But for serialization, we need all records (including secondary ones)
            # Get all records for the children in this page
            child_ids_in_page = [record.chhist.chrec.patrec.pat_id.pat_id for record in page]
            all_records_for_page = [record for record in queryset 
                                  if record.chhist.chrec.patrec.pat_id.pat_id in child_ids_in_page]
            
            serializer = self.get_serializer(all_records_for_page, many=True)
            return self.get_paginated_response(self._format_report_data(serializer.data, all_records_for_page))
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(self._format_report_data(serializer.data, queryset))