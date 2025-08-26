
from rest_framework import generics
from ..models import *
from ..serializers.medicine_serializers import *
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError, Q
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth
from pagination import *
import re




# For listing with pagination and search
class MedicineListTable(generics.ListAPIView):
    serializer_class = MedicineListSerializers
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        queryset = Medicinelist.objects.all().order_by('med_id')
        search_query = self.request.GET.get('search', '').strip()
        
        if search_query:
            queryset = queryset.filter(med_name__icontains=search_query)
        
        return queryset

# For creating new medicines
class MedicineCreateView(generics.ListCreateAPIView):
    serializer_class=MedicineListSerializers
    queryset= Medicinelist.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class MedicineCountView(APIView):
    def get(self, request):
        try:
            count = Medicinelist.objects.count()
            return Response({'count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Failed to get medicine count: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR 
            )
    
    
class DeleteMedicineListView(generics.DestroyAPIView):
    serializer_class = MedicineListSerializers
    queryset = Medicinelist.objects.all()
    lookup_field = 'med_id' 

    def destroy(self, request, *args, **kwargs):
        """Override destroy method to handle ProtectedError properly"""
        try:
            instance = self.get_object()
            print(f"Attempting to delete instance: {instance}")
            instance.delete()
            print("Delete succeeded")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError as e:
            print(f"ProtectedError caught: {e}")
            return Response(
                {"error": "Cannot delete. It is still in use by other records."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
            
class MedicineListUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class=MedicineListSerializers
    queryset = Medicinelist.objects.all()
    lookup_field='med_id'
    
    def get_object(self):
       med_id = self.kwargs.get('med_id')
       obj = get_object_or_404(Medicinelist, med_id = med_id)
       return obj
       
       
class MedicineStockTableView(APIView):
    """
    API view for medicine stocks with pagination, search, and filtering
    """
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            self.auto_archive_expired_medicines()
            
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            stock_filter = request.GET.get('filter', 'all').lower()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            # Get medicine stocks with related data (not archived)
            medicine_stocks = MedicineInventory.objects.select_related(
                'med_id', 'inv_id'
            ).filter(inv_id__is_Archived=False)
            
            # Apply search filter if provided
            if search_query:
                medicine_stocks = medicine_stocks.filter(
                    Q(med_id__med_name__icontains=search_query) |
                    Q(inv_id__inv_id__icontains=search_query) |
                    Q(minv_dsg_unit__icontains=search_query)
                )
            
            # Calculate today's date for expiry comparisons
            today = timezone.now().date()
            
            combined_data = []
            filter_counts = {
                'out_of_stock': 0,
                'low_stock': 0,
                'near_expiry': 0,
                'expired': 0,
                'total': 0
            }
            
            # Process medicine stocks
            for stock in medicine_stocks:
                # Calculate total pieces
                if stock.minv_qty_unit.lower() == "boxes":
                    total_pcs = stock.minv_qty * stock.minv_pcs
                else:
                    total_pcs = stock.minv_qty
                
                # Calculate available stock
                available_stock = stock.minv_qty_avail
                
                # Check expiry status
                expiry_date = stock.inv_id.expiry_date if stock.inv_id else None
                is_expired = expiry_date and expiry_date < today if expiry_date else False
                
                # Check near expiry (within 30 days)
                is_near_expiry = False
                if expiry_date and not is_expired:
                    days_until_expiry = (expiry_date - today).days
                    is_near_expiry = 0 < days_until_expiry <= 30
                
                # Check low stock based on unit type
                if stock.minv_qty_unit.lower() == "boxes":
                    # For boxes, low stock threshold is 2 boxes
                    is_low_stock = available_stock <= 2
                else:
                    # For pieces, low stock threshold is 20 pcs
                    is_low_stock = available_stock <= 20
                
                # Check out of stock
                is_out_of_stock = available_stock <= 0
                
                # Update filter counts (only count non-archived items)
                if not stock.inv_id.is_Archived if stock.inv_id else False:
                    filter_counts['total'] += 1
                    if is_out_of_stock:
                        filter_counts['out_of_stock'] += 1
                    if is_low_stock and not is_expired:
                        filter_counts['low_stock'] += 1
                    if is_near_expiry:
                        filter_counts['near_expiry'] += 1
                    if is_expired:
                        filter_counts['expired'] += 1
                
                # Apply filter
                if stock_filter != 'all':
                    if stock_filter == 'expired' and not is_expired:
                        continue
                    elif stock_filter == 'near_expiry' and not is_near_expiry:
                        continue
                    elif stock_filter == 'low_stock' and not is_low_stock:
                        continue
                    elif stock_filter == 'out_of_stock' and not is_out_of_stock:
                        continue
                
                # Calculate used quantity
                if stock.minv_qty_unit.lower() == "boxes":
                    used_qty = total_pcs - available_stock
                    used_display = f"{used_qty} pcs"
                else:
                    used_qty = stock.minv_qty - available_stock
                    used_display = f"{used_qty} {stock.minv_qty_unit}"
                
                item_data = {
                    'type': 'medicine',
                    'id': stock.minv_id,
                    'batchNumber': stock.inv_id.inv_id if stock.inv_id else "N/A",
                    'category': stock.med_id.cat.cat_name if stock.med_id and stock.med_id.cat else "N/A",
                    'item': {
                        'medicineName': stock.med_id.med_name if stock.med_id else "Unknown Medicine",
                        'dosage': stock.minv_dsg,
                        'dsgUnit': stock.minv_dsg_unit,
                        'form': stock.minv_form,
                    },
                    'qty': {
                        'qty': stock.minv_qty,
                        'pcs': stock.minv_pcs,
                    },
                    'minv_qty_unit': stock.minv_qty_unit,
                    'administered': used_display,
                    'wasted': "0",  # Add if you have wasted medicine tracking
                    'availableStock': available_stock,
                    'expiryDate': expiry_date.isoformat() if expiry_date else None,
                    'inv_id': stock.inv_id.inv_id if stock.inv_id else None,
                    'med_id': stock.med_id.med_id if stock.med_id else None,
                    'minv_id': stock.minv_id,
                    'qty_number': stock.minv_qty,
                    'isArchived': stock.inv_id.is_Archived if stock.inv_id else False,
                    'created_at': stock.created_at.isoformat() if stock.created_at else None,
                    'isExpired': is_expired,
                    'isNearExpiry': is_near_expiry,
                    'isLowStock': is_low_stock,
                    'isOutOfStock': is_out_of_stock
                }
                
                combined_data.append(item_data)
            
            # Sort by ID descending
            combined_data.sort(key=lambda x: x['id'], reverse=True)
            
            # Apply pagination
            paginator = self.pagination_class()
            paginated_data = paginator.paginate_queryset(combined_data, request)
            
            if paginated_data is not None:
                # Create custom response with both paginated data and filter counts
                response = paginator.get_paginated_response(paginated_data)
                # Add filter_counts to the response data
                response_data = response.data
                response_data['filter_counts'] = filter_counts
                return Response(response_data)
            
            return Response({
                'success': True,
                'data': combined_data,
                'count': len(combined_data),
                'filter_counts': filter_counts
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error fetching medicine stock data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def auto_archive_expired_medicines(self):
        """Auto-archive medicines that expired more than 10 days ago"""
        from datetime import timedelta
        
        today = timezone.now().date()
        archive_date = today - timedelta(days=10)
        
        print(f"Auto-archiving medicine items expired before: {archive_date}")
        
        # Archive expired medicine stocks
        medicine_stocks = MedicineInventory.objects.select_related('inv_id').filter(
            inv_id__expiry_date__lte=archive_date,
            inv_id__is_Archived=False
        )
        
        archived_medicine_count = 0
        for stock in medicine_stocks:
            stock.inv_id.is_Archived = True
            stock.inv_id.save()
            archived_medicine_count += 1
            print(f"Archived medicine stock: {stock.minv_id}, Expiry: {stock.inv_id.expiry_date}")
        
        print(f"Auto-archived {archived_medicine_count} medicine items")  

class MedicineInventoryView(generics.ListAPIView):
    serializer_class = MedicineInventorySerializer
    queryset = MedicineInventory.objects.all()
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = MedicineInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset

class MedicineStockCreate(APIView):
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            
            # Step 1: Create Inventory
            inventory_data = self._prepare_inventory_data(data)
            inventory_serializer = InventorySerializers(data=inventory_data)
            
            if not inventory_serializer.is_valid():
                return Response({
                    'error': 'Inventory validation failed',
                    'details': inventory_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            inventory = inventory_serializer.save()
            inv_id = inventory.inv_id
            
            # Step 2: Create MedicineInventory
            medicine_inventory_data = self._prepare_medicine_inventory_data(data, inv_id)
            medicine_inventory_serializer = MedicineInventorySerializer(data=medicine_inventory_data)
            
            if not medicine_inventory_serializer.is_valid():
                return Response({
                    'error': 'MedicineInventory validation failed',
                    'details': medicine_inventory_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            medicine_inventory = medicine_inventory_serializer.save()
            minv_id = medicine_inventory.minv_id
            
            # Step 3: Create MedicineTransaction
            medicine_transaction_data = self._prepare_medicine_transaction_data(data, minv_id)
            medicine_transaction_serializer = MedicineTransactionSerializers(data=medicine_transaction_data)
            
            if not medicine_transaction_serializer.is_valid():
                return Response({
                    'error': 'MedicineTransaction validation failed',
                    'details': medicine_transaction_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            medicine_transaction = medicine_transaction_serializer.save()
            
            # Return success response with all created IDs
            return Response({
                'success': True,
                'message': 'Medicine stock created successfully',
                'data': {
                    'inv_id': inv_id,
                    'minv_id': minv_id,
                    'mdt_id': medicine_transaction.mdt_id
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Transaction will be automatically rolled back due to @transaction.atomic
            return Response({
                'error': 'Failed to create medicine stock',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _prepare_inventory_data(self, data):
        """Prepare inventory data from request"""
        return {
            'expiry_date': data.get('expiry_date'),
            'inv_type': data.get('inv_type', 'medicine'),  # default type
            'is_Archived': False
        }
    
    def _prepare_medicine_inventory_data(self, data, inv_id):
        """Prepare medicine inventory data from request"""
        # Handle nested data structure if present
        if 'data' in data:
            nested_data = data.get('data', {})
            medicine_data = {
                **nested_data,
                'medicineID': data.get('medicineID'),
                'inv_id': inv_id
            }
        else:
            medicine_data = data.copy()
            medicine_data['inv_id'] = inv_id
        
        # Validate medicineID
        medicine_id = medicine_data.get('medicineID')
        if not medicine_id:
            raise ValueError("Medicine ID is required and cannot be empty.")

        medicine_data['med_id'] = medicine_id  # Calculate quantities based on unit
        is_boxes = medicine_data.get('unit') == 'boxes'
        qty = int(medicine_data.get('qty', 0))
        pcs_per_box = int(medicine_data.get('pcs', 0)) if is_boxes else 0
        
        # Map frontend fields to backend fields and set calculated fields
        medicine_data.update({
            'minv_dsg': int(medicine_data.get('dosage', 0)),
            'minv_dsg_unit': medicine_data.get('dsgUnit', 'N/A'),
            'minv_form': medicine_data.get('form', 'N/A'),
            'minv_qty': qty,
            'minv_qty_unit': medicine_data.get('unit', 'N/A'),
            'minv_pcs': pcs_per_box
        })
        
        # Calculate total available quantity
        if is_boxes:
            medicine_data['minv_qty_avail'] = qty * pcs_per_box
        else:
            medicine_data['minv_qty_avail'] = qty
        
        # Handle staff field
        staff = medicine_data.get('staff')
        if staff:
            medicine_data['staff'] = int(staff)
        else:
            medicine_data['staff'] = None
        
        return medicine_data
    
    def _prepare_medicine_transaction_data(self, data, minv_id):
        """Prepare medicine transaction data from request"""
        qty_unit = data.get('unit')
        qty = data.get('qty', 0)
        pcs = data.get('pcs', 0)
        
        # Format quantity string based on unit
        if qty_unit == 'boxes':
            mdt_qty = f"{qty} boxes ({pcs} pcs per box)"
        else:
            mdt_qty = f"{qty} {qty_unit}"
        
        return {
            'mdt_qty': mdt_qty,
            'mdt_action': 'Added',
            'minv_id': minv_id,
            'staff': data.get('staff')  # Include staff if provided
        }
class MedicineInvRetrieveView(generics.RetrieveUpdateAPIView):
    serializer_class=MedicineInventorySerializer
    queryset = MedicineInventory.objects.all()
    lookup_field='minv_id'
    
    def get_object(self):
       minv_id = self.kwargs.get('minv_id')
       obj = get_object_or_404(MedicineInventory, minv_id = minv_id)
       return obj
   
   
class ArchiveMedicineInventoryView(generics.ListCreateAPIView):
    serializer_class=MedicineInventorySerializer
    queryset=MedicineInventory.objects.all()
  
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = MedicineInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
        return queryset
    
    

class MedicineTransactionView(generics.ListCreateAPIView):
    serializer_class=MedicineTransactionSerializers
    queryset=MedicineTransactions.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    
    

# ==================MEDICINE REPORT=======================

class MedicineSummaryMonthsAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            queryset = MedicineTransactions.objects.all()

            search_query = request.GET.get('search', '').strip().lower()
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
                        queryset = queryset.filter(created_at__year=year)
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid year format. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Get distinct months in queryset, sorted descending
            distinct_months = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').distinct().order_by('-month')

            formatted_months = []

            for item in distinct_months:
                month_date = item['month']
                if not month_date:
                    continue
                month_str = month_date.strftime('%Y-%m')
                month_name = month_date.strftime('%B %Y')

                if search_query and search_query not in month_name.lower():
                    continue

                # Get the date range for this month
                start_date = month_date.date()
                from calendar import monthrange
                last_day = monthrange(start_date.year, start_date.month)[1]
                end_date = start_date.replace(day=last_day)

                # Filter transactions for this month
                month_transactions = queryset.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                )

                # Count distinct medicine+inventory combos
                total_items = month_transactions.values(
                    "minv_id__med_id",
                    "minv_id__inv_id"
                ).distinct().count()

                formatted_months.append({
                    'month': month_str,
                    'month_name': month_name,
                    'total_items': total_items,
                })

            paginator = self.pagination_class()
            page = paginator.paginate_queryset(formatted_months, request)
            if page is not None:
                return paginator.get_paginated_response({
                    'success': True,
                    'data': page,
                    'total_months': len(formatted_months),
                })

            return Response({
                'success': True,
                'data': formatted_months,
                'total_months': len(formatted_months),
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            
class MonthlyMedicineRecordsDetailAPIView(generics.ListAPIView):
    serializer_class = MedicineInventorySerializer
    pagination_class = StandardResultsPagination

    def list(self, request, *args, **kwargs):
        month_str = self.kwargs['month']  # Format: YYYY-MM
        try:
            year, month = map(int, month_str.split('-'))
        except ValueError:
            return Response({"error": "Invalid month format"}, status=400)

        start_date = datetime(year, month, 1).date()
        end_date = (start_date + relativedelta(months=1)) - timedelta(days=1)

        inventory_summary = []

        # Identify unique medicine + inv_id (inventory) combinations from transactions up to end_date
        med_inv_pairs = MedicineTransactions.objects.filter(
            created_at__date__lte=end_date
        ).values_list(
            "minv_id__med_id",
            "minv_id__inv_id"
        ).distinct()

        for med_id, inv_id in med_inv_pairs:
            transactions = MedicineTransactions.objects.filter(
                minv_id__med_id=med_id,
                minv_id__inv_id=inv_id
            ).order_by("created_at")

            first_tx = transactions.select_related("minv_id__med_id", "minv_id__inv_id").first()
            if not first_tx:
                continue

            unit = first_tx.minv_id.minv_qty_unit
            pcs_per_box = first_tx.minv_id.minv_pcs if unit and unit.lower() == "boxes" else 1

            # Opening stock before start_date
            opening_in = transactions.filter(
                created_at__date__lt=start_date,
                mdt_action__icontains="added"
            )
            opening_out = transactions.filter(
                created_at__date__lt=start_date,
                mdt_action__icontains="deduct"
            )
            opening_qty = (sum(self._parse_qty(t) for t in opening_in) -
                           sum(self._parse_qty(t) for t in opening_out))

            if unit and unit.lower() == "boxes":
                opening_qty *= pcs_per_box

            # Received during the month
            received_qty = sum(
                self._parse_qty(t) for t in transactions.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    mdt_action__icontains="added"
                )
            )
            if unit and unit.lower() == "boxes":
                received_qty *= pcs_per_box

            # Dispensed during the month
            dispensed_qty = sum(
                self._parse_qty(t) for t in transactions.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    mdt_action__icontains="deduct"
                )
            )

            # Opening displayed includes received
            display_opening = opening_qty + received_qty
            closing_qty = display_opening - dispensed_qty

            inventory_summary.append({
                'med_name': f"{first_tx.minv_id.med_id.med_name} {first_tx.minv_id.minv_dsg}{first_tx.minv_id.minv_dsg_unit} {first_tx.minv_id.minv_form}",
                'opening': display_opening,
                'received': received_qty,
                'dispensed': dispensed_qty,
                'closing': closing_qty,
                'unit': "pcs",
                'expiry': first_tx.minv_id.inv_id.expiry_date
            })

        # Remove duplicates by med_name, keep first occurrence (same as before)
        unique_summary = []
        seen_meds = set()
        for item in inventory_summary:
            if item['med_name'] not in seen_meds:
                unique_summary.append(item)
                seen_meds.add(item['med_name'])

        return Response({
            'success': True,
            'data': {
                'month': month_str,
                'inventory_summary': unique_summary,
                'total_items': len(unique_summary)
            }
        })

    def _parse_qty(self, transaction):
        """Extract numeric value from mdt_qty."""
        match = re.search(r'\d+', str(transaction.mdt_qty))
        return int(match.group()) if match else 0

    