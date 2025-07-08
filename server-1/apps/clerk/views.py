# from rest_framework import generics
# from rest_framework.exceptions import NotFound
# from .models import ServiceChargeRequest
# from .serializers import *
# from rest_framework.response import Response
# from rest_framework import status
# from django.db.models import Prefetch

# class ServiceChargeRequestView(generics.ListCreateAPIView):
#     serializer_class = ServiceChargeRequestSerializer

#     def get_queryset(self):
#         return ServiceChargeRequest.objects.filter(sr_payment_status="Paid", sr_type = "Summon").select_related(
#             'comp'  
#         ).prefetch_related(
#             'comp__complaintaccused_set__acsd'  
#         )

# class FileActionrequestView(generics.ListCreateAPIView):
#     serializer_class = FileActionRequestSerializer
#     queryset = ServiceChargeRequest.objects.all()

# # class ServiceChargeRequestDetailView(generics.RetrieveAPIView):
# #     serializer_class = ServiceChargeRequestDetailSerializer
# #     lookup_field = 'sr_id'
    
# #     def get_queryset(self):
# #         return ServiceChargeRequest.objects.filter(
# #             sr_payment_status="Paid",
# #             sr_type="Summon"
# #         ).select_related(
# #             'comp__cpnt__add',  # Include complainant's address
# #             'comp'  # Include complaint
# #         ).prefetch_related(
# #             'comp__complaintaccused_set__acsd__add',  # Include accused's address
# #             Prefetch('case', queryset=CaseActivity.objects.prefetch_related('supporting_docs'))
# #         )

# class ServiceChargeRequestDetailView(generics.RetrieveAPIView):
#     serializer_class = ServiceChargeRequestDetailSerializer
#     lookup_field = 'sr_id'
    
#     def get_queryset(self):
#         return ServiceChargeRequest.objects.filter(
#             sr_payment_status="Paid",
#             sr_type="Summon"
#         ).select_related(
#             'comp'
#         ).prefetch_related(
#             'comp__complainant', 
#             'comp__complaintaccused_set__acsd',
#             Prefetch('case', queryset=CaseActivity.objects.prefetch_related('supporting_docs'))
#         )
            
# class CaseActivityView(generics.ListCreateAPIView):
#     serializer_class = CaseActivitySerializer
#     queryset = CaseActivity.objects.all()

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

# class UpdateServiceChargeRequestView(generics.UpdateAPIView):
#     serializer_class = ServiceChargeRequestSerializer
#     queryset = ServiceChargeRequest.objects.all()
#     lookup_field = 'sr_id'

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# class ServiceChargeRequestFileView(generics.ListCreateAPIView):
#     serializer_class = ServiceChargeRequestFileSerializer
#     queryset = ServiceChargeRequestFile.objects.all()
    


from rest_framework import generics
from rest_framework.exceptions import NotFound
from .models import ServiceChargeRequest
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
<<<<<<< HEAD
from django.db.models import Prefetch
=======
from .models import ClerkCertificate, IssuedCertificate, BusinessPermitRequest, IssuedBusinessPermit, Business, Invoice
from apps.file.models import File
from .serializers import (
    ClerkCertificateSerializer,
    IssuedCertificateSerializer,
    BusinessPermitSerializer,
    IssuedBusinessPermitSerializer
)
from supabase import create_client, Client 
>>>>>>> e82204304 (update)

class ServiceChargeRequestView(generics.ListCreateAPIView):
    serializer_class = ServiceChargeRequestSerializer

<<<<<<< HEAD
    def get_queryset(self):
        return ServiceChargeRequest.objects.filter(
            sr_payment_status="Paid", 
            sr_type="Summon"
        ).select_related(
            'comp'
        ).prefetch_related(
            Prefetch('comp__complainant', queryset=Complainant.objects.select_related('add')),
            Prefetch('comp__complaintaccused_set__acsd', queryset=Accused.objects.select_related('add')),
            'file_action_file'
        ).order_by('-sr_req_date')
