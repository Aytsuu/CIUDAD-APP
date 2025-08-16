from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from apps.patientrecords.models import *
from apps.patientrecords.serializers import *
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import *
from apps.reports.models import MonthlyRecipientListReport
from apps.reports.serializers import *
from django.utils.timezone import now
from dateutil.relativedelta import relativedelta
from datetime import timedelta
from apps.pagination import StandardResultsPagination
from apps.healthProfiling.models import PersonalAddress



class PatientFirstaidRecordsView(generics.ListAPIView):
    serializer_class = PatientFirstaidRecordSerializer

    def get_queryset(self):
        return Patient.objects.filter(
          Q(patient_records__first_aid_records__patrec_id__isnull=False)
        ).distinct()

class IndividualFirstaidRecordView(generics.ListCreateAPIView):
    serializer_class = FirstaidRecordSerializer

    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return FirstAidRecord.objects.filter(
            patrec_id__pat_id=pat_id
        ).order_by('-created_at')  # Optional: latest first
        
class CreateFirstaidRecordView(generics.CreateAPIView):
    serializer_class = FirstaidRecordSerializer
    queryset = FirstAidRecord.objects.all()
    

class GetFirstaidRecordCountView(APIView):
    def get(self, request, pat_id):
        try:
            count = get_firstaid_record_count(pat_id)
            return Response({'pat_id': pat_id, 'firstaidrecord_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
     
class MonthlyFirstAidSummariesAPIView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            queryset = FirstAidRecord.objects.select_related(
                'finv', 'finv__inv_id', 'finv__fa_id', 'patrec'
            ).order_by('-created_at')

            # Get search query (month name or year)
            search_query = request.GET.get('search', '').strip()
            
            # Handle year/month filter
            year_param = request.GET.get('year', 'all')
            
            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        year, month = map(int, year_param.split('-'))
                        queryset = queryset.filter(
                            created_at__year=year,
                            created_at__month=month
                        )
                    else:
                        year = int(year_param)
                        queryset = queryset.filter(
                            created_at__year=year
                        )  
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Annotate and count records by month
            monthly_data = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                record_count=Count('farec_id')
            ).order_by('-month')

            formatted_data = []

            for item in monthly_data:
                month_str = item['month'].strftime('%Y-%m')
                month_name = item['month'].strftime('%B %Y')

                # Apply search filter if provided
                if search_query and search_query.lower() not in month_name.lower():
                    continue

                # Get or create report record for this month
                report_obj, created = MonthlyRecipientListReport.objects.get_or_create(
                    month_year=month_str,
                    rcp_type='FirstAid'
                )

                report_data = MonthlyRCPReportSerializer(report_obj).data

                formatted_data.append({
                    'month': month_str,
                    'record_count': item['record_count'],
                    'monthlyrcplist_id': report_obj.monthlyrcplist_id,
                    'report': report_data
                })

            # Pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(formatted_data, request)
            if page is not None:
                return paginator.get_paginated_response({
                    'success': True,
                    'data': page,
                    'total_months': len(formatted_data)
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
            
            

class MonthlyFirstAidRecordsDetailAPIView(generics.ListAPIView):
    serializer_class = FirstaidRecordSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        month = self.kwargs['month']
        
        # Validate month format (YYYY-MM)
        try:
            year, month_num = map(int, month.split('-'))
            if month_num < 1 or month_num > 12:
                raise ValueError
        except ValueError:
            return FirstAidRecord.objects.none()

        # Base queryset
        queryset = FirstAidRecord.objects.select_related(
            'finv', 'finv__inv_id', 'finv__fa_id', 'patrec'
        ).filter(
            created_at__year=year,
            created_at__month=month_num
        ).order_by('-created_at')

        # Search functionality
        # Search functionality
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            
            matching_person_ids = PersonalAddress.objects.filter(
            Q(add__add_city__icontains=search_query) |
            Q(add__add_barangay__icontains=search_query)|
            Q(add__add_street__icontains=search_query)|
            Q(add__add_external_sitio__icontains=search_query)|
            Q(add__add_province__icontains=search_query) |
            Q(add__sitio__sitio_name__icontains=search_query)

            ).values_list('per', flat=True)

            queryset = queryset.filter(
                Q(patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(patrec__pat_id__rp_id__per__per_mname__icontains=search_query) |
                Q(patrec__pat_id__rp_id__per__per_lname__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tran_lname__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tran_fname__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tran_mname__icontains=search_query) |
                Q(finv__fa_id__fa_name__icontains=search_query)|
                Q(patrec__pat_id__rp_id__per__in=matching_person_ids)|
                Q(patrec__pat_id__trans_id__tradd_id__tradd_province__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_city__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_barangay__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_sitio__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_street__icontains=search_query)      
                    )

        return queryset

    def list(self, request, *args, **kwargs):
        month = self.kwargs['month']
        
        # Get or create report record for this month
        report_obj, created = MonthlyRecipientListReport.objects.get_or_create(
            month_year=month,
            rcp_type='FirstAid'
        )

        # Get paginated data
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'month': month,
                'record_count': queryset.count(),
                'monthlyrcplist_id': report_obj.monthlyrcplist_id,
                'report': MonthlyRCPReportSerializer(report_obj).data,
                'records': serializer.data
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
        
   
   
class MonthlyFirstAidChart(APIView):
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

            # Get first aid item counts for the specified month
            queryset = FirstAidRecord.objects.filter(
                created_at__year=year,
                created_at__month=month_num
            ).values(
                'finv__fa_id__fa_name'  # Path to first aid item name
            ).annotate(
                count=Count('finv__fa_id')
            ).order_by('-count')

            # Convert to dictionary format {item_name: count}
            item_counts = {
                item['finv__fa_id__fa_name']: item['count'] 
                for item in queryset
            }

            return Response({
                'success': True,
                'month': month,
                'first_aid_counts': item_counts,
                'total_records': sum(item_counts.values())
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class FirstAidTotalCountAPIView(APIView):
    def get(self, request):
        try:
            # Count total records
            total_records = FirstAidRecord.objects.count()

            # Count records grouped by first aid item
            items_count = FirstAidRecord.objects.values(
                'finv__fa_id__fa_name'
            ).annotate(
                count=Count('farec_id')
            ).order_by('-count')

            return Response({
                'success': True,
                'total_records': total_records,
                'items_count': items_count
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)