import json
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework import status
from ..serializers import *
from pagination import *
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Count, Sum
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
            'medreq_id__rp_id__per__personaladdress_set__add',  # Prefetch addresses
            'medreq_id__pat_id__per__personaladdress_set__add',  # Prefetch patient addresses
        ).order_by('-medreq_id__requested_at')
        
class SubmitMedicineRequestView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    
    @transaction.atomic
    def post(self, request):
        try:
            data = request.data
            # Handle medicines as array or single string
            medicines_data = data.get('medicines', '[]')
            if isinstance(medicines_data, list):
                print("Warning: medicines received as array, taking first element")
                medicines_data = medicines_data[0]
            medicines = json.loads(medicines_data)
            files = request.FILES.getlist('files', [])
            
            if not medicines:
                return Response({"error": "At least one medicine is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            requires_prescription = any(med.get('med_type', '') == 'Prescription' for med in medicines)
            if requires_prescription and not files:
                return Response({"error": "Prescription document is required for prescription medicines"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            pat_id = data.get('pat_id')
            if isinstance(pat_id, list):
                print("Warning: pat_id received as array, taking first element")
                pat_id = pat_id[0]
            rp_id = data.get('rp_id')
            if isinstance(rp_id, list):
                print("Warning: rp_id received as array, taking first element")
                rp_id = rp_id[0]
                
            print(f"Received pat_id: {pat_id}, rp_id: {rp_id}")
                
            if not pat_id and not rp_id:
                return Response({"error": "Either patient ID or resident ID must be provided"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            if pat_id and rp_id:
            # Both provided: Prioritize pat_id (user is a patient linked to resident)
                print("Prioritizing pat_id over rp_id")
                rp_id = None  # Ignore rp_id
            elif not pat_id and not rp_id:
                return Response({"error": "Either patient ID (pat_id) or resident ID (rp_id) must be provided"},
                            status=status.HTTP_400_BAD_REQUEST)
            elif pat_id:
                print("Using pat_id only")
            else:
                print("Using rp_id only")
            
            pat_instance = None
            
            if pat_id:
                try:
                    pat_instance = Patient.objects.get(pat_id=pat_id)
                    print(f"Validated pat_id: {pat_id} -> Patient {pat_instance}")
                except Patient.DoesNotExist:
                    return Response({"error": f"Patient with ID {pat_id} not found"}, status=status.HTTP_404_NOT_FOUND)

            rp_instance = None
            if rp_id:
                try:
                    rp_instance = ResidentProfile.objects.get(rp_id=rp_id)
                    print(f"Validated rp_id: {rp_id} -> Resident {rp_instance}")
                except ResidentProfile.DoesNotExist:
                    return Response({"error": f"Resident with ID {rp_id} not found"}, status=status.HTTP_404_NOT_FOUND)
                
            medicine_request = MedicineRequest.objects.create(
                pat_id=pat_instance,
                rp_id=rp_instance,
                mode='app'
            )
            
            request_items = []
            for med in medicines:
                if 'minv_id' not in med:
                    return Response({"error": f"minv_id is required for each medicine"}, 
                                  status=status.HTTP_400_BAD_REQUEST)
                try:
                    minv_id = int(med['minv_id'])
                    medicine_inv = MedicineInventory.objects.get(minv_id=minv_id)
                    # print(f"Processing minv_id: {minv_id}, med_id: {medicine_inv.med_id.pk}")
                    request_item = MedicineRequestItem(
                        medreq_id=medicine_request,
                        minv_id=None,
                        med=medicine_inv.med_id,  # Assign Medicinelist object
                        medreqitem_qty=med['quantity'],
                        reason=med.get('reason', ''),
                        status='pending'
                    )
                    request_items.append(request_item)
                except ValueError:
                    return Response({"error": f"Invalid minv_id: {med['minv_id']} must be a number"}, 
                                  status=status.HTTP_400_BAD_REQUEST)
                except MedicineInventory.DoesNotExist:
                    return Response({"error": f"Medicine with minv_id {med['minv_id']} not found"}, 
                                  status=status.HTTP_404_NOT_FOUND)
            
            # # Debug: Log request items
            # for item in request_items:
            #     print(f"Creating MedicineRequestItem: medreq_id={item.medreq_id.medreq_id}, minv_id={item.minv_id.minv_id}, med_id={item.med.pk}")
            
            MedicineRequestItem.objects.bulk_create(request_items)
            print(f"Created request at: {medicine_request.requested_at}")
            uploaded_files = []
            if files:
                try:
                    # Convert Django file objects to the format expected by the serializer
                    file_data_list = []
                    for file in files:
                        # Read file content and convert to base64 data URL format
                        file_content = file.read()
                        import base64
                        base64_content = base64.b64encode(file_content).decode('utf-8')
                        data_url = f"data:{file.content_type};base64,{base64_content}"
                        
                        file_data_list.append({
                            'name': file.name,
                            'type': file.content_type,
                            'file': data_url
                        })
                    
                    # Use the Medicine_FileSerializer to upload files to Supabase
                    serializer = Medicine_FileSerializer(context={'request': request})
                    uploaded_files = serializer._upload_files(
                        file_data_list, 
                        medreq_instance=medicine_request  # Associate with the medicine request, not the item
                    )
                    
                    print(f"Successfully uploaded {len(uploaded_files)} files to Supabase")
                    
                except Exception as e:
                    print(f"Error uploading files to Supabase: {str(e)}")
                    # If file upload fails, we might want to roll back the transaction
                    raise Exception(f"File upload failed: {str(e)}")
            
            return Response({
                "success": True,
                "medreq_id": medicine_request.medreq_id,
                "message": "Medicine request submitted successfully",
                "files_uploaded": len(uploaded_files)
            }, status=status.HTTP_201_CREATED)
            
        except (Patient.DoesNotExist, ResidentProfile.DoesNotExist) as e:
            return Response({"error": "Patient or resident not found"}, 
                          status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Internal server error: {str(e)}")
            return Response({"error": f"Internal server error: {str(e)}"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
