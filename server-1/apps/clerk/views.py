from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Prefetch
from django.core.exceptions import FieldError
from django.utils import timezone
from rest_framework.permissions import AllowAny
from apps.act_log.utils import ActivityLogMixin
from apps.pagination import StandardResultsPagination
import logging
import traceback
from .serializers import *
from apps.complaint.models import Complainant, Accused, ComplaintAccused
from apps.treasurer.models import Invoice
from apps.act_log.utils import create_activity_log
from .models import (
    ClerkCertificate,
    IssuedCertificate,
    BusinessPermitRequest,
    IssuedBusinessPermit,
)
from rest_framework.generics import RetrieveAPIView
from django.http import Http404 
from django.db.models import Q
from utils.supabase_client import upload_to_storage
import base64
import uuid

logger = logging.getLogger(__name__)
    

class ServiceChargePaymentRequestView(generics.ListCreateAPIView):
    serializer_class = ServiceChargePaymentRequestSerializer
    queryset = ServiceChargePaymentRequest.objects.all()
    

#========================== CASE TACKING VIEW ========================
# class CaseTrackingView(generics.RetrieveAPIView):
#     serializer_class = CaseTrackingSerializer
#     def get_object(self):
#         comp_id = self.kwargs.get('comp_id')
        
#         try:
#             case = ServiceChargeRequest.objects.get(comp_id=comp_id)
            
#             return case
#         except ServiceChargeRequest.DoesNotExist:
#             raise Http404("Case not found for this complaint")
    
#     def get(self, request, *args, **kwargs):
#         case = self.get_object()
#         serializer = self.get_serializer(case)
#         return Response(serializer.data)



# ===========================Certificate Views=====================

