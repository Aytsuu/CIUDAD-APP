from rest_framework import generics
from ..models import *
from ..serializers.firstaid_serializers import *
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError, Q
from rest_framework.views import APIView
from pagination import StandardResultsPagination
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import re
from django.db.models.functions import TruncMonth


 
      
class FirstAidListView(generics.ListCreateAPIView):
    serializer_class=FirstAidListSerializers
    queryset=FirstAidList.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
     
class FirstAidListUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class=FirstAidListSerializers
    queryset = FirstAidList.objects.all()
    lookup_field='fa_id'
    
    def get_object(self):
       fa_id = self.kwargs.get('fa_id')
       obj = get_object_or_404(FirstAidList, fa_id = fa_id)
       return obj

class DeleteFirstAidView(generics.DestroyAPIView):
    serializer_class = FirstAidListSerializers    
    queryset = FirstAidList.objects.all()
    lookup_field = 'fa_id'
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
            
class FirstAidInventoryView(generics.ListAPIView):  # Fixed typo: VIew → View
    serializer_class = FirstAidInventorySerializer
    queryset = FirstAidInventory.objects.all()
    
    def get_queryset(self):
        # Filter out FirstAidInventory entries where the related Inventory is archived
        queryset = FirstAidInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset



class FirstAidStockTableView(APIView):
    """
    API view for first aid stocks with pagination, search, and filtering
    """
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            self.auto_archive_expired_first_aid()
            
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            stock_filter = request.GET.get('filter', 'all').lower()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            # Get first aid stocks with related data (not archived)
            first_aid_stocks = FirstAidInventory.objects.select_related(
                'fa_id', 'inv_id'
            ).filter(inv_id__is_Archived=False)
            
            # Apply search filter if provided
            if search_query:
                first_aid_stocks = first_aid_stocks.filter(
                    Q(fa_id__fa_name__icontains=search_query) |
                    Q(inv_id__inv_id__icontains=search_query)
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
            
            # Process first aid stocks
            for stock in first_aid_stocks:
                # Convert quantities to integers to avoid string operations
                finv_qty = int(stock.finv_qty) if stock.finv_qty else 0
                finv_pcs = int(stock.finv_pcs) if stock.finv_pcs else 1
                finv_qty_avail = int(stock.finv_qty_avail) if stock.finv_qty_avail else 0
                finv_used = int(stock.finv_used) if stock.finv_used else 0
                
                # Calculate total pieces
                if stock.finv_qty_unit and stock.finv_qty_unit.lower() == "boxes":
                    total_pcs = finv_qty * finv_pcs
                else:
                    total_pcs = finv_qty
                
                # Calculate available stock
                available_stock = finv_qty_avail
                
                # Check expiry status
                expiry_date = stock.inv_id.expiry_date if stock.inv_id else None
                is_expired = expiry_date and expiry_date < today if expiry_date else False
                
                # Check near expiry (within 30 days)
                is_near_expiry = False
                if expiry_date and not is_expired:
                    days_until_expiry = (expiry_date - today).days
                    is_near_expiry = 0 < days_until_expiry <= 30
                
                # Check low stock based on unit type
                if stock.finv_qty_unit and stock.finv_qty_unit.lower() == "boxes":
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
                if stock.finv_qty_unit and stock.finv_qty_unit.lower() == "boxes":
                    used_qty = total_pcs - available_stock
                    used_display = f"{used_qty} pcs"
                else:
                    used_qty = finv_qty - available_stock
                    used_display = f"{used_qty} {stock.finv_qty_unit}"
                
                item_data = {
                    'type': 'first_aid',
                    'id': stock.finv_id,
                    'batchNumber': stock.inv_id.inv_id if stock.inv_id else "N/A",
                    'category': stock.fa_id.cat.cat_name if stock.fa_id and stock.fa_id.cat else "N/A",
                    'item': {
                        'fa_name': stock.fa_id.fa_name if stock.fa_id else "Unknown First Aid",
                    },
                    'qty': {
                        'finv_qty': finv_qty,
                        'finv_pcs': finv_pcs,
                    },
                    'finv_qty_unit': stock.finv_qty_unit,
                    'administered': used_display,
                    'wastedDose': "0",  # Add if you have wasted first aid tracking
                    'availableStock': available_stock,
                    'expiryDate': expiry_date.isoformat() if expiry_date else None,
                    'inv_id': stock.inv_id.inv_id if stock.inv_id else None,
                    'fa_id': stock.fa_id.fa_id if stock.fa_id else None,
                    'finv_id': stock.finv_id,
                    'qty_number': finv_qty,
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
                'error': f'Error fetching first aid stock data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def auto_archive_expired_first_aid(self):
        """Auto-archive first aid items that expired more than 10 days ago"""
        from datetime import timedelta
        
        today = timezone.now().date()
        archive_date = today - timedelta(days=10)
        
        print(f"Auto-archiving first aid items expired before: {archive_date}")
        
        # Archive expired first aid stocks
        first_aid_stocks = FirstAidInventory.objects.select_related('inv_id').filter(
            inv_id__expiry_date__lte=archive_date,
            inv_id__is_Archived=False
        )
        
        archived_first_aid_count = 0
        for stock in first_aid_stocks:
            stock.inv_id.is_Archived = True
            stock.inv_id.save()
            archived_first_aid_count += 1
            print(f"Archived first aid stock: {stock.finv_id}, Expiry: {stock.inv_id.expiry_date}")
        
        print(f"Auto-archived {archived_first_aid_count} first aid items")
        
        
class FirstAidStockCreate(APIView):
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
            
            # Step 2: Create FirstAidInventory
            firstaid_inventory_data = self._prepare_firstaid_inventory_data(data, inv_id)
            firstaid_inventory_serializer = FirstAidInventorySerializer(data=firstaid_inventory_data)
            
            if not firstaid_inventory_serializer.is_valid():
                return Response({
                    'error': 'FirstAidInventory validation failed',
                    'details': firstaid_inventory_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            firstaid_inventory = firstaid_inventory_serializer.save()
            finv_id = firstaid_inventory.finv_id
            
            # Step 3: Create FirstAidTransaction
            firstaid_transaction_data = self._prepare_firstaid_transaction_data(data, finv_id)
            firstaid_transaction_serializer = FirstTransactionSerializer(data=firstaid_transaction_data)
            
            if not firstaid_transaction_serializer.is_valid():
                return Response({
                    'error': 'FirstAidTransaction validation failed',
                    'details': firstaid_transaction_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            firstaid_transaction = firstaid_transaction_serializer.save()
            
            # Return success response with all created IDs
            return Response({
                'success': True,
                'message': 'First Aid stock created successfully',
                'data': {
                    'inv_id': inv_id,
                    'finv_id': finv_id,
                    'fat_id': firstaid_transaction.fat_id
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Transaction will be automatically rolled back due to @transaction.atomic
            return Response({
                'error': 'Failed to create first aid stock',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _prepare_inventory_data(self, data):
        """Prepare inventory data from request"""
        return {
            'expiry_date': data.get('expiry_date'),
            'inv_type': data.get('inv_type', 'First Aid'),  # default type
            'is_Archived': False
        }
    
    def _prepare_firstaid_inventory_data(self, data, inv_id):
        """Prepare first aid inventory data from request"""
        # Handle nested data structure if present
        if 'data' in data:
            nested_data = data.get('data', {})
            firstaid_data = {
                **nested_data,
                'fa_id': data.get('fa_id'),
                'inv_id': inv_id
            }
        else:
            firstaid_data = data.copy()
            firstaid_data['inv_id'] = inv_id
        
        # Validate fa_id
        fa_id = firstaid_data.get('fa_id')
        if not fa_id or not isinstance(fa_id, str):
            raise ValueError("Invalid first aid item selection: fa_id must be a non-empty string")
        
        firstaid_data['fa_id'] = fa_id
        
        # Calculate quantities based on unit
        is_boxes = firstaid_data.get('finv_qty_unit') == 'boxes'
        qty = int(firstaid_data.get('finv_qty', 0))
        pcs_per_box = int(firstaid_data.get('finv_pcs', 0)) if is_boxes else 0
        
        # Set calculated fields
        firstaid_data.update({
            'finv_qty': qty,
            'finv_pcs': pcs_per_box,
            'finv_used': firstaid_data.get('finv_used', 0)
        })
        
        # Calculate total available quantity
        if is_boxes:
            firstaid_data['finv_qty_avail'] = qty * pcs_per_box
        else:
            firstaid_data['finv_qty_avail'] = qty
            
        # Handle staff field
        staff = firstaid_data.get('staff')
        if staff:
            firstaid_data['staff'] = int(staff)
        else:
            firstaid_data['staff'] = None
        
        return firstaid_data
    
    def _prepare_firstaid_transaction_data(self, data, finv_id):
        """Prepare first aid transaction data from request"""
        qty_unit = data.get('finv_qty_unit')
        qty = data.get('finv_qty', 0)
        pcs = data.get('finv_pcs', 0)
        
        # Format quantity string based on unit
        if qty_unit == 'boxes':
            fat_qty = f"{qty} boxes ({pcs} pcs per box)"
        else:
            fat_qty = f"{qty} {qty_unit}"
        
        return {
            'fat_qty': fat_qty,
            'fat_action': 'Added',
            'finv_id': finv_id,
            'staff': data.get('staff')  # Include staff if provided
        }
class FirstAidInvRetrieveView(generics.RetrieveUpdateAPIView):
    serializer_class=FirstAidInventorySerializer
    queryset = FirstAidInventory.objects.all()
    lookup_field='finv_id'
    
    def get_object(self):
       finv_id = self.kwargs.get('finv_id')
       obj = get_object_or_404(FirstAidInventory, finv_id = finv_id)
       return obj
    
class ArchiveFirstAidInventoryVIew(generics.ListCreateAPIView):
    serializer_class=FirstAidInventorySerializer
    queryset=FirstAidInventory.objects.all()
   
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = FirstAidInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
        return queryset
    
class FirstAidTransactionView(generics.ListCreateAPIView):
    serializer_class=FirstTransactionSerializer
    queryset=FirstAidTransactions.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
     

# ==================FIRST AID REPORT=======================

class FirstAidSummaryMonthsAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            queryset = FirstAidTransactions.objects.all()

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

                # Count distinct firstaid+inventory combos
                total_items = month_transactions.values(
                    "finv_id__fa_id",
                    "finv_id__inv_id"
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

  
  
class MonthlyFirstAidRecordsDetailAPIView(generics.ListAPIView):
    serializer_class = FirstAidInventorySerializer
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

        # Get all unique first aid inventory items that have transactions (using correct related_name)
        fa_inv_items = FirstAidInventory.objects.filter(
            firstaidtransactions__created_at__date__lte=end_date
        ).select_related(
            'fa_id', 'inv_id'
        ).distinct()

        for finv in fa_inv_items:
            transactions = FirstAidTransactions.objects.filter(
                finv_id=finv.finv_id
            ).order_by("created_at")

            unit = finv.finv_qty_unit
            pcs_per_box = finv.finv_pcs if unit and unit.lower() == "boxes" else 1

            # Opening stock before start_date
            opening_in = transactions.filter(
                created_at__date__lt=start_date,
                fat_action__icontains="added"
            )
            opening_out = transactions.filter(
                created_at__date__lt=start_date,
                fat_action__icontains="deduct"
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
                    fat_action__icontains="added"
                )
            )
            if unit and unit.lower() == "boxes":
                received_qty *= pcs_per_box

            # Dispensed during the month
            dispensed_qty = sum(
                self._parse_qty(t) for t in transactions.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    fat_action__icontains="deduct"
                )
            )

            # Opening displayed includes received
            display_opening = opening_qty + received_qty
            closing_qty = display_opening - dispensed_qty

            inventory_summary.append({
                'finv_id': finv.finv_id,
                'inv_id': finv.inv_id_id,
                'fa_name': finv.fa_id.fa_name,
                'opening': display_opening,
                'received': received_qty,
                'dispensed': dispensed_qty,
                'closing': closing_qty,
                'unit': "pcs",
                'expiry': finv.inv_id.expiry_date.strftime('%Y-%m-%d') if finv.inv_id.expiry_date else None,
            })

        return Response({
            'success': True,
            'data': {
                'month': month_str,
                'inventory_summary': inventory_summary,
                'total_items': len(inventory_summary)
            }
        })

    def _parse_qty(self, transaction):
        """Extract numeric value from fat_qty."""
        match = re.search(r'\d+', str(transaction.fat_qty))
        return int(match.group()) if match else 0