from rest_framework import generics
from ..models import *
from ..serializers.vaccine_serializers import *
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.db.models import ProtectedError
from pagination import StandardResultsPagination
from rest_framework.views import APIView
from django.db.models.functions import TruncMonth
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta
from calendar import monthrange
import re
from django.db.models import Q
from pagination import *
from apps.inventory.serializers.vaccine_serializers import *
from apps.vaccination.models import *

# =======================AGE GROUP================================#

class AgeGroupView(generics.ListCreateAPIView):
    serializer_class = AgegroupSerializer
    queryset = Agegroup.objects.all()
      


class DeleteUpdateAgeGroupView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AgegroupSerializer
    queryset = Agegroup.objects.all()
    lookup_field = 'agegrp_id'
    
    def get_object(self):
        agegrp_id = self.kwargs.get('agegrp_id')
        return get_object_or_404(Agegroup, agegrp_id=agegrp_id)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(
                {"message": "Age group deleted successfully."}, 
                status=status.HTTP_204_NO_CONTENT
            )
        except ProtectedError as e:
            # Extract the vaccine names that are using this age group
            vaccine_objects = e.protected_objects
            vaccine_names = [str(vaccine) for vaccine in vaccine_objects]
            
            return Response(
                {
                    "error": "Cannot delete age group",
                    "message": f"This age group is currently being used by {len(vaccine_objects)} vaccine(s).",
                    "used_by": vaccine_names,
                },
                status=status.HTTP_409_CONFLICT
            )
        except Exception as e:
            return Response(
                {"error": "Failed to delete age group", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
# =======================SUPPLY================================#
class ImmunizationSuppliesListTable(generics.ListAPIView):
    serializer_class = ImmunizationSuppliesSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        queryset = ImmunizationSupplies.objects.all()
        search_query = self.request.GET.get('search', '').strip()
        
        if search_query:
            queryset = queryset.filter(imz_name__icontains=search_query)
        return queryset
    
class ImmunizationSuppliesListCreateView(generics.ListCreateAPIView):
    serializer_class = ImmunizationSuppliesSerializer
    queryset = ImmunizationSupplies.objects.all()

class ImmunizationSuppliesRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ImmunizationSuppliesSerializer
    queryset = ImmunizationSupplies.objects.all()
    lookup_field = 'imz_id'
    
    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError("Cannot delete medicine. It is still in use by other records.")
        

    
class ImmunizationSuppliesStockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ImmnunizationStockSuppliesSerializer
    queryset = ImmunizationStock.objects.all()
    lookup_field = 'imzStck_id'
    
    def get_object(self):
        imzStck_id = self.kwargs.get('imzStck_id')
        obj = get_object_or_404(ImmunizationStock, imzStck_id=imzStck_id)
        return obj
     
class ImmunizationStockCreate(APIView):
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
            
            # Step 2: Create ImmunizationStock
            immunization_stock_data = self._prepare_immunization_stock_data(data, inv_id)
            immunization_stock_serializer = ImmnunizationStockSuppliesSerializer(data=immunization_stock_data)
            
            if not immunization_stock_serializer.is_valid():
                return Response({
                    'error': 'ImmunizationStock validation failed',
                    'details': immunization_stock_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            immunization_stock = immunization_stock_serializer.save()
            imzStck_id = immunization_stock.imzStck_id
            
            # Step 3: Create AntigenTransaction
            antigen_transaction_data = self._prepare_antigen_transaction_data(data, imzStck_id)
            antigen_transaction_serializer = AntigenTransactionSerializer(data=antigen_transaction_data)
            
            if not antigen_transaction_serializer.is_valid():
                return Response({
                    'error': 'AntigenTransaction validation failed',
                    'details': antigen_transaction_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            antigen_transaction = antigen_transaction_serializer.save()
            
            # Return success response with all created IDs
            return Response({
                'success': True,
                'message': 'Immunization stock created successfully',
                'data': {
                    'inv_id': inv_id,
                    'imzStck_id': imzStck_id,
                    'antt_id': antigen_transaction.antt_id
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Transaction will be automatically rolled back due to @transaction.atomic
            return Response({
                'error': 'Failed to create immunization stock',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _prepare_inventory_data(self, data):
        """Prepare inventory data from request"""
        return {
            'expiry_date': data.get('expiry_date'),
            'inv_type': data.get('inv_type', 'Antigen'),  # default type
            'is_Archived': False
        }
    
    def _prepare_immunization_stock_data(self, data, inv_id):
        """Prepare immunization stock data from request"""
        # Handle nested data structure if present
        if 'data' in data:
            nested_data = data.get('data', {})
            immunization_data = {
                **nested_data,
                'imz_id': data.get('imz_id'),
                'inv_id': inv_id
            }
        else:
            immunization_data = data.copy()
            immunization_data['inv_id'] = inv_id
        
        # Validate imz_id
        imz_id = immunization_data.get('imz_id')
        if not imz_id or (isinstance(imz_id, str) and not imz_id.isdigit()):
            raise ValueError("Invalid immunization supply selection")
        
        imz_id = int(imz_id)
        immunization_data['imz_id'] = imz_id
        
        # Calculate quantities based on unit
        is_boxes = immunization_data.get('imzStck_unit') == 'boxes'
        qty = int(immunization_data.get('imzStck_qty', 0))
        pcs_per_box = int(immunization_data.get('imzStck_pcs', 0)) if is_boxes else 0
        
        # Set calculated fields
        immunization_data.update({
            'imzStck_qty': qty,
            'imzStck_per_pcs': 0,  # Always 0 as per your logic
            'imzStck_pcs': pcs_per_box,
            'imzStck_used': immunization_data.get('imzStck_used', 0)
        })
        
        # Calculate total available pieces
        if is_boxes:
            immunization_data['imzStck_avail'] = qty * pcs_per_box
        else:
            immunization_data['imzStck_avail'] = qty
        
        # Handle batch number
        batch_number = immunization_data.get('batch_number', 'N/A')
        if batch_number:
            immunization_data['batch_number'] = batch_number.upper().strip()
        else:
            immunization_data['batch_number'] = 'N/A'
            
        return immunization_data
    
    def _prepare_antigen_transaction_data(self, data, imzStck_id):
        """Prepare antigen transaction data from request"""
        qty_unit = data.get('imzStck_unit')
        qty = data.get('imzStck_qty', 0)
        pcs = data.get('imzStck_pcs', 0)
        total_pcs = qty * pcs 
        
        # Format quantity string based on unit
        if qty_unit == 'boxes':
            antt_qty = f"{qty} boxes ({total_pcs} pcs)"
        else:
            antt_qty = f"{qty} {qty_unit}"
        
        return {
            'antt_qty': antt_qty,
            'antt_action': 'Added',
            'imzStck_id': imzStck_id,
            'staff': data.get('staff')  # Include staff if provided
        }


# =======================VACCINES================================#
class VaccineListView(generics.ListCreateAPIView):
    serializer_class = VacccinationListSerializer
    queryset = VaccineList.objects.all()

    def create(self, request, *args, **kwargs):
        vac_name = request.data.get('vac_name')

        # Check if vaccine already exists for that age group
        if VaccineList.objects.filter(vac_name__iexact=vac_name).exists():
            return Response(
                {"detail": "This vaccine already exists for the selected age group."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

class VaccineIntervalView(generics.ListCreateAPIView):
    serializer_class=VaccineIntervalSerializer
    queryset=VaccineInterval.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class RoutineFrequencyView(generics.ListCreateAPIView):
    serializer_class=RoutineFrequencySerializer
    queryset=RoutineFrequency.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
     
            
class ConditionalVaccineListView(generics.ListCreateAPIView):
    serializer_class = CondtionaleVaccineSerializer
    queryset = ConditionalVaccine.objects.all()
    
class VaccineListRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VacccinationListSerializer
    queryset = VaccineList.objects.all()
    lookup_field = 'vac_id'
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy method to check for critical connections before deletion"""
        try:
            instance = self.get_object()
            vac_id = instance.vac_id
            
            print(f"Attempting to delete VaccineList: {instance.vac_name} (ID: {vac_id})")
            
            # 1. FIRST CHECK: Check if vaccine has any stock records (CRITICAL - prevent deletion)
            stock_count = VaccineStock.objects.filter(vac_id=vac_id).count()
            if stock_count > 0:
                return Response(
                    {
                        "error": f"Cannot delete vaccine it has record(s) associated with it.",
                        "stock_records_count": stock_count,
                        "message": "Please remove all stock records first before deleting this vaccine."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 2. SECOND CHECK: Check if vaccine has any vaccination history records (CRITICAL - prevent deletion)
            vaccination_history_count = VaccinationHistory.objects.filter(vac_id=vac_id).count()
            if vaccination_history_count > 0:
                return Response(
                    {
                        "error": f"Cannot delete vaccine.  record(s) associated with it.",
                        "vaccination_history_count": vaccination_history_count,
                        "message": "This vaccine has been used in vaccination records and cannot be deleted."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 3. If no critical connections found, proceed with deleting configuration tables
            try:
                # Delete ConditionalVaccine records (safe to delete - just configuration)
                conditional_count, _ = ConditionalVaccine.objects.filter(vac_id=vac_id).delete()
                print(f"Deleted {conditional_count} ConditionalVaccine records")
                
                # Delete VaccineInterval records (safe to delete - just configuration)
                interval_count, _ = VaccineInterval.objects.filter(vac_id=vac_id).delete()
                print(f"Deleted {interval_count} VaccineInterval records")
                
                # Delete RoutineFrequency record (OneToOne) - safe to delete
                try:
                    routine_freq = RoutineFrequency.objects.get(vac_id=vac_id)
                    routine_freq.delete()
                    print("Deleted RoutineFrequency record")
                except RoutineFrequency.DoesNotExist:
                    print("No RoutineFrequency record found")
                
            except Exception as rel_error:
                print(f"Error deleting configuration records: {rel_error}")
                # Even if configuration deletion fails, we can still try to delete the main record
                # since these are just configuration tables
            
            # 4. Now delete the main VaccineList record
            instance.delete()
            print("VaccineList deleted successfully")
            
            return Response(
                {
                    "message": "Vaccine deleted successfully",
                    "details": {
                        "vaccine_name": instance.vac_name,
                        "deleted_configuration_records": {
                            "conditional_vaccines": conditional_count,
                            "vaccine_intervals": interval_count,
                            "routine_frequency": 1 if RoutineFrequency.objects.filter(vac_id=vac_id).exists() else 0
                        }
                    }
                },
                status=status.HTTP_200_OK
            )
            
        except ProtectedError as e:
            print(f"ProtectedError: {e}")
            # This shouldn't happen now, but just in case
            return Response(
                {"error": "Cannot delete due to database constraints."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Unexpected error during deletion: {e}")
            return Response(
                {"error": f"Delete failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class ConditionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CondtionaleVaccineSerializer
    queryset = ConditionalVaccine.objects.all()
    lookup_field = 'vac_id'
    def get_object(self):
        vac_id = self.kwargs.get('vac_id')
        obj = get_object_or_404(ConditionalVaccine, vac_id=vac_id)
        return obj
# Vaccine Interval Views
class VaccineIntervalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaccineIntervalSerializer
    queryset = VaccineInterval.objects.all()
    lookup_field = 'vacInt_id'
    
    def get_object(self):
        vacInt_id = self.kwargs.get('vacInt_id')
        obj = get_object_or_404(VaccineInterval, vacInt_id=vacInt_id)
        return obj

# Routine Frequency Views
class RoutineFrequencyRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RoutineFrequencySerializer
    queryset = RoutineFrequency.objects.all()
    lookup_field = 'routineF_id'
    
    def get_object(self):
        routineF_id = self.kwargs.get('routineF_id')
        obj = get_object_or_404(RoutineFrequency, routineF_id=routineF_id)
        return obj
    

 
class VaccineStocksView(generics.ListCreateAPIView):
    serializer_class = VaccineStockSerializer
    queryset = VaccineStock.objects.all()
    
    def get_queryset(self):
        # Filter out VaccineStock entries where the related Inventory is archived
        queryset = VaccineStock.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset
    

class VaccineStockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaccineStockSerializer
    queryset = VaccineStock.objects.all()
    lookup_field = 'vacStck_id'
    def get_object(self):
        vacStck_id = self.kwargs.get('vacStck_id')
        obj = get_object_or_404(VaccineStock, vacStck_id=vacStck_id)
        return obj
    


class VaccineStockCreate(APIView): 
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
            
            # Step 2: Create VaccineStock
            vaccine_stock_data = self._prepare_vaccine_stock_data(data, inv_id)
            vaccine_stock_serializer = VaccineStockSerializer(data=vaccine_stock_data)
            
            if not vaccine_stock_serializer.is_valid():
                return Response({
                    'error': 'VaccineStock validation failed',
                    'details': vaccine_stock_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            vaccine_stock = vaccine_stock_serializer.save()
            vacStck_id = vaccine_stock.vacStck_id
            
            # Step 3: Create AntigenTransaction
            antigen_transaction_data = self._prepare_antigen_transaction_data(data, vacStck_id)
            antigen_transaction_serializer = AntigenTransactionSerializer(data=antigen_transaction_data)
            
            if not antigen_transaction_serializer.is_valid():
                return Response({
                    'error': 'AntigenTransaction validation failed',
                    'details': antigen_transaction_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            antigen_transaction = antigen_transaction_serializer.save()
            
            # Return success response with all created IDs
            return Response({
                'success': True,
                'message': 'Vaccine stock created successfully',
                'data': {
                    'inv_id': inv_id,
                    'vacStck_id': vacStck_id,
                    'antt_id': antigen_transaction.antt_id
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Transaction will be automatically rolled back due to @transaction.atomic
            return Response({
                'error': 'Failed to create vaccine stock',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _prepare_inventory_data(self, data):
        """Prepare inventory data from request"""
        return {
            'expiry_date': data.get('expiry_date'),
            'inv_type': data.get('inv_type', 'Antigen'),  # default type
            'is_Archived': False
        }
    
    def _prepare_vaccine_stock_data(self, data, inv_id):
        """Prepare vaccine stock data from request"""
        # Handle nested data structure if present
        if 'data' in data:
            nested_data = data.get('data', {})
            vaccine_data = {
                **nested_data,
                'vac_id': data.get('vac_id'),
                'inv_id': inv_id
            }
        else:
            vaccine_data = data.copy()
            vaccine_data['inv_id'] = inv_id
        
        # Validate vac_id
        vac_id = vaccine_data.get('vac_id')
        if not vac_id or (isinstance(vac_id, str) and not vac_id.isdigit()):
            raise ValueError("Invalid vaccine selection")
        
        vac_id = int(vac_id)
        vaccine_data['vac_id'] = vac_id
        
        # Calculate quantities
        solvent_type = vaccine_data.get('solvent', 'diluent')
        qty = int(vaccine_data.get('qty', 0))
        dose_ml = int(vaccine_data.get('dose_ml', 0))  
              
        vaccine_data.update({
            'qty': qty,
            'dose_ml': dose_ml,
            'wasted_dose': vaccine_data.get('wasted_dose', 0)
        })
        
        # Calculate available quantity based on solvent type
        if solvent_type == "doses":
            vaccine_data['vacStck_qty_avail'] = qty * dose_ml
        else:  # diluent
            vaccine_data['vacStck_qty_avail'] = qty
        
        # Handle batch number formatting
        batch_number = vaccine_data.get('batchNumber') or vaccine_data.get('batch_number', '')
        if batch_number:
            vaccine_data['batch_number'] = batch_number.upper().strip()
        
        return vaccine_data
    
    def _prepare_antigen_transaction_data(self, data, vacStck_id):
        """Prepare antigen transaction data from request"""
        solvent_type = data.get('solvent', 'diluent')
        qty = data.get('qty', 0)
        doses = data.get('dose_ml', 0) * qty if solvent_type == "doses" else 0
        
        # Determine unit based on solvent type
        unit = "vial/s" if solvent_type == "doses" else "container/s"
        
        if solvent_type == "doses":
            string_qty = f"{qty} vial/s ({doses} doses)"
        else:
            string_qty = f"{qty} {unit}"
        
        return {
            'antt_qty': string_qty,
            'antt_action': 'Added',
            'vacStck_id': vacStck_id,
            'staff': data.get('staff')  # Include staff if provided
        }


    
    
class AntigenTransactionView(generics.ListCreateAPIView):
    serializer_class = AntigenTransactionSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        return AntigenTransaction.objects.all().order_by('-created_at')  # or any logic

   
    

class CombinedVaccineDataView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        # Get search query parameter for vaccine name only
        search_query = request.GET.get('search', '').strip()
        
        # Filter vaccines based on search query (vaccine name only)
        vaccines = VaccineList.objects.all()
        
        if search_query:
            vaccines = vaccines.filter(vac_name__icontains=search_query)
        
        # Apply pagination to vaccines
        paginator = self.pagination_class()
        paginated_vaccines = paginator.paginate_queryset(vaccines, request)
        
        # Get all intervals and frequencies (no pagination for these)
        intervals = VaccineInterval.objects.all()
        frequencies = RoutineFrequency.objects.all()
        
        # Serialize the data
        vaccine_serializer = VacccinationListSerializer(paginated_vaccines, many=True)
        interval_serializer = VaccineIntervalSerializer(intervals, many=True)
        frequency_serializer = RoutineFrequencySerializer(frequencies, many=True)
        
        # Return combined response with pagination info
        return paginator.get_paginated_response({
            'vaccines': vaccine_serializer.data,
            'intervals': interval_serializer.data,
            'frequencies': frequency_serializer.data,
            'pagination': {
                'total_count': paginator.page.paginator.count,
                'total_pages': paginator.page.paginator.num_pages,
                'current_page': paginator.page.number,
                'page_size': paginator.page_size,
            }
        })


# ANTIGEN STOCK
class CombinedStockTable(APIView):
    """
    API view that combines vaccine stocks and immunization supplies 
    to match the frontend getCombinedStock function logic with filters
    """
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            
            # self.auto_archive_expired_items()
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            stock_filter = request.GET.get('filter', 'all').lower()
            
            # Get vaccine stocks with related data (not archived)
            vaccine_stocks = VaccineStock.objects.select_related(
                'vac_id', 'inv_id'
            ).filter(inv_id__is_Archived=False)
            
            # Get immunization stocks with related data (not archived)
            immunization_stocks = ImmunizationStock.objects.select_related(
                'imz_id', 'inv_id'
            ).filter(inv_id__is_Archived=False)
            
            # Apply search filter if provided
            if search_query:
                vaccine_stocks = vaccine_stocks.filter(
                    Q(vac_id__vac_name__icontains=search_query) |
                    Q(batch_number__icontains=search_query)
                )
                immunization_stocks = immunization_stocks.filter(
                    Q(imz_id__imz_name__icontains=search_query) |
                    Q(batch_number__icontains=search_query)
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
            
            # Process vaccine stocks
            for stock in vaccine_stocks:
                doses_per_vial = stock.dose_ml if stock.dose_ml else 1
                total_doses = doses_per_vial * stock.qty
                
                # Calculate available stock
                if stock.solvent and stock.solvent.lower() == "diluent":
                    available_stock = stock.vacStck_qty_avail
                    # For diluent, low stock threshold is 10 containers
                    low_stock_threshold = 10
                else:
                    available_stock = stock.vacStck_qty_avail
                    # For regular vaccines, low stock threshold is 10 vials
                    low_stock_threshold = 10
                
                # Check expiry status
                expiry_date = stock.inv_id.expiry_date if stock.inv_id else None
                is_expired = expiry_date and expiry_date < today if expiry_date else False
                
                # Check near expiry (within 30 days)
                is_near_expiry = False
                if expiry_date and not is_expired:
                    days_until_expiry = (expiry_date - today).days
                    is_near_expiry = 0 < days_until_expiry <= 30
                
                # Check out of stock FIRST
                is_out_of_stock = available_stock <= 0
                
                # Check low stock based on unit type (only if NOT out of stock)
                is_low_stock = False
                if not is_out_of_stock:
                    is_low_stock = available_stock <= low_stock_threshold
                
                # Update filter counts (only count non-archived items)
                if not stock.inv_id.is_Archived if stock.inv_id else False:
                    filter_counts['total'] += 1
                    if is_out_of_stock:
                        filter_counts['out_of_stock'] += 1
                    elif is_low_stock and not is_expired:  # Only count as low stock if not out of stock and not expired
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
                
                if stock.solvent and stock.solvent.lower() == "diluent":
                    # Diluent handling
                    # Diluent handling
                    # Calculate used containers: total containers - available_stock - wasted_dose
                    used_qty = stock.qty - available_stock - (stock.wasted_dose or 0)
                    used_qty = max(0, used_qty)  # Prevent negative values
                    item_data = {
                        'type': 'vaccine',
                        'id': stock.vacStck_id,
                        'batchNumber': stock.batch_number,
                        'category': 'Vaccine',
                        'item': {
                            'antigen': stock.vac_id.vac_name if stock.vac_id else "Unknown Vaccine",
                            'dosage': stock.volume if hasattr(stock, 'volume') else None,
                            'unit': 'container',
                        },
                        'qty': f"{stock.qty or 0} container/s",
                        'administered': f"{used_qty} container/s",
                        'wastedDose': f"{str(stock.wasted_dose or 0)} container/s",
                        'availableStock': available_stock,
                        'expiryDate': expiry_date.isoformat() if expiry_date else None,
                        'inv_id': stock.inv_id.inv_id if stock.inv_id else None,
                        'solvent': stock.solvent,
                        'vacStck_id': stock.vacStck_id,
                        'vac_id': stock.vac_id.vac_id if stock.vac_id else None,
                        'qty_number': stock.qty,
                        'isArchived': stock.inv_id.is_Archived if stock.inv_id else False,
                        'created_at': stock.created_at.isoformat() if stock.created_at else None,
                        'isExpired': is_expired,
                        'isNearExpiry': is_near_expiry,
                        'isLowStock': is_low_stock,
                        'isOutOfStock': is_out_of_stock
                    }
                else:
                    # Regular vaccine handling
                    # Calculate used doses: total_doses - available_stock - wasted_dose
                    used_qty = total_doses - available_stock - (stock.wasted_dose or 0)
                    used_qty = max(0, used_qty)  # Prevent negative values
                    item_data = {
                        'type': 'vaccine',
                        'id': stock.vacStck_id,
                        'batchNumber': stock.batch_number,
                        'category': 'Vaccine',
                        'item': {
                            'antigen': stock.vac_id.vac_name if stock.vac_id else "Unknown Vaccine",
                            'dosage': stock.dose_ml,
                            'unit': 'ml',
                        },
                        'qty': f"{stock.qty} vials ({total_doses} dose/s)",
                        'administered': f"{used_qty} dose/s",
                        'wastedDose': f"{str(stock.wasted_dose or 0)} dose/s",
                        'availableStock': available_stock,
                        'expiryDate': expiry_date.isoformat() if expiry_date else None,
                        'solvent': stock.solvent,
                        'inv_id': stock.inv_id.inv_id if stock.inv_id else None,
                        'dose_ml': stock.dose_ml,
                        'vacStck_id': stock.vacStck_id,
                        'dosesPerVial': doses_per_vial,
                        'vac_id': stock.vac_id.vac_id if stock.vac_id else None,
                        'qty_number': stock.qty,
                        'isArchived': stock.inv_id.is_Archived if stock.inv_id else False,
                        'created_at': stock.created_at.isoformat() if stock.created_at else None,
                        'isExpired': is_expired,
                        'isNearExpiry': is_near_expiry,
                        'isLowStock': is_low_stock,
                        'isOutOfStock': is_out_of_stock
                    }
                
                combined_data.append(item_data)
            
            # Process immunization supplies
            for stock in immunization_stocks:
                total_pcs = stock.imzStck_qty * stock.imzStck_pcs
                
                if stock.imzStck_unit == "pcs":
                    qty_display = f"{stock.imzStck_qty} pc/s"
                    # For pieces, low stock threshold is 20 pcs
                    low_stock_threshold = 20
                else:
                    qty_display = f"{stock.imzStck_qty} boxes ({total_pcs} pcs)"
                    # For boxes, low stock threshold is 2 boxes
                    low_stock_threshold = 2
                
                # Calculate available stock
                available_stock = stock.imzStck_avail
                
                # Check expiry status
                expiry_date = stock.inv_id.expiry_date if stock.inv_id else None
                is_expired = expiry_date and expiry_date < today if expiry_date else False
                
                # Check near expiry (within 30 days)
                is_near_expiry = False
                if expiry_date and not is_expired:
                    days_until_expiry = (expiry_date - today).days
                    is_near_expiry = 0 < days_until_expiry <= 30
                
                # Check out of stock FIRST
                is_out_of_stock = available_stock <= 0
                
                # Check low stock based on unit type (only if NOT out of stock)
                is_low_stock = False
                if not is_out_of_stock:
                    is_low_stock = available_stock <= low_stock_threshold
                
                # Update filter counts (only count non-archived items)
                if not stock.inv_id.is_Archived if stock.inv_id else False:
                    filter_counts['total'] += 1
                    if is_out_of_stock:
                        filter_counts['out_of_stock'] += 1
                    elif is_low_stock and not is_expired:  # Only count as low stock if not out of stock and not expired
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
                
                # Calculate used quantity: total pieces - available_stock - wasted
                total_pcs = stock.imzStck_qty * stock.imzStck_pcs if stock.imzStck_unit == "boxes" else stock.imzStck_qty
                wasted = getattr(stock, 'wasted', 0) or 0
                used_qty = total_pcs - available_stock - wasted
                used_qty = max(0, used_qty)  # Prevent negative values

                item_data = {
                    'type': 'supply',
                    'id': stock.imzStck_id,
                    'batchNumber': stock.batch_number or "N/A",
                    'category': 'Immunization Supplies',
                    'item': {
                        'antigen': stock.imz_id.imz_name if stock.imz_id else "Unknown Supply",
                        'dosage': 1,
                        'unit': stock.imzStck_unit,
                    },
                    'qty': qty_display,
                    'administered': f"{used_qty} {'pcs' if stock.imzStck_unit and stock.imzStck_unit.lower() == 'boxes' else stock.imzStck_unit}",  # Adjusted for boxes",
                    'wastedDose':f"{str(wasted)} {'pcs' if stock.imzStck_unit and stock.imzStck_unit.lower() == 'boxes' else stock.imzStck_unit}",  # Adjusted for boxes",,
                    'availableStock': available_stock,
                    'expiryDate': expiry_date.isoformat() if expiry_date else "N/A",
                    'inv_id': stock.inv_id.inv_id if stock.inv_id else None,
                    'imz_id': stock.imz_id.imz_id if stock.imz_id else None,
                    'imzStck_id': stock.imzStck_id,
                    'imzStck_unit': stock.imzStck_unit,
                    'imzStck_used': stock.imzStck_used or 0,
                    'imzStck_pcs': stock.imzStck_pcs,
                    'qty_number': stock.imzStck_qty,
                    'isArchived': stock.inv_id.is_Archived if stock.inv_id else False,
                    'created_at': stock.created_at.isoformat() if stock.created_at else None,
                    'isExpired': is_expired,
                    'isNearExpiry': is_near_expiry,
                    'isLowStock': is_low_stock,
                    'isOutOfStock': is_out_of_stock
                }
                
                combined_data.append(item_data)
            
            # Sort by ID descending (matching frontend logic)
            combined_data.sort(key=lambda x: x['id'], reverse=True)
            
            # Apply pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(combined_data, request)
            
            if page is not None:
                # Create custom response with both paginated data and filter counts
                response = paginator.get_paginated_response(page)
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
                'error': f'Error fetching combined stock data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # def auto_archive_expired_items(self):
    #     """Auto-archive items that expired more than 10 days ago and log transactions"""
    #     from datetime import timedelta
        
    #     today = timezone.now().date()
    #     archive_date = today - timedelta(days=10)  # Changed from 1 to 10 days
        
    #     print(f"Auto-archiving items expired before: {archive_date}")
        
    #     # Archive expired vaccine stocks
    #     vaccine_stocks = VaccineStock.objects.select_related('inv_id').filter(
    #         inv_id__expiry_date__lte=archive_date,
    #         inv_id__is_Archived=False
    #     )
        
    #     archived_vaccine_count = 0
    #     for stock in vaccine_stocks:
    #         # Get the current available quantity before archiving
    #         current_qty = stock.vacStck_qty_avail or 0
            
    #         # Determine the unit based on solvent type
    #         if stock.solvent and stock.solvent.lower() == "doses":
    #             qty_with_unit = f"{current_qty} doses"
    #         elif stock.solvent and stock.solvent.lower() == "container":
    #             qty_with_unit = f"{current_qty} pcs"
    #         else:
    #             # For other solvent types, use the immunization unit or default to doses
    #             qty_with_unit = f"{current_qty} doses"  # Default for vaccines
            
    #         # Archive the inventory
    #         stock.inv_id.is_Archived = True
    #         stock.inv_id.save()
            
    #         # Create transaction record for the archive action
    #         AntigenTransaction.objects.create(
    #             antt_qty=qty_with_unit,  # Record the quantity with unit that was archived
    #             antt_action='Expired',  # Clear action indicating expiration-based archiving
    #             vacStck_id=stock,  # Reference to the vaccine stock
    #             imzStck_id=None,  # Not an immunization stock
    #             staff=None  # System action, so no staff member
    #         )
            
    #         archived_vaccine_count += 1
    #         print(f"Archived vaccine stock: {stock.vacStck_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")
        
    #     # Archive expired immunization stocks
    #     immunization_stocks = ImmunizationStock.objects.select_related('inv_id').filter(
    #         inv_id__expiry_date__lte=archive_date,
    #         inv_id__is_Archived=False
    #     )
        
    #     archived_immunization_count = 0
    #     for stock in immunization_stocks:
    #         # Get the current available quantity before archiving
    #         current_qty = stock.imzStck_avail or 0
            
    #         # Determine the unit based on immunization unit
    #         if stock.imzStck_unit and stock.imzStck_unit.lower() == "boxes":
    #             qty_with_unit = f"{current_qty} pcs"
    #         else:
    #             # Use the actual immunization unit or default to pcs
    #             unit = stock.imzStck_unit if stock.imzStck_unit else "pcs"
    #             qty_with_unit = f"{current_qty} {unit}"
            
    #         # Archive the inventory
    #         stock.inv_id.is_Archived = True
    #         stock.inv_id.save()
            
    #         # Create transaction record for the archive action
    #         AntigenTransaction.objects.create(
    #             antt_qty=qty_with_unit,  # Record the quantity with unit that was archived
    #             antt_action='Expired',  # Clear action indicating expiration-based archiving
    #             vacStck_id=None,  # Not a vaccine stock
    #             imzStck_id=stock,  # Reference to the immunization stock
    #             staff=None  # System action, so no staff member
    #         )
            
    #         archived_immunization_count += 1
    #         print(f"Archived immunization stock: {stock.imzStck_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")
        
    #     print(f"Auto-archived {archived_vaccine_count} vaccine items and {archived_immunization_count} immunization items with transaction records")




# ==========================TRANSATION=========================
class AntigenTransactionView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            # Get antigen transactions with related data - FIXED staff relationship
            transactions = AntigenTransaction.objects.select_related(
                'vacStck_id__vac_id',
                'vacStck_id__inv_id',
                'imzStck_id__imz_id',
                'imzStck_id__inv_id',
                'staff__rp__per'  # Add this to get the personal info
            ).all()
            
            # Apply search filter if provided - UPDATED search fields
            if search_query:
                transactions = transactions.filter(
                    Q(vacStck_id__vac_id__vac_name__icontains=search_query) |
                    Q(imzStck_id__imz_id__imz_name__icontains=search_query) |
                    Q(vacStck_id__inv_id__inv_id__icontains=search_query) |
                    Q(imzStck_id__inv_id__inv_id__icontains=search_query) |
                    Q(antt_action__icontains=search_query) |
                    Q(staff__rp__per__per_fname__icontains=search_query) |  # Updated
                    Q(staff__rp__per__per_lname__icontains=search_query)    # Updated
                )
            
            # Format the data for response
            transaction_data = []
            
            for transaction in transactions:
                staff = transaction.staff
                vaccine_stock = transaction.vacStck_id
                immunization_stock = transaction.imzStck_id
                
                # Determine item type and get details
                item_name = "Unknown Item"
                item_type = "Unknown"
                inv_id = "N/A"
                
                if vaccine_stock:
                    vaccine = vaccine_stock.vac_id
                    inventory = vaccine_stock.inv_id
                    item_name = vaccine.vac_name if vaccine else "Unknown Vaccine"
                    item_type = "Vaccine"
                    inv_id = inventory.inv_id if inventory else "N/A"
                elif immunization_stock:
                    immunization = immunization_stock.imz_id
                    inventory = immunization_stock.inv_id
                    item_name = immunization.imz_name if immunization else "Unknown Supply"
                    item_type = "Immunization Supply"
                    inv_id = inventory.inv_id if inventory else "N/A"
                
                # Format staff name - FIXED (consistent with other views)
                staff_name = "Managed by System"
                if staff and staff.rp and staff.rp.per:
                    personal = staff.rp.per
                    staff_name = f"{personal.per_fname or ''} {personal.per_lname or ''}".strip()
                    if not staff_name:
                        staff_name = f"Staff {staff.staff_id}"  # Fallback to staff ID
                
                item_data = {
                    'antt_id': transaction.antt_id,
                    'item_name': item_name,
                    'item_type': item_type,
                    'inv_id': inv_id,
                    'antt_qty': transaction.antt_qty,
                    'antt_action': transaction.antt_action,
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
                'error': f'Error fetching antigen transactions: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
# ===========================ARCHIVE==============================
class AntigenArchiveInventoryView(APIView):
    def patch(self, request, inv_id):
        """
        Archive inventory item (no transaction creation)
        """
        try:
            # Get inventory item
            inventory = get_object_or_404(Inventory, inv_id=inv_id)

            # Archive the inventory
            inventory.is_Archived = True
            inventory.updated_at = timezone.now()
            inventory.save()

            return Response(
                {
                    "message": "Inventory archived successfully",
                    "inv_id": inv_id
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Error archiving inventory: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )




class ArchivedAntigenTable(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            # Get archived vaccine stocks
            vaccine_stocks = VaccineStock.objects.select_related(
                'vac_id', 'inv_id'
            ).filter(inv_id__is_Archived=True)
            
            # Get archived immunization stocks
            immunization_stocks = ImmunizationStock.objects.select_related(
                'imz_id', 'inv_id'
            ).filter(inv_id__is_Archived=True)
            
            # Apply search filter if provided
            if search_query:
                vaccine_stocks = vaccine_stocks.filter(
                    Q(vac_id__vac_name__icontains=search_query) |
                    Q(batch_number__icontains=search_query) |
                    Q(inv_id__inv_id__icontains=search_query)
                )
                immunization_stocks = immunization_stocks.filter(
                    Q(imz_id__imz_name__icontains=search_query) |
                    Q(batch_number__icontains=search_query) |
                    Q(inv_id__inv_id__icontains=search_query)
                )
            
            # Calculate today's date for expiry comparisons
            today = timezone.now().date()
            
            archived_data = []
            
            # Process archived vaccine stocks
            for stock in vaccine_stocks:
                doses_per_vial = stock.dose_ml if stock.dose_ml else 1
                total_doses = doses_per_vial * stock.qty
                
                # Calculate available stock
                available_stock = stock.vacStck_qty_avail
                
                # Check expiry status
                expiry_date = stock.inv_id.expiry_date if stock.inv_id else None
                is_expired = expiry_date and expiry_date < today if expiry_date else False
                
                # Determine archive reason
                archive_reason = 'Expired' if is_expired else 'Out of Stock'
                
                if stock.solvent and stock.solvent.lower() == "diluent":
                    # Diluent handling - qty used = total containers - wasted containers
                    wasted_containers = stock.wasted_dose or 0
                    actual_used_containers = stock.qty - wasted_containers
                    
                    item_data = {
                        'type': 'vaccine',
                        'id': stock.vacStck_id,
                        'batchNumber': stock.batch_number or "N/A",
                        'category': 'Vaccine',
                        'item': {
                            'antigen': stock.vac_id.vac_name if stock.vac_id else "Unknown Vaccine",
                            'dosage': stock.volume if hasattr(stock, 'volume') else None,
                            'unit': 'container',
                        },
                        'qty': f"{stock.qty} containers",
                        'administered': f"{actual_used_containers} containers",
                        'wastedDose': f"{str(wasted_doses)} containers",
                        'availableStock': available_stock,
                        'expiryDate': expiry_date.isoformat() if expiry_date else "N/A",
                        'archivedDate': stock.inv_id.updated_at.isoformat() if stock.inv_id and stock.inv_id.updated_at else stock.inv_id.created_at.isoformat() if stock.inv_id else None,
                        'reason': archive_reason,
                        'inv_id': stock.inv_id.inv_id if stock.inv_id else None,
                        'solvent': stock.solvent,
                        'vacStck_id': stock.vacStck_id,
                        'vac_id': stock.vac_id.vac_id if stock.vac_id else None,
                        'qty_number': stock.qty,
                        'isArchived': stock.inv_id.is_Archived if stock.inv_id else False,
                        'created_at': stock.created_at.isoformat() if stock.created_at else None,
                    }
                else:
                    # Regular vaccine handling - qty used = total doses - wasted doses
                    wasted_doses = stock.wasted_dose or 0
                    actual_used_doses = total_doses - wasted_doses
                    
                    item_data = {
                        'type': 'vaccine',
                        'id': stock.vacStck_id,
                        'batchNumber': stock.batch_number or "N/A",
                        'category': 'Vaccine',
                        'item': {
                            'antigen': stock.vac_id.vac_name if stock.vac_id else "Unknown Vaccine",
                            'dosage': stock.dose_ml,
                            'unit': 'ml',
                        },
                        'qty': f"{stock.qty} vials ({total_doses} doses)",
                        'administered': f"{actual_used_doses} doses",
                        'wastedDose': f"{str(wasted_doses)} doses",
                        'availableStock': available_stock,
                        'expiryDate': expiry_date.isoformat() if expiry_date else "N/A",
                        'archivedDate': stock.inv_id.updated_at.isoformat() if stock.inv_id and stock.inv_id.updated_at else stock.inv_id.created_at.isoformat() if stock.inv_id else None,
                        'reason': archive_reason,
                        'solvent': stock.solvent,
                        'inv_id': stock.inv_id.inv_id if stock.inv_id else None,
                        'dose_ml': stock.dose_ml,
                        'vacStck_id': stock.vacStck_id,
                        'dosesPerVial': doses_per_vial,
                        'vac_id': stock.vac_id.vac_id if stock.vac_id else None,
                        'qty_number': stock.qty,
                        'isArchived': stock.inv_id.is_Archived if stock.inv_id else False,
                        'created_at': stock.created_at.isoformat() if stock.created_at else None,
                    }
                
                archived_data.append(item_data)
            
            # Process archived immunization supplies
            for stock in immunization_stocks:
                total_pcs = stock.imzStck_qty * stock.imzStck_pcs
                
                if stock.imzStck_unit == "pcs":
                    qty_display = f"{stock.imzStck_qty} pc/s"
                else:
                    qty_display = f"{stock.imzStck_qty} boxes ({total_pcs} pcs)"
                
                # Calculate available stock
                available_stock = stock.imzStck_avail
                
                # Check expiry status
                expiry_date = stock.inv_id.expiry_date if stock.inv_id else None
                is_expired = expiry_date and expiry_date < today if expiry_date else False
                
                # Determine archive reason
                archive_reason = 'Expired' if is_expired else 'Out of Stock'
                
                # Immunization supplies - qty used = total pieces - wasted pieces
                wasted_pcs = getattr(stock, 'wasted_dose', 0) or 0
                actual_used_pcs = total_pcs - wasted_pcs
                
                item_data = {
                    'type': 'supply',
                    'id': stock.imzStck_id,
                    'batchNumber': stock.batch_number or "N/A",
                    'category': 'Immunization Supplies',
                    'item': {
                        'antigen': stock.imz_id.imz_name if stock.imz_id else "Unknown Supply",
                        'dosage': 1,
                        'unit': stock.imzStck_unit,
                    },
                    'qty': qty_display,
                    'administered': f"{actual_used_pcs} pcs",
                    'wastedDose': str(wasted_pcs),
                    'availableStock': available_stock,
                    'expiryDate': expiry_date.isoformat() if expiry_date else "N/A",
                    'archivedDate': stock.inv_id.updated_at.isoformat() if stock.inv_id and stock.inv_id.updated_at else stock.inv_id.created_at.isoformat() if stock.inv_id else None,
                    'reason': archive_reason,
                    'inv_id': stock.inv_id.inv_id if stock.inv_id else None,
                    'imz_id': stock.imz_id.imz_id if stock.imz_id else None,
                    'imzStck_id': stock.imzStck_id,
                    'imzStck_unit': stock.imzStck_unit,
                    'imzStck_used': stock.imzStck_used or 0,
                    'imzStck_pcs': stock.imzStck_pcs,
                    'qty_number': stock.imzStck_qty,
                    'isArchived': stock.inv_id.is_Archived if stock.inv_id else False,
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
            }, status=status.HTTP_500_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error fetching archived antigens: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)








# WATED-----------------------------------

class WasteRequestMixin:
    def validate_waste_request(self, request):
        wasted_amount = request.data.get('wastedAmount')
        staff_id = request.data.get('staff_id', None)
        
        if not wasted_amount:
            return None, Response(
                {"error": "wastedAmount is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            wasted_amount = int(wasted_amount)
            if wasted_amount <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return None, Response(
                {"error": "wastedAmount must be a positive integer"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return (wasted_amount, staff_id), None

class VaccineWasteView(APIView, WasteRequestMixin):
    def post(self, request, vacStck_id):
        try:
            vaccine_stock = VaccineStock.objects.select_related('inv_id').get(vacStck_id=vacStck_id)
        except VaccineStock.DoesNotExist:
            return Response(
                {"error": "Vaccine stock not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate request data
        data, error_response = self.validate_waste_request(request)
        if error_response:
            return error_response
        
        wasted_amount, staff_id = data
        
        # Check available quantity
        if vaccine_stock.vacStck_qty_avail < wasted_amount:
            return Response(
                {"error": f"Cannot waste {wasted_amount} doses, only {vaccine_stock.vacStck_qty_avail} available"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Update vaccine stock
                vaccine_stock.wasted_dose += wasted_amount
                vaccine_stock.vacStck_qty_avail -= wasted_amount
                vaccine_stock.save()
                
                # Update inventory timestamp - IMPORTANT: This updates the related Inventory object
                vaccine_stock.inv_id.save()  # This will trigger auto_now=True on updated_at
                
                # Create transaction record
                unit = "container/s" if vaccine_stock.solvent == "diluent" else "dose/s"
                AntigenTransaction.objects.create(
                    antt_qty=f"{wasted_amount} {unit}",
                    antt_action="Wasted",
                    vacStck_id=vaccine_stock,
                    staff_id=staff_id
                )
                
                # Return serialized response using your existing serializer
                serializer = VaccineStockSerializer(vaccine_stock)
                
                return Response(
                    {
                        "success": f"Successfully wasted {wasted_amount} {unit} of vaccine",
                        "data": serializer.data
                    },
                    status=status.HTTP_200_OK
                )
                
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class SupplyWasteView(APIView, WasteRequestMixin):
    def post(self, request, imzStck_id):
        try:
            supply_stock = ImmunizationStock.objects.select_related('inv_id').get(imzStck_id=imzStck_id)
        except ImmunizationStock.DoesNotExist:
            return Response(
                {"error": "Supply stock not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate request data
        data, error_response = self.validate_waste_request(request)
        if error_response:
            return error_response
        
        wasted_amount, staff_id = data
        
        # Check available quantity
        if supply_stock.imzStck_avail < wasted_amount:
            return Response(
                {"error": f"Cannot waste {wasted_amount} items, only {supply_stock.imzStck_avail} available"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Update supply stock
                supply_stock.wasted = (supply_stock.wasted or 0) + wasted_amount
                supply_stock.imzStck_avail -= wasted_amount
                supply_stock.save()
                
                # Update inventory timestamp - IMPORTANT: This updates the related Inventory object
                supply_stock.inv_id.save()  # This will trigger auto_now=True on updated_at
                
                # Create transaction record
                unit = "boxes" if supply_stock.imzStck_unit == "boxes" else "pcs"
                AntigenTransaction.objects.create(
                    antt_qty=f"{wasted_amount} {unit}",
                    antt_action="Wasted",
                    imzStck_id=supply_stock,
                    staff_id=staff_id
                )
                
                # Return serialized response using your existing serializer
                serializer = ImmunizationStockSerializer(supply_stock)
                
                return Response(
                    {
                        "success": f"Successfully wasted {wasted_amount} {unit} of supply",
                        "data": serializer.data
                    },
                    status=status.HTTP_200_OK
                )
                
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )






























# ==================VACCINATION/IMMUNIZATION REPORT=======================

class VaccinationSummaryMonthsAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            # Get transactions for both vaccine and immunization
            queryset = AntigenTransaction.objects.all()

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

                # Get unique vaccine items with transactions in this month, excluding expired items
                vaccine_items = VaccineStock.objects.filter(
                    antigen_transactions__created_at__date__gte=start_date,
                    antigen_transactions__created_at__date__lte=end_date
                ).exclude(
                    # Exclude items that expired BEFORE this month
                    inv_id__expiry_date__lt=start_date
                ).distinct().count()

                # Get unique immunization items with transactions in this month, excluding expired items
                immunization_items = ImmunizationStock.objects.filter(
                    antigen_transactions__created_at__date__gte=start_date,
                    antigen_transactions__created_at__date__lte=end_date
                ).exclude(
                    # Exclude items that expired BEFORE this month
                    inv_id__expiry_date__lt=start_date
                ).distinct().count()

                total_items = vaccine_items + immunization_items

                formatted_months.append({
                    'month': month_str,
                    'month_name': month_name,
                    'total_items': total_items,
                    'vaccine_items': vaccine_items,
                    'immunization_items': immunization_items,
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




class MonthlyVaccinationRecordsDetailAPIView(generics.ListAPIView):
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

        # Get unique vaccine + expiry_date + inv_id combos to avoid duplicates
        vaccine_expiry_inv_pairs = AntigenTransaction.objects.filter(
            created_at__date__lte=end_date
        ).exclude(
            # Exclude items that expired BEFORE this month
            vacStck_id__inv_id__expiry_date__lt=start_date
        ).values_list(
            "vacStck_id__vac_id",
            "vacStck_id__inv_id__expiry_date",
            "vacStck_id__inv_id"
        ).distinct()

        # Track unique combinations to avoid duplicates
        seen_vaccine_combinations = set()

        for vac_id, expiry_date, inv_id in vaccine_expiry_inv_pairs:
            # Skip if expiry date is before the current month (already expired)
            if expiry_date and expiry_date < start_date:
                continue
                
            # Create a unique key for this combination
            combo_key = (vac_id, expiry_date, inv_id)
            
            # Skip if we've already processed this combination
            if combo_key in seen_vaccine_combinations:
                continue
                
            seen_vaccine_combinations.add(combo_key)

            # Get the specific vaccine stock
            try:
                vstock = VaccineStock.objects.get(
                    vac_id=vac_id,
                    inv_id__expiry_date=expiry_date,
                    inv_id=inv_id
                )
            except VaccineStock.DoesNotExist:
                continue

            transactions = AntigenTransaction.objects.filter(
                vacStck_id=vstock.vacStck_id
            ).order_by("created_at")

            # Check if this is a vaccine (doses) or diluent
            is_doses = vstock.solvent.lower() != 'diluent'
            dose_ml = vstock.dose_ml if (is_doses and vstock.dose_ml and vstock.dose_ml > 0) else 1

            def calculate_quantities(qs, action):
                return sum(
                    int(re.search(r'\d+', str(t.antt_qty)).group()) if re.search(r'\d+', str(t.antt_qty)) else 0
                    for t in qs.filter(antt_action__icontains=action)
                )

            if is_doses:
                # For vaccine doses
                import math
                
                # Opening balance calculations (before the month)
                opening_vials_added = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "added")
                opening_doses_deducted = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "deduct")
                opening_doses_wasted = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "wasted")
                opening_doses_administered = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "administered")
                
                # Monthly transactions
                monthly_transactions = transactions.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                )
                received_vials = calculate_quantities(monthly_transactions, "added")
                dispensed_doses = calculate_quantities(monthly_transactions, "deduct")
                wasted_doses = calculate_quantities(monthly_transactions, "wasted")
                administered_doses = calculate_quantities(monthly_transactions, "administered")

                # Calculate opening balance - only from previous months
                opening_total_doses = opening_vials_added * dose_ml
                opening_net_doses = opening_total_doses - opening_doses_deducted - opening_doses_wasted - opening_doses_administered
                
                # Calculate actual opening vials for display - use ceil to get minimum vials needed
                if opening_net_doses <= 0:
                    opening_vials_display = 0
                    opening_net_doses = 0
                else:
                    # Use ceil to get minimum vials needed to hold the opening doses
                    opening_vials_display = math.ceil(opening_net_doses / dose_ml)

                # Calculate display values
                received_total_doses = received_vials * dose_ml
                dispensed_vials = math.ceil(dispensed_doses / dose_ml) if dispensed_doses > 0 else 0
                # Wasted doses - no vial calculation needed, just show doses
                administered_vials = math.ceil(administered_doses / dose_ml) if administered_doses > 0 else 0

                # Calculate closing - use actual opening balance, not display opening
                total_available_doses = opening_net_doses + received_total_doses
                closing_doses = total_available_doses - dispensed_doses - wasted_doses - administered_doses
                closing_vials = math.ceil(closing_doses / dose_ml) if closing_doses > 0 else 0

                # Check if expired this month
                expired_this_month = (vstock.inv_id.expiry_date and 
                                    start_date <= vstock.inv_id.expiry_date <= end_date)
                
                # Skip if there's no stock and it's not expiring this month
                # Also include items that expired this month even if closing_doses <= 0
                if (closing_doses <= 0 and 
                    (not expiry_date or expiry_date < start_date) and 
                    not expired_this_month and
                    not monthly_transactions.exists() and
                    not transactions.filter(created_at__date__gte=start_date, created_at__date__lte=end_date).exists()):
                    continue

                # FIXED: Opening only shows remaining from previous months
                if opening_vials_display > 0 and opening_net_doses > 0:
                    opening_display = f"{int(opening_vials_display)} vials - {int(opening_net_doses)} doses"
                else:
                    opening_display = ""

                # Ensure no negative values
                closing_vials = max(0, closing_vials)
                closing_doses = max(0, closing_doses)

                # Format received, dispensed, wasted, and administered - display blank if 0
                received_display = f"{received_vials} vials - {received_total_doses} doses" if received_vials > 0 else ""
                dispensed_display = f"{int(dispensed_vials)} vials - {dispensed_doses} doses" if dispensed_doses > 0 else ""
                # Wasted display - doses only, no vial indicator
                wasted_display = f"{wasted_doses} doses" if wasted_doses > 0 else ""
                administered_display = f"{int(administered_vials)} vials - {administered_doses} doses" if administered_doses > 0 else ""

                # If both closing_vials and closing_doses are 0, display empty string for closing
                if closing_vials == 0 and closing_doses == 0:
                    closing_display = ""
                else:
                    closing_display = f"{int(closing_vials)} vials - {int(closing_doses)} doses"

                item_data = {
                    'id': vstock.vacStck_id,
                    'type': 'vaccine',
                    'name': vstock.vac_id.vac_name,
                    'batch_number': vstock.batch_number,
                    'solvent': vstock.solvent,
                    'opening': opening_display,
                    'received': received_display,
                    'dispensed': dispensed_display,
                    'wasted': wasted_display,
                    'administered': administered_display,
                    'closing': closing_display,
                    'unit': 'doses',
                    'dose_ml': dose_ml,
                    'expiry': vstock.inv_id.expiry_date.strftime('%Y-%m-%d') if vstock.inv_id.expiry_date else None,
                    'expired_this_month': expired_this_month,
                }

            else:
                # For diluent (containers) 
                opening_in = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "added")
                opening_out = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "deduct")
                opening_wasted = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "wasted")
                opening_administered = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "administered")
                
                # Monthly transactions
                monthly_transactions = transactions.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                )
                received_qty = calculate_quantities(monthly_transactions, "added")
                dispensed_qty = calculate_quantities(monthly_transactions, "deduct")
                wasted_qty = calculate_quantities(monthly_transactions, "wasted")
                administered_qty = calculate_quantities(monthly_transactions, "administered")
                
                opening_qty = opening_in - opening_out - opening_wasted - opening_administered
                
                # Calculate closing correctly
                closing_qty = opening_qty + received_qty - dispensed_qty - wasted_qty - administered_qty
                
                # Check if expired this month
                expired_this_month = (vstock.inv_id.expiry_date and 
                                    start_date <= vstock.inv_id.expiry_date <= end_date)
                
                # Skip if there's no stock and it's not expiring this month
                # Also include items that expired this month even if closing_qty <= 0
                if (closing_qty <= 0 and 
                    (not expiry_date or expiry_date < start_date) and 
                    not expired_this_month and
                    not monthly_transactions.exists() and
                    not transactions.filter(created_at__date__gte=start_date, created_at__date__lte=end_date).exists()):
                    continue

                # FIXED: Opening only shows remaining from previous months
                opening_display = opening_qty if opening_qty > 0 else ""

                # Format received, dispensed, wasted, and administered - display blank if 0
                received_display = received_qty if received_qty > 0 else ""
                dispensed_display = dispensed_qty if dispensed_qty > 0 else ""
                # Wasted display - just the quantity for diluent
                wasted_display = wasted_qty if wasted_qty > 0 else ""
                administered_display = administered_qty if administered_qty > 0 else ""

                item_data = {
                    'id': vstock.vacStck_id,
                    'type': 'vaccine',
                    'name': vstock.vac_id.vac_name,
                    'batch_number': vstock.batch_number,
                    'solvent': vstock.solvent,
                    'opening': opening_display,
                    'received': received_display,
                    'dispensed': dispensed_display,
                    'wasted': wasted_display,
                    'administered': administered_display,
                    'closing': closing_qty,
                    'unit': 'container',
                    'expiry': vstock.inv_id.expiry_date.strftime('%Y-%m-%d') if vstock.inv_id.expiry_date else None,
                    'expired_this_month': expired_this_month,
                }

            inventory_summary.append(item_data)

        # Get unique immunization + expiry_date + inv_id combos to avoid duplicates
        immunization_expiry_inv_pairs = AntigenTransaction.objects.filter(
            created_at__date__lte=end_date
        ).exclude(
            # Exclude items that expired BEFORE this month
            imzStck_id__inv_id__expiry_date__lt=start_date
        ).values_list(
            "imzStck_id__imz_id",
            "imzStck_id__inv_id__expiry_date",
            "imzStck_id__inv_id"
        ).distinct()

        # Track unique combinations to avoid duplicates
        seen_immunization_combinations = set()

        for imz_id, expiry_date, inv_id in immunization_expiry_inv_pairs:
            # Skip if expiry date is before the current month (already expired)
            if expiry_date and expiry_date < start_date:
                continue
                
            # Create a unique key for this combination
            combo_key = (imz_id, expiry_date, inv_id)
            
            # Skip if we've already processed this combination
            if combo_key in seen_immunization_combinations:
                continue
                
            seen_immunization_combinations.add(combo_key)

            # Get the specific immunization stock
            try:
                istock = ImmunizationStock.objects.get(
                    imz_id=imz_id,
                    inv_id__expiry_date=expiry_date,
                    inv_id=inv_id
                )
            except ImmunizationStock.DoesNotExist:
                continue

            transactions = AntigenTransaction.objects.filter(
                imzStck_id=istock.imzStck_id
            ).order_by("created_at")

            def calculate_quantities(qs, action):
                return sum(
                    int(re.search(r'\d+', str(t.antt_qty)).group()) if re.search(r'\d+', str(t.antt_qty)) else 0
                    for t in qs.filter(antt_action__icontains=action)
                )

            opening_in = calculate_quantities(
                transactions.filter(created_at__date__lt=start_date), "added")
            opening_out = calculate_quantities(
                transactions.filter(created_at__date__lt=start_date), "deduct")
            opening_wasted = calculate_quantities(
                transactions.filter(created_at__date__lt=start_date), "wasted")
            opening_administered = calculate_quantities(
                transactions.filter(created_at__date__lt=start_date), "administered")

            # Monthly transactions
            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            received_qty = calculate_quantities(monthly_transactions, "added")
            dispensed_qty = calculate_quantities(monthly_transactions, "deduct")
            wasted_qty = calculate_quantities(monthly_transactions, "wasted")
            administered_qty = calculate_quantities(monthly_transactions, "administered")

            opening_qty = opening_in - opening_out - opening_wasted - opening_administered
            
            # Calculate closing correctly
            closing_qty = opening_qty + received_qty - dispensed_qty - wasted_qty - administered_qty
            
            # Check if expired this month
            expired_this_month = (istock.inv_id.expiry_date and 
                                start_date <= istock.inv_id.expiry_date <= end_date)
            
            # Skip if there's no stock and it's not expiring this month
            # Also include items that expired this month even if closing_qty <= 0
            if (closing_qty <= 0 and 
                (not expiry_date or expiry_date < start_date) and 
                not expired_this_month and
                not monthly_transactions.exists() and
                not transactions.filter(created_at__date__gte=start_date, created_at__date__lte=end_date).exists()):
                continue

            if istock.imzStck_unit.lower() == "boxes":
                pcs_per_box = istock.imzStck_per_pcs or 1
                opening_qty *= pcs_per_box
                received_qty *= pcs_per_box
                dispensed_qty *= pcs_per_box
                wasted_qty *= pcs_per_box
                administered_qty *= pcs_per_box

            # FIXED: Opening only shows remaining from previous months
            opening_display = opening_qty if opening_qty > 0 else ""

            # Format received, dispensed, wasted, and administered - display blank if 0
            received_display = received_qty if received_qty > 0 else ""
            dispensed_display = dispensed_qty if dispensed_qty > 0 else ""
            # Wasted display - just the quantity for immunizations
            wasted_display = wasted_qty if wasted_qty > 0 else ""
            administered_display = administered_qty if administered_qty > 0 else ""

            inventory_summary.append({
                'id': istock.imzStck_id,
                'type': 'immunization',
                'name': istock.imz_id.imz_name,
                'qty': istock.imzStck_qty,
                'batch_number': istock.batch_number,
                'opening': opening_display,
                'received': received_display,
                'dispensed': dispensed_display,
                'wasted': wasted_display,
                'administered': administered_display,
                'closing': closing_qty,
                'unit': 'pcs',
                'expiry': istock.inv_id.expiry_date.strftime('%Y-%m-%d') if istock.inv_id.expiry_date else None,
                'expired_this_month': expired_this_month,
            })

        return Response({
            'success': True,
            'data': {
                'month': month_str,
                'inventory_summary': inventory_summary,
                'total_items': len(inventory_summary),
                'vaccine_items': len([x for x in inventory_summary if x['type'] == 'vaccine']),
                'immunization_items': len([x for x in inventory_summary if x['type'] == 'immunization']),
            }
        })
#==========EXPIRED OUTOFSTOCK REPORT==========================
# Vaccination Expired/Out-of-Stock Summary API View
class VaccinationExpiredOutOfStockSummaryAPIView(APIView):
    pagination_class = StandardResultsPagination

    def _parse_qty(self, transaction, is_vaccine=False, multiply_doses=False):
        """Extract numeric value from antt_qty and convert vials to doses if needed."""
        match = re.search(r'\d+', str(transaction.antt_qty))
        qty_num = int(match.group()) if match else 0
        
        # For vaccine doses, multiply by dose_ml if needed
        if is_vaccine and multiply_doses and transaction.vacStck_id:
            dose_ml = transaction.vacStck_id.dose_ml or 1
            qty_num *= dose_ml
            
        return qty_num

    def get(self, request):
        try:
            # Get distinct months from antigen transactions
            distinct_months = AntigenTransaction.objects.annotate(
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

                # Get all vaccine inventory items that were active up to this month
                vaccine_expiry_inv_pairs = AntigenTransaction.objects.filter(
                    created_at__date__lte=end_date,
                    vacStck_id__isnull=False
                ).values_list(
                    "vacStck_id__vac_id",
                    "vacStck_id__inv_id__expiry_date",
                    "vacStck_id__inv_id"
                ).distinct()

                # Get all immunization inventory items that were active up to this month
                immunization_expiry_inv_pairs = AntigenTransaction.objects.filter(
                    created_at__date__lte=end_date,
                    imzStck_id__isnull=False
                ).values_list(
                    "imzStck_id__imz_id",
                    "imzStck_id__inv_id__expiry_date",
                    "imzStck_id__inv_id"
                ).distinct()

                expired_count = 0
                out_of_stock_count = 0
                expired_out_of_stock_count = 0
                near_expiry_count = 0

                seen_combinations = set()

                # Process vaccine items
                for vac_id, expiry_date, inv_id in vaccine_expiry_inv_pairs:
                    combo_key = ('vaccine', vac_id, expiry_date, inv_id)
                    if combo_key in seen_combinations:
                        continue
                    seen_combinations.add(combo_key)

                    if not expiry_date:
                        continue

                    if expiry_date < start_date:
                        continue

                    transactions = AntigenTransaction.objects.filter(
                        vacStck_id__vac_id=vac_id,
                        vacStck_id__inv_id__expiry_date=expiry_date,
                        vacStck_id__inv_id=inv_id
                    ).order_by("created_at")

                    try:
                        vstock = VaccineStock.objects.get(
                            vac_id=vac_id,
                            inv_id__expiry_date=expiry_date,
                            inv_id=inv_id
                        )
                    except VaccineStock.DoesNotExist:
                        continue

                    # Check if this is a vaccine (doses) or diluent
                    is_doses = vstock.solvent.lower() != 'diluent'
                    dose_ml = vstock.dose_ml if (is_doses and vstock.dose_ml and vstock.dose_ml > 0) else 1

                    # Calculate stock levels
                    opening_in = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="added")
                    opening_out = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="deduct")
                    opening_wasted = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="wasted")
                    opening_administered = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="administered")
                    
                    opening_qty = (sum(self._parse_qty(t, is_vaccine=True, multiply_doses=True) for t in opening_in) - 
                                 sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in opening_out) -
                                 sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in opening_wasted) -
                                 sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in opening_administered))

                    monthly_transactions = transactions.filter(
                        created_at__date__gte=start_date,
                        created_at__date__lte=end_date
                    )
                    received_qty = sum(self._parse_qty(t, is_vaccine=True, multiply_doses=True) for t in monthly_transactions.filter(antt_action__icontains="added"))
                    dispensed_qty = sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in monthly_transactions.filter(antt_action__icontains="deduct"))
                    wasted_qty = sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in monthly_transactions.filter(antt_action__icontains="wasted"))
                    administered_qty = sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in monthly_transactions.filter(antt_action__icontains="administered"))

                    closing_qty = opening_qty + received_qty - dispensed_qty - wasted_qty - administered_qty

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

                # Process immunization items
                for imz_id, expiry_date, inv_id in immunization_expiry_inv_pairs:
                    combo_key = ('immunization', imz_id, expiry_date, inv_id)
                    if combo_key in seen_combinations:
                        continue
                    seen_combinations.add(combo_key)

                    if not expiry_date:
                        continue

                    if expiry_date < start_date:
                        continue

                    transactions = AntigenTransaction.objects.filter(
                        imzStck_id__imz_id=imz_id,
                        imzStck_id__inv_id__expiry_date=expiry_date,
                        imzStck_id__inv_id=inv_id
                    ).order_by("created_at")

                    try:
                        istock = ImmunizationStock.objects.get(
                            imz_id=imz_id,
                            inv_id__expiry_date=expiry_date,
                            inv_id=inv_id
                        )
                    except ImmunizationStock.DoesNotExist:
                        continue

                    # Calculate stock levels
                    opening_in = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="added")
                    opening_out = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="deduct")
                    opening_wasted = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="wasted")
                    opening_administered = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="administered")
                    
                    opening_qty = (sum(self._parse_qty(t) for t in opening_in) - 
                                 sum(self._parse_qty(t) for t in opening_out) -
                                 sum(self._parse_qty(t) for t in opening_wasted) -
                                 sum(self._parse_qty(t) for t in opening_administered))

                    monthly_transactions = transactions.filter(
                        created_at__date__gte=start_date,
                        created_at__date__lte=end_date
                    )
                    received_qty = sum(self._parse_qty(t) for t in monthly_transactions.filter(antt_action__icontains="added"))
                    dispensed_qty = sum(self._parse_qty(t) for t in monthly_transactions.filter(antt_action__icontains="deduct"))
                    wasted_qty = sum(self._parse_qty(t) for t in monthly_transactions.filter(antt_action__icontains="wasted"))
                    administered_qty = sum(self._parse_qty(t) for t in monthly_transactions.filter(antt_action__icontains="administered"))

                    closing_qty = opening_qty + received_qty - dispensed_qty - wasted_qty - administered_qty

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

# Monthly Vaccination Expired/Out-of-Stock Detail API View
class MonthlyVaccinationExpiredOutOfStockDetailAPIView(APIView):
    pagination_class = StandardResultsPagination

    def _parse_qty(self, transaction, is_vaccine=False, multiply_doses=False):
        """Extract numeric value from antt_qty and convert vials to doses if needed."""
        match = re.search(r'\d+', str(transaction.antt_qty))
        qty_num = int(match.group()) if match else 0
        
        # For vaccine doses, multiply by dose_ml if needed
        if is_vaccine and multiply_doses and transaction.vacStck_id:
            dose_ml = transaction.vacStck_id.dose_ml or 1
            qty_num *= dose_ml
            
        return qty_num

    def _format_quantity_display(self, quantity, dose_ml, solvent):
        """Format quantity display like '2 vials - 10 doses'"""
        if dose_ml <= 1:
            return f"{quantity} {solvent}"
        
        # Calculate vials and remaining doses
        vials = quantity // dose_ml
        remaining_doses = quantity % dose_ml
        
        if vials > 0 and remaining_doses > 0:
            return f"{vials} vials - {remaining_doses} doses"
        elif vials > 0:
            return f"{vials} vials - {vials * dose_ml} doses"
        elif remaining_doses > 0:
            return f"1 vial - {remaining_doses} doses"
        else:
            return ""

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
        near_expiry_items = []
        low_stock_items = []

        # Get all vaccine inventory items that were active up to this month
        vaccine_expiry_inv_pairs = AntigenTransaction.objects.filter(
            created_at__date__lte=end_date,
            vacStck_id__isnull=False
        ).values_list(
            "vacStck_id__vac_id",
            "vacStck_id__inv_id__expiry_date",
            "vacStck_id__inv_id"
        ).distinct()

        seen_combinations = set()

        # Process vaccine items
        for vac_id, expiry_date, inv_id in vaccine_expiry_inv_pairs:
            combo_key = ('vaccine', vac_id, expiry_date, inv_id)
            if combo_key in seen_combinations:
                continue
            seen_combinations.add(combo_key)

            if not expiry_date:
                continue

            if expiry_date < start_date:
                continue

            try:
                vstock = VaccineStock.objects.get(
                    vac_id=vac_id,
                    inv_id__expiry_date=expiry_date,
                    inv_id=inv_id
                )
            except VaccineStock.DoesNotExist:
                continue

            transactions = AntigenTransaction.objects.filter(
                vacStck_id__vac_id=vac_id,
                vacStck_id__inv_id__expiry_date=expiry_date,
                vacStck_id__inv_id=inv_id
            ).order_by("created_at")

            # Check if this is a vaccine (doses) or diluent
            is_doses = vstock.solvent.lower() != 'diluent'
            dose_ml = vstock.dose_ml if (is_doses and vstock.dose_ml and vstock.dose_ml > 0) else 1

            # Calculate stock levels - CORRECTED LOGIC
            # OPENING: Only from previous months (before start_date)
            opening_in = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="added")
            opening_out = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="deduct")
            opening_wasted = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="wasted")
            opening_administered = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="administered")
            
            opening_qty = (sum(self._parse_qty(t, is_vaccine=True, multiply_doses=True) for t in opening_in) - 
                         sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in opening_out) -
                         sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in opening_wasted) -
                         sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in opening_administered))

            # RECEIVED: Only during current month (between start_date and end_date)
            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            received_qty = sum(self._parse_qty(t, is_vaccine=True, multiply_doses=True) for t in monthly_transactions.filter(antt_action__icontains="added"))
            dispensed_qty = sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in monthly_transactions.filter(antt_action__icontains="deduct"))
            wasted_qty = sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in monthly_transactions.filter(antt_action__icontains="wasted"))
            administered_qty = sum(self._parse_qty(t, is_vaccine=True, multiply_doses=False) for t in monthly_transactions.filter(antt_action__icontains="administered"))

            closing_qty = opening_qty + received_qty - dispensed_qty - wasted_qty - administered_qty

            # Check conditions for status
            is_expired = start_date <= expiry_date <= end_date
            is_out_of_stock = closing_qty <= 0
            is_near_expiry = (end_date < expiry_date <= near_expiry_threshold) and closing_qty > 0
            # Low stock: 20 doses left for vaccines, 10 containers left for immunizations
            is_low_stock = (is_doses and closing_qty <= 20 and closing_qty > 0) or (not is_doses and closing_qty <= 10 and closing_qty > 0)

            # Determine final status (priority: expired > out of stock > near expiry > low stock)
            if is_expired and is_out_of_stock:
                status = "Expired & Out of Stock"
            elif is_expired:
                status = "Expired"
            elif is_out_of_stock:
                status = "Out of Stock"
            elif is_near_expiry:
                status = "Near Expiry"
            elif is_low_stock:
                status = "Low Stock"
            else:
                status = "Active"

            # Format quantities for display - CORRECTED: Opening vs Received
            if is_doses:
                # For vaccine doses - format with vials and doses
                opening_display = self._format_quantity_display(opening_qty, dose_ml, vstock.solvent) if opening_qty > 0 else ""
                received_display = self._format_quantity_display(received_qty, dose_ml, vstock.solvent) if received_qty > 0 else ""
                dispensed_display = self._format_quantity_display(dispensed_qty, dose_ml, vstock.solvent) if dispensed_qty > 0 else ""
                wasted_display = self._format_quantity_display(wasted_qty, dose_ml, vstock.solvent) if wasted_qty > 0 else ""
                administered_display = self._format_quantity_display(administered_qty, dose_ml, vstock.solvent) if administered_qty > 0 else ""
                closing_display = self._format_quantity_display(closing_qty, dose_ml, vstock.solvent) if closing_qty > 0 else "0 doses"
            else:
                # For diluent - simple quantity display
                opening_display = f"{opening_qty} {vstock.solvent}" if opening_qty > 0 else ""
                received_display = f"{received_qty} {vstock.solvent}" if received_qty > 0 else ""
                dispensed_display = f"{dispensed_qty} {vstock.solvent}" if dispensed_qty > 0 else ""
                wasted_display = f"{wasted_qty} {vstock.solvent}" if wasted_qty > 0 else ""
                administered_display = f"{administered_qty} {vstock.solvent}" if administered_qty > 0 else ""
                closing_display = f"{closing_qty} {vstock.solvent}" if closing_qty > 0 else f"0 {vstock.solvent}"

            item_data = {
                'id': vstock.vacStck_id,
                'type': 'vaccine',
                'name': vstock.vac_id.vac_name,
                'batch_number': vstock.batch_number,
                'solvent': vstock.solvent,
                'opening': opening_display,
                'received': received_display,
                'dispensed': dispensed_display,
                'wasted': wasted_display,
                'administered': administered_display,
                'closing': closing_display,
                'unit': 'doses' if is_doses else 'container',
                'dose_ml': dose_ml,
                'expiry': expiry_date.strftime('%Y-%m-%d') if expiry_date else None,
                'expired_this_month': is_expired,
                'status': status
            }

            # Categorize items for the summary (only problem items)
            if status != "Active":
                if status == "Expired & Out of Stock":
                    expired_out_of_stock_items.append(item_data)
                elif status == "Expired":
                    expired_items.append(item_data)
                elif status == "Out of Stock":
                    out_of_stock_items.append(item_data)
                elif status == "Near Expiry":
                    near_expiry_items.append(item_data)
                elif status == "Low Stock":
                    low_stock_items.append(item_data)

        # Get all immunization inventory items that were active up to this month
        immunization_expiry_inv_pairs = AntigenTransaction.objects.filter(
            created_at__date__lte=end_date,
            imzStck_id__isnull=False
        ).values_list(
            "imzStck_id__imz_id",
            "imzStck_id__inv_id__expiry_date",
            "imzStck_id__inv_id"
        ).distinct()

        # Process immunization items
        for imz_id, expiry_date, inv_id in immunization_expiry_inv_pairs:
            combo_key = ('immunization', imz_id, expiry_date, inv_id)
            if combo_key in seen_combinations:
                continue
            seen_combinations.add(combo_key)

            if not expiry_date:
                continue

            if expiry_date < start_date:
                continue

            try:
                istock = ImmunizationStock.objects.get(
                    imz_id=imz_id,
                    inv_id__expiry_date=expiry_date,
                    inv_id=inv_id
                )
            except ImmunizationStock.DoesNotExist:
                continue

            transactions = AntigenTransaction.objects.filter(
                imzStck_id__imz_id=imz_id,
                imzStck_id__inv_id__expiry_date=expiry_date,
                imzStck_id__inv_id=inv_id
            ).order_by("created_at")

            # Calculate stock levels - CORRECTED LOGIC
            # OPENING: Only from previous months (before start_date)
            opening_in = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="added")
            opening_out = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="deduct")
            opening_wasted = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="wasted")
            opening_administered = transactions.filter(created_at__date__lt=start_date, antt_action__icontains="administered")
            
            opening_qty = (sum(self._parse_qty(t) for t in opening_in) - 
                         sum(self._parse_qty(t) for t in opening_out) -
                         sum(self._parse_qty(t) for t in opening_wasted) -
                         sum(self._parse_qty(t) for t in opening_administered))

            # RECEIVED: Only during current month (between start_date and end_date)
            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            received_qty = sum(self._parse_qty(t) for t in monthly_transactions.filter(antt_action__icontains="added"))
            dispensed_qty = sum(self._parse_qty(t) for t in monthly_transactions.filter(antt_action__icontains="deduct"))
            wasted_qty = sum(self._parse_qty(t) for t in monthly_transactions.filter(antt_action__icontains="wasted"))
            administered_qty = sum(self._parse_qty(t) for t in monthly_transactions.filter(antt_action__icontains="administered"))

            closing_qty = opening_qty + received_qty - dispensed_qty - wasted_qty - administered_qty

            # Check conditions for status
            is_expired = start_date <= expiry_date <= end_date
            is_out_of_stock = closing_qty <= 0
            is_near_expiry = (end_date < expiry_date <= near_expiry_threshold) and closing_qty > 0
            # Low stock: 10 containers left for immunizations
            is_low_stock = closing_qty <= 10 and closing_qty > 0

            # Determine final status (priority: expired > out of stock > near expiry > low stock)
            if is_expired and is_out_of_stock:
                status = "Expired & Out of Stock"
            elif is_expired:
                status = "Expired"
            elif is_out_of_stock:
                status = "Out of Stock"
            elif is_near_expiry:
                status = "Near Expiry"
            elif is_low_stock:
                status = "Low Stock"
            else:
                status = "Active"

            # Format quantities for immunizations - CORRECTED: Opening vs Received
            opening_display = f"{opening_qty} pcs" if opening_qty > 0 else ""
            received_display = f"{received_qty} pcs" if received_qty > 0 else ""
            dispensed_display = f"{dispensed_qty} pcs" if dispensed_qty > 0 else ""
            wasted_display = f"{wasted_qty} pcs" if wasted_qty > 0 else ""
            administered_display = f"{administered_qty} pcs" if administered_qty > 0 else ""
            closing_display = f"{closing_qty} pcs" if closing_qty > 0 else "0 pcs"

            item_data = {
                'id': istock.imzStck_id,
                'type': 'immunization',
                'name': istock.imz_id.imz_name,
                'batch_number': istock.batch_number,
                'solvent': 'pcs',
                'opening': opening_display,
                'received': received_display,
                'dispensed': dispensed_display,
                'wasted': wasted_display,
                'administered': administered_display,
                'closing': closing_display,
                'unit': 'pcs',
                'dose_ml': 1,
                'expiry': expiry_date.strftime('%Y-%m-%d') if expiry_date else None,
                'expired_this_month': is_expired,
                'status': status
            }

            # Categorize items for the summary (only problem items)
            if status != "Active":
                if status == "Expired & Out of Stock":
                    expired_out_of_stock_items.append(item_data)
                elif status == "Expired":
                    expired_items.append(item_data)
                elif status == "Out of Stock":
                    out_of_stock_items.append(item_data)
                elif status == "Near Expiry":
                    near_expiry_items.append(item_data)
                elif status == "Low Stock":
                    low_stock_items.append(item_data)

        # Combine all problem items (excluding "Active" status)
        all_problem_items = expired_items + out_of_stock_items + expired_out_of_stock_items + near_expiry_items + low_stock_items

        return Response({
            'success': True,
            'data': {
                'month': month_str,
                'summary': {
                    'total_problems': len(all_problem_items),
                    'expired_count': len(expired_items),
                    'out_of_stock_count': len(out_of_stock_items),
                    'expired_out_of_stock_count': len(expired_out_of_stock_items),
                    'near_expiry_count': len(near_expiry_items),
                    'low_stock_count': len(low_stock_items),
                },
                'expired_items': expired_items,
                'out_of_stock_items': out_of_stock_items,
                'expired_out_of_stock_items': expired_out_of_stock_items,
                'near_expiry_items': near_expiry_items,
                'low_stock_items': low_stock_items,
                'all_problem_items': all_problem_items
            }
        })