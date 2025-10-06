# Rest Framework Imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Django Imports
from django.utils import timezone
from django.db import transaction

# Model Imports
from apps.complaint.models import Complaint
from apps.clerk.models import ServiceChargeRequest

# Python Imports
import logging

logger = logging.getLogger(__name__)


class ServiceChargeRequestCreateView(APIView):
    @transaction.atomic
    def post(self, request, comp_id):
        try:
            complaint = Complaint.objects.get(comp_id=comp_id)
            logger.info(f"Found complaint: {complaint.comp_id}")

            Complaint.objects.filter(comp_id=comp_id).update(comp_status="Raised")
            logger.info(f"Updated complaint status to 'Raised': {comp_id}")

            sr_count = ServiceChargeRequest.objects.count() + 1
            year_suffix = timezone.now().year % 100
            sr_id = f"SR{sr_count:03d}-{year_suffix:02d}"
            
            logger.info(f"Generated SR Code: {sr_id}")
            
            service_request = ServiceChargeRequest.objects.create(
                sr_id=sr_id,
                comp_id=complaint,
                sr_req_status="Pending", 
                sr_type="Summon",
                sr_case_status="Waiting for Schedule",
                sr_req_date=timezone.now()
            )
            
            logger.info(f"Created service request: {service_request.sr_id}")
            
            return Response({
                'sr_id': service_request.sr_id,
                'status': 'success',
                'message': 'Service charge request created successfully',
                'comp_status': 'Raised'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating service request: {str(e)}")
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            