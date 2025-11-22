# Standard library imports
from datetime import datetime, timedelta

# Django imports
from django.db.models import (
    Case, When, F, CharField, Q, Prefetch, Count, Value
)
from django.db.models.functions import TruncMonth, Upper
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
from apps.patientrecords.serializers.bodymesurement_serializers import BodyMeasurementSerializer
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import * 



# =====OPT SUMMARY=====
class OPTSummaryAllMonths(APIView):
    def get(self, request):
        try:
            # Base queryset with all necessary relations - now including both residents and transients
            queryset = BodyMeasurement.objects.filter(is_opt=True).select_related(
                 'pat',
                'pat__rp_id', 'pat__rp_id__per', 'pat__trans_id'
            ).annotate(
                # Use Case/When to get gender from both resident and transient
                sex=Case(
                    When(pat__pat_type='Resident', then=F('pat__rp_id__per__per_sex')),
                    When(pat__pat_type='Transient', then=F('pat__trans_id__tran_sex')),
                    default=Value('Unknown'),
                    output_field=CharField()
                )
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
                record_count=Count('bm_id'),
                male_count=Count('bm_id', filter=Q(sex='Male')),
                female_count=Count('bm_id', filter=Q(sex='Female'))
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
    serializer_class = BodyMeasurementSerializer
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
         "WFH": ["N", "W", "SW", "OW", "OB"]  # Added OB
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
            return BodyMeasurement.objects.none()

        # Updated annotation to handle all-caps gender values
        queryset = BodyMeasurement.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date,
            is_opt=True
        ).annotate(
            # Use Upper to normalize gender values to uppercase
            sex=Case(
                When(pat__pat_type='Resident', then=Upper(F('pat__rp_id__per__per_sex'))),
                When(pat__pat_type='Transient', then=Upper(F('pat__trans_id__tran_sex'))),
                default=Value('UNKNOWN'),
                output_field=CharField()
            )
        ).select_related(
           'pat',
            'pat__rp_id', 'pat__rp_id__per', 'pat__trans_id'
        )

        sitio_search = self.request.query_params.get('sitio', '').strip()
        if sitio_search:
            queryset = self._apply_sitio_search(queryset, sitio_search)

        return queryset

    def _apply_sitio_search(self, queryset, sitio_search):
        """Search by sitio - for both residents and transients"""
        return   queryset.filter(
            Q(pat__pat_type='Resident', pat__rp_id__per__personal_addresses__add__sitio__sitio_name__icontains=sitio_search) |
            Q(pat__pat_type='Transient', pat__trans_id__tradd_id__tradd_sitio__icontains=sitio_search)
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
                "totals": {"Male": 0, "Female": 0}  # Keep as title case for reporting
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
            # Get patient's date of birth - both residents and transients
            dob = None
            pat = obj.pat
            
            if pat.pat_type == 'Resident' and hasattr(pat, 'rp_id') and pat.rp_id:
                dob = pat.rp_id.per.per_dob
            elif pat.pat_type == 'Transient' and hasattr(pat, 'trans_id') and pat.trans_id:
                dob = pat.trans_id.tran_dob
            
            # Get reference date (use created_at of nutritional status record)
            reference_date = obj.created_at
            
            # Calculate age in months
            age_months = self._calculate_age_in_months(dob, reference_date)
            
            age_bucket = self._get_age_bucket(age_months)
            if not age_bucket:
                continue

            sex = (obj.sex or "").strip()
            # Updated to check for uppercase values
            if sex not in ["MALE", "FEMALE"]:
                continue

            # Convert to title case for consistent reporting
            sex_display = sex.title()  # "MALE" -> "Male", "FEMALE" -> "Female"

            # Directly use the nutritional status object
            ns = obj
            
            for category, statuses in self.STATUS_CATEGORIES.items():
                status_value = getattr(ns, {
                    "WFA": "wfa",
                    "HFA": "lhfa",
                    "WFH": "wfl"
                }[category], None)
                
                if status_value in statuses:
                    # Use sex_display for counting (title case)
                    report_data[category]["age_groups"][age_bucket][status_value][sex_display] += 1
                    report_data[category]["age_groups"][age_bucket]["Total"][sex_display] += 1
                    report_data[category]["totals"][sex_display] += 1
                    overall_totals[sex_display] += 1

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