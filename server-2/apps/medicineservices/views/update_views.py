
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
        
        

        
class UpdateConfirmAllPendingItemsView(generics.UpdateAPIView):
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        medreq_id = kwargs.get('medreq_id')
        # 
        # Validate that medreq_id is provided
        if not medreq_id:
            return Response(
                {"error": "medreq_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify the medicine request exists
         medicine_request = MedicineRequest.objects.get(medreq_id=medreq_id)
        except MedicineRequest.DoesNotExist:
            return Response(
                {"error": f"MedicineRequest with ID {medreq_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all pending items for this medicine request
        pending_items = MedicineRequestItem.objects.filter(
            medreq_id=medreq_id,
            status='pending'
        )
        
        # Count items before update
        items_count = pending_items.count()
        
        if items_count == 0:
            return Response(
                {"message": "No pending items found for this medicine request"},
                status=status.HTTP_200_OK
            )
        
        # Update all pending items to confirmed status
        updated_count = pending_items.update(status='confirmed')
        MedicineRequest.objects.filter(medreq_id=medreq_id).update(
            updated_at=timezone.now()
        )
        
        return Response({
            "message": f"Successfully updated {updated_count} items to confirmed status",
            "medreq_id": medreq_id,
            "updated_count": updated_count
        }, status=status.HTTP_200_OK)
