
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

class CreateMedicineRequestView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            pat_id = request.data.get('pat_id')
            signature = request.data.get('signature')
            medicines = request.data.get('medicines', [])
            files = request.data.get('files', [])
            staff_id = request.data.get('staff_id')

            if not pat_id:
                return Response({"error": "pat_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            if not medicines:
                return Response({"error": "At least one medicine is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Get Patient and Staff
            try:
                patient = Patient.objects.get(pat_id=pat_id)
            except Patient.DoesNotExist:
                return Response({"error": f"Patient with ID {pat_id} not found"}, status=status.HTTP_404_NOT_FOUND)
            staff_instance = None
            if staff_id:
                try:
                    staff_instance = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    staff_instance = None

            # Create PatientRecord
            patient_record = PatientRecord.objects.create(
                pat_id=patient,
                patrec_type="Medicine Request",
            )
            rp_id = patient.rp_id if patient.rp_id else None
            trans_id = patient.trans_id if patient.trans_id else None

            

            # Create MedicineRequest
            med_request = MedicineRequest.objects.create(
                mode='walk-in',
                signature=signature,
                requested_at=timezone.now(),
                fulfilled_at=timezone.now(),
                patrec=patient_record,
                rp_id=rp_id,
                trans_id=trans_id,

            )

            # Group medicines by med_id (from MedicineInventory FK)
            medid_to_allocations = {}
            for med in medicines:
                minv_id = med.get('minv_id')
                if not minv_id:
                    continue
                try:
                    minv = MedicineInventory.objects.get(minv_id=minv_id)
                    med_id = minv.med_id  # FK object, not string
                except MedicineInventory.DoesNotExist:
                    return Response(
                        {"error": f"Medicine inventory with ID {minv_id} not found"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if med_id not in medid_to_allocations:
                    medid_to_allocations[med_id] = []
                medid_to_allocations[med_id].append({
                    'minv': minv,
                    'medrec_qty': med.get('medrec_qty', 0),
                    'reason': med.get('reason', ''),
                    
                })

            # Create MedicineRequestItem and MedicineAllocation
            for med_obj, allocations in medid_to_allocations.items():
                reason = allocations[0].get('reason', 'Medicine allocation')
                # Set status to 'confirmed' for SOAP form logic
                medicine_item = MedicineRequestItem.objects.create(
                    reason=reason,
                    med=med_obj,
                    medreq_id=med_request,
                    status='completed',
                    action_by=staff_instance,
                    completed_by=staff_instance,
                )
                for alloc in allocations:
                    minv = alloc['minv']
                    medrec_qty = alloc['medrec_qty']
                    if minv and medrec_qty > 0:
                        if minv.minv_qty_avail < medrec_qty:
                            return Response(
                                {"error": f"Insufficient stock for medicine ID {minv.minv_id}. Available: {minv.minv_qty_avail}, Requested: {medrec_qty}"},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        # Deduct inventory
                        minv.minv_qty_avail -= medrec_qty
                        minv.temporary_deduction += medrec_qty
                        minv.save()
                        # Create transaction record
                        unit = minv.minv_qty_unit or 'pcs'
                        mdt_qty = f"{medrec_qty} {unit}"
                        MedicineTransactions.objects.create(
                            mdt_qty=mdt_qty,
                            mdt_action="Deducted",
                            staff=staff_instance,
                            minv_id=minv
                        )
                        # Create allocation
                        MedicineAllocation.objects.create(
                            medreqitem=medicine_item,
                            minv=minv,
                            allocated_qty=medrec_qty
                        )

            # Handle file uploads
            uploaded_files = []
            if files:
                serializer = Medicine_FileSerializer(context={'request': request})
                uploaded_files = serializer._upload_files(files, medreq_instance=med_request)

            return Response({
                "message": "Medicine request created successfully",
                "patrec_id": patient_record.patrec_id,
                "medreq_id": med_request.medreq_id,
                "uploaded_files_count": len(uploaded_files)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Unexpected error: {str(e)}")
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
                mdt_action="Deducted",
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
            mode = request.data.get('mode', 'app')
            signature = request.data.get('signature', '')
            pat_id_str = request.data.get('pat_id')

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
                    staff_instance = None

            # Create PatientRecord
            patient_record = PatientRecord.objects.create(
                pat_id=patient_instance,
                patrec_type="Medicine Record",
            )

            # Only update MedicineRequest.patrec if mode == 'app'
            medicine_request.patrec = patient_record
            medicine_request.save()

            medicine_transactions = []

            for medicine in selected_medicines:
                minv_id = medicine.get('minv_id')
                medrec_qty = medicine.get('medrec_qty', 0)
                medreqitem_id = medicine.get('medreqitem_id')
                reason = medicine.get('reason', 'Medicine allocation')

                if not minv_id or medrec_qty <= 0:
                    continue

                try:
                    medicine_inventory = MedicineInventory.objects.get(minv_id=minv_id)
                    available_stock = medicine_inventory.minv_qty_avail
                    if available_stock < medrec_qty:
                        return Response({
                            "error": f"Insufficient stock for {medicine_inventory.med_id.med_name}. Available: {available_stock}, Requested: {medrec_qty}"
                        }, status=status.HTTP_400_BAD_REQUEST)

                    # Update MedicineRequestItem: status and completed_by
                    try:
                        request_item = MedicineRequestItem.objects.get(
                            medreqitem_id=medreqitem_id,
                            medreq_id=medicine_request
                        )
                        request_item.status = 'completed'
                        request_item.completed_by = staff_instance
                        request_item.save()
                    except MedicineRequestItem.DoesNotExist:
                        return Response({
                            "error": f"Medicine request item with ID {medreqitem_id} not found"
                        }, status=status.HTTP_404_NOT_FOUND)

                    # Create MedicineTransaction
                    if medicine_inventory.minv_qty_unit and medicine_inventory.minv_qty_unit.lower() == 'boxes':
                        mdt_qty = f"{medrec_qty} pcs"
                    else:
                        unit = medicine_inventory.minv_qty_unit or 'pcs'
                        mdt_qty = f"{medrec_qty} {unit}"

                    medicine_transaction = MedicineTransactions.objects.create(
                        mdt_qty=mdt_qty,
                        mdt_action="Deducted",
                        staff=staff_instance,
                        minv_id=medicine_inventory,
                    )
                    medicine_transactions.append(medicine_transaction)

                    # Update inventory
                    medicine_inventory.minv_qty_avail -= medrec_qty
                    medicine_inventory.temporary_deduction -= medrec_qty
                    medicine_inventory.save()

                except MedicineInventory.DoesNotExist:
                    return Response({
                        "error": f"Medicine inventory with ID {minv_id} not found"
                    }, status=status.HTTP_404_NOT_FOUND)
                except Exception as e:
                    return Response({
                        "error": f"Error processing medicine {minv_id}: {str(e)}"
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Update medicine request status
            medicine_request.fulfilled_at = timezone.now()  # <-- Set to current time
            medicine_request.signature = signature
            medicine_request.save()

            response_data = {
                "success": True,
                "message": "Medicine allocation processed successfully",
                "medreq_id": medreq_id,
                "mode": mode,
                "medicine_transactions_created": len(medicine_transactions),
                "pat_id": pat_id_str,
                "patrec_id": patient_record.patrec_id if patient_record else None
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Unexpected error: {str(e)}")
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
        
        