
from rest_framework import generics
from ..models import *
from ..serializers.commodity_serializers import *
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError, Q
from rest_framework.views import APIView
from django.db.models.functions import TruncMonth
from calendar import monthrange
from rest_framework.pagination import PageNumberPagination
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from pagination import StandardResultsPagination
import re


class CommodityListView(generics.ListCreateAPIView):
    serializer_class = CommodityListSerializers
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        queryset = CommodityList.objects.all()
        
        # Add search functionality
        search_query = self.request.GET.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                models.Q(com_name__icontains=search_query) |
                models.Q(com_id__icontains=search_query) |
                models.Q(user_type__icontains=search_query) |
                models.Q(gender_type__icontains=search_query)
            )
        
        return queryset.order_by('com_name')
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
class CommodityCountView(APIView):
  
    def get(self, request):
        try:
            count = CommodityList.objects.count()
            return Response({'count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Failed to get commodity count: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CommodityListUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class=CommodityListSerializers
    queryset = CommodityList.objects.all()
    lookup_field='com_id'
    
    def get_object(self):
       com_id = self.kwargs.get('com_id')
       obj = get_object_or_404(CommodityList, com_id = com_id)
       return obj
class DeleteCommodityView(generics.DestroyAPIView):
    serializer_class = CommodityListSerializers    
    queryset = CommodityList.objects.all()
    lookup_field = 'com_id'
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
            
class CommodityInventoryView(generics.ListAPIView):
    serializer_class = CommodityInventorySerializer
    queryset = CommodityInventory.objects.all()
    def get_queryset(self):
        queryset = CommodityInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset





class CommodityStockTableView(APIView):
    """
    API view for commodity stocks with pagination, search, and filtering
    """
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # self.auto_archive_expired_commodities()
            
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            stock_filter = request.GET.get('filter', 'all').lower()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            # Get commodity stocks with related data (not archived)
            commodity_stocks = CommodityInventory.objects.select_related(
                'com_id', 'inv_id'
            ).filter(inv_id__is_Archived=False)
            
            # Apply search filter if provided
            if search_query:
                commodity_stocks = commodity_stocks.filter(
                    Q(com_id__com_name__icontains=search_query) |
                    Q(inv_id__inv_id__icontains=search_query) |
                    Q(cinv_recevFrom__icontains=search_query)
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
            
            # Process commodity stocks
            for stock in commodity_stocks:
                # Convert quantities to integers to avoid string operations
                cinv_qty = int(stock.cinv_qty) if stock.cinv_qty else 0
                cinv_pcs = int(stock.cinv_pcs) if stock.cinv_pcs else 1
                cinv_qty_avail = int(stock.cinv_qty_avail) if stock.cinv_qty_avail else 0
                
                # Calculate total pieces
                if stock.cinv_qty_unit and stock.cinv_qty_unit.lower() == "boxes":
                    total_pcs = cinv_qty * cinv_pcs
                else:
                    total_pcs = cinv_qty
                
                # Calculate available stock
                available_stock = cinv_qty_avail
                
                # Check expiry status
                expiry_date = stock.inv_id.expiry_date if stock.inv_id else None
                is_expired = expiry_date and expiry_date < today if expiry_date else False
                
                # Check near expiry (within 30 days)
                is_near_expiry = False
                if expiry_date and not is_expired:
                    days_until_expiry = (expiry_date - today).days
                    is_near_expiry = 0 < days_until_expiry <= 30
                
                # Check out of stock
                is_out_of_stock = available_stock <= 0
                
                # Check low stock based on unit type (only if not out of stock)
                is_low_stock = False
                if not is_out_of_stock:  # Only check for low stock if there's some stock available
                    if stock.cinv_qty_unit and stock.cinv_qty_unit.lower() == "boxes":
                        # For boxes, low stock threshold is 2 boxes
                        is_low_stock = available_stock <= 2
                    else:
                        # For pieces, low stock threshold is 20 pcs
                        is_low_stock = available_stock <= 20
                
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
                
                # Calculate dispensed quantity
                if stock.cinv_qty_unit and stock.cinv_qty_unit.lower() == "boxes":
                    dispensed_qty = total_pcs - available_stock
                    dispensed_display = f"{dispensed_qty - stock.wasted} pcs"
                else:
                    dispensed_qty = cinv_qty - available_stock
                    dispensed_display = f"{dispensed_qty - stock.wasted} {stock.cinv_qty_unit}"
                
                # Get category - since CommodityList doesn't have cat field, we'll use a default or check if it exists
                category = "N/A"
                # If you have a category field in CommodityList, adjust this line accordingly
                # For example: category = stock.com_id.category.cat_name if stock.com_id and stock.com_id.category else "N/A"
                
                item_data = {
                    'type': 'commodity',
                    'id': stock.cinv_id,
                    'batchNumber': stock.inv_id.inv_id if stock.inv_id else "N/A",
                    'category': category,  # Using the default category
                    'item': {
                        'com_name': stock.com_id.com_name if stock.com_id else "Unknown Commodity",
                    },
                    'qty': {
                        'cinv_qty': cinv_qty,
                        'cinv_pcs': cinv_pcs,
                    },
                    'cinv_qty_unit': stock.cinv_qty_unit,
                    'recevFrom': stock.cinv_recevFrom or "OTHERS",
                    'qty_used': dispensed_display,
                    'wasted': f"{stock.wasted} {'pcs' if stock.cinv_qty_unit and stock.cinv_qty_unit.lower() == 'boxes' else stock.cinv_qty_unit}",  # Adjusted for boxes
                    'availableStock': available_stock,
                    'expiryDate': expiry_date.isoformat() if expiry_date else None,
                    'inv_id': stock.inv_id.inv_id if stock.inv_id else None,
                    'com_id': stock.com_id.com_id if stock.com_id else None,
                    'cinv_id': stock.cinv_id,
                    'qty_number': cinv_qty,
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
                'error': f'Error fetching commodity stock data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # def auto_archive_expired_commodities(self):
    #     """Auto-archive commodities that expired more than 10 days ago and log transactions"""
    #     from datetime import timedelta
        
    #     today = timezone.now().date()
    #     archive_date = today - timedelta(days=10)
        
    #     print(f"Auto-archiving commodity items expired before: {archive_date}")
        
    #     # Archive expired commodity stocks
    #     commodity_stocks = CommodityInventory.objects.select_related('inv_id').filter(
    #         inv_id__expiry_date__lte=archive_date,
    #         inv_id__is_Archived=False
    #     )
        
    #     archived_commodity_count = 0
    #     for stock in commodity_stocks:
    #         # Get the current available quantity before archiving
    #         current_qty = stock.cinv_qty_avail or 0
            
    #         # Determine the unit and format quantity with unit
    #         if stock.cinv_qty_unit and stock.cinv_qty_unit.lower() == "boxes":
    #             # For boxes, show quantity in pieces
    #             qty_with_unit = f"{current_qty} pcs"
    #         else:
    #             # For other units, use the actual unit
    #             unit = stock.cinv_qty_unit if stock.cinv_qty_unit else "pcs"
    #             qty_with_unit = f"{current_qty} {unit}"
            
    #         # Archive the inventory
    #         stock.inv_id.is_Archived = True
    #         stock.inv_id.save()
            
    #         # Create transaction record for the archive action
    #         CommodityTransaction.objects.create(
    #             comt_qty=qty_with_unit,  # Record the quantity with unit that was archived
    #             comt_action='Expired',  # Clear action indicating expiration-based archiving
    #             cinv_id=stock,  # Reference to the commodity inventory
    #             staff=None  # System action, so no staff member
    #         )
            
    #         archived_commodity_count += 1
    #         print(f"Archived commodity stock: {stock.cinv_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {current_qty}")
        
    #     print(f"Auto-archived {archived_commodity_count} commodity items with transaction records")


class CommodityStockCreate(APIView):
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
            
            # Step 2: Create CommodityInventory
            commodity_inventory_data = self._prepare_commodity_inventory_data(data, inv_id)
            commodity_inventory_serializer = CommodityInventorySerializer(data=commodity_inventory_data)
            
            if not commodity_inventory_serializer.is_valid():
                return Response({
                    'error': 'CommodityInventory validation failed',
                    'details': commodity_inventory_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            commodity_inventory = commodity_inventory_serializer.save()
            cinv_id = commodity_inventory.cinv_id
            
            # Step 3: Create CommodityTransaction
            commodity_transaction_data = self._prepare_commodity_transaction_data(data, cinv_id)
            commodity_transaction_serializer = CommodityTransactionSerializer(data=commodity_transaction_data)
            
            if not commodity_transaction_serializer.is_valid():
                return Response({
                    'error': 'CommodityTransaction validation failed',
                    'details': commodity_transaction_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            commodity_transaction = commodity_transaction_serializer.save()
            
            # Return success response with all created IDs
            return Response({
                'success': True,
                'message': 'Commodity stock created successfully',
                'data': {
                    'inv_id': inv_id,
                    'cinv_id': cinv_id,
                    'comt_id': commodity_transaction.comt_id
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Transaction will be automatically rolled back due to @transaction.atomic
            return Response({
                'error': 'Failed to create commodity stock',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _prepare_inventory_data(self, data):
        """Prepare inventory data from request"""
        return {
            'expiry_date': data.get('expiry_date'),
            'inv_type': data.get('inv_type', 'Commodity'),  # default type
            'is_Archived': False
        }
    
    def _prepare_commodity_inventory_data(self, data, inv_id):
        """Prepare commodity inventory data from request"""
        # Handle nested data structure if present
        if 'data' in data:
            nested_data = data.get('data', {})
            commodity_data = {
                **nested_data,
                'com_id': data.get('com_id'),
                'inv_id': inv_id
            }
        else:
            commodity_data = data.copy()
            commodity_data['inv_id'] = inv_id
        
        # Get com_id directly
        commodity_data['com_id'] = commodity_data.get('com_id')
        # Calculate quantities based on unit
        is_boxes = commodity_data.get('cinv_qty_unit') == 'boxes'
        qty = int(commodity_data.get('cinv_qty', 0))
        pcs_per_box = int(commodity_data.get('cinv_pcs', 0)) if is_boxes else 0
        
        # Set calculated fields
        commodity_data.update({
            'cinv_qty': qty,
            'cinv_pcs': pcs_per_box,
            'cinv_dispensed': commodity_data.get('cinv_dispensed', 0)
        })
        
        # Calculate total available quantity
        if is_boxes:
            commodity_data['cinv_qty_avail'] = qty * pcs_per_box
        else:
            commodity_data['cinv_qty_avail'] = qty
        
        # Handle received from field
        received_from = commodity_data.get('cinv_recevFrom', 'OTHERS')
        commodity_data['cinv_recevFrom'] = received_from
        
        # Handle category ID if present
        cat_id = commodity_data.get('cat_id')
        if cat_id:
            commodity_data['cat_id'] = int(cat_id)
            
        # Handle staff field
        staff = commodity_data.get('staff')
        if staff:
            commodity_data['staff'] = int(staff)
        else:
            commodity_data['staff'] = None
        
        return commodity_data
    
    def _prepare_commodity_transaction_data(self, data, cinv_id):
        """Prepare commodity transaction data from request"""
        qty_unit = data.get('cinv_qty_unit')
        qty = data.get('cinv_qty', 0)
        pcs = data.get('cinv_pcs', 0)
        total_pcs = qty * pcs
        
        # Format quantity string based on unit
        if qty_unit == 'boxes':
            comt_qty = f"{qty} boxes ({total_pcs} pcs  )"
        else:
            comt_qty = f"{qty} {qty_unit}"
        
        return {
            'comt_qty': comt_qty,
            'comt_action': 'Added',
            'cinv_id': cinv_id,
            'staff': data.get('staff')  # Include staff if provided
        }
    
class CommodityInvRetrieveView(generics.RetrieveUpdateAPIView):
    serializer_class=CommodityInventorySerializer
    queryset = CommodityInventory.objects.all()
    lookup_field='cinv_id'
    
    def get_object(self):
       cinv_id = self.kwargs.get('cinv_id')
       obj = get_object_or_404(CommodityInventory, cinv_id = cinv_id)
       return obj

    
class CommodityTransactionView(generics.ListCreateAPIView):
    serializer_class=CommodityTransactionSerializer
    queryset=CommodityTransaction.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    
     
# ===========================COMMODITY ARCHIVE==============================
class CommodityArchiveInventoryView(APIView):
    
    def patch(self, request, inv_id):
        """
        Archive commodity inventory item (no expired transaction creation)
        """
        try:
            # Get inventory item
            inventory = get_object_or_404(Inventory, inv_id=inv_id)
            
            # Check if this is actually a commodity inventory
            if not hasattr(inventory, 'commodityinventory'):
                return Response(
                    {"error": "This inventory item is not a commodity item"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Archive the inventory
            inventory.is_Archived = True
            inventory.updated_at = timezone.now()
            inventory.save()
            
            return Response(
                {
                    "message": "Commodity inventory archived successfully", 
                    "inv_id": inv_id
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {"error": f"Error archiving commodity inventory: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


# ===========================TRANSACTION ==========================================
class CommodityTransactionTableView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            # Get commodity transactions with related data - FIXED staff relationship
            transactions = CommodityTransaction.objects.select_related(
                'cinv_id__com_id', 
                'cinv_id__inv_id',
                'staff__rp__per'  # Add this to get the personal info
            ).all()
            
            # Apply search filter if provided - UPDATED search fields
            if search_query:
                transactions = transactions.filter(
                    Q(cinv_id__com_id__com_name__icontains=search_query) |
                    Q(cinv_id__inv_id__inv_id__icontains=search_query) |
                    Q(comt_action__icontains=search_query) |
                    Q(staff__rp__per__per_fname__icontains=search_query) |  # Updated
                    Q(staff__rp__per__per_lname__icontains=search_query)    # Updated
                )
            
            # Format the data for response
            transaction_data = []
            
            for transaction in transactions:
                # Get related inventory and commodity data
                commodity_inventory = transaction.cinv_id
                commodity = commodity_inventory.com_id if commodity_inventory else None
                inventory = commodity_inventory.inv_id if commodity_inventory else None
                staff = transaction.staff
                
                # Format staff name - FIXED (consistent with medicine view)
                staff_name = "Managed by System"
                if staff and staff.rp and staff.rp.per:
                    personal = staff.rp.per
                    staff_name = f"{personal.per_fname or ''} {personal.per_lname or ''}".strip()
                    if not staff_name:
                        staff_name = f"Staff {staff.staff_id}"  # Fallback to staff ID
                
                item_data = {
                    'comt_id': transaction.comt_id,
                    'com_name': commodity.com_name if commodity else "Unknown Commodity",
                    'comt_qty': transaction.comt_qty,
                    'comt_action': transaction.comt_action,
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
                'error': f'Error fetching commodity transactions: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===========================COMMODITY ARCHIVED TABLE==============================
class ArchivedCommodityTable(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            filter_type = request.GET.get('filter', 'all')  # all, expired, out_of_stock
            
            # Get archived commodity stocks
            commodity_stocks = CommodityInventory.objects.select_related(
                'com_id', 'inv_id'
            ).filter(inv_id__is_Archived=True)
            
            # Apply search filter if provided
            if search_query:
                commodity_stocks = commodity_stocks.filter(
                    Q(com_id__com_name__icontains=search_query) |
                    Q(inv_id__inv_id__icontains=search_query) |
                    Q(cinv_recevFrom__icontains=search_query)
                )
            
            # Calculate today's date for expiry comparisons
            today = timezone.now().date()
            
            # Apply reason filter
            if filter_type == 'expired':
                commodity_stocks = commodity_stocks.filter(
                    Q(inv_id__expiry_date__lt=today)
                )
            elif filter_type == 'out_of_stock':
                commodity_stocks = commodity_stocks.filter(
                    Q(cinv_qty_avail=0) & 
                    (Q(inv_id__expiry_date__gte=today) | Q(inv_id__expiry_date__isnull=True))
                )
            
            archived_data = []
            
            # Process archived commodity stocks
            for stock in commodity_stocks:
                # Get the inventory record
                inventory = stock.inv_id
                
                # Safely handle None values with defaults
                cinv_qty = stock.cinv_qty or 0
                cinv_qty_avail = stock.cinv_qty_avail or 0
                wasted = stock.wasted or 0
                cinv_pcs = stock.cinv_pcs or 0
                
                # Calculate total pieces (for boxes)
                total_pcs = cinv_qty * cinv_pcs if stock.cinv_qty_unit and stock.cinv_qty_unit.lower() == "boxes" else cinv_qty
                
                # Calculate total quantity display
                if stock.cinv_qty_unit and stock.cinv_qty_unit.lower() == "boxes":
                    total_qty_display = f"{cinv_qty} boxes ({total_pcs} pcs)"
                else:
                    total_qty_display = f"{cinv_qty} {stock.cinv_qty_unit or 'units'}"
                
                # Check expiry status
                expiry_date = inventory.expiry_date if inventory else None
                is_expired = expiry_date and expiry_date < today if expiry_date else False
                
                # Determine archive reason
                archive_reason = 'Expired' if is_expired else 'Out of Stock'
                
                # Calculate actual used quantity
                # If available stock is 0, then quantity used should be 0
                if cinv_qty_avail == 0:
                    actual_used = 0
                else:
                    # Otherwise, calculate as Total Qty - Available Stock - Wasted
                    actual_used = total_pcs - cinv_qty_avail - wasted
                
                item_data = {
                    'type': 'commodity',
                    'id': stock.cinv_id,
                    'category': 'Commodity',
                    'item': {
                        'com_name': stock.com_id.com_name if stock.com_id else "Unknown Commodity",
                        'unit': stock.cinv_qty_unit or 'pcs',
                    },
                    'qty': {
                        'cinv_qty': cinv_qty,
                        'cinv_pcs': total_pcs  # Total pieces for boxes, otherwise same as cinv_qty
                    },
                    'administered': actual_used,
                    'wasted': wasted,
                    'availableStock': cinv_qty_avail,
                    'recevFrom': stock.cinv_recevFrom or "OTHERS",
                    'expiryDate': expiry_date.isoformat() if expiry_date else "N/A",
                    'archivedDate': inventory.updated_at.isoformat() if inventory and inventory.updated_at else inventory.created_at.isoformat() if inventory else None,
                    'reason': archive_reason,
                    'inv_id': inventory.inv_id if inventory else None,
                    'com_id': stock.com_id.com_id if stock.com_id else None,
                    'cinv_id': stock.cinv_id,
                    'cinv_qty_unit': stock.cinv_qty_unit or 'units',
                    'cinv_pcs': cinv_pcs,
                    'isArchived': inventory.is_Archived if inventory else False,
                    'created_at': stock.created_at.isoformat() if stock.created_at else None,
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
                'error': f'Error fetching archived commodities: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
        
            
class CommodityDeduct(APIView):
    def post(self,request,*args, **kwargs):
        try:
            data = request.data.get('data', {})
            record = request.data.get('record', {})
            cinv_id = record.get('id')
            deduct_qty = int(data.get('wastedAmount', 0))
            action = "Wasted"
            staff_id = data.get('staff_id')
            print("Deducting quantity:", deduct_qty)     
            print("From inventory ID:", cinv_id)
            
            if not cinv_id or deduct_qty <= 0:
                return Response({
                    'error': 'Invalid cinv_id or deduct_qty'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Fetch the medicine inventory
            commodity_inventory = get_object_or_404(CommodityInventory, cinv_id=cinv_id)
            
            if commodity_inventory.cinv_qty_avail < deduct_qty:
                return Response({
                    'error': 'Deduct quantity exceeds available stock'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Deduct the quantity
            commodity_inventory.cinv_qty_avail -= deduct_qty
            commodity_inventory.wasted += deduct_qty
            commodity_inventory.updated_at = timezone.now()
            commodity_inventory.save()
            
            # Prepare quantity string for transaction
            if commodity_inventory.cinv_qty_unit and commodity_inventory.cinv_qty_unit.lower() == "boxes":
                            qty_string = f"{deduct_qty} pc/s"
            else:
                qty_string = f"{deduct_qty} {commodity_inventory.cinv_qty_unit or 'units'}"

            # Create transaction record
            CommodityTransaction.objects.create(
                comt_qty=qty_string,
                comt_action=action,
                cinv_id=commodity_inventory,
                staff_id=staff_id if staff_id else None  # Set to None if not provided
            )
            
            return Response({
                'success': True,
                'message': f'Successfully deducted {deduct_qty} from inventory {cinv_id}',
                'new_available_stock': commodity_inventory.cinv_qty_avail
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': f'Error deducting stock: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)   
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            

# ============================ COMMODITY REPORT =====================

class CommoditySummaryMonthsAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            queryset = CommodityTransaction.objects.all()

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
                    }, status=400)

            # Get distinct months only
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

                start_date = month_date.date()
                last_day = monthrange(start_date.year, start_date.month)[1]
                end_date = start_date.replace(day=last_day)

                # Transactions within month - EXCLUDE expired items
                month_transactions = queryset.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                ).exclude(
                    # Exclude items that expired BEFORE this month
                    cinv_id__inv_id__expiry_date__lt=start_date
                )

                # Count distinct commodity+inventory combos for this month
                # Only include items that are not expired (expiry during or after current month)
                total_items = month_transactions.values(
                    "cinv_id__com_id",
                    "cinv_id__inv_id"
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
            }, status=200)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)




class MonthlyCommodityRecordsDetailAPIView(generics.ListAPIView):
    serializer_class = CommodityInventorySerializer
    pagination_class = StandardResultsPagination

    def list(self, request, *args, **kwargs):
        month_str = self.kwargs.get('month')  # e.g. '2025-08'
        try:
            year, month = map(int, month_str.split('-'))
        except (ValueError, AttributeError):
            return Response({"error": "Invalid month format"}, status=400)

        # Use date only for filtering to avoid timezone warnings
        start_of_month = date(year, month, 1)
        last_day = monthrange(year, month)[1]
        end_of_month = date(year, month, last_day)

        inventory_summary = []

        # Get unique commodity + expiry_date + inv_id combos to avoid duplicates
        com_expiry_inv_pairs = CommodityTransaction.objects.filter(
            created_at__date__lte=end_of_month
        ).values_list(
            "cinv_id__com_id",
            "cinv_id__inv_id__expiry_date",
            "cinv_id__inv_id"
        ).distinct()

        # Track unique combinations to avoid duplicates
        seen_combinations = set()

        for com_id, expiry_date, inv_id in com_expiry_inv_pairs:
            # Skip if expiry date is before the current month (already expired)
            if expiry_date and expiry_date < start_of_month:
                continue
                
            # Create a unique key for this combination
            combo_key = (com_id, expiry_date, inv_id)
            
            # Skip if we've already processed this combination
            if combo_key in seen_combinations:
                continue
                
            seen_combinations.add(combo_key)

            transactions = CommodityTransaction.objects.filter(
                cinv_id__com_id=com_id,
                cinv_id__inv_id__expiry_date=expiry_date,
                cinv_id__inv_id=inv_id
            ).order_by('created_at')

            first_tx = transactions.select_related("cinv_id__com_id", "cinv_id__inv_id").first()
            if not first_tx:
                continue

            unit = first_tx.cinv_id.cinv_qty_unit
            pcs_per_box = first_tx.cinv_id.cinv_pcs if unit and unit.lower() == "boxes" else 1

            # Opening stock before month start (added minus deducted)
            opening_in = transactions.filter(
                created_at__date__lt=start_of_month,
                comt_action__icontains="added"
            )
            opening_out = transactions.filter(
                created_at__date__lt=start_of_month
            ).filter(
                Q(comt_action__icontains="deduct") | Q(comt_action__icontains="wasted")
            )
            # For opening stock, multiply boxes for added quantities but not for deducted
            opening_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in opening_in) - sum(self._parse_qty(t, multiply_boxes=False) for t in opening_out)

            # Received during the month (multiply boxes for received items)
            received_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in transactions.filter(
                created_at__date__gte=start_of_month,
                created_at__date__lte=end_of_month,
                comt_action__icontains="added"
            ))

            # Dispensed during the month (DON'T multiply boxes for dispensed items)
            dispensed_qty = sum(
                self._parse_qty(t, multiply_boxes=False)
                for t in transactions.filter(
                    created_at__date__gte=start_of_month,
                    created_at__date__lte=end_of_month
                ).filter(
                    Q(comt_action__icontains="deduct") | Q(comt_action__icontains="wasted")
                )
            )

            # Opening displayed includes received during the month
            display_opening = opening_qty + received_qty
            closing_qty = display_opening - dispensed_qty

            # Check if expired this month
            expired_this_month = (expiry_date and 
                                start_of_month <= expiry_date <= end_of_month)
            
            # Skip if there's no stock and it's not expiring this month
            if (closing_qty <= 0 and 
                (not expiry_date or expiry_date < start_of_month) and 
                not expired_this_month and
                not transactions.filter(created_at__date__gte=start_of_month, created_at__date__lte=end_of_month).exists()):
                continue

            # Display unit as is (frontend will handle conversion)
            display_unit = unit

            inventory_summary.append({
                'com_name': first_tx.cinv_id.com_id.com_name,
                'opening': display_opening,
                'received': received_qty,
                'pcs':first_tx.cinv_id.cinv_pcs,
                'wasted': first_tx.cinv_id.wasted,
                'receivedfrom': first_tx.cinv_id.cinv_recevFrom,
                'dispensed': dispensed_qty,
                'closing': closing_qty,
                'date_received': first_tx.created_at.date() if first_tx.created_at else None,
                'unit': display_unit,
                'expiry': expiry_date,
                'received_from': first_tx.cinv_id.cinv_recevFrom,
                'expired_this_month': expired_this_month,  # Added this field for consistency
            })

        return Response({
            'success': True,
            'data': {
                'month': month_str,
                'inventory_summary': inventory_summary,
                'total_items': len(inventory_summary)
            }
        })

    def _parse_qty(self, transaction, multiply_boxes=False):
        """Parse quantity number from transaction.comt_qty.
        
        Args:
            multiply_boxes: Whether to multiply by pcs_per_box for box units
                           (False for dispensed quantities)
        """
        match = re.search(r'\d+', str(transaction.comt_qty))
        qty_num = int(match.group()) if match else 0

        # Only multiply if it's a box unit AND we're supposed to multiply
        if (multiply_boxes and 
            transaction.cinv_id.cinv_qty_unit and 
            transaction.cinv_id.cinv_qty_unit.lower() == "boxes"):
            pcs_per_box = transaction.cinv_id.cinv_pcs or 1
            qty_num *= pcs_per_box

        return qty_num
    
    
    
# ==========================Commodity Expired/Out-of-Stock Summary API View
class CommodityExpiredOutOfStockSummaryAPIView(APIView):
    pagination_class = StandardResultsPagination

    def _parse_qty(self, transaction, multiply_boxes=False):
        """Extract numeric value from comt_qty and convert boxes to pieces if needed."""
        match = re.search(r'\d+', str(transaction.comt_qty))
        qty_num = int(match.group()) if match else 0
        
        if (multiply_boxes and 
            transaction.cinv_id.cinv_qty_unit and 
            transaction.cinv_id.cinv_qty_unit.lower() == "boxes"):
            pcs_per_box = transaction.cinv_id.cinv_pcs or 1
            qty_num *= pcs_per_box
            
        return qty_num

    def get(self, request):
        try:
            # Get distinct months from commodity transactions
            distinct_months = CommodityTransaction.objects.annotate(
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

                # Get all commodity inventory items that were active up to this month
                com_expiry_inv_pairs = CommodityTransaction.objects.filter(
                    created_at__date__lte=end_date
                ).values_list(
                    "cinv_id__com_id",
                    "cinv_id__inv_id__expiry_date",
                    "cinv_id__inv_id"
                ).distinct()

                expired_count = 0
                out_of_stock_count = 0
                expired_out_of_stock_count = 0
                near_expiry_count = 0

                seen_combinations = set()

                for com_id, expiry_date, inv_id in com_expiry_inv_pairs:
                    # Create a unique key for this combination
                    combo_key = (com_id, expiry_date, inv_id)
                    if combo_key in seen_combinations:
                        continue
                    seen_combinations.add(combo_key)

                    # Skip if no expiry date (can't be expired or near expiry)
                    if not expiry_date:
                        continue

                    # Skip if expired BEFORE current month
                    if expiry_date < start_date:
                        continue

                    transactions = CommodityTransaction.objects.filter(
                        cinv_id__com_id=com_id,
                        cinv_id__inv_id__expiry_date=expiry_date,
                        cinv_id__inv_id=inv_id
                    ).order_by("created_at")

                    # Calculate stock levels
                    opening_in = transactions.filter(created_at__date__lt=start_date, comt_action__icontains="added")
                    opening_out = transactions.filter(created_at__date__lt=start_date, comt_action__icontains="deduct")
                    opening_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in opening_in) - sum(self._parse_qty(t, multiply_boxes=False) for t in opening_out)

                    monthly_transactions = transactions.filter(
                        created_at__date__gte=start_date,
                        created_at__date__lte=end_date
                    )
                    received_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in monthly_transactions.filter(comt_action__icontains="added"))
                    dispensed_qty = sum(self._parse_qty(t, multiply_boxes=False) for t in monthly_transactions.filter(comt_action__icontains="deduct"))

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


# Monthly Commodity Expired/Out-of-Stock Detail API View
class MonthlyCommodityExpiredOutOfStockDetailAPIView(APIView):
    pagination_class = StandardResultsPagination

    def _parse_qty(self, transaction, multiply_boxes=False):
        """Extract numeric value from comt_qty and convert boxes to pieces if needed."""
        match = re.search(r'\d+', str(transaction.comt_qty))
        qty_num = int(match.group()) if match else 0
        
        # If it's a box unit AND we need to multiply, convert to pieces
        if (multiply_boxes and 
            transaction.cinv_id.cinv_qty_unit and 
            transaction.cinv_id.cinv_qty_unit.lower() == "boxes"):
            pcs_per_box = transaction.cinv_id.cinv_pcs or 1
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

        # Get all commodity inventory items that were active up to this month
        com_expiry_inv_pairs = CommodityTransaction.objects.filter(
            created_at__date__lte=end_date
        ).values_list(
            "cinv_id__com_id",
            "cinv_id__inv_id__expiry_date",
            "cinv_id__inv_id"
        ).distinct()

        seen_combinations = set()

        for com_id, expiry_date, inv_id in com_expiry_inv_pairs:
            # Create a unique key for this combination
            combo_key = (com_id, expiry_date, inv_id)
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
                cinv = CommodityInventory.objects.get(
                    com_id=com_id,
                    inv_id__expiry_date=expiry_date,
                    inv_id=inv_id
                )
            except CommodityInventory.DoesNotExist:
                continue

            transactions = CommodityTransaction.objects.filter(
                cinv_id__com_id=com_id,
                cinv_id__inv_id__expiry_date=expiry_date,
                cinv_id__inv_id=inv_id
            ).order_by("created_at")

            # Get unit information
            unit = cinv.cinv_qty_unit
            pcs_per_box = cinv.cinv_pcs if unit and unit.lower() == "boxes" else 1

            # Calculate stock levels - multiply boxes for added quantities
            opening_in = transactions.filter(created_at__date__lt=start_date, comt_action__icontains="added")
            opening_out = transactions.filter(created_at__date__lt=start_date, comt_action__icontains="deduct")
            opening_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in opening_in) - sum(self._parse_qty(t, multiply_boxes=False) for t in opening_out)

            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            # Multiply boxes for received items
            received_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in monthly_transactions.filter(comt_action__icontains="added"))
            # Don't multiply boxes for dispensed items (they're already in pieces)
            dispensed_qty = sum(self._parse_qty(t, multiply_boxes=False) for t in monthly_transactions.filter(comt_action__icontains="deduct"))

            closing_qty = opening_qty + received_qty - dispensed_qty

            # Check conditions
            is_expired = start_date <= expiry_date <= end_date
            is_out_of_stock = closing_qty <= 0
            is_near_expiry = (end_date < expiry_date <= near_expiry_threshold) and closing_qty > 0

            item_data = {
                'com_name': f"{cinv.com_id.com_name}",
                'expiry_date': expiry_date.strftime('%Y-%m-%d') if expiry_date else 'No expiry',
                'wasted':cinv.wasted,
                'pcs':cinv.cinv_pcs,
                'opening_stock': opening_qty,
                'received': received_qty,
                'date_received': cinv.created_at.date() if cinv.created_at else None,
                'dispensed': dispensed_qty,
                'closing_stock': closing_qty,
                'unit': cinv.cinv_qty_unit,
                'received_from': cinv.cinv_recevFrom,
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