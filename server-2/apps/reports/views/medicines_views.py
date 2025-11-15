from django.shortcuts import render
from rest_framework import generics
from django.db.models import Q, Count, Sum
from datetime import datetime, timedelta
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
from apps.inventory.models import Category
from apps.patientrecords.models import Patient


class MonthlyMedicineSummariesAPIView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            queryset = MedicineRequestItem.objects.select_related(
                'medreq_id', 
                'med', 
                'action_by', 
                'completed_by'
            ).order_by('-fulfilled_at').filter(
                status='completed'
            )

            search_query = request.GET.get('search', '').strip().lower()

            # Annotate and count records by month
            monthly_data = queryset.annotate(
                month=TruncMonth('fulfilled_at')
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





class MonthlyMedicineRecordsRCPDetailAPIView(generics.ListAPIView):
    serializer_class = MedicineRecordBaseSerialzer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        month = self.kwargs['month']
        
        # Validate month format (YYYY-MM)
        try:
            year, month_num = map(int, month.split('-'))
            if month_num < 1 or month_num > 12:
                raise ValueError
        except ValueError:
            return MedicineRequestItem.objects.none()

        # Base queryset - get completed medicine request items for the specified month
        queryset = MedicineRequestItem.objects.select_related(
            'medreq_id',
            'medreq_id__patrec',
            'medreq_id__patrec__pat_id',
            'medreq_id__patrec__pat_id__rp_id',
            'medreq_id__patrec__pat_id__rp_id__per',
            'medreq_id__patrec__pat_id__trans_id',
            'medreq_id__patrec__pat_id__trans_id__tradd_id',
            'med',
            'action_by',
            'completed_by'
        ).prefetch_related(
            'allocations',
            'allocations__minv'
        ).filter(
            fulfilled_at__year=year,
            fulfilled_at__month=month_num,
            status='completed'
        ).order_by('-created_at')

        # Search functionality
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            # Search for resident personal info
            resident_name_query = Q(
                Q(medreq_id__patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__rp_id__per__per_mname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__rp_id__per__per_lname__icontains=search_query)
            )

            # Search for transient personal info
            transient_name_query = Q(
                Q(medreq_id__patrec__pat_id__trans_id__tran_fname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tran_mname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tran_lname__icontains=search_query)
            )

            # Search for medicine names and details
            medicine_query = Q(
                Q(med__med_name__icontains=search_query) |
                Q(med__med_dsg__icontains=search_query) |
                Q(med__med_form__icontains=search_query) |
                Q(med__med_dsg_unit__icontains=search_query)
            )

            # Search for reason
            reason_query = Q(reason__icontains=search_query)

            # Search for resident addresses
            resident_address_ids = PersonalAddress.objects.filter(
                Q(add__add_city__icontains=search_query) |
                Q(add__add_barangay__icontains=search_query) |
                Q(add__add_street__icontains=search_query) |
                Q(add__add_external_sitio__icontains=search_query) |
                Q(add__add_province__icontains=search_query) |
                Q(add__sitio__sitio_name__icontains=search_query)
            ).values_list('per', flat=True)

            resident_address_query = Q(medreq_id__patrec__pat_id__rp_id__per__in=resident_address_ids)

            # Search for transient addresses
            transient_address_query = Q(
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_province__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_city__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_barangay__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_sitio__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_street__icontains=search_query)
            )

            # Combine all search queries
            queryset = queryset.filter(
                resident_name_query |
                transient_name_query |
                medicine_query |
                reason_query |
                resident_address_query |
                transient_address_query
            )

        return queryset

    def list(self, request, *args, **kwargs):
        month = self.kwargs['month']
        
        # Get or create report record for this month
        report_obj, created = MonthlyRecipientListReport.objects.get_or_create(
            month_year=month,
            rcp_type='Medicine'
        )

        # Get paginated data
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            
            return self.get_paginated_response({
                'success': True,
                'data': {
                    'month': month,
                    'record_count': queryset.count(),
                    'monthlyrcplist_id': report_obj.monthlyrcplist_id,
                    'report': MonthlyRCPReportSerializer(report_obj).data,
                    'records': serializer.data
                }
            })

        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': {
                'month': month,
                'record_count': queryset.count(),
                'monthlyrcplist_id': report_obj.monthlyrcplist_id,
                'report': MonthlyRCPReportSerializer(report_obj).data,
                'records': serializer.data
            }
        }, status=status.HTTP_200_OK)
   
    

















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
                fulfilled_at__year=year,
                fulfilled_at__month=month_num
            ).values(
                'med__med_name',
                'med__med_dsg',
                'med__med_dsg_unit',
                'med__med_form'
            ).annotate(
                count=Count('med')
            ).order_by('-count')

            # Convert to dictionary format {medicine_name: count}
            # Combine medicine fields into a single label (e.g., "Biogens 10mg Tablet")
            medicine_counts = {}
            for item in queryset:
                label = f"{item['med__med_name']} {item['med__med_dsg']}{item['med__med_dsg_unit']} {item['med__med_form']}".strip()
                medicine_counts[label] = item['count']

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
        