=======
import tempfile
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import logging
import traceback
from django.core.exceptions import FieldError
from django.db.models import F, Prefetch
import uuid
from django.utils import timezone
from rest_framework.decorators import api_view
>>>>>>> e82204304 (update)

# class FileActionrequestView(generics.ListCreateAPIView):
#     serializer_class = FileActionRequestSerializer
#     queryset = ServiceChargeRequest.objects.all()

<<<<<<< HEAD
class FileActionrequestView(generics.ListCreateAPIView):
    serializer_class = FileActionRequestSerializer
    
    def get_queryset(self):
        return ServiceChargeRequest.objects.select_related(
            'comp',
            'file_action_file'
        ).prefetch_related(
            Prefetch('comp__complainant', queryset=Complainant.objects.select_related('add')),
            Prefetch('comp__complaintaccused_set__acsd', queryset=Accused.objects.select_related('add'))
        ).order_by('-sr_req_date')
    
    def get_queryset(self):
        return ServiceChargeRequest.objects.select_related(
            'comp',
            'file_action_file'
        ).prefetch_related(
            Prefetch('comp__complainant', queryset=Complainant.objects.select_related('add')),
            Prefetch('comp__complaintaccused_set__acsd', queryset=Accused.objects.select_related('add'))
        ).order_by('-sr_req_date')

class ServiceChargeRequestDetailView(generics.RetrieveAPIView):
    serializer_class = ServiceChargeRequestDetailSerializer
    lookup_field = 'sr_id'
    
    def get_queryset(self):
        return ServiceChargeRequest.objects.filter(
            sr_payment_status="Paid",
            sr_type="Summon"
        ).select_related(
            'comp',
            'file_action_file',
            'parent_summon'
            'comp',
            'file_action_file',
            'parent_summon'
        ).prefetch_related(
            Prefetch('comp__complainant', queryset=Complainant.objects.select_related('add')),
            Prefetch('comp__complaintaccused_set__acsd', queryset=Accused.objects.select_related('add')),
            Prefetch('case', queryset=CaseActivity.objects.prefetch_related(
                'supporting_docs',
                'srf'
            ))
            Prefetch('comp__complainant', queryset=Complainant.objects.select_related('add')),
            Prefetch('comp__complaintaccused_set__acsd', queryset=Accused.objects.select_related('add')),
            Prefetch('case', queryset=CaseActivity.objects.prefetch_related(
                'supporting_docs',
                'srf'
            ))
        )
            
# class CaseActivityView(generics.ListCreateAPIView):
#     serializer_class = CaseActivitySerializer
#     queryset = CaseActivity.objects.all()

            
# class CaseActivityView(generics.ListCreateAPIView):
#     serializer_class = CaseActivitySerializer
#     queryset = CaseActivity.objects.all()

class CaseActivityView(generics.ListCreateAPIView):
    serializer_class = CaseActivitySerializer
    
    def get_queryset(self):
        return CaseActivity.objects.select_related(
            'sr',
            'srf'
        ).prefetch_related(
            'supporting_docs'
        ).order_by('-ca_date_of_issuance')

class CaseSuppDocView(generics.ListCreateAPIView):
    serializer_class = CaseSuppDocSerializer
    
    def get_queryset(self):
        queryset = CaseSuppDoc.objects.all()
        ca_id = self.kwargs.get('ca_id')
        if ca_id is not None:
            queryset = queryset.filter(ca_id=ca_id)
        return queryset
    
class DeleteCaseSuppDocView(generics.RetrieveDestroyAPIView):
    queryset = CaseSuppDoc.objects.all()
    serializer_class = CaseSuppDocSerializer
    lookup_field = 'csd_id'

class UpdateCaseSuppDocView(generics.UpdateAPIView):
    serializer_class = CaseSuppDocSerializer
    queryset = CaseSuppDoc.objects.all()
    lookup_field = 'csd_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_queryset(self):
        return CaseActivity.objects.select_related(
            'sr',
            'srf'
        ).prefetch_related(
            'supporting_docs'
        ).order_by('-ca_date_of_issuance')

