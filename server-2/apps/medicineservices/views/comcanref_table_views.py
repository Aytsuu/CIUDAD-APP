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
        # Get the search query, date filter, and status filter from request parameters
        search_query = self.request.GET.get('search', '').strip()
        date_filter = self.request.GET.get('date_filter', 'all').strip()
        status_filter = self.request.GET.get('status', 'all').strip()  # Status filter
        
        # Build status filter for items
        if status_filter == 'all':
            # Get all MedicineRequest IDs that have confirmed, cancelled, or referred items
            request_ids = MedicineRequestItem.objects.filter(
                status__in=['rejected', 'cancelled', 'referred', 'completed']
            ).values_list('medreq_id', flat=True).distinct()
        else:
            # Filter by specific status (confirmed, cancelled, or referred)
            request_ids = MedicineRequestItem.objects.filter(
                status=status_filter
            ).values_list('medreq_id', flat=True).distinct()
        
        # Base queryset for medicine requests that have the specified status items
        # Handle both pat_id (registered patients) and rp_id (pending patients)
        queryset = MedicineRequest.objects.filter(
            medreq_id__in=request_ids
        ).select_related(
            'pat_id',  # Patient (registered)
            'pat_id__rp_id',  # Resident patient info
            'pat_id__trans_id',  # Transient patient info (if applicable)
            'pat_id__rp_id__per',  # Personal info for resident patients
            'rp_id',  # Requesting physician / Resident (for pending requests)
            'rp_id__per',  # Personal info for requesting resident
        ).prefetch_related(
            'items',  # Medicine request items
            'items__minv_id',  # Medicine inventory
            'items__minv_id__med_id',  # Medicine details
            'items__med',  # Alternative medicine reference
            'items__allocations',  # Medicine allocations
            'items__allocations__minv',  # Inventory for allocations
            'items__allocations__minv__med_id',  # Medicine details for allocations
            'pat_id__rp_id__per__personal_addresses__add',  # Patient addresses (resident)
            'pat_id__rp_id__per__personal_addresses__add__sitio',  # Patient sitios (resident)
            'rp_id__per__personal_addresses__add',  # Requesting resident addresses
            'rp_id__per__personal_addresses__add__sitio',  # Requesting resident sitios
        ).annotate(
            # Count items by status for each medicine request
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
        
        # Apply search filter if provided
        if search_query:
            queryset = queryset.filter(
                # Search by patient information (Resident)
                Q(pat_id__rp_id__per__per_lname__icontains=search_query) |
                Q(pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(pat_id__rp_id__per__per_mname__icontains=search_query) |
                Q(pat_id__rp_id__per__per_contact__icontains=search_query) |
                
                # Search by patient information (Transient)
                Q(pat_id__trans_id__tran_lname__icontains=search_query) |
                Q(pat_id__trans_id__tran_fname__icontains=search_query) |
                Q(pat_id__trans_id__tran_mname__icontains=search_query) |
                Q(pat_id__trans_id__tran_contact__icontains=search_query) |
                
                # Search by requesting physician information (for pending requests)
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
                
                # Search by patient address information (Resident)
                Q(pat_id__rp_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |
                
                # Search by requesting physician address information
                Q(rp_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |
                
                # Search by household and family information
                Q(pat_id__rp_id__respondents_info__fam__fam_id__icontains=search_query) |
                Q(pat_id__rp_id__respondents_info__fam__hh__hh_id__icontains=search_query) |
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
            status_filter = self.request.GET.get('status', 'all').strip()
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            # Calculate global totals across all medicine requests
            all_request_ids = queryset.values_list('medreq_id', flat=True)
            
            # Global counts across all requests
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
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                
                # Add per-request counts to serialized data
                enriched_data = []
                for item in serializer.data:
                    medreq_id = item.get('medreq_id')
                    
                    # Get the annotated counts from the queryset
                    medreq_obj = next((q for q in page if q.medreq_id == medreq_id), None)
                    
                    if medreq_obj:
                        item['item_counts'] = {
                            'total_items': medreq_obj.total_items,
                            'completed': medreq_obj.completed_count,
                            'cancelled': medreq_obj.cancelled_count,
                            'referred': medreq_obj.referred_count,
                            'rejected': medreq_obj.rejected_count
                        }
                    
                    enriched_data.append(item)
                
                response = self.get_paginated_response(enriched_data)
                
                # Add global counts
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
            
            # Add per-request counts to serialized data
            enriched_data = []
            for item in serializer.data:
                medreq_id = item.get('medreq_id')
                
                # Get the annotated counts from the queryset
                medreq_obj = next((q for q in queryset if q.medreq_id == medreq_id), None)
                
                if medreq_obj:
                    item['item_counts'] = {
                        'total_items': medreq_obj.total_items,
                        'completed': medreq_obj.completed_count,
                        'cancelled': medreq_obj.cancelled_count,
                        'referred': medreq_obj.referred_count,
                        'rejected': medreq_obj.rejected_count
                    }
                
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
        """
        Format medicine name with dosage and form
        Example: "Paracetamol 500mg Tablet"
        """
        formatted_name = med_name or "Unknown Medicine"
        
        if dosage and dosage_unit:
            formatted_name += f" {dosage}{dosage_unit}"
        elif dosage:
            formatted_name += f" {dosage}"
            
        if form:
            formatted_name += f" {form}"
            
        return formatted_name
    
    def get_medicine_details(self, item):
        """
        Extract medicine details from item - handles both med and minv_id connections
        Returns: tuple of (med_id, med_name, med_type, dosage, dosage_unit, form, formatted_name)
        """
        med_id = None
        med_name = "Unknown Medicine"
        med_type = "Unknown Type"
        dosage = None
        dosage_unit = None
        form = None
        
        # Priority 1: Get from med field (Medicine table - general medicine info)
        if item.med:
            med_id = item.med.med_id
            med_name = item.med.med_name
            med_type = item.med.med_type
            # Medicine table typically doesn't have dosage/form, those are in inventory
            
        # Priority 2: Get from minv_id (MedicineInventory - specific stock with dosage/form)
        if item.minv_id:
            # If we don't have med_id yet, or if minv has more specific info
            if item.minv_id.med_id:
                if not med_id:  # Only set if not already set from item.med
                    med_id = item.minv_id.med_id.med_id
                    med_name = item.minv_id.med_id.med_name
                    med_type = item.minv_id.med_id.med_type
                
                # Get dosage and form from inventory (minv_id)
                dosage = item.minv_id.minv_dsg
                dosage_unit = item.minv_id.minv_dsg_unit
                form = item.minv_id.minv_form
        
        # Format the medicine name with dosage and form
        formatted_name = self.format_medicine_name(med_name, dosage, dosage_unit, form)
        
        return med_id, med_name, med_type, dosage, dosage_unit, form, formatted_name
    
    def get(self, request, *args, **kwargs):
        try:
            medreq_id = self.kwargs.get('medreq_id')
            status_filter = request.GET.get('status', 'all').strip()  # Status filter
            
            # Build base queryset based on status filter
            if status_filter == 'all':
                queryset = MedicineRequestItem.objects.filter(
                    status__in=['rejected', 'cancelled', 'referred', 'completed']
                )
            else:
                queryset = MedicineRequestItem.objects.filter(status=status_filter)
            
            # Filter by medicine request ID if provided
            if medreq_id:
                queryset = queryset.filter(medreq_id=medreq_id)
            
            # Add select_related and prefetch_related for performance
            # Handle both pat_id and rp_id cases
            queryset = queryset.select_related( 
                'medreq_id', 
                'med', 
                'minv_id',
                'minv_id__med_id',
                'minv_id__inv_id',  # Add inventory parent
                'medreq_id__pat_id',
                'medreq_id__pat_id__rp_id',
                'medreq_id__pat_id__trans_id',
                'medreq_id__pat_id__rp_id__per',
                'medreq_id__rp_id',  # Requesting physician/resident
                'medreq_id__rp_id__per',  # Requesting resident personal info
            ).prefetch_related(
                'medreq_id__medicine_files',
                'allocations',  # Prefetch allocations for each request item
                'allocations__minv',  # Prefetch the inventory for each allocation
                'allocations__minv__med_id',  # Prefetch medicine details for allocations
                'allocations__minv__inv_id',  # Prefetch inventory parent
            ).order_by('-medreq_id__requested_at')
            
            # Group by medicine name, dosage, form, and medicine request ID
            medicine_groups = {}
            
            for item in queryset:
                # Get medicine details using the helper method
                med_id, med_name, med_type, dosage, dosage_unit, form, formatted_name = self.get_medicine_details(item)
                
                # Get formatted patient name - Handle both pat_id and rp_id cases
                patient_name = "Unknown Patient"
                if item.medreq_id.pat_id:
                    # Patient is registered
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
                elif item.medreq_id.rp_id:
                    # Patient not registered yet, use rp_id
                    if item.medreq_id.rp_id.per:
                        personal = item.medreq_id.rp_id.per
                        patient_name = f"{personal.per_fname} {personal.per_lname}"
                        if personal.per_mname:
                            patient_name = f"{personal.per_fname} {personal.per_mname} {personal.per_lname}"
                
                # Create unique key for grouping - combine formatted name (with dosage/form) and medreq_id
                # This ensures items with same medicine name but different dosage/form are grouped separately
                group_key = f"{formatted_name}_{item.medreq_id.medreq_id}"
                
                if group_key not in medicine_groups:
                    medicine_groups[group_key] = {
                        'med_id': med_id,
                        'med_name': med_name,  # Original medicine name
                        'formatted_name': formatted_name,  # Medicine name with dosage and form
                        'med_type': med_type,
                        'dosage': dosage,
                        'dosage_unit': dosage_unit,
                        'form': form,
                        'patient_name': patient_name,
                        'medreq_id': item.medreq_id.medreq_id,
                        'requested_at': item.medreq_id.requested_at,
                        'fulfilled_at': item.medreq_id.updated_at,
                        'request_items': [],
                        'total_requested_qty': 0,  # Sum of all requested quantities for this medicine variant
                        'total_allocated_qty': 0,  # Sum of all allocated quantities for this medicine variant
                    
                    }
                
                # Get medicine files for this request (only add once per group)
                if not medicine_groups[group_key].get('medicine_files'):
                    medicine_files = []
                    for file in item.medreq_id.medicine_files.all():
                        medicine_files.append({
                            'medf_id': file.medf_id,
                            'medf_name': file.medf_name,
                            'medf_type': file.medf_type,
                            'medf_path': file.medf_path,
                            'medf_url': file.medf_url,
                            'created_at': file.created_at
                        })
                    medicine_groups[group_key]['medicine_files'] = medicine_files
                
                # Get patient information - Handle both pat_id and rp_id cases (only add once per group)
                if not medicine_groups[group_key].get('patient'):
                    patient_info = {}
                    if item.medreq_id.pat_id:
                        # Patient is registered
                        patient = item.medreq_id.pat_id
                        
                        if patient.rp_id and patient.rp_id.per:
                            personal = patient.rp_id.per
                            patient_info = {
                                'pat_id': patient.pat_id,
                                'type': 'resident',
                                'per_fname': personal.per_fname,
                                'per_lname': personal.per_lname,
                                'per_mname': personal.per_mname,
                                'per_contact': personal.per_contact,
                                'per_dob': personal.per_dob,
                                'per_sex': personal.per_sex
                            }
                        elif patient.trans_id:
                            transient = patient.trans_id
                            patient_info = {
                                'pat_id': patient.pat_id,
                                'type': 'transient',
                                'tran_fname': transient.tran_fname,
                                'tran_lname': transient.tran_lname,
                                'tran_mname': transient.tran_mname,
                                'tran_contact': transient.tran_contact,
                                'tran_dob': transient.tran_dob,
                                'tran_sex': transient.tran_sex
                            }
                    elif item.medreq_id.rp_id:
                        # Patient not registered yet, use rp_id
                        if item.medreq_id.rp_id.per:
                            personal = item.medreq_id.rp_id.per
                            patient_info = {
                                'rp_id': item.medreq_id.rp_id.rp_id,
                                'type': 'resident_pending',
                                'per_fname': personal.per_fname,
                                'per_lname': personal.per_lname,
                                'per_mname': personal.per_mname,
                                'per_contact': personal.per_contact,
                                'per_dob': personal.per_dob,
                                'per_sex': personal.per_sex
                            }
                    medicine_groups[group_key]['patient'] = patient_info
                
                # Get inventory details if available
                inventory_info = {}
                if item.minv_id:
                    inventory_info = {
                        'minv_id': item.minv_id.minv_id,
                        'minv_dsg': item.minv_id.minv_dsg,
                        'minv_dsg_unit': item.minv_id.minv_dsg_unit,
                        'minv_form': item.minv_id.minv_form,
                        'minv_qty': item.minv_id.minv_qty,
                        'minv_qty_unit': item.minv_id.minv_qty_unit,
                        'minv_pcs': item.minv_id.minv_pcs,
                        'stock_quantity': item.minv_id.minv_qty_avail,
                        'wasted': item.minv_id.wasted,
                        'temporary_deduction': item.minv_id.temporary_deduction,
                        'expiry_date': item.minv_id.inv_id.expiry_date if item.minv_id.inv_id else None,
                        'inv_type': item.minv_id.inv_id.inv_type if item.minv_id.inv_id else None,
                    }
                
                # Get allocation details for this request item (only for completed items)
                allocations = []
                item_allocated_qty = 0
                
                if item.status == 'completed':
                    for allocation in item.allocations.all():
                        allocation_data = {
                            'alloc_id': allocation.alloc_id,
                            'minv_id': allocation.minv.minv_id,
                            'inv_id': allocation.minv.inv_id.inv_id if allocation.minv.inv_id else None,
                            'minv_name': allocation.minv.med_id.med_name if allocation.minv.med_id else "Unknown",
                            'allocated_qty': allocation.allocated_qty,
                            'created_at': allocation.created_at,
                            'minv_details': {
                                'minv_dsg': allocation.minv.minv_dsg,
                                'minv_dsg_unit': allocation.minv.minv_dsg_unit,
                                'minv_form': allocation.minv.minv_form,
                                'minv_qty': allocation.minv.minv_qty,
                                'minv_qty_unit': allocation.minv.minv_qty_unit,
                                'minv_pcs': allocation.minv.minv_pcs,
                                'minv_qty_avail': allocation.minv.minv_qty_avail,
                                'wasted': allocation.minv.wasted,
                                'temporary_deduction': allocation.minv.temporary_deduction,
                            },
                            'inv_details': {
                                'expiry_date': allocation.minv.inv_id.expiry_date if allocation.minv.inv_id else None,
                                'inv_type': allocation.minv.inv_id.inv_type if allocation.minv.inv_id else None,
                                'is_archived': allocation.minv.inv_id.is_Archived if allocation.minv.inv_id else None,
                            }
                        }
                        allocations.append(allocation_data)
                        item_allocated_qty += allocation.allocated_qty
                
                request_item_data = {
                    'medreqitem_id': item.medreqitem_id,
                    'medreqitem_qty': item.medreqitem_qty,
                    'reason': item.reason,
                    'status': item.status,
                    'inventory': inventory_info,
                    'allocations': allocations,
                    'item_allocated_qty': item_allocated_qty,  # Allocated qty for this specific item
                    'remaining_qty': item.medreqitem_qty - item_allocated_qty if item.status == 'completed' else 0,
                    'is_fully_allocated': item_allocated_qty >= item.medreqitem_qty if item.status == 'completed' else False,
                }
                
                medicine_groups[group_key]['request_items'].append(request_item_data)
                
                # Aggregate totals for this medicine group
                medicine_groups[group_key]['total_requested_qty'] += item.medreqitem_qty
                medicine_groups[group_key]['total_allocated_qty'] += item_allocated_qty
            
            # Add aggregate information to each group
            for group in medicine_groups.values():
                group['total_remaining_qty'] = group['total_requested_qty'] - group['total_allocated_qty']
                group['is_fully_allocated'] = group['total_allocated_qty'] >= group['total_requested_qty']
                group['allocation_percentage'] = (
                    (group['total_allocated_qty'] / group['total_requested_qty'] * 100) 
                    if group['total_requested_qty'] > 0 else 0
                )
            
            # Convert to list for pagination
            medicine_data = list(medicine_groups.values())
            
            # Apply pagination
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