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
from apps.medicineservices.serializers import *

class MonthlyMedicineSummariesAPIView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            queryset = MedicineRequestItem.objects.select_related(
                'medreq_id', 
                'med', 
                'action_by', 
                'completed_by'
            ).order_by('-medreq_id__fuollfilled_at').filter(
                status='completed'
            )

            search_query = request.GET.get('search', '').strip().lower()

            # Annotate and count records by month
            monthly_data = queryset.annotate(
                month=TruncMonth('medreq_id__fulfilled_at')
            ).values('month').annotate(
                record_count=Count('medreqitem_id')
            ).order_by('-month')

            formatted_data = []

            for item in monthly_data:
                month_value = item['month']
                if not month_value:
                    continue  # Skip records with invalid or missing month

                month_str = month_value.strftime('%Y-%m')
                month_name = month_value.strftime('%B %Y')
                short_month_name = month_value.strftime('%b %Y')
                year_only = month_value.strftime('%Y')
                month_only = month_value.strftime('%B')

                # Apply search filter if provided
                if search_query:
                    matches_search = (
                        search_query in month_name.lower() or
                        search_query in short_month_name.lower() or
                        search_query in year_only.lower() or
                        search_query in month_only.lower() or
                        search_query in month_str
                    )
                    if not matches_search:
                        continue

                # Get or create report record for this month
                report_obj, created = MonthlyRecipientListReport.objects.get_or_create(
                    month_year=month_str,
                    rcp_type='Medicine'
                )

                if created:
                    report_obj.save()  # Ensure the report is saved if newly created

                report_data = MonthlyRCPReportSerializer(report_obj).data

                formatted_data.append({
                    'month': month_str,
                    'record_count': item['record_count'],
                    'month_name': month_name,
                    'monthlyrcplist_id': report_obj.monthlyrcplist_id,
                    'report': report_data
                })

            # Apply pagination
            paginator = self.pagination_class()
            paginated_data = paginator.paginate_queryset(formatted_data, request, view=self)
            
            response_data = {
                'success': True,
                'data': paginated_data,
                'total_months': len(formatted_data)
            }
            
            return paginator.get_paginated_response(response_data)

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
            queryset = MedicineRequestItem.objects.select_related(
                'medreq_id', 
                'med', 
                'action_by', 
                'completed_by'
            ).filter(
                medreq_id__fulfilled_at__year=year,
                medreq_id__fulfilled_at__month=month_num,
                status='completed'
            ).order_by('-created_at')

            # Get or create report record for this month
            report_obj, created = MonthlyRecipientListReport.objects.get_or_create(
                month_year=month,
                rcp_type='Medicine'
            )

            report_data = MonthlyRCPReportSerializer(report_obj).data
            serialized_records = MedicineRecordSerialzer(queryset, many=True).data  # Updated to serialize the queryset directly

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

            # Get the monthly recipient list ID for medicine type
            try:
                monthly_report = MonthlyRecipientListReport.objects.get(
                    month_year=month,
                    rcp_type='Medicine'
                )
                monthly_id = monthly_report.monthlyrcplist_id
            except MonthlyRecipientListReport.DoesNotExist:
                monthly_id = None

            # Get medicine counts for the specified month
            queryset = MedicineRequestItem.objects.filter(
                medreq_id__fulfilled_at__year=year,
                medreq_id__fulfilled_at__month=month_num
            ).values(
                'med__med_name'  # Assuming this is the path to medicine name
            ).annotate(
                count=Count('med')
            ).order_by('-count')

            # Convert to dictionary format {medicine_name: count}
            medicine_counts = {
                item['med__med_name']: item['count'] 
                for item in queryset
            }

            return Response({
                'success': True,
                'month': month,
                'monthly_report_id': monthly_id,
                'medicine_counts': medicine_counts,
                'total_records': sum(medicine_counts.values())
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)