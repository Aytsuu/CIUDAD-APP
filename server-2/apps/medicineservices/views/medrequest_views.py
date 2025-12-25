import json
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework import status
from ..serializers import *
from pagination import *
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Count, Sum, Prefetch
from rest_framework.exceptions import ValidationError
from utils.create_notification import NotificationQueries 
from apps.administration.models import Staff, Position 
import logging                                    
from django.utils import timezone

try:
    from .utils import create_notification
except ImportError:
    # Fallback or error handling if the path is different
    import sys
    print("CRITICAL: Could not import create_notification from backend.firebase.notifications.utils")
    
logger = logging.getLogger(__name__)

def send_cancellation_notification_to_staff(medicine_request_item, reason):
    try:
        # Get the main request
        medicine_request = medicine_request_item.medreq_id
        
        # Resident Name Logic
        resident_name = "Resident"
        if medicine_request.rp_id and medicine_request.rp_id.per:
            resident_name = f"{medicine_request.rp_id.per.per_fname} {medicine_request.rp_id.per.per_lname}"
        elif medicine_request.patrec and medicine_request.patrec.pat_id and medicine_request.patrec.pat_id.rp_id and medicine_request.patrec.pat_id.rp_id.per:
            per = medicine_request.patrec.pat_id.rp_id.per
            resident_name = f"{per.per_fname} {per.per_lname}"
        
        medicine_name = medicine_request_item.med.med_name
            
        # --- CRITICAL CHANGE: Get Account Objects, NOT Strings ---
        # We need the actual Account objects because we are calling the internal function directly
        staff_to_notify = Staff.objects.filter(
            staff_type="HEALTH STAFF",
            pos__pos_title__in=['ADMIN', 'BARANGAY HEALTH WORKERS', 'MIDWIFE']
        ).select_related('rp__account') # Optimize query
        
        # Collect valid accounts
        recipient_accounts = []
        for staff in staff_to_notify:
            if staff.rp and hasattr(staff.rp, 'account') and staff.rp.account:
                recipient_accounts.append(staff.rp.account)

        logger.info(f"Staff accounts found for cancellation: {len(recipient_accounts)}")

        if recipient_accounts:
            title = 'Medicine Request Cancelled'
            message = f'{resident_name} has cancelled their request for {medicine_name}. Reason: {reason}'
            
            # --- DIRECT FUNCTION CALL (No requests.post, No Deadlock) ---
            notification = create_notification(
                title=title,
                message=message,
                recipients=recipient_accounts, # Pass the objects directly
                notif_type="MEDICINE_STAFF_CANCELLED",
                web_route="/services/medicine/requests/cancelled",
                web_params={},
                mobile_route="", 
                mobile_params={},
            )
            
            if notification:
                logger.info(f"Cancellation notification sent directly for item {medicine_request_item.medreqitem_id}")
                return True
            else:
                logger.error("Internal create_notification returned None")
                return False
        
        return False

    except Exception as e:
        logger.error(f"Error sending medicine cancellation notification: {str(e)}")
        return False

def send_new_medicine_request_notification_to_staff(medicine_request):
    """
    Notifies staff (Admin, BHW) about a new pending medicine request.
    Returns True if the notification was sent, False otherwise.
    """
    try:
        notifier = NotificationQueries()
        
        # --- Get Resident's Name ---
        resident_name = "Resident"
        if medicine_request.rp_id and medicine_request.rp_id.per:
            # Direct resident request
            resident_name = f"{medicine_request.rp_id.per.per_fname} {medicine_request.rp_id.per.per_lname}"
        elif medicine_request.patrec and medicine_request.patrec.pat_id and medicine_request.patrec.pat_id.rp_id and medicine_request.patrec.pat_id.rp_id.per:
            # Get from Patient Record -> Patient -> Resident Profile
            per = medicine_request.patrec.pat_id.rp_id.per
            resident_name = f"{per.per_fname} {per.per_lname}"
        
        # --- Get Staff Recipients (Admin & BHW) ---
        staff_to_notify = Staff.objects.filter(
            staff_type="HEALTH STAFF",
            pos__pos_title__in=['ADMIN', 'BARANGAY HEALTH WORKERS']
        ).select_related('rp')
        
        staff_recipients = [str(staff.rp.rp_id) for staff in staff_to_notify if staff.rp and staff.rp.rp_id]
        logger.info(f"Staff recipients for new medicine request: {staff_recipients}")

        if staff_recipients:
            title = 'New Medicine Request'
            message = f'{resident_name} has submitted a new medicine request. Please review.'
            
            success = notifier.create_notification(
                title=title,
                message=message,
                recipients=staff_recipients,
                notif_type="MEDICINE_STAFF_PENDING", 
                web_route="/services/medicine/requests/pending",
                web_params={},
                mobile_route="", 
                mobile_params={},
            )
            
            if success:
                logger.info(f"New medicine request notification sent to staff for request {medicine_request.medreq_id}")
            else:
                logger.error(f"Failed to send new medicine request notification to staff for request {medicine_request.medreq_id}")
            
            return success  
        
        else:
            logger.warning("No staff recipients found for medicine request notification.")
            return False 

    except Exception as e:
        logger.error(f"Error sending new medicine request notification to staff: {str(e)}")
        return False
    
