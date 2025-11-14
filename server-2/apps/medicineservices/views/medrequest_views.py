import json
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework import status
from ..serializers import *
from pagination import *
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Count, Sum, Prefetch
from rest_framework.exceptions import ValidationError

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
                medreq_id__rp_id__rp_id=rp_id,  # FIX: Use string rp_id value
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
            item.save()
            
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
    
    @transaction.atomic
    def post(self, request):
        try:
            print(f"🔍 DEBUG: Request data keys: {list(request.data.keys())}")
            print(f"🔍 DEBUG: Request FILES keys: {list(request.FILES.keys())}")
            
            data = request.data
            medicines_data = data.get('medicines', '[]')
            print(f"🔍 DEBUG: medicines_data type: {type(medicines_data)}, value: {medicines_data}")
            
            if isinstance(medicines_data, list):
                print("⚠️ WARNING: medicines received as array, taking first element")
                medicines_data = medicines_data[0] if medicines_data else '[]'
            
            try:
                medicines = json.loads(medicines_data)
            except json.JSONDecodeError as e:
                print(f"❌ ERROR: Failed to parse medicines JSON: {e}")
                return Response({"error": "Invalid medicines data format"}, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"🔍 DEBUG: Parsed medicines: {medicines}")
            
            files = request.FILES.getlist('files', [])
            print(f"🔍 DEBUG: Number of files: {len(files)}")
            
            if not medicines:
                return Response({"error": "At least one medicine is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if prescription is required
            requires_prescription = any(med.get('med_type', '') == 'Prescription' for med in medicines)
            if requires_prescription and not files:
                return Response({"error": "Prescription document is required for prescription medicines"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            pat_id = data.get('pat_id')
            if isinstance(pat_id, list):
                pat_id = pat_id[0] if pat_id else None
            rp_id = data.get('rp_id') 
            if isinstance(rp_id, list):
                rp_id = rp_id[0] if rp_id else None
                
            print(f"🔍 DEBUG: Received pat_id: {pat_id}, rp_id: {rp_id}")
                
            if not pat_id and not rp_id:
                return Response({"error": "Either patient ID or resident ID must be provided"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Validate and get instances
            pat_instance = None
            trans_instance = None
            
            # FIX: Get patient instance from rp_id if pat_id is not provided
            if pat_id:
                try:
                    pat_instance = Patient.objects.get(pat_id=pat_id)
                    print(f"✅ DEBUG: Validated pat_id: {pat_id}")
                    trans_instance = getattr(pat_instance, 'trans_id', None)
                except Patient.DoesNotExist:
                    return Response({"error": f"Patient with ID {pat_id} not found"}, status=status.HTTP_404_NOT_FOUND)
            elif rp_id:
                # FIX: Get patient instance from resident profile
                try:
                    rp_instance = ResidentProfile.objects.get(rp_id=rp_id)
                    print(f"✅ DEBUG: Validated rp_id: {rp_id}")
                    
                    # Get patient associated with this resident profile
                    try:
                        pat_instance = Patient.objects.get(rp_id=rp_instance)
                        print(f"✅ DEBUG: Found patient for resident: {pat_instance.pat_id}")
                    except Patient.DoesNotExist:
                        return Response({"error": f"No patient found for resident ID {rp_id}"}, status=status.HTTP_404_NOT_FOUND)
                        
                except ResidentProfile.DoesNotExist:
                    return Response({"error": f"Resident with ID {rp_id} not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # FIX: Create PatientRecord with the patient instance
            if not pat_instance:
                return Response({"error": "Could not determine patient for this request"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            patient_record = PatientRecord.objects.create(
                pat_id=pat_instance,  # This must be a Patient instance, not ID
                patrec_type="Medicine Record",
            )
            print(f"✅ DEBUG: Created PatientRecord: {patient_record.patrec_id} for patient: {pat_instance.pat_id}")
            
            # Create MedicineRequest
            medicine_request = MedicineRequest.objects.create(
                rp_id=pat_instance.rp_id if pat_instance.pat_type == 'Resident' else None,
                trans_id=pat_instance.trans_id if pat_instance.pat_type == 'Transient' else None,
                mode='app',
                requested_at=timezone.now(),
                signature=data.get('signature', ''),
                patrec=patient_record
            )
            print(f"✅ DEBUG: Created MedicineRequest: {medicine_request.medreq_id}")
            
            # Create MedicineRequestItem and MedicineAllocation for each medicine
            for med in medicines:
                minv_id = med.get('minv_id')
                if not minv_id:
                    return Response({"error": "minv_id is required for each medicine"}, 
                                  status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    medicine_inventory = MedicineInventory.objects.get(minv_id=int(minv_id))
                except MedicineInventory.DoesNotExist:
                    return Response({"error": f"Medicine inventory with ID {minv_id} not found"}, 
                                  status=status.HTTP_404_NOT_FOUND)
                
                # Create MedicineRequestItem
                medicine_item = MedicineRequestItem.objects.create(
                    medreq_id=medicine_request,
                    med=medicine_inventory.med_id,
                    reason=med.get('reason', ''),
                    status='pending'
                )
                
                # Create MedicineAllocation
                allocated_qty = med.get('quantity', 1)  # Default to 1 if not provided
                if allocated_qty > 0:
                    MedicineAllocation.objects.create(
                        medreqitem=medicine_item,
                        minv=medicine_inventory,
                        allocated_qty=allocated_qty
                    )
                    
                    # Update temporary deduction
                    medicine_inventory.temporary_deduction += allocated_qty
                    medicine_inventory.save()
            
            print(f"✅ DEBUG: Created {len(medicines)} MedicineRequestItems and MedicineAllocations")
            
            # Handle file uploads
            uploaded_files = []
            if files:
                try:
                    for file in files:
                        medicine_file = Medicine_File.objects.create(
                            medf_name=file.name,
                            medf_type=file.content_type,
                            medf_path=f"uploads/{file.name}",
                            medf_url=f"/media/uploads/{file.name}",
                            medreq=medicine_request
                        )
                        uploaded_files.append(medicine_file.medf_id)
                    print(f"✅ DEBUG: Successfully uploaded {len(uploaded_files)} files")
                except Exception as e:
                    print(f"❌ ERROR: File upload failed: {str(e)}")
                    # Don't raise exception here, just log it
            
            return Response({
                "success": True,
                "medreq_id": medicine_request.medreq_id,
                "message": "Medicine request submitted successfully",
                "files_uploaded": len(uploaded_files)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            print(f"❌ ERROR: Full traceback: {traceback.format_exc()}")
            return Response({"error": f"Internal server error: {str(e)}"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)