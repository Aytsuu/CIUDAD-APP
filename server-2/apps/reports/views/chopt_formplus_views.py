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
    
class MonthlyOPTChildHealthSummariesAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            queryset = ChildHealthVitalSigns.objects.select_related(
                'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec'
            ).order_by('-bm__created_at')

            # Search query (month name or year)
            search_query = request.GET.get('search', '').strip()

            # Filter by year or year-month
            year_param = request.GET.get('year', 'all')
            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        year, month = map(int, year_param.split('-'))
                        queryset = queryset.filter(
                            bm__created_at__year=year,
                            bm__created_at__month=month
                        )
                    else:
                        year = int(year_param)
                        queryset = queryset.filter(bm__created_at__year=year)
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Annotate and count records per month
            monthly_data = queryset.annotate(
                month=TruncMonth('bm__created_at')
            ).values('month').annotate(
                record_count=Count('vital_id')
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
   
   
   
# class MonthlyOPTChildHealthReportAPIView(generics.ListAPIView):
#     serializer_class = OPTTrackingSerializer
#     pagination_class = StandardResultsPagination

#     def get_queryset(self):
#         month = self.kwargs.get('month')
#         try:
#             year, month_num = map(int, month.split('-'))
#             start_date = datetime(year, month_num, 1)
#             end_date = datetime(year, month_num + 1, 1) if month_num < 12 else datetime(year + 1, 1, 1)
#             end_date -= timedelta(microseconds=1)
#         except ValueError:
#             return ChildHealthVitalSigns.objects.none()

#         queryset = ChildHealthVitalSigns.objects.filter(
#             bm__created_at__gte=start_date,
#             bm__created_at__lte=end_date
#         ).select_related(
#             'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec',
#             'chhist__chrec__patrec__pat_id', 'chhist__chrec__patrec__pat_id__rp_id',
#             'chhist__chrec__patrec__pat_id__rp_id__per', 'chhist__chrec__patrec__pat_id__trans_id',
#             'chhist__chrec__patrec__pat_id__trans_id__tradd_id'
#         ).prefetch_related(
#             'nutritional_status',
#             Prefetch(
#                 'chhist__chrec__patrec__pat_id__rp_id__per__personaladdress_set',
#                 queryset=PersonalAddress.objects.select_related('add', 'add__sitio'),
#                 to_attr='prefetched_personal_addresses'
#             ),
#             Prefetch(
#                 'chhist__chrec__patrec__pat_id__rp_id__household_set',
#                 queryset=Household.objects.select_related('add', 'add__sitio'),
#                 to_attr='prefetched_households'
#             )
#         ).order_by('bm__created_at')

#         # Track if any filter is applied
#         filters_applied = False
#         original_count = queryset.count()

#         # Combined search (child/patient name, family number, and sitio)
#         search_query = self.request.query_params.get('search', '').strip()
#         sitio_search = self.request.query_params.get('sitio', '').strip()
        
#         # Combine search and sitio parameters
#         combined_search_terms = []
#         if search_query and len(search_query) >= 3:
#             combined_search_terms.append(search_query)
#         if sitio_search:
#             combined_search_terms.append(sitio_search)
        
#         if combined_search_terms:
#             filters_applied = True
#             combined_search = ','.join(combined_search_terms)
#             queryset = self._apply_search_filter(queryset, combined_search)
#             if queryset.count() == 0 and original_count > 0:
#                 return ChildHealthVitalSigns.objects.none()

#         # Nutritional status search
#         nutritional_search = self.request.query_params.get('nutritional_status', '').strip()
#         if nutritional_search:
#             filters_applied = True
#             queryset = self._apply_nutritional_search(queryset, nutritional_search)
#             if queryset.count() == 0 and original_count > 0:
#                 return ChildHealthVitalSigns.objects.none()

#         # Age range filter
#         age_range = self.request.query_params.get('age_range', '').strip()
#         if age_range:
#             filters_applied = True
#             queryset = self._apply_age_filter(queryset, age_range)
#             if not queryset and original_count > 0:  # _apply_age_filter returns a list
#                 return ChildHealthVitalSigns.objects.none()

#         return queryset

#     def _apply_search_filter(self, queryset, search_query):
#         """Search by child/patient name, family number, and sitio"""
#         search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
#         if not search_terms:
#             return queryset

#         name_query = Q()
#         family_no_query = Q()
#         person_ids = set()
#         transient_ids = set()

#         for term in search_terms:
#             # Search by child/patient name (both resident and transient)
#             name_query |= (
#                 Q(chhist__chrec__patrec__pat_id__rp_id__per__per_fname__icontains=term) |
#                 Q(chhist__chrec__patrec__pat_id__rp_id__per__per_mname__icontains=term) |
#                 Q(chhist__chrec__patrec__pat_id__rp_id__per__per_lname__icontains=term) |
#                 Q(chhist__chrec__patrec__pat_id__trans_id__tran_fname__icontains=term) |
#                 Q(chhist__chrec__patrec__pat_id__trans_id__tran_mname__icontains=term) |
#                 Q(chhist__chrec__patrec__pat_id__trans_id__tran_lname__icontains=term)
#             )

#             # Search by family number
#             family_no_query |= Q(chhist__chrec__family_no__icontains=term)

#             # Search by sitio for residents (case-insensitive and partial match)
#             matching_person_ids = PersonalAddress.objects.filter(
#                 Q(add__add_external_sitio__icontains=term) |
#                 Q(add__sitio__sitio_name__icontains=term)
#             ).values_list('per', flat=True)
#             person_ids.update(matching_person_ids)

#             # Search by sitio for transients (case-insensitive and partial match)
#             matching_transient_ids = Transient.objects.filter(
#                 Q(tradd_id__tradd_sitio__icontains=term)
#             ).values_list('trans_id', flat=True)
#             transient_ids.update(matching_transient_ids)

#         # Combine all search queries
#         combined_query = name_query | family_no_query
        
#         if person_ids:
#             combined_query |= Q(chhist__chrec__patrec__pat_id__rp_id__per__in=person_ids)
#         if transient_ids:
#             combined_query |= Q(chhist__chrec__patrec__pat_id__trans_id__in=transient_ids)

#         return queryset.filter(combined_query)

#     def _apply_nutritional_search(self, queryset, search_query):
#         """Search by nutritional status"""
#         search_terms = [term.strip().lower() for term in search_query.split(',') if term.strip()]
#         if not search_terms:
#             return queryset

#         status_query = Q()
#         for term in search_terms:
#             status_query |= (
#                 Q(nutritional_status__wfa__iexact=term) |
#                 Q(nutritional_status__lhfa__iexact=term) |
#                 Q(nutritional_status__wfl__iexact=term) |
#                 Q(nutritional_status__muac_status__iexact=term)
#             )
        
#         return queryset.filter(status_query)

#     def _calculate_age_in_months(self, dob, reference_date):
#         """
#         Calculate age in months based on date of birth and reference date (bm.created_at)
#         Similar to how it's done in the supplements report
#         """
#         try:
#             if not dob or not reference_date:
#                 return 0
            
#             # Convert reference_date to date if it's datetime
#             if hasattr(reference_date, 'date'):
#                 reference_date = reference_date.date()
            
#             # Convert dob to date if it's datetime
#             if hasattr(dob, 'date'):
#                 dob = dob.date()
                
#             # Calculate age in months
#             age_months = (reference_date.year - dob.year) * 12 + (reference_date.month - dob.month)
            
#             # Adjust if the day hasn't been reached yet in the current month
#             if reference_date.day < dob.day:
#                 age_months -= 1
                
#             return max(0, age_months)  # Ensure non-negative age
            
#         except (AttributeError, TypeError, ValueError) as e:
#             print(f"Error calculating age: {e}")
#             return 0

#     def _apply_age_filter(self, queryset, age_range):
#         """Apply age range filter to queryset"""
#         try:
#             min_age, max_age = map(int, age_range.split('-'))
#             filtered_data = []
#             for obj in queryset:
#                 # Get patient's date of birth
#                 pat_id = obj.chhist.chrec.patrec.pat_id
#                 dob = None
                
#                 if pat_id.pat_type == 'Resident' and hasattr(pat_id, 'rp_id') and pat_id.rp_id:
#                     dob = pat_id.rp_id.per.per_dob
#                 elif pat_id.pat_type == 'Transient' and hasattr(pat_id, 'trans_id') and pat_id.trans_id:
#                     dob = pat_id.trans_id.tran_dob
                
#                 # Get BM created_at date
#                 bm_created_at = obj.bm.created_at if obj.bm else None
                
#                 # Calculate age in months
#                 age_months = self._calculate_age_in_months(dob, bm_created_at)
                
#                 if min_age <= age_months <= max_age:
#                     filtered_data.append(obj)
#             return filtered_data
#         except ValueError:
#             return queryset

#     def _format_report_data(self, data, queryset_objects=None):
#         report_data = []
        
#         if queryset_objects:
#             for i, entry in enumerate(data):
#                 try:
#                     vs_obj = queryset_objects[i]
#                     vs = entry['vital_signs']
#                     chist = entry['chist_details']
#                     patrec = chist['chrec_details']['patrec_details']['pat_details']

#                     address, sitio, is_transient = ChildHealthReportUtils.get_patient_address(vs_obj.chhist.chrec.patrec.pat_id)

#                     # Get patient's date of birth and BM created_at date
#                     pat_id = vs_obj.chhist.chrec.patrec.pat_id
#                     dob = None
                    
#                     if pat_id.pat_type == 'Resident' and hasattr(pat_id, 'rp_id') and pat_id.rp_id:
#                         dob = pat_id.rp_id.per.per_dob
#                     elif pat_id.pat_type == 'Transient' and hasattr(pat_id, 'trans_id') and pat_id.trans_id:
#                         dob = pat_id.trans_id.tran_dob
                    
#                     # Get BM created_at date
#                     bm_created_at = vs_obj.bm.created_at if vs_obj.bm else None
                    
#                     # Calculate age in months using the new method
#                     age_in_months = self._calculate_age_in_months(dob, bm_created_at)

#                     # Format parents information
#                     parents = {}
#                     family_info = patrec.get('family_head_info', {})
#                     if family_info.get('has_mother'):
#                         mother = family_info['family_heads']['mother']['personal_info']
#                         parents['mother'] = f"{mother['per_fname']} {mother['per_mname']} {mother['per_lname']}"
#                     if family_info.get('has_father'):
#                         father = family_info['family_heads']['father']['personal_info']
#                         parents['father'] = f"{father['per_fname']} {father['per_mname']} {father['per_lname']}"

#                     # Format nutritional status
#                     nutritional_status = {}
#                     if vs.get('nutritional_status'):
#                         ns = vs['nutritional_status']
#                         nutritional_status = {
#                             'wfa': ns.get('wfa'),
#                             'lhfa': ns.get('lhfa'),
#                             'wfl': ns.get('wfl'),
#                             'muac': ns.get('muac'),
#                             'edema': ns.get('edemaSeverity'),
#                             'muac_status': ns.get('muac_status')
#                         }

#                     report_entry = {
#                         'household_no': chist['chrec_details'].get('family_no', 'N/A'),
#                         'child_name': f"{patrec['personal_info']['per_fname']} {patrec['personal_info']['per_mname']} {patrec['personal_info']['per_lname']}",
#                         'sex': patrec['personal_info']['per_sex'],
#                         'date_of_birth': patrec['personal_info']['per_dob'],
#                         'age_in_months': age_in_months,  # Now calculated correctly
#                         'parents': parents,
#                         'address': address,
#                         'sitio': sitio,
#                         'transient': is_transient,
#                         'date_of_weighing': vs['bm_details']['created_at'][:10] if vs.get('bm_details') else None,
#                         'age_at_weighing': vs['bm_details']['age'] if vs.get('bm_details') else None,
#                         'weight': vs['bm_details']['weight'] if vs.get('bm_details') else None,
#                         'height': vs['bm_details']['height'] if vs.get('bm_details') else None,
#                         'nutritional_status': nutritional_status,
#                         'type_of_feeding': chist['chrec_details'].get('type_of_feeding')
#                     }

#                     report_data.append(report_entry)
#                 except Exception as e:
#                     print(f"Error formatting report entry {i}: {e}")
#                     continue

#         return {
#             'month': self.kwargs['month'],
#             'total_entries': len(report_data),
#             'report_data': report_data
#         }

#     def list(self, request, *args, **kwargs):
#         queryset = self.filter_queryset(self.get_queryset())
#         page = self.paginate_queryset(queryset)

#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(self._format_report_data(serializer.data, page))

#         serializer = self.get_serializer(queryset, many=True)
#         return Response(self._format_report_data(serializer.data, queryset))


class MonthlyOPTChildHealthReportAPIView(generics.ListAPIView):
    serializer_class = OPTTrackingSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        month = self.kwargs.get('month')
        try:
            year, month_num = map(int, month.split('-'))
            start_date = datetime(year, month_num, 1)
            end_date = datetime(year, month_num + 1, 1) if month_num < 12 else datetime(year + 1, 1, 1)
            end_date -= timedelta(microseconds=1)
        except ValueError:
            return ChildHealthVitalSigns.objects.none()

        queryset = ChildHealthVitalSigns.objects.filter(
            bm__created_at__gte=start_date,
            bm__created_at__lte=end_date
        ).select_related(
            'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec',
            'chhist__chrec__patrec__pat_id', 'chhist__chrec__patrec__pat_id__rp_id',
            'chhist__chrec__patrec__pat_id__rp_id__per', 'chhist__chrec__patrec__pat_id__trans_id',
            'chhist__chrec__patrec__pat_id__trans_id__tradd_id'
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
        ).order_by('bm__created_at')

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
            queryset = self._apply_search_filter(queryset, combined_search)
            if queryset.count() == 0 and original_count > 0:
                return ChildHealthVitalSigns.objects.none()

        # Nutritional status search
        nutritional_search = self.request.query_params.get('nutritional_status', '').strip()
        if nutritional_search:
            filters_applied = True
            queryset = self._apply_nutritional_search(queryset, nutritional_search)
            if queryset.count() == 0 and original_count > 0:
                return ChildHealthVitalSigns.objects.none()

        # Age range filter
        age_range = self.request.query_params.get('age_range', '').strip()
        if age_range:
            filters_applied = True
            queryset = self._apply_age_filter(queryset, age_range)
            if not queryset and original_count > 0:  # _apply_age_filter returns a list
                return ChildHealthVitalSigns.objects.none()

        return queryset

    def _apply_search_filter(self, queryset, search_query):
        """Search by child/patient name, family number, and sitio"""
        search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return queryset

        name_query = Q()
        family_no_query = Q()
        person_ids = set()
        transient_ids = set()

        for term in search_terms:
            # Search by child/patient name (both resident and transient)
            name_query |= (
                Q(chhist__chrec__patrec__pat_id__rp_id__per__per_fname__icontains=term) |
                Q(chhist__chrec__patrec__pat_id__rp_id__per__per_mname__icontains=term) |
                Q(chhist__chrec__patrec__pat_id__rp_id__per__per_lname__icontains=term) |
                Q(chhist__chrec__patrec__pat_id__trans_id__tran_fname__icontains=term) |
                Q(chhist__chrec__patrec__pat_id__trans_id__tran_mname__icontains=term) |
                Q(chhist__chrec__patrec__pat_id__trans_id__tran_lname__icontains=term)
            )

            # Search by family number
            family_no_query |= Q(chhist__chrec__family_no__icontains=term)

            # Search by sitio for residents (case-insensitive and partial match)
            matching_person_ids = PersonalAddress.objects.filter(
                Q(add__add_external_sitio__icontains=term) |
                Q(add__sitio__sitio_name__icontains=term)
            ).values_list('per', flat=True)
            person_ids.update(matching_person_ids)

            # Search by sitio for transients (case-insensitive and partial match)
            matching_transient_ids = Transient.objects.filter(
                Q(tradd_id__tradd_sitio__icontains=term)
            ).values_list('trans_id', flat=True)
            transient_ids.update(matching_transient_ids)

        # Combine all search queries
        combined_query = name_query | family_no_query
        
        if person_ids:
            combined_query |= Q(chhist__chrec__patrec__pat_id__rp_id__per__in=person_ids)
        if transient_ids:
            combined_query |= Q(chhist__chrec__patrec__pat_id__trans_id__in=transient_ids)

        return queryset.filter(combined_query)

    def _apply_nutritional_search(self, queryset, search_query):
        """Search by nutritional status"""
        search_terms = [term.strip().lower() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return queryset

        status_query = Q()
        for term in search_terms:
            status_query |= (
                Q(nutritional_status__wfa__iexact=term) |
                Q(nutritional_status__lhfa__iexact=term) |
                Q(nutritional_status__wfl__iexact=term) |
                Q(nutritional_status__muac_status__iexact=term)
            )
        
        return queryset.filter(status_query)

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

    def _apply_age_filter(self, queryset, age_range):
        """Apply age range filter to queryset"""
        try:
            min_age, max_age = map(int, age_range.split('-'))
            filtered_data = []
            for obj in queryset:
                # Get patient's date of birth
                pat_id = obj.chhist.chrec.patrec.pat_id
                dob = None
                
                if pat_id.pat_type == 'Resident' and hasattr(pat_id, 'rp_id') and pat_id.rp_id:
                    dob = pat_id.rp_id.per.per_dob
                elif pat_id.pat_type == 'Transient' and hasattr(pat_id, 'trans_id') and pat_id.trans_id:
                    dob = pat_id.trans_id.tran_dob
                
                # Get BM created_at date
                bm_created_at = obj.bm.created_at if obj.bm else None
                
                # Calculate age in months
                age_months = self._calculate_age_in_months(dob, bm_created_at)
                
                if min_age <= age_months <= max_age:
                    filtered_data.append(obj)
            return filtered_data
        except ValueError:
            return queryset

    def _format_report_data(self, data, queryset_objects=None):
        report_data = []
        
        if queryset_objects:
            for i, entry in enumerate(data):
                try:
                    vs_obj = queryset_objects[i]
                    vs = entry['vital_signs']
                    chist = entry['chist_details']
                    patrec = chist['chrec_details']['patrec_details']['pat_details']

                    address, sitio, is_transient = ChildHealthReportUtils.get_patient_address(vs_obj.chhist.chrec.patrec.pat_id)

                    # Get patient's date of birth and BM created_at date
                    pat_id = vs_obj.chhist.chrec.patrec.pat_id
                    dob = None
                    
                    if pat_id.pat_type == 'Resident' and hasattr(pat_id, 'rp_id') and pat_id.rp_id:
                        dob = pat_id.rp_id.per.per_dob
                    elif pat_id.pat_type == 'Transient' and hasattr(pat_id, 'trans_id') and pat_id.trans_id:
                        dob = pat_id.trans_id.tran_dob
                    
                    # Get BM created_at date
                    bm_created_at = vs_obj.bm.created_at if vs_obj.bm else None
                    
                    # Calculate age in months using the new method
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

                    report_entry = {
                        'household_no': chist['chrec_details'].get('family_no', 'N/A'),
                        'child_name': f"{patrec['personal_info']['per_fname']} {patrec['personal_info']['per_mname']} {patrec['personal_info']['per_lname']}",
                        'sex': patrec['personal_info']['per_sex'],
                        'date_of_birth': patrec['personal_info']['per_dob'],
                        'age_in_months': age_in_months,  # Now calculated correctly
                        'parents': parents,
                        'address': address,
                        'sitio': sitio,
                        'transient': is_transient,
                        'date_of_weighing': vs['bm_details']['created_at'][:10] if vs.get('bm_details') else None,
                        'age_at_weighing': age_in_months,  # Use the calculated age instead of vs['bm_details']['age']
                        'weight': vs['bm_details']['weight'] if vs.get('bm_details') else None,
                        'height': vs['bm_details']['height'] if vs.get('bm_details') else None,
                        'nutritional_status': nutritional_status,
                        'type_of_feeding': chist['chrec_details'].get('type_of_feeding')
                    }

                    report_data.append(report_entry)
                except Exception as e:
                    print(f"Error formatting report entry {i}: {e}")
                    continue

        return {
            'month': self.kwargs['month'],
            'total_entries': len(report_data),
            'report_data': report_data
        }

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(self._format_report_data(serializer.data, page))

        serializer = self.get_serializer(queryset, many=True)
        return Response(self._format_report_data(serializer.data, queryset))