class UserMedicineRequestsView(generics.ListAPIView):
    serializer_class = MedicineRequestSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        pat_id = self.request.query_params.get('pat_id')
        rp_id = self.request.query_params.get('rp_id')

        if not pat_id and not rp_id:
            return MedicineRequest.objects.none()

        queryset = MedicineRequest.objects.select_related(
            'patrec', 'rp_id'
        ).prefetch_related(
            Prefetch('items', queryset=MedicineRequestItem.objects.select_related(
                'med'
            ).prefetch_related('allocations__minv'))
        ).order_by('-requested_at')

        if pat_id:
            # FIX: Filter by pat_id string value
            queryset = queryset.filter(patrec__pat_id__pat_id=pat_id)
        elif rp_id:
            # FIX: Filter by rp_id string value
            queryset = queryset.filter(rp_id__rp_id=rp_id)

        return queryset

    

class CheckPendingMedicineRequestView(APIView):
    def get(self, request, rp_id, med_id):
        try:
            # Check for pending medicine requests for this resident and medicine
            pending_items = MedicineRequestItem.objects.filter(
                medreq_id__rp_id__rp_id=rp_id, 
                med_id=med_id,
                status='pending',
                is_archived=False
            ).exists()

            return Response({'has_pending_request': pending_items}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class IndividualMedicineRecordView(generics.ListCreateAPIView):
    serializer_class = MedicineRecordSerialzer
    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return MedicineRecord.objects.filter(
            patrec_id__pat_id=pat_id
        ).order_by('-fulfilled_at')  
        
        
class UserAllMedicineRequestItemsView(generics.ListAPIView):
    serializer_class = MedicineRequestItemSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        rp_id = self.request.query_params.get('rp_id')
        pat_id = self.request.query_params.get('pat_id')
        
        if not rp_id and not pat_id:
            raise ValidationError({"error": "Either rp_id or pat_id is required"})
        
        # Start with base queryset
        queryset = MedicineRequestItem.objects.all()

        # Apply basic filters first without complex joins
        if rp_id:
            # Use the related_name from MedicineRequest model
            queryset = queryset.filter(
                medreq_id__rp_id__rp_id=rp_id
            )
        elif pat_id:
            queryset = queryset.filter(
                medreq_id__patrec__pat_id__pat_id=pat_id
            )

        # Apply other filters
        include_archived = self.request.query_params.get('include_archived', 'true').lower() == 'true'
        if not include_archived:
            queryset = queryset.filter(is_archived=False)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(med__med_name__icontains=search) |
                Q(medreq_id__medreq_id__icontains=search) |
                Q(reason__icontains=search)
            )

        # Now we can safely use select_related/prefetch_related
        return queryset.select_related(
            'medreq_id',
            'med',
            'action_by',
            'completed_by',
            'medreq_id__patrec',
            'medreq_id__patrec__pat_id',
            'medreq_id__rp_id',
            'medreq_id__trans_id',
        ).prefetch_related(
            Prefetch(
                'allocations',
                queryset=MedicineAllocation.objects.select_related('minv__med_id')
            ),
            'medreq_id__medicine_files'  # Add this for medicine files
        ).order_by('-created_at')