class CaseSuppDocView(generics.ListCreateAPIView):
    serializer_class = CaseSuppDocSerializer
    
    def get_queryset(self):
        queryset = CaseSuppDoc.objects.all()
        ca_id = self.kwargs.get('ca_id')
        if ca_id is not None:
            queryset = queryset.filter(ca_id=ca_id)
        return queryset
    
class DeleteCaseSuppDocView(generics.RetrieveDestroyAPIView):
    queryset = CaseSuppDoc.objects.all()
    serializer_class = CaseSuppDocSerializer
    lookup_field = 'csd_id'

class UpdateCaseSuppDocView(generics.UpdateAPIView):
    serializer_class = CaseSuppDocSerializer
    queryset = CaseSuppDoc.objects.all()
    lookup_field = 'csd_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class CaseSuppDocView(generics.ListCreateAPIView):
    serializer_class = CaseSuppDocSerializer
    
    def get_queryset(self):
        queryset = CaseSuppDoc.objects.all()
        ca_id = self.kwargs.get('ca_id')
        if ca_id is not None:
            queryset = queryset.filter(ca_id=ca_id)
        return queryset
    
class DeleteCaseSuppDocView(generics.RetrieveDestroyAPIView):
    queryset = CaseSuppDoc.objects.all()
    serializer_class = CaseSuppDocSerializer
    lookup_field = 'csd_id'

class UpdateCaseSuppDocView(generics.UpdateAPIView):
    serializer_class = CaseSuppDocSerializer
    queryset = CaseSuppDoc.objects.all()
    lookup_field = 'csd_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    
class ServiceChargeRequestFileView(generics.ListCreateAPIView):
    serializer_class = ServiceChargeRequestFileSerializer
    queryset = ServiceChargeRequestFile.objects.all()
    


=======
class CertificateListView(generics.ListCreateAPIView):
    serializer_class = ClerkCertificateSerializer

    def get_queryset(self):
        return ClerkCertificate.objects.select_related(
            'rp__per'
        ).prefetch_related(
            Prefetch(
                'issuedcertificate_set',
                queryset=IssuedCertificate.objects.select_related('file')
            )
        ).only(
            'cr_id',
            'req_pay_method',
            'req_request_date',
            'req_claim_date',
            'req_type',
            'rp__per__per_fname',
            'rp__per__per_lname'
        )

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            logger.info(f"Found {queryset.count()} certificates")
            
            # Log the raw queryset data
            for cert in queryset:
                logger.info(f"Certificate {cert.cr_id}:")
                logger.info(f"- RP ID: {cert.rp_id if cert.rp_id else 'None'}")
                try:
                    if cert.rp and cert.rp.per:
                        logger.info(f"- Person: {cert.rp.per.per_fname} {cert.rp.per.per_lname}")
                    # Log issued certificate info
                    issued_cert = cert.issuedcertificate_set.first()
                    if issued_cert:
                        logger.info(f"- Issued Certificate: {issued_cert.ic_id}")
                        logger.info(f"- File: {issued_cert.file.file_name if issued_cert.file else 'No file'}")
                except (AttributeError, FieldError) as e:
                    logger.warning(f"Could not access details for certificate {cert.cr_id}: {str(e)}")
                
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in CertificateListView: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    "error": str(e),
                    "traceback": traceback.format_exc()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CertificateDetailView(generics.RetrieveAPIView):
    queryset = ClerkCertificate.objects.all()
    serializer_class = ClerkCertificateSerializer
    lookup_field = 'cr_id'

