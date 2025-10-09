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
    Business,
    ServiceChargeRequest,
    BusinessPermitFile,
)
from rest_framework.generics import RetrieveAPIView
from django.http import Http404 
from django.db.models import Q
from utils.supabase_client import upload_to_storage
import base64
import uuid

logger = logging.getLogger(__name__)

# ==================== MIGHT DELETE LATER ========================    

# class UpdateSummonScheduleView(ActivityLogMixin, generics.UpdateAPIView):
#     serializer_class = SummonScheduleSerializer
#     queryset = SummonSchedule.objects.all()
#     lookup_field = 'ss_id'

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class ServiceChargePaymentRequestView(generics.ListCreateAPIView):
    serializer_class = ServiceChargePaymentRequestSerializer
    queryset = ServiceChargePaymentRequest.objects.all()
    
# class UpdateSummonRequestView(generics.UpdateAPIView):
#     serializer_class = SummonRequestSerializer
#     queryset = ServiceChargeRequest.objects.all()
#     lookup_field = 'sr_id'

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
        
#         # Check if status is being updated to "Paid" and sr_code needs to be generated
#         if (request.data.get('status') == 'Paid' or 
#             request.data.get('sr_req_status') == 'Paid') and not instance.sr_code:
            
#             # Generate sr_code using the logic: 0000-25, 0001-25, etc.
#             sr_count = ServiceChargeRequest.objects.count() + 1
#             year_suffix = timezone.now().year % 100
#             sr_code = f"{sr_count:04d}-{year_suffix:02d}"
            
#             # Add sr_code to the request data
#             request.data['sr_code'] = sr_code
            
#             logger.info(f"Generated sr_code: {sr_code} for ServiceChargeRequest: {instance.sr_id}")
        
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# class SummonSuppDocView(generics.ListCreateAPIView):
#     permission_classes = [AllowAny]
#     serializer_class = SummonSuppDocCreateSerializer
#     queryset = SummonSuppDoc.objects.all()

    
# class SummonSuppDocRetrieveView(generics.ListCreateAPIView):
#     permission_classes = [AllowAny]
#     serializer_class = SummonSuppDocViewSieralizer

#     def get_queryset(self):
#         ss_id = self.kwargs.get('ss_id')
#         if ss_id:
#             # Use the exact field name from your model
#             return SummonSuppDoc.objects.filter(ss_id=ss_id)
#         return SummonSuppDoc.objects.all()
    

class ServiceChargeDecisionView(generics.ListCreateAPIView):
    serializer_class = ServiceChargeDecisionSerializer
    queryset = ServiceChargeDecision.objects.all()



