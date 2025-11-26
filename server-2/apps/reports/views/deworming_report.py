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
from apps.childhealthservices.models import ChildHealthSupplements, ChildHealth_History
from apps.reports.models import *
from apps.reports.serializers import *
from pagination import *
from django.db.models import Q, Prefetch
from utils import *
from apps.medicineservices.serializers import *
from apps.inventory.models import Category
from apps.patientrecords.models import Patient



class DewormingMonthlyReportAPIView(APIView):
    """
    View to get yearly summary of deworming recipients grouped by rounds.
    Round 1: January to June
    Round 2: July to December
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

            # Get distinct years
            distinct_years = queryset.dates('fulfilled_at', 'year', order='DESC')

            formatted_years = []

            for year_date in distinct_years:
                year = year_date.year
                year_str = str(year)

                if search_query and search_query not in year_str:
                    continue

                # Round 1: January to June
                round1_queryset = queryset.filter(
                    fulfilled_at__year=year,
                    fulfilled_at__month__gte=1,
                    fulfilled_at__month__lte=6
                )
                
                round1_count = round1_queryset.values('medreq_id__patrec__pat_id').distinct().count()
                round1_doses = round1_queryset.aggregate(
                    total=Sum('allocations__allocated_qty')
                )['total'] or 0

                # Round 2: July to December
                round2_queryset = queryset.filter(
                    fulfilled_at__year=year,
                    fulfilled_at__month__gte=7,
                    fulfilled_at__month__lte=12
                )
                
                round2_count = round2_queryset.values('medreq_id__patrec__pat_id').distinct().count()
                round2_doses = round2_queryset.aggregate(
                    total=Sum('allocations__allocated_qty')
                )['total'] or 0

                formatted_years.append({
                    'year': year_str,
                    'rounds': [
                        {
                            'round_number': 1,
                            'round_name': 'Deworming Round 1',
                            'period': 'January - June',
                            'recipient_count': round1_count,
                            'total_doses_dispensed': round1_doses,
                        },
                        {
                            'round_number': 2,
                            'round_name': 'Deworming Round 2',
                            'period': 'July - December',
                            'recipient_count': round2_count,
                            'total_doses_dispensed': round2_doses,
                        }
                    ],
                    'total_recipients': round1_count + round2_count,
                    'total_doses': round1_doses + round2_doses,
                })

            paginator = self.pagination_class()
            page = paginator.paginate_queryset(formatted_years, request)
            if page is not None:
                return paginator.get_paginated_response({
                    'success': True,
                    'data': page,
                    'total_years': len(formatted_years),
                    'deworming_category': deworming_category.cat_name,
                })

            return Response({
                'success': True,
                'data': formatted_years,
                'total_years': len(formatted_years),
                'deworming_category': deworming_category.cat_name,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DewormingMonthlyDetailAPIView(generics.ListAPIView):
    """
    View to get detailed list of deworming recipients for a specific year and round.
    Supports filtering by round: round=1 (Jan-June) or round=2 (July-Dec)
    If no round specified, returns all records for the year.
    """
    serializer_class = MedicineRecordBaseSerialzer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        year_param = self.kwargs['year']  # Format: YYYY
        
        # Parse year
        try:
            self.year = int(year_param)
            self.specific_month = None
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
            fulfilled_at__year=self.year,
            med__cat=self.deworming_category,
            status='completed'
        )

        # Check for round parameter
        round_param = self.request.query_params.get('round', None)
        if round_param:
            try:
                round_num = int(round_param)
                if round_num == 1:
                    # Round 1: January to June
                    queryset = queryset.filter(fulfilled_at__month__gte=1, fulfilled_at__month__lte=6)
                    self.round_name = "Deworming Round 1 (January - June)"
                elif round_num == 2:
                    # Round 2: July to December
                    queryset = queryset.filter(fulfilled_at__month__gte=7, fulfilled_at__month__lte=12)
                    self.round_name = "Deworming Round 2 (July - December)"
                else:
                    self.round_name = None
            except ValueError:
                self.round_name = None
        else:
            self.round_name = None

        queryset = queryset.order_by('-fulfilled_at')

        # Search functionality (match medicine monthly detail logic)
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            # Resident personal info
            resident_name_query = Q(
                Q(medreq_id__patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__rp_id__per__per_mname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__rp_id__per__per_lname__icontains=search_query)
            )

            # Transient personal info
            transient_name_query = Q(
                Q(medreq_id__patrec__pat_id__trans_id__tran_fname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tran_mname__icontains=search_query) |
                Q(medreq_id__patrec__pat_id__trans_id__tran_lname__icontains=search_query)
            )

            # Medicine fields
            medicine_query = Q(
                Q(med__med_name__icontains=search_query) |
                Q(med__med_dsg__icontains=search_query) |
                Q(med__med_form__icontains=search_query) |
                Q(med__med_dsg_unit__icontains=search_query)
            )

            # Reason
            reason_query = Q(reason__icontains=search_query)

            # Resident addresses
            resident_address_ids = PersonalAddress.objects.filter(
                Q(add__add_city__icontains=search_query) |
                Q(add__add_barangay__icontains=search_query) |
                Q(add__add_street__icontains=search_query) |
                Q(add__add_external_sitio__icontains=search_query) |
                Q(add__add_province__icontains=search_query) |
                Q(add__sitio__sitio_name__icontains=search_query)
            ).values_list('per', flat=True)
            resident_address_query = Q(medreq_id__patrec__pat_id__rp_id__per__in=resident_address_ids)

            # Transient addresses
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
                reason_query |
                resident_address_query |
                transient_address_query
            )

        return queryset

    def list(self, request, *args, **kwargs):
        year_param = self.kwargs['year']
        
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        # Build response data
        response_data = {
            'year': str(self.year),
            'recipient_count': queryset.count(),
            'deworming_category': self.deworming_category.cat_name if self.deworming_category else None,
        }
        
        # Add round info if applicable
        if hasattr(self, 'round_name') and self.round_name:
            response_data['round'] = self.round_name
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response_data['records'] = serializer.data
            
            return self.get_paginated_response({
                'success': True,
                'data': response_data
            })

        serializer = self.get_serializer(queryset, many=True)
        response_data['records'] = serializer.data
        
        return Response({
            'success': True,
            'data': response_data
        }, status=status.HTTP_200_OK)
