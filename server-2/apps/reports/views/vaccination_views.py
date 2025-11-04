from apps.inventory.models import *
from apps.vaccination.models import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.db.models import Count, Sum



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
    def get(self, request):
        try:
            # Group by vaccine stock and dose number, then get vaccine name through stock
            vaccine_resident_counts = VaccinationHistory.objects.values(
                'vacStck_id',  # vaccine stock ID
                'vacStck_id__vac_id__vac_name',  # vaccine name through stock
                'vachist_doseNo'
            ).annotate(
                total_residents=Count('vacrec__patrec_id', distinct=True)
            ).order_by('vacStck_id__vac_id__vac_name', 'vachist_doseNo')

            # Prepare response data
            response_data = [
                {
                    "vaccine_stock_id": item['vacStck_id'],
                    "vaccine_name": item['vacStck_id__vac_id__vac_name'],
                    "dose_number": item['vachist_doseNo'],
                    "total_residents": item['total_residents']
                }
                for item in vaccine_resident_counts
            ]

            return Response({"success": True, "data": response_data}, status=200)
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=500)