class CertificateListView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ClerkCertificateSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = ClerkCertificate.objects.select_related(
            'rp_id__per',
            'pr_id'
        ).prefetch_related(
            'rp_id__per__personal_addresses__add'
        ).prefetch_related(
            Prefetch(
                'issuedcertificate_set',
                queryset=IssuedCertificate.objects.select_related('certificate', 'staff')
            )
        ).all()

        # Search functionality - matching web version
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(cr_id__icontains=search) |
                Q(rp_id__per__per_fname__icontains=search) |
                Q(rp_id__per__per_lname__icontains=search) |
                Q(pr_id__pr_purpose__icontains=search) |
                Q(cr_req_status__icontains=search) |
                Q(cr_req_payment_status__icontains=search)
            )

        # Status filter - matching web version
        status_filter = self.request.GET.get('status', None)
        if status_filter:
            queryset = queryset.filter(cr_req_status=status_filter)

        # Payment status filter - matching web version
        payment_status = self.request.GET.get('payment_status', None)
        if payment_status:
            queryset = queryset.filter(cr_req_payment_status=payment_status)

        # Purpose filter - matching web version
        purpose_filter = self.request.query_params.get('purpose', None)
        if purpose_filter:
            queryset = queryset.filter(pr_id__pr_purpose=purpose_filter)

        return queryset.order_by('-cr_req_request_date')

    def create(self, request, *args, **kwargs):
        try:
            payload = request.data.copy()
            status_val = payload.get('cr_req_status')
            if status_val and str(status_val).lower().strip() in ['completed', 'cancelled']:
                payload['cr_date_completed'] = timezone.now().date()
            else:
                
                payload.pop('cr_date_completed', None)

            serializer = self.get_serializer(data=payload)
            serializer.is_valid(raise_exception=True)
            certificate = serializer.save()

            try:
                from apps.act_log.utils import create_activity_log
                from apps.administration.models import Staff

                # Get staff_id from request data
                staff_id = request.data.get('staff_id')
                
                if staff_id:
                    # Handle both string and integer staff_id
                    staff_id_str = str(staff_id).strip()
                    if len(staff_id_str) < 11:
                        staff_id_str = staff_id_str.zfill(11)
                    
                    # Check if staff exists
                    staff = Staff.objects.filter(staff_id=staff_id_str).first()
                    
                    if staff:
                        # Get resident name
                        resident_name = "Unknown"
                        if certificate.rp_id and certificate.rp_id.per:
                            per = certificate.rp_id.per
                            resident_name = f"{per.per_fname} {per.per_lname}"
                        
                        # Get purpose
                        purpose = certificate.pr_id.pr_purpose if certificate.pr_id else 'N/A'
                        
                        create_activity_log(
                            act_type="Personal Clearance Request Created",
                            act_description=f"Personal clearance request {certificate.cr_id} created for {resident_name} ({purpose})",
                            staff=staff,
                            record_id=certificate.cr_id
                        )
                        logger.info(f"Activity logged for certificate creation: {certificate.cr_id}")
                    else:
                        logger.warning(f"Staff with ID {staff_id_str} not found for activity logging")
                else:
                    logger.warning("No staff_id provided in request for activity logging")

            except Exception as log_error:
                logger.error(f"Failed to log activity for certificate creation: {str(log_error)}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating certificate: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            
            # Apply pagination
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            # Fallback for non-paginated requests
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in CertificateListView: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": str(e), "traceback": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class NonResidentsCertReqView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = NonResidentCertReqSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        queryset = NonResidentCertificateRequest.objects.select_related('pr_id').all()
        
        # Search functionality
        search = self.request.GET.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(nrc_id__icontains=search) |
                Q(nrc_requester__icontains=search) |
                Q(nrc_address__icontains=search) |
                Q(pr_id__pr_purpose__icontains=search) |
                Q(nrc_req_status__icontains=search) |
                Q(nrc_req_payment_status__icontains=search)
            )
        
        # Status filter
        status_filter = self.request.GET.get('status', None)
        if status_filter:
            queryset = queryset.filter(nrc_req_status=status_filter)
        
        # Payment status filter
        payment_status = self.request.GET.get('payment_status', None)
        if payment_status:
            queryset = queryset.filter(nrc_req_payment_status=payment_status)
        
        return queryset.order_by('-nrc_req_date')
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in NonResidentsCertReqView.list: {str(e)}")
            return Response(
                {
                    "error": str(e),
                    "detail": "An error occurred while retrieving non-resident certificate requests"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UpdateNonResidentCertReqView(ActivityLogMixin, generics.UpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = NonResidentCertReqUpdateSerializer
    queryset = NonResidentCertificateRequest.objects.all()
    lookup_field = 'nrc_id'
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_payment_status = instance.nrc_req_payment_status
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Check if payment status changed to "Paid" and create automatic income entry
        new_payment_status = instance.nrc_req_payment_status
        if old_payment_status != "Paid" and new_payment_status == "Paid":
            try:
                from apps.treasurer.utils import create_automatic_income_entry
                
                # Get purpose from the non-resident certificate request
                purpose = "Unknown"
                if instance.pr_id:
                    purpose = instance.pr_id.pr_purpose
                
                # Get amount from purpose and rates
                amount = 0.0
                if instance.pr_id:
                    amount = float(instance.pr_id.pr_rate)
                
                # Get staff ID from request, certificate, or use default
                staff_id = request.data.get('staff_id') or getattr(instance, 'staff_id', None)
                
                # Get invoice discount reason if available
                invoice_discount_reason = None
                try:
                    from apps.treasurer.models import Invoice
                    invoice = Invoice.objects.filter(nrc_id=instance).first()
                    if invoice:
                        invoice_discount_reason = invoice.inv_discount_reason
                except Exception as e:
                    logger.warning(f"Could not get invoice discount reason for non-resident certificate {instance.nrc_id}: {str(e)}")
                
                # Create automatic income entry
                create_automatic_income_entry(
                    request_type='CERT',
                    request_id=instance.nrc_id,
                    purpose=purpose,
                    amount=amount,
                    staff_id=staff_id,
                    discount_notes=getattr(instance, 'nrc_discount_reason', None),
                    invoice_discount_reason=invoice_discount_reason
                )
                logger.info(f"Created automatic income entry for non-resident certificate {instance.nrc_id}")
            except Exception as e:
                logger.error(f"Failed to create automatic income entry for non-resident certificate {instance.nrc_id}: {str(e)}")
                # Don't fail the request if income tracking fails
        
        return Response({
            'message': 'Non-resident certificate request status updated successfully',
            'nrc_id': instance.nrc_id,
            'new_payment_status': instance.nrc_req_payment_status
        }, status=status.HTTP_200_OK)

    
class CertificateStatusUpdateView(ActivityLogMixin, generics.UpdateAPIView):
    permission_classes = [AllowAny]
    queryset = ClerkCertificate.objects.all()
    serializer_class = CertificateStatusUpdateSerializer
    lookup_field = 'cr_id'
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_payment_status = instance.cr_req_payment_status
        old_status = instance.cr_req_status
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Get updated instance to check for changes
        instance.refresh_from_db()
        new_payment_status = instance.cr_req_payment_status
        new_status = instance.cr_req_status
        
        # Debug logging
        logger.info(f"CertificateStatusUpdateView update: cr_id={instance.cr_id}, old_payment_status={old_payment_status}, new_payment_status={new_payment_status}, old_status={old_status}, new_status={new_status}")
        
        # Log payment status change activity if it changed
        if old_payment_status != new_payment_status:
            try:
                from apps.act_log.utils import create_activity_log
                from apps.administration.models import Staff
                
                # Get staff member - try multiple sources
                staff = None
                staff_id = request.data.get('staff_id')
                
                if staff_id:
                    # Format staff_id properly (pad with leading zeros if needed)
                    if len(str(staff_id)) < 11:
                        staff_id = str(staff_id).zfill(11)
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                
                # Fallback: try to get staff from related records
                if not staff and hasattr(instance, 'ra_id') and instance.ra_id:
                    staff_id = getattr(instance.ra_id, 'staff_id', None)
                    if staff_id and len(str(staff_id)) < 11:
                        staff_id = str(staff_id).zfill(11)
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                
                # Final fallback: use any available staff
                if not staff:
                    staff = Staff.objects.first()
                
                if staff:
                    # Get resident name for better description
                    resident_name = "Unknown"
                    if instance.rp_id and instance.rp_id.per:
                        per = instance.rp_id.per
                        resident_name = f"{per.per_fname} {per.per_lname}"
                    
                    # Get purpose
                    purpose = instance.pr_id.pr_purpose if instance.pr_id else 'N/A'
                    
                    # Create activity log for payment status change
                    create_activity_log(
                        act_type="Payment Status Updated",
                        act_description=f"Payment status for certificate {instance.cr_id} changed from '{old_payment_status}' to '{new_payment_status}' for {resident_name} ({purpose})",
                        staff=staff,
                        record_id=instance.cr_id
                    )
                    logger.info(f"Activity logged for certificate status update payment change: {instance.cr_id}")
                else:
                    logger.warning(f"No staff found for certificate status update payment change logging: {instance.cr_id}")
                    
            except Exception as log_error:
                logger.error(f"Failed to log certificate status update payment change activity: {str(log_error)}")
                # Don't fail the request if logging fails
        
        # Check if payment status changed to "Paid" and create automatic income entry
        if old_payment_status != "Paid" and new_payment_status == "Paid":
            try:
                from apps.treasurer.utils import create_automatic_income_entry
                
                # Get purpose from the certificate
                purpose = "Unknown"
                if instance.pr_id:
                    purpose = instance.pr_id.pr_purpose
                
                # Get amount from purpose and rates
                amount = 0.0
                if instance.pr_id:
                    amount = float(instance.pr_id.pr_rate)
                
                # Get staff from certificate record (primary source) or request data
                staff_id = getattr(instance, 'staff_id', None) or request.data.get('staff_id')
                
                # Get invoice discount reason if available
                invoice_discount_reason = None
                try:
                    from apps.treasurer.models import Invoice
                    invoice = Invoice.objects.filter(cr_id=instance).first()
                    if invoice:
                        invoice_discount_reason = invoice.inv_discount_reason
                except Exception as e:
                    logger.warning(f"Could not get invoice discount reason for certificate {instance.cr_id}: {str(e)}")
                
                # Create automatic income entry
                create_automatic_income_entry(
                    request_type='CERT',
                    request_id=instance.cr_id,
                    purpose=purpose,
                    amount=amount,
                    staff_id=staff_id,
                    discount_notes=getattr(instance, 'cr_discount_reason', None),
                    invoice_discount_reason=invoice_discount_reason
                )
                logger.info(f"Created automatic income entry for certificate {instance.cr_id}")
            except Exception as e:
                logger.error(f"Failed to create automatic income entry for certificate {instance.cr_id}: {str(e)}")
                # Don't fail the request if income tracking fails
        
        return Response({
            'message': 'Status updated successfully',
            'cr_id': instance.cr_id,
            'new_status': instance.cr_req_status
        }, status=status.HTTP_200_OK)
    

class CertificateDetailView(ActivityLogMixin, generics.RetrieveUpdateAPIView):  # Changed from RetrieveAPIView
    permission_classes = [AllowAny]
    queryset = ClerkCertificate.objects.all()
    serializer_class = ClerkCertificateSerializer
    lookup_field = 'cr_id'
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_payment_status = instance.cr_req_payment_status
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Debug logging
        logger.info(f"CertificateDetailView update: cr_id={instance.cr_id}, old_payment_status={old_payment_status}, new_data={request.data}")
        
        self.perform_update(serializer)
        
        # Get updated instance to check for changes
        instance.refresh_from_db()
        new_payment_status = instance.cr_req_payment_status
        
        # Log payment status change activity if it changed
        if old_payment_status != new_payment_status:
            try:
                from apps.act_log.utils import create_activity_log
                from apps.administration.models import Staff
                
                # Get staff member - try multiple sources
                staff = None
                staff_id = request.data.get('staff_id')
                
                if staff_id:
                    # Format staff_id properly (pad with leading zeros if needed)
                    if len(str(staff_id)) < 11:
                        staff_id = str(staff_id).zfill(11)
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                
                # Fallback: try to get staff from related records
                if not staff and hasattr(instance, 'ra_id') and instance.ra_id:
                    staff_id = getattr(instance.ra_id, 'staff_id', None)
                    if staff_id and len(str(staff_id)) < 11:
                        staff_id = str(staff_id).zfill(11)
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                
                # Final fallback: use any available staff
                if not staff:
                    staff = Staff.objects.first()
                
                if staff:
                    # Get resident name for better description
                    resident_name = "Unknown"
                    if instance.rp_id and instance.rp_id.per:
                        per = instance.rp_id.per
                        resident_name = f"{per.per_fname} {per.per_lname}"
                    
                    # Get purpose
                    purpose = instance.pr_id.pr_purpose if instance.pr_id else 'N/A'
                    
                    # Create activity log for payment status change
                    create_activity_log(
                        act_type="Payment Status Updated",
                        act_description=f"Payment status for certificate {instance.cr_id} changed from '{old_payment_status}' to '{new_payment_status}' for {resident_name} ({purpose})",
                        staff=staff,
                        record_id=instance.cr_id
                    )
                    logger.info(f"Activity logged for certificate payment status change: {instance.cr_id}")
                else:
                    logger.warning(f"No staff found for certificate payment status change logging: {instance.cr_id}")
                    
            except Exception as log_error:
                logger.error(f"Failed to log certificate payment status change activity: {str(log_error)}")
                # Don't fail the request if logging fails
        
        # Check if payment status changed to "Paid" and create automatic income entry
        new_payment_status = instance.cr_req_payment_status
        if old_payment_status != "Paid" and new_payment_status == "Paid":
            try:
                from apps.treasurer.utils import create_automatic_income_entry
                
                # Get purpose from the certificate
                purpose = "Unknown"
                if instance.pr_id:
                    purpose = instance.pr_id.pr_purpose
                
                # Get amount from purpose and rates
                amount = 0.0
                if instance.pr_id:
                    amount = float(instance.pr_id.pr_rate)
                
                # Get staff from certificate record (primary source) or request data
                staff_id = getattr(instance, 'staff_id', None) or request.data.get('staff_id')
                
                # Get invoice discount reason if available
                invoice_discount_reason = None
                try:
                    from apps.treasurer.models import Invoice
                    invoice = Invoice.objects.filter(cr_id=instance).first()
                    if invoice:
                        invoice_discount_reason = invoice.inv_discount_reason
                except Exception as e:
                    logger.warning(f"Could not get invoice discount reason for certificate {instance.cr_id}: {str(e)}")
                
                # Create automatic income entry
                create_automatic_income_entry(
                    request_type='CERT',
                    request_id=instance.cr_id,
                    purpose=purpose,
                    amount=amount,
                    staff_id=staff_id,
                    discount_notes=getattr(instance, 'cr_discount_reason', None),
                    invoice_discount_reason=invoice_discount_reason
                )
                logger.info(f"Created automatic income entry for certificate {instance.cr_id}")
            except Exception as e:
                logger.error(f"Failed to create automatic income entry for certificate {instance.cr_id}: {str(e)}")
                # Don't fail the request if income tracking fails
        
        return Response(serializer.data, status=status.HTTP_200_OK)

class CancelCertificateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, cr_id):
        try:
            cert = ClerkCertificate.objects.get(cr_id=cr_id)
            cert.cr_req_status = 'Cancelled'
            # set rejection date for cancelled requests
            cert.cr_date_rejected = timezone.now()
            cert.cr_reason = 'Cancelled by user'
            cert.save(update_fields=['cr_req_status', 'cr_date_rejected', 'cr_reason'])
            return Response({
                'message': 'Cancelled',
                'cr_id': cert.cr_id,
                'cr_req_status': cert.cr_req_status,
                'cr_date_rejected': cert.cr_date_rejected
            }, status=status.HTTP_200_OK)
        except ClerkCertificate.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CancelBusinessPermitView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, bpr_id):
        try:
            permit = BusinessPermitRequest.objects.get(bpr_id=bpr_id)
            permit.req_status = 'Cancelled'
            permit.save(update_fields=['req_status'])
            return Response({
                'message': 'Cancelled',
                'bpr_id': permit.bpr_id,
                'req_status': permit.req_status
            }, status=status.HTTP_200_OK)
        except BusinessPermitRequest.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class IssuedCertificateListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = IssuedCertificateSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        try:
            queryset = IssuedCertificate.objects.select_related(
                'certificate__rp_id__per',
                'certificate__pr_id',
                'staff'
            ).all()

            # Search functionality - matching web version
            search = self.request.query_params.get('search', None)
            if search:
                queryset = queryset.filter(
                    Q(ic_id__icontains=search) |
                    Q(certificate__rp_id__per__per_fname__icontains=search) |
                    Q(certificate__rp_id__per__per_lname__icontains=search) |
                    Q(certificate__pr_id__pr_purpose__icontains=search) |
                    Q(ic_date_of_issuance__icontains=search)
                )

            # Purpose filter - matching web version
            purpose_filter = self.request.query_params.get('purpose', None)
            if purpose_filter:
                queryset = queryset.filter(certificate__pr_id__pr_purpose=purpose_filter)

            # Date range filter - matching web version
            date_from = self.request.query_params.get('date_from', None)
            date_to = self.request.query_params.get('date_to', None)
            if date_from:
                queryset = queryset.filter(ic_date_of_issuance__gte=date_from)
            if date_to:
                queryset = queryset.filter(ic_date_of_issuance__lte=date_to)

            return queryset.order_by('-ic_date_of_issuance')
        except Exception as e:
            logger.error(f"Error in get_queryset: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            logger.info(f"Found {queryset.count()} issued certificates")
            
            # Apply pagination
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            # Fallback for non-paginated requests
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in IssuedCertificateListView: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return Response(
                {"error": str(e), "detail": "An error occurred while retrieving issued certificates"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MarkCertificateAsIssuedView(ActivityLogMixin, generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = IssuedCertificateSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            cr_id = request.data.get('cr_id')
            # Do NOT default to a hardcoded staff_id. Only use provided staff_id if it exists and is valid
            staff_id = request.data.get('staff_id')
            
            if not cr_id:
                return Response(
                    {"error": "Certificate ID (cr_id) is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the certificate
            try:
                certificate = ClerkCertificate.objects.get(cr_id=cr_id)
            except ClerkCertificate.DoesNotExist:
                return Response(
                    {"error": f"Certificate with ID {cr_id} not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if already issued
            if IssuedCertificate.objects.filter(certificate=certificate).exists():
                return Response(
                    {"error": f"Certificate {cr_id} is already issued"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Resolve staff strictly if provided; avoid creating a Staff record here to prevent NULL pos_id errors
            from apps.administration.models import Staff
            staff = None
            if staff_id:
                normalized_staff_id = str(staff_id).strip()
                logger.info(f"MarkCertificateAsIssuedView: incoming staff_id={normalized_staff_id}")
                # Try direct staff_id match
                staff = Staff.objects.filter(staff_id=normalized_staff_id).first()
                logger.info(f"MarkCertificateAsIssuedView: staff lookup (staff_id) found={bool(staff)}")
                # Fallback: case-insensitive match
                if not staff:
                    staff = Staff.objects.filter(staff_id__iexact=normalized_staff_id).first()
                    logger.info(f"MarkCertificateAsIssuedView: staff lookup (iexact) found={bool(staff)}")
                # Fallback: some datasets use rp_id to mirror staff_id
                if not staff and hasattr(Staff, 'rp_id'):
                    staff = Staff.objects.filter(rp_id=normalized_staff_id).first()
                    logger.info(f"MarkCertificateAsIssuedView: staff lookup (rp_id) found={bool(staff)}")
                if not staff:
                    return Response(
                        {"error": f"Invalid staff_id {staff_id}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            # If no staff_id in request, try to use the certificate's associated staff (if any)
            if staff is None and getattr(certificate, 'staff_id_id', None):
                logger.info(f"MarkCertificateAsIssuedView: attempting certificate.staff_id_id={certificate.staff_id_id}")
                staff = Staff.objects.filter(pk=certificate.staff_id_id).first()
            # If still no staff and the IssuedCertificate model requires staff (NOT NULL), fail fast
            if staff is None:
                # As a safety fallback, try any existing staff to avoid hard failure
                fallback_staff = Staff.objects.first()
                if fallback_staff:
                    logger.warning(f"MarkCertificateAsIssuedView: No staff resolved from input; using fallback staff_id={fallback_staff.staff_id}")
                    staff = fallback_staff
                else:
                    logger.warning("MarkCertificateAsIssuedView: No staff available in database. Rejecting request.")
                    return Response(
                        {"error": "No staff available in database. Please create a staff first."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
        
            # Create issued certificate; staff is guaranteed at this point
            issued_certificate = IssuedCertificate.objects.create(
                ic_date_of_issuance=timezone.now().date(),
                certificate=certificate,
                staff=staff
            )
            
            # Log the activity
            try:
                from apps.act_log.utils import create_activity_log
                
                if staff:
                    # Get resident name
                    resident_name = "Unknown"
                    if certificate.rp_id and certificate.rp_id.per:
                        per = certificate.rp_id.per
                        resident_name = f"{per.per_fname} {per.per_lname}"
                    
                    # Get purpose
                    purpose = certificate.pr_id.pr_purpose if certificate.pr_id else 'N/A'
                    
                    # Create activity log
                    create_activity_log(
                        act_type="Certificate Issued",
                        act_description=f"Certificate {cr_id} issued to {resident_name} ({purpose})",
                        staff=staff,
                        record_id=str(issued_certificate.ic_id)
                    )
                    logger.info(f"Activity logged for certificate issuance: {issued_certificate.ic_id}")
                else:
                    logger.warning(f"Staff not found for ID: {staff_id}, cannot log activity")
                    
            except Exception as log_error:
                logger.error(f"Failed to log activity for certificate issuance: {str(log_error)}")
                # Don't fail the request if logging fails
            
            serializer = self.get_serializer(issued_certificate)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error marking certificate as issued: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    "error": str(e),
                    "detail": "An error occurred while marking certificate as issued"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Business Permit Views
class BusinessPermitListView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = BusinessPermitSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = BusinessPermitRequest.objects.select_related(
            'bus_id',
            'rp_id__per',
            'pr_id',
            'ags_id'
        ).all()

        # Search functionality - matching web version
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(bpr_id__icontains=search) |
                Q(bus_permit_name__icontains=search) |
                Q(bus_permit_address__icontains=search) |
                Q(rp_id__per__per_fname__icontains=search) |
                Q(rp_id__per__per_lname__icontains=search) |
                Q(pr_id__pr_purpose__icontains=search) |
                Q(req_status__icontains=search) |
                Q(req_payment_status__icontains=search)
            )

        # Status filter - matching web version
        status_filter = self.request.GET.get('status', None)
        if status_filter:
            queryset = queryset.filter(req_status=status_filter)

        # Payment status filter - matching web version
        payment_status = self.request.GET.get('payment_status', None)
        if payment_status:
            queryset = queryset.filter(req_payment_status=payment_status)

        # Business type filter - matching web version
        business_type = self.request.query_params.get('business_type', None)
        if business_type:
            queryset = queryset.filter(bus_id__bus_type=business_type)

        return queryset.order_by('-req_request_date', '-bpr_id')

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            logger.info(f"Found {queryset.count()} business permits")
            
            # Apply pagination
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            # Fallback for non-paginated requests
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in BusinessPermitListView: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    "error": str(e),
                    "traceback": traceback.format_exc()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PermitClearanceView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BusinessPermitCreateSerializer
        return BusinessPermitSerializer
    
    def get_queryset(self):
        queryset = BusinessPermitRequest.objects.select_related('bus_id').all()
        
        # Search functionality
        search = self.request.GET.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(bpr_id__icontains=search) |
                Q(bus_id__bus_name__icontains=search) |
                Q(bus_id__bus_owner__icontains=search) |
                Q(req_type__icontains=search) |
                Q(req_status__icontains=search) |
                Q(req_payment_status__icontains=search)
            )

        # Status filter
        status_filter = self.request.GET.get('status', None)
        if status_filter:
            queryset = queryset.filter(req_status=status_filter)

        # Payment status filter
        payment_status = self.request.GET.get('payment_status', None)
        if payment_status:
            queryset = queryset.filter(req_payment_status=payment_status)

        return queryset.order_by('-req_request_date', '-bpr_id')
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                # Add file information to each permit clearance
                data = serializer.data
                for item in data:
                    item['has_files'] = self._check_has_files(item['bpr_id'])
                return self.get_paginated_response(data)
            
            serializer = self.get_serializer(queryset, many=True)
            data = serializer.data
            # Add file information to each permit clearance
            for item in data:
                item['has_files'] = self._check_has_files(item['bpr_id'])
            return Response(data)
        except Exception as e:
            logger.error(f"Error in PermitClearanceView.list: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    "error": str(e),
                    "detail": "An error occurred while retrieving permit clearances"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _check_has_files(self, bpr_id):
        """Check if a business permit request has files"""
        try:
            from .models import BusinessPermitFile
            return BusinessPermitFile.objects.filter(bpr_id=bpr_id).exists()
        except Exception:
            return False
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                permit_clearance = serializer.save()
                
                # Create BusinessPermitFile rows if provided
                try:
                    from .models import BusinessPermitFile
                    create_payload = []
                    prev_url = request.data.get('permit_image')
                    assess_url = request.data.get('assessment_image')
                    
                    if prev_url:
                        create_payload.append(BusinessPermitFile(
                            bpf_type='permit',
                            bpf_url=prev_url,
                            bpr_id=permit_clearance
                        ))
                    if assess_url:
                        create_payload.append(BusinessPermitFile(
                            bpf_type='assessment',
                            bpf_url=assess_url,
                            bpr_id=permit_clearance
                        ))
                    if create_payload:
                        # Create files individually to ensure they get proper IDs
                        for file_data in create_payload:
                            BusinessPermitFile.objects.create(
                                bpf_type=file_data.bpf_type,
                                bpf_url=file_data.bpf_url,
                                bpr_id=file_data.bpr_id
                            )
                except Exception as file_err:
                    logger.error(f"Failed creating BusinessPermitFile entries: {str(file_err)}")
                
                # Log the activity
                try:
                    from apps.act_log.utils import create_activity_log
                    from apps.administration.models import Staff
                    
                    # Get staff member
                    staff_id = request.data.get('staff_id') or '00005250821'  # Default staff ID
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                    
                    if staff:
                        # Get business name and owner
                        business_info = permit_clearance.bus_permit_name or "Unknown Business"
                        owner_name = "Unknown Owner"
                        if permit_clearance.rp_id and permit_clearance.rp_id.per:
                            per = permit_clearance.rp_id.per
                            owner_name = f"{per.per_fname} {per.per_lname}"
                        
                        # Create activity log
                        create_activity_log(
                            act_type="Business Permit Request Created",
                            act_description=f"Business permit request {permit_clearance.bpr_id} created for '{business_info}' (Owner: {owner_name})",
                            staff=staff,
                            record_id=permit_clearance.bpr_id
                        )
                        logger.info(f"Activity logged for business permit creation: {permit_clearance.bpr_id}")
                    else:
                        logger.warning(f"Staff not found for ID: {staff_id}, cannot log activity")
                        
                except Exception as log_error:
                    logger.error(f"Failed to log activity for business permit creation: {str(log_error)}")
                    # Don't fail the request if logging fails
                
                return Response(
                    {
                        "message": "Permit clearance created successfully",
                        "data": BusinessPermitSerializer(permit_clearance).data
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {
                        "error": "Invalid data",
                        "details": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            logger.error(f"Error in PermitClearanceView.create: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    "error": str(e),
                    "detail": "An error occurred while creating permit clearance"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class IssuedBusinessPermitListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = IssuedBusinessPermitSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        try:
            queryset = IssuedBusinessPermit.objects.select_related(
                'bpr_id__bus_id',
                'bpr_id__rp_id__per',
                'bpr_id__pr_id',
                'staff'
            ).all()

            # Search functionality - matching web version
            search = self.request.query_params.get('search', None)
            if search:
                queryset = queryset.filter(
                    Q(ibp_id__icontains=search) |
                    Q(bpr_id__bus_permit_name__icontains=search) |
                    Q(bpr_id__rp_id__per__per_fname__icontains=search) |
                    Q(bpr_id__rp_id__per__per_lname__icontains=search) |
                    Q(bpr_id__pr_id__pr_purpose__icontains=search) |
                    Q(ibp_date_of_issuance__icontains=search)
                )

            # Purpose filter - matching web version
            purpose_filter = self.request.query_params.get('purpose', None)
            if purpose_filter:
                queryset = queryset.filter(bpr_id__pr_id__pr_purpose=purpose_filter)

            # Date range filter - matching web version
            date_from = self.request.query_params.get('date_from', None)
            date_to = self.request.query_params.get('date_to', None)
            if date_from:
                queryset = queryset.filter(ibp_date_of_issuance__gte=date_from)
            if date_to:
                queryset = queryset.filter(ibp_date_of_issuance__lte=date_to)
            
            logger.info(f"Found {queryset.count()} issued business permits")
            return queryset.order_by('-ibp_date_of_issuance')
        except Exception as e:
            logger.error(f"Error in get_queryset: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in IssuedBusinessPermitListView: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return Response(
                {
                    "error": str(e),
                    "detail": "An error occurred while retrieving issued business permits"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MarkBusinessPermitAsIssuedView(ActivityLogMixin, generics.CreateAPIView):
    serializer_class = IssuedBusinessPermitSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            bpr_id = request.data.get('bpr_id')
            staff_id = request.data.get('staff_id', '00005250821')
            
            if not bpr_id:
                return Response(
                    {"error": "Business Permit Request ID (bpr_id) is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the business permit request
            try:
                permit_request = BusinessPermitRequest.objects.get(bpr_id=bpr_id)
            except BusinessPermitRequest.DoesNotExist:
                return Response(
                    {"error": f"Business permit request with ID {bpr_id} not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if already issued
            if IssuedBusinessPermit.objects.filter(bpr_id=permit_request).exists():
                return Response(
                    {"error": f"Business permit {bpr_id} is already issued"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create staff
            from apps.administration.models import Staff
            staff, created = Staff.objects.get_or_create(staff_id=staff_id)
            
            try:
                if getattr(permit_request, 'req_status', None) != 'Completed':
                    permit_request.req_status = 'Completed'
                    # If completion date empty, set to today
                    if not getattr(permit_request, 'req_date_completed', None):
                        permit_request.req_date_completed = timezone.now().date()
                    permit_request.save(update_fields=['req_status', 'req_date_completed'])
                    
                    # Update business gross sales if this is a business clearance with new gross sales
                    if (permit_request.bus_id and 
                        permit_request.bus_clearance_gross_sales and 
                        permit_request.pr_id and 
                        permit_request.pr_id.pr_purpose and 
                        'business clearance' in permit_request.pr_id.pr_purpose.lower()):
                        
                        try:
                            from apps.profiling.models import Business
                            business = Business.objects.get(bus_id=permit_request.bus_id.bus_id)
                            old_gross_sales = business.bus_gross_sales
                            business.bus_gross_sales = float(permit_request.bus_clearance_gross_sales)
                            business.save(update_fields=['bus_gross_sales'])
                            
                            logger.info(f"Updated business {permit_request.bus_id.bus_id} gross sales from {old_gross_sales} to {permit_request.bus_clearance_gross_sales}")
                            
                            # Log the business gross sales update activity
                            try:
                                from apps.act_log.utils import create_activity_log
                                create_activity_log(
                                    act_type="Business Gross Sales Updated",
                                    act_description=f"Business {permit_request.bus_id.bus_name} gross sales updated from ₱{old_gross_sales:,.2f} to ₱{permit_request.bus_clearance_gross_sales:,.2f} via business clearance completion",
                                    staff=staff,
                                    record_id=permit_request.bus_id.bus_id
                                )
                            except Exception as log_err:
                                logger.error(f"Failed to log business gross sales update activity: {str(log_err)}")
                                
                        except Business.DoesNotExist:
                            logger.error(f"Business {permit_request.bus_id.bus_id} not found for gross sales update")
                        except Exception as bus_update_err:
                            logger.error(f"Failed to update business gross sales: {str(bus_update_err)}")
                            
            except Exception as update_err:
                logger.error(f"Failed to update BusinessPermitRequest {bpr_id} to Completed: {str(update_err)}")

            # Generate sequential IBP ID like CR000-25 → IBP000-25 (length 10)
            from .models import IssuedBusinessPermit as _IssuedBusinessPermit
            year_suffix = timezone.now().year % 100
            try:
                existing_count = _IssuedBusinessPermit.objects.filter(
                    ibp_id__endswith=f"-{year_suffix:02d}"
                ).count()
            except Exception:
                existing_count = _IssuedBusinessPermit.objects.count()
            seq = existing_count + 1
            ibp_id = f"IBP{seq:03d}-{year_suffix:02d}"
            # Ensure uniqueness in rare race conditions
            while _IssuedBusinessPermit.objects.filter(ibp_id=ibp_id).exists():
                seq += 1
                ibp_id = f"IBP{seq:03d}-{year_suffix:02d}"
            
            # Create issued business permit (no file field needed)
            issued_permit = IssuedBusinessPermit.objects.create(
                ibp_id=ibp_id,
                ibp_date_of_issuance=timezone.now().date(),
                bpr_id=permit_request,
                staff=staff
            )
            
            # Log the activity
            try:
                from apps.act_log.utils import create_activity_log
                
                if staff:
                    # Get business name and owner
                    business_info = issued_permit.bpr_id.bus_permit_name or "Unknown Business"
                    owner_name = "Unknown Owner"
                    if issued_permit.bpr_id.rp_id and issued_permit.bpr_id.rp_id.per:
                        per = issued_permit.bpr_id.rp_id.per
                        owner_name = f"{per.per_fname} {per.per_lname}"
                    
                    # Create activity log
                    create_activity_log(
                        act_type="Business Permit Issued",
                        act_description=f"Business permit {bpr_id} issued for '{business_info}' (Owner: {owner_name})",
                        staff=staff,
                        record_id=issued_permit.ibp_id
                    )
                    logger.info(f"Activity logged for business permit issuance: {issued_permit.ibp_id}")
                else:
                    logger.warning(f"Staff not found for ID: {staff_id}, cannot log activity")
                    
            except Exception as log_error:
                logger.error(f"Failed to log activity for business permit issuance: {str(log_error)}")
                # Don't fail the request if logging fails
            
            serializer = self.get_serializer(issued_permit)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error marking business permit as issued: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    "error": str(e),
                    "detail": "An error occurred while marking business permit as issued"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ---------------------- Personal Clearances and Payment APIs ----------------------

class PersonalClearancesView(generics.ListAPIView):
    serializer_class = ClerkCertificateSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = ClerkCertificate.objects.select_related(
            'rp_id__per',
            'pr_id'
        ).only(
            'cr_id',
            'cr_req_request_date',
            'cr_req_payment_status',
            'cr_req_status',
            'rp_id__per__per_fname',
            'rp_id__per__per_lname',
            'pr_id__pr_purpose',
            'pr_id__pr_rate'
        ).all()

        # Search functionality
        search = self.request.GET.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(cr_id__icontains=search) |
                Q(rp_id__per__per_fname__icontains=search) |
                Q(rp_id__per__per_lname__icontains=search) |
                Q(pr_id__pr_purpose__icontains=search) |
                Q(cr_req_status__icontains=search) |
                Q(cr_req_payment_status__icontains=search)
            )

        # Status filter
        status_filter = self.request.GET.get('status', None)
        if status_filter:
            queryset = queryset.filter(cr_req_status=status_filter)

        # Payment status filter
        payment_status = self.request.GET.get('payment_status', None)
        if payment_status:
            queryset = queryset.filter(cr_req_payment_status=payment_status)

        return queryset.order_by('-cr_req_request_date')


class CreatePaymentIntentView(APIView):
    def post(self, request, cr_id):
        try:
            certificate = ClerkCertificate.objects.get(cr_id=cr_id)

            amount = certificate.pr_id.pr_rate if certificate.pr_id else 0

            # TODO: integrate real gateway, this is a placeholder
            payment_intent = {
                'id': f'dummy_{cr_id}',
                'amount': amount,
                'status': 'awaiting_payment'
            }

            invoice = Invoice.objects.create(
                inv_num=f"INV-{cr_id}",
                inv_serial_num=f"SER-{cr_id}",
                inv_date=timezone.now().date(),
                inv_amount=amount,
                inv_nat_of_collection='Personal Clearance'
            )

            return Response({
                'invoice_id': invoice.inv_num,
                'payment_intent_id': payment_intent['id'],
                'amount': amount
            })
        except ClerkCertificate.DoesNotExist:
            return Response({"error": "Certificate request not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in create_payment_intent: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentStatusView(APIView):
    permission_classes = [AllowAny]  # Add this if the webhook should be publicly accessible
    
    def post(self, request):
        try:
            payment_intent_id = request.data.get('data', {}).get('id')
            payment_status = request.data.get('data', {}).get('attributes', {}).get('status')

            if payment_intent_id:
                # Lookup your invoice by stored payment_intent_id if you persist it
                # Update related certificate status if needed
                return Response({'status': 'success'})
            return Response({'error': 'invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error in webhook_payment_status: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ClearanceRequestView(ActivityLogMixin, generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = BusinessPermitCreateSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                clearance_request = serializer.save()
                
                # Create BusinessPermitFile rows if provided
                try:
                    from .models import BusinessPermitFile
                    create_payload = []
                    prev_url = request.data.get('permit_image')
                    assess_url = request.data.get('assessment_image')
                    
                    if prev_url:
                        create_payload.append(BusinessPermitFile(
                            bpf_type='permit',
                            bpf_url=prev_url,
                            bpr_id=clearance_request
                        ))
                    if assess_url:
                        create_payload.append(BusinessPermitFile(
                            bpf_type='assessment',
                            bpf_url=assess_url,
                            bpr_id=clearance_request
                        ))
                    if create_payload:
                        # Create files individually to ensure they get proper IDs
                        for file_data in create_payload:
                            BusinessPermitFile.objects.create(
                                bpf_type=file_data.bpf_type,
                                bpf_url=file_data.bpf_url,
                                bpr_id=file_data.bpr_id
                            )
                except Exception as file_err:
                    logger.error(f"Failed creating BusinessPermitFile entries: {str(file_err)}")
                
                # Log the activity
                try:
                    from apps.act_log.utils import create_activity_log
                    from apps.administration.models import Staff
                    
                    # Get staff member
                    staff_id = request.data.get('staff_id') or '00005250821'  # Default staff ID
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                    
                    if staff:
                        # Get business name and owner
                        business_info = clearance_request.bus_permit_name or "Unknown Business"
                        owner_name = "Unknown Owner"
                        if clearance_request.rp_id and clearance_request.rp_id.per:
                            per = clearance_request.rp_id.per
                            owner_name = f"{per.per_fname} {per.per_lname}"
                        
                        # Create activity log
                        create_activity_log(
                            act_type="Business Clearance Request Created",
                            act_description=f"Business clearance request {clearance_request.bpr_id} created for '{business_info}' (Owner: {owner_name})",
                            staff=staff,
                            record_id=clearance_request.bpr_id
                        )
                        logger.info(f"Activity logged for business clearance creation: {clearance_request.bpr_id}")
                    else:
                        logger.warning(f"Staff not found for ID: {staff_id}, cannot log activity")
                        
                except Exception as log_error:
                    logger.error(f"Failed to log activity for business clearance creation: {str(log_error)}")
                    # Don't fail the request if logging fails
                
                return Response(
                    {
                        "message": "Clearance request created successfully",
                        "data": BusinessPermitSerializer(clearance_request).data
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {
                        "error": "Invalid data",
                        "details": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            logger.error(f"Error in ClearanceRequestView.create: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    "error": str(e),
                    "detail": "An error occurred while creating clearance request"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, *args, **kwargs):
        """Update business permit request status"""
        try:
            bpr_id = request.data.get('bpr_id')
            if not bpr_id:
                return Response({
                    'error': 'bpr_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Find the business permit request
            try:
                instance = BusinessPermitRequest.objects.get(bpr_id=bpr_id)
            except BusinessPermitRequest.DoesNotExist:
                return Response({
                    'error': f'Business permit request with bpr_id {bpr_id} not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            print(f"Updating business permit request: {instance.bpr_id}")
            print(f"Current payment status: {instance.req_payment_status}")
            print(f"Request data: {request.data}")
            
            # Store old payment status for comparison
            old_payment_status = instance.req_payment_status
            
            # Update payment status and completion date
            instance.req_payment_status = request.data.get('req_payment_status', instance.req_payment_status)
            
            # Handle date conversion from ISO string to date format
            if request.data.get('req_date_completed'):
                try:
                    from datetime import datetime
                    # Convert ISO string to datetime then to date
                    iso_date_string = request.data.get('req_date_completed')
                    if isinstance(iso_date_string, str):
                        # Parse ISO string and extract date part
                        parsed_date = datetime.fromisoformat(iso_date_string.replace('Z', '+00:00'))
                        instance.req_date_completed = parsed_date.date()
                    else:
                        instance.req_date_completed = request.data.get('req_date_completed')
                except Exception as date_error:
                    print(f"Date conversion error: {date_error}")
                    # Fallback: use current date
                    instance.req_date_completed = timezone.now().date()
            
            print(f"New payment status: {instance.req_payment_status}")
            print(f"Completion date: {instance.req_date_completed}")
            
            instance.save(update_fields=['req_payment_status', 'req_date_completed'])
            
            # Log payment status change activity
            try:
                from apps.act_log.utils import create_activity_log
                from apps.administration.models import Staff
                
                # Get staff member - try multiple sources
                staff = None
                staff_id = request.data.get('staff_id') or getattr(instance, 'staff_id', None)
                
                if staff_id:
                    # Format staff_id properly (pad with leading zeros if needed)
                    if len(str(staff_id)) < 11:
                        staff_id = str(staff_id).zfill(11)
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                
                # Fallback: try to get staff from related records
                if not staff and hasattr(instance, 'ra_id') and instance.ra_id:
                    staff_id = getattr(instance.ra_id, 'staff_id', None)
                    if staff_id and len(str(staff_id)) < 11:
                        staff_id = str(staff_id).zfill(11)
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                
                # Final fallback: use any available staff
                if not staff:
                    staff = Staff.objects.first()
                
                if staff:
                    # Get business name and owner for better description
                    business_name = instance.bus_permit_name or "Unknown Business"
                    owner_name = "Unknown Owner"
                    if instance.rp_id and instance.rp_id.per:
                        per = instance.rp_id.per
                        owner_name = f"{per.per_fname} {per.per_lname}"
                    
                    # Get purpose
                    purpose = instance.pr_id.pr_purpose if instance.pr_id else 'N/A'
                    
                    # Create activity log for payment status change
                    create_activity_log(
                        act_type="Payment Status Updated",
                        act_description=f"Payment status for business permit {instance.bpr_id} changed from '{old_payment_status}' to '{instance.req_payment_status}' for '{business_name}' (Owner: {owner_name}) - {purpose}",
                        staff=staff,
                        record_id=instance.bpr_id
                    )
                    logger.info(f"Activity logged for business permit payment status change: {instance.bpr_id}")
                else:
                    logger.warning(f"No staff found for business permit payment status change logging: {instance.bpr_id}")
                    
            except Exception as log_error:
                logger.error(f"Failed to log business permit payment status change activity: {str(log_error)}")
                # Don't fail the request if logging fails
            
            # Check if payment status changed to "Paid" and create automatic income entry
            if old_payment_status != "Paid" and instance.req_payment_status == "Paid":
                try:
                    from apps.treasurer.utils import create_automatic_income_entry
                    
                    # Get purpose from the business permit request
                    purpose = "Unknown"
                    if instance.pr_id:
                        purpose = instance.pr_id.pr_purpose
                    
                    # Get amount from purpose and rates or from ags_id
                    amount = 0.0
                    if instance.pr_id:
                        amount = float(instance.pr_id.pr_rate)
                    elif instance.ags_id:
                        # Get amount from Annual_Gross_Sales
                        from apps.treasurer.models import Annual_Gross_Sales
                        try:
                            ags = Annual_Gross_Sales.objects.get(ags_id=instance.ags_id)
                            amount = float(ags.ags_rate) if ags.ags_rate else 0.0
                        except Annual_Gross_Sales.DoesNotExist:
                            pass
                    
                    # Get staff ID from request, certificate, or use default
                    staff_id = request.data.get('staff_id') or getattr(instance, 'staff_id', None)
                    
                    # Get invoice discount reason if available
                    invoice_discount_reason = None
                    try:
                        from apps.treasurer.models import Invoice
                        invoice = Invoice.objects.filter(bpr_id=instance).first()
                        if invoice:
                            invoice_discount_reason = invoice.inv_discount_reason
                    except Exception as e:
                        logger.warning(f"Could not get invoice discount reason for business permit {instance.bpr_id}: {str(e)}")
                    
                    # Create automatic income entry
                    create_automatic_income_entry(
                        request_type='PERMIT',
                        request_id=instance.bpr_id,
                        purpose=purpose,
                        amount=amount,
                        staff_id=staff_id,
                        discount_notes=getattr(instance, 'req_discount_reason', None),
                        invoice_discount_reason=invoice_discount_reason
                    )
                    logger.info(f"Created automatic income entry for business permit {instance.bpr_id}")
                except Exception as e:
                    logger.error(f"Failed to create automatic income entry for business permit {instance.bpr_id}: {str(e)}")
                    # Don't fail the request if income tracking fails
            
            return Response({
                'message': 'Business permit request status updated successfully',
                'bpr_id': instance.bpr_id,
                'new_payment_status': instance.req_payment_status,
                'completion_date': instance.req_date_completed
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error updating business permit request status: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return Response({
                'error': str(e),
                'detail': 'An error occurred while updating business permit request status'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------- Treasurer: Service Charge Requests ----------------------
class ServiceChargeTreasurerListView(generics.ListAPIView):
    serializer_class = ServiceChargeTreasurerListSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Get data directly from ServiceChargePaymentRequest table
        from .models import ServiceChargePaymentRequest
        from datetime import timedelta
        
        # Check for and auto-decline overdue charges before returning data
        self._auto_decline_overdue_charges()
        
        queryset = ServiceChargePaymentRequest.objects.filter(
            pay_sr_type__in=['File Action']
        ).select_related(
            'comp_id',
            'pr_id'
        ).prefetch_related(
            'comp_id__complaintcomplainant_set__cpnt',
            'comp_id__complaintaccused_set__acsd'
        )

        # Add search functionality
        search_query = self.request.GET.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(pay_id__icontains=search_query) |
                Q(pay_sr_type__icontains=search_query) |
                Q(pay_status__icontains=search_query) |
                Q(comp_id__comp_incident_type__icontains=search_query) |
                Q(comp_id__comp_location__icontains=search_query)
            ).distinct()

        # Add status filtering
        status_filter = self.request.GET.get('status', None)
        if status_filter and status_filter != 'all':
            if status_filter == 'pending':
                queryset = queryset.filter(pay_req_status='Pending')
            elif status_filter == 'completed':
                queryset = queryset.filter(pay_req_status='Completed')
            elif status_filter == 'declined':
                queryset = queryset.filter(pay_req_status='Declined')

        # Add payment status filtering
        payment_status_filter = self.request.GET.get('payment_status', None)
        if payment_status_filter:
            queryset = queryset.filter(pay_status=payment_status_filter)

        return queryset.order_by('-pay_date_req')
    
    def _auto_decline_overdue_charges(self):
        """
        Automatically decline unpaid service charges that are 7 days overdue
        This method is called every time the service charges are fetched
        """
        try:
            from .models import ServiceChargePaymentRequest
            from datetime import timedelta
            
            # Calculate the cutoff date (7 days ago)
            cutoff_date = timezone.now() - timedelta(days=7)
            
            # Find overdue unpaid charges
            overdue_charges = ServiceChargePaymentRequest.objects.filter(
                pay_status='Unpaid',
                pay_req_status='Pending',
                pay_date_req__lt=cutoff_date,
                pay_sr_type='Summon'
            )
            
            if overdue_charges.exists():
                # Update all overdue charges to declined
                updated_count = overdue_charges.update(
                    pay_req_status='Declined'
                )
                
                if updated_count > 0:
                    logger.info(f'Auto-declined {updated_count} overdue service charges via API call')
                    
        except Exception as e:
            logger.error(f'Error in auto_decline_overdue_charges: {str(e)}')


# ---------------------- Business Permit Files ----------------------
class BusinessPermitFilesView(generics.ListAPIView):
    """
    API endpoint to fetch business permit files for a specific business permit request
    """
    permission_classes = [AllowAny]
    
    def get(self, request, bpr_id):
        try:
            from .models import BusinessPermitFile
            
            # Fetch all files for this business permit request
            files = BusinessPermitFile.objects.filter(bpr_id=bpr_id)
            
            if not files.exists():
                return Response({
                    'message': 'No files found for this business permit request',
                    'files': []
                }, status=status.HTTP_200_OK)
            
            # Serialize the files data
            files_data = []
            for file in files:
                files_data.append({
                    'bpf_id': file.bpf_id,
                    'bpf_type': file.bpf_type,
                    'bpf_url': file.bpf_url,
                })
            
            return Response({
                'files': files_data,
                'count': len(files_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching business permit files for {bpr_id}: {str(e)}")
            return Response({
                'error': str(e),
                'detail': 'An error occurred while fetching business permit files'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BusinessPermitUploadView(APIView):
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            # Get the uploaded file
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return Response({
                    'error': 'No file provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get file metadata
            file_name = request.data.get('file_name', uploaded_file.name)
            file_type = request.data.get('file_type', uploaded_file.content_type)
            bucket_name = request.data.get('bucket_name', 'business-permit-file-bucket')
            
            # Generate unique filename
            unique_id = str(uuid.uuid4())[:8]
            timestamp = int(timezone.now().timestamp())
            file_extension = file_name.split('.')[-1] if '.' in file_name else 'jpg'
            unique_filename = f"business_permit_{unique_id}_{timestamp}.{file_extension}"
            
            # Convert file to base64 for Supabase upload
            file_content = uploaded_file.read()
            file_b64 = base64.b64encode(file_content).decode('utf-8')
            
            # Prepare file data for Supabase upload
            file_data = {
                'file': file_b64,
                'name': unique_filename,
                'type': file_type
            }
            
            # Upload to Supabase storage
            file_url = upload_to_storage(file_data, bucket_name, 'business-permits')
            
            if not file_url:
                return Response({
                    'error': 'Failed to upload file to storage'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Return success response
            return Response({
                'file_url': file_url,
                'file_name': unique_filename,
                'file_path': f'business-permits/{unique_filename}',
                'bucket': bucket_name,
                'message': 'File uploaded successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error uploading business permit file: {str(e)}")
            return Response({
                'error': str(e),
                'detail': 'An error occurred while uploading the file'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateServiceChargePaymentStatusView(APIView):
    """
    Update the payment status of a ServiceChargePaymentRequest
    """
    def put(self, request, pay_id):
        try:
            from .models import ServiceChargePaymentRequest
            
            # Get the payment request
            payment_request = ServiceChargePaymentRequest.objects.get(pay_id=pay_id)
            
            # Store old values for logging
            old_pay_status = payment_request.pay_status
            old_pay_req_status = payment_request.pay_req_status
            
            # Update payment status if provided
            if 'pay_status' in request.data:
                payment_request.pay_status = request.data['pay_status']
                if request.data['pay_status'] == "Paid":
                    payment_request.pay_date_paid = timezone.now()
            
            # Update request status if provided
            if 'pay_req_status' in request.data:
                payment_request.pay_req_status = request.data['pay_req_status']
            
            payment_request.save()
            
            # Log activity for status changes
            try:
                from apps.act_log.utils import create_activity_log
                from apps.administration.models import Staff
                
                # Get staff member - try multiple sources
                staff = None
                staff_id = request.data.get('staff_id')
                
                if staff_id:
                    # Format staff_id properly (pad with leading zeros if needed)
                    if len(str(staff_id)) < 11:
                        staff_id = str(staff_id).zfill(11)
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                
                # Fallback: try to get staff from related records
                if not staff and hasattr(payment_request, 'sr_id') and payment_request.sr_id:
                    if hasattr(payment_request.sr_id, 'ra_id') and payment_request.sr_id.ra_id:
                        staff_id = getattr(payment_request.sr_id.ra_id, 'staff_id', None)
                        if staff_id and len(str(staff_id)) < 11:
                            staff_id = str(staff_id).zfill(11)
                        staff = Staff.objects.filter(staff_id=staff_id).first()
                
                # Final fallback: use any available staff
                if not staff:
                    staff = Staff.objects.first()
                
                if staff:
                    # Get service charge details for better description
                    service_charge_info = "Unknown Service Charge"
                    if hasattr(payment_request, 'sr_id') and payment_request.sr_id:
                        service_charge_info = f"Service Charge {payment_request.sr_id.sr_id}"
                    
                    # Get purpose
                    purpose = "N/A"
                    if hasattr(payment_request, 'pr_id') and payment_request.pr_id:
                        purpose = payment_request.pr_id.pr_purpose
                    
                    # Create activity log for status changes
                    changes = []
                    if old_pay_status != payment_request.pay_status:
                        changes.append(f"payment status: '{old_pay_status}' → '{payment_request.pay_status}'")
                    if old_pay_req_status != payment_request.pay_req_status:
                        changes.append(f"request status: '{old_pay_req_status}' → '{payment_request.pay_req_status}'")
                    
                    if changes:
                        create_activity_log(
                            act_type="Service Charge Payment Status Updated",
                            act_description=f"Service charge payment {payment_request.pay_id} status updated: {', '.join(changes)} for {service_charge_info} ({purpose})",
                            staff=staff,
                            record_id=str(payment_request.pay_id)
                        )
                        logger.info(f"Activity logged for service charge payment status change: {payment_request.pay_id}")
                else:
                    logger.warning(f"No staff found for service charge payment status change logging: {payment_request.pay_id}")
                    
            except Exception as log_error:
                logger.error(f"Failed to log service charge payment status change activity: {str(log_error)}")
                # Don't fail the request if logging fails
            
            return Response({
                'message': 'Payment status updated successfully',
                'pay_id': payment_request.pay_id,
                'pay_status': payment_request.pay_status,
                'pay_req_status': payment_request.pay_req_status,
                'pay_date_paid': payment_request.pay_date_paid
            }, status=status.HTTP_200_OK)
            
        except ServiceChargePaymentRequest.DoesNotExist:
            return Response({
                'error': 'Payment request not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e),
                'detail': 'An error occurred while updating payment status'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===========================Certificate Analytics Views=====================

class CertificateAnalyticsView(APIView):
    """
    Analytics view for certificate data including purpose trending and statistics
    """
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        try:
            from django.db.models import Count
            from datetime import date, timedelta
            try:
                from dateutil.relativedelta import relativedelta
            except ImportError:
                # Fallback if dateutil is not available
                from datetime import timedelta
                def relativedelta(**kwargs):
                    months = kwargs.get('months', 0)
                    return timedelta(days=months * 30)  # Approximate
            
            # Get date range parameters
            months_back = int(request.query_params.get('months', 6))
            end_date = date.today()
            start_date = end_date - relativedelta(months=months_back)
            
            # Total certificates count
            total_certificates = ClerkCertificate.objects.count()
            total_issued = IssuedCertificate.objects.count()
            total_pending = ClerkCertificate.objects.filter(cr_req_status='Pending').count()
            total_completed = ClerkCertificate.objects.filter(cr_req_status='Completed').count()
            total_rejected = ClerkCertificate.objects.filter(cr_req_status='Rejected').count()
            
            # Purpose trending data using Django ORM
            purpose_trends = ClerkCertificate.objects.filter(
                cr_req_request_date__date__gte=start_date,
                cr_req_request_date__date__lte=end_date,
                pr_id__isnull=False
            ).values('pr_id__pr_purpose').annotate(
                count=Count('cr_id')
            ).order_by('-count')[:10]
            
            # Monthly certificate requests
            monthly_requests = ClerkCertificate.objects.filter(
                cr_req_request_date__date__gte=start_date,
                cr_req_request_date__date__lte=end_date
            ).extra(
                select={'month': "DATE_TRUNC('month', cr_req_request_date)"}
            ).values('month').annotate(
                count=Count('cr_id')
            ).order_by('month')
            
            # Payment status breakdown
            payment_status_breakdown = ClerkCertificate.objects.values(
                'cr_req_payment_status'
            ).annotate(
                count=Count('cr_id')
            ).order_by('-count')
            
            # Recent certificate requests (last 7 days) using Django ORM
            recent_requests = ClerkCertificate.objects.filter(
                cr_req_request_date__date__gte=date.today() - timedelta(days=7)
            ).select_related('pr_id', 'rp_id__per').values(
                'cr_id',
                'cr_req_request_date',
                'cr_req_status',
                'pr_id__pr_purpose',
                'rp_id__per__per_fname',
                'rp_id__per__per_lname'
            ).order_by('-cr_req_request_date')[:10]
            
            # Most requested purposes (all time) using Django ORM
            top_purposes = ClerkCertificate.objects.filter(
                pr_id__isnull=False
            ).values(
                'pr_id__pr_purpose',
                'pr_id__pr_category'
            ).annotate(
                count=Count('cr_id')
            ).order_by('-count')[:15]
            
            # Certificate completion rate
            completion_rate = 0
            if total_certificates > 0:
                completion_rate = round((total_completed / total_certificates) * 100, 2)
            
            # Average processing time (in days)
            completed_certificates = ClerkCertificate.objects.filter(
                cr_req_status='Completed',
                cr_date_completed__isnull=False
            ).extra(
                select={
                    'processing_days': "EXTRACT(EPOCH FROM (cr_date_completed - cr_req_request_date)) / 86400"
                }
            ).values('processing_days')
            
            avg_processing_days = 0
            if completed_certificates.exists():
                total_days = sum(cert['processing_days'] for cert in completed_certificates if cert['processing_days'])
                avg_processing_days = round(total_days / completed_certificates.count(), 1) if completed_certificates.count() > 0 else 0
            
            analytics_data = {
                'overview': {
                    'total_certificates': total_certificates,
                    'total_issued': total_issued,
                    'total_pending': total_pending,
                    'total_completed': total_completed,
                    'total_rejected': total_rejected,
                    'completion_rate': completion_rate,
                    'avg_processing_days': avg_processing_days
                },
                'purpose_trends': list(purpose_trends),
                'monthly_requests': list(monthly_requests),
                'payment_status_breakdown': list(payment_status_breakdown),
                'recent_requests': list(recent_requests),
                'top_purposes': list(top_purposes),
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'months_back': months_back
                }
            }
            
            return Response(analytics_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            logger.error(f"Error in certificate analytics: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response({
                'error': str(e),
                'detail': 'An error occurred while fetching certificate analytics',
                'traceback': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CertificatePurposeTrendingView(APIView):
    """
    Detailed trending analysis for certificate purposes
    """
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        try:
            from django.db.models import Count
            from datetime import date, timedelta
            try:
                from dateutil.relativedelta import relativedelta
            except ImportError:
                # Fallback if dateutil is not available
                from datetime import timedelta
                def relativedelta(**kwargs):
                    months = kwargs.get('months', 0)
                    return timedelta(days=months * 30)  # Approximate
            
            # Get parameters
            months_back = int(request.query_params.get('months', 12))
            end_date = date.today()
            start_date = end_date - relativedelta(months=months_back)
            
            # Purpose trending over time (monthly) using Django ORM
            purpose_monthly_trends = ClerkCertificate.objects.filter(
                cr_req_request_date__date__gte=start_date,
                cr_req_request_date__date__lte=end_date,
                pr_id__isnull=False
            ).extra(
                select={'month': "DATE_TRUNC('month', cr_req_request_date)"}
            ).values(
                'month',
                'pr_id__pr_purpose'
            ).annotate(
                count=Count('cr_id')
            ).order_by('month', '-count')
            
            # Top 10 purposes with growth rate
            current_period_start = end_date - relativedelta(months=3)
            previous_period_start = current_period_start - relativedelta(months=3)
            
            # Current period data using Django ORM
            current_period_data = ClerkCertificate.objects.filter(
                cr_req_request_date__date__gte=current_period_start,
                cr_req_request_date__date__lte=end_date,
                pr_id__isnull=False
            ).values('pr_id__pr_purpose').annotate(
                current_count=Count('cr_id')
            )
            current_period = {item['pr_id__pr_purpose']: item['current_count'] for item in current_period_data}
            
            # Previous period data using Django ORM
            previous_period_data = ClerkCertificate.objects.filter(
                cr_req_request_date__date__gte=previous_period_start,
                cr_req_request_date__date__lt=current_period_start,
                pr_id__isnull=False
            ).values('pr_id__pr_purpose').annotate(
                previous_count=Count('cr_id')
            )
            previous_period = {item['pr_id__pr_purpose']: item['previous_count'] for item in previous_period_data}
            
            # Calculate growth rates
            growth_analysis = []
            all_purposes = set(current_period.keys()) | set(previous_period.keys())
            
            for purpose in all_purposes:
                current = current_period.get(purpose, 0)
                previous = previous_period.get(purpose, 0)
                growth_rate = 0
                if previous > 0:
                    growth_rate = round(((current - previous) / previous) * 100, 2)
                elif current > 0:
                    growth_rate = 100  # New purpose
                
                growth_analysis.append({
                    'purpose': purpose,
                    'current_count': current,
                    'previous_count': previous,
                    'growth_rate': growth_rate,
                    'trend': 'increasing' if growth_rate > 10 else 'decreasing' if growth_rate < -10 else 'stable'
                })
            
            # Sort by current count and take top 10
            growth_analysis.sort(key=lambda x: x['current_count'], reverse=True)
            top_growth_purposes = growth_analysis[:10]
            
            # Purpose category breakdown using Django ORM
            category_breakdown = ClerkCertificate.objects.filter(
                cr_req_request_date__date__gte=start_date,
                cr_req_request_date__date__lte=end_date,
                pr_id__isnull=False
            ).values('pr_id__pr_category').annotate(
                count=Count('cr_id')
            ).order_by('-count')
            
            trending_data = {
                'purpose_monthly_trends': list(purpose_monthly_trends),
                'top_growth_purposes': top_growth_purposes,
                'category_breakdown': list(category_breakdown),
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'months_back': months_back
                }
            }
            
            return Response(trending_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in certificate purpose trending: {str(e)}")
            return Response({
                'error': str(e),
                'detail': 'An error occurred while fetching purpose trending data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===========================Business Permit Analytics Views=====================

class BusinessPermitAnalyticsView(APIView):
    """
    Analytics view for business permit data including statistics and trends
    """
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        try:
            from django.db.models import Count
            from datetime import date, timedelta
            try:
                from dateutil.relativedelta import relativedelta
            except ImportError:
                # Fallback if dateutil is not available
                from datetime import timedelta
                def relativedelta(**kwargs):
                    months = kwargs.get('months', 0)
                    return timedelta(days=months * 30)  # Approximate
            
            # Get date range parameters
            months_back = int(request.query_params.get('months', 6))
            end_date = date.today()
            start_date = end_date - relativedelta(months=months_back)
            
            # Total business permits count
            total_permits = BusinessPermitRequest.objects.count()
            total_issued = IssuedBusinessPermit.objects.count()
            total_pending = BusinessPermitRequest.objects.filter(req_status='Pending').count()
            total_completed = BusinessPermitRequest.objects.filter(req_status='Completed').count()
            total_rejected = BusinessPermitRequest.objects.filter(req_status='Rejected').count()
            
            # Purpose trending data using Django ORM
            purpose_trends = BusinessPermitRequest.objects.filter(
                req_request_date__gte=start_date,
                req_request_date__lte=end_date,
                pr_id__isnull=False
            ).values('pr_id__pr_purpose').annotate(
                count=Count('bpr_id')
            ).order_by('-count')[:10]
            
            # Monthly business permit requests
            monthly_requests = BusinessPermitRequest.objects.filter(
                req_request_date__gte=start_date,
                req_request_date__lte=end_date
            ).extra(
                select={'month': "DATE_TRUNC('month', req_request_date)"}
            ).values('month').annotate(
                count=Count('bpr_id')
            ).order_by('month')
            
            # Payment status breakdown
            payment_status_breakdown = BusinessPermitRequest.objects.values(
                'req_payment_status'
            ).annotate(
                count=Count('bpr_id')
            ).order_by('-count')
            
            # Recent business permit requests (last 7 days) using Django ORM
            recent_requests = BusinessPermitRequest.objects.filter(
                req_request_date__gte=date.today() - timedelta(days=7)
            ).select_related('pr_id', 'rp_id__per').values(
                'bpr_id',
                'req_request_date',
                'req_status',
                'pr_id__pr_purpose',
                'rp_id__per__per_fname',
                'rp_id__per__per_lname',
                'bus_permit_name',
                'bus_permit_address'
            ).order_by('-req_request_date')[:10]
            
            # Most requested purposes (all time) using Django ORM
            top_purposes = BusinessPermitRequest.objects.filter(
                pr_id__isnull=False
            ).values(
                'pr_id__pr_purpose',
                'pr_id__pr_category'
            ).annotate(
                count=Count('bpr_id')
            ).order_by('-count')[:15]
            
            # Business permit completion rate
            completion_rate = 0
            if total_permits > 0:
                completion_rate = round((total_completed / total_permits) * 100, 2)
            
            # Average processing time (in days) - using Python calculation instead of SQL
            completed_permits = BusinessPermitRequest.objects.filter(
                req_status='Completed',
                req_date_completed__isnull=False
            ).values('req_request_date', 'req_date_completed')
            
            avg_processing_days = 0
            if completed_permits.exists():
                total_days = 0
                count = 0
                for permit in completed_permits:
                    if permit['req_request_date'] and permit['req_date_completed']:
                        processing_days = (permit['req_date_completed'] - permit['req_request_date']).days
                        if processing_days >= 0:  # Only count positive processing days
                            total_days += processing_days
                            count += 1
                
                if count > 0:
                    avg_processing_days = round(total_days / count, 1)
            
            analytics_data = {
                'overview': {
                    'total_permits': total_permits,
                    'total_issued': total_issued,
                    'total_pending': total_pending,
                    'total_completed': total_completed,
                    'total_rejected': total_rejected,
                    'completion_rate': completion_rate,
                    'avg_processing_days': avg_processing_days
                },
                'purpose_trends': list(purpose_trends),
                'monthly_requests': list(monthly_requests),
                'payment_status_breakdown': list(payment_status_breakdown),
                'recent_requests': list(recent_requests),
                'top_purposes': list(top_purposes),
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'months_back': months_back
                }
            }
            
            return Response(analytics_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            logger.error(f"Error in business permit analytics: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response({
                'error': str(e),
                'detail': 'An error occurred while fetching business permit analytics',
                'traceback': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BusinessPermitSidebarView(APIView):
    """
    Sidebar data for business permit analytics
    """
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        try:
            from datetime import date, timedelta
            
            # Recent business permit requests (last 7 days)
            recent_requests = BusinessPermitRequest.objects.filter(
                req_request_date__gte=date.today() - timedelta(days=7)
            ).select_related('pr_id', 'rp_id__per').values(
                'bpr_id',
                'req_request_date',
                'req_status',
                'req_payment_status',
                'pr_id__pr_purpose',
                'rp_id__per__per_fname',
                'rp_id__per__per_lname',
                'bus_permit_name',
                'bus_permit_address'
            ).order_by('-req_request_date')[:10]
            
            sidebar_data = {
                'recent_requests': list(recent_requests)
            }
            
            return Response(sidebar_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in business permit sidebar: {str(e)}")
            return Response({
                'error': str(e),
                'detail': 'An error occurred while fetching business permit sidebar data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)