#========================== CASE TACKING VIEW ========================
class CaseTrackingView(generics.RetrieveAPIView):
    serializer_class = CaseTrackingSerializer
    def get_object(self):
        comp_id = self.kwargs.get('comp_id')
        
        try:
            case = ServiceChargeRequest.objects.get(comp_id=comp_id)
            
            return case
        except ServiceChargeRequest.DoesNotExist:
            raise Http404("Case not found for this complaint")
    
    def get(self, request, *args, **kwargs):
        case = self.get_object()
        serializer = self.get_serializer(case)
        return Response(serializer.data)



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
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(cr_req_status=status_filter)

        # Payment status filter - matching web version
        payment_status = self.request.query_params.get('payment_status', None)
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
                        create_activity_log(
                            act_type="Personal Clearance Request Created",
                            act_description=f"Personal clearance request {certificate.cr_id} created for {certificate.pr_id.pr_purpose if certificate.pr_id else 'N/A'}",
                            staff=staff,
                            record_id=certificate.cr_id,
                            feat_name="Personal Clearance Management"
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
        search = self.request.query_params.get('search', None)
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
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(nrc_req_status=status_filter)
        
        # Payment status filter
        payment_status = self.request.query_params.get('payment_status', None)
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
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
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
        self.perform_update(serializer)
        
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
                    # Create activity log
                    create_activity_log(
                        act_type="Certificate Issued",
                        act_description=f"Certificate {cr_id} marked as issued/printed",
                        staff=staff,
                        record_id=str(issued_certificate.ic_id),
                        feat_name="Certificate Management"
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
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(req_status=status_filter)

        # Payment status filter - matching web version
        payment_status = self.request.query_params.get('payment_status', None)
        if payment_status:
            queryset = queryset.filter(req_payment_status=payment_status)

        # Business type filter - matching web version
        business_type = self.request.query_params.get('business_type', None)
        if business_type:
            queryset = queryset.filter(bus_id__bus_type=business_type)

        return queryset.order_by('-req_request_date')

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
        search = self.request.query_params.get('search', None)
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
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(req_status=status_filter)

        # Payment status filter
        payment_status = self.request.query_params.get('payment_status', None)
        if payment_status:
            queryset = queryset.filter(req_payment_status=payment_status)

        return queryset.order_by('-req_request_date')
    
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
            logger.error(f"Error in PermitClearanceView.list: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    "error": str(e),
                    "detail": "An error occurred while retrieving permit clearances"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                permit_clearance = serializer.save()
                # Create BusinessPermitFile rows if provided
                try:
                    from .models import BusinessPermitFile
                    create_payload = []
                    prev_url = request.data.get('previous_permit_image')
                    assess_url = request.data.get('assessment_image')
                    if prev_url:
                        prev_name = str(prev_url).split('/')[-1] if isinstance(prev_url, str) else ''
                        create_payload.append(BusinessPermitFile(
                            bpf_name=prev_name or 'previous_permit',
                            bpf_type='previous_permit',
                            bpf_url=prev_url,
                            bpr_id=permit_clearance
                        ))
                    if assess_url:
                        assess_name = str(assess_url).split('/')[-1] if isinstance(assess_url, str) else ''
                        create_payload.append(BusinessPermitFile(
                            bpf_name=assess_name or 'assessment',
                            bpf_type='assessment',
                            bpf_url=assess_url,
                            bpr_id=permit_clearance
                        ))
                    if create_payload:
                        BusinessPermitFile.objects.bulk_create(create_payload)
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
                        # Create activity log
                        create_activity_log(
                            act_type="Business Permit Request Created",
                            act_description=f"Business permit request {permit_clearance.bpr_id} created",
                            staff=staff,
                            record_id=permit_clearance.bpr_id,
                            feat_name="Business Permit Management"
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
                'permit_request__bus_id',
                'permit_request__rp_id__per',
                'permit_request__pr_id',
                'staff'
            ).all()

            # Search functionality - matching web version
            search = self.request.query_params.get('search', None)
            if search:
                queryset = queryset.filter(
                    Q(ibp_id__icontains=search) |
                    Q(permit_request__bus_permit_name__icontains=search) |
                    Q(permit_request__rp_id__per__per_fname__icontains=search) |
                    Q(permit_request__rp_id__per__per_lname__icontains=search) |
                    Q(permit_request__pr_id__pr_purpose__icontains=search) |
                    Q(date_issued__icontains=search)
                )

            # Purpose filter - matching web version
            purpose_filter = self.request.query_params.get('purpose', None)
            if purpose_filter:
                queryset = queryset.filter(permit_request__pr_id__pr_purpose=purpose_filter)

            # Date range filter - matching web version
            date_from = self.request.query_params.get('date_from', None)
            date_to = self.request.query_params.get('date_to', None)
            if date_from:
                queryset = queryset.filter(date_issued__gte=date_from)
            if date_to:
                queryset = queryset.filter(date_issued__lte=date_to)
            
            logger.info(f"Found {queryset.count()} issued business permits")
            return queryset.order_by('-date_issued')
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
            if IssuedBusinessPermit.objects.filter(permit_request=permit_request).exists():
                return Response(
                    {"error": f"Business permit {bpr_id} is already issued"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create staff
            from apps.administration.models import Staff
            staff, created = Staff.objects.get_or_create(staff_id=staff_id)
            
            # Generate unique ibp_id
            import uuid
            ibp_id = f"IBP{uuid.uuid4().hex[:8].upper()}"
            
            # Create issued business permit (no file field needed)
            issued_permit = IssuedBusinessPermit.objects.create(
                ibp_id=ibp_id,
                ibp_date_of_issuance=timezone.now().date(),
                permit_request=permit_request,
                staff=staff
            )
            
            # Log the activity
            try:
                from apps.act_log.utils import create_activity_log
                
                if staff:
                    # Create activity log
                    create_activity_log(
                        act_type="Business Permit Issued",
                        act_description=f"Business permit {bpr_id} marked as issued/printed",
                        staff=staff,
                        record_id=issued_permit.ibp_id,
                        feat_name="Business Permit Management"
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

        # Status filter
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(cr_req_status=status_filter)

        # Payment status filter
        payment_status = self.request.query_params.get('payment_status', None)
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
                    prev_url = request.data.get('previous_permit_image')
                    assess_url = request.data.get('assessment_image')
                    if prev_url:
                        prev_name = str(prev_url).split('/')[-1] if isinstance(prev_url, str) else ''
                        create_payload.append(BusinessPermitFile(
                            bpf_name=prev_name or 'previous_permit',
                            bpf_type='previous_permit',
                            bpf_url=prev_url,
                            bpr_id=clearance_request
                        ))
                    if assess_url:
                        assess_name = str(assess_url).split('/')[-1] if isinstance(assess_url, str) else ''
                        create_payload.append(BusinessPermitFile(
                            bpf_name=assess_name or 'assessment',
                            bpf_type='assessment',
                            bpf_url=assess_url,
                            bpr_id=clearance_request
                        ))
                    if create_payload:
                        BusinessPermitFile.objects.bulk_create(create_payload)
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
                        # Create activity log
                        create_activity_log(
                            act_type="Business Clearance Request Created",
                            act_description=f"Business clearance request {clearance_request.bpr_id} created",
                            staff=staff,
                            record_id=clearance_request.bpr_id,
                            feat_name="Business Clearance Management"
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
        
        queryset = ServiceChargePaymentRequest.objects.filter(
            pay_sr_type='Summon'
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

        return queryset.order_by('-pay_date_req')


# ---------------------- Business Permit Files ----------------------
class BusinessPermitFilesView(generics.ListAPIView):
    """
    API endpoint to fetch business permit files for a specific business permit request
    """
    permission_classes = [AllowAny]
    
    def get(self, request, bpr_id):
        try:
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
                    'bpf_name': file.bpf_name,
                    'bpf_type': file.bpf_type,
                    'bpf_path': file.bpf_path,
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
    """
    Upload business permit files to S3 bucket
    """
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
            
            # Update the payment status
            payment_request.pay_status = "Paid"
            payment_request.pay_date_paid = timezone.now()
            payment_request.save()
            
            return Response({
                'message': 'Payment status updated successfully',
                'pay_id': payment_request.pay_id,
                'pay_status': payment_request.pay_status,
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