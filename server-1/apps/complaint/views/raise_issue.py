# Rest Framework Imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# # Django Imports
from django.utils import timezone
from django.db import transaction

# Model Imports
from apps.complaint.models import Complaint
from apps.clerk.models import ServiceChargePaymentRequest
from apps.treasurer.models import Purpose_And_Rates
from apps.notification.utils import create_notification
from apps.administration.models import Staff

# Python Imports
import logging

logger = logging.getLogger(__name__)


class ServiceChargeRequestCreateView(APIView):
    @transaction.atomic
    def post(self, request, comp_id):
        try:
            complaint = Complaint.objects.get(comp_id=comp_id)
            Complaint.objects.filter(comp_id=comp_id).update(comp_status="Raised")
            logger.info(f"Updated complaint status to 'Raised': {comp_id}")
            
            purpose = Purpose_And_Rates.objects.filter(pr_purpose="Summon").first()
            if not purpose:
                logger.error("Purpose 'Summon' not found")
                return Response({
                    'error': "Purpose 'Summon' not found"
                }, status=status.HTTP_400_BAD_REQUEST)
                
            payment_request = ServiceChargePaymentRequest.objects.create(
                pr_id=purpose,
                pay_sr_type="Summon", 
                pay_status="Unpaid", 
                pay_date_req=timezone.now(), 
                comp_id=complaint,
            )
            print(payment_request)
            # Get all staff with Clerk position
            admin_staff = Staff.objects.filter(pos__pos_title="ADMIN").select_related("rp")
            
            recipients = []
            
            for staff in admin_staff:
                if staff.rp:
                    print(f"Clerk RP ID: {staff.rp.rp_id}")
                    recipients.append(staff.rp)
            
            create_notification(
                title="Blotter Request Raised",
                message=f"Your request is now being raised to higher ups for further action.",
                sender=request.user.rp.rp_id,
                recipients=recipients,
                notif_type="Info",
                web_route="complaint/view/",
                web_params={"comp_id": str(complaint.comp_id),},
                mobile_route="/(my-request)/complaint-tracking/compMainView",
                mobile_params={"comp_id": str(complaint.comp_id)}
            )
            
            return Response({
                'status': 'success',
                'message': 'Service charge payment request created successfully',
                'comp_status': 'Raised'
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