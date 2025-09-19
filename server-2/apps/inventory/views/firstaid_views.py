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
from calendar import monthrange


 
      
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
        """Auto-archive first aid items that expired more than 10 days ago and log transactions"""
        
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
            # Get the current available quantity before archiving
            current_qty = stock.finv_qty_avail or 0
            
            # Determine the unit and format quantity with unit
            if stock.finv_qty_unit and stock.finv_qty_unit.lower() == "boxes":
                # For boxes, show quantity in pieces
                qty_with_unit = f"{current_qty} pcs"
            else:
                # For other units, use the actual unit
                unit = stock.finv_qty_unit if stock.finv_qty_unit else "pcs"
                qty_with_unit = f"{current_qty} {unit}"
            
            # Archive the inventory
            stock.inv_id.is_Archived = True
            stock.inv_id.save()
            
            # Create transaction record for the archive action
            FirstAidTransactions.objects.create(
                fat_qty=qty_with_unit,  # Record the quantity with unit that was archived
                fat_action='Expired',  # Clear action indicating expiration-based archiving
                finv_id=stock,  # Reference to the first aid inventory
                staff=None  # System action, so no staff member
            )
            
            archived_first_aid_count += 1
            print(f"Archived first aid stock: {stock.finv_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")
        
        print(f"Auto-archived {archived_first_aid_count} first aid items with transaction records")
        
        
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
    

class FirstAidTransactionView(generics.ListCreateAPIView):
    serializer_class=FirstTransactionSerializer
    queryset=FirstAidTransactions.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
     
     
     