# ==================DEWORMING REPORT=======================
class DewormingRecipientListAPIView(generics.ListAPIView):
    """
    View to get all patients who have received deworming medication.
    Includes search functionality for patient names, addresses, and date ranges.
    """
    serializer_class = MedicineRecordBaseSerialzer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Get the deworming category
        self.deworming_category = Category.objects.filter(cat_name__icontains='deworming').first()
        
        if not self.deworming_category:
            return MedicineRequestItem.objects.none()

        # Base queryset - get all completed medicine request items for deworming medicines
        queryset = MedicineRequestItem.objects.select_related(
            'medreq_id',
            'medreq_id__patrec',
            'medreq_id__patrec__pat_id',
            'medreq_id__patrec__pat_id__rp_id',
            'medreq_id__patrec__pat_id__rp_id__per',
            'medreq_id__patrec__pat_id__trans_id',
            'medreq_id__patrec__pat_id__trans_id__tradd_id',
            'med',
            'med__cat',
            'action_by',
            'completed_by'
        ).prefetch_related(
            'allocations',
            'allocations__minv'
        ).filter(
            med__cat=self.deworming_category,
            status='completed'
        ).order_by('-fulfilled_at')

        # Date range filter
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(fulfilled_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(fulfilled_at__date__lte=end_date)

        # Search functionality
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            # Search for resident personal info
            resident_name_query = Q(
                Q(medreq_id__patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__rp_id__per__per_mname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__rp_id__per__per_lname__icontains=search_query)
            )

            # Search for transient personal info
            transient_name_query = Q(
                Q(medreq_id__patrec__pat_id__trans_id__tran_fname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tran_mname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tran_lname__icontains=search_query)
            )

            # Search for medicine names
            medicine_query = Q(med__med_name__icontains=search_query)

            # Search for resident addresses
            resident_address_ids = PersonalAddress.objects.filter(
                Q(add__add_city__icontains=search_query) |
                Q(add__add_barangay__icontains=search_query) |
                Q(add__add_street__icontains=search_query) |
                Q(add__add_external_sitio__icontains=search_query) |
                Q(add__add_province__icontains=search_query) |
                Q(add__sitio__sitio_name__icontains=search_query)
            ).values_list('per', flat=True)

            resident_address_query = Q(medreq_id__patrec__pat_id__rp_id__per__in=resident_address_ids)

            # Search for transient addresses
            transient_address_query = Q(
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_province__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_city__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_barangay__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_sitio__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_street__icontains=search_query)
            )

            # Combine all search queries
            queryset = queryset.filter(
                resident_name_query |
                transient_name_query |
                medicine_query |
                resident_address_query |
                transient_address_query
            )

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            
            return self.get_paginated_response({
                'success': True,
                'data': {
                    'total_recipients': queryset.count(),
                    'deworming_category': self.deworming_category.cat_name if self.deworming_category else None,
                    'records': serializer.data
                }
            })

        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': {
                'total_recipients': queryset.count(),
                'deworming_category': self.deworming_category.cat_name if self.deworming_category else None,
                'records': serializer.data
            }
        }, status=status.HTTP_200_OK)


