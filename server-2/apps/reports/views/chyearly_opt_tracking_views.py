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


class YearlyOPTChildHealthSummariesAPIView(APIView):
    """
    API View to get yearly summaries of child health records for children aged 0-23 months
    Returns years with record counts for yearly tracking
    Only counts the LATEST records per child in each year
    Filters automatically to children aged 0-23 months
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

        yearly_latest = ChildHealthVitalSigns.objects.filter(
            chhist__chrec__patrec__pat_id=OuterRef('chhist__chrec__patrec__pat_id'),
            bm__created_at__range=(start_date, end_date),
            bm__weight__isnull=False
        ).order_by('-bm__created_at').values('vital_id')[:1]

        yearly_records = ChildHealthVitalSigns.objects.filter(
            vital_id__in=Subquery(yearly_latest)
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
                if 0 <= age_months <= 71:  # Age range 0-23 months
                    ids.add(pat_id)
            return ids

        yearly_ids = filter_children_by_age(yearly_records)

        return {
            'yearly': len(yearly_ids),
            'total': len(yearly_ids)
        }

class YearlyMonthlyOPTChildHealthReportAPIView(generics.ListAPIView):
    """
    API View to get monthly child health report for a specific year
    Returns each child's monthly measurements (Jan-Dec) for children aged 0-23 months
    """
    serializer_class = OPTTrackingSerializer
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
            return ChildHealthVitalSigns.objects.none()

        start_date = datetime(year, 1, 1)
        end_date = datetime(year, 12, 31, 23, 59, 59)

        # Get all records for the year (not just latest per child)
        records = ChildHealthVitalSigns.objects.filter(
            bm__created_at__range=(start_date, end_date),
            bm__weight__isnull=False
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
        ).order_by('chhist__chrec__patrec__pat_id', 'bm__created_at')

        # Filter to only include children aged 0-23 months at any point during the year
        filtered_records = []
        seen_children = set()
        
        for record in records:
            if record.bm and record.bm.created_at:
                pat_id = record.chhist.chrec.patrec.pat_id
                dob = None
                if pat_id.pat_type == 'Resident' and getattr(pat_id, 'rp_id', None):
                    dob = pat_id.rp_id.per.per_dob
                elif pat_id.pat_type == 'Transient' and getattr(pat_id, 'trans_id', None):
                    dob = pat_id.trans_id.tran_dob

                age_months = self._calculate_age_in_months(dob, record.bm.created_at)
                if 0 <= age_months <= 71:
                    child_id = pat_id.pat_id
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
                    vs_obj = queryset_objects[i]
                    vs = entry['vital_signs']
                    chist = entry['chist_details']
                    patrec = chist['chrec_details']['patrec_details']['pat_details']

                    # Get child ID for grouping
                    child_id = vs_obj.chhist.chrec.patrec.pat_id.pat_id

                    # Initialize child data if not exists
                    if child_id not in children_data:
                        address, sitio, is_transient = ChildHealthReportUtils.get_patient_address(
                            vs_obj.chhist.chrec.patrec.pat_id
                        )

                        # Get patient's date of birth
                        pat_id = vs_obj.chhist.chrec.patrec.pat_id
                        dob = None
                        if pat_id.pat_type == 'Resident' and hasattr(pat_id, 'rp_id') and pat_id.rp_id:
                            dob = pat_id.rp_id.per.per_dob
                        elif pat_id.pat_type == 'Transient' and hasattr(pat_id, 'trans_id') and pat_id.trans_id:
                            dob = pat_id.trans_id.tran_dob

                        # Format parents information
                        parents = {}
                        family_info = patrec.get('family_head_info', {})
                        if family_info.get('has_mother'):
                            mother = family_info['family_heads']['mother']['personal_info']
                            parents['mother'] = f"{mother['per_fname']} {mother['per_mname']} {mother['per_lname']}"
                        if family_info.get('has_father'):
                            father = family_info['family_heads']['father']['personal_info']
                            parents['father'] = f"{father['per_fname']} {father['per_mname']} {father['per_lname']}"

                        children_data[child_id] = {
                            'child_id': child_id,
                            'household_no': chist['chrec_details'].get('family_no', 'N/A'),
                            'child_name': f"{patrec['personal_info']['per_fname']} {patrec['personal_info']['per_mname']} {patrec['personal_info']['per_lname']}",
                            'sex': patrec['personal_info']['per_sex'],
                            'date_of_birth': patrec['personal_info']['per_dob'],
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
                    if vs_obj.bm and vs_obj.bm.created_at:
                        month = vs_obj.bm.created_at.month
                        month_name = [
                            'january', 'february', 'march', 'april', 'may', 'june',
                            'july', 'august', 'september', 'october', 'november', 'december'
                        ][month - 1]

                        # Calculate age at weighing
                        dob = None
                        pat_id = vs_obj.chhist.chrec.patrec.pat_id
                        if pat_id.pat_type == 'Resident' and hasattr(pat_id, 'rp_id') and pat_id.rp_id:
                            dob = pat_id.rp_id.per.per_dob
                        elif pat_id.pat_type == 'Transient' and hasattr(pat_id, 'trans_id') and pat_id.trans_id:
                            dob = pat_id.trans_id.tran_dob
                        
                        age_months = self._calculate_age_in_months(dob, vs_obj.bm.created_at)

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

                        # Update monthly data
                        children_data[child_id]['monthly_data'][month_name] = {
                            'measurement_exists': True,
                            'date_of_weighing': vs['bm_details']['created_at'][:10] if vs.get('bm_details') else None,
                            'age_at_weighing': age_months,
                            'weight': vs['bm_details']['weight'] if vs.get('bm_details') else None,
                            'height': vs['bm_details']['height'] if vs.get('bm_details') else None,
                            'nutritional_status': nutritional_status,
                            'type_of_feeding': chist['chrec_details'].get('type_of_feeding')
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
            child_id = record.chhist.chrec.patrec.pat_id.pat_id
            child_ids.add(child_id)
        
        # Paginate based on unique children
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(list(child_ids), request)
        
        if page is not None:
            # Get all records for the children in this page
            records_for_page = [record for record in queryset 
                             if record.chhist.chrec.patrec.pat_id.pat_id in page]
            
            serializer = self.get_serializer(records_for_page, many=True)
            return paginator.get_paginated_response(
                self._format_monthly_report_data(serializer.data, records_for_page)
            )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(self._format_monthly_report_data(serializer.data, queryset))