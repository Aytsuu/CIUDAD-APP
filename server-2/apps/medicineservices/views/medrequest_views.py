import json
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework import status
from ..serializers import *
from pagination import *
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Count, Sum, Prefetch


class UserMedicineRequestsView(generics.ListAPIView):
    serializer_class = MedicineRequestSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        pat_id = self.request.query_params.get('pat_id')
        rp_id = self.request.query_params.get('rp_id')

        if not pat_id and not rp_id:
            return MedicineRequest.objects.none()

        queryset = MedicineRequest.objects.select_related(
            'pat_id', 'rp_id'
        ).prefetch_related(
            Prefetch('items', queryset=MedicineRequestItem.objects.select_related(
                'minv_id', 'minv_id__med_id', 'med'
            ).all())  # Include all items
        ).order_by('-requested_at')

        if pat_id:
            queryset = queryset.filter(pat_id=pat_id)
        elif rp_id:
            queryset = queryset.filter(rp_id=rp_id)

        return queryset
    

class CheckPendingMedicineRequestView(APIView):
    def get(self, request, rp_id, med_id):
        try:
            # Try to get the resident profile
            try:
                resident = ResidentProfile.objects.get(rp_id=rp_id)
            except ResidentProfile.DoesNotExist:
                return Response({'has_pending_request': False}, status=status.HTTP_200_OK)

            # Try to get linked patient, if any
            patient = None
            try:
                patient = Patient.objects.get(rp_id=resident)
            except Patient.DoesNotExist:
                pass

            # Define user condition Q
            user_q = Q(medreq_id__rp_id=rp_id) | (Q(medreq_id__pat_id=patient.pat_id) if patient else Q())

            # Define medicine condition Q
            medicine_q = Q(med__med_id=med_id) | Q(minv_id__med_id__med_id=med_id)

            # Query MedicineRequestItem for pending items
            pending_items = MedicineRequestItem.objects.filter(
                user_q,
                medicine_q,
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
        # Handle rp_id (residents) or pat_id (patients)
        rp_id = self.request.query_params.get('rp_id')
        pat_id = self.request.query_params.get('pat_id')
        
        if not rp_id and not pat_id:
            raise ValidationError({"error": "Either rp_id or pat_id is required"})
        
        queryset = MedicineRequestItem.objects
        
        if rp_id:
            queryset = queryset.filter(medreq_id__rp_id=rp_id)
        elif pat_id:
            queryset = queryset.filter(medreq_id__pat_id=pat_id)
        
        # Optional: Filter by include_archived param (default: True for "all")
        include_archived = self.request.query_params.get('include_archived', 'true').lower() == 'true'
        if not include_archived:
            queryset = queryset.filter(is_archived=False)   
        
        # Optimize with selects/prefetches
        return queryset.select_related(
            'minv_id', 'minv_id__med_id', 'medreq_id'
        ).prefetch_related(
            # 'medicine_files'
        ).order_by('-created_at').distinct()

    

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
            'minv_id', 'medreq_id', 'med', 'medreq_id__rp_id', 'medreq_id__pat_id',
            'medreq_id__rp_id__per',  # Add resident profile personal info
            'medreq_id__pat_id__per',  # Add patient personal info
        ).prefetch_related(
            'minv_id__med_id',
            'medreq_id__rp_id__per__ppersonal_addresses__add',  # Prefetch addresses
            'medreq_id__pat_id__per__ppersonal_addresses__add',  # Prefetch patient addresses
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
            
            # Prioritize pat_id over rp_id
            if pat_id and rp_id:
                print("🔍 DEBUG: Both pat_id and rp_id provided - prioritizing pat_id")
                rp_id = None
            
            # Validate and get instances
            pat_instance = None
            trans_instance = None
            if pat_id:
                try:
                    pat_instance = Patient.objects.get(pat_id=pat_id)
                    print(f"✅ DEBUG: Validated pat_id: {pat_id}")
                    trans_instance = getattr(pat_instance, 'trans_id', None)
                except Patient.DoesNotExist:
                    return Response({"error": f"Patient with ID {pat_id} not found"}, status=status.HTTP_404_NOT_FOUND)

            rp_instance = None
            if rp_id:
                try:
                    rp_instance = ResidentProfile.objects.get(rp_id=rp_id)
                    print(f"✅ DEBUG: Validated rp_id: {rp_id}")
                except ResidentProfile.DoesNotExist:
                    return Response({"error": f"Resident with ID {rp_id} not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Create MedicineRequest (include trans_id if available)
            medicine_request = MedicineRequest.objects.create(
                pat_id=pat_instance,
                rp_id=rp_instance,
                trans_id=trans_instance,
                mode='walk-in',
            )
            print(f"✅ DEBUG: Created MedicineRequest: {medicine_request.medreq_id}")
            
            # Group medicines by med_id (from MedicineInventory FK)
            medid_to_allocations = {}
            for med in medicines:
                minv_id = med.get('minv_id')
                if not minv_id:
                    return Response({"error": f"minv_id is required for each medicine"}, 
                                  status=status.HTTP_400_BAD_REQUEST)
                try:
                    medicine_inv = MedicineInventory.objects.get(minv_id=int(minv_id))
                    med_id = str(medicine_inv.med_id.med_id)
                except MedicineInventory.DoesNotExist:
                    return Response({"error": f"Medicine with minv_id {minv_id} not found"}, 
                                  status=status.HTTP_404_NOT_FOUND)
                if med_id not in medid_to_allocations:
                    medid_to_allocations[med_id] = []
                medid_to_allocations[med_id].append({
                    'minv_id': minv_id,
                    'allocated_qty': med.get('quantity', 0),
                    'reason': med.get('reason', ''),
                    'signature': med.get('signature', ''),
                })
            
            # Create MedicineRequestItem and MedicineAllocation
            for med_id, allocations in medid_to_allocations.items():
                reason = allocations[0]['reason']
                signature = allocations[0].get('signature', '')
                medicine_item = MedicineRequestItem.objects.create(
                    medreq_id=medicine_request,
                    med_id=med_id,
                    reason=reason,
                    status='pending',
                    signature=signature
                )
                for alloc in allocations:
                    minv_id = alloc['minv_id']
                    allocated_qty = alloc['allocated_qty']
                    if minv_id and allocated_qty > 0:
                        try:
                            medicine_inventory = MedicineInventory.objects.get(minv_id=int(minv_id))
                            medicine_inventory.temporary_deduction += allocated_qty
                            medicine_inventory.save()
                        except MedicineInventory.DoesNotExist:
                            return Response({"error": f"Medicine inventory with ID {minv_id} not found"}, 
                                            status=status.HTTP_404_NOT_FOUND)
                        MedicineAllocation.objects.create(
                            medreqitem=medicine_item,
                            minv=medicine_inventory,
                            allocated_qty=allocated_qty
                        )
            
            print(f"✅ DEBUG: Created MedicineRequestItems and MedicineAllocations")
            
            # Handle file uploads
            uploaded_files = []
            if files:
                try:
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
                    
                    # Upload files
                    serializer = Medicine_FileSerializer(context={'request': request})
                    uploaded_files = serializer._upload_files(
                        file_data_list, 
                        medreq_instance=medicine_request
                    )
                    
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