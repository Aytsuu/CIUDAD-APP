
from django.shortcuts import render
from rest_framework import generics,status
from django.db.models import Q, Count, Sum
from datetime import timedelta
from django.utils.timezone import now
import json
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError


from ..serializers import *
from django.db import transaction, IntegrityError
from django.utils.timezone import now
from apps.childhealthservices.models import ChildHealthSupplements,ChildHealth_History
from apps.reports.models import *
from apps.reports.serializers import *
from pagination import *
from django.db.models import Q, Prefetch
from utils import * 


class CreateMedicineRecordView(generics.CreateAPIView):
    serializer_class = MedicineRecordSerialzer
    queryset = MedicineRecord.objects.all()
    
class CreateFindingPlanTreatmentView(generics.CreateAPIView):
    serializer_class = FindingPlanTreatmentSerializer
    queryset = FindingsPlanTreatment.objects.all()
    

class  CreateMedicineRequestView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            # Extract data from request
            pat_id = request.data.get('pat_id')
            signature = request.data.get('signature')
            medicines = request.data.get('medicines', [])
            files = request.data.get('files', [])
            staff_id = request.data.get('staff_id')
            
            print(f"Received request data: pat_id={pat_id}, medicines={len(medicines)}, files={len(files)}")
            
            if not pat_id:
                return Response({"error": "pat_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not medicines:
                return Response({"error": "At least one medicine is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # 1. Get the Patient instance
            try:
                patient = Patient.objects.get(pat_id=pat_id)
            except Patient.DoesNotExist:
                return Response({"error": f"Patient with ID {pat_id} not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # 2. Get Staff instance if staff_id is provided
            staff_instance = None
            if staff_id:
                try:
                    staff_instance = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {staff_id} not found, continuing without staff")
            
            # 3. Create patient record with Patient instance
            patient_record = PatientRecord.objects.create(
                pat_id=patient,
                patrec_type="Medicine Request",
            )
            
            # 4. Process each medicine and track inventory changes for potential rollback
            medicine_records = []
            inventory_updates = {}  # Store original quantities for rollback
            medicine_transactions = []  # Store medicine transactions
            
            for med_data in medicines:
                minv_id = med_data.get('minv_id')
                medrec_qty = med_data.get('medrec_qty')
                reason = med_data.get('reason', '')
                
                if not minv_id or not medrec_qty:
                    continue
                
                # Check medicine inventory
                try:
                    medicine_inv = MedicineInventory.objects.get(minv_id=minv_id)
                    if medicine_inv.minv_qty_avail < medrec_qty:
                        # This will trigger transaction rollback
                        raise Exception(f"Insufficient stock for medicine ID {minv_id}. Available: {medicine_inv.minv_qty_avail}, Requested: {medrec_qty}")
                    
                    # Store original quantity for rollback
                    inventory_updates[minv_id] = {
                        'medicine_inv': medicine_inv,
                        'original_qty': medicine_inv.minv_qty_avail
                    }
                    
                    # Update inventory
                    medicine_inv.minv_qty_avail -= medrec_qty
                    medicine_inv.save()
                    
                    # Create medicine transaction record
                    # Determine transaction quantity based on unit
                    if medicine_inv.minv_qty_unit and medicine_inv.minv_qty_unit.lower() == 'boxes':
                        mdt_qty = f"{medrec_qty } pcs"  # Convert boxes to pieces (3 pcs per box)
                    else:
                        # Use the original unit if not boxes
                        unit = medicine_inv.minv_qty_unit or 'pcs'
                        mdt_qty = f"{medrec_qty} {unit}"
                    
                    # Create medicine transaction
                    medicine_transaction = MedicineTransactions.objects.create(
                        mdt_qty=mdt_qty,
                        mdt_action="deducted",
                        staff=staff_instance,
                        minv_id=medicine_inv
                    )
                    medicine_transactions.append(medicine_transaction)
                    
                except MedicineInventory.DoesNotExist:
                    # This will trigger transaction rollback
                    raise Exception(f"Medicine ID {minv_id} not found in inventory")
                
                # Create medicine record
                medicine_record = MedicineRecord.objects.create(
                    medrec_qty=medrec_qty,
                    reason=reason,
                    signature=signature,
                    requested_at=timezone.now(),
                    fulfilled_at=timezone.now(),
                    patrec_id=patient_record,
                    minv_id=medicine_inv,
                    staff=staff_instance
                )
                medicine_records.append(medicine_record)
            
            # 5. Handle file uploads - THIS MUST BE INSIDE THE TRANSACTION SCOPE
            uploaded_files = []
            if files and medicine_records:
                try:
                    # Create a savepoint before file operations
                    sid = transaction.savepoint()
                    
                    serializer = Medicine_FileSerializer(context={'request': request})
                    first_medrec = medicine_records[0]
                    uploaded_files = serializer._upload_files(files, medrec_instance=first_medrec)
                    
                    if not uploaded_files:
                        print("No files were uploaded successfully")
                        # If file upload is critical, you can raise an exception here:
                        # raise Exception("File upload failed")
                    
                    print(f"Successfully processed {len(uploaded_files)} files")
                    
                except Exception as e:
                    print(f"File upload error: {str(e)}")
                    # Rollback to savepoint if file upload fails
                    transaction.savepoint_rollback(sid)
                    # If file upload is critical, re-raise the exception to trigger full rollback:
                    raise Exception(f"File upload failed: {str(e)}")
            
            return Response({
                "message": "Medicine request created successfully",
                "patrec_id": patient_record.patrec_id,
                "medicine_records_created": len(medicine_records),
                "medicine_transactions_created": len(medicine_transactions),
                "uploaded_files_count": len(uploaded_files)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            # The @transaction.atomic decorator will automatically rollback
            # all database changes if we reach here
            
            # Manual inventory rollback (in case transaction doesn't cover everything)
            try:
                for minv_id, update_info in inventory_updates.items():
                    medicine_inv = update_info['medicine_inv']
                    original_qty = update_info['original_qty']
                    medicine_inv.minv_qty_avail = original_qty
                    medicine_inv.save()
                    print(f"Rolled back inventory for medicine {minv_id} to {original_qty}")
            except Exception as rollback_error:
                print(f"Error during inventory rollback: {str(rollback_error)}")
            
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


            
class CreateChildServiceMedicineRecordView(generics.CreateAPIView):
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
            


class CreateMedicineRequestAllocationAPIView(APIView):
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            medreq_id = request.data.get('medreq_id')
            selected_medicines = request.data.get('selected_medicines', [])
            staff_id = request.data.get('staff_id')
            mode = request.data.get('mode', 'app')  # Default to 'app' if not provided
            signature = request.data.get('signature', '')
            if not medreq_id:
                return Response({"error": "Medicine Request ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not selected_medicines or not isinstance(selected_medicines, list):
                return Response({"error": "Selected medicines list is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                medicine_request = MedicineRequest.objects.get(medreq_id=medreq_id)
            except MedicineRequest.DoesNotExist:
                return Response({"error": "Medicine Request not found"}, status=status.HTTP_404_NOT_FOUND) 
            
            # Get Staff instance if staff_id is provided
            staff_instance = None
            if staff_id:
                try:
                    staff_instance = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {staff_id} not found, continuing without staff")
            
            medicine_records = []
            medicine_transactions = []
            
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
                    
                    request_item = None
                    request_item = MedicineRequestItem.objects.get(
                            medreqitem_id=medreqitem_id,
                            medreq_id=medicine_request
                        )
                    request_item.status = 'fulfilled'
                    request_item.save()
                
                 
                    if mode == 'app':
                        MedicineAllocation.objects.create(
                            medreqitem=request_item,
                            minv=medicine_inventory,
                            allocated_qty=medrec_qty
                        )
                        
                    
                    # Create patient record for walk-in mode (only once)
                    patient_record = PatientRecord.objects.create(
                            pat_id=medicine_request.pat_id,
                            patrec_type="Medicine Record",
                        )
                  
                    # Create medicine record
                    medicine_record = MedicineRecord.objects.create(
                        medrec_qty=medrec_qty,
                        reason=reason,
                        requested_at=medicine_request.requested_at if hasattr(medicine_request, 'requested_at') else request.data.get('requested_at', timezone.now()),
                        fulfilled_at=timezone.now(),
                        patrec_id=patient_record,
                        staff=staff_instance,
                        medreq_id=medicine_request,
                        minv_id=medicine_inventory,
                        signature=signature 
                    )
                    
                    medicine_records.append(medicine_record)
                    
                    # Create medicine transaction
                    if medicine_inventory.minv_qty_unit and medicine_inventory.minv_qty_unit.lower() == 'boxes':
                        mdt_qty = f"{medrec_qty} pcs"
                    else:
                        unit = medicine_inventory.minv_qty_unit or 'pcs'
                        mdt_qty = f"{medrec_qty} {unit}"
                    
                    medicine_transaction = MedicineTransactions.objects.create(
                        mdt_qty=mdt_qty,
                        mdt_action="deducted",
                        staff=staff_instance,
                        minv_id=medicine_inventory,
                    )
                    medicine_transactions.append(medicine_transaction)
                    
                    if mode == 'walk-in':
                        medicine_inventory.minv_qty_avail -= medrec_qty
                        medicine_inventory.temporary_deduction -= medrec_qty
                        medicine_inventory.save()
                    else:
                        medicine_inventory.minv_qty_avail -= medrec_qty
                        medicine_inventory.save()

                    
                except MedicineInventory.DoesNotExist:
                    return Response({
                        "error": f"Medicine inventory with ID {minv_id} not found"
                    }, status=status.HTTP_404_NOT_FOUND)
                        
            medicine_request.status = 'fulfilled'
           
            medicine_request.save()
            
            response_data = {
                "success": True,
                "message": f"Medicine {'dispensing' if mode == 'walk-in' else 'allocation'} processed successfully",
                "medreq_id": medreq_id,
                "mode": mode,
                "medicine_records_created": len(medicine_records),
                "medicine_transactions_created": len(medicine_transactions)
            }
            
            # Add patient record ID if created
            if patient_record:
                response_data["patrec_id"] = patient_record.patrec_id
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
    
#=========== MEDICINE REQUEST WEB PROCESSING --REQ THROUGH DOCTORS END =========
class CreateMedicineRequestProcessingView(generics.ListCreateAPIView):
    serializer_class = MedicineRequestSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            # Validate required fields
            if not request.data.get('pat_id') and not request.data.get('rp_id'):
                raise ValidationError("Either patient ID or resident ID must be provided")
            
            if not request.data.get('medicines') or len(request.data['medicines']) == 0:
                raise ValidationError("At least one medicine is required")

            # Handle patient reference
            pat_id = request.data.get('pat_id')
            patient = None
            if pat_id:
                try:
                    patient = Patient.objects.get(pat_id=pat_id)
                except Patient.DoesNotExist:
                    raise ValidationError(f"Patient with ID {pat_id} not found")

        
            return Response({
                "success": True,
                "message": "Medicine request created successfully"
            }, status=status.HTTP_201_CREATED)
            

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": "Internal server error", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )   
        
        