class MedicineRequestItemCancel(APIView):
    def patch(self, request, medreqitem_id):
        try:
            item = MedicineRequestItem.objects.get(medreqitem_id=medreqitem_id)
            archive_reason = request.data.get('archive_reason')
            if not archive_reason:
                return Response({"error": "Archive reason is required"}, status=status.HTTP_400_BAD_REQUEST)
            item.status = 'cancelled'
            item.is_archived = True
            item.archive_reason = archive_reason
            item.cancelled_rejected_reffered_at = timezone.now()
            item.save()
            
            try:
                send_cancellation_notification_to_staff(item, archive_reason)
            except Exception as e:
                logger.error(f"Failed to send staff cancellation notification for item {item.medreqitem_id}: {str(e)}")
                
            
            return Response({"success": True, "message": "Item cancelled successfully"}, status=status.HTTP_200_OK)
        except MedicineRequestItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MedicineRequestItemsByRequestView(generics.ListAPIView):
    """Get medicine request items for a specific medicine request"""
    serializer_class = MedicineRequestItemSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        medreq_id = self.kwargs.get('medreq_id')
        
        if not medreq_id:
            return MedicineRequestItem.objects.none()
            
        return MedicineRequestItem.objects.filter(
            medreq_id=medreq_id
        ).select_related(
            'medreq_id', 'med', 'medreq_id__rp_id', 'medreq_id__patrec',
            'medreq_id__patrec__pat_id'  # Add this to access patient
        ).prefetch_related(
            'allocations__minv',
            'allocations__minv__med_id',
        ).order_by('-medreq_id__requested_at')

