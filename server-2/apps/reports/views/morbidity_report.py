from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, date, timedelta
from django.utils import timezone
from apps.patientrecords.models import MedicalHistory, Illness
from pagination import *
from rest_framework import serializers
from ..models import *
from ..serializers import *
from apps.healthProfiling.models import ResidentProfile



class MonthlyMorbiditySummaryAPIView(APIView):
    """
    API View to get monthly counts of morbidity surveillance records
    Returns months with record counts based on created_at field for surveillance cases
    """
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get search query if provided
            search_query = request.GET.get('search', '').strip().lower()
            
            # Query to get monthly counts for surveillance cases only
            queryset = MedicalHistory.objects.filter(is_for_surveillance=True)
            
            # Get basic monthly counts
            monthly_counts = (
                queryset
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(
                    total_cases=Count('medhist_id'),
                    illness_count=Count('ill_id', distinct=True)
                )
                .order_by('-month')
            )
            
            # Format the response with additional statistics
            formatted_data = []
            for item in monthly_counts:
                month_date = item['month']
                year_month = month_date.strftime('%Y-%m')
                month_name = month_date.strftime('%B %Y')
                short_month_name = month_date.strftime('%b %Y')
                year_only = month_date.strftime('%Y')
                month_only = month_date.strftime('%B')

                # Apply search filter if provided
                if search_query:
                    matches_search = (
                        search_query in month_name.lower() or
                        search_query in short_month_name.lower() or
                        search_query in year_only.lower() or
                        search_query in month_only.lower() or
                        search_query in year_month
                    )
                    if not matches_search:
                        continue

                # Get gender breakdown for this month
                month_histories = queryset.filter(
                    created_at__year=month_date.year,
                    created_at__month=month_date.month
                )
                
                male_count = month_histories.filter(
                    Q(patrec__pat_id__rp_id__per__per_sex__in=['M', 'MALE']) |
                    Q(patrec__pat_id__trans_id__tran_sex__in=['M', 'MALE'])
                ).count()
                
                female_count = month_histories.filter(
                    Q(patrec__pat_id__rp_id__per__per_sex__in=['F', 'FEMALE']) |
                    Q(patrec__pat_id__trans_id__tran_sex__in=['F', 'FEMALE'])
                ).count()
                
                # Get top illnesses for this month
                top_illnesses = (
                    month_histories
                    .values('ill__illname', 'ill__ill_code')
                    .annotate(count=Count('medhist_id'))
                    .order_by('-count')[:5]  # Top 5 illnesses
                )
                
                formatted_data.append({
                    'year': month_date.year,
                    'month': month_date.month,
                    'month_name': month_name,
                    'year_month': year_month,
                    'total_cases': item['total_cases'],
                    'male_cases': male_count,
                    'female_cases': female_count,
                    'both_cases': male_count + female_count,
                    'total_illnesses': item['illness_count'],
                    'top_illnesses': list(top_illnesses)
                })
            
            # Apply pagination
            paginator = self.pagination_class()
            paginated_data = paginator.paginate_queryset(formatted_data, request, view=self)
            
            response_data = {
                'success': True,
                'data': paginated_data,
                'total_months': len(formatted_data)
            }
            
            return paginator.get_paginated_response(response_data)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MonthlyMorbidityView(APIView):
    pagination_class = StandardResultsPagination
    def get(self, request, *args, **kwargs):
        try:
            month = kwargs.get('month')
            search_query = request.GET.get('search', '').strip().lower()
            
            print(f"DEBUG: Starting monthly morbidity for month: {month}")
            print(f"DEBUG: Search query: {search_query}")
            
            if not month:
                return Response({
                    'success': False,
                    'error': 'Month parameter is required in URL'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Parse month parameter
            year_str, month_str = month.split('-')
            year = int(year_str)
            month_num = int(month_str)
            
            # Calculate date range
            start_date = datetime(year, month_num, 1)
            if month_num == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month_num + 1, 1)
            
            print(f"DEBUG: Looking for records between {start_date} and {end_date}")
            
            # ICD-10 age groups
            age_groups = [
                (0, 6, "0-6 days"),
                (7, 28, "7-28 days"),
                (29, 364, "29 days - 11 mos"),
                (365, 365 * 4, "1-4 yrs"),
                (365 * 5, 365 * 9, "5-9 yrs"),
                (365 * 10, 365 * 14, "10-14"),
                (365 * 15, 365 * 19, "15-19"),
                (365 * 20, 365 * 24, "20-24"),
                (365 * 25, 365 * 29, "25-29"),
                (365 * 30, 365 * 34, "30-34"),
                (365 * 35, 365 * 39, "35-39"),
                (365 * 40, 365 * 44, "40-44"),
                (365 * 45, 365 * 49, "45-49"),
                (365 * 50, 365 * 54, "50-54"),
                (365 * 55, 365 * 59, "55-59"),
                (365 * 60, 365 * 64, "60-64"),
                (365 * 65, 365 * 69, "65-69"),
                (365 * 70, None, "70+"),
            ]

            # Get surveillance histories with all related data
            surveillance_histories = MedicalHistory.objects.filter(
                created_at__gte=start_date,
                created_at__lt=end_date,
                is_for_surveillance=True
            ).select_related(
                'ill',
                'patrec__pat_id__rp_id__per',
                'patrec__pat_id__trans_id',
                'patrec__pat_id'
            )
            
            print(f"DEBUG: Surveillance medical histories: {surveillance_histories.count()}")
            
            # Apply search filter if provided
            if search_query:
                surveillance_histories = surveillance_histories.filter(
                    Q(ill__illname__icontains=search_query) |
                    Q(ill__ill_code__icontains=search_query) |
                    Q(ill__ill_description__icontains=search_query)
                )
                print(f"DEBUG: After search - {surveillance_histories.count()} records")
            
            # Get distinct illnesses from surveillance records
            illness_ids = surveillance_histories.values_list('ill_id', flat=True).distinct()
            illnesses = Illness.objects.filter(ill_id__in=illness_ids)
            
            print(f"DEBUG: Illnesses with surveillance cases: {[ill.illname for ill in illnesses]}")
            
            # Initialize results structure
            results = {
                'success': True,
                'month': month,
                'period': {
                    'start': start_date.date().isoformat(),
                    'end': (end_date - timedelta(days=1)).date().isoformat()
                },
                'morbidity_data': [],
                'summary': {
                    'total_cases': 0,
                    'total_illnesses': 0,
                    'grand_totals': {
                        'M': 0,
                        'F': 0,
                        'Both': 0
                    }
                }
            }
            
            # Process each illness that has surveillance cases
            for illness in illnesses:
                # Get medical histories for this specific illness
                illness_histories = surveillance_histories.filter(ill=illness)
                
                print(f"DEBUG: Processing illness {illness.illname} - {illness_histories.count()} records")
                
                illness_data = {
                    'illness_id': illness.ill_id,
                    'illness_name': illness.illname,
                    'illness_code': illness.ill_code,
                    'illness_description': illness.ill_description,
                    'age_groups': [],
                    'totals': {
                        'M': 0,
                        'F': 0,
                        'Both': 0
                    }
                }
                
                # Process each age group for this illness
                for min_days, max_days, age_range in age_groups:
                    male_count = 0
                    female_count = 0
                    
                    for med_history in illness_histories:
                        patient = med_history.patrec.pat_id
                        consultation_date = med_history.created_at.date()
                        
                        # Get patient info based on type
                        sex, dob = self._get_sex_and_dob(patient)
                        if not sex or not dob:
                            print(f"DEBUG: Missing sex or dob for patient {patient.pat_id}")
                            continue
                        
                        # Calculate age in days at the time of consultation
                        age_days = (consultation_date - dob).days
                        
                        # Check if patient falls in current age group
                        if self._is_in_age_group(age_days, min_days, max_days):
                            # FIXED: Handle both "M"/"F" and "MALE"/"FEMALE" formats
                            sex_upper = sex.upper()
                            if sex_upper in ["M", "MALE"]:  # Male
                                male_count += 1
                                print(f"DEBUG: Counted as MALE - {sex}")
                            elif sex_upper in ["F", "FEMALE"]:  # Female
                                female_count += 1
                                print(f"DEBUG: Counted as FEMALE - {sex}")
                            else:
                                print(f"DEBUG: Unknown sex value '{sex}' for patient {patient.pat_id}")
                    
                    both_count = male_count + female_count
                    
                    # Add age group data
                    illness_data['age_groups'].append({
                        'age_range': age_range,
                        'M': male_count,
                        'F': female_count,
                        'Both': both_count
                    })
                    
                    # Update illness totals
                    illness_data['totals']['M'] += male_count
                    illness_data['totals']['F'] += female_count
                    illness_data['totals']['Both'] += both_count
                
                # Add illness data to results (even if zero counts for this month)
                results['morbidity_data'].append(illness_data)
                
                # Update summary totals
                results['summary']['grand_totals']['M'] += illness_data['totals']['M']
                results['summary']['grand_totals']['F'] += illness_data['totals']['F']
                results['summary']['grand_totals']['Both'] += illness_data['totals']['Both']
                
                print(f"DEBUG: Added illness {illness.illname} with {illness_data['totals']['Both']} cases (M: {illness_data['totals']['M']}, F: {illness_data['totals']['F']})")
            
            results['summary']['total_cases'] = results['summary']['grand_totals']['Both']
            results['summary']['total_illnesses'] = len(results['morbidity_data'])
            # Get the first row of HeaderRecipientListReporTemplate and serialize it
            header_instance = HeaderRecipientListReporTemplate.objects.first()
            if header_instance:
                header_data = HeaderRecipientListReportTemplateSerializer(header_instance).data
                # Add total_resident count from ResidentProfile
                header_data['total_resident'] = ResidentProfile.objects.count()
                results['header_recipient_list'] = header_data
            else:
                results['header_recipient_list'] = None

            print(f"DEBUG: Final result - {results['summary']['total_illnesses']} illnesses, {results['summary']['total_cases']} total cases (M: {results['summary']['grand_totals']['M']}, F: {results['summary']['grand_totals']['F']})")
            
            return Response(results)
            
        except Exception as e:
            print(f"DEBUG: Error: {str(e)}")
            import traceback
            print(f"DEBUG: Traceback: {traceback.format_exc()}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_sex_and_dob(self, pat_obj):
        """Get sex and date of birth based on patient type"""
        sex = None
        dob = None
        
        try:
            if pat_obj.pat_type == 'Resident' and pat_obj.rp_id and hasattr(pat_obj.rp_id, 'per'):
                per = pat_obj.rp_id.per
                sex = per.per_sex
                dob = per.per_dob
                print(f"DEBUG: Resident patient - sex: {sex}, dob: {dob}")
            elif pat_obj.pat_type == 'Transient' and pat_obj.trans_id:
                trans = pat_obj.trans_id
                sex = trans.tran_sex
                dob = trans.tran_dob
                print(f"DEBUG: Transient patient - sex: {sex}, dob: {dob}")
            else:
                print(f"DEBUG: Unknown patient type or missing data - type: {getattr(pat_obj, 'pat_type', 'unknown')}")
        except Exception as e:
            print(f"DEBUG: Error getting sex and dob: {str(e)}")
            
        return sex, dob
    
    def _is_in_age_group(self, age_days, min_days, max_days):
        """Check if age in days falls within the specified age group"""
        if max_days:  # Bounded range
            return min_days <= age_days <= max_days
        else:  # Unbounded range (70+ years)
            return age_days >= min_days


