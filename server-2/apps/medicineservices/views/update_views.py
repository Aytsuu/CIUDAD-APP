
from apps.medicineservices.models import MedicineRequestItem, MedicineRequest
from apps.medicineservices.serializers import MedicineRequestItemSerializer
from apps.medicineservices.serializers import MedicineRecordCreateSerializer,MedicineRequestSerializer
from apps.patientrecords.models import PatientRecord, Patient
from apps.childhealthservices.models import ChildHealth_History, ChildHealthSupplements
from apps.medicineservices.models import MedicineRecord,MedicineAllocation
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.utils import timezone
from apps.inventory.models import MedicineInventory
from apps.administration.models import Staff
from rest_framework.views import APIView
   
class UpdateMedicineRequestView(generics.RetrieveUpdateAPIView):
    serializer_class = MedicineRequestSerializer 
    queryset = MedicineRequest.objects.all()
    lookup_field = "medreq_id"


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
        
        


class UpdateConfirmAllPendingItemsView(APIView):  # Change from UpdateAPIView to APIView
    @transaction.atomic
    def post(self, request, *args, **kwargs):  # Use POST method instead of PATCH
        try:
            medreq_id = request.data.get('medreq_id')
            selected_medicines = request.data.get('selected_medicines', [])
            staff_id = request.data.get('staff_id')
            pat_id_str = request.data.get('pat_id')
            
            print(f"Selected medicines: {len(selected_medicines)}")
            
            if not medreq_id:
                return Response({"error": "Medicine Request ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not selected_medicines or not isinstance(selected_medicines, list):
                return Response({"error": "Selected medicines list is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not pat_id_str:
                return Response({"error": "Patient ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                medicine_request = MedicineRequest.objects.get(medreq_id=medreq_id)
            except MedicineRequest.DoesNotExist:
                return Response({"error": "Medicine Request not found"}, status=status.HTTP_404_NOT_FOUND) 
            
            # Get Patient instance (just for validation)
            try:
                patient_instance = Patient.objects.get(pat_id=pat_id_str)
            except Patient.DoesNotExist:
                return Response({
                    "error": f"Patient with ID {pat_id_str} not found"
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get Staff instance if staff_id is provided
            staff_instance = None
            if staff_id:
                try:
                    staff_instance = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {staff_id} not found, continuing without staff")
            
            allocations_created = 0
            
            # Process each selected medicine
            for medicine in selected_medicines:
                minv_id = medicine.get('minv_id')
                medrec_qty = medicine.get('medrec_qty', 0)
                medreqitem_id = medicine.get('medreqitem_id')
                reason = medicine.get('reason', 'Medicine allocation')
                
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
                    
                    # Get and update request item
                    try:
                        request_item = MedicineRequestItem.objects.get(
                            medreqitem_id=medreqitem_id,
                            medreq_id=medicine_request
                        )
                        # Update status to confirmed
                        request_item.status = 'confirmed'
                        request_item.save()
                    except MedicineRequestItem.DoesNotExist:
                        return Response({
                            "error": f"Medicine request item with ID {medreqitem_id} not found"
                        }, status=status.HTTP_404_NOT_FOUND)
                    
                    # Create medicine allocation (ONLY THIS - no medicine records)
                    MedicineAllocation.objects.create(
                        medreqitem=request_item,
                        minv=medicine_inventory,
                        allocated_qty=medrec_qty
                    )
                    allocations_created += 1
                    
                    # SIMPLIFIED: Just add to temporary allocation - NO DEDUCTION from main stock
                    medicine_inventory.temporary_deduction += medrec_qty
                    medicine_inventory.save()
                    
                    print(f"Added temporary allocation for {medicine_inventory.med_id.med_name}: "
                          f"Qty={medrec_qty}, Temp Allocation={medicine_inventory.temporary_deduction}, "
                          f"Main Stock Remains={medicine_inventory.minv_qty_avail}")
                    
                except MedicineInventory.DoesNotExist:
                    return Response({
                        "error": f"Medicine inventory with ID {minv_id} not found"
                    }, status=status.HTTP_404_NOT_FOUND)
                except Exception as e:
                    return Response({
                        "error": f"Error processing medicine {minv_id}: {str(e)}"
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Update medicine request status to confirmed
            medicine_request.status = 'confirmed'
            medicine_request.save()
            
            response_data = {
                "success": True,
                "message": f"Medicine request confirmed successfully",
                "medreq_id": medreq_id,
                "allocations_created": allocations_created,
                "pat_id": pat_id_str,
                "total_allocated_qty": sum(med.get('medrec_qty', 0) for med in selected_medicines)
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)