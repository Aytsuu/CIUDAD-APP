# Standard library imports
from datetime import datetime, timedelta

# Django imports
from django.db.models import (
    Case, When, F, CharField, Q, Prefetch, Count
)
from django.db.models.functions import TruncMonth
from django.utils import timezone

# DRF imports
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

# =====MONTHLY OPT SUMMARY VIEWS===== 

# class MonthlyOPTChildHealthReportAPIView(generics.ListAPIView):
#     serializer_class = OPTTrackingSerializer
#     pagination_class = StandardResultsPagination

#     def get_queryset(self):
#         month = self.kwargs.get('month')
#         try:
#             year, month_num = map(int, month.split('-'))
#             start_date = timezone.make_aware(datetime(year, month_num, 1))
#             if month_num < 12:
#                 end_date = timezone.make_aware(datetime(year, month_num + 1, 1))
#             else:
#                 end_date = timezone.make_aware(datetime(year + 1, 1, 1))
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

#         # Sitio search
#         sitio_search = self.request.query_params.get('sitio', '').strip()
#         if sitio_search:
#             queryset = ChildHealthReportUtils.apply_sitio_search(queryset, sitio_search)

#         # Nutritional status search
#         nutritional_search = self.request.query_params.get('nutritional_status', '').strip()
#         if nutritional_search:
#             queryset = self._apply_nutritional_search(queryset, nutritional_search)

#         age_range = self.request.query_params.get('age_range', '').strip()
#         if age_range:
#             queryset = self._apply_age_filter(queryset, age_range)

#         return queryset

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

# =====OPT SUMMARY=====
class OPTSummaryAllMonths(APIView):
    def get(self, request):
        try:
            # Base queryset with all necessary relations - now using NutritionalStatus
            # Filter to only include residents (exclude transients)
            queryset = NutritionalStatus.objects.filter(
                pat__pat_type='Resident'  # Only include residents
            ).select_related(
                'bm', 'bm__patrec', 'bm__patrec__pat_id', 'pat',
                'pat__rp_id', 'pat__rp_id__per'
            ).annotate(
                sex=F('pat__rp_id__per__per_sex')  # Simplified since we only have residents
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

            # Annotate and count records per month with gender breakdown
            monthly_data = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                record_count=Count('nutstat_id'),
                male_count=Count('nutstat_id', filter=Q(sex='Male')),
                female_count=Count('nutstat_id', filter=Q(sex='Female'))
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
                    'record_count': item['record_count'],
                    'gender_totals': {
                        'Male': item['male_count'],
                        'Female': item['female_count']
                    }
                })

            # Calculate overall totals
            overall_totals = {
                'Male': sum(item['male_count'] for item in monthly_data),
                'Female': sum(item['female_count'] for item in monthly_data)
            }

            return Response({
                'success': True,
                'data': formatted_data,
                'total_months': len(formatted_data),
                'overall_totals': overall_totals
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class MonthlyOPTSummaryDetailedReport(generics.ListAPIView):
    serializer_class = NutritionalStatusSerializerBase
    pagination_class = None

    AGE_BUCKETS = [
        (0, 5, "0-5"),
        (6, 11, "6-11"),
        (12, 23, "12-23"),
        (24, 35, "24-35"),
        (36, 47, "36-47"),
        (48, 59, "48-59"),
        (60, 71, "60-71"),
    ]

    STATUS_CATEGORIES = {
        "WFA": ["N", "UW", "SUW", "OW"],
        "HFA": ["N", "ST", "SST", "T"],
        "WFH": ["N", "W", "SW", "OW"]
    }

    def get_queryset(self):
        month = self.kwargs.get('month')
        try:
            year, month_num = map(int, month.split('-'))
            start_date = timezone.make_aware(datetime(year, month_num, 1))
            if month_num < 12:
                end_date = timezone.make_aware(datetime(year, month_num + 1, 1))
            else:
                end_date = timezone.make_aware(datetime(year + 1, 1, 1))
            end_date -= timedelta(microseconds=1)
        except ValueError:
            return NutritionalStatus.objects.none()

        # Filter to only include residents (exclude transients)
        queryset = NutritionalStatus.objects.filter(
            pat__pat_type='Resident',  # Only include residents
            created_at__gte=start_date,
            created_at__lte=end_date
        ).annotate(
            sex=F('pat__rp_id__per__per_sex')  # Simplified since we only have residents
        ).select_related(
            'bm', 'bm__patrec', 'pat',
            'pat__rp_id', 'pat__rp_id__per'  # Removed pat__trans_id since we don't need it
        )

        sitio_search = self.request.query_params.get('sitio', '').strip()
        if sitio_search:
            queryset = self._apply_sitio_search(queryset, sitio_search)

        return queryset

    def _apply_sitio_search(self, queryset, sitio_search):
        """Search by sitio - only for residents now"""
        return queryset.filter(
            Q(pat__rp_id__per__personaladdress__add__sitio__sitio_name__icontains=sitio_search)
        ).distinct()

    def _calculate_age_in_months(self, dob, reference_date):
        """
        Calculate age in months based on date of birth and reference date
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
                
            return max(0, age_months)
            
        except (AttributeError, TypeError, ValueError) as e:
            print(f"Error calculating age: {e}")
            return 0

    def _get_age_bucket(self, age_months):
        for min_age, max_age, label in self.AGE_BUCKETS:
            if min_age <= age_months <= max_age:
                return label
        return None

    def _initialize_report_structure(self):
        report_data = {}
        
        for category, statuses in self.STATUS_CATEGORIES.items():
            report_data[category] = {
                "age_groups": {},
                "totals": {"Male": 0, "Female": 0}
            }
            
            for _, _, age_label in self.AGE_BUCKETS:
                report_data[category]["age_groups"][age_label] = {
                    status: {"Male": 0, "Female": 0} for status in statuses
                }
                report_data[category]["age_groups"][age_label]["Total"] = {"Male": 0, "Female": 0}
        
        return report_data

    def _count_statuses(self, queryset):
        report_data = self._initialize_report_structure()
        overall_totals = {"Male": 0, "Female": 0}

        for obj in queryset:
            # Get patient's date of birth - only residents now
            dob = None
            if obj.pat.pat_type == 'Resident' and hasattr(obj.pat, 'rp_id') and obj.pat.rp_id:
                dob = obj.pat.rp_id.per.per_dob
            
            # Get reference date (use created_at of nutritional status record)
            reference_date = obj.created_at
            
            # Calculate age in months
            age_months = self._calculate_age_in_months(dob, reference_date)
            
            age_bucket = self._get_age_bucket(age_months)
            if not age_bucket:
                continue

            sex = (obj.sex or "").strip()
            if sex not in ["Male", "Female"]:
                continue

            # Directly use the nutritional status object
            ns = obj
            
            for category, statuses in self.STATUS_CATEGORIES.items():
                status_value = getattr(ns, {
                    "WFA": "wfa",
                    "HFA": "lhfa",
                    "WFH": "wfl"
                }[category], None)
                
                if status_value in statuses:
                    report_data[category]["age_groups"][age_bucket][status_value][sex] += 1
                    report_data[category]["age_groups"][age_bucket]["Total"][sex] += 1
                    report_data[category]["totals"][sex] += 1
                    overall_totals[sex] += 1

        report_data["overall_totals"] = overall_totals
        return report_data

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        table_counts = self._count_statuses(queryset)

        sitio_search = request.query_params.get('sitio', '').strip()

        return Response({
            "month": self.kwargs.get("month"),
            "sitio_filter": sitio_search if sitio_search else "All Sitios",
            "report": table_counts
        })