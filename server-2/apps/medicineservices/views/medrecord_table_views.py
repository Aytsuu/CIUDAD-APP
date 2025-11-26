from django.shortcuts import render
from rest_framework import generics, status
from django.db.models import Q, Count, OuterRef, Subquery, F
from datetime import timedelta
from django.utils.timezone import now
import json
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth, RowNumber
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from ..serializers import *
from django.db import transaction, IntegrityError
from django.utils.timezone import now
from apps.childhealthservices.models import ChildHealthSupplements, ChildHealth_History
from apps.reports.models import *
from apps.reports.serializers import *
from pagination import *
from django.db.models import Q, Prefetch
from utils import *
from apps.medicalConsultation.utils import *
from django.db.models import Window

class PatientMedicineRecordsTableView(generics.ListAPIView):
    serializer_class = PatientMedicineRecordSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Subquery to get the latest fulfilled medicine request date for each patient
        latest_medicine_subquery = MedicineRequestItem.objects.filter(
            medreq_id__patrec__pat_id=OuterRef('pat_id'),
            status='completed'
        ).order_by('-fulfilled_at').values('fulfilled_at')[:1]

        # Annotate each Patient with medicine_count and latest_medicine_date
        queryset = Patient.objects.annotate(
            medicine_count=Count(
                'patient_records__medicine_requests__items',
                filter=Q(patient_records__medicine_requests__items__status='completed'),
                distinct=True
            ),
            latest_medicine_date=Subquery(latest_medicine_subquery)
        ).filter(
            Q(patient_records__medicine_requests__items__status='completed')
        ).select_related(
            'rp_id__per',
            'trans_id',
            'trans_id__tradd_id'
        ).distinct()

        queryset = queryset.order_by('-latest_medicine_date', '-medicine_count')

        search_query = self.request.query_params.get('search', '').strip()
        if search_query and len(search_query) >= 2:
            queryset = apply_patient_search_filter(queryset, search_query)

        patient_type_search = self.request.query_params.get('patient_type', '').strip()
        if patient_type_search and patient_type_search != 'all':
            queryset = apply_patient_type_filter(queryset, patient_type_search)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        # Use the serializer to return patient details as requested
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class MedicineRecordTableView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request, pat_id):
        try:
            search_query = request.GET.get('search', '').strip()
            page_size = int(request.GET.get('page_size', 10))

            patient_records = PatientRecord.objects.filter(pat_id__pat_id=pat_id)
            medicine_items = MedicineRequestItem.objects.select_related(
                'med',
                'medreq_id',
                'medreq_id__patrec',
                'completed_by',
                'action_by'
            ).prefetch_related(
                'allocations',
                'allocations__minv',
                'allocations__minv__med_id'
            ).filter(
                medreq_id__patrec__in=patient_records,
                status='completed'  # Only include completed items  
            ).annotate(
                total_count=Window(
                    expression=Count('*'),
                    order_by=[]
                ),
                index=F('total_count') - Window(
                    expression=RowNumber(),
                    order_by=F('created_at').desc()
                ) + 1
            ).order_by('-created_at')

            if search_query:
                medicine_items = medicine_items.filter(
                    Q(med_id__med_name__icontains=search_query) |
                    Q(reason__icontains=search_query) |
                    Q(medreqitem_id__icontains=search_query) |
                    Q(med_id__cat__cat_name__icontains=search_query)
                )

            # Use the serializer to format each item
            records_data = MedicineRecordSerialzer(medicine_items, many=True).data

            paginator = self.pagination_class()
            paginator.page_size = page_size
            page_data = paginator.paginate_queryset(records_data, request)

            if page_data is not None:
                response = paginator.get_paginated_response(page_data)
                response.data['success'] = True
                response.data['count'] = medicine_items.count()  # Only count completed items
                return response

            return Response({
                'success': True,
                'results': records_data,
                'count': medicine_items.count()  # Only count completed items
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': f'Error fetching medicine records: {str(e)}',
                'results': [],
                'count': 0
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)