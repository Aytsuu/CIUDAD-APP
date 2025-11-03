
from rest_framework import generics
from rest_framework.exceptions import ValidationError
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

        
from apps.healthProfiling.models   import *   
from ..models import *
from ..serializers.medicine_serializers import * 
         
         
         
class MedicineInventoryView(generics.ListAPIView):
    serializer_class = MedicineInventorySerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        queryset = MedicineInventory.objects.select_related(
            'inv_id', 
            'med_id'
        ).filter(inv_id__is_Archived=False)
        
        # Add search functionality
        search_query = self.request.GET.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                models.Q(med_id__med_name__icontains=search_query) |
                models.Q(inv_id__inv_id__icontains=search_query) |
                models.Q(med_id__med_type__icontains=search_query)
            )
        
        return queryset.order_by('med_id__med_name')

         
class MedicineListAvailableTable(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        # Get current date for expiry comparison
        today = timezone.now().date()
        
        # Get query parameters for filtering
        search_query = request.query_params.get('search', '').strip()
        med_type_filter = request.query_params.get('med_type', None)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        # Base queryset with available quantity calculation
        medicines = Medicinelist.objects.annotate(
            total_qty_available=Sum(
                'medicineinventory__minv_qty_avail',
                filter=Q(medicineinventory__inv_id__expiry_date__gte=today) | 
                       Q(medicineinventory__inv_id__expiry_date__isnull=True)
            )
        ).prefetch_related(
            'medicineinventory_set__inv_id'
        ).all()
        
        # Apply search filter if provided
        if search_query:
            medicines = medicines.filter(
                Q(med_name__icontains=search_query) |
                Q(med_type__icontains=search_query) |
                Q(med_dsg__icontains=search_query) |
                Q(med_form__icontains=search_query) |
                Q(med_tablet__icontains=search_query) |
                Q(medicineinventory__minv_form__icontains=search_query) |
                Q(medicineinventory__minv_dsg_unit__icontains=search_query)
            ).distinct()
        
        # Apply category filter if provided
        if med_type_filter and med_type_filter != 'All':
            medicines = medicines.filter(med_type__icontains=med_type_filter)
        
        # Apply pagination
        paginator = self.pagination_class()
        paginator.page_size = page_size
        paginated_medicines = paginator.paginate_queryset(medicines, request)
        
        # Prepare response data for paginated medicines only
        medicine_data = []
        for medicine in paginated_medicines:
            has_stock = medicine.total_qty_available and medicine.total_qty_available > 0
            
            if has_stock:
                inventory_items = []
                for med_inv in medicine.medicineinventory_set.all():
                    if (med_inv.inv_id.expiry_date is None or 
                        med_inv.inv_id.expiry_date >= today) and \
                       med_inv.minv_qty_avail > 0:
                        
                        # SIMPLE DEDUCTION: quantity_available minus temporary_deduction
                        available_after_deduction = med_inv.minv_qty_avail - med_inv.temporary_deduction
                        
                        inventory_items.append({
                            'minv_id': med_inv.minv_id,  # ✅ ADD THIS LINE - Include minv_id
                            'quantity_available': available_after_deduction,  # Deducted value
                            'quantity_unit': med_inv.minv_qty_unit,
                            'expiry_date': med_inv.inv_id.expiry_date,
                            'inventory_type': med_inv.inv_id.inv_type,
                            # 'dosage': med_inv.med_id.med_dsg,  # ✅ Also add dosage if needed
                            # 'form': med_inv.med_id.med_form,   # ✅ Also add form if needed
                        })
                
                medicine_data.append({
                    'med_id': medicine.med_id,
                    'med_name': medicine.med_name,
                    'med_type': medicine.med_type,
                    'form': medicine.med_form,
                    'dosage': f"{medicine.med_dsg} {medicine.med_dsg_unit}".strip(),
                    'total_qty_available': medicine.total_qty_available,
                    'inventory_items': inventory_items,
                    'status': 'Available'
                })
            else:
                medicine_data.append({
                    'med_id': medicine.med_id,
                    'med_name': medicine.med_name,
                    'med_type': medicine.med_type,
                    'form': medicine.med_form,
                    'dosage': f"{medicine.med_dsg} {medicine.med_dsg_unit}".strip(),
                    'total_qty_available': 0,
                    'inventory_items': [],
                    'status': 'No available stocks'
                })
        
        if paginated_medicines is not None:
            response = paginator.get_paginated_response(medicine_data)
            print("🔍 Backend Response:", response.data)
            return response
        
        return Response({
            'medicines': medicine_data,
            'count': len(medicine_data)
        }, status=status.HTTP_200_OK)
    
    
    
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
       
       
# ===========================MEDICINE STOCK TABLE==============================
class MedicineStockTableView(APIView):
    """
    API view for medicine stocks with pagination, search, and filtering
    """
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # self.auto_archive_expired_medicines()
            
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
                        'dosage': stock.med_id.med_dsg,
                        'dsgUnit': stock.med_id.med_dsg_unit,
                        'form': stock.med_id.med_form,
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
    
    # def auto_archive_expired_medicines(self):
    #     """Auto-archive medicines that expired more than 10 days ago and log transactions"""
    #     from datetime import timedelta
        
    #     today = timezone.now().date()
    #     archive_date = today - timedelta(days=10)
        
    #     print(f"Auto-archiving medicine items expired before: {archive_date}")
        
    #     # Archive expired medicine stocks
    #     medicine_stocks = MedicineInventory.objects.select_related('inv_id').filter(
    #         inv_id__expiry_date__lte=archive_date,
    #         inv_id__is_Archived=False
    #     )
        
    #     archived_medicine_count = 0
    #     for stock in medicine_stocks:
    #         # Get the current available quantity before archiving
    #         current_qty = stock.minv_qty_avail or 0
            
    #         # Determine the unit and format quantity with unit
    #         if stock.minv_qty_unit and stock.minv_qty_unit.lower() == "boxes":
    #             # For boxes, show quantity in pieces
    #             qty_with_unit = f"{current_qty} pcs"
    #         else:
    #             # For other units, use the actual unit
    #             unit = stock.minv_qty_unit if stock.minv_qty_unit else "pcs"
    #             qty_with_unit = f"{current_qty} {unit}"
            
    #         # Archive the inventory
    #         stock.inv_id.is_Archived = True
    #         stock.inv_id.save()
            
    #         # Create transaction record for the archive action
    #         MedicineTransactions.objects.create(
    #             mdt_qty=qty_with_unit,  # Record the quantity with unit that was archived
    #             mdt_action='Expired',  # Clear action indicating expiration-based archiving
    #             minv_id=stock,  # Reference to the medicine inventory
    #             staff=None  # System action, so no staff member
    #         )
            
    #         archived_medicine_count += 1
    #         print(f"Archived medicine stock: {stock.minv_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")
        
    #     print(f"Auto-archived {archived_medicine_count} medicine items with transaction records")




class MedicineStockCreate(APIView):
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            print("STAFFACKERSS", data)

            
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
        if not staff:  # If staff is empty or None
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
   
   
# ============================TRANSACTION CREATE=================================
class MedicineTransactionView(generics.ListCreateAPIView):
    serializer_class=MedicineTransactionSerializers
    queryset=MedicineTransactions.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    
# ============================TRANSACTION TABLE=================================


class TableMedicineTransactionView(APIView):
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
                    print("Persona",personal)
                    staff_name = f"{personal.per_fname or ''} {personal.per_lname or ''}".strip()
                    if not staff_name:
                        staff_name = f"Staff {staff.staff_id}"  # Fallback to staff ID
                 
                item_data = {
                    'mdt_id': transaction.mdt_id,
                    'inv_id': inventory.inv_id if inventory else "N/A", 
                    'med_detail': {
                        'med_name': medicine.med_name if medicine else "Unknown Medicine",
                        'minv_dsg': medicine.med_dsg if medicine else 0,
                        'minv_dsg_unit': medicine.med_dsg_unit if medicine else "N/A",
                        'minv_form': medicine.med_form if medicine else "N/A",
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
            
            
            
class MedicineDeduct(APIView):
    def post(self,request,*args, **kwargs):
        try:
            data = request.data.get('data', {})
            record = request.data.get('record', {})
            minv_id = record.get('id')
            deduct_qty = int(data.get('wastedAmount', 0))
            action = "Deducted"
            staff_id = data.get('staff_id')
            print("Deducting quantity:", deduct_qty)     
            print("From inventory ID:", minv_id)
            
            if not minv_id or deduct_qty <= 0:
                return Response({
                    'error': 'Invalid minv_id or deduct_qty'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Fetch the medicine inventory
            medicine_inventory = get_object_or_404(MedicineInventory, minv_id=minv_id)
            
            if medicine_inventory.minv_qty_avail < deduct_qty:
                return Response({
                    'error': 'Deduct quantity exceeds available stock'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Deduct the quantity
            medicine_inventory.minv_qty_avail -= deduct_qty
            medicine_inventory.updated_at = timezone.now()
            medicine_inventory.save()
            
            # Prepare quantity string for transaction
            if medicine_inventory.minv_qty_unit and medicine_inventory.minv_qty_unit.lower() == "boxes":
                            qty_string = f"{deduct_qty} pc/s"
            else:
                qty_string = f"{deduct_qty} {medicine_inventory.minv_qty_unit or 'units'}"

            # Create transaction record
            MedicineTransactions.objects.create(
                mdt_qty=qty_string,
                mdt_action=action,
                minv_id=medicine_inventory,
                staff_id=staff_id if staff_id else None  # Set to None if not provided
            )
            
            return Response({
                'success': True,
                'message': f'Successfully deducted {deduct_qty} from inventory {minv_id}',
                'new_available_stock': medicine_inventory.minv_qty_avail
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': f'Error deducting stock: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)