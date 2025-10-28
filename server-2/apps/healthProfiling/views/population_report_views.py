from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Case, When, IntegerField, F, OuterRef, Exists, CharField, Value
from django.db.models.functions import Upper
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
import logging

from ..models import (
    ResidentProfile, Personal, Family, Household, 
    WaterSupply, SanitaryFacility, FamilyComposition,
    Dependents_Under_Five, MotherHealthInfo, NonCommunicableDisease
)
from apps.patientrecords.models import BodyMeasurement
from apps.childhealthservices.models import NutritionalStatus

logger = logging.getLogger(__name__)


class PopulationYearlyRecordsView(APIView):
    """
    Get yearly population records with summary statistics
    """
    
    def get(self, request):
        try:
            # Get all unique years from resident registrations
            years = ResidentProfile.objects.filter(
                rp_date_registered__isnull=False
            ).values_list('rp_date_registered__year', flat=True).distinct().order_by('-rp_date_registered__year')
            
            # If no years found, return current year
            if not years:
                current_year = datetime.now().year
                years = [current_year]
            
            yearly_records = []
            
            for year in years:
                # Count residents for this year
                residents_count = ResidentProfile.objects.filter(
                    Q(rp_date_registered__year__lte=year) &
                    Q(per__isnull=False)
                ).count()
                
                # Count families for this year (only families with members)
                families_count = Family.objects.annotate(
                    member_count=Count('family_compositions')
                ).filter(
                    fam_date_registered__year__lte=year,
                    member_count__gt=0
                ).count()
                
                # Count households for this year
                households_count = Household.objects.filter(
                    hh_date_registered__year__lte=year
                ).count()
                
                yearly_records.append({
                    'year': str(year),
                    'total_population': residents_count,
                    'total_families': families_count,
                    'total_households': households_count
                })
            
            return Response({
                'success': True,
                'message': 'Yearly population records retrieved successfully',
                'data': yearly_records
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving yearly population records: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving yearly population records: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PopulationStructureReportView(APIView):
    """
    Generate population structure report with age group breakdown and demographic statistics
    """
    
    def get(self, request):
        try:
            # Get filter parameters
            year = request.query_params.get('year', None)
            sitio = request.query_params.get('sitio', None)
            
            # Base queryset for residents
            residents_query = ResidentProfile.objects.select_related('per').filter(
                per__isnull=False
            )
            
            # Apply filters
            if year and year != 'all':
                # Filter by year of registration or birth year
                try:
                    year_int = int(year)
                    residents_query = residents_query.filter(
                        Q(rp_date_registered__year=year_int) |
                        Q(per__per_dob__year__lte=year_int)
                    )
                except ValueError:
                    pass
            
            if sitio and sitio != 'all':
                # Filter by sitio through household address
                residents_query = residents_query.filter(
                    household__add__sitio__sitio_name=sitio
                )
            
            # Define age groups matching the image structure
            age_groups = [
                ("0-5 mos.", 0, 5/12),
                ("6-11 mos.", 6/12, 11/12),
                ("12-23 mos.", 1, 23/12),
                ("24-35 mos.", 2, 35/12),
                ("36-47 mos.", 3, 47/12),
                ("48-59 mos.", 4, 59/12),
                ("60-71 mos.", 5, 71/12),
                ("6 yrs.", 6, 6.99),
                ("7-9 yrs.", 7, 9.99),
                ("10-14 yrs.", 10, 14.99),
                ("15-19 yrs.", 15, 19.99),
                ("20-24 yrs.", 20, 24.99),
                ("25-29 yrs.", 25, 29.99),
                ("30-34 yrs.", 30, 34.99),
                ("35-39 yrs.", 35, 39.99),
                ("40-44 yrs.", 40, 44.99),
                ("45-49 yrs.", 45, 49.99),
                ("50-54 yrs.", 50, 54.99),
                ("55-59 yrs.", 55, 59.99),
                ("60 yrs. & above", 60, 150),
            ]
            
            # Calculate age for each resident and categorize
            today = date.today()
            age_group_data = []
            total_population = 0
            
            for group_name, min_age, max_age in age_groups:
                male_count = 0
                female_count = 0
                
                for resident in residents_query:
                    if not resident.per or not resident.per.per_dob:
                        continue
                    
                    # Calculate age in years (with decimal for months)
                    dob = resident.per.per_dob
                    age_years = relativedelta(today, dob).years
                    age_months = relativedelta(today, dob).months
                    age_decimal = age_years + (age_months / 12)
                    
                    # Check if age falls within this group
                    if min_age <= age_decimal <= max_age:
                        sex = resident.per.per_sex
                        if sex == 'M' or sex == 'MALE':
                            male_count += 1
                        elif sex == 'F' or sex == 'FEMALE':
                            female_count += 1
                
                total = male_count + female_count
                total_population += total
                
                age_group_data.append({
                    "ageGroup": group_name,
                    "male": male_count,
                    "female": female_count,
                    "total": total
                })
            
            # Count families (only families with members)
            family_query = Family.objects.annotate(
                member_count=Count('family_compositions')
            ).filter(member_count__gt=0)
            
            if year and year != 'all':
                try:
                    year_int = int(year)
                    family_query = family_query.filter(fam_date_registered__year=year_int)
                except ValueError:
                    pass
            if sitio and sitio != 'all':
                family_query = family_query.filter(hh__add__sitio__sitio_name=sitio)
            
            number_of_families = family_query.count()
            
            # Count households
            household_query = Household.objects.all()
            if year and year != 'all':
                try:
                    year_int = int(year)
                    household_query = household_query.filter(hh_date_registered__year=year_int)
                except ValueError:
                    pass
            if sitio and sitio != 'all':
                household_query = household_query.filter(add__sitio__sitio_name=sitio)
            
            number_of_households = household_query.count()
            
            # Toilet types statistics
            # Count households with sanitary toilet type
            toilet_sanitary = SanitaryFacility.objects.filter(
                hh__in=household_query,
                sf_type='SANITARY'
            ).values('hh').distinct().count()
            
            # Count households with unsanitary toilet type
            toilet_unsanitary = SanitaryFacility.objects.filter(
                hh__in=household_query,
                sf_type='UNSANITARY'
            ).values('hh').distinct().count()
            
            # Count households with no toilet facility
            households_with_toilet = SanitaryFacility.objects.filter(
                hh__in=household_query
            ).values('hh').distinct().count()
            
            toilet_none = number_of_households - households_with_toilet
            
            # Water source statistics - count households with each water supply level
            # L1: LEVEL I water supply type
            l1_point_source = WaterSupply.objects.filter(
                hh__in=household_query,
                water_sup_type='LEVEL I'
            ).values('hh').distinct().count()
            
            # L2: LEVEL II water supply type
            l2_communal = WaterSupply.objects.filter(
                hh__in=household_query,
                water_sup_type='LEVEL II'
            ).values('hh').distinct().count()
            
            # L3: LEVEL III water supply type
            l3_complete = WaterSupply.objects.filter(
                hh__in=household_query,
                water_sup_type='LEVEL III'
            ).values('hh').distinct().count()
            
            # Compile response data
            response_data = {
                "totalPopulation": total_population,
                "ageGroups": age_group_data,
                "numberOfFamilies": number_of_families,
                "numberOfHouseholds": number_of_households,
                "toiletTypes": {
                    "sanitary": toilet_sanitary,
                    "unsanitary": toilet_unsanitary,
                    "none": toilet_none
                },
                "waterSources": {
                    "l1PointSource": l1_point_source,
                    "l2Communal": l2_communal,
                    "l3CompleteSource": l3_complete
                }
            }
            
            return Response({
                'success': True,
                'message': 'Population structure report generated successfully',
                'data': response_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating population structure report: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error generating population structure report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HealthProfilingSummaryView(APIView):
    """
    Generate comprehensive health profiling summary report
    Includes nutritional status, OPT targets, family planning, chronic diseases
    """
    
    def get(self, request):
        try:
            # Get filter parameters
            year = request.query_params.get('year', None)
            sitio = request.query_params.get('sitio', None)
            
            # Base queryset for residents
            residents_query = ResidentProfile.objects.select_related('per').filter(
                per__isnull=False
            )
            
            # Apply filters
            if year and year != 'all':
                try:
                    year_int = int(year)
                    residents_query = residents_query.filter(
                        Q(rp_date_registered__year=year_int) |
                        Q(per__per_dob__year__lte=year_int)
                    )
                except ValueError:
                    pass
            
            if sitio and sitio != 'all':
                residents_query = residents_query.filter(
                    household__add__sitio__sitio_name=sitio
                )
            
            # Calculate basic population statistics
            total_population = residents_query.count()
            
            # Projected population (can be adjusted based on growth rate formula if needed)
            projected_population = total_population  # For now, same as actual
            
            # Count families (only families with members)
            family_query = Family.objects.annotate(
                member_count=Count('family_compositions')
            ).filter(member_count__gt=0)
            
            if year and year != 'all':
                try:
                    year_int = int(year)
                    family_query = family_query.filter(fam_date_registered__year=year_int)
                except ValueError:
                    pass
            if sitio and sitio != 'all':
                family_query = family_query.filter(hh__add__sitio__sitio_name=sitio)
            
            number_of_families = family_query.count()
            
            # Count households
            household_query = Household.objects.all()
            if year and year != 'all':
                try:
                    year_int = int(year)
                    household_query = household_query.filter(hh_date_registered__year=year_int)
                except ValueError:
                    pass
            if sitio and sitio != 'all':
                household_query = household_query.filter(add__sitio__sitio_name=sitio)
            
            number_of_households = household_query.count()
            
            # OPT (Operation Timbang) - Count from BodyMeasurement where is_opt=True
            # Filter by year if specified
            opt_query = BodyMeasurement.objects.filter(is_opt=True)
            
            if year and year != 'all':
                try:
                    year_int = int(year)
                    opt_query = opt_query.filter(created_at__year=year_int)
                except ValueError:
                    pass
            
            # Filter by sitio if specified (through patient's resident profile)
            if sitio and sitio != 'all':
                opt_query = opt_query.filter(
                    Q(pat__rp_id__per__personaladdress__add__sitio__sitio_name=sitio) |
                    Q(pat__trans_id__tradd_id__tradd_sitio__icontains=sitio)
                ).distinct()
            
            # OPT Targets: All unique patients with is_opt=True records
            opt_targets = opt_query.values('pat').distinct().count()
            
            # OPT Accomplishments: For now, leave as 0 (as requested)
            opt_accomplishments = 0
            
            # Nutritional Status statistics from BodyMeasurement (similar to OPT summary views)
            # Annotate with sex from both resident and transient patients
            nutritional_query = opt_query.annotate(
                sex=Case(
                    When(pat__pat_type='Resident', then=Upper(F('pat__rp_id__per__per_sex'))),
                    When(pat__pat_type='Transient', then=Upper(F('pat__trans_id__tran_sex'))),
                    default=Value('UNKNOWN'),
                    output_field=CharField()
                )
            ).select_related('pat', 'pat__rp_id', 'pat__rp_id__per', 'pat__trans_id')
            
            # Initialize counters for nutritional status
            nutritional_stats = {
                'normal': {'male': 0, 'female': 0},
                'underweight': {'male': 0, 'female': 0},
                'severelyUnderweight': {'male': 0, 'female': 0},
                'overweight': {'male': 0, 'female': 0}
            }
            
            # Count nutritional statuses by WFA (Weight-for-Age)
            for bm in nutritional_query:
                sex = (bm.sex or "").strip()
                if sex not in ["MALE", "FEMALE"]:
                    continue
                
                # Convert to lowercase for our stats dict
                gender = 'male' if sex == 'MALE' else 'female'
                
                # Get WFA status (Weight-for-Age)
                wfa_status = bm.wfa if hasattr(bm, 'wfa') else None
                
                if wfa_status == 'N':  # Normal
                    nutritional_stats['normal'][gender] += 1
                elif wfa_status == 'UW':  # Underweight
                    nutritional_stats['underweight'][gender] += 1
                elif wfa_status == 'SUW':  # Severely Underweight
                    nutritional_stats['severelyUnderweight'][gender] += 1
                elif wfa_status == 'OW':  # Overweight
                    nutritional_stats['overweight'][gender] += 1
            
            # Chronic disease statistics (from NonCommunicableDisease)
            # Count residents with DIABETES or DIABETIC comorbidity
            diabetic_count = NonCommunicableDisease.objects.filter(
                rp__in=residents_query
            ).filter(
                Q(ncd_comorbidities__icontains='DIABETES') |
                Q(ncd_comorbidities__icontains='DIABETIC')
            ).values('rp').distinct().count()
            
            # Count residents with HYPERTENSION comorbidity
            hypertension_count = NonCommunicableDisease.objects.filter(
                rp__in=residents_query,
                ncd_comorbidities__icontains='HYPERTENSION'
            ).values('rp').distinct().count()
            
            # Water source statistics (reuse from population structure report)
            l1_point_source = WaterSupply.objects.filter(
                hh__in=household_query,
                water_sup_type='LEVEL I'
            ).values('hh').distinct().count()
            
            l2_communal = WaterSupply.objects.filter(
                hh__in=household_query,
                water_sup_type='LEVEL II'
            ).values('hh').distinct().count()
            
            l3_complete = WaterSupply.objects.filter(
                hh__in=household_query,
                water_sup_type='LEVEL III'
            ).values('hh').distinct().count()
            
            # Toilet type statistics (reuse from population structure report)
            toilet_sanitary = SanitaryFacility.objects.filter(
                hh__in=household_query,
                sf_type='SANITARY'
            ).values('hh').distinct().count()
            
            toilet_unsanitary = SanitaryFacility.objects.filter(
                hh__in=household_query,
                sf_type='UNSANITARY'
            ).values('hh').distinct().count()
            
            # Family Planning Methods statistics (from MotherHealthInfo)
            family_planning_stats = {
                'iud': 0,
                'injectables': 0,
                'pills': 0,
                'condom': 0,
                'nfpLam': 0,
                'vasectomy': 0,
                'btl': 0,
                'implanon': 0
            }
            
            # Get all mother health info records for residents in query
            mother_health_query = MotherHealthInfo.objects.filter(
                rp__in=residents_query,
                mhi_famPlan_method__isnull=False
            ).exclude(mhi_famPlan_method='')
            
            for record in mother_health_query:
                method = record.mhi_famPlan_method.upper() if record.mhi_famPlan_method else ''
                
                # Count each method separately (can have multiple methods per record)
                if 'IUD' in method:
                    family_planning_stats['iud'] += 1
                if 'INJECTABLE' in method or 'INJECTABLES' in method:
                    family_planning_stats['injectables'] += 1
                if 'PILL' in method:
                    family_planning_stats['pills'] += 1
                if 'CONDOM' in method:
                    family_planning_stats['condom'] += 1
                if 'NFP' in method or 'LAM' in method:
                    family_planning_stats['nfpLam'] += 1
                if 'VASECTOMY' in method:
                    family_planning_stats['vasectomy'] += 1
                if 'BTL' in method:
                    family_planning_stats['btl'] += 1
                if 'IMPLANON' in method:
                    family_planning_stats['implanon'] += 1
            
            # Compile response data
            response_data = {
                "projectedPopulation": projected_population,
                "actualPopulation": total_population,
                "numberOfFamilies": number_of_families,
                "numberOfHouseholds": number_of_households,
                "optTargets": opt_targets,
                "optAccomplishments": opt_accomplishments,
                "nutritionalStatus": nutritional_stats,
                "diabetic": diabetic_count,
                "hypertension": hypertension_count,
                "waterType": {
                    "level1": l1_point_source,
                    "level2": l2_communal,
                    "level3": l3_complete
                },
                "toiletType": {
                    "sanitary": toilet_sanitary,
                    "unsanitary": toilet_unsanitary
                },
                "familyPlanningMethods": family_planning_stats
            }
            
            return Response({
                'success': True,
                'message': 'Health profiling summary generated successfully',
                'data': response_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating health profiling summary: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error generating health profiling summary: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
