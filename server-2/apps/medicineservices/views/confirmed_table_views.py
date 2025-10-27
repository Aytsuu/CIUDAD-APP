from django.shortcuts import render
from rest_framework import generics,status
from django.db.models import Q, Count, Sum
from datetime import timedelta
from django.utils.timezone import now
import json
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError


from ..serializers import *
from django.db import transaction, IntegrityError
from django.utils.timezone import now
from apps.childhealthservices.models import ChildHealthSupplements,ChildHealth_History
from apps.reports.models import *
from apps.reports.serializers import *
from pagination import *
from django.db.models import Q, Prefetch
from utils import * 




class MedicineRequestProcessingTableView(generics.ListCreateAPIView):
    serializer_class = MedicineRequestSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        # Get the search query and date filter from request parameters
        search_query = self.request.GET.get('search', '').strip()
        date_filter = self.request.GET.get('date_filter', 'all').strip()
        
        # Get all MedicineRequest IDs that have at least one processing item
        processing_request_ids = MedicineRequestItem.objects.filter(
            status='confirmed'
        ).values_list('medreq_id', flat=True).distinct()
        
        # Base queryset for medicine requests that have processing items
        queryset = MedicineRequest.objects.filter(
            medreq_id__in=processing_request_ids,
        ).select_related(
            'rp_id', 'trans_id',
            'rp_id__per',  # Requesting physician personal info
        ).prefetch_related(
            'items',  # Medicine request items
            'items__minv_id',  # Medicine inventory
            'items__minv_id__med_id',  # Medicine details
            'items__med',  # Alternative medicine reference
            'rp_id__per__personal_addresses__add',  # Physician addresses
            'rp_id__per__personal_addresses__add__sitio',  # Physician sitios
        ).order_by('-requested_at')
        
        # Apply search filter if provided
        if search_query:
            queryset = queryset.filter(
             
                # Search by physician information
                Q(rp_id__per__per_lname__icontains=search_query) |
                Q(rp_id__per__per_fname__icontains=search_query) |
                Q(rp_id__per__per_mname__icontains=search_query) |
                Q(rp_id__per__per_contact__icontains=search_query) |
                
                # Search by IDs
                Q(medreq_id__icontains=search_query) |
                Q(pat_id__pat_id__icontains=search_query) |
                Q(rp_id__rp_id__icontains=search_query) |
                
                # Search by medicine names in items
                Q(items__minv_id__med_id__med_name__icontains=search_query) |
                Q(items__med__med_name__icontains=search_query) |
             
                # Search by physician address information
                Q(rp_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |
                
              
                Q(rp_id__respondents_info__fam__fam_id__icontains=search_query) |
                Q(rp_id__respondents_info__fam__hh__hh_id__icontains=search_query)
            ).distinct()
        
        # Apply date filter if provided
        if date_filter != 'all':
            today = datetime.now().date()
            
            if date_filter == 'today':
                # Filter for today's requests
                queryset = queryset.filter(requested_at__date=today)
                
            elif date_filter == 'this-week':
                # Filter for this week's requests (Monday to Sunday)
                start_of_week = today - timedelta(days=today.weekday())
                queryset = queryset.filter(requested_at__date__gte=start_of_week)
                
            elif date_filter == 'this-month':
                # Filter for this month's requests
                start_of_month = today.replace(day=1)
                queryset = queryset.filter(requested_at__date__gte=start_of_month)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                                # Count the number of confirmed MedicineRequestItem entries
                total_medicines_count = MedicineRequestItem.objects.filter(
                    medreq_id__in=queryset.values_list('medreq_id', flat=True),
                    status='confirmed'
                ).count()  
                response = self.get_paginated_response(serializer.data)
                response.data['total_medicines_quantity'] = total_medicines_count
                return response
            
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'success': True,
                'results': serializer.data,
                'count': len(serializer.data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': f'Error fetching medicine requests: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR())
    


    
    
    
         
         
         