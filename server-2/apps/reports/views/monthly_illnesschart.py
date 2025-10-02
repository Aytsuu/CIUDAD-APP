

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
            # Parse and validate the month input
            year, month_num = map(int, month.split('-'))
            if month_num < 1 or month_num > 12:
                raise ValueError("Month must be between 1 and 12.")
            
            # Query to count distinct surveillance illnesses per distinct patient
            surveillance_counts = (
                MedicalHistory.objects
                .filter(
                    created_at__year=year,
                    created_at__month=month_num,
                    ill__isnull=False
                )
                .values('ill__illname')
                .annotate(count=Count('patrec__pat_id', distinct=True))
                .order_by('-count')
            )
            
            # Format the illness data
            illness_data = {
                item['ill__illname']: item['count']
                for item in surveillance_counts
            }
            
            # Construct the response
            return Response(
                {
                    'success': True,
                    'month': month,
                    'month_name': f"{month_num:02d}/{year}",
                    'total_records': sum(illness_data.values()),
                    'illness_counts': illness_data,
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as ve:
            # Handle invalid month format
            return Response(
                {
                    'success': False,
                    'error': str(ve),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            # Handle unexpected errors
            return Response(
                {
                    'success': False,
                    'error': str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
