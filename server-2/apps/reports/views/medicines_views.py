
from django.shortcuts import render
from rest_framework import generics
from django.db.models import Q, Count, Sum
from datetime import timedelta
from django.utils.timezone import now
import json
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from ..serializers import *
from ..utils import *
from rest_framework.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.utils.timezone import now
from apps.childhealthservices.models import ChildHealthSupplements,ChildHealth_History
from apps.reports.models import *
from apps.reports.serializers import *
from pagination import *
from django.db.models import Q, Prefetch
from utils import *  # Assuming you have this
from apps.medicineservices.serializers import MedicineRecordSerialzer



class MonthlyMedicineSummariesAPIView(APIView):
    def get(self, request):
        try:
            queryset = MedicineRecord.objects.select_related(
                'minv_id', 
                'minv_id__inv_id', 
                'minv_id__med_id',  
                'patrec_id'
            ).order_by('-fulfilled_at')

            year_param = request.GET.get('year')  # '2025' or '2025-07'

            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        year, month = map(int, year_param.split('-'))
                        queryset = queryset.filter(
                            fulfilled_at__year=year,
                            fulfilled_at__month=month
                        )
                    else:
                        year = int(year_param)
                        queryset = queryset.filter(
                            fulfilled_at__year=year
                        )  
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Annotate and count records by month
            monthly_data = queryset.annotate(
                month=TruncMonth('fulfilled_at')
            ).values('month').annotate(
                record_count=Count('medrec_id')
            ).order_by('-month')

            formatted_data = []

            for item in monthly_data:
                month_str = item['month'].strftime('%Y-%m')

                # Get or create report record for this month
                report_obj, created = MonthlyRecipientListReport.objects.get_or_create(
                    month_year=month_str,
                    rcp_type='Medicine'
                )

                report_data = MonthlyRCPReportSerializer(report_obj).data

                formatted_data.append({
                    'month': month_str,
                    'record_count': item['record_count'],
                    'monthlyrcplist_id': report_obj.monthlyrcplist_id,
                    'report': report_data
                })

            return Response({
                'success': True,
                'data': formatted_data,
                'total_months': len(formatted_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({ 
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class MonthlyMedicineRecordsRCPDetailAPIView(APIView):
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

            # Get records for the specified month
            queryset = MedicineRecord.objects.select_related(
                'minv_id', 
                'minv_id__inv_id', 
                'minv_id__med_id',  
                'patrec_id'
            ).filter(
                fulfilled_at__year=year,
                fulfilled_at__month=month_num
            ).order_by('-fulfilled_at')

            # Get or create report record for this month
            report_obj, created = MonthlyRecipientListReport.objects.get_or_create(
                month_year=month,
                rcp_type='Medicine'
            )

            report_data = MonthlyRCPReportSerializer(report_obj).data
            serialized_records = [
                MedicineRecordSerialzer(record).data for record in queryset
            ]

            return Response({
                'success': True,
                'data': {
                    'month': month,
                    'record_count': len(serialized_records),
                    'monthlyrcplist_id': report_obj.monthlyrcplist_id,
                    'report': report_data,
                    'records': serialized_records
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class MonthlyMedicineChart(APIView):
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

            # Get medicine counts for the specified month
            queryset = MedicineRecord.objects.filter(
                fulfilled_at__year=year,
                fulfilled_at__month=month_num
            ).values(
                'minv_id__med_id__med_name'  # Assuming this is the path to medicine name
            ).annotate(
                count=Count('minv_id__med_id')
            ).order_by('-count')

            # Convert to dictionary format {medicine_name: count}
            medicine_counts = {
                item['minv_id__med_id__med_name']: item['count'] 
                for item in queryset
            }

            return Response({
                'success': True,
                'month': month,
                'medicine_counts': medicine_counts,
                'total_records': sum(medicine_counts.values())
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)