class SubmitMedicineRequestView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        print("🚀 START: SubmitMedicineRequestView called")
        logger.info("🚀 START: SubmitMedicineRequestView called")
        
        # Initialize variables outside transaction
        medicine_request = None
        created_items = []
        
        try:
            # Start transaction for main data only (not files)
            with transaction.atomic():
                print("🔍 DEBUG: Inside transaction atomic block")
                logger.info("🔍 Inside transaction atomic block")
                
                print(f"🔍 DEBUG: Request data keys: {list(request.data.keys())}")
                print(f"🔍 DEBUG: Request FILES keys: {list(request.FILES.keys())}")
                
                data = request.data
                medicines_data = data.get('medicines', '[]')
                
                print(f"🔍 DEBUG: medicines_data type: {type(medicines_data)}, value: {medicines_data}")
                
                # Handle list case
                if isinstance(medicines_data, list):
                    print("⚠️ WARNING: medicines received as array, taking first element")
                    medicines_data = medicines_data[0] if medicines_data else '[]'
                
                try:
                    medicines = json.loads(medicines_data)
                    print(f"✅ DEBUG: Successfully parsed {len(medicines)} medicines: {medicines}")
                    logger.info(f"✅ Parsed {len(medicines)} medicines from request")
                except json.JSONDecodeError as e:
                    print(f"❌ ERROR: Failed to parse medicines JSON: {e}")
                    logger.error(f"❌ Failed to parse medicines JSON: {e}")
                    return Response({"error": "Invalid medicines data format"}, status=status.HTTP_400_BAD_REQUEST)
                
                # Collect all uploaded files regardless of key name
                files = []
                for key in request.FILES:
                    try:
                        files.extend(request.FILES.getlist(key))
                    except Exception:
                        # fallback to single value
                        files.append(request.FILES.get(key))

                print(f"🔍 DEBUG: Number of files found in request.FILES: {len(files)} (keys: {list(request.FILES.keys())})")
                logger.info(f"📁 Received {len(files)} files (keys: {list(request.FILES.keys())})")
                
                if not medicines:
                    print("❌ ERROR: No medicines provided")
                    logger.error("❌ No medicines provided in request")
                    return Response({"error": "At least one medicine is required"}, status=status.HTTP_400_BAD_REQUEST)
                
                # Check if prescription is required
                requires_prescription = any(med.get('med_type', '') == 'Prescription' for med in medicines)
                print(f"🔍 DEBUG: Requires prescription: {requires_prescription}")
                
                if requires_prescription and not files:
                    print("❌ ERROR: Prescription required but no files provided")
                    logger.error("❌ Prescription required but no files provided")
                    return Response({"error": "Prescription document is required for prescription medicines"}, 
                                  status=status.HTTP_400_BAD_REQUEST)
                
                pat_id = data.get('pat_id')
                if isinstance(pat_id, list):
                    pat_id = pat_id[0] if pat_id else None
                rp_id = data.get('rp_id') 
                if isinstance(rp_id, list):
                    rp_id = rp_id[0] if rp_id else None
                    
                print(f"🔍 DEBUG: Received pat_id: {pat_id}, rp_id: {rp_id}")
                logger.info(f"👤 Received pat_id: {pat_id}, rp_id: {rp_id}")
                    
                if not pat_id and not rp_id:
                    print("❌ ERROR: Neither pat_id nor rp_id provided")
                    logger.error("❌ Neither pat_id nor rp_id provided")
                    return Response({"error": "Either patient ID or resident ID must be provided"}, 
                                  status=status.HTTP_400_BAD_REQUEST)
                
                # Validate and get instances
                pat_instance = None
                
                print("🔍 DEBUG: Starting patient/resident validation")
                
                # Get patient instance from rp_id if pat_id is not provided
                if pat_id:
                    try:
                        pat_instance = Patient.objects.get(pat_id=pat_id)
                        print(f"✅ DEBUG: Validated pat_id: {pat_id}")
                        logger.info(f"✅ Validated pat_id: {pat_id}")
                    except Patient.DoesNotExist:
                        print(f"❌ ERROR: Patient with ID {pat_id} not found")
                        logger.error(f"❌ Patient with ID {pat_id} not found")
                        return Response({"error": f"Patient with ID {pat_id} not found"}, status=status.HTTP_404_NOT_FOUND)
                elif rp_id:
                    # Get patient instance from resident profile
                    try:
                        rp_instance = ResidentProfile.objects.get(rp_id=rp_id)
                        print(f"✅ DEBUG: Validated rp_id: {rp_id}")
                        logger.info(f"✅ Validated rp_id: {rp_id}")
                        
                        # Get patient associated with this resident profile
                        try:
                            pat_instance = Patient.objects.get(rp_id=rp_instance)
                            print(f"✅ DEBUG: Found patient for resident: {pat_instance.pat_id}")
                            logger.info(f"✅ Found patient for resident: {pat_instance.pat_id}")
                        except Patient.DoesNotExist:
                            print(f"⚠️ DEBUG: No patient found for resident {rp_id}. Creating new Patient record...")
                            logger.info(f"⚠️ No patient found for resident {rp_id}. Creating new Patient record...")
                            # Auto-create the Patient entry for this Resident
                            pat_instance = Patient.objects.create(
                                rp_id=rp_instance,
                                pat_type='Resident',
                                pat_status='Active' 
                            )
                            print(f"✅ DEBUG: Created new Patient ID: {pat_instance.pat_id}")
                            logger.info(f"✅ Created new Patient ID: {pat_instance.pat_id}")
                            
                    except ResidentProfile.DoesNotExist:
                        print(f"❌ ERROR: Resident with ID {rp_id} not found")
                        logger.error(f"❌ Resident with ID {rp_id} not found")
                        return Response({"error": f"Resident with ID {rp_id} not found"}, status=status.HTTP_404_NOT_FOUND)
                
                # Create PatientRecord with the patient instance
                if not pat_instance:
                    print("❌ ERROR: Could not determine patient for this request")
                    logger.error("❌ Could not determine patient for this request")
                    return Response({"error": "Could not determine patient for this request"}, 
                                  status=status.HTTP_400_BAD_REQUEST)
                
                print("🔍 DEBUG: Creating PatientRecord...")
                try:
                    patient_record = PatientRecord.objects.create(
                        pat_id=pat_instance,
                        patrec_type="Medicine Record",
                    )
                    print(f"✅ DEBUG: Created PatientRecord: {patient_record.patrec_id} for patient: {pat_instance.pat_id}")
                    logger.info(f"✅ Created PatientRecord: {patient_record.patrec_id} for patient: {pat_instance.pat_id}")
                except Exception as e:
                    print(f"❌ ERROR: Failed to create PatientRecord: {str(e)}")
                    logger.error(f"❌ Failed to create PatientRecord: {str(e)}")
                    return Response({"error": f"Failed to create patient record: {str(e)}"}, 
                                  status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                print("🔍 DEBUG: Creating MedicineRequest...")
                try:
                    medicine_request = MedicineRequest.objects.create(
                        rp_id=pat_instance.rp_id if pat_instance.pat_type == 'Resident' else None,
                        trans_id=pat_instance.trans_id if pat_instance.pat_type == 'Transient' else None,
                        mode='app',
                        requested_at=timezone.now(),
                        signature=data.get('signature', ''),
                        patrec=patient_record
                    )
                    print(f"✅ DEBUG: Created MedicineRequest: {medicine_request.medreq_id}")
                    logger.info(f"✅ Created MedicineRequest: {medicine_request.medreq_id}")
                except Exception as e:
                    print(f"❌ ERROR: Failed to create MedicineRequest: {str(e)}")
                    logger.error(f"❌ Failed to create MedicineRequest: {str(e)}")
                    return Response({"error": f"Failed to create medicine request: {str(e)}"}, 
                                  status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Create MedicineRequestItem and MedicineAllocation for each medicine
                created_items = []
                print(f"🔍 DEBUG: Processing {len(medicines)} medicines...")
                
                for i, med in enumerate(medicines):
                    print(f"🔍 DEBUG: Processing medicine {i+1}: {med}")
                    minv_id = med.get('minv_id')
                    if not minv_id:
                        print(f"❌ ERROR: minv_id is required for medicine {i+1}")
                        logger.error("❌ minv_id is required for each medicine")
                        return Response({"error": "minv_id is required for each medicine"}, 
                                      status=status.HTTP_400_BAD_REQUEST)
                    
                    try:
                        medicine_inventory = MedicineInventory.objects.get(minv_id=int(minv_id))
                        print(f"✅ DEBUG: Found MedicineInventory: {minv_id}")
                        logger.info(f"✅ Found MedicineInventory: {minv_id}")
                    except MedicineInventory.DoesNotExist:
                        print(f"❌ ERROR: Medicine inventory with ID {minv_id} not found")
                        logger.error(f"❌ Medicine inventory with ID {minv_id} not found")
                        return Response({"error": f"Medicine inventory with ID {minv_id} not found"}, 
                                      status=status.HTTP_404_NOT_FOUND)
                    
                    # Create MedicineRequestItem
                    print(f"🔍 DEBUG: Creating MedicineRequestItem for minv_id: {minv_id}")
                    try:
                        medicine_item = MedicineRequestItem.objects.create(
                            medreq_id=medicine_request,
                            med=medicine_inventory.med_id,
                            reason=med.get('reason', ''),
                            status='pending'
                        )
                        created_items.append(medicine_item)
                        print(f"✅ DEBUG: Created MedicineRequestItem: {medicine_item.medreqitem_id}")
                        logger.info(f"✅ Created MedicineRequestItem: {medicine_item.medreqitem_id}")
                    except Exception as e:
                        print(f"❌ ERROR: Failed to create MedicineRequestItem: {str(e)}")
                        logger.error(f"❌ Failed to create MedicineRequestItem: {str(e)}")
                        return Response({"error": f"Failed to create medicine request item: {str(e)}"}, 
                                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
                    # Create MedicineAllocation
                    allocated_qty = med.get('quantity', 1)
                    print(f"🔍 DEBUG: Creating MedicineAllocation with quantity: {allocated_qty}")
                    if allocated_qty > 0:
                        try:
                            allocation = MedicineAllocation.objects.create(
                                medreqitem=medicine_item,
                                minv=medicine_inventory,
                                allocated_qty=allocated_qty
                            )
                            print(f"✅ DEBUG: Created MedicineAllocation: {allocation.alloc_id} for minv_id: {minv_id}")
                            logger.info(f"✅ Created MedicineAllocation for minv_id: {minv_id}")
                            
                            # Update temporary deduction
                            medicine_inventory.temporary_deduction += allocated_qty
                            medicine_inventory.save()
                            print(f"✅ DEBUG: Updated temporary deduction for minv_id: {minv_id}")
                            logger.info(f"✅ Updated temporary deduction for minv_id: {minv_id}")
                        except Exception as e:
                            print(f"❌ ERROR: Failed to create MedicineAllocation: {str(e)}")
                            logger.error(f"❌ Failed to create MedicineAllocation: {str(e)}")
                            return Response({"error": f"Failed to create medicine allocation: {str(e)}"}, 
                                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                print(f"✅ DEBUG: Successfully created {len(created_items)} MedicineRequestItems and MedicineAllocations")
                logger.info(f"✅ Created {len(created_items)} MedicineRequestItems and MedicineAllocations")
                
                # If we reach here, the main transaction will commit
                print("✅ DEBUG: Main transaction completed successfully - about to commit")
                logger.info("✅ Main transaction completed successfully")
            
            # Transaction committed successfully - MAIN DATA IS SAVED!
            print("✅ TRANSACTION COMMITTED: All main data saved to database")
            logger.info("✅ TRANSACTION COMMITTED: All main data saved to database")
            
            # NOW handle file uploads OUTSIDE the main transaction
            uploaded_files = []
            if files and medicine_request:
                print("🔍 DEBUG: Starting file upload processing (outside transaction)...")
                try:
                    # Use the serializer for file upload (as in your working version)
                    serializer = Medicine_FileSerializer(context={'request': request})
                    
                    # Prepare file data for the serializer
                    file_data_list = []
                    for file in files:
                        file_content = file.read()
                        import base64
                        base64_content = base64.b64encode(file_content).decode('utf-8')
                        data_url = f"data:{file.content_type};base64,{base64_content}"
                        
                        file_data_list.append({
                            'name': file.name,
                            'type': file.content_type,
                            'file': data_url
                        })
                    
                    # Upload files using the serializer method
                    uploaded_files = serializer._upload_files(
                        file_data_list, 
                        medreq_instance=medicine_request
                    )
                    
                    print(f"✅ DEBUG: Successfully uploaded {len(uploaded_files)} files")
                    logger.info(f"✅ Successfully uploaded {len(uploaded_files)} files")
                    
                except Exception as e:
                    print(f"❌ WARNING: File upload failed but main data was saved: {str(e)}")
                    logger.warning(f"❌ File upload failed but main data was saved: {str(e)}")
                    # Don't fail the entire request if file upload fails
                    # The main medicine request is already saved
            
            # Verify the main data was actually saved
            print("🔍 DEBUG: Verifying main data was saved...")
            saved_request = MedicineRequest.objects.filter(medreq_id=medicine_request.medreq_id).first()
            if not saved_request:
                print("❌ CRITICAL: MedicineRequest was not saved to database!")
                logger.error("❌ CRITICAL: MedicineRequest was not saved to database!")
                return Response({"error": "Failed to save request to database"}, 
                              status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            saved_items_count = MedicineRequestItem.objects.filter(medreq_id=medicine_request).count()
            print(f"✅ DEBUG: Verified: {saved_items_count} items saved for request {medicine_request.medreq_id}")
            logger.info(f"✅ Verified: {saved_items_count} items saved for request {medicine_request.medreq_id}")
            
            # Send notification
            try:
                print("🔍 DEBUG: Sending notification...")
                notif_sent = send_new_medicine_request_notification_to_staff(medicine_request)
                print(f"✅ DEBUG: Staff notification send attempt result: {notif_sent}")
                logger.info(f"✅ Staff notification send attempt result: {notif_sent}")
            except Exception as e:
                print(f"❌ ERROR: Failed to send staff notification: {str(e)}")
                logger.error(f"❌ Failed to send staff notification: {str(e)}")
                # Don't fail the request if notification fails
            
            print(f"🎉 SUCCESS: Medicine request {medicine_request.medreq_id} submitted successfully")
            logger.info(f"🎉 SUCCESS: Medicine request {medicine_request.medreq_id} submitted successfully")
            
            return Response({
                "success": True,
                "medreq_id": medicine_request.medreq_id,
                "message": "Medicine request submitted successfully",
                "files_uploaded": len(uploaded_files),
                "items_created": len(created_items),
                "note": "Files may be processed separately" if files and len(uploaded_files) < len(files) else None
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback
            error_traceback = traceback.format_exc()
            print(f"❌ ERROR: Transaction failed: {str(e)}")
            print(f"❌ ERROR: Full traceback: {error_traceback}")
            logger.error(f"❌ Transaction failed: {str(e)}")
            logger.error(f"❌ Traceback: {error_traceback}")
            return Response({"error": f"Internal server error: {str(e)}"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
