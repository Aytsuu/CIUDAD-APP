
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
from utils.create_notification import NotificationQueries

   
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
        old_status = instance.status
        new_status = request.data.get('status')
        
        # Check if we're updating status to rejected
        if new_status == 'rejected':
            archive_reason = request.data.get('archive_reason', '')
            instance.status = 'rejected'
            instance.is_archived = True
            instance.archive_reason = archive_reason
            instance.save()
            
            # Send notification for rejected status
            self.send_status_notification(instance.medreq_id, 'rejected', archive_reason)
            
        else:
            # For other updates, use default behavior
            response = super().update(request, *args, **kwargs)
            
            # Send notification if status changed
            if new_status and new_status != old_status:
                self.send_status_notification(instance.medreq_id, new_status)
            
            return response
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def send_status_notification(self, medicine_request, new_status, reason=None):
        """Helper method to send status change notifications"""
        try:
            # Use the notification function we created above
            from .utils import send_medicine_status_notification  # You might want to create a utils file
            send_medicine_status_notification(medicine_request, new_status, reason)
        except Exception as e:
            logger.error(f"Error sending status notification: {str(e)}")
        
        


# class UpdateConfirmAllPendingItemsView(APIView):  # Change from UpdateAPIView to APIView
#     @transaction.atomic
#     def post(self, request, *args, **kwargs):  # Use POST method instead of PATCH
#         try:
#             medreq_id = request.data.get('medreq_id')
#             selected_medicines = request.data.get('selected_medicines', [])
#             staff_id = request.data.get('staff_id')
#             pat_id_str = request.data.get('pat_id')
            
#             print(f"Selected medicines: {len(selected_medicines)}")
            
#             if not medreq_id:
#                 return Response({"error": "Medicine Request ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
#             if not selected_medicines or not isinstance(selected_medicines, list):
#                 return Response({"error": "Selected medicines list is required"}, status=status.HTTP_400_BAD_REQUEST)
            
#             if not pat_id_str:
#                 return Response({"error": "Patient ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
#             try:
#                 medicine_request = MedicineRequest.objects.get(medreq_id=medreq_id)
#             except MedicineRequest.DoesNotExist:
#                 return Response({"error": "Medicine Request not found"}, status=status.HTTP_404_NOT_FOUND) 
            
#             # Get Patient instance (just for validation)
#             try:
#                 patient_instance = Patient.objects.get(pat_id=pat_id_str)
#             except Patient.DoesNotExist:
#                 return Response({
#                     "error": f"Patient with ID {pat_id_str} not found"
#                 }, status=status.HTTP_404_NOT_FOUND)
            
#             # Get Staff instance if staff_id is provided
#             staff_instance = None
#             if staff_id:
#                 try:
#                     staff_instance = Staff.objects.get(staff_id=staff_id)
#                 except Staff.DoesNotExist:
#                     print(f"Staff with ID {staff_id} not found, continuing without staff")
            
#             allocations_created = 0
            
#             # Process each selected medicine
#             for medicine in selected_medicines:
#                 minv_id = medicine.get('minv_id')
#                 medrec_qty = medicine.get('medrec_qty', 0)
#                 medreqitem_id = medicine.get('medreqitem_id')
#                 reason = medicine.get('reason', 'Medicine allocation')
                
#                 if not minv_id or medrec_qty <= 0:
#                     continue
                
#                 try:
#                     # Get the medicine inventory
#                     medicine_inventory = MedicineInventory.objects.get(minv_id=minv_id)
                    
#                     # Check if there's enough available stock
#                     if medicine_inventory.minv_qty_avail < medrec_qty:
#                         return Response({
#                             "error": f"Insufficient stock for {medicine_inventory.med_id.med_name}. Available: {medicine_inventory.minv_qty_avail}, Requested: {medrec_qty}"
#                         }, status=status.HTTP_400_BAD_REQUEST)
                    
#                     # Get and update request item
#                     try:
#                         request_item = MedicineRequestItem.objects.get(
#                             medreqitem_id=medreqitem_id,
#                             medreq_id=medicine_request
#                         )
#                         # Update status to confirmed
#                         request_item.status = 'confirmed'
#                         request_item.save()
#                     except MedicineRequestItem.DoesNotExist:
#                         return Response({
#                             "error": f"Medicine request item with ID {medreqitem_id} not found"
#                         }, status=status.HTTP_404_NOT_FOUND)
                    
