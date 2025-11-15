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
    


class MonthlyNutritionStatisticsAPIView(generics.GenericAPIView):
    """
    Returns nutrition statistics for infants and children
    
    Statistics:
    1. Newborn Initiated on breastfeeding within 1 hour after birth
    2. Infants born with low birth weight (LBW)
    3. Infants born with LBW given complete iron supplements
    4. Infants 6-11 months given 1 dose of Vitamin A
    5. Children 12-59 months given 2 doses of Vitamin A
    6. Children 6-11 months who completed MNP supplements
    
    Returns counts by male, female, and total
    """
    
    def get(self, request, month):
        from apps.childhealthservices.models import ChildHealthrecord, ChildHealthSupplements, ChildHealthSupplementsStatus, ChildHealth_History, BodyMeasurement
        from apps.medicineservices.models import MedicineRequest, MedicineRequestItem
        from apps.patientrecords.models import Patient
        from decimal import Decimal
        
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

        # Get Vitamin A, MNP, and LNS-SQ categories
        vitamin_a_category = Category.objects.filter(cat_name__icontains='vitamin a').first()
        mnp_category = Category.objects.filter(cat_name__icontains='mnp').first()
        lns_sq_category = Category.objects.filter(cat_name__icontains='lns-sq').first()

        # Helper function to get patient gender and DOB
        def get_patient_info(child_health_record):
            try:
                patient = child_health_record.patrec.pat_id
                
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

        # Helper function to calculate age in months
        def get_age_in_months(dob, reference_date):
            if not dob or not reference_date:
                return None
            age_months = (reference_date.year - dob.year) * 12 + reference_date.month - dob.month
            return age_months

        # Initialize statistics
        stats = {
            'breastfeeding_within_1hr': {'male': 0, 'female': 0},
            'low_birth_weight': {'male': 0, 'female': 0},
            'anemic_children': {'male': 0, 'female': 0},
            'lbw_with_iron': {'male': 0, 'female': 0},
            'vit_a_6_11_months': {'male': 0, 'female': 0},
            'vit_a_12_59_months_2doses': {'male': 0, 'female': 0},
            'mnp_6_11_months': {'male': 0, 'female': 0},
            'mnp_12_23_months': {'male': 0, 'female': 0},
            'lns_sq_6_11_months': {'male': 0, 'female': 0},
            'lns_sq_12_23_months': {'male': 0, 'female': 0},
            # Nutritional Status Assessment (Annual)
            'total_children_0_59_months': {'male': 0, 'female': 0},
            'underweight': {'male': 0, 'female': 0},
            'severely_underweight': {'male': 0, 'female': 0},
            'stunted': {'male': 0, 'female': 0},
            'normal': {'male': 0, 'female': 0},
            'obese_overweight': {'male': 0, 'female': 0}
        }

        # 1. Newborn Initiated on breastfeeding within 1 hour after birth
        breastfeeding_records = ChildHealthrecord.objects.filter(
            created_at__year=year,
            created_at__month=month_num,
            newbornInitiatedbf=True
        ).select_related('patrec__pat_id__rp_id__per', 'patrec__pat_id__trans_id')

        for record in breastfeeding_records:
            dob, sex = get_patient_info(record)
            if sex:
                gender = sex.lower()
                if gender in ['male', 'female']:
                    stats['breastfeeding_within_1hr'][gender] += 1

        # 2. Infants born with low birth weight (birthwt < 2.5 kg)
        # 3. Infants born with LBW given complete iron supplements
        lbw_records = ChildHealthSupplementsStatus.objects.filter(
            created_at__year=year,
            created_at__month=month_num,
            status_type='birthwt',
        ).select_related(
            'chhist__chrec__patrec__pat_id__rp_id__per',
            'chhist__chrec__patrec__pat_id__trans_id'
        )

        for record in lbw_records:
            dob, sex = get_patient_info(record.chhist.chrec)
            gender = sex.lower()
            if gender in ['male', 'female']:
                stats['low_birth_weight'][gender] += 1

        # 3. Anemic children
        anemic_records = ChildHealthSupplementsStatus.objects.filter(
            created_at__year=year,
            created_at__month=month_num,
            status_type='anemic',
        ).select_related(
            'chhist__chrec__patrec__pat_id__rp_id__per',
            'chhist__chrec__patrec__pat_id__trans_id'
        )

        for record in anemic_records:
            dob, sex = get_patient_info(record.chhist.chrec)
            gender = sex.lower()
            if gender in ['male', 'female']:
                stats['anemic_children'][gender] += 1
               

        # 4. Infants 6-11 months given 1 dose of Vitamin A
        if vitamin_a_category:
            # Get all child health supplements with Vitamin A
            vit_a_supplements = ChildHealthSupplements.objects.filter(
                chhist__created_at__year=year,
                chhist__created_at__month=month_num,
                medreq__isnull=False
            ).select_related(
                'chhist__chrec__patrec__pat_id__rp_id__per',
                'chhist__chrec__patrec__pat_id__trans_id',
                'medreq'
            ).prefetch_related('medreq__items__med__cat')

            # Track patients who received Vitamin A by age group
            vit_a_6_11_patients = set()
            vit_a_12_59_count = {}  # {patient_id: count}

            for supplement in vit_a_supplements:
                # Check if any medicine item has Vitamin A category and is fulfilled
                has_vit_a = supplement.medreq.items.filter(
                    med__cat=vitamin_a_category,
                ).exists()
                
                if has_vit_a:
                    dob, sex = get_patient_info(supplement.chhist.chrec)
                    if dob and sex:
                        age_months = get_age_in_months(dob, supplement.chhist.created_at.date())
                        patient_id = supplement.chhist.chrec.patrec.pat_id.pat_id
                        gender = sex.lower()
                        
                        if gender not in ['male', 'female']:
                            continue
                        
                        # 6-11 months - count first dose only
                        if 6 <= age_months <= 11:
                            if patient_id not in vit_a_6_11_patients:
                                stats['vit_a_6_11_months'][gender] += 1
                                vit_a_6_11_patients.add(patient_id)
                        
                        # 12-59 months - count if received 2 doses
                        elif 12 <= age_months <= 59:
                            key = (patient_id, gender)
                            vit_a_12_59_count[key] = vit_a_12_59_count.get(key, 0) + 1

            # Count patients with 2 doses of Vitamin A (12-59 months)
            for (patient_id, gender), count in vit_a_12_59_count.items():
                if count >= 2:
                    stats['vit_a_12_59_months_2doses'][gender] += 1

        # 6. Children 6-11 months who completed MNP supplements
        # 7. Children 12-23 months who completed MNP supplements
        if mnp_category:
            mnp_supplements = ChildHealthSupplements.objects.filter(
                chhist__created_at__year=year,
                chhist__created_at__month=month_num,
                medreq__isnull=False
            ).select_related(
                'chhist__chrec__patrec__pat_id__rp_id__per',
                'chhist__chrec__patrec__pat_id__trans_id',
                'medreq'
            ).prefetch_related('medreq__items__med__cat')

            mnp_patients_6_11 = set()
            mnp_patients_12_23 = set()

            for supplement in mnp_supplements:
                # Check if any medicine item has MNP category and is fulfilled
                has_mnp = supplement.medreq.items.filter(
                    med__cat=mnp_category,
                ).exists()
                
                if has_mnp:
                    dob, sex = get_patient_info(supplement.chhist.chrec)
                    if dob and sex:
                        age_months = get_age_in_months(dob, supplement.chhist.created_at.date())
                        patient_id = supplement.chhist.chrec.patrec.pat_id.pat_id
                        gender = sex.lower()
                        
                        if gender in ['male', 'female']:
                            # 6-11 months age group
                            if 6 <= age_months <= 11:
                                if patient_id not in mnp_patients_6_11:
                                    stats['mnp_6_11_months'][gender] += 1
                                    mnp_patients_6_11.add(patient_id)
                            # 12-23 months age group
                            elif 12 <= age_months <= 23:
                                if patient_id not in mnp_patients_12_23:
                                    stats['mnp_12_23_months'][gender] += 1
                                    mnp_patients_12_23.add(patient_id)

        # 8. Infants 6-11 months who received LNS-SQ supplements
        # 9. Children 12-23 months who received LNS-SQ supplements
        if lns_sq_category:
            lns_sq_supplements = ChildHealthSupplements.objects.filter(
                chhist__created_at__year=year,
                chhist__created_at__month=month_num,
                medreq__isnull=False
            ).select_related(
                'chhist__chrec__patrec__pat_id__rp_id__per',
                'chhist__chrec__patrec__pat_id__trans_id',
                'medreq'
            ).prefetch_related('medreq__items__med__cat')

            lns_sq_patients_6_11 = set()
            lns_sq_patients_12_23 = set()

            for supplement in lns_sq_supplements:
                # Check if any medicine item has LNS-SQ category and is fulfilled
                has_lns_sq = supplement.medreq.items.filter(
                    med__cat=lns_sq_category,
                    fulfilled_at__isnull=False
                ).exists()
                
                if has_lns_sq:
                    dob, sex = get_patient_info(supplement.chhist.chrec)
                    if dob and sex:
                        age_months = get_age_in_months(dob, supplement.chhist.created_at.date())
                        patient_id = supplement.chhist.chrec.patrec.pat_id.pat_id
                        gender = sex.lower()
                        
                        if gender in ['male', 'female']:
                            # 6-11 months age group
                            if 6 <= age_months <= 11:
                                if patient_id not in lns_sq_patients_6_11:
                                    stats['lns_sq_6_11_months'][gender] += 1
                                    lns_sq_patients_6_11.add(patient_id)
                            # 12-23 months age group
                            elif 12 <= age_months <= 23:
                                if patient_id not in lns_sq_patients_12_23:
                                    stats['lns_sq_12_23_months'][gender] += 1
                                    lns_sq_patients_12_23.add(patient_id)

        # 10. Nutritional Status Assessment (Annual - based on year from month parameter)
        # Get all child health records created in the specified year
        child_health_records = ChildHealthrecord.objects.filter(
            created_at__year=year
        ).select_related('patrec__pat_id__rp_id__per', 'patrec__pat_id__trans_id')

        # Track unique children assessed
        assessed_children = set()

        for child_record in child_health_records:
            dob, sex = get_patient_info(child_record)
            if dob and sex:
                age_months = get_age_in_months(dob, child_record.created_at.date())
                
                # Only count children 0-59 months
                if age_months is not None and 0 <= age_months <= 59:
                    patient_id = child_record.patrec.pat_id.pat_id
                    gender = sex.lower()
                    
                    if gender in ['male', 'female'] and patient_id not in assessed_children:
                        stats['total_children_0_59_months'][gender] += 1
                        assessed_children.add(patient_id)
                        
                        # Get the most recent OPT body measurement for this child in the year
                        body_measurement = BodyMeasurement.objects.filter(
                            pat=child_record.patrec.pat_id,
                            created_at__year=year,
                            is_opt=True
                        ).order_by('-created_at').first()
                        
                        if body_measurement:
                            wfa = body_measurement.wfa
                            lhfa = body_measurement.lhfa
                            wfl = body_measurement.wfl
                            muac_status = body_measurement.muac_status
                            
                            # Count underweight (UW) or moderate acute malnutrition (MAM)
                            if wfa == 'UW' or muac_status == 'MAM' or wfl == 'W':
                                stats['underweight'][gender] += 1
                            
                            # Count severely underweight (SUW) or severe acute malnutrition (SAM)
                            if wfa == 'SUW' or muac_status == 'SAM' or wfl=='SW':
                                stats['severely_underweight'][gender] += 1
                            
                            # Count stunted (ST)
                            if lhfa == 'ST' or lhfa == 'SST':
                                stats['stunted'][gender] += 1
                            
                            # Count normal (WFA = N and LHFA = N and WFL = N)
                            if wfa == 'N' and lhfa == 'N' and wfl == 'N':
                                stats['normal'][gender] += 1
                            
                            # Count obese/overweight (OW or OB)
                            if wfa == 'OW' or wfl == 'OB' or wfl == 'OW':
                                stats['obese_overweight'][gender] += 1

        # Format response
        response_data = {
            'success': True,
            'month': month,
            'nutrition_services': [
                {
                    'service_name': 'Newborn Initiated on breastfeeding within 1 hour after birth',
                    'male': stats['breastfeeding_within_1hr']['male'],
                    'female': stats['breastfeeding_within_1hr']['female'],
                    'total': stats['breastfeeding_within_1hr']['male'] + stats['breastfeeding_within_1hr']['female']
                },
                {
                    'service_name': 'Infants born with low birth weight (LBW)',
                    'male': stats['low_birth_weight']['male'],
                    'female': stats['low_birth_weight']['female'],
                    'total': stats['low_birth_weight']['male'] + stats['low_birth_weight']['female']
                },
                {
                    'service_name': 'Anemic children',
                    'male': stats['anemic_children']['male'],
                    'female': stats['anemic_children']['female'],
                    'total': stats['anemic_children']['male'] + stats['anemic_children']['female']
                },
                {
                    'service_name': 'Infants born with LBW given complete iron supplements',
                    'male': stats['lbw_with_iron']['male'],
                    'female': stats['lbw_with_iron']['female'],
                    'total': stats['lbw_with_iron']['male'] + stats['lbw_with_iron']['female']
                },
                {
                    'service_name': 'Infants 6-11 months given 1 dose of Vitamin A',
                    'male': stats['vit_a_6_11_months']['male'],
                    'female': stats['vit_a_6_11_months']['female'],
                    'total': stats['vit_a_6_11_months']['male'] + stats['vit_a_6_11_months']['female']
                },
                {
                    'service_name': 'Children 12-59 months given 2 doses of Vitamin A',
                    'male': stats['vit_a_12_59_months_2doses']['male'],
                    'female': stats['vit_a_12_59_months_2doses']['female'],
                    'total': stats['vit_a_12_59_months_2doses']['male'] + stats['vit_a_12_59_months_2doses']['female']
                },
                {
                    'service_name': 'Children 6-11 months who completed MNP supplements',
                    'male': stats['mnp_6_11_months']['male'],
                    'female': stats['mnp_6_11_months']['female'],
                    'total': stats['mnp_6_11_months']['male'] + stats['mnp_6_11_months']['female']
                },
                {
                    'service_name': 'Children 12-23 months who completed MNP supplements',
                    'male': stats['mnp_12_23_months']['male'],
                    'female': stats['mnp_12_23_months']['female'],
                    'total': stats['mnp_12_23_months']['male'] + stats['mnp_12_23_months']['female']
                },
                {
                    'service_name': 'Infants 6-11 months who received LNS-SQ supplements',
                    'male': stats['lns_sq_6_11_months']['male'],
                    'female': stats['lns_sq_6_11_months']['female'],
                    'total': stats['lns_sq_6_11_months']['male'] + stats['lns_sq_6_11_months']['female']
                },
                {
                    'service_name': 'Children 12-23 months who received LNS-SQ supplements',
                    'male': stats['lns_sq_12_23_months']['male'],
                    'female': stats['lns_sq_12_23_months']['female'],
                    'total': stats['lns_sq_12_23_months']['male'] + stats['lns_sq_12_23_months']['female']
                }
            ],
            'nutritional_status_assessment': [
                {
                    'status_name': 'Total number of children 0-59 months seen',
                    'male': stats['total_children_0_59_months']['male'],
                    'female': stats['total_children_0_59_months']['female'],
                    'total': stats['total_children_0_59_months']['male'] + stats['total_children_0_59_months']['female']
                },
                {
                    'status_name': 'Underweight (WFA = UW or MUAC = MAM)',
                    'male': stats['underweight']['male'],
                    'female': stats['underweight']['female'],
                    'total': stats['underweight']['male'] + stats['underweight']['female']
                },
                {
                    'status_name': 'Severely Underweight (WFA = SUW or MUAC = SAM)',
                    'male': stats['severely_underweight']['male'],
                    'female': stats['severely_underweight']['female'],
                    'total': stats['severely_underweight']['male'] + stats['severely_underweight']['female']
                },
                {
                    'status_name': 'Stunted (LHFA = ST)',
                    'male': stats['stunted']['male'],
                    'female': stats['stunted']['female'],
                    'total': stats['stunted']['male'] + stats['stunted']['female']
                },
                {
                    'status_name': 'Normal',
                    'male': stats['normal']['male'],
                    'female': stats['normal']['female'],
                    'total': stats['normal']['male'] + stats['normal']['female']
                },
                {
                    'status_name': 'Obese/Overweight (WFA = OW or WFL = OB/OW)',
                    'male': stats['obese_overweight']['male'],
                    'female': stats['obese_overweight']['female'],
                    'total': stats['obese_overweight']['male'] + stats['obese_overweight']['female']
                }
            ]
        }

        return Response(response_data)
