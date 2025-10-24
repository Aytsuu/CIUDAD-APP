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


# ================PROCESSED MEDICINE REQUEST ITEMS TABLE (CONFIRMED/CANCELLED/REFERRED)========================
class MedicineRequestStatusTableView(generics.ListCreateAPIView):
    """ 
    MAIN TABLE FOR PROCESSED MEDICINE REQUESTS
    Shows medicine requests that have been processed (confirmed, cancelled, or referred)
    Can be filtered by status parameter: ?status=all|confirmed|cancelled|referred
    Handles both pat_id and rp_id cases
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
            'pat_id',
            'pat_id__rp_id',
            'pat_id__trans_id',
            'pat_id__rp_id__per',
            'rp_id',
            'rp_id__per',
        ).prefetch_related(
            'items',
            'items__minv_id',
            'items__minv_id__med_id',
            'items__med',
            'items__allocations',
            'items__allocations__minv',
            'items__allocations__minv__med_id',
            'pat_id__rp_id__per__personal_addresses__add',
            'pat_id__rp_id__per__personal_addresses__add__sitio',
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
            )
        ).order_by('-requested_at')

        if search_query:
            queryset = queryset.filter(
                Q(pat_id__rp_id__per__per_lname__icontains=search_query) |
                Q(pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(pat_id__rp_id__per__per_mname__icontains=search_query) |
                Q(pat_id__rp_id__per__per_contact__icontains=search_query) |
                Q(pat_id__trans_id__tran_lname__icontains=search_query) |
                Q(pat_id__trans_id__tran_fname__icontains=search_query) |
                Q(pat_id__trans_id__tran_mname__icontains=search_query) |
                Q(pat_id__trans_id__tran_contact__icontains=search_query) |
                Q(rp_id__per__per_lname__icontains=search_query) |
                Q(rp_id__per__per_fname__icontains=search_query) |
                Q(rp_id__per__per_mname__icontains=search_query) |
                Q(rp_id__per__per_contact__icontains=search_query) |
                Q(medreq_id__icontains=search_query) |
                Q(pat_id__pat_id__icontains=search_query) |
                Q(rp_id__rp_id__icontains=search_query) |
                Q(items__minv_id__med_id__med_name__icontains=search_query) |
                Q(items__med__med_name__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |
                Q(pat_id__rp_id__respondents_info__fam__fam_id__icontains=search_query) |
                Q(pat_id__rp_id__respondents_info__fam__hh__hh_id__icontains=search_query) |
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

            from apps.patientrecords.models import Patient

            if page is not None:
                serializer = self.get_serializer(page, many=True)
                enriched_data = []
                for item in serializer.data:
                    medreq_id = item.get('medreq_id')
                    medreq_obj = next((q for q in page if q.medreq_id == medreq_id), None)
                    if medreq_obj:
                        item['item_counts'] = {
                            'total_items': medreq_obj.total_items,
                            'completed': medreq_obj.completed_count,
                            'cancelled': medreq_obj.cancelled_count,
                            'referred': medreq_obj.referred_count,
                            'rejected': medreq_obj.rejected_count
                        }
                    rp_id = item.get('rp_id')
                    if rp_id and not item.get('pat_id'):
                        try:
                            patient = Patient.objects.filter(rp_id=rp_id, pat_type='Resident').first()
                            if patient:
                                item['pat_id'] = patient.pat_id
                        except Exception as e:
                            item['pat_id_error'] = str(e)
                    enriched_data.append(item)

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

            serializer = self.get_serializer(queryset, many=True)
            enriched_data = []
            for item in serializer.data:
                medreq_id = item.get('medreq_id')
                medreq_obj = next((q for q in queryset if q.medreq_id == medreq_id), None)
                if medreq_obj:
                    item['item_counts'] = {
                        'total_items': medreq_obj.total_items,
                        'completed': medreq_obj.completed_count,
                        'cancelled': medreq_obj.cancelled_count,
                        'referred': medreq_obj.referred_count,
                        'rejected': medreq_obj.rejected_count
                    }
                rp_id = item.get('rp_id')
                if rp_id and not item.get('pat_id'):
                    try:
                        patient = Patient.objects.filter(rp_id=rp_id, pat_type='Resident').first()
                        if patient:
                            item['pat_id'] = patient.pat_id
                    except Exception as e:
                        item['pat_id_error'] = str(e)
                enriched_data.append(item)

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
    Handles both pat_id and rp_id cases
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

        if item.minv_id and item.minv_id.med_id and not med_id:
            med_id = item.minv_id.med_id.med_id
            med_name = item.minv_id.med_id.med_name
            med_type = item.minv_id.med_id.med_type
            dosage = item.minv_id.med_id.med_dsg
            dosage_unit = item.minv_id.med_id.med_dsg_unit
            form = item.minv_id.med_id.med_form

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
                'minv_id',
                'minv_id__med_id',
                'minv_id__inv_id',
                'medreq_id__pat_id',
                'medreq_id__pat_id__rp_id',
                'medreq_id__pat_id__trans_id',
                'medreq_id__pat_id__rp_id__per',
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
                if item.medreq_id.pat_id:
                    patient = item.medreq_id.pat_id
                    if patient.rp_id and patient.rp_id.per:
                        personal = patient.rp_id.per
                        patient_name = f"{personal.per_fname} {personal.per_lname}"
                        if personal.per_mname:
                            patient_name = f"{personal.per_fname} {personal.per_mname} {personal.per_lname}"
                    elif patient.trans_id:
                        transient = patient.trans_id
                        patient_name = f"{transient.tran_fname} {transient.tran_lname}"
                        if transient.tran_mname:
                            patient_name = f"{transient.tran_fname} {transient.tran_mname} {transient.tran_lname}"
                elif item.medreq_id.rp_id and item.medreq_id.rp_id.per:
                    personal = item.medreq_id.rp_id.per
                    patient_name = f"{personal.per_fname} {personal.per_lname}"
                    if personal.per_mname:
                        patient_name = f"{personal.per_fname} {personal.per_mname} {personal.per_lname}"

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
                        'fulfilled_at': item.medreq_id.updated_at,
                        'archive_reason': item.archive_reason,
                        'reason': item.reason,
                        'request_items': [],
                        'total_requested_qty': 0,
                        'total_allocated_qty': 0,
                   }
                # (medicine_files, patient_info, inventory_info logic can be added here as needed)

                item_allocated_qty = 0
                allocations = []

                if item.status == 'completed':
                    for allocation in item.allocations.all():
                        allocation_data = {
                            'alloc_id': allocation.alloc_id,
                            'allocated_qty': allocation.allocated_qty,
                            # (add other allocation fields as needed)
                        }
                        allocations.append(allocation_data)
                        item_allocated_qty += allocation.allocated_qty
                    # Fallback: if no allocations, use medreqitem_qty
                    if item_allocated_qty == 0:
                        item_allocated_qty = item.medreqitem_qty

                request_item_data = {
                    'medreqitem_id': item.medreqitem_id,
                    'medreqitem_qty': item.medreqitem_qty,
                    'archive_reason':item.archive_reason,
                    'reason': item.reason,
                    'status': item.status,
                    'is_direct_connection': bool(item.minv_id),
                    'inventory': {},  # fill as needed
                    'allocations': allocations,
                    'item_allocated_qty': item_allocated_qty,
                    'remaining_qty': item.medreqitem_qty - item_allocated_qty if item.status == 'completed' else 0,
                    'is_fully_allocated': item_allocated_qty >= item.medreqitem_qty if item.status == 'completed' else False,
                }

                medicine_groups[group_key]['request_items'].append(request_item_data)
                medicine_groups[group_key]['total_requested_qty'] += item.medreqitem_qty
                medicine_groups[group_key]['total_allocated_qty'] += item_allocated_qty

            # Fallback: if total_allocated_qty is 0, use total_requested_qty
            for group in medicine_groups.values():
                if not group.get('total_allocated_qty') or group['total_allocated_qty'] == 0:
                    group['total_allocated_qty'] = group.get('total_requested_qty', 0)
                group['total_remaining_qty'] = group['total_requested_qty'] - group['total_allocated_qty']
                group['is_fully_allocated'] = group['total_allocated_qty'] >= group['total_requested_qty']
                group['allocation_percentage'] = (
                    (group['total_allocated_qty'] / group['total_requested_qty'] * 100)
                    if group['total_requested_qty'] > 0 else 0
                )

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