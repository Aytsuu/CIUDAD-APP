from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Case, When, IntegerField, F, OuterRef, Exists
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
import logging

from ..models import (
    ResidentProfile, Personal, Family, Household, 
    WaterSupply, SanitaryFacility, FamilyComposition
)

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
