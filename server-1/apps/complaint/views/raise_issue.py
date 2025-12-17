# Imports
# Rest Framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Django
from django.utils import timezone
from django.db import transaction
from django.db.models import Max

# Models
from apps.complaint.models import Complaint, Complaint_History
from apps.clerk.models import ServiceChargePaymentRequest
from apps.treasurer.models import Purpose_And_Rates
from apps.notification.utils import create_notification
from apps.administration.models import Staff

# Python
import logging
import re

logger = logging.getLogger(__name__)


class ServiceChargeRequestCreateView(APIView):
    @transaction.atomic
    def post(self, request, comp_id):
        try:
            complaint = Complaint.objects.get(comp_id=comp_id)
            
            # Track old status
            old_status = complaint.comp_status
            
            purpose = Purpose_And_Rates.objects.filter(pr_purpose="Summon").first()
            if not purpose:
                logger.error("Purpose 'Summon' not found")
                return Response({
                    'error': "Purpose 'Summon' not found"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate next pay_id
            current_year = timezone.now().strftime('%y')
            
            # Get all payments for current year and find the highest number
            current_year_payments = ServiceChargePaymentRequest.objects.filter(
                pay_id__endswith=f'-{current_year}'
            )
            
            max_number = 0
            for payment in current_year_payments:
                match = re.search(r'SP(\d+)-\d+', payment.pay_id)
                if match:
                    number = int(match.group(1))
                    max_number = max(max_number, number)
            
            # Generate new pay_id
            next_number = max_number + 1
            pay_id = f"SP{next_number:04d}-{current_year}"
            
            payment_request = ServiceChargePaymentRequest.objects.create(
                pay_id=pay_id,
                pr_id=purpose,
                pay_sr_type="Summon", 
                pay_status="Unpaid", 
                pay_date_req=timezone.now(), 
                comp_id=complaint,
            )
            
            # Update complaint status to Raised
            complaint.comp_status = "Raised"
            complaint.save()
            
            action = f"Status changed from {old_status} to Raised (Service Charge Created)"
            
            Complaint_History.objects.create(
                comp=complaint,
                comp_hist_action=action,
                comp_hist_details={
                    'old_status': old_status,
                    'new_status': "Raised",
                    'action': "Service charge payment request created",
                    'pay_id': pay_id,
                    'updated_by': username,
                    'timestamp': timezone.now().isoformat()
                },
                staff=request.user.staff if hasattr(request.user, 'staff') else None
            )
            
            # Get all staff with ADMIN position
            admin_staff = Staff.objects.filter(pos__pos_title="ADMIN", staff_type="BARANGAY STAFF").select_related("rp")
            
            recipients = [staff.rp for staff in admin_staff if staff.rp]
            
            # Uncomment if you want to send notifications
            # if recipients:
            #     create_notification(
            #         title="Blotter Request Raised",
            #         message=f"Your request is now being raised to higher ups for further action.",
            #         recipients=recipients,
            #         notif_type="Info",
            #         web_route="complaint/view/",
            #         web_params={"comp_id": str(complaint.comp_id)},
            #         mobile_route="/(my-request)/complaint-tracking/compMainView",
            #         mobile_params={"comp_id": str(complaint.comp_id)}
            #     )
            
            return Response({
                'status': 'success',
                'message': 'Service charge payment request created successfully',
                'comp_status': 'Raised',
                'pay_id': pay_id,
                'history_added': True
            }, status=status.HTTP_201_CREATED)
            
        except Complaint.DoesNotExist:
            logger.error(f"Complaint not found: {comp_id}")
            return Response({
                'error': 'Complaint not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error creating payment request: {str(e)}")
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)