from apps.inventory.models import *
from apps.vaccination.models import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.db.models import Count, Sum
from django.db.models.functions import ExtractMonth


class MonthlyVaccinationChart(APIView):
    def get(self, request, month):
        try:
            # Validate month format (YYYY-MM)
            try:
                year, month_num = map(int, month.split('-'))
                if month_num < 1 or month_num > 12:
                    raise ValueError
            except ValueError:
                return Response({
                    'success': False,
                    'error': 'Invalid month format. Use YYYY-MM.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get vaccination counts for the specified month using vacrec (vaccination records)
            queryset = VaccinationHistory.objects.filter(
                date_administered__year=year,
                date_administered__month=month_num
            ).values(
                'vacrec__patrec_id',  # Group by unique vaccination records
                'vacStck_id__vac_id__vac_name',  # Also get vaccine name
                'vac__vac_name'  # Get vaccine name from direct vac relationship
            ).annotate(
                count=Count('vacrec', distinct=True)  # Count unique vaccination records
            ).order_by('-count')

            # Convert to dictionary format {vaccine_name: count}
            vaccine_counts = {}
            
            for item in queryset:
                # Get vaccine name from either vacStck_id or direct vac relationship
                vaccine_name = (
                    item.get('vacStck_id__vac_id__vac_name') or 
                    item.get('vac__vac_name') or 
                    'Unknown Vaccine'
                )
                
                if vaccine_name in vaccine_counts:
                    vaccine_counts[vaccine_name] += item['count']
                else:
                    vaccine_counts[vaccine_name] = item['count']

            return Response({
                'success': True,
                'month': month,
                'vaccine_counts': vaccine_counts,
                'total_records': sum(vaccine_counts.values())
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






class VaccineResidentCountView(APIView):
    def get(self, request, year):
        try:
            # Validate year parameter
            try:
                year = int(year)
            except ValueError:
                return Response({"success": False, "error": "Invalid year format. Please provide a valid year (e.g., 2024)"}, status=400)

            # Validate year range
            current_year = timezone.now().year
            if year < 2000 or year > current_year + 1:
                return Response({"success": False, "error": f"Year must be between 2000 and {current_year + 1}"}, status=400)

            # Get all vaccinations for the year with monthly breakdown
            monthly_vaccinations = VaccinationHistory.objects.filter(
                date_administered__year=year
            ).annotate(
                month=ExtractMonth('date_administered')
            ).select_related(
                'vacStck_id__vac_id'
            )

            # Prepare data structure
            month_names = {
                1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
                7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
            }

            # Structure: {month: {vaccine_name: count}}
            monthly_breakdown = {month: {} for month in range(1, 13)}
            vaccine_totals = {}
            vaccine_types = {}

            for vaccination in monthly_vaccinations:
                if not vaccination.vacStck_id or not vaccination.vacStck_id.vac_id:
                    continue
                
                month = vaccination.month
                vaccine_name = vaccination.vacStck_id.vac_id.vac_name
                vaccine_type = vaccination.vacStck_id.vac_id.vac_type_choices
                resident_id = vaccination.vacrec.patrec_id.patrec_id if vaccination.vacrec and vaccination.vacrec.patrec_id else None

                # Initialize vaccine in monthly breakdown
                if vaccine_name not in monthly_breakdown[month]:
                    monthly_breakdown[month][vaccine_name] = set()
                
                # Add resident to the set (using set to avoid duplicates)
                if resident_id:
                    monthly_breakdown[month][vaccine_name].add(resident_id)
                
                # Track vaccine totals
                if vaccine_name not in vaccine_totals:
                    vaccine_totals[vaccine_name] = set()
                    vaccine_types[vaccine_name] = vaccine_type
                
                if resident_id:
                    vaccine_totals[vaccine_name].add(resident_id)

            # Convert sets to counts and prepare chart data
            chart_data = []
            for month in range(1, 13):
                month_data = {
                    'month': month_names[month],
                    'full_month': f"{month_names[month]} {year}",
                    'total_residents': 0,
                    'vaccines': []
                }
                
                # Calculate total residents for this month (unique across all vaccines)
                month_residents = set()
                for vaccine_name, residents in monthly_breakdown[month].items():
                    month_residents.update(residents)
                
                month_data['total_residents'] = len(month_residents)
                
                # Add individual vaccine counts for this month
                for vaccine_name, residents in monthly_breakdown[month].items():
                    month_data['vaccines'].append({
                        'name': vaccine_name,
                        'type': vaccine_types.get(vaccine_name, 'unknown'),
                        'residents': len(residents),
                        'percentage': (len(residents) / len(month_residents) * 100) if len(month_residents) > 0 else 0
                    })
                
                # Sort vaccines by count for consistent display
                month_data['vaccines'].sort(key=lambda x: x['residents'], reverse=True)
                chart_data.append(month_data)

            # Prepare vaccine summary data
            vaccine_summary = []
            for vaccine_name, residents in vaccine_totals.items():
                vaccine_summary.append({
                    'name': vaccine_name,
                    'type': vaccine_types.get(vaccine_name, 'unknown'),
                    'total_residents': len(residents),
                    'display_name': vaccine_name  # No dose number in display
                })

            # Sort vaccine summary by total residents
            vaccine_summary.sort(key=lambda x: x['total_residents'], reverse=True)

            # Calculate overall statistics
            total_residents_all = sum(len(residents) for residents in vaccine_totals.values())
            unique_residents_all = set()
            for residents in vaccine_totals.values():
                unique_residents_all.update(residents)

            # Monthly totals for the area chart
            monthly_totals = [
                {
                    'month': month_names[month],
                    'total_residents': chart_data[month-1]['total_residents'],
                    'vaccine_count': len(monthly_breakdown[month])
                }
                for month in range(1, 13)
            ]

            # Find peak month
            peak_month = max(monthly_totals, key=lambda x: x['total_residents'])

            return Response({
                "success": True,
                "chart_data": chart_data,
                "vaccine_summary": vaccine_summary,
                "monthly_totals": monthly_totals,
                "statistics": {
                    "year": year,
                    "total_vaccines": len(vaccine_summary),
                    "total_residents": total_residents_all,
                    "unique_residents": len(unique_residents_all),
                    "peak_month": peak_month,
                    "monthly_totals": monthly_totals
                }
            }, status=200)
            
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=500)