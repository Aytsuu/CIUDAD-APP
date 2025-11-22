from apps.medicineservices.models import MedicineRequestItem, MedicineRequest
from apps.medicineservices.serializers import MedicineRequestItemSerializer
from apps.medicineservices.serializers import MedicineRecordCreateSerializer, MedicineRequestSerializer
from apps.patientrecords.models import PatientRecord, Patient
from apps.childhealthservices.models import ChildHealth_History, ChildHealthSupplements
from apps.medicineservices.models import MedicineRecord, MedicineAllocation
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.utils import timezone
from apps.inventory.models import MedicineInventory
from apps.administration.models import Staff
from rest_framework.views import APIView
from utils.create_notification import NotificationQueries


def send_medicine_status_notification(medicine_request_item, new_status, reason=None):
    try:
        notifier = NotificationQueries()
        
        # Determine recipient (resident)
        recipient_rp_ids = []
        resident_name = "Resident"
        
        medicine_request = medicine_request_item.medreq_id
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
            print(f"⚠️ No recipient found for medicine request notification for request item {medicine_request_item.medreqitem_id}")
            return False
        
        # Different messages based on status
        status_messages = {
            'rejected': {
                'title': 'Medicine Request Rejected',
                'message': f'Your medicine request for {medicine_request_item.med.med_name} {medicine_request_item.med.med_dsg} {medicine_request_item.med.med_dsg_unit} {medicine_request_item.med.med_form} was rejected. Reason: {reason or ""}'
            },
            'referred': {
                'title': 'Medicine Request Referred',
                'message': f'Your medicine request for {medicine_request_item.med.med_name} {medicine_request_item.med.med_dsg} {medicine_request_item.med.med_dsg_unit} {medicine_request_item.med.med_form}has been referred. Reason: {reason or ""}'
            },
            'confirmed': {
                'title': 'Medicine Request Confirmed',
                'message': f'Your medicine request for {medicine_request_item.med.med_name} {medicine_request_item.med.med_dsg} {medicine_request_item.med.med_dsg_unit} {medicine_request_item.med.med_form} has been confirmed. Please proceed to the health center to pick up your medicine.'
            }
        }
                
        message_info = status_messages.get(new_status)
        if not message_info:
            print(f"No message template for status: {new_status}")
            return False
        
        # Create notification
        success = notifier.create_notification(
            title=message_info['title'],
            message=message_info['message'],
            # sender="00001250924",  # System sender
            recipients=recipient_rp_ids,
            notif_type="REQUEST",
            # target_obj=None,
            web_route="/services/medicine-request",
            web_params={"request_id": str(medicine_request.medreq_id), "status": new_status},
            mobile_route="/(health)/medicine-request/my-requests",
            mobile_params={"request_id": str(medicine_request.medreq_id)},
        )
        
        if success:
            print(f"✅ Medicine {new_status} notification sent to {resident_name} for request item {medicine_request_item.medreqitem_id}")
        else:
            print(f"❌ Failed to send medicine {new_status} notification to {resident_name} for request item {medicine_request_item.medreqitem_id}")
            
        return success
        
    except Exception as e:
        print(f"❌ Error sending medicine {new_status} notification for request item {medicine_request_item.medreqitem_id}: {str(e)}")
        return False
    
    
    
# class UpdateMedicineRequestView(generics.RetrieveUpdateAPIView):
#     serializer_class = MedicineRequestSerializer 
#     queryset = MedicineRequest.objects.all()
#     lookup_field = "medreq_id"

