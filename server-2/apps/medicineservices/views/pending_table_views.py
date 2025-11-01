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
from django.db.models import F
from django.db.models import Window, F
from django.db.models.functions import Rank


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
        ).annotate(
            index=Window(
                expression=Rank(),
                order_by=F('requested_at').desc()
            )
        ).select_related(
            'patrec__pat_id', 'rp_id', 'patrec__pat_id__rp_id', 'patrec__pat_id__trans_id',
            'patrec__pat_id__rp_id__per',  # Resident patient personal info
            'rp_id__per',  # Requesting physician personal info
        ).prefetch_related(
            'items',  # Medicine request items
            'items__minv_id',  # Medicine inventory
            'items__minv_id__med_id',  # Medicine details
            'items__med',  # Alternative medicine reference
            'patrec__pat_id__rp_id__per__personal_addresses__add',  # Patient addresses
            'patrec__pat_id__rp_id__per__personal_addresses__add__sitio',  # Patient sitios
            'rp_id__per__personal_addresses__add',  # Physician addresses
            'rp_id__per__personal_addresses__add__sitio',  # Physician sitios
        ).order_by('-requested_at')

        # Apply search filter if provided
        if search_query:
            queryset = queryset.filter(
                # Search by patient information (Resident)
                Q(patrec__pat_id__rp_id__per__per_lname__icontains=search_query) |
                Q(patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(patrec__ppatrec__at_id__rp_id__per__per_mname__icontains=search_query) |
                Q(patrec__pat_id__rp_id__per__per_contact__icontains=search_query) |

                # Search by patient information (Transient)
                Q(patrec__pat_id__trans_id__tran_lname__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tran_fname__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tran_mname__icontains=search_query) |
                Q(patrec__pat_id__trans_id__tran_contact__icontains=search_query) |

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
                Q(patrec__pat_id__rp_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(patrec__pat_id__rp_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(patrec__pat_id__rp_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(patrec__pat_id__rp_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(patrec__pat_id__rp_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(patrec__pat_id__rp_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |

                # Search by physician address information
                Q(rp_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |

                # Search by household and family information
                Q(patrec__pat_id__rp_id__respondents_info__fam__fam_id__icontains=search_query) |
                Q(patrec__pat_id__rp_id__respondents_info__fam__hh__hh_id__icontains=search_query) |
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

                # Add index to the serialized data
                serialized_data = serializer.data
                for index, item in enumerate(serialized_data, start=1):
                    item['index'] = index

                response = self.get_paginated_response(serialized_data)
                response.data['total_medicines_quantity'] = total_medicines_quantity
                return response

            serializer = self.get_serializer(queryset, many=True)
            serialized_data = serializer.data
            for index, item in enumerate(serialized_data, start=1):
                item['index'] = index

            return Response({
                'success': True,
                'results': serialized_data,
                'count': len(serialized_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': f'Error fetching medicine requests: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                

class MedicineRequestPendingItemsTableView(APIView): 
    pagination_class = StandardResultsPagination

    def get(self, request, *args, **kwargs):
        try:
            medreq_id = self.kwargs.get('medreq_id')
            queryset = MedicineRequestItem.objects.all()

            if medreq_id:
                queryset = queryset.filter(medreq_id=medreq_id)

            queryset = queryset.select_related(
                'medreq_id',
                'med',
                'medreq_id__rp_id',
                'medreq_id__trans_id',
                'medreq_id__rp_id__per'
            ).prefetch_related(
                'medreq_id__medicine_files',
                'allocations',
                'allocations__minv',
                'allocations__minv__med_id'
            ).order_by('-medreq_id__requested_at')

            medicine_groups = {}

            for item in queryset:
                allocations = list(item.allocations.all())
                # Try allocations first
                if allocations and allocations[0].minv:
                    med_obj = allocations[0].minv.med_id
                elif item.med:
                    med_obj = item.med
                else:
                    med_obj = None

                if med_obj:
                    med_id = med_obj.med_id
                    med_name = med_obj.med_name
                    med_type = med_obj.med_type
                    med_dsg = getattr(med_obj, 'med_dsg', None)
                    med_form = getattr(med_obj, 'med_form', None)
                    med_dsg_unit = getattr(med_obj, 'med_dsg_unit', None)
                else:
                    med_id = None
                    med_name = "Unknown Medicine"
                    med_type = "Unknown Type"
                    med_dsg = None
                    med_form = None
                    med_dsg_unit = None

                # Get formatted patient name and info using rp_id or trans_id
                patient_name = "Unknown Patient"
                patient_info = {}

                medreq = item.medreq_id
                if medreq.rp_id and hasattr(medreq.rp_id, 'per'):
                    personal = medreq.rp_id.per
                    patient_name = f"{personal.per_fname} {personal.per_lname}"
                    if personal.per_mname:
                        patient_name = f"{personal.per_fname} {personal.per_mname} {personal.per_lname}"
                    patient_info = {
                        'type': 'resident',
                        'rp_id': medreq.rp_id.rp_id,
                        'per_fname': personal.per_fname,
                        'per_lname': personal.per_lname,
                        'per_mname': personal.per_mname,
                        'per_contact': personal.per_contact,
                        'per_dob': personal.per_dob,
                        'per_sex': personal.per_sex
                    }
                elif medreq.trans_id:
                    transient = medreq.trans_id
                    patient_name = f"{transient.tran_fname} {transient.tran_lname}"
                    if transient.tran_mname:
                        patient_name = f"{transient.tran_fname} {transient.tran_mname} {transient.tran_lname}"
                    patient_info = {
                        'type': 'transient',
                        'trans_id': transient.trans_id,
                        'tran_fname': transient.tran_fname,
                        'tran_lname': transient.tran_lname,
                        'tran_mname': transient.tran_mname,
                        'tran_contact': transient.tran_contact,
                        'tran_dob': transient.tran_dob,
                        'tran_sex': transient.tran_sex
                    }

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
                for file in medreq.medicine_files.all():
                    medicine_files.append({
                        'medf_id': file.medf_id,
                        'medf_name': file.medf_name,
                        'medf_type': file.medf_type,
                        'medf_path': file.medf_path,
                        'medf_url': file.medf_url,
                        'created_at': file.created_at
                    })

                # Get inventory details if available
                inventory_info = {}
                if allocations and allocations[0].minv:
                    inventory_info = {
                        'minv_id': allocations[0].minv.minv_id,
                        'stock_quantity': allocations[0].minv.minv_qty_avail,
                        'expiry_date': allocations[0].minv.inv_id.expiry_date if allocations[0].minv.inv_id else None,
                    }

                # Get allocation details for this request item
                allocations_data = []
                total_allocated_qty = 0

                for allocation in allocations:
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
                    allocations_data.append(allocation_data)
                    total_allocated_qty += allocation.allocated_qty

                request_item_data = {
                    'medreqitem_id': item.medreqitem_id,
                    'reason': item.reason,
                    'status': item.status,
                    'inventory': inventory_info,
                    'patient': patient_info,
                    'medicine_files': medicine_files,
                    'medreq_id': medreq.medreq_id,
                    'requested_at': medreq.requested_at,
                    'allocations': allocations_data,
                    'total_allocated_qty': total_allocated_qty,
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