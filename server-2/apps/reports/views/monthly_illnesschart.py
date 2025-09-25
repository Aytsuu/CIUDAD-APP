

from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status
from apps.patientrecords.models import *
from django.db.models import Count
from django.db.models import Q


class MedicalHistoryMonthlyChart(APIView):
    def get(self, request, month):
        """
        Get surveillance illness counts for a specific month
        """
        try:
            year, month_num = map(int, month.split('-'))
            if month_num < 1 or month_num > 12:
                raise ValueError
            
            # Simple and clear: only count surveillance illnesses
            surveillance_counts = MedicalHistory.objects.filter(
                created_at__year=year,
                created_at__month=month_num,
                is_for_surveillance=True,  # Key filter
                ill__isnull=False
            ).values(
                'ill__illname'
            ).annotate(
                count=Count('medhist_id')
            ).order_by('-count')
            
            illness_data = {
                item['ill__illname']: item['count'] 
                for item in surveillance_counts
            }
            
            return Response({
                'success': True,
                'month': month,
                'month_name': f"{month_num:02d}/{year}",
                'total_records': sum(illness_data.values()),
                'illness_counts': illness_data
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({
                'success': False,
                'error': 'Invalid month format. Use YYYY-MM.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)