class DewormingMonthlyReportAPIView(APIView):
    """
    View to get monthly summary of deworming recipients.
    Groups deworming records by month.
    """
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get the deworming category
            deworming_category = Category.objects.filter(cat_name__icontains='deworming').first()
            
            if not deworming_category:
                return Response({
                    'success': False,
                    'error': 'Deworming category not found in the system.'
                }, status=status.HTTP_404_NOT_FOUND)

            queryset = MedicineRequestItem.objects.filter(
                med__cat=deworming_category,
                status='completed'
            ).select_related('med')

            search_query = request.GET.get('search', '').strip().lower()
            year_param = request.GET.get('year', 'all')

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
                        queryset = queryset.filter(fulfilled_at__year=year)
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid year format. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Get distinct months with counts
            monthly_data = queryset.annotate(
                month=TruncMonth('fulfilled_at')
            ).values('month').annotate(
                recipient_count=Count('medreqitem_id', distinct=True),
                total_doses=Sum('allocations__allocated_qty')
            ).order_by('-month')

            formatted_months = []

            for item in monthly_data:
                month_date = item['month']
                if not month_date:
                    continue
                    
                month_str = month_date.strftime('%Y-%m')
                month_name = month_date.strftime('%B %Y')

                if search_query and search_query not in month_name.lower():
                    continue

                formatted_months.append({
                    'month': month_str,
                    'month_name': month_name,
                    'recipient_count': item['recipient_count'],
                    'total_doses_dispensed': item['total_doses'] or 0,
                })

            paginator = self.pagination_class()
            page = paginator.paginate_queryset(formatted_months, request)
            if page is not None:
                return paginator.get_paginated_response({
                    'success': True,
                    'data': page,
                    'total_months': len(formatted_months),
                    'deworming_category': deworming_category.cat_name,
                })

            return Response({
                'success': True,
                'data': formatted_months,
                'total_months': len(formatted_months),
                'deworming_category': deworming_category.cat_name,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DewormingMonthlyDetailAPIView(generics.ListAPIView):
    """
    View to get detailed list of deworming recipients for a specific month.
    """
    serializer_class = MedicineRecordBaseSerialzer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        month = self.kwargs['month']
        
        # Validate month format (YYYY-MM)
        try:
            year, month_num = map(int, month.split('-'))
            if month_num < 1 or month_num > 12:
                raise ValueError
        except ValueError:
            return MedicineRequestItem.objects.none()

        # Get the deworming category
        self.deworming_category = Category.objects.filter(cat_name__icontains='deworming').first()
        
        if not self.deworming_category:
            return MedicineRequestItem.objects.none()

        # Base queryset
        queryset = MedicineRequestItem.objects.select_related(
            'medreq_id',
            'medreq_id__patrec',
            'medreq_id__patrec__pat_id',
            'medreq_id__patrec__pat_id__rp_id',
            'medreq_id__patrec__pat_id__rp_id__per',
            'medreq_id__patrec__pat_id__trans_id',
            'medreq_id__patrec__pat_id__trans_id__tradd_id',
            'med',
            'med__cat',
            'action_by',
            'completed_by'
        ).prefetch_related(
            'allocations',
            'allocations__minv'
        ).filter(
            fulfilled_at__year=year,
            fulfilled_at__month=month_num,
            med__cat=self.deworming_category,
            status='completed'
        ).order_by('-fulfilled_at')

        # Search functionality
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            resident_name_query = Q(
                Q(medreq_id__patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__rp_id__per__per_mname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__rp_id__per__per_lname__icontains=search_query)
            )

            transient_name_query = Q(
                Q(medreq_id__patrec__pat_id__trans_id__tran_fname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tran_mname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tran_lname__icontains=search_query)
            )

            medicine_query = Q(med__med_name__icontains=search_query)

            resident_address_ids = PersonalAddress.objects.filter(
                Q(add__add_city__icontains=search_query) |
                Q(add__add_barangay__icontains=search_query) |
                Q(add__add_street__icontains=search_query) |
                Q(add__add_external_sitio__icontains=search_query) |
                Q(add__add_province__icontains=search_query) |
                Q(add__sitio__sitio_name__icontains=search_query)
            ).values_list('per', flat=True)

            resident_address_query = Q(medreq_id__patrec__pat_id__rp_id__per__in=resident_address_ids)

            transient_address_query = Q(
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_province__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_city__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_barangay__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_sitio__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tradd_id__tradd_street__icontains=search_query)
            )

            queryset = queryset.filter(
                resident_name_query |
                transient_name_query |
                medicine_query |
                resident_address_query |
                transient_address_query
            )

        return queryset

    def list(self, request, *args, **kwargs):
        month = self.kwargs['month']
        
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            
            return self.get_paginated_response({
                'success': True,
                'data': {
                    'month': month,
                    'recipient_count': queryset.count(),
                    'deworming_category': self.deworming_category.cat_name if self.deworming_category else None,
                    'records': serializer.data
                }
            })

        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': {
                'month': month,
                'recipient_count': queryset.count(),
                'deworming_category': self.deworming_category.cat_name if self.deworming_category else None,
                'records': serializer.data
            }
        }, status=status.HTTP_200_OK)