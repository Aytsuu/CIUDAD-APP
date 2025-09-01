from rest_framework import generics
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.db.models import Prefetch, F
from django.core.exceptions import FieldError
from django.utils import timezone
from rest_framework.permissions import AllowAny
import uuid
import logging
import traceback

from .serializers import *
from apps.complaint.models import Complainant, Accused, ComplaintAccused
from apps.treasurer.models import Invoice
from apps.act_log.utils import create_activity_log
from .models import (
    ServiceChargeRequest,
    CaseActivity,
    CaseSuppDoc,
    ServiceChargeRequestFile,
    SummonDateAvailability,
    SummonTimeAvailability,
    ClerkCertificate,
    IssuedCertificate,
    BusinessPermitRequest,
    IssuedBusinessPermit,
    Business,
)

logger = logging.getLogger(__name__)


class ServiceChargeRequestView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ServiceChargeRequestSerializer

    def get_queryset(self):
        queryset = ServiceChargeRequest.objects.filter(
            sr_payment_status="Paid", 
            sr_type="Summon"
        ).select_related(
            'comp'
        )
        
        # Only apply prefetch_related if there are records with complaints
        if queryset.filter(comp__isnull=False).exists():
            queryset = queryset.prefetch_related(
                Prefetch('comp__complainant', queryset=Complainant.objects.select_related('add')),
                Prefetch('comp__complaintaccused_set', queryset=ComplaintAccused.objects.select_related('acsd')),
                'file_action_file'
            )
        
        return queryset.order_by('-sr_req_date')

# class FileActionrequestView(generics.ListCreateAPIView):
#     serializer_class = FileActionRequestSerializer
#     queryset = ServiceChargeRequest.objects.all()

# class FileActionrequestView(generics.ListCreateAPIView):
#     serializer_class = FileActionRequestSerializer
    
#     def get_queryset(self):
#         return ServiceChargeRequest.objects.select_related(
#             'comp',
#             'file_action_file'
#         ).prefetch_related(
#             Prefetch('comp__complainant', queryset=Complainant.objects.select_related('add')),
#             Prefetch('comp__complaintaccused_set__acsd', queryset=Accused.objects.select_related('add'))
#         ).order_by('-sr_req_date')

# class ServiceChargeRequestDetailView(generics.RetrieveAPIView):
#     serializer_class = ServiceChargeRequestDetailSerializer
#     lookup_field = 'sr_id'
    
#     def get_queryset(self):
#         return ServiceChargeRequest.objects.filter(
#             sr_payment_status="Paid",
#             sr_type="Summon"
#         ).select_related(
#             'comp',
#             'file_action_file',
#             'parent_summon'
#         ).prefetch_related(
#             Prefetch('comp__complainant', queryset=Complainant.objects.select_related('add')),
#             Prefetch('comp__complaintaccused_set__acsd', queryset=Accused.objects.select_related('add')),
#             Prefetch('case', queryset=CaseActivity.objects.prefetch_related(
#                 'supporting_docs',
#                 'srf'
#             ))
#         )
            
# class CaseActivityView(generics.ListCreateAPIView):
#     serializer_class = CaseActivitySerializer
#     queryset = CaseActivity.objects.all()

# class CaseActivityView(generics.ListCreateAPIView):
#     serializer_class = CaseActivitySerializer
    
#     def get_queryset(self):
#         return CaseActivity.objects.select_related(
#             'sr',
#             'srf'
#         ).prefetch_related(
#             'supporting_docs'
#         ).order_by('-ca_date_of_issuance')

# class CaseSuppDocView(generics.ListCreateAPIView):
#     serializer_class = CaseSuppDocSerializer
    
#     def get_queryset(self):
#         queryset = CaseSuppDoc.objects.all()
#         ca_id = self.kwargs.get('ca_id')
#         if ca_id is not None:
#             queryset = queryset.filter(ca_id=ca_id)
#         return queryset
    
# class DeleteCaseSuppDocView(generics.RetrieveDestroyAPIView):
#     queryset = CaseSuppDoc.objects.all()
#     serializer_class = CaseSuppDocSerializer
#     lookup_field = 'csd_id'

