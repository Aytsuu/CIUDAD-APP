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


# ================PENDING MEDICINE REQUEST ITEMS TABLE========================
class MedicineRequestPendingTableView(generics.ListCreateAPIView):
    """ 
    MAIN TABLE FOR PENDING VIEWS
    """
    serializer_class = MedicineRequestSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        # Get the search query and date filter from request parameters
        search_query = self.request.GET.get('search', '').strip()
        date_filter = self.request.GET.get('date_filter', 'all').strip()
        
        # Get all MedicineRequest IDs that have at least one pending item
        pending_request_ids = MedicineRequestItem.objects.filter(
            status='pending'
        ).values_list('medreq_id', flat=True).distinct()
        
        # Base queryset for medicine requests that have pending items
        queryset = MedicineRequest.objects.filter(
            medreq_id__in=pending_request_ids,
            mode="app"  # Only walk-in requests
        ).select_related(
            'pat_id', 'rp_id', 'pat_id__rp_id', 'pat_id__trans_id',
            'pat_id__rp_id__per',  # Resident patient personal info
            'rp_id__per',  # Requesting physician personal info
        ).prefetch_related(
            'items',  # Medicine request items
            'items__minv_id',  # Medicine inventory
            'items__minv_id__med_id',  # Medicine details
            'items__med',  # Alternative medicine reference
            'pat_id__rp_id__per__personal_addresses__add',  # Patient addresses
            'pat_id__rp_id__per__personal_addresses__add__sitio',  # Patient sitios
            'rp_id__per__personal_addresses__add',  # Physician addresses
            'rp_id__per__personal_addresses__add__sitio',  # Physician sitios
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
                
                # Search by patient address information
                Q(pat_id__rp_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |
                
                # Search by physician address information
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
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                
                # Calculate total number of pending medicine request items across all matching requests
                total_medicines_quantity = MedicineRequestItem.objects.filter(
                    medreq_id__in=queryset.values_list('medreq_id', flat=True),
                    status='pending'
                ).count()
                
                response = self.get_paginated_response(serializer.data)
                response.data['total_medicines_quantity'] = total_medicines_quantity
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
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                

# class MedicineRequestPendingItemsTableView(APIView):
#     pagination_class = StandardResultsPagination
    
#     def get(self, request, *args, **kwargs):
#         try:
#             medreq_id = self.kwargs.get('medreq_id')
#             queryset = MedicineRequestItem.objects.all()
            
#             # Filter by medicine request ID if provided
#             if medreq_id:
#                 queryset = queryset.filter(medreq_id=medreq_id)
            
#             # Add select_related and prefetch_related for performance
#             queryset = queryset.select_related(
#                 'medreq_id', 
#                 'med', 
#                 'minv_id',  # Added this
#                 'minv_id__med_id',  # Added this
#                 'medreq_id__rp_id', 
#                 'medreq_id__pat_id',
#                 'medreq_id__pat_id__rp_id',
#                 'medreq_id__pat_id__trans_id',
#                 'medreq_id__rp_id__per',
#             ).prefetch_related(
#                 'medreq_id__medicine_files',
#             ).order_by('-medreq_id__requested_at')
            
#             # Group by med_id and prepare response data
#             medicine_groups = {}
            
#             for item in queryset:
#                 med_id = None
#                 med_name = "Unknown Medicine"
#                 med_type = "Unknown Type"
                
#                 # Get medicine ID, name, and type from med field (first priority)
#                 if item.med:
#                     med_id = item.med.med_id
#                     med_name = item.med.med_name
#                     med_type = item.med.med_type
#                 # If med is null, try to get from minv_id__med_id
#                 elif item.minv_id and item.minv_id.med_id:
#                     med_id = item.minv_id.med_id.med_id
#                     med_name = item.minv_id.med_id.med_name
#                     med_type = item.minv_id.med_id.med_type
                 
#                 # Get formatted patient name
#                 patient_name = "Unknown Patient"
#                 if item.medreq_id.pat_id:
#                     patient = item.medreq_id.pat_id
                    
#                     if patient.rp_id and patient.rp_id.per:
#                         personal = patient.rp_id.per
#                         patient_name = f"{personal.per_fname} {personal.per_lname}"
#                         if personal.per_mname:
#                             patient_name = f"{personal.per_fname} {personal.per_mname} {personal.per_lname}"
#                     elif patient.trans_id:
#                         transient = patient.trans_id
#                         patient_name = f"{transient.tran_fname} {transient.tran_lname}"
#                         if transient.tran_mname:
#                             patient_name = f"{transient.tran_fname} {transient.tran_mname} {transient.tran_lname}"
                
#                 # Use a unique key for grouping - combine med_id and patient if needed
#                 group_key = f"{med_id}_{patient_name}" if med_id else f"unknown_{patient_name}"
                
#                 if group_key not in medicine_groups:
#                     medicine_groups[group_key] = {
#                         'med_id': med_id,
#                         'med_name': med_name,
#                         'med_type': med_type,
#                         'patient_name': patient_name,
#                         'request_items': []
#                     }
                
#                 # Get medicine files for this request
#                 medicine_files = []
#                 for file in item.medreq_id.medicine_files.all():
#                     medicine_files.append({
#                         'medf_id': file.medf_id,
#                         'medf_name': file.medf_name,
#                         'medf_type': file.medf_type,
#                         'medf_path': file.medf_path,
#                         'medf_url': file.medf_url,
#                         'created_at': file.created_at
#                     })
                
#                 # Get patient information
#                 patient_info = {}
#                 if item.medreq_id.pat_id:
#                     patient = item.medreq_id.pat_id
                    
#                     if patient.rp_id and patient.rp_id.per:
#                         personal = patient.rp_id.per
#                         patient_info = {
#                             'pat_id': patient.pat_id,
#                             'type': 'resident',
#                             'per_fname': personal.per_fname,
#                             'per_lname': personal.per_lname,
#                             'per_mname': personal.per_mname,
#                             'per_contact': personal.per_contact,
#                             'per_dob': personal.per_dob,
#                             'per_sex': personal.per_sex
#                         }
#                     elif patient.trans_id:
#                         transient = patient.trans_id
#                         patient_info = {
#                             'pat_id': patient.pat_id,
#                             'type': 'transient',
#                             'tran_fname': transient.tran_fname,
#                             'tran_lname': transient.tran_lname,
#                             'tran_mname': transient.tran_mname,
#                             'tran_contact': transient.tran_contact,
#                             'tran_dob': transient.tran_dob,
#                             'tran_sex': transient.tran_sex
#                         }
                
#                 # Get inventory details if available
#                 inventory_info = {}
#                 if item.minv_id:
#                     inventory_info = {
#                         'minv_id': item.minv_id.minv_id,
#                         'stock_quantity': item.minv_id.minv_qty_avail,
#                         'expiry_date': item.minv_id.inv_id.expiry_date if item.minv_id.inv_id else None,
#                     }
                
#                 request_item_data = {
#                     'medreqitem_id': item.medreqitem_id,
#                     'medreqitem_qty': item.medreqitem_qty,
#                     'reason': item.reason,
#                     'status': item.status,
#                     'inventory': inventory_info,
#                     'patient': patient_info,
#                     'medicine_files': medicine_files,
#                     'medreq_id': item.medreq_id.medreq_id,
#                     'requested_at': item.medreq_id.requested_at,
#                 }
                
#                 medicine_groups[group_key]['request_items'].append(request_item_data)
            
#             # Convert to list for pagination
#             medicine_data = list(medicine_groups.values())
            
#             # Apply pagination
#             paginator = self.pagination_class()
#             page_size = int(request.GET.get('page_size', paginator.page_size))
#             paginator.page_size = page_size
            
#             page_data = paginator.paginate_queryset(medicine_data, request)
            
#             if page_data is not None:
#                 response = paginator.get_paginated_response(page_data)
#                 return Response({
#                     'success': True,
#                     'results': response.data['results'],
#                     'count': response.data['count'],
#                     'next': response.data.get('next'),
#                     'previous': response.data.get('previous')
#                 })
            
#             return Response({
#                 'success': True,
#                 'results': medicine_data,
#                 'count': len(medicine_data)
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             return Response({
#                 'success': False,
#                 'error': f'Error fetching medicine request items: {str(e)}'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
     
            
            
class MedicineRequestPendingItemsTableView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request, *args, **kwargs):
        try:
            medreq_id = self.kwargs.get('medreq_id')
            queryset = MedicineRequestItem.objects.all()
            
            # Filter by medicine request ID if provided
            if medreq_id:
                queryset = queryset.filter(medreq_id=medreq_id)
            
            # Add select_related and prefetch_related for performance
            queryset = queryset.select_related(
                'medreq_id', 
                'med', 
                'minv_id',
                'minv_id__med_id',
                'medreq_id__rp_id', 
                'medreq_id__pat_id',
                'medreq_id__pat_id__rp_id',
                'medreq_id__pat_id__trans_id',
                'medreq_id__rp_id__per',
            ).prefetch_related(
                'medreq_id__medicine_files',
                'allocations',  # Prefetch allocations for each request item
                'allocations__minv',  # Prefetch the inventory for each allocation
            ).order_by('-medreq_id__requested_at')
            
            # Group by med_id and prepare response data
            medicine_groups = {}
            
            for item in queryset:
                med_id = None
                med_name = "Unknown Medicine"
                med_type = "Unknown Type"
                
                # Get medicine ID, name, and type from med field (first priority)
                if item.med:
                    med_id = item.med.med_id
                    med_name = item.med.med_name
                    med_type = item.med.med_type
                    med_dsg = item.med.med_dsg
                    med_form = item.med.med_form
                    med_dsg_unit = item.med.med_dsg_unit
                # If med is null, try to get from minv_id__med_id
                elif item.minv_id and item.minv_id.med_id:
                    med_id = item.minv_id.med_id.med_id
                    med_name = item.minv_id.med_id.med_name
                    med_type = item.minv_id.med_id.med_type
                    med_dsg = item.minv_id.med_id.med_dsg
                    med_form = item.minv_id.med_id.med_form
                    med_dsg_unit = item.minv_id.med_id.med_dsg_unit
                 
                # Get formatted patient name
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
                
                # Use a unique key for grouping - combine med_id and patient if needed
                group_key = f"{med_id}_{patient_name}" if med_id else f"unknown_{patient_name}"
                
                if group_key not in medicine_groups:
                    medicine_groups[group_key] = {
                        'med_id': med_id,
                        'med_name': med_name,
                        'med_type': med_type,
                        'med_dsg': med_dsg,
                        'med_form': med_form,
                        'med_dsg_unit': med_dsg_unit,
                        'patient_name': patient_name,
                        'request_items': []
                    }
                
                # Get medicine files for this request
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
                
                # Get patient information
                patient_info = {}
                if item.medreq_id.pat_id:
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
                
                # Get inventory details if available
                inventory_info = {}
                if item.minv_id:
                    inventory_info = {
                        'minv_id': item.minv_id.minv_id,
                        'stock_quantity': item.minv_id.minv_qty_avail,
                        'expiry_date': item.minv_id.inv_id.expiry_date if item.minv_id.inv_id else None,
                    }
                
                # Get allocation details for this request item
                allocations = []
                total_allocated_qty = 0
                
                for allocation in item.allocations.all():
                    allocation_data = {
                        'alloc_id': allocation.alloc_id,
                        'minv_id': allocation.minv.minv_id,
                        'inv_id': allocation.minv.inv_id.inv_id if allocation.minv.inv_id else None,
                        'minv_name': allocation.minv.med_id.med_name if allocation.minv.med_id else "Unknown",
                        'minv_type': allocation.minv.med_id.med_type if allocation.minv.med_id else "Unknown",
                        'minv_dsg': allocation.minv.med_id.med_dsg if allocation.minv.med_id else "",
                        'minv_form': allocation.minv.med_id.med_form if allocation.minv.med_id else "",
                        'minv_dsg_unit': allocation.minv.med_id.med_dsg_unit if allocation.minv.med_id else "",
                        'allocated_qty': allocation.allocated_qty,
                        'created_at': allocation.created_at,
                        'minv_details': {
                          
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
                    total_allocated_qty += allocation.allocated_qty
                
                request_item_data = {
                    'medreqitem_id': item.medreqitem_id,
                    'medreqitem_qty': item.medreqitem_qty,
                    'reason': item.reason,
                    'status': item.status,
                    'inventory': inventory_info,
                    'patient': patient_info,
                    'medicine_files': medicine_files,
                    'medreq_id': item.medreq_id.medreq_id,
                    'requested_at': item.medreq_id.requested_at,
                    # Add allocation information
                    'allocations': allocations,
                    'total_allocated_qty': total_allocated_qty,
                    'remaining_qty': item.medreqitem_qty - total_allocated_qty,
                    'is_fully_allocated': total_allocated_qty >= item.medreqitem_qty,
                }
                
                medicine_groups[group_key]['request_items'].append(request_item_data)
            
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
                    'previous': response.data.get('previous')
                })
            
            return Response({
                'success': True,
                'results': medicine_data,
                'count': len(medicine_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error fetching medicine request items: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)