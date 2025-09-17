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
    

class CreateFirstAidRequestView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            # Extract data from request
            pat_id = request.data.get('pat_id')
            signature = request.data.get('signature')
            firstaid_items = request.data.get('firstaid', [])
            staff_id = request.data.get('staff_id')
            
            print(f"Received first aid request: pat_id={pat_id}, items={len(firstaid_items)}")
            
            if not pat_id:
                return Response({"error": "pat_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not firstaid_items:
                return Response({"error": "At least one first aid item is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # 1. Get the Patient instance
            try:
                patient = Patient.objects.get(pat_id=pat_id)
            except Patient.DoesNotExist:
                return Response({"error": f"Patient with ID {pat_id} not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # 2. Get Staff instance if staff_id is provided
            staff_instance = None
            if staff_id:
                try:
                    staff_instance = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {staff_id} not found, continuing without staff")
            
            # 3. Create patient record
            patient_record = PatientRecord.objects.create(
                pat_id=patient,
                patrec_type="First Aid Request",
            )
            
            # 4. Process each first aid item
            firstaid_records = []
            inventory_updates = {}  # Store original quantities for rollback
            firstaid_transactions = []  # Store transactions
            
            for item_data in firstaid_items:
                finv_id = item_data.get('finv_id')
                qty = item_data.get('qty', 0)
                reason = item_data.get('reason', '')
                
                if not finv_id or qty is None:
                    continue
                
                # Check first aid inventory
                try:
                    firstaid_inv = FirstAidInventory.objects.get(finv_id=finv_id)
                    
                    # Handle unit conversion
                    unit = firstaid_inv.finv_qty_unit
                    if unit == "boxes":
                        unit = "pc/s"
                    
                    # Store original quantity for rollback
                    inventory_updates[finv_id] = {
                        'firstaid_inv': firstaid_inv,
                        'original_qty': firstaid_inv.finv_qty_avail
                    }
                    
                    # Handle zero quantity case
                    if qty == 0:
                        # Create record without updating inventory
                        firstaid_record = FirstAidRecord.objects.create(
                            patrec=patient_record,
                            finv=firstaid_inv,
                            qty=f"0 {unit}",
                            reason=reason,
                            signature=signature,
                            created_at=timezone.now(),
                            staff=staff_instance
                        )
                        firstaid_records.append(firstaid_record)
                        continue
                    
                    # Check stock for non-zero quantities
                    if firstaid_inv.finv_qty_avail < qty:
                        raise Exception(f"Insufficient stock for First Aid ID {finv_id}. Available: {firstaid_inv.finv_qty_avail}, Requested: {qty}")
                    
                    # Update inventory
                    firstaid_inv.finv_qty_avail -= qty
                    firstaid_inv.save()
                    
                    # Update inventory timestamp if available - FIXED HERE
                    # Use inv_id directly instead of inv_detail
                    try:
                        # Access the related Inventory object through the inv_id field
                        inventory = firstaid_inv.inv_id
                        if inventory:
                            inventory.updated_at = timezone.now()
                            inventory.save()
                    except Exception as e:
                        print(f"Could not update inventory timestamp: {str(e)}")
                    
                    # Create first aid transaction
                    firstaid_transaction = FirstAidTransactions.objects.create(
                        fat_qty=f"{qty} {unit}",
                        fat_action="Deducted",
                        staff=staff_instance,
                        finv_id=firstaid_inv
                    )
                    firstaid_transactions.append(firstaid_transaction)
                    
                    # Create first aid record
                    firstaid_record = FirstAidRecord.objects.create(
                        patrec=patient_record,
                        finv=firstaid_inv,
                        qty=f"{qty} {unit}",
                        reason=reason,
                        signature=signature,
                        created_at=timezone.now(),
                        staff=staff_instance
                    )
                    firstaid_records.append(firstaid_record)
                    
                except FirstAidInventory.DoesNotExist:
                    raise Exception(f"First Aid ID {finv_id} not found in inventory")
            
            return Response({
                "message": "First Aid request created successfully",
                "patrec_id": patient_record.patrec_id,
                "firstaid_records_created": len(firstaid_records),
                "firstaid_transactions_created": len(firstaid_transactions)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            
            # Manual inventory rollback
            try:
                for finv_id, update_info in inventory_updates.items():
                    firstaid_inv = update_info['firstaid_inv']
                    original_qty = update_info['original_qty']
                    firstaid_inv.finv_qty_avail = original_qty
                    firstaid_inv.save()
                    print(f"Rolled back inventory for first aid {finv_id} to {original_qty}")
            except Exception as rollback_error:
                print(f"Error during inventory rollback: {str(rollback_error)}")
            
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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