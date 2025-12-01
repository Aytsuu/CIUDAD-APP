from django.shortcuts import render
from rest_framework import generics, status
from django.db.models import Q, Count, Sum, Case, When, IntegerField
from datetime import timedelta, datetime
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
from apps.childhealthservices.models import ChildHealthSupplements, ChildHealth_History
from apps.reports.models import *
from apps.reports.serializers import *
from pagination import *
from django.db.models import Q, Prefetch
from utils import *





class MedicineRequestStatusTableView(generics.ListCreateAPIView):
    """
    MAIN TABLE FOR PROCESSED MEDICINE REQUESTS
    Shows medicine requests that have been processed (confirmed, cancelled, or referred)
    Can be filtered by status parameter: ?status=all|confirmed|cancelled|referred
    Handles rp_id and trans_id cases only (pat_id removed)
    """
    serializer_class = MedicineRequestSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        search_query = self.request.GET.get('search', '').strip()
        date_filter = self.request.GET.get('date_filter', 'all').strip()
        status_filter = self.request.GET.get('status', 'all').strip()

        if status_filter == 'all':
            request_ids = MedicineRequestItem.objects.filter(
                status__in=['rejected', 'cancelled', 'referred', 'completed']
            ).values_list('medreq_id', flat=True).distinct()
        else:
            request_ids = MedicineRequestItem.objects.filter(
                status=status_filter
            ).values_list('medreq_id', flat=True).distinct()

        queryset = MedicineRequest.objects.filter(
            medreq_id__in=request_ids
        ).select_related(
            'trans_id',
            'rp_id',
            'rp_id__per',
        ).prefetch_related(
            'items',
            'items__med',
            'items__allocations',
            'items__allocations__minv',
            'items__allocations__minv__med_id',
            'rp_id__per__personal_addresses__add',
            'rp_id__per__personal_addresses__add__sitio',
        ).annotate(
            total_items=Count('items', distinct=True),
            completed_count=Count(
                Case(When(items__status='completed', then=1)),
                distinct=True
            ),
            cancelled_count=Count(
                Case(When(items__status='cancelled', then=1)),
                distinct=True
            ),
            referred_count=Count(
                Case(When(items__status='referred', then=1)),
                distinct=True
            ),
            rejected_count=Count(
                Case(When(items__status='rejected', then=1)),
                distinct=True
            ),
            # Add annotations for timestamp fields
            latest_confirmed_at=Max('items__confirmed_at'),
            latest_cancelled_at=Max('items__cancelled_rejected_reffered_at'),
            latest_fulfilled_at=Max('items__fulfilled_at')
        ).order_by('-requested_at')

        if search_query:
            queryset = queryset.filter(
                Q(trans_id__tran_lname__icontains=search_query) |
                Q(trans_id__tran_fname__icontains=search_query) |
                Q(trans_id__tran_mname__icontains=search_query) |
                Q(trans_id__tran_contact__icontains=search_query) |
                Q(rp_id__per__per_lname__icontains=search_query) |
                Q(rp_id__per__per_fname__icontains=search_query) |
                Q(rp_id__per__per_mname__icontains=search_query) |
                Q(rp_id__per__per_contact__icontains=search_query) |
                Q(medreq_id__icontains=search_query) |
                Q(rp_id__rp_id__icontains=search_query) |
                Q(items__med__med_name__icontains=search_query) |
                Q(rp_id__per__personal_addresses__add__add_province__icontains=search_query) |
                Q(rp_id__per__personal_addresses__add__add_city__icontains=search_query) |
                Q(rp_id__per__personal_addresses__add__add_barangay__icontains=search_query) |
                Q(rp_id__per__personal_addresses__add__add_street__icontains=search_query) |
                Q(rp_id__per__personal_addresses__add__sitio__sitio_name__icontains=search_query) |
                Q(rp_id__per__personal_addresses__add__add_external_sitio__icontains=search_query) |
                Q(rp_id__respondents_info__fam__fam_id__icontains=search_query) |
                Q(rp_id__respondents_info__fam__hh__hh_id__icontains=search_query)
            ).distinct()

        if date_filter != 'all':
            today = datetime.now().date()
            if date_filter == 'today':
                queryset = queryset.filter(requested_at__date=today)
            elif date_filter == 'this-week':
                start_of_week = today - timedelta(days=today.weekday())
                queryset = queryset.filter(requested_at__date__gte=start_of_week)
            elif date_filter == 'this-month':
                start_of_month = today.replace(day=1)
                queryset = queryset.filter(requested_at__date__gte=start_of_month)

        return queryset

    def list(self, request, *args, **kwargs):
        try:
            status_filter = self.request.GET.get('status', 'all').strip()
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)

            all_request_ids = queryset.values_list('medreq_id', flat=True)

            global_completed = MedicineRequestItem.objects.filter(
                medreq_id__in=all_request_ids,
                status='completed'
            ).count()
            global_cancelled = MedicineRequestItem.objects.filter(
                medreq_id__in=all_request_ids,
                status='cancelled'
            ).count()
            global_referred = MedicineRequestItem.objects.filter(
                medreq_id__in=all_request_ids,
                status='referred'
            ).count()
            global_rejected = MedicineRequestItem.objects.filter(
                medreq_id__in=all_request_ids,
                status='rejected'
            ).count()
            global_total = global_completed + global_cancelled + global_referred + global_rejected

            enriched_data = []
            for medreq in queryset:
                total_items_count = MedicineRequestItem.objects.filter(
                    medreq_id=medreq.medreq_id
                ).count()

                total_allocated_qty = MedicineAllocation.objects.filter(
                    medreqitem__medreq_id=medreq.medreq_id
                ).aggregate(total_qty=Sum('allocated_qty'))['total_qty'] or 0

                # Get the latest timestamps for each status
                items = MedicineRequestItem.objects.filter(medreq_id=medreq.medreq_id)
                
                # Get confirmed timestamp (from any confirmed item)
                confirmed_item = items.filter(status='completed', confirmed_at__isnull=False).first()
                confirmed_at = confirmed_item.confirmed_at if confirmed_item else None
                
                # Get cancelled/rejected/referred timestamp
                cancelled_item = items.filter(
                    status__in=['cancelled', 'rejected', 'referred'], 
                    cancelled_rejected_reffered_at__isnull=False
                ).first()
                cancelled_at = cancelled_item.cancelled_rejected_reffered_at if cancelled_item else None
                
                # Get fulfilled timestamp
                fulfilled_item = items.filter(status='completed', fulfilled_at__isnull=False).first()
                fulfilled_at = fulfilled_item.fulfilled_at if fulfilled_item else None

                serialized_data = self.get_serializer(medreq).data
                serialized_data['total_items_count'] = total_items_count
                serialized_data['total_allocated_quantity'] = total_allocated_qty
                serialized_data['confirmed_at'] = confirmed_at
                serialized_data['cancelled_rejected_reffered_at'] = cancelled_at
                serialized_data['fulfilled_at'] = fulfilled_at
                enriched_data.append(serialized_data)

            if page is not None:
                response = self.get_paginated_response(enriched_data)
                response.data['global_counts'] = {
                    'completed': global_completed,
                    'cancelled': global_cancelled,
                    'referred': global_referred,
                    'rejected': global_rejected,
                    'total': global_total
                }
                response.data['status_filter'] = status_filter
                return response

            return Response({
                'success': True,
                'results': enriched_data,
                'count': len(enriched_data),
                'global_counts': {
                    'completed': global_completed,
                    'cancelled': global_cancelled,
                    'referred': global_referred,
                    'rejected': global_rejected,
                    'total': global_total
                },
                'status_filter': status_filter
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': f'Error fetching processed medicine requests: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class MedicineRequestStatusTableViewDetails(APIView):
    """
    DETAILED VIEW FOR PROCESSED MEDICINE REQUEST ITEMS
    Shows all processed items (confirmed/cancelled/referred) for a specific medicine request
    Can be filtered by status parameter: ?status=all|confirmed|cancelled|referred
    Includes allocation details for confirmed items
    Groups by medicine name, dosage, and form - separate groups for same medicine with different dosage/form
    Handles rp_id and trans_id cases only (pat_id removed)
    Handles items directly connected to minv_id
    """
    pagination_class = StandardResultsPagination

    def format_medicine_name(self, med_name, dosage, dosage_unit, form):
        formatted_name = med_name or "Unknown Medicine"
        if dosage and dosage_unit:
            formatted_name += f" {dosage}{dosage_unit}"
        elif dosage:
            formatted_name += f" {dosage}"
        if form:
            formatted_name += f" {form}"
        return formatted_name

    def get_medicine_details(self, item):
        med_id = None
        med_name = "Unknown Medicine"
        med_type = "Unknown Type"
        dosage = None
        dosage_unit = None
        form = None

        if item.med:
            med_id = item.med.med_id
            med_name = item.med.med_name
            med_type = item.med.med_type
            dosage = item.med.med_dsg
            dosage_unit = item.med.med_dsg_unit
            form = item.med.med_form

    

        formatted_name = self.format_medicine_name(med_name, dosage, dosage_unit, form)
        return med_id, med_name, med_type, dosage, dosage_unit, form, formatted_name

    def get(self, request, *args, **kwargs):
        try:
            medreq_id = self.kwargs.get('medreq_id')
            status_filter = request.GET.get('status', 'all').strip()

            if status_filter == 'all':
                queryset = MedicineRequestItem.objects.filter(
                    status__in=['rejected', 'cancelled', 'referred', 'completed']
                )
            else:
                queryset = MedicineRequestItem.objects.filter(status=status_filter)

            if medreq_id:
                queryset = queryset.filter(medreq_id=medreq_id)

            queryset = queryset.select_related(
                'medreq_id',
                'med',
              
                'medreq_id__trans_id',
                'medreq_id__rp_id',
                'medreq_id__rp_id__per',
            ).prefetch_related(
                'medreq_id__medicine_files',
                'allocations',
                'allocations__minv',
                'allocations__minv__med_id',
                'allocations__minv__inv_id',
            ).order_by('-medreq_id__requested_at')

            medicine_groups = {}

            for item in queryset:
                med_id, med_name, med_type, dosage, dosage_unit, form, formatted_name = self.get_medicine_details(item)
                patient_name = "Unknown Patient"
                if item.medreq_id.rp_id and item.medreq_id.rp_id.per:
                    personal = item.medreq_id.rp_id.per
                    patient_name = f"{personal.per_fname} {personal.per_lname}"
                    if personal.per_mname:
                        patient_name = f"{personal.per_fname} {personal.per_mname} {personal.per_lname}"
                elif item.medreq_id.trans_id:
                    transient = item.medreq_id.trans_id
                    patient_name = f"{transient.tran_fname} {transient.tran_lname}"
                    if transient.tran_mname:
                        patient_name = f"{transient.tran_fname} {transient.tran_mname} {transient.tran_lname}"

                group_key = f"{formatted_name}_{item.medreq_id.medreq_id}"

                if group_key not in medicine_groups:
                    medicine_groups[group_key] = {
                        'med_id': med_id,
                        'med_name': med_name,
                        'formatted_med_name': formatted_name,
                        'med_type': med_type,
                        'dosage': dosage,
                        'dosage_unit': dosage_unit,
                        'form': form,
                        'patient_name': patient_name,
                        'medreq_id': item.medreq_id.medreq_id,
                        'requested_at': item.medreq_id.requested_at,
                        'fulfilled_at': item.fulfilled_at,
                        'cancelled_rejected_reffered_at':item.cancelled_rejected_reffered_at,
                        'confirmed_at':item.confirmed_at,
                        'archive_reason': item.archive_reason,
                        'reason': item.reason,
                        'request_items': [],
                        'total_requested_qty': 0,
                        'total_allocated_qty': 0,
                   }

                item_allocated_qty = 0
                allocations = []

                if item.status == 'completed':
                    for allocation in item.allocations.all():
                        allocation_data = {
                            'alloc_id': allocation.alloc_id,
                            'allocated_qty': allocation.allocated_qty,
                        }
                        allocations.append(allocation_data)
                        item_allocated_qty += allocation.allocated_qty
                  

                request_item_data = {
                    'medreqitem_id': item.medreqitem_id,
                    'archive_reason': item.archive_reason,
                    'reason': item.reason,
                    'status': item.status,
                    'inventory': {},
                    'allocations': allocations,
                    'item_allocated_qty': item_allocated_qty,
                }

                medicine_groups[group_key]['request_items'].append(request_item_data)
                medicine_groups[group_key]['total_allocated_qty'] += item_allocated_qty

            

            medicine_data = list(medicine_groups.values())

            paginator = self.pagination_class()
            page_size = int(request.GET.get('page_size', paginator.page_size))
            paginator.page_size = page_size

            page_data = paginator.paginate_queryset(medicine_data, request)

            if page_data is not None:
                response = paginator.get_paginated_response(page_data)
                return Response({
                    'success': True,
                    'results': response.data['results'],
                    'count': response.data['count'],
                    'next': response.data.get('next'),
                    'previous': response.data.get('previous'),
                    'status_filter': status_filter
                })

            return Response({
                'success': True,
                'results': medicine_data,
                'count': len(medicine_data),
                'status_filter': status_filter
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': f'Error fetching processed medicine request items: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ...existing code...