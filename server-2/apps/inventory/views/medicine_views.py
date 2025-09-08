
from rest_framework import generics
from ..models import *
from ..serializers.medicine_serializers import *
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError, Q, Sum
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth
from pagination import *
import re
from calendar import monthrange


class MedicineListAvailableTable(APIView):
    def get(self, request):
        # Get current date for expiry comparison
        today = timezone.now().date()
        
        # Get query parameters for filtering (simplified)
        med_type_filter = request.query_params.get('med_type', None)
        
        # Base queryset - get all medicines with available quantity calculation
        medicines = Medicinelist.objects.annotate(
            total_qty_available=Sum(
                'medicineinventory__minv_qty_avail',
                filter=Q(medicineinventory__inv_id__expiry_date__gte=today) | 
                       Q(medicineinventory__inv_id__expiry_date__isnull=True)
            )
        ).prefetch_related(
            'medicineinventory_set__inv_id'
        ).all()  # Get all medicines
        
        # Apply filters if provided
        if med_type_filter:
            medicines = medicines.filter(med_type__icontains=med_type_filter)
        
        # Prepare response data
        medicine_data = []
        for medicine in medicines:
            # Check if medicine has any available stock
            has_stock = medicine.total_qty_available and medicine.total_qty_available > 0
            
          
            
            if has_stock:
                # Get all inventory items for this medicine that are not expired
                inventory_items = []
                for med_inv in medicine.medicineinventory_set.all():
                    if (med_inv.inv_id.expiry_date is None or 
                        med_inv.inv_id.expiry_date >= today) and \
                       med_inv.minv_qty_avail > 0:
                        
                        inventory_items.append({
                            'minv_id': med_inv.minv_id,
                            'dosage': f"{med_inv.minv_dsg} {med_inv.minv_dsg_unit}",
                            'form': med_inv.minv_form,
                            'quantity_available': med_inv.minv_qty_avail,
                            'quantity_unit': med_inv.minv_qty_unit,
                            'expiry_date': med_inv.inv_id.expiry_date,
                            'inventory_type': med_inv.inv_id.inv_type
                        })
                
                medicine_data.append({
                    'med_id': medicine.med_id,
                    'med_name': medicine.med_name,
                    'med_type': medicine.med_type,
                    'total_qty_available': medicine.total_qty_available,
                    'inventory_items': inventory_items,
                    'status': 'Available'
                })
            else:
                medicine_data.append({
                    'med_id': medicine.med_id,
                    'med_name': medicine.med_name,
                    'med_type': medicine.med_type,
                    'total_qty_available': 0,
                    'inventory_items': [],
                    'status': 'No available stocks'
                })
        
        return Response({'medicines': medicine_data}, status=status.HTTP_200_OK)

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
        """Auto-archive medicines that expired more than 10 days ago and log transactions"""
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
            # Get the current available quantity before archiving
            current_qty = stock.minv_qty_avail or 0
            
            # Determine the unit and format quantity with unit
            if stock.minv_qty_unit and stock.minv_qty_unit.lower() == "boxes":
                # For boxes, show quantity in pieces
                qty_with_unit = f"{current_qty} pcs"
            else:
                # For other units, use the actual unit
                unit = stock.minv_qty_unit if stock.minv_qty_unit else "pcs"
                qty_with_unit = f"{current_qty} {unit}"
            
            # Archive the inventory
            stock.inv_id.is_Archived = True
            stock.inv_id.save()
            
            # Create transaction record for the archive action
            MedicineTransactions.objects.create(
                mdt_qty=qty_with_unit,  # Record the quantity with unit that was archived
                mdt_action='Expired',  # Clear action indicating expiration-based archiving
                minv_id=stock,  # Reference to the medicine inventory
                staff=None  # System action, so no staff member
            )
            
            archived_medicine_count += 1
            print(f"Archived medicine stock: {stock.minv_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")
        
        print(f"Auto-archived {archived_medicine_count} medicine items with transaction records")
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
   
   

