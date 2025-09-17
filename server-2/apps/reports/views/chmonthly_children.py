# Standard library imports
from datetime import datetime, timedelta
from django.db.models import Q, Prefetch, OuterRef, Subquery, Count
from django.db.models.functions import TruncMonth
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

# Local app imports
from apps.childhealthservices.models import *
from apps.childhealthservices.serializers import *
from ..utils import *
from apps.patientrecords.models import *
from apps.patientrecords.serializers.bodymesurement_serializers import BodyMeasurementSerializer
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import *



class MonthlyNewChildrenCountAPIView(APIView):
    """
    API View to get monthly counts of child health records
    Returns months with record counts based on created_at field
    """
    
    def get(self, request):
        try:
            # Get year filter if provided
            year = request.GET.get('year', '').strip()
            
            # Query to get monthly counts
            queryset = ChildHealthrecord.objects.all()
            
            if year:
                queryset = queryset.filter(created_at__year=year)
            
            monthly_counts = (
                queryset
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(count=Count('chrec_id'))
                .order_by('-month')
            )
            
            # Format the response
            formatted_data = []
            for item in monthly_counts:
                formatted_data.append({
                    'year': item['month'].year,
                    'month': item['month'].month,
                    'month_name': item['month'].strftime('%B'),
                    'year_month': item['month'].strftime('%Y-%m'),
                    'count': item['count']
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
            
            
            
   

class MonthlyNewChildrenDetailAPIView(APIView):
    """
    API View to get detailed child health records for a specific month
    Returns all child records created in the specified month
    """
    pagination_class = StandardResultsPagination
    
    def get(self, request, year, month):
        try:
            # Validate year and month
            try:
                year_int = int(year)
                month_int = int(month)
                if not (1 <= month_int <= 12):
                    raise ValueError("Month must be between 1-12")
            except ValueError:
                return Response({
                    'success': False,
                    'error': 'Invalid year or month format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get records for the specified month
            queryset = ChildHealthrecord.objects.filter(
                created_at__year=year_int,
                created_at__month=month_int
            ).select_related(
                'patrec', 
                'patrec__pat', 
                'patrec__pat__rp_id', 
                'patrec__pat__rp_id__per',
                'patrec__pat__trans_id',
                'staff'
            ).order_by('-created_at')
            
            # Apply search filter if provided
            search_query = request.GET.get('search', '').strip()
            if search_query:
                queryset = queryset.filter(
                    Q(patrec__pat__pat_id__icontains=search_query) |
                    Q(patrec__pat__rp_id__per__per_fname__icontains=search_query) |
                    Q(patrec__pat__rp_id__per__per_lname__icontains=search_query) |
                    Q(patrec__pat__trans_id__tran_fname__icontains=search_query) |
                    Q(patrec__pat__trans_id__tran_lname__icontains=search_query) |
                    Q(ufc_no__icontains=search_query) |
                    Q(family_no__icontains=search_query)
                )
            
            # Pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            if page is not None:
                serializer = ChildHealthrecordSerializer(page, many=True)
                return paginator.get_paginated_response({
                    'success': True,
                    'data': serializer.data,
                    'month': month_int,
                    'month_name': f"{year_int}-{month_int:02d}",
                    'total_records': queryset.count()
                })
            
            serializer = ChildHealthrecordSerializer(queryset, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'month': month_int,
                'month_name': f"{year_int}-{month_int:02d}",
                'total_records': queryset.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)