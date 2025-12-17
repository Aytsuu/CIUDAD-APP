from rest_framework.generics import UpdateAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.utils import timezone
from apps.complaint.models import Complaint, Complaint_History
from apps.complaint.serializers import ComplaintSerializer, ComplaintUpdateSerializer
from apps.administration.models import Staff, Position
from apps.profiling.models import ResidentProfile, Personal

class ComplaintUpdateView(UpdateAPIView):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintUpdateSerializer 
    lookup_field = 'comp_id'

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        complaint = get_object_or_404(Complaint, comp_id=kwargs['comp_id'])
        
        # Get old status before update
        old_status = complaint.comp_status
        
        # Get old values for rejection/cancellation reasons
        old_rejection_reason = complaint.comp_rejection_reason
        old_cancel_reason = complaint.comp_cancel_reason
        
        serializer = self.get_serializer(complaint, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Save the complaint
            updated_complaint = serializer.save()
            
            # Get new status after update
            new_status = updated_complaint.comp_status
            
            # =============================================
            # GET STAFF INFORMATION FROM REQUEST USER
            # =============================================
            staff = None
            staff_name = "System"
            staff_position = None
            
            if hasattr(request.user, 'staff'):
                staff = request.user.staff
                
                # Get staff name from ResidentProfile -> Personal
                if staff.rp and staff.rp.per:
                    personal = staff.rp.per
                    staff_name = f"{personal.per_fname} {personal.per_lname}"
                else:
                    # Fallback to staff.staff_name if it exists
                    staff_name = getattr(staff, 'staff_name', 'Unknown Staff')
                
                # Get staff position
                if staff.pos:
                    staff_position = staff.pos.pos_title
            
            # Create action description
            action = f"Status updated to {new_status}"
            if old_status != new_status:
                action = f"Status changed from {old_status} to {new_status}"
            
            # Build history details
            history_details = {
                'old_status': old_status,
                'new_status': new_status,
                'updated_by': {
                    'staff_id': staff.staff_id if staff else None,
                    'staff_name': staff_name,
                    'staff_position': staff_position,
                },
                'timestamp': timezone.now().isoformat()
            }
            
            # Add rejection reason if status is Rejected
            if new_status == "Rejected" and updated_complaint.comp_rejection_reason:
                history_details['rejection_reason'] = updated_complaint.comp_rejection_reason
                if updated_complaint.comp_rejection_reason != old_rejection_reason:
                    action = f"Status changed from {old_status} to Rejected"
            
            # Add cancellation reason if status is Cancelled
            if new_status == "Cancelled" and updated_complaint.comp_cancel_reason:
                history_details['cancel_reason'] = updated_complaint.comp_cancel_reason
                if updated_complaint.comp_cancel_reason != old_cancel_reason:
                    action = f"Status changed from {old_status} to Cancelled"
            
            # Create history record
            Complaint_History.objects.create(
                comp=updated_complaint,
                comp_hist_action=action,
                comp_hist_details=history_details,
                staff=staff
            )
            
            full_serializer = ComplaintSerializer(updated_complaint)
            return Response(full_serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)