class UpdateMedicinerequestItemView(generics.RetrieveUpdateAPIView):
    serializer_class = MedicineRequestItemSerializer
    queryset = MedicineRequestItem.objects.all()
    lookup_field = "medreqitem_id"

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Update with archive logic
        archive_reason = request.data.get('archive_reason', '')
        status = request.data.get('status', '')
        
        # Store old status for comparison
        old_status = instance.status
        
        # Update the instance
        instance.status = status
        instance.is_archived = True
        instance.archive_reason = archive_reason
        instance.cancelled_rejected_reffered_at = timezone.now()
        instance.save()
        
        # Create notification for reject or refer status
        if status in ['rejected', 'referred']:
            self.create_status_notification(instance, status, archive_reason)
        
        # Return the updated data
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create_status_notification(self, medicine_request_item, status, reason):
        try:
            notifier = NotificationQueries()
            recipient_rp_ids = []
            resident_name = "Resident"
            medicine_request = medicine_request_item.medreq_id

            if medicine_request.rp_id:
                recipient_rp_ids = [str(medicine_request.rp_id.rp_id)]
                if medicine_request.rp_id.per:
                    resident_name = f"{medicine_request.rp_id.per.per_fname} {medicine_request.rp_id.per.per_lname}"
            elif medicine_request.pat_id and medicine_request.pat_id.rp_id:
                recipient_rp_ids = [str(medicine_request.pat_id.rp_id.rp_id)]
                if medicine_request.pat_id.rp_id.per:
                    resident_name = f"{medicine_request.pat_id.rp_id.per.per_fname} {medicine_request.pat_id.rp_id.per.per_lname}"

            if not recipient_rp_ids:
                print("⚠️ No recipient found for medicine status notification")
                return

            # Get medicine details
            medicine = getattr(medicine_request_item, "med", None)
            if medicine:
                medicine_name = medicine.med_name
                med_dsg = medicine.med_dsg
                med_dsg_unit = medicine.med_dsg_unit
                med_form = medicine.med_form
                medicine_display = f"{medicine_name} {med_dsg}{med_dsg_unit} ({med_form})"
            else:
                medicine_display = "Medicine"

            status_display = status.capitalize()
            if status == 'referred':
                status_display = 'Referred'

            title = f"Medicine request {status_display}"
            message = f"Your request for {medicine_display} has been {status_display.lower()}"
            if reason:
                message += f". Reason: {reason}"

            web_route = ""
            if status == 'rejected':
                web_route = "/services/medicine/requests/rejected"
                notif_type = "REJECTED"

            elif status == 'referred':
                web_route = "/services/medicine/requests/referred"
                notif_type = "REFERRED"

            success = notifier.create_notification(
                title=title,
                message=message,
                recipients=recipient_rp_ids,
                notif_type=notif_type,
                web_route=web_route,
                web_params="",
                mobile_route="/(health)/medicine-request/my-requests",
                mobile_params={"request_id": str(medicine_request.medreq_id)},
            )

            if success:
                print(f"✅ Medicine {status} notification sent to {resident_name}")
            else:
                print(f"❌ Failed to send medicine {status} notification to {resident_name}")

        except Exception as e:
            print(f"❌ Error creating medicine {status} notification: {e}")



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

            try:
                patient_instance = Patient.objects.get(pat_id=pat_id_str)
            except Patient.DoesNotExist:
                return Response({"error": f"Patient with ID {pat_id_str} not found"}, status=status.HTTP_404_NOT_FOUND)

            staff_instance = None
            if staff_id:
                try:
                    staff_instance = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {staff_id} not found, continuing without staff")

            allocations_created = 0
            confirmed_medicines = []  # Track confirmed medicines for notification

            # Group selected medicines by med_id
            medid_to_allocations = {}
            for med in selected_medicines:
                minv_id = med.get('minv_id')
                if not minv_id:
                    continue
                try:
                    minv = MedicineInventory.objects.get(minv_id=minv_id)
                    med_id = str(minv.med_id.med_id)
                except MedicineInventory.DoesNotExist:
                    return Response(
                        {"error": f"Medicine inventory with ID {minv_id} not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )
                if med_id not in medid_to_allocations:
                    medid_to_allocations[med_id] = []
                medid_to_allocations[med_id].append({
                    'minv_id': minv_id,
                    'medrec_qty': med.get('medrec_qty', 0),
                    'reason': med.get('reason', 'Medicine allocation'),
                    'medreqitem_id': med.get('medreqitem_id')
                })

            # For each med_id, create one MedicineRequestItem and allocations
            for med_id, allocations in medid_to_allocations.items():
                reason = allocations[0]['reason']
                # Find or create MedicineRequestItem for this med_id
                medicine_item = None
                # Try to find an existing MedicineRequestItem for this med_id and request
                existing_items = MedicineRequestItem.objects.filter(med_id=med_id, medreq_id=medicine_request)
                if existing_items.exists():
                    medicine_item = existing_items.first()
                    medicine_item.status = 'confirmed'
                    medicine_item.confirmed_at = timezone.now()
                    medicine_item.save()
                else:
                    medicine_item = MedicineRequestItem.objects.create(
                        reason=reason,
                        med_id=med_id,
                        medreq_id=medicine_request,
                        confirmed_at=timezone.now(),
                        status='confirmed',
                        action_by=staff_instance,
                    )
                
                # Get medicine details from the med foreign key
                medicine_name = "Medicine"
                med_dsg = ""
                med_dsg_unit = ""
                med_form = ""
                
                if medicine_item.med:
                    medicine_name = medicine_item.med.med_name or "Medicine"
                    med_dsg = medicine_item.med.med_dsg or ""
                    med_dsg_unit = medicine_item.med.med_dsg_unit or ""
                    med_form = medicine_item.med.med_form or ""
                
                # Build complete medicine display with dosage and form
                medicine_display = medicine_name
                if med_dsg:
                    medicine_display += f" {med_dsg}"
                if med_dsg_unit:
                    medicine_display += f"{med_dsg_unit}"
                if med_form:
                    medicine_display += f" {med_form}"
                
                # Add to confirmed medicines list for notification
                confirmed_medicines.append({
                    'medicine_name': medicine_display.strip()
                })
                
                # For each allocation, create MedicineAllocation
                for alloc in allocations:
                    minv_id = alloc['minv_id']
                    medrec_qty = alloc['medrec_qty']
                    if not minv_id or medrec_qty <= 0:
                        continue
                    try:
                        medicine_inventory = MedicineInventory.objects.get(minv_id=minv_id)
                        if medicine_inventory.minv_qty_avail < medrec_qty:
                            return Response({
                                "error": f"Insufficient stock for {medicine_inventory.med_id.med_name}. Available: {medicine_inventory.minv_qty_avail}, Requested: {medrec_qty}"
                            }, status=status.HTTP_400_BAD_REQUEST)
                        MedicineAllocation.objects.create(
                            medreqitem=medicine_item,
                            minv=medicine_inventory,
                            allocated_qty=medrec_qty
                        )
                        allocations_created += 1
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
            medicine_request.save()
            
            # Create notification
            self.create_medicine_confirmed_notification(medicine_request, confirmed_medicines)
            
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
    
    def create_medicine_confirmed_notification(self, medicine_request, confirmed_medicines):
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
                print("⚠️ No recipient found for medicine confirmed notification")
                return
            
            # Create medicine list for message
            medicine_list = ", ".join([f"{med['medicine_name']}" for med in confirmed_medicines])
            
            # Create notification
            success = notifier.create_notification(
                title="Medicine Request Confirmed",
                     message=(
                    f"Medicines requested: {medicine_list}.\n"
                    "Please note that if you do not pick up your medicine within 2 days, "
                    "your request will be automatically cancelled."
                ),
                # sender="00001250924",  # System sender
                recipients=recipient_rp_ids,
                notif_type="CONFIRMED",
                # target_obj=None,
                web_route="/services/medicine/requests/pickup",
                web_params="",
                mobile_route="/(health)/medicine-request/my-requests",
                mobile_params={"request_id": str(medicine_request.medreq_id)},
            )

            if success:
                print(f"✅ Medicine confirmed notification sent to {resident_name}")
            else:
                print(f"❌ Failed to send medicine confirmed notification to {resident_name}")
                
        except Exception as e:
            print(f"❌ Error creating medicine confirmed notification: {e}")