# class UpdateCaseSuppDocView(generics.UpdateAPIView):
#     serializer_class = CaseSuppDocSerializer
#     queryset = CaseSuppDoc.objects.all()
#     lookup_field = 'csd_id'

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# class CaseSuppDocView(generics.ListCreateAPIView):
#     serializer_class = CaseSuppDocSerializer
    
#     def get_queryset(self):
#         queryset = CaseSuppDoc.objects.all()
#         ca_id = self.kwargs.get('ca_id')
#         if ca_id is not None:
#             queryset = queryset.filter(ca_id=ca_id)
#         return queryset
    
# class DeleteCaseSuppDocView(generics.RetrieveDestroyAPIView):
#     queryset = CaseSuppDoc.objects.all()
#     serializer_class = CaseSuppDocSerializer
#     lookup_field = 'csd_id'

# class UpdateCaseSuppDocView(generics.UpdateAPIView):
#     serializer_class = CaseSuppDocSerializer
#     queryset = CaseSuppDoc.objects.all()
#     lookup_field = 'csd_id'

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateServiceChargeRequestView(generics.UpdateAPIView):
    serializer_class = ServiceChargeRequestSerializer
    queryset = ServiceChargeRequest.objects.all()
    lookup_field = 'sr_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# class ServiceChargeRequestFileView(generics.ListCreateAPIView):
#     serializer_class = ServiceChargeRequestFileSerializer
#     queryset = ServiceChargeRequestFile.objects.all()

class SummonDateAvailabilityView(generics.ListCreateAPIView):
    serializer_class = SummonDateAvailabilitySerializer
    queryset = SummonDateAvailability.objects.all()


class DeleteSummonDateAvailability(generics.RetrieveDestroyAPIView):
    queryset = SummonDateAvailability.objects.all()
    serializer_class = SummonDateAvailabilitySerializer
    lookup_field = 'sd_id'

class SummonTimeAvailabilityView(generics.ListCreateAPIView):
    serializer_class = SummonTimeAvailabilitySerializer
    queryset = SummonTimeAvailability.objects.all()

    def create(self, request, *args, **kwargs):
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            SummonTimeAvailability.objects.bulk_create([
                SummonTimeAvailability(**data) for data in serializer.validated_data
            ])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return super().create(request, *args, **kwargs)

class SummonTimeAvailabilityByDateView(generics.ListAPIView):
    serializer_class = SummonTimeAvailabilitySerializer

    def get_queryset(self):
        sd_id = self.kwargs.get('sd_id')  # get from URL path
        queryset = SummonTimeAvailability.objects.all()
        if sd_id is not None:
            queryset = queryset.filter(sd_id=sd_id)
        return queryset


class DeleteSummonTimeAvailabilityView(generics.RetrieveDestroyAPIView):
    queryset = SummonTimeAvailability.objects.all()
    serializer_class = SummonTimeAvailabilitySerializer
    lookup_field = 'st_id'