#                     # Create medicine allocation (ONLY THIS - no medicine records)
#                     MedicineAllocation.objects.create(
#                         medreqitem=request_item,
#                         minv=medicine_inventory,
#                         allocated_qty=medrec_qty
#                     )
#                     allocations_created += 1
                    
#                     # SIMPLIFIED: Just add to temporary allocation - NO DEDUCTION from main stock
#                     medicine_inventory.temporary_deduction += medrec_qty
#                     medicine_inventory.save()
                    
#                     print(f"Added temporary allocation for {medicine_inventory.med_id.med_name}: "
#                           f"Qty={medrec_qty}, Temp Allocation={medicine_inventory.temporary_deduction}, "
#                           f"Main Stock Remains={medicine_inventory.minv_qty_avail}")
                    
#                 except MedicineInventory.DoesNotExist:
#                     return Response({
#                         "error": f"Medicine inventory with ID {minv_id} not found"
#                     }, status=status.HTTP_404_NOT_FOUND)
#                 except Exception as e:
#                     return Response({
#                         "error": f"Error processing medicine {minv_id}: {str(e)}"
#                     }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             # Update medicine request status to confirmed
#             medicine_request.status = 'confirmed'
#             medicine_request.save()
            
#             response_data = {
#                 "success": True,
#                 "message": f"Medicine request confirmed successfully",
#                 "medreq_id": medreq_id,
#                 "allocations_created": allocations_created,
#                 "pat_id": pat_id_str,
#                 "total_allocated_qty": sum(med.get('medrec_qty', 0) for med in selected_medicines)
#             }
            
#             return Response(response_data, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             print(f"Unexpected error: {str(e)}")
#             return Response({
#                 "error": f"An error occurred: {str(e)}"
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateConfirmAllPendingItemsView(APIView):
    @transaction.atomic
    def post(self, request, *args, **kwargs):
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
            confirmed_medicines = []  # Track confirmed medicines for notification
            
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
                        
                        # Add to confirmed medicines list for notification
                        confirmed_medicines.append({
                            'medicine_name': medicine_inventory.med_id.med_name,
                            'quantity': medrec_qty
                        })
                        
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
            
            # ✅ CREATE NOTIFICATION FOR RESIDENT
            self.create_medicine_ready_notification(medicine_request, confirmed_medicines)
            
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
    
    def create_medicine_ready_notification(self, medicine_request, confirmed_medicines):
        try:
            notifier = NotificationQueries()
            
            # Determine recipient (resident)
            recipient_rp_ids = []
            resident_name = "Resident"
            
            if medicine_request.rp_id:
                # Direct resident request
                recipient_rp_ids = [str(medicine_request.rp_id.rp_id)]
                if medicine_request.rp_id.per:
                    resident_name = f"{medicine_request.rp_id.per.per_fname} {medicine_request.rp_id.per.per_lname}"
            elif medicine_request.pat_id and medicine_request.pat_id.rp_id:
                # Patient with resident profile
                recipient_rp_ids = [str(medicine_request.pat_id.rp_id.rp_id)]
                if medicine_request.pat_id.rp_id.per:
                    resident_name = f"{medicine_request.pat_id.rp_id.per.per_fname} {medicine_request.pat_id.rp_id.per.per_lname}"
            
            if not recipient_rp_ids:
                print("⚠️ No recipient found for medicine ready notification")
                return
            
            # Create medicine list for message
            medicine_list = ", ".join([f"{med['medicine_name']}" for med in confirmed_medicines])
            
            # Create notification
            success = notifier.create_notification(
                title="Medicine request ready for pickup",
                message=(
                    f"Medicines: {medicine_list}. "
                    "Please note that if you do not pick up your medicine within 2 days, "
                    "your request will be automatically cancelled."
                ),
                sender="00001250924",  # System sender
                recipients=recipient_rp_ids,
                notif_type="MEDICINE_READY",
                target_obj=None,
                web_route="/services/medicine/requests",
                web_params={"request_id": str(medicine_request.medreq_id)},
                mobile_route="/(health)/medicine-request/my-requests",
                mobile_params={"request_id": str(medicine_request.medreq_id)},
            )

            if success:
                print(f"✅ Medicine ready notification sent to {resident_name}")
            else:
                print(f"❌ Failed to send medicine ready notification to {resident_name}")
                
        except Exception as e:
            print(f"❌ Error creating medicine ready notification: {e}")
