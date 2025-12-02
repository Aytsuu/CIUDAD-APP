from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from apps.inventory.models import Category
from apps.medicineservices.models import MedicineRequestItem


class DewormingMonthlyStatisticsAPIView(generics.GenericAPIView):
    """
    Monthly statistics for deworming recipients by age group and gender.
    Returns breakdown of deworming recipients by age categories.
    Supports deworming rounds:
    - Round 1: January to June (months 1-6)
    - Round 2: July to December (months 7-12)
    """
    
    def get(self, request, month):
        """
        Get deworming statistics for a specific month/round.
        
        Args:
            month: String in format 'YYYY-MM' (e.g., '2025-11')
            
        Returns:
            JSON with age group breakdowns by gender and deworming round info
        """
        try:
            # Parse month parameter
            year, month_num = map(int, month.split('-'))
            if month_num < 1 or month_num > 12:
                return Response({
                    'success': False,
                    'error': 'Invalid month. Must be between 01 and 12.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, AttributeError):
            return Response({
                'success': False,
                'error': 'Invalid month format. Use YYYY-MM (e.g., 2025-11).'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get deworming category
        deworming_category = Category.objects.filter(cat_name__icontains='deworming').first()
        
        if not deworming_category:
            return Response({
                'success': False,
                'error': 'Deworming category not found in the system.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Helper function to get patient info
        def get_patient_info(medreq_item):
            """Extract date of birth and sex from medicine request item"""
            try:
                patrec = medreq_item.medreq_id.patrec
                pat = patrec.pat_id
                
                # Try resident first
                if pat.rp_id:
                    dob = pat.rp_id.per.per_dob
                    sex = pat.rp_id.per.per_sex
                    return dob, sex
                
                # Try transient
                if pat.trans_id:
                    dob = pat.trans_id.tran_dob
                    sex = pat.trans_id.tran_sex
                    return dob, sex
                    
            except (AttributeError, TypeError):
                pass
            
            return None, None

        # Helper function to calculate age in years at fulfilled date
        def get_age_in_years(dob, fulfilled_date):
            """Calculate age in years at the time of deworming"""
            if not dob or not fulfilled_date:
                return None
            
            age = fulfilled_date.year - dob.year
            if (fulfilled_date.month, fulfilled_date.day) < (dob.month, dob.day):
                age -= 1
            
            return age

        # Helper function to process records for a round
        def process_round_stats(start_month, end_month):
            """Process deworming statistics for a specific round"""
            stats = {
                '1_4_years': {'male': 0, 'female': 0},
                '5_14_years': {'male': 0, 'female': 0},
                '15_19_years': {'male': 0, 'female': 0},
                'unknown_age': {'male': 0, 'female': 0},
            }

            # Get all deworming records for the round
            deworming_records = MedicineRequestItem.objects.filter(
                fulfilled_at__year=year,
                fulfilled_at__month__gte=start_month,
                fulfilled_at__month__lte=end_month,
                med__cat=deworming_category,
                status='completed'
            ).select_related(
                'medreq_id',
                'medreq_id__patrec',
                'medreq_id__patrec__pat_id',
                'medreq_id__patrec__pat_id__rp_id',
                'medreq_id__patrec__pat_id__rp_id__per',
                'medreq_id__patrec__pat_id__trans_id'
            )

            # Track unique patients to avoid counting duplicates
            tracked_patients = set()

            for record in deworming_records:
                # Get patient ID to avoid duplicates
                try:
                    patient_id = record.medreq_id.patrec.pat_id.pat_id
                    if patient_id in tracked_patients:
                        continue
                    tracked_patients.add(patient_id)
                except AttributeError:
                    continue

                dob, sex = get_patient_info(record)
                
                if not sex:
                    continue
                    
                gender = sex.lower()
                if gender not in ['male', 'female']:
                    continue

                # Calculate age at fulfilled date
                age_years = get_age_in_years(dob, record.fulfilled_at.date() if record.fulfilled_at else None)
                
                if age_years is None:
                    stats['unknown_age'][gender] += 1
                elif 1 <= age_years <= 4:
                    stats['1_4_years'][gender] += 1
                elif 5 <= age_years <= 14:
                    stats['5_14_years'][gender] += 1
                elif 15 <= age_years <= 19:
                    stats['15_19_years'][gender] += 1
                else:
                    stats['unknown_age'][gender] += 1

            # Format age groups for this round
            age_groups = [
                {
                    'age_group': '1-4 years old',
                    'male': stats['1_4_years']['male'],
                    'female': stats['1_4_years']['female'],
                    'total': stats['1_4_years']['male'] + stats['1_4_years']['female']
                },
                {
                    'age_group': '5-14 years old',
                    'male': stats['5_14_years']['male'],
                    'female': stats['5_14_years']['female'],
                    'total': stats['5_14_years']['male'] + stats['5_14_years']['female']
                },
                {
                    'age_group': '15-19 years old',
                    'male': stats['15_19_years']['male'],
                    'female': stats['15_19_years']['female'],
                    'total': stats['15_19_years']['male'] + stats['15_19_years']['female']
                },
            ]

            grand_total_male = sum(group['male'] for group in age_groups)
            grand_total_female = sum(group['female'] for group in age_groups)
            grand_total = grand_total_male + grand_total_female

            return {
                'age_groups': age_groups,
                'totals': {
                    'male': grand_total_male,
                    'female': grand_total_female,
                    'total': grand_total
                },
                'unknown_age_count': stats['unknown_age']['male'] + stats['unknown_age']['female']
            }

        # Determine which rounds to process based on the passed month
        if 1 <= month_num <= 6:
            # Round 1: Only return Round 1 data (January to passed month)
            round1_data = process_round_stats(1, month_num)
            
            return Response({
                'success': True,
                'month': month,
                'deworming_round': 1,
                'round_name': "Round 1 (January - June)",
                'round_period': f"01 to {month_num:02d}",
                'deworming_category': deworming_category.cat_name,
                'age_groups': round1_data['age_groups'],
                'totals': round1_data['totals'],
                'unknown_age_count': round1_data['unknown_age_count']
            }, status=status.HTTP_200_OK)
        
        else:  # 7 <= month_num <= 12
            # Round 2: Return BOTH Round 1 (complete) and Round 2 (up to passed month)
            round1_data = process_round_stats(1, 6)  # Complete Round 1
            round2_data = process_round_stats(7, month_num)  # Round 2 up to passed month
            
            return Response({
                'success': True,
                'month': month,
                'deworming_category': deworming_category.cat_name,
                'rounds': [
                    {
                        'round_number': 1,
                        'round_name': "Round 1 (January - June)",
                        'round_period': "01 to 06",
                        'age_groups': round1_data['age_groups'],
                        'totals': round1_data['totals'],
                        'unknown_age_count': round1_data['unknown_age_count']
                    },
                    {
                        'round_number': 2,
                        'round_name': "Round 2 (July - December)",
                        'round_period': f"07 to {month_num:02d}",
                        'age_groups': round2_data['age_groups'],
                        'totals': round2_data['totals'],
                        'unknown_age_count': round2_data['unknown_age_count']
                    }
                ]
            }, status=status.HTTP_200_OK)