# Certificate Views
class CertificateListView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ClerkCertificateSerializer

    def get_queryset(self):
        return (
            ClerkCertificate.objects.filter(
                cr_req_payment_status="Paid"
            )
            .exclude(
                issuedcertificate__isnull=False
            )
            .select_related(
                'rp_id__per'
            )
            .prefetch_related(
                Prefetch(
                    'issuedcertificate_set',
                    queryset=IssuedCertificate.objects.select_related('certificate', 'staff')
                )
            )
            .only(
                'cr_id',
                'cr_req_request_date',
                'cr_req_status',
                'rp_id__per__per_fname',
                'rp_id__per__per_lname'
            )
        )

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

                staff_id = request.data.get('ra_id') or '00005250821'
                staff = Staff.objects.filter(staff_id=staff_id).first()

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
                    logger.warning(f"Staff not found for ID: {staff_id}, cannot log activity")

            except Exception as log_error:
                logger.error(f"Failed to log activity for certificate creation: {str(log_error)}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating certificate: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            logger.info(f"Found {queryset.count()} certificates")

            for cert in queryset:
                logger.info(f"Certificate {cert.cr_id}:")
                logger.info(f"- RP ID: {cert.rp_id if cert.rp_id else 'None'}")
                try:
                    if cert.rp_id and cert.rp_id.per:
                        logger.info(f"- Person: {cert.rp_id.per.per_fname} {cert.rp_id.per.per_lname}")
                    issued_cert = cert.issuedcertificate_set.first()
                    if issued_cert:
                        logger.info(f"- Issued Certificate: {issued_cert.ic_id}")
                        logger.info(f"- Certificate ID: {issued_cert.certificate.cr_id if issued_cert.certificate else 'No certificate'}")
                except (AttributeError, FieldError) as e:
                    logger.warning(f"Could not access details for certificate {cert.cr_id}: {str(e)}")

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in CertificateListView: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": str(e), "traceback": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class NonResidentsCertReqView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = NonResidentCertReqSerializer
    queryset = NonResidentCertificateRequest.objects.all()


class UpdateNonResidentCertReqView(generics.UpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = NonResidentCertReqUpdateSerializer
    queryset = NonResidentCertificateRequest.objects.all()
    lookup_field = 'nrc_id'

    
class CertificateStatusUpdateView(generics.UpdateAPIView):
    permission_classes = [AllowAny]
    queryset = ClerkCertificate.objects.all()
    serializer_class = CertificateStatusUpdateSerializer
    lookup_field = 'cr_id'
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'message': 'Status updated successfully',
            'cr_id': instance.cr_id,
            'new_status': instance.cr_req_status
        }, status=status.HTTP_200_OK)
    

class CertificateDetailView(generics.RetrieveUpdateAPIView):  # Changed from RetrieveAPIView
    permission_classes = [AllowAny]
    queryset = ClerkCertificate.objects.all()
    serializer_class = ClerkCertificateSerializer
    lookup_field = 'cr_id'

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

    def get_queryset(self):
        try:
            queryset = (
                IssuedCertificate.objects.filter(
                    staff__staff_id="00005250821"
                )
                .select_related(
                    'certificate__rp_id__per',
                    'staff'
                )
            )

            logger.info(f"Found {queryset.count()} issued certificates")
            return queryset
        except Exception as e:
            logger.error(f"Error in get_queryset: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            for cert in queryset:
                logger.info(f"Processing certificate: {cert.ic_id}")
                logger.info(f"- Certificate: {cert.certificate.cr_id if cert.certificate else 'No certificate'}")
                logger.info(f"- Staff: {cert.staff.staff_id if cert.staff else 'No staff'}")

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in IssuedCertificateListView: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return Response(
                {"error": str(e), "detail": "An error occurred while retrieving issued certificates"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MarkCertificateAsIssuedView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = IssuedCertificateSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            cr_id = request.data.get('cr_id')
            staff_id = request.data.get('staff_id', '00005250821')
            
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
            
            # Get or create staff
            from apps.administration.models import Staff
            staff, created = Staff.objects.get_or_create(staff_id="00005250821")
            
        
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
class BusinessPermitListView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = BusinessPermitSerializer

    def get_queryset(self):
        return BusinessPermitRequest.objects.filter(
            req_payment_status="Paid"
        ).exclude(
            # Exclude business permits that are already issued
            issuedbusinesspermit__isnull=False
        ).select_related('bus_id').all()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            logger.info(f"Found {queryset.count()} business permits")
            
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

class PermitClearanceView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BusinessPermitCreateSerializer
        return BusinessPermitSerializer
    
    def get_queryset(self):
        return BusinessPermitRequest.objects.select_related('bus_id').all()
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
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

    def get_queryset(self):
        try:
            queryset = IssuedBusinessPermit.objects.select_related(
                'permit_request__business',
                'staff'
            ).all()
            
            logger.info(f"Found {queryset.count()} issued business permits")
            return queryset
        except Exception as e:
            logger.error(f"Error in get_queryset: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
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

class MarkBusinessPermitAsIssuedView(generics.CreateAPIView):
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

class PersonalClearancesView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            clearances = ClerkCertificate.objects.select_related(
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

            serializer = ClerkCertificateSerializer(clearances, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in get_personal_clearances: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": str(e), "detail": "An error occurred while retrieving personal clearances"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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

class ClearanceRequestView(generics.CreateAPIView):
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