class IssuedCertificateListView(generics.ListAPIView):
    serializer_class = IssuedCertificateSerializer

    def get_queryset(self):
        try:
            queryset = IssuedCertificate.objects.select_related(
                'certificate__rp__per',
                'file',
                'staff'
            ).defer(
                'certificate__rp__per__per_address'
            ).all()
            
            logger.info(f"Found {queryset.count()} issued certificates")
            return queryset
        except Exception as e:
            logger.error(f"Error in get_queryset: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            # Log each certificate for debugging
            for cert in queryset:
                logger.info(f"Processing certificate: {cert.ic_id}")
                logger.info(f"- File: {cert.file.file_url if cert.file else 'No file'}")
                logger.info(f"- Certificate: {cert.certificate.cr_id if cert.certificate else 'No certificate'}")
                logger.info(f"- Staff: {cert.staff.staff_id if cert.staff else 'No staff'}")

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in IssuedCertificateListView: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return Response(
                {
                    "error": str(e),
                    "detail": "An error occurred while retrieving issued certificates"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BusinessPermitListView(generics.ListCreateAPIView):
    serializer_class = BusinessPermitSerializer

    def get_queryset(self):
        return BusinessPermitRequest.objects.select_related(
            'business'
        ).prefetch_related(
            Prefetch(
                'issuedbusinesspermit_set',
                queryset=IssuedBusinessPermit.objects.select_related('file')
            )
        ).only(
            'bpr_id',
            'req_pay_method',
            'req_request_date',
            'req_claim_date',
            'req_sales_proof',
            'req_status',
            'req_payment_status',
            'req_transac_id',
            'business__bus_id',
            'business__bus_name',
            'business__bus_gross_sales',
            'business__bus_province',
            'business__bus_city',
            'business__bus_barangay',
            'business__bus_street',
            'business__bus_respondentLname',
            'business__bus_respondentFname',
            'business__bus_respondentMname',
            'business__bus_respondentSex',
            'business__bus_respondentDob',
            'business__bus_date_registered',
            'business__sitio_id',
            'business__staff_id'
        )

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

class IssuedBusinessPermitListView(generics.ListAPIView):
    serializer_class = IssuedBusinessPermitSerializer

    def get_queryset(self):
        try:
            queryset = IssuedBusinessPermit.objects.select_related(
                'permit_request__business',
                'file',
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

@api_view(['GET'])
def get_personal_clearances(request):
    try:
        clearances = ClerkCertificate.objects.select_related(
            'rp__per'
        ).prefetch_related(
            Prefetch('clerk_invoices', queryset=Invoice.objects.all())
        ).only(
            'cr_id',
            'req_type',
            'req_request_date',
            'req_claim_date',
            'req_payment_status',
            'req_pay_method',
            'req_transac_id',
            'rp__per__per_fname',
            'rp__per__per_lname'
        ).all()
        
        serializer = ClerkCertificateSerializer(clearances, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in get_personal_clearances: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response(
            {
                "error": str(e),
                "detail": "An error occurred while retrieving personal clearances"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def create_payment_intent(request, cr_id):
    try:
        certificate = ClerkCertificate.objects.get(cr_id=cr_id)
        
        # Get the amount from purpose_and_rate
        amount = certificate.pr_id.pr_rate if certificate.pr_id else 0
        
        # Create PayMongo payment intent
        # You'll need to implement the actual PayMongo integration here
        payment_intent = {
            'id': 'dummy_payment_intent_id',  # Replace with actual PayMongo call
            'amount': amount,
            'status': 'awaiting_payment'
        }
        
        # Create invoice record
        invoice = Invoice.objects.create(
            invoice_id=f"INV-{cr_id}",
            payment_intent_id=payment_intent['id'],
            payment_status='Pending',
            amount=amount,
            certificate=certificate
        )
        
        return Response({
            'invoice_id': invoice.invoice_id,
            'payment_intent_id': payment_intent['id'],
            'amount': amount
        })
    except ClerkCertificate.DoesNotExist:
        return Response(
            {"error": "Certificate request not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error in create_payment_intent: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def webhook_payment_status(request):
    try:
        # Verify PayMongo webhook signature
        # Process the webhook payload
        payment_intent_id = request.data.get('data', {}).get('id')
        payment_status = request.data.get('data', {}).get('attributes', {}).get('status')
        
        if payment_intent_id:
            invoice = Invoice.objects.get(payment_intent_id=payment_intent_id)
            invoice.payment_status = payment_status
            invoice.save()
            
            # Update certificate payment status
            if invoice.certificate:
                invoice.certificate.req_payment_status = payment_status
                invoice.certificate.save()
            
            return Response({'status': 'success'})
    except Exception as e:
        logger.error(f"Error in webhook_payment_status: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
>>>>>>> e82204304 (update)
