from datetime import datetime, timedelta
import re
from dateutil.relativedelta import relativedelta
from rest_framework import generics, status
from rest_framework.response import Response
from apps.vaccination.models import *
from pagination import StandardResultsPagination
from apps.inventory.models import *
from apps.healthProfiling.models import *
from django.db.models import Q
from apps.vaccination.serializers import VaccinationHistorySerializer





class MonthlyVaccinationStatisticsAPIView(generics.GenericAPIView):
    """
    Returns vaccination statistics by vaccine name, dose, age group, and gender
    
    Format:
    - BCG: 0-28 days and 29 days - 1 year
    - HepB: >24 hours up to 14 days
    - All other vaccines: 0-12 months and 12-23 months
    
    Returns counts by vaccine name (with dose number if applicable), male count, female count, total count
    """
    
    def get(self, request, month):
        # Validate month format (YYYY-MM)
        try:
            year, month_num = map(int, month.split('-'))
            if month_num < 1 or month_num > 12:
                return Response({
                    'success': False,
                    'error': 'Invalid month format. Use YYYY-MM'
                }, status=400)
        except ValueError:
            return Response({
                'success': False,
                'error': 'Invalid month format. Use YYYY-MM'
            }, status=400)

        # Get all completed vaccinations for the month
        vaccination_histories = VaccinationHistory.objects.select_related(
            'vac',
            'vacrec',
            'vacrec__patrec_id',
            'vacrec__patrec_id__pat_id',
            'vacrec__patrec_id__pat_id__rp_id',
            'vacrec__patrec_id__pat_id__rp_id__per',
            'vacrec__patrec_id__pat_id__trans_id'
        ).filter(
            date_administered__year=year,
            date_administered__month=month_num,
            vachist_status='completed'
        )

        # Helper function to calculate age in days and months at vaccination date
        def get_age_at_vaccination(dob, vaccination_date):
            if not dob or not vaccination_date:
                return None, None
            age_delta = vaccination_date - dob
            age_days = age_delta.days
            age_months = (vaccination_date.year - dob.year) * 12 + vaccination_date.month - dob.month
            return age_days, age_months

        # Helper function to get patient info
        def get_patient_info(vac_history):
            try:
                patient = vac_history.vacrec.patrec_id.pat_id
                
                if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
                    dob = patient.rp_id.per.per_dob
                    sex = patient.rp_id.per.per_sex
                elif patient.pat_type == 'Transient' and patient.trans_id:
                    dob = patient.trans_id.tran_dob
                    sex = patient.trans_id.tran_sex
                else:
                    return None, None
                
                return dob, sex
            except:
                return None, None

        # Get all vaccines for age group 0-72 months (0-6 years) (excluding BCG and HepB)
        # Dynamically filter based on time_unit (months or years)
        from django.db.models import Q, Case, When, IntegerField, F, Value
        
        all_vaccines = VaccineList.objects.select_related('ageGroup').exclude(
            vac_name__icontains='bcg'
        ).exclude(
            vac_name__icontains='hep'
        ).filter(
            ageGroup__isnull=False
        ).annotate(
            # Convert max_age to months for comparison
            max_age_in_months=Case(
                When(ageGroup__time_unit__iexact='years', then=F('ageGroup__max_age') * 12),
                When(ageGroup__time_unit__iexact='year', then=F('ageGroup__max_age') * 12),
                When(ageGroup__time_unit__iexact='months', then=F('ageGroup__max_age')),
                When(ageGroup__time_unit__iexact='month', then=F('ageGroup__max_age')),
                default=Value(0),
                output_field=IntegerField()
            )
        ).filter(
            max_age_in_months__lte=72  # 72 months = 6 years
        ).values('vac_name', 'no_of_doses')

        # Data structure to hold statistics
        stats = {
            'bcg_0_28_days': {'male': 0, 'female': 0},
            'bcg_29_days_1_year': {'male': 0, 'female': 0},
            'hepb_24h_14_days': {'male': 0, 'female': 0},
            '0_12_months': {},  # Will hold vaccines with doses
            '12_23_months': {}  # Will hold vaccines with doses
        }

        # Initialize all vaccines with 0 counts
        for vaccine in all_vaccines:
            vaccine_name = vaccine['vac_name']
            no_of_doses = vaccine['no_of_doses']
            
            if no_of_doses > 1:
                # Create entries for each dose
                for dose in range(1, no_of_doses + 1):
                    vaccine_key = f"{vaccine_name} {dose}"
                    stats['0_12_months'][vaccine_key] = {'male': 0, 'female': 0}
                    stats['12_23_months'][vaccine_key] = {'male': 0, 'female': 0}
            else:
                # Single dose vaccine
                stats['0_12_months'][vaccine_name] = {'male': 0, 'female': 0}
                stats['12_23_months'][vaccine_name] = {'male': 0, 'female': 0}

        # Process each vaccination history
        for vac_hist in vaccination_histories:
            dob, sex = get_patient_info(vac_hist)
            if not dob or not sex:
                continue

            age_days, age_months = get_age_at_vaccination(dob, vac_hist.date_administered)
            if age_days is None or age_months is None:
                continue

            vaccine_name = vac_hist.vac.vac_name if vac_hist.vac else 'Unknown'
            vaccine_name_lower = vaccine_name.lower()
            dose_no = vac_hist.vachist_doseNo
            gender = sex.lower()

            # Normalize gender to 'male' or 'female'
            if gender not in ['male', 'female']:
                continue

            # Check if this is a special vaccine (BCG or HepB)
            is_bcg = 'bcg' in vaccine_name_lower
            is_hepb = 'hep' in vaccine_name_lower and 'b' in vaccine_name_lower
            
            # BCG vaccines - only count in special section
            if is_bcg:
                if age_days <= 28:
                    stats['bcg_0_28_days'][gender] += 1
                elif age_days <= 365:
                    stats['bcg_29_days_1_year'][gender] += 1
                continue  # Skip adding to 0-12 or 12-23 months sections

            # HepB vaccines - only count in special section
            if is_hepb:
                if age_days > 1 and age_days <= 14:  # >24 hours (1 day) up to 14 days
                    stats['hepb_24h_14_days'][gender] += 1
                continue  # Skip adding to 0-12 or 12-23 months sections

            # All other vaccines (excluding BCG and HepB) by age group
            vaccine_key = f"{vaccine_name} {dose_no}" if dose_no > 0 else vaccine_name

            if age_months < 12:
                if vaccine_key not in stats['0_12_months']:
                    stats['0_12_months'][vaccine_key] = {'male': 0, 'female': 0}
                stats['0_12_months'][vaccine_key][gender] += 1
            elif 12 <= age_months < 24:
                if vaccine_key not in stats['12_23_months']:
                    stats['12_23_months'][vaccine_key] = {'male': 0, 'female': 0}
                stats['12_23_months'][vaccine_key][gender] += 1

        # Format the response
        def format_vaccine_stats(vaccine_dict):
            result = []
            for vaccine_name, counts in sorted(vaccine_dict.items()):
                result.append({
                    'vaccine_name': vaccine_name,
                    'male': counts['male'],
                    'female': counts['female'],
                    'total': counts['male'] + counts['female']
                })
            return result

        response_data = {
            'success': True,
            'month': month,
            'special_vaccines': [
                {
                    'vaccine_name': 'BCG (0-28 days)',
                    'male': stats['bcg_0_28_days']['male'],
                    'female': stats['bcg_0_28_days']['female'],
                    'total': stats['bcg_0_28_days']['male'] + stats['bcg_0_28_days']['female']
                },
                {
                    'vaccine_name': 'BCG (29 days - 1 year)',
                    'male': stats['bcg_29_days_1_year']['male'],
                    'female': stats['bcg_29_days_1_year']['female'],
                    'total': stats['bcg_29_days_1_year']['male'] + stats['bcg_29_days_1_year']['female']
                },
                {
                    'vaccine_name': 'HepB (>24 hours - 14 days)',
                    'male': stats['hepb_24h_14_days']['male'],
                    'female': stats['hepb_24h_14_days']['female'],
                    'total': stats['hepb_24h_14_days']['male'] + stats['hepb_24h_14_days']['female']
                }
            ],
            '0_12_months': format_vaccine_stats(stats['0_12_months']),
            '12_23_months': format_vaccine_stats(stats['12_23_months'])
        }

        return Response(response_data, status=200)
