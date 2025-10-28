# Rest Framework Imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Django Imports
from django.utils import timezone
from django.db import transaction
from django.db.models import Max

# Model Imports
from apps.complaint.models import Complaint
from apps.clerk.models import ServiceChargePaymentRequest
from apps.treasurer.models import Purpose_And_Rates
from apps.notification.utils import create_notification
from apps.administration.models import Staff

# Python Imports
import logging
import re

logger = logging.getLogger(__name__)


class ServiceChargeRequestCreateView(APIView):
    @transaction.atomic
    def post(self, request, comp_id):
        try:
            complaint = Complaint.objects.get(comp_id=comp_id)
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
            
            Complaint.objects.filter(comp_id=comp_id).update(comp_status="Raised")
            
            # Get all staff with ADMIN position
            admin_staff = Staff.objects.filter(pos__pos_title="ADMIN").select_related("rp")
            
            recipients = [staff.rp for staff in admin_staff if staff.rp]
            
            if recipients:
                create_notification(
                    title="Blotter Request Raised",
                    message=f"Your request is now being raised to higher ups for further action.",
                    sender=request.user.rp.rp_id,
                    recipients=recipients,
                    notif_type="Info",
                    web_route="complaint/view/",
                    web_params={"comp_id": str(complaint.comp_id)},
                    mobile_route="/(my-request)/complaint-tracking/compMainView",
                    mobile_params={"comp_id": str(complaint.comp_id)}
                )
            
            return Response({
                'status': 'success',
                'message': 'Service charge payment request created successfully',
                'comp_status': 'Raised',
                'pay_id': pay_id
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