class MedicineTransactionView(generics.ListCreateAPIView):
    serializer_class=MedicineTransactionSerializers
    queryset=MedicineTransactions.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    
# ============================TRANSACTION=================================

class MedicineTransactionView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            # Get medicine transactions with related data - add more related fields
            transactions = MedicineTransactions.objects.select_related(
                'minv_id__med_id', 
                'minv_id__inv_id',
                'staff__rp__per'  # Add this to get the personal info
            ).all()
            
            # Apply search filter if provided
            if search_query:
                transactions = transactions.filter(
                    Q(minv_id__med_id__med_name__icontains=search_query) |
                    Q(minv_id__inv_id__inv_id__icontains=search_query) |
                    Q(mdt_action__icontains=search_query) |
                    Q(staff__rp__per__per_fname__icontains=search_query) |  # Update these
                    Q(staff__rp__per__per_lname__icontains=search_query)    # Update these
                )
            
            # Format the data for response
            transaction_data = []
            
            for transaction in transactions:
                # Get related inventory and medicine data
                medicine_inventory = transaction.minv_id
                medicine = medicine_inventory.med_id if medicine_inventory else None
                inventory = medicine_inventory.inv_id if medicine_inventory else None
                staff = transaction.staff
                
                # Format staff name - FIXED
                staff_name = "Managed by System"
                if staff and staff.rp and staff.rp.per:
                    personal = staff.rp.per
                    staff_name = f"{personal.per_fname or ''} {personal.per_lname or ''}".strip()
                    if not staff_name:
                        staff_name = f"Staff {staff.staff_id}"  # Fallback to staff ID
                 
                item_data = {
                    'mdt_id': transaction.mdt_id,
                    'inv_id': inventory.inv_id if inventory else "N/A",
                    'med_detail': {
                        'med_name': medicine.med_name if medicine else "Unknown Medicine",
                        'minv_dsg': medicine_inventory.minv_dsg if medicine_inventory else 0,
                        'minv_dsg_unit': medicine_inventory.minv_dsg_unit if medicine_inventory else "N/A",
                        'minv_form': medicine_inventory.minv_form if medicine_inventory else "N/A",
                    },
                    'mdt_qty': transaction.mdt_qty,
                    'mdt_action': transaction.mdt_action,
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
                'error': f'Error fetching medicine transactions: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ===========================MEDICINE ARCHIVE==============================
class MedicineArchiveInventoryView(APIView):
    
    def patch(self, request, inv_id):
        """
        Archive medicine inventory item and create expired transaction only if expired AND has available stock
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
                        {"error": f"Failed to create transaction for expired medicine: {str(e)}"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            return Response(
                {
                    "message": "Medicine inventory archived successfully", 
                    "inv_id": inv_id,
                    "transaction_created": transaction_created
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {"error": f"Error archiving medicine inventory: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _create_expired_transaction(self, inventory):
        """
        Create expired transaction for medicine items with available stock
        """
        if not hasattr(inventory, 'medicine_inventory'):
            raise Exception("No medicine inventory found for this inventory item")
        
        medicine_inventory = inventory.medicine_inventory
        current_qty = medicine_inventory.minv_qty_avail or 0
        unit = medicine_inventory.minv_qty_unit or "pcs"
        
        if unit.lower() == "boxes":
            qty_with_unit = f"{current_qty} pcs"
        else:
            qty_with_unit = f"{current_qty} {unit}"
        
        # Create the medicine transaction
        MedicineTransactions.objects.create(
            mdt_qty=qty_with_unit,
            mdt_action="Expired",
            minv_id=medicine_inventory,
            staff=None  # None for system action
        )
           
# ===========================MEDICINE ARCHIVED TABLE==============================
class ArchivedMedicineTable(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            filter_type = request.GET.get('filter', 'all')  # all, expired, out_of_stock
            
            # Get archived medicine inventories
            medicine_inventories = MedicineInventory.objects.select_related(
                'med_id', 'inv_id'
            ).filter(inv_id__is_Archived=True)
            
            # Apply search filter if provided
            if search_query:
                medicine_inventories = medicine_inventories.filter(
                    Q(med_id__med_name__icontains=search_query) |
                    Q(inv_id__inv_id__icontains=search_query) |
                    Q(minv_form__icontains=search_query)
                )
            
            # Calculate today's date for expiry comparisons
            today = timezone.now().date()
            
            # Apply reason filter
            if filter_type == 'expired':
                medicine_inventories = medicine_inventories.filter(
                    Q(inv_id__expiry_date__lt=today)
                )
            elif filter_type == 'out_of_stock':
                medicine_inventories = medicine_inventories.filter(
                    Q(minv_qty_avail=0) & 
                    (Q(inv_id__expiry_date__gte=today) | Q(inv_id__expiry_date__isnull=True))
                )
            
            archived_data = []
            
            # Process archived medicine inventories
            for inventory in medicine_inventories:
                # Get the inventory record
                inv_record = inventory.inv_id
                
                # Safely handle None values with defaults
                minv_qty = inventory.minv_qty or 0
                minv_qty_avail = inventory.minv_qty_avail or 0
                wasted = inventory.wasted or 0
                minv_pcs = inventory.minv_pcs or 0
                minv_dsg = inventory.minv_dsg or 0
                
                # Calculate total pieces (for boxes)
                total_pcs = minv_qty * minv_pcs if inventory.minv_qty_unit and inventory.minv_qty_unit.lower() == "boxes" else minv_qty
                
                # Calculate total quantity display
                if inventory.minv_qty_unit and inventory.minv_qty_unit.lower() == "boxes":
                    total_qty_display = f"{minv_qty} boxes ({total_pcs} pcs)"
                else:
                    total_qty_display = f"{minv_qty} {inventory.minv_qty_unit or 'units'}"
                
                # Check expiry status
                expiry_date = inv_record.expiry_date if inv_record else None
                is_expired = expiry_date and expiry_date < today if expiry_date else False
                
                # Determine archive reason
                archive_reason = 'Expired' if is_expired else 'Out of Stock'
                
                # Calculate actual used quantity
                # If available stock is 0, then quantity used should be 0
                if minv_qty_avail == 0:
                    actual_used = 0
                else:
                    # Otherwise, calculate as Total Qty - Available Stock - Wasted
                    actual_used = total_pcs - minv_qty_avail - wasted
                
                item_data = {
                    'type': 'medicine',
                    'id': inventory.minv_id,
                    'category': 'Medicine',
                    'item': {
                        'med_name': inventory.med_id.med_name if inventory.med_id else "Unknown Medicine",
                        'form': inventory.minv_form or 'N/A',
                        'dosage': f"{minv_dsg} {inventory.minv_dsg_unit or 'N/A'}",
                        'unit': inventory.minv_qty_unit or 'units',
                    },
                    'qty': {
                        'minv_qty': minv_qty,
                        'minv_pcs': total_pcs  # Total pieces for boxes, otherwise same as minv_qty
                    },
                    'administered': actual_used,
                    'wasted': wasted,
                    'availableStock': minv_qty_avail,
                    'expiryDate': expiry_date.isoformat() if expiry_date else "N/A",
                    'archivedDate': inv_record.updated_at.isoformat() if inv_record and inv_record.updated_at else inv_record.created_at.isoformat() if inv_record else None,
                    'reason': archive_reason,
                    'inv_id': inv_record.inv_id if inv_record else None,
                    'med_id': inventory.med_id.med_id if inventory.med_id else None,
                    'minv_id': inventory.minv_id,
                    'minv_qty_unit': inventory.minv_qty_unit or 'units',
                    'minv_pcs': minv_pcs,
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
                'error': f'Error fetching archived medicines: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
            
            
            
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

                # Filter transactions for this month - EXCLUDE expired items
                month_transactions = queryset.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                ).exclude(
                    # Exclude items that expired BEFORE this month
                    minv_id__inv_id__expiry_date__lt=start_date
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

        # Get unique medicine + expiry_date + inv_id combos to avoid duplicates
        med_expiry_inv_pairs = MedicineTransactions.objects.filter(
            created_at__date__lte=end_date
        ).values_list(
            "minv_id__med_id",
            "minv_id__inv_id__expiry_date",
            "minv_id__inv_id"
        ).distinct()

        # Track unique combinations to avoid duplicates
        seen_combinations = set()

        for med_id, expiry_date, inv_id in med_expiry_inv_pairs:
            # Skip if expiry date is before the current month (already expired)
            if expiry_date and expiry_date < start_date:
                continue
                
            # Create a unique key for this combination
            combo_key = (med_id, expiry_date, inv_id)
            
            # Skip if we've already processed this combination
            if combo_key in seen_combinations:
                continue
                
            seen_combinations.add(combo_key)

            transactions = MedicineTransactions.objects.filter(
                minv_id__med_id=med_id,
                minv_id__inv_id__expiry_date=expiry_date,
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
            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                mdt_action__icontains="added"
            )
            received_qty = sum(self._parse_qty(t) for t in monthly_transactions)
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

            # Check if expired this month
            expired_this_month = (first_tx.minv_id.inv_id.expiry_date and 
                                start_date <= first_tx.minv_id.inv_id.expiry_date <= end_date)
            
            # REMOVED: Don't set closing to 0 for expired items
            # if expired_this_month:
            #     closing_qty = 0
            
            # Skip if there's no stock and it's not expiring this month
            # Also include items that expired this month even if closing_qty <= 0
            if closing_qty <= 0 and (not expiry_date or expiry_date > end_date) and not expired_this_month:
                continue

            inventory_summary.append({
                'med_name': f"{first_tx.minv_id.med_id.med_name} {first_tx.minv_id.minv_dsg}{first_tx.minv_id.minv_dsg_unit} {first_tx.minv_id.minv_form}",
                'opening': display_opening,
                'received': received_qty,
                'dispensed': dispensed_qty,
                'closing': closing_qty,
                'unit': "pcs",
                'expiry': first_tx.minv_id.inv_id.expiry_date,
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
        """Extract numeric value from mdt_qty."""
        match = re.search(r'\d+', str(transaction.mdt_qty))
        return int(match.group()) if match else 0   
    
    
    
#======================== EXPIRED AND OUT OF STOCK REPORT=========================
class MedicineExpiredOutOfStockSummaryAPIView(APIView):
    pagination_class = StandardResultsPagination

    def _parse_qty(self, transaction, multiply_boxes=False):
        """Extract numeric value from mdt_qty and convert boxes to pieces if needed."""
        match = re.search(r'\d+', str(transaction.mdt_qty))
        qty_num = int(match.group()) if match else 0
        
        if (multiply_boxes and 
            transaction.minv_id.minv_qty_unit and 
            transaction.minv_id.minv_qty_unit.lower() == "boxes"):
            pcs_per_box = transaction.minv_id.minv_pcs or 1
            qty_num *= pcs_per_box
            
        return qty_num

    def get(self, request):
        try:
            # Get distinct months from medicine transactions
            distinct_months = MedicineTransactions.objects.annotate(
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

                # Get all medicine inventory items that were active up to this month
                med_expiry_inv_pairs = MedicineTransactions.objects.filter(
                    created_at__date__lte=end_date
                ).values_list(
                    "minv_id__med_id",
                    "minv_id__inv_id__expiry_date",
                    "minv_id__inv_id"
                ).distinct()

                expired_count = 0
                out_of_stock_count = 0
                expired_out_of_stock_count = 0
                near_expiry_count = 0

                seen_combinations = set()

                for med_id, expiry_date, inv_id in med_expiry_inv_pairs:
                    # Create a unique key for this combination
                    combo_key = (med_id, expiry_date, inv_id)
                    if combo_key in seen_combinations:
                        continue
                    seen_combinations.add(combo_key)

                    # Skip if no expiry date (can't be expired or near expiry)
                    if not expiry_date:
                        continue

                    # Skip if expired BEFORE current month
                    if expiry_date < start_date:
                        continue

                    transactions = MedicineTransactions.objects.filter(
                        minv_id__med_id=med_id,
                        minv_id__inv_id__expiry_date=expiry_date,
                        minv_id__inv_id=inv_id
                    ).order_by("created_at")

                    # Calculate stock levels
                    opening_in = transactions.filter(created_at__date__lt=start_date, mdt_action__icontains="added")
                    opening_out = transactions.filter(created_at__date__lt=start_date, mdt_action__icontains="deduct")
                    opening_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in opening_in) - sum(self._parse_qty(t, multiply_boxes=False) for t in opening_out)

                    monthly_transactions = transactions.filter(
                        created_at__date__gte=start_date,
                        created_at__date__lte=end_date
                    )
                    received_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in monthly_transactions.filter(mdt_action__icontains="added"))
                    dispensed_qty = sum(self._parse_qty(t, multiply_boxes=False) for t in monthly_transactions.filter(mdt_action__icontains="deduct"))

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
        
        
class MonthlyMedicineExpiredOutOfStockDetailAPIView(APIView):
    pagination_class = StandardResultsPagination

    def _parse_qty(self, transaction, multiply_boxes=False):
        """Extract numeric value from mdt_qty and convert boxes to pieces if needed."""
        match = re.search(r'\d+', str(transaction.mdt_qty))
        qty_num = int(match.group()) if match else 0
        
        # If it's a box unit AND we need to multiply, convert to pieces
        if (multiply_boxes and 
            transaction.minv_id.minv_qty_unit and 
            transaction.minv_id.minv_qty_unit.lower() == "boxes"):
            pcs_per_box = transaction.minv_id.minv_pcs or 1
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

        # Get all medicine inventory items that were active up to this month
        med_expiry_inv_pairs = MedicineTransactions.objects.filter(
            created_at__date__lte=end_date
        ).values_list(
            "minv_id__med_id",
            "minv_id__inv_id__expiry_date",
            "minv_id__inv_id"
        ).distinct()

        seen_combinations = set()

        for med_id, expiry_date, inv_id in med_expiry_inv_pairs:
            # Create a unique key for this combination
            combo_key = (med_id, expiry_date, inv_id)
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
                minv = MedicineInventory.objects.get(
                    med_id=med_id,
                    inv_id__expiry_date=expiry_date,
                    inv_id=inv_id
                )
            except MedicineInventory.DoesNotExist:
                continue

            transactions = MedicineTransactions.objects.filter(
                minv_id__med_id=med_id,
                minv_id__inv_id__expiry_date=expiry_date,
                minv_id__inv_id=inv_id
            ).order_by("created_at")

            # Get unit information
            unit = minv.minv_qty_unit
            pcs_per_box = minv.minv_pcs if unit and unit.lower() == "boxes" else 1

            # Calculate stock levels - multiply boxes for added quantities
            opening_in = transactions.filter(created_at__date__lt=start_date, mdt_action__icontains="added")
            opening_out = transactions.filter(created_at__date__lt=start_date, mdt_action__icontains="deduct")
            opening_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in opening_in) - sum(self._parse_qty(t, multiply_boxes=False) for t in opening_out)

            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            # Multiply boxes for received items
            received_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in monthly_transactions.filter(mdt_action__icontains="added"))
            # Don't multiply boxes for dispensed items (they're already in pieces)
            dispensed_qty = sum(self._parse_qty(t, multiply_boxes=False) for t in monthly_transactions.filter(mdt_action__icontains="deduct"))

            closing_qty = opening_qty + received_qty - dispensed_qty

            # Check conditions
            is_expired = start_date <= expiry_date <= end_date
            is_out_of_stock = closing_qty <= 0
            is_near_expiry = (end_date < expiry_date <= near_expiry_threshold) and closing_qty > 0

            item_data = {
                'med_name': f"{minv.med_id.med_name} {minv.minv_dsg}{minv.minv_dsg_unit} {minv.minv_form}",
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
        
        
        
# ========TEMPORaRY VIEW FOR PENDING MEDICINE REQUEST ITEMS========

from apps.medicineservices.models import MedicineRequestItem, MedicineRequest
from apps.medicineservices.serializers import MedicineRequestItemSerializer
class UpdateMedicinerequestItemView(generics.RetrieveUpdateAPIView): 
    serializer_class = MedicineRequestItemSerializer
    queryset = MedicineRequestItem.objects.all()
    lookup_field = "medreqitem_id"
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check if we're updating status to rejected
        if request.data.get('status') == 'rejected':
            # Get the reason from request data
            archive_reason = request.data.get('archive_reason', '')
            
            # Update the instance
            instance.status = 'rejected'
            instance.is_archived = True
            instance.archive_reason = archive_reason
            instance.save()
            
            # Return the updated data
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        
        # For other updates, use default behavior
        return super().update(request, *args, **kwargs)
        
        
        
        

class ConfirmAllPendingItemsView(generics.UpdateAPIView):
    """
    API endpoint to update all pending items for a medicine request to confirmed status
    """
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        medreq_id = kwargs.get('medreq_id')
        
        # Validate that medreq_id is provided
        if not medreq_id:
            return Response(
                {"error": "medreq_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify the medicine request exists
            medicine_request = MedicineRequest.objects.get(medreq_id=medreq_id)
        except MedicineRequest.DoesNotExist:
            return Response(
                {"error": f"MedicineRequest with ID {medreq_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all pending items for this medicine request
        pending_items = MedicineRequestItem.objects.filter(
            medreq_id=medreq_id,
            status='pending'
        )
        
        # Count items before update
        items_count = pending_items.count()
        
        if items_count == 0:
            return Response(
                {"message": "No pending items found for this medicine request"},
                status=status.HTTP_200_OK
            )
        
        # Update all pending items to confirmed status
        updated_count = pending_items.update(status='confirmed')
        
        return Response({
            "message": f"Successfully updated {updated_count} items to confirmed status",
            "medreq_id": medreq_id,
            "updated_count": updated_count
        }, status=status.HTTP_200_OK)

        
        
        
        
        
        
        
        
        
        
        
        
        
class MedicineRequestPendingItemsTableView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request, *args, **kwargs):
        try:
            # Get the medicine request ID from URL parameters
            medreq_id = self.kwargs.get('medreq_id')
            
            # Base queryset for medicine request items
            queryset = MedicineRequestItem.objects.all()
            
            # Filter by medicine request ID if provided
            if medreq_id:
                queryset = queryset.filter(medreq_id=medreq_id)
            else:
                # If no specific medreq_id provided, filter by pending status
                queryset = queryset.filter(medreq_id__status='pending')
            
            # Add select_related and prefetch_related for performance
            queryset = queryset.select_related(
                'medreq_id', 
                'med', 
                'medreq_id__rp_id', 
                'medreq_id__pat_id',
                'medreq_id__pat_id__rp_id',
                'medreq_id__pat_id__trans_id',
                'medreq_id__rp_id__per',
            ).prefetch_related(
                'medreq_id__medicine_files',
            ).order_by('-medreq_id__requested_at')
            
            # Group by med_id and prepare response data
            medicine_groups = {}
            
            for item in queryset:
                med_id = None
                med_name = "Unknown Medicine"
                med_type = "Unknown Type"
                
                # Get medicine ID, name, and type from med field
                if item.med:
                    med_id = item.med.med_id
                    med_name = item.med.med_name
                    med_type = item.med.med_type
                
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
                
                if med_id not in medicine_groups:
                    medicine_groups[med_id] = {
                        'med_id': med_id,
                        'med_name': med_name,
                        'med_type': med_type,
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
                
                # No inventory details since minv_id is always null
                inventory_info = {}
                
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
                    'medreq_status': item.medreq_id.status
                }
                
                medicine_groups[med_id]['request_items'].append(request_item_data)
            
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
            
            
            
            

from apps.medicineservices.serializers import MedicineRecordCreateSerializer
from apps.patientrecords.models import PatientRecord, Patient
from apps.childhealthservices.models import ChildHealth_History, ChildHealthSupplements
from apps.medicineservices.models import MedicineRecord,MedicineAllocation

class ChildServiceMedicineRecordView(generics.CreateAPIView):
    """
    API endpoint for bulk processing medicine requests
    """
    serializer_class = MedicineRecordCreateSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data
        staff_id = data.get('staff_id')
        chhist_id = data.get('chhist_id')
        pat_id = data.get('pat_id')
        medicines = data.get('medicines', [])
        
        # Validate required fields
        if not pat_id:
            return Response({"error": "pat_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        if not medicines:
            return Response({"error": "At least one medicine is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        results = []
        
        for med in medicines:
            print("Processing medicine:", med)
            try:
                # Process each medicine within transaction
                result = self.process_single_medicine(
                    pat_id, med, staff_id, chhist_id
                )
                results.append({
                    'success': True,
                    'medicineId': med['minv_id'],
                    'data': result
                })
                
            except Exception as error:
                results.append({
                    'success': False,
                    'medicineId': med['minv_id'],
                    'error': str(error)
                })
                # Continue with other medicines even if one fails
        
        # Check if all operations were successful
        all_success = all(result['success'] for result in results)
        
        return Response(
            {'results': results}, 
            status=status.HTTP_201_CREATED if all_success else status.HTTP_207_MULTI_STATUS
        )

    def process_single_medicine(self, pat_id, medicine_data, staff_id, chhist_id):
        try:
            patient = Patient.objects.get(pat_id=pat_id)
        except Patient.DoesNotExist:
            raise Exception(f"Patient with ID {pat_id} not found")
        
        # Get staff instance if provided
        staff_instance = None
        if staff_id:
            try:
                staff_instance = Staff.objects.get(staff_id=staff_id)
            except Staff.DoesNotExist:
                print(f"Staff with ID {staff_id} not found, continuing without staff")
            
        # 1. Create patient record
        patient_record = PatientRecord.objects.create(    
            pat_id=patient,
            patrec_type="Medicine Record",
        )
        
        if not patient_record.patrec_id:
            raise Exception("Failed to create patient record")
        
        # 2. Prepare medicine record data
        submission_data = {
            'patrec_id': patient_record.patrec_id,
            'minv_id': medicine_data['minv_id'],
            'medrec_qty': medicine_data['medrec_qty'],
            'reason': medicine_data.get('reason'),
            'requested_at': timezone.now(),
            'fulfilled_at': timezone.now(),
            'staff': staff_id,
        }
        
        # 3. Create medicine record
        medicine_record_serializer = MedicineRecordCreateSerializer(data=submission_data)
        medicine_record_serializer.is_valid(raise_exception=True)
        medrec = medicine_record_serializer.save()
        
        # 4. Update medicine inventory
        self.update_medicine_inventory(medicine_data['minv_id'], medicine_data['medrec_qty'], staff_instance)
        
        # 5. If it's for child health, create the relationship
        if chhist_id:
            self.create_child_health_relationship(chhist_id, medrec.medrec_id)
        
        return medicine_record_serializer.data
    
    def update_medicine_inventory(self, minv_id, quantity, staff_instance):
        try:
            medicine_inv = MedicineInventory.objects.select_for_update().get(pk=minv_id)
            if medicine_inv.minv_qty_avail < quantity:
                raise Exception(f"Insufficient stock for medicine {minv_id}. Available: {medicine_inv.minv_qty_avail}, Requested: {quantity}")
            
            # Store original quantity for potential rollback
            original_qty = medicine_inv.minv_qty_avail
            
            # Update inventory
            medicine_inv.minv_qty_avail -= quantity
            medicine_inv.save()
            
            # Create medicine transaction
            if medicine_inv.minv_qty_unit and medicine_inv.minv_qty_unit.lower() == 'boxes':
                mdt_qty = f"{quantity} pcs"  # Convert boxes to pieces
            else:
                # Use the original unit if not boxes
                unit = medicine_inv.minv_qty_unit or 'pcs'
                mdt_qty = f"{quantity} {unit}"
            
            # Create medicine transaction
            MedicineTransactions.objects.create(
                mdt_qty=mdt_qty,
                mdt_action="deducted",
                staff=staff_instance,
                minv_id=medicine_inv
            )
            
        except MedicineInventory.DoesNotExist:
            raise Exception(f"Medicine inventory {minv_id} not found")
    
    def create_child_health_relationship(self, chhist_id, medrec_id):
        try:
            chhist = ChildHealth_History.objects.get(pk=chhist_id)
            # Get the MedicineRecord instance
            medrec = MedicineRecord.objects.get(medrec_id=medrec_id)
            
            ChildHealthSupplements.objects.create(
                chhist=chhist,
                medrec=medrec  # Use the instance, not the ID
            )
        except ChildHealth_History.DoesNotExist:
            raise Exception("Invalid child health history ID provided")
        except MedicineRecord.DoesNotExist:
            raise Exception(f"Medicine record with ID {medrec_id} not found")
            
            
  
class MedicineRequestAllocationAPIView(APIView):
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            medreq_id = request.data.get('medreq_id')
            selected_medicines = request.data.get('selected_medicines', [])
            
            if not medreq_id:
                return Response({"error": "Medicine Request ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not selected_medicines or not isinstance(selected_medicines, list):
                return Response({"error": "Selected medicines list is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                medicine_request = MedicineRequest.objects.get(medreq_id=medreq_id)
            except MedicineRequest.DoesNotExist:
                return Response({"error": "Medicine Request not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Process each selected medicine
            for medicine in selected_medicines:
                minv_id = medicine.get('minv_id')
                medrec_qty = medicine.get('medrec_qty', 0)
                medreqitem_id = medicine.get('medreqitem_id')
                
                if not minv_id or medrec_qty <= 0:
                    continue
                
                try:
                    # Get the medicine inventory
                    medicine_inventory = MedicineInventory.objects.get(minv_id=minv_id)
                    
                    # Check if there's enough available stock
                    if medicine_inventory.minv_qty_avail < medrec_qty:
                        return Response({
                            "error": f"Insufficient stock for {medicine_inventory.med_id.med_name}. Available: {medicine_inventory.minv_qty_avail}, Requested: {medrec_qty}"
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Get the medicine request item if medreqitem_id is provided
                    request_item = None
                    if medreqitem_id:
                        try:
                            request_item = MedicineRequestItem.objects.get(
                                medreqitem_id=medreqitem_id,
                                medreq_id=medicine_request
                            )
                            # Update request item status to confirmed
                            request_item.status = 'confirmed'
                            request_item.save()
                        except MedicineRequestItem.DoesNotExist:
                            pass
                    
                    # Create MedicineAllocation only
                    MedicineAllocation.objects.create(
                        medreqitem=request_item,
                        minv=medicine_inventory,
                        allocated_qty=medrec_qty
                    )
                    
                    # Update inventory - temporary deduction
                    # Handle case where temporay_deduction might be None
                    if medicine_inventory.temporay_deduction is None:
                        medicine_inventory.temporay_deduction = 0
                    medicine_inventory.temporay_deduction += medrec_qty
                    
                    # Also ensure minv_qty_avail is not None
                    # if medicine_inventory.minv_qty_avail is None:
                    #     medicine_inventory.minv_qty_avail = 0
                    # medicine_inventory.minv_qty_avail -= medrec_qty
                    
                    medicine_inventory.save()
                    
                except MedicineInventory.DoesNotExist:
                    return Response({
                        "error": f"Medicine inventory with ID {minv_id} not found"
                    }, status=status.HTTP_404_NOT_FOUND)
            
            # Update the main medicine request status to "processing"
            medicine_request.status = 'processing'
            medicine_request.save()
            
            return Response({
                "success": True,
                "message": "Medicine allocation processed successfully",
                "medreq_id": medreq_id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)