# ===========================FIRST AID ARCHIVE==============================
class FirstAidArchiveInventoryView(APIView):
    
    def patch(self, request, inv_id):
        """
        Archive first aid inventory item and create expired transaction only if expired AND has available stock
        """
        try:
            # Get inventory item
            inventory = get_object_or_404(Inventory, inv_id=inv_id)
            
            # Archive the inventory
            inventory.is_Archived = True
            inventory.updated_at = timezone.now()
            inventory.save()
            
            # Check if item is expired and has available stock to create transaction
            is_expired = request.data.get('is_expired', False)
            has_available_stock = request.data.get('has_available_stock', False)
            
            transaction_created = False
            if is_expired and has_available_stock:
                try:
                    self._create_expired_transaction(inventory)
                    transaction_created = True
                except Exception as e:
                    # Roll back the archive operation if transaction creation fails
                    inventory.is_Archived = False
                    inventory.save()
                    return Response(
                        {"error": f"Failed to create transaction for expired first aid: {str(e)}"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            return Response(
                {
                    "message": "First aid inventory archived successfully", 
                    "inv_id": inv_id,
                    "transaction_created": transaction_created
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {"error": f"Error archiving first aid inventory: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _create_expired_transaction(self, inventory):
        """
        Create expired transaction for first aid items with available stock
        """
        if not hasattr(inventory, 'inventory_firstaid'):
            raise Exception("No first aid inventory found for this inventory item")
        
        first_aid_inventory = inventory.inventory_firstaid
        current_qty = first_aid_inventory.finv_qty_avail or 0
        unit = first_aid_inventory.finv_qty_unit or "pcs"
        
        if unit.lower() == "boxes":
            qty_with_unit = f"{current_qty} pcs"
        else:
            qty_with_unit = f"{current_qty} {unit}"
        
        # Create the first aid transaction
        FirstAidTransactions.objects.create(
            fat_qty=qty_with_unit,
            fat_action="Expired",
            finv_id=first_aid_inventory,
            staff=None  # None for system action
        )


# ===========================TRANSACTION===================================

class FirstAidTransactionView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            # Get first aid transactions with related data
            transactions = FirstAidTransactions.objects.select_related(
                'finv_id__fa_id', 
                'finv_id__inv_id',
                'staff'
            ).all()
            
            # Apply search filter if provided
            if search_query:
                transactions = transactions.filter(
                    Q(finv_id__fa_id__fa_name__icontains=search_query) |
                    Q(finv_id__inv_id__inv_id__icontains=search_query) |
                    Q(fat_action__icontains=search_query) |
                    Q(staff__first_name__icontains=search_query) |
                    Q(staff__last_name__icontains=search_query)
                )
            
            # Format the data for response
            transaction_data = []
            
            for transaction in transactions:
                # Get related inventory and first aid data
                firstaid_inventory = transaction.finv_id
                firstaid = firstaid_inventory.fa_id if firstaid_inventory else None
                inventory = firstaid_inventory.inv_id if firstaid_inventory else None
                staff = transaction.staff
                
                # Format staff name
                staff_name = "Manage by System"
                if staff:
                    staff_name = f"{staff.first_name or ''} {staff.last_name or ''}".strip()
                    if not staff_name:
                        staff_name = staff.username
                
                item_data = {
                    'fat_id': transaction.fat_id,
                    'fa_name': firstaid.fa_name if firstaid else "Unknown First Aid Item",
                    'fat_qty': transaction.fat_qty,
                    'fat_action': transaction.fat_action,
                    'staff': staff_name,
                    'created_at': transaction.created_at.isoformat() if transaction.created_at else None,
                }
                
                transaction_data.append(item_data)
            
            # Sort by created_at descending (most recent first)
            transaction_data.sort(key=lambda x: x['created_at'] if x['created_at'] else '', reverse=True)
            
            # Apply pagination
            paginator = self.pagination_class()
            paginator.page_size = page_size
            page_data = paginator.paginate_queryset(transaction_data, request)
            
            if page_data is not None:
                response = paginator.get_paginated_response(page_data)
                return Response(response.data)
            
            return Response({
                'success': True,
                'results': transaction_data,
                'count': len(transaction_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"Error traceback: {traceback.format_exc()}")
            return Response({
                'success': False,
                'error': f'Error fetching first aid transactions: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
# ===========================FIRST AID ARCHIVED TABLE==============================
class ArchivedFirstAidTable(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            filter_type = request.GET.get('filter', 'all')  # all, expired, out_of_stock
            
            # Get archived first aid inventories
            firstaid_inventories = FirstAidInventory.objects.select_related(
                'fa_id', 'inv_id'
            ).filter(inv_id__is_Archived=True)
            
            # Apply search filter if provided
            if search_query:
                firstaid_inventories = firstaid_inventories.filter(
                    Q(fa_id__fa_name__icontains=search_query) |
                    Q(inv_id__inv_id__icontains=search_query) |
                    Q(finv_qty_unit__icontains=search_query)
                )
            
            # Calculate today's date for expiry comparisons
            today = timezone.now().date()
            
            # Apply reason filter
            if filter_type == 'expired':
                firstaid_inventories = firstaid_inventories.filter(
                    Q(inv_id__expiry_date__lt=today)
                )
            elif filter_type == 'out_of_stock':
                firstaid_inventories = firstaid_inventories.filter(
                    Q(finv_qty_avail=0) & 
                    (Q(inv_id__expiry_date__gte=today) | Q(inv_id__expiry_date__isnull=True))
                )
            
            archived_data = []
            
            # Process archived first aid inventories
            for inventory in firstaid_inventories:
                # Get the inventory record
                inv_record = inventory.inv_id
                
                # Safely handle None values with defaults
                finv_qty = inventory.finv_qty or 0
                finv_qty_avail = inventory.finv_qty_avail or 0
                wasted = inventory.wasted or 0
                finv_pcs = inventory.finv_pcs or 0
                finv_used = inventory.finv_used or 0
                
                # Calculate total pieces (for boxes)
                total_pcs = finv_qty * finv_pcs if inventory.finv_qty_unit and inventory.finv_qty_unit.lower() == "boxes" else finv_qty
                
                # Calculate total quantity display
                if inventory.finv_qty_unit and inventory.finv_qty_unit.lower() == "boxes":
                    total_qty_display = f"{finv_qty} boxes ({total_pcs} pcs)"
                else:
                    total_qty_display = f"{finv_qty} {inventory.finv_qty_unit or 'units'}"
                
                # Check expiry status
                expiry_date = inv_record.expiry_date if inv_record else None
                is_expired = expiry_date and expiry_date < today if expiry_date else False
                
                # Determine archive reason
                archive_reason = 'Expired' if is_expired else 'Out of Stock'
                
                # Calculate actual used quantity
                # If available stock is 0, then quantity used should be 0
                if finv_qty_avail == 0:
                    actual_used = 0
                else:
                    # Otherwise, calculate as Total Qty - Available Stock - Wasted
                    actual_used = total_pcs - finv_qty_avail - wasted
                
                item_data = {
                    'type': 'firstaid',
                    'id': inventory.finv_id,
                    'category': 'First Aid',
                    'item': {
                        'fa_name': inventory.fa_id.fa_name if inventory.fa_id else "Unknown First Aid Item",
                        'unit': inventory.finv_qty_unit or 'units',
                    },
                    'qty': {
                        'finv_qty': finv_qty,
                        'finv_pcs': total_pcs  # Total pieces for boxes, otherwise same as finv_qty
                    },
                    'administered': actual_used,
                    'wasted': wasted,
                    'availableStock': finv_qty_avail,
                    'expiryDate': expiry_date.isoformat() if expiry_date else "N/A",
                    'archivedDate': inv_record.updated_at.isoformat() if inv_record and inv_record.updated_at else inv_record.created_at.isoformat() if inv_record else None,
                    'reason': archive_reason,
                    'inv_id': inv_record.inv_id if inv_record else None,
                    'fa_id': inventory.fa_id.fa_id if inventory.fa_id else None,
                    'finv_id': inventory.finv_id,
                    'finv_qty_unit': inventory.finv_qty_unit or 'units',
                    'finv_pcs': finv_pcs,
                    'isArchived': inv_record.is_Archived if inv_record else False,
                    'created_at': inventory.created_at.isoformat() if inventory.created_at else None,
                }
                
                archived_data.append(item_data)
            
            # Sort by archived date descending (most recent first)
            archived_data.sort(key=lambda x: x['archivedDate'] if x['archivedDate'] else '', reverse=True)
            
            # Apply pagination
            paginator = self.pagination_class()
            paginator.page_size = page_size
            page_data = paginator.paginate_queryset(archived_data, request)
            
            if page_data is not None:
                response = paginator.get_paginated_response(page_data)
                return Response(response.data)
            
            return Response({
                'success': True,
                'results': archived_data,
                'count': len(archived_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"Error traceback: {traceback.format_exc()}")
            return Response({
                'success': False,
                'error': f'Error fetching archived first aid items: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class FirstAidDeduct(APIView):
    def post(self,request,*args, **kwargs):
        try:
            data = request.data.get('data', {})
            record = request.data.get('record', {})
            finv_id = record.get('id')
            deduct_qty = int(data.get('wastedAmount', 0))
            action = "Deducted"
            staff_id = data.get('staff_id')
            print("Deducting quantity:", deduct_qty)     
            print("From inventory ID:", finv_id)
            
            if deduct_qty <= 0:
                return Response({
                    'error': 'Deduct quantity must be greater than zero.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            firstaid_inventory = get_object_or_404(FirstAidInventory, finv_id=finv_id)
            current_avail = firstaid_inventory.finv_qty_avail or 0
            
            if deduct_qty > current_avail:
                return Response({
                    'error': 'Deduct quantity exceeds available stock.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update available quantity
            firstaid_inventory.finv_qty_avail = current_avail - deduct_qty
            firstaid_inventory.finv_used = (firstaid_inventory.finv_used or 0) + deduct_qty
            firstaid_inventory.save()
            
            # Format quantity string for transaction
            if firstaid_inventory.finv_qty_unit and firstaid_inventory.finv_qty_unit.lower() == "boxes":
                qty_str = f"{deduct_qty} pcs"
            else:
                qty_str = f"{deduct_qty} {firstaid_inventory.finv_qty_unit or 'units'}"
            
            # Create transaction record
            FirstAidTransactions.objects.create(
                fat_qty=qty_str,
                fat_action=action,
                finv_id=firstaid_inventory,
                staff_id=staff_id if staff_id else None
            )
            
            return Response({
                'success': True,
                'message': 'First aid stock deducted successfully.'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': f'Error deducting first aid stock: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






























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

                # Filter transactions for this month - EXCLUDE expired items
                month_transactions = queryset.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                ).exclude(
                    # Exclude items that expired BEFORE this month
                    finv_id__inv_id__expiry_date__lt=start_date
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

        # Get unique first aid + expiry_date + inv_id combos to avoid duplicates
        fa_expiry_inv_pairs = FirstAidTransactions.objects.filter(
            created_at__date__lte=end_date
        ).values_list(
            "finv_id__fa_id",
            "finv_id__inv_id__expiry_date",
            "finv_id__inv_id"
        ).distinct()

        # Track unique combinations to avoid duplicates
        seen_combinations = set()

        for fa_id, expiry_date, inv_id in fa_expiry_inv_pairs:
            # Skip if expiry date is before the current month (already expired)
            if expiry_date and expiry_date < start_date:
                continue
                
            # Create a unique key for this combination
            combo_key = (fa_id, expiry_date, inv_id)
            
            # Skip if we've already processed this combination
            if combo_key in seen_combinations:
                continue
                
            seen_combinations.add(combo_key)

            # Get the specific first aid inventory item
            try:
                finv = FirstAidInventory.objects.get(
                    fa_id=fa_id,
                    inv_id__expiry_date=expiry_date,
                    inv_id=inv_id
                )
            except FirstAidInventory.DoesNotExist:
                continue

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
            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                fat_action__icontains="added"
            )
            received_qty = sum(self._parse_qty(t) for t in monthly_transactions)
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

            # Check if expired this month
            expired_this_month = (finv.inv_id.expiry_date and 
                                start_date <= finv.inv_id.expiry_date <= end_date)
            
            # REMOVED: Don't set closing to 0 for expired items
            # if expired_this_month:
            #     closing_qty = 0
            
            # Skip if there's no stock and it's not expiring this month
            # Also include items that expired this month even if closing_qty <= 0
            if closing_qty <= 0 and (not expiry_date or expiry_date > end_date) and not expired_this_month:
                continue

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
                'expired_this_month': expired_this_month,
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
    
    
# First Aid Expired/Out-of-Stock Summary API View
class FirstAidExpiredOutOfStockSummaryAPIView(APIView):
    pagination_class = StandardResultsPagination

    def _parse_qty(self, transaction, multiply_boxes=False):
        """Extract numeric value from fat_qty and convert boxes to pieces if needed."""
        match = re.search(r'\d+', str(transaction.fat_qty))
        qty_num = int(match.group()) if match else 0
        
        if (multiply_boxes and 
            transaction.finv_id.finv_qty_unit and 
            transaction.finv_id.finv_qty_unit.lower() == "boxes"):
            pcs_per_box = transaction.finv_id.finv_pcs or 1
            qty_num *= pcs_per_box
            
        return qty_num

    def get(self, request):
        try:
            # Get distinct months from first aid transactions
            distinct_months = FirstAidTransactions.objects.annotate(
                month=TruncMonth('created_at')
            ).values('month').distinct().order_by('-month')

            formatted_months = []

            for item in distinct_months:
                month_date = item['month']
                if not month_date:
                    continue
                    
                month_str = month_date.strftime('%Y-%m')
                month_name = month_date.strftime('%B %Y')

                # Get the date range for this month
                start_date = month_date.date()
                last_day = monthrange(start_date.year, start_date.month)[1]
                end_date = start_date.replace(day=last_day)
                near_expiry_threshold = end_date + timedelta(days=30)

                # Get all first aid inventory items that were active up to this month
                fa_expiry_inv_pairs = FirstAidTransactions.objects.filter(
                    created_at__date__lte=end_date
                ).values_list(
                    "finv_id__fa_id",
                    "finv_id__inv_id__expiry_date",
                    "finv_id__inv_id"
                ).distinct()

                expired_count = 0
                out_of_stock_count = 0
                expired_out_of_stock_count = 0
                near_expiry_count = 0

                seen_combinations = set()

                for fa_id, expiry_date, inv_id in fa_expiry_inv_pairs:
                    # Create a unique key for this combination
                    combo_key = (fa_id, expiry_date, inv_id)
                    if combo_key in seen_combinations:
                        continue
                    seen_combinations.add(combo_key)

                    # Skip if no expiry date (can't be expired or near expiry)
                    if not expiry_date:
                        continue

                    # Skip if expired BEFORE current month
                    if expiry_date < start_date:
                        continue

                    transactions = FirstAidTransactions.objects.filter(
                        finv_id__fa_id=fa_id,
                        finv_id__inv_id__expiry_date=expiry_date,
                        finv_id__inv_id=inv_id
                    ).order_by("created_at")

                    # Calculate stock levels
                    opening_in = transactions.filter(created_at__date__lt=start_date, fat_action__icontains="added")
                    opening_out = transactions.filter(created_at__date__lt=start_date, fat_action__icontains="deduct")
                    opening_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in opening_in) - sum(self._parse_qty(t, multiply_boxes=False) for t in opening_out)

                    monthly_transactions = transactions.filter(
                        created_at__date__gte=start_date,
                        created_at__date__lte=end_date
                    )
                    received_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in monthly_transactions.filter(fat_action__icontains="added"))
                    dispensed_qty = sum(self._parse_qty(t, multiply_boxes=False) for t in monthly_transactions.filter(fat_action__icontains="deduct"))

                    closing_qty = opening_qty + received_qty - dispensed_qty

                    # Check conditions
                    is_expired = start_date <= expiry_date <= end_date
                    is_out_of_stock = closing_qty <= 0
                    is_near_expiry = (end_date < expiry_date <= near_expiry_threshold) and closing_qty > 0

                    if is_expired and is_out_of_stock:
                        expired_out_of_stock_count += 1
                    elif is_expired:
                        expired_count += 1
                    elif is_out_of_stock:
                        out_of_stock_count += 1
                    elif is_near_expiry:
                        near_expiry_count += 1

                total_problems = expired_count + out_of_stock_count + expired_out_of_stock_count + near_expiry_count

                formatted_months.append({
                    'month': month_str,
                    'month_name': month_name,
                    'total_problems': total_problems,
                    'expired_count': expired_count,
                    'out_of_stock_count': out_of_stock_count,
                    'expired_out_of_stock_count': expired_out_of_stock_count,
                    'near_expiry_count': near_expiry_count,
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


# Monthly First Aid Expired/Out-of-Stock Detail API View
class MonthlyFirstAidExpiredOutOfStockDetailAPIView(APIView):
    pagination_class = StandardResultsPagination

    def _parse_qty(self, transaction, multiply_boxes=False):
        """Extract numeric value from fat_qty and convert boxes to pieces if needed."""
        match = re.search(r'\d+', str(transaction.fat_qty))
        qty_num = int(match.group()) if match else 0
        
        # If it's a box unit AND we need to multiply, convert to pieces
        if (multiply_boxes and 
            transaction.finv_id.finv_qty_unit and 
            transaction.finv_id.finv_qty_unit.lower() == "boxes"):
            pcs_per_box = transaction.finv_id.finv_pcs or 1
            qty_num *= pcs_per_box
            
        return qty_num

    def get(self, request, *args, **kwargs):
        month_str = self.kwargs['month']  # Format: YYYY-MM
        try:
            year, month = map(int, month_str.split('-'))
        except ValueError:
            return Response({"error": "Invalid month format"}, status=400)

        start_date = datetime(year, month, 1).date()
        end_date = (start_date + relativedelta(months=1)) - timedelta(days=1)
        near_expiry_threshold = end_date + timedelta(days=30)  # 1 month after end of current month

        expired_items = []
        out_of_stock_items = []
        expired_out_of_stock_items = []
        near_expiry_items = []  # New category for near expiry

        # Get all first aid inventory items that were active up to this month
        fa_expiry_inv_pairs = FirstAidTransactions.objects.filter(
            created_at__date__lte=end_date
        ).values_list(
            "finv_id__fa_id",
            "finv_id__inv_id__expiry_date",
            "finv_id__inv_id"
        ).distinct()

        seen_combinations = set()

        for fa_id, expiry_date, inv_id in fa_expiry_inv_pairs:
            # Create a unique key for this combination
            combo_key = (fa_id, expiry_date, inv_id)
            if combo_key in seen_combinations:
                continue
            seen_combinations.add(combo_key)

            # Skip if no expiry date
            if not expiry_date:
                continue

            # Skip if expired BEFORE current month
            if expiry_date < start_date:
                continue

            try:
                finv = FirstAidInventory.objects.get(
                    fa_id=fa_id,
                    inv_id__expiry_date=expiry_date,
                    inv_id=inv_id
                )
            except FirstAidInventory.DoesNotExist:
                continue

            transactions = FirstAidTransactions.objects.filter(
                finv_id__fa_id=fa_id,
                finv_id__inv_id__expiry_date=expiry_date,
                finv_id__inv_id=inv_id
            ).order_by("created_at")

            # Get unit information
            unit = finv.finv_qty_unit
            pcs_per_box = finv.finv_pcs if unit and unit.lower() == "boxes" else 1

            # Calculate stock levels - multiply boxes for added quantities
            opening_in = transactions.filter(created_at__date__lt=start_date, fat_action__icontains="added")
            opening_out = transactions.filter(created_at__date__lt=start_date, fat_action__icontains="deduct")
            opening_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in opening_in) - sum(self._parse_qty(t, multiply_boxes=False) for t in opening_out)

            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            # Multiply boxes for received items
            received_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in monthly_transactions.filter(fat_action__icontains="added"))
            # Don't multiply boxes for dispensed items (they're already in pieces)
            dispensed_qty = sum(self._parse_qty(t, multiply_boxes=False) for t in monthly_transactions.filter(fat_action__icontains="deduct"))

            closing_qty = opening_qty + received_qty - dispensed_qty

            # Check conditions
            is_expired = start_date <= expiry_date <= end_date
            is_out_of_stock = closing_qty <= 0
            is_near_expiry = (end_date < expiry_date <= near_expiry_threshold) and closing_qty > 0

            item_data = {
                'fa_name': f"{finv.fa_id.fa_name}",
                'expiry_date': expiry_date.strftime('%Y-%m-%d') if expiry_date else 'No expiry',
                'opening_stock': opening_qty,
                'received': received_qty,
                'dispensed': dispensed_qty,
                'closing_stock': closing_qty,
                'unit': 'pcs',
                'status': 'Expired' if is_expired else 'Out of Stock' if is_out_of_stock else 'Near Expiry' if is_near_expiry else 'Active'
            }

            if is_expired and is_out_of_stock:
                expired_out_of_stock_items.append(item_data)
            elif is_expired:
                expired_items.append(item_data)
            elif is_out_of_stock:
                out_of_stock_items.append(item_data)
            elif is_near_expiry:
                near_expiry_items.append(item_data)

        # Combine all items (including near expiry in problem items)
        all_problem_items = expired_items + out_of_stock_items + expired_out_of_stock_items + near_expiry_items

        return Response({
            'success': True,
            'data': {
                'month': month_str,
                'summary': {
                    'total_problems': len(all_problem_items),
                    'expired_count': len(expired_items),
                    'out_of_stock_count': len(out_of_stock_items),
                    'expired_out_of_stock_count': len(expired_out_of_stock_items),
                    'near_expiry_count': len(near_expiry_items),  # New count
                },
                'expired_items': expired_items,
                'out_of_stock_items': out_of_stock_items,
                'expired_out_of_stock_items': expired_out_of_stock_items,
                'near_expiry_items': near_expiry_items,  # New category
                'all_problem_items': all_problem_items
            }
        })