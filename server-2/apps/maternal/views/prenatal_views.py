from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Prefetch
from apps.maternal.serializers.prenatal_serializer import *
from apps.maternal.models import *
from apps.patientrecords.models import MedicalHistory
from apps.healthProfiling.models import PersonalAddress, FamilyComposition
from apps.pagination import StandardResultsPagination

import logging

logger = logging.getLogger(__name__)

class PrenatalAppointmentRequestCreateListView(generics.CreateAPIView):
    serializer_class = PrenatalRequestAppointmentSerializer
    queryset = PrenatalAppointmentRequest.objects.all()

    def create(self, request, *args, **kwargs):
        logger.info(f"Creating prenatal appointment request with data: {request.data}")
        
        try:
            serializers = self.get_serializer(data=request.data)

            if not serializers.is_valid():
                logger.error(f"Validation errors: {serializers.errors}")
                
                return Response ({
                    'error': 'Validation failed',
                    'details': serializers.errors
                }, status=status.HTTP_400_BAD_REQUEST)

            pa_request = serializers.save()
            logger.info(f"Prenatal appointment request created successfully with ID: {pa_request.par_id}")
            
            return Response({
                'message': 'Prenatal appointment request created successfully',
                'data': serializers.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating prenatal appointment request: {str(e)}")
            return Response({
                'error': 'An error occurred while creating the appointment request',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class PrenatalAppointmentRequestView(generics.ListAPIView):
    serializer_class = PrenatalRequestAppointmentSerializer
    queryset = PrenatalAppointmentRequest.objects.all()
    lookup_field = 'rp_id'

    def get_queryset(self):
        """Filter prenatal appointment requests by rp_id"""
        rp_id = self.kwargs.get('rp_id')
        if rp_id:
            return PrenatalAppointmentRequest.objects.filter(rp_id=rp_id)
        return PrenatalAppointmentRequest.objects.all()

    def list(self, request, *args, **kwargs):
        """Handle list with proper error handling for no requests"""
        try:
            queryset = self.get_queryset()
            
            # Calculate status counts
            status_counts = {
                'pending': queryset.filter(status='pending').count(),
                'approved': queryset.filter(status='approved').count(),
                'cancelled': queryset.filter(status='cancelled').count(),
                'completed': queryset.filter(status='completed').count(),
                'rejected': queryset.filter(status='rejected').count(),
                'missed': queryset.filter(status='missed').count()
            }
            
            if not queryset.exists():
                logger.info(f"No prenatal appointment requests found for rp_id: {kwargs.get('rp_id', 'all')}")
                return Response({
                    'message': 'No prenatal appointment requests found',
                    'requests': [],
                    'status_counts': status_counts
                }, status=status.HTTP_200_OK)

            # Manual serialization to handle date fields properly
            requests_data = []
            for appointment in queryset:
                appointment_data = {
                    'par_id': appointment.par_id,
                    'requested_at': appointment.requested_at.strftime('%Y-%m-%d') if appointment.requested_at else None,
                    'requested_date': appointment.requested_date.strftime('%Y-%m-%d') if appointment.requested_date else None,
                    'approved_at': appointment.approved_at.strftime('%Y-%m-%d') if appointment.approved_at else None,
                    'cancelled_at': appointment.cancelled_at.strftime('%Y-%m-%d') if appointment.cancelled_at else None,
                    'completed_at': appointment.completed_at.strftime('%Y-%m-%d') if appointment.completed_at else None,
                    'rejected_at': appointment.rejected_at.strftime('%Y-%m-%d') if appointment.rejected_at else None,
                    'missed_at': appointment.missed_at.strftime('%Y-%m-%d') if appointment.missed_at else None,
                    'reason': appointment.reason,
                    'status': appointment.status,
                    'rp_id': appointment.rp_id.rp_id if appointment.rp_id else None,
                    'pat_id': appointment.pat_id.pat_id if appointment.pat_id else None,
                }
                requests_data.append(appointment_data)
            
            logger.info(f"Found {queryset.count()} prenatal appointment requests")
            
            return Response({
                'message': 'Prenatal appointment requests retrieved successfully',
                'requests': requests_data,
                'status_counts': status_counts
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error retrieving prenatal appointment requests: {str(e)}")
            return Response({
                'error': 'An error occurred while retrieving appointment requests',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PrenatalAppointmentRequestViewAll(generics.ListAPIView):
    serializer_class = PrenatalRequestAppointmentSerializer
    queryset = PrenatalAppointmentRequest.objects.all()

    def list(self, request, *args, **kwargs):
        """Handle list with proper error handling for no requests"""
        try:
            queryset = self.get_queryset()
            
            # Calculate status counts
            status_counts = {
                'pending': queryset.filter(status='pending').count(),
                'approved': queryset.filter(status='approved').count(),
                'cancelled': queryset.filter(status='cancelled').count(),
                'completed': queryset.filter(status='completed').count(),
                'rejected': queryset.filter(status='rejected').count(),
                'missed': queryset.filter(status='missed').count()
            }
            
            if not queryset.exists():
                logger.info("No prenatal appointment requests found")
                return Response({
                    'message': 'No prenatal appointment requests found',
                    'requests': [],
                    'status_counts': status_counts
                }, status=status.HTTP_200_OK)

            # Manual serialization to handle date fields properly
            requests_data = []
            for appointment in queryset:
                appointment_data = {
                    'par_id': appointment.par_id,
                    'requested_at': appointment.requested_at.strftime('%Y-%m-%d') if appointment.requested_at else None,
                    'requested_date': appointment.requested_date if appointment.requested_date else None,
                    'approved_at': appointment.approved_at if appointment.approved_at else None,
                    'cancelled_at': appointment.cancelled_at if appointment.cancelled_at else None,
                    'completed_at': appointment.completed_at if appointment.completed_at else None,
                    'rejected_at': appointment.rejected_at if appointment.rejected_at else None,
                    'missed_at': appointment.missed_at if appointment.missed_at else None,
                    'reason': appointment.reason,
                    'status': appointment.status,
                    'rp_id': appointment.rp_id.rp_id if appointment.rp_id else None,
                    'pat_id': appointment.pat_id.pat_id if appointment.pat_id else None,
                }
                requests_data.append(appointment_data)
            
            logger.info(f"Found {queryset.count()} prenatal appointment requests")

            return Response({
                'message': 'Prenatal appointment requests retrieved successfully',
                'requests': requests_data,
                'status_counts': status_counts
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving prenatal appointment requests: {str(e)}")
            return Response({
                'error': 'An error occurred while retrieving appointment requests',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrenatalAppointmentRequestApproveView(generics.UpdateAPIView):
    """Approve a prenatal appointment request"""
    serializer_class = PARequestConfirmSerializer
    queryset = PrenatalAppointmentRequest.objects.all()
    lookup_field = 'par_id'

    def update(self, request, *args, **kwargs):
        try:
            par_id = kwargs.get('par_id')
            logger.info(f"Attempting to approve prenatal appointment request: {par_id}")
            
            # Get the appointment request
            try:
                appointment = PrenatalAppointmentRequest.objects.get(par_id=par_id)
            except PrenatalAppointmentRequest.DoesNotExist:
                logger.error(f"Prenatal appointment request not found: {par_id}")
                return Response({
                    'error': 'Appointment request not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if already approved
            if appointment.status == 'approved':
                return Response({
                    'message': 'Appointment request is already approved',
                    'data': {
                        'par_id': appointment.par_id,
                        'status': appointment.status,
                        'approved_at': appointment.approved_at
                    }
                }, status=status.HTTP_200_OK)
            
            # Check if it can be approved (not already completed, rejected, etc.)
            if appointment.status not in ['pending']:
                return Response({
                    'error': f'Cannot approve appointment request with status: {appointment.status}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Use the model's approve method
            staff_id = request.data.get('staff_id')  # Optional staff who approved
            appointment.approve(staff=staff_id)
            
            logger.info(f"Successfully approved prenatal appointment request: {par_id}")
            
            return Response({
                'message': 'Prenatal appointment request approved successfully',
                'data': {
                    'par_id': appointment.par_id,
                    'status': appointment.status,
                    'approved_at': appointment.approved_at.strftime('%Y-%m-%d') if appointment.approved_at else None,
                    'rp_id': appointment.rp_id.rp_id if appointment.rp_id else None,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error approving prenatal appointment request: {str(e)}")
            return Response({
                'error': 'An error occurred while approving the appointment request',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrenatalAppointmentRequestRejectView(generics.UpdateAPIView):
    """Reject a prenatal appointment request"""
    serializer_class = PARequestRejectSerializer
    queryset = PrenatalAppointmentRequest.objects.all()
    lookup_field = 'par_id'

    def update(self, request, *args, **kwargs):
        try:
            par_id = kwargs.get('par_id')
            reason = request.data.get('reason')
            
            logger.info(f"Attempting to reject prenatal appointment request: {par_id}")
            
            # Get the appointment request
            try:
                appointment = PrenatalAppointmentRequest.objects.get(par_id=par_id)
            except PrenatalAppointmentRequest.DoesNotExist:
                logger.error(f"Prenatal appointment request not found: {par_id}")
                return Response({
                    'error': 'Appointment request not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if already rejected
            if appointment.status == 'rejected':
                return Response({
                    'message': 'Appointment request is already rejected',
                    'data': {
                        'par_id': appointment.par_id,
                        'status': appointment.status,
                        'rejected_at': appointment.rejected_at,
                        'reason': appointment.reason
                    }
                }, status=status.HTTP_200_OK)
            
            # Check if it can be rejected (not already completed)
            if appointment.status == 'completed':
                return Response({
                    'error': 'Cannot reject a completed appointment request'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate that reason is provided
            if not reason or not reason.strip():
                return Response({
                    'error': 'Rejection reason is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Use the model's reject method
            staff_id = request.data.get('staff_id')  # Optional staff who rejected
            appointment.reject(reason=reason, staff=staff_id)
            
            logger.info(f"Successfully rejected prenatal appointment request: {par_id}")
            
            return Response({
                'message': 'Prenatal appointment request rejected successfully',
                'data': {
                    'par_id': appointment.par_id,
                    'status': appointment.status,
                    'rejected_at': appointment.rejected_at.strftime('%Y-%m-%d') if appointment.rejected_at else None,
                    'reason': appointment.reason,
                    'rp_id': appointment.rp_id.rp_id if appointment.rp_id else None,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error rejecting prenatal appointment request: {str(e)}")
            return Response({
                'error': 'An error occurred while rejecting the appointment request',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrenatalAppointmentRequestCancelView(generics.UpdateAPIView):
    """Cancel a prenatal appointment request"""
    serializer_class = PARequestRejectSerializer  # Uses same serializer as reject (status + reason)
    queryset = PrenatalAppointmentRequest.objects.all()
    lookup_field = 'par_id'

    def update(self, request, *args, **kwargs):
        try:
            par_id = kwargs.get('par_id')
            reason = request.data.get('reason', '')  # Optional for cancellation
            
            logger.info(f"Attempting to cancel prenatal appointment request: {par_id}")
            
            # Get the appointment request
            try:
                appointment = PrenatalAppointmentRequest.objects.get(par_id=par_id)
            except PrenatalAppointmentRequest.DoesNotExist:
                logger.error(f"Prenatal appointment request not found: {par_id}")
                return Response({
                    'error': 'Appointment request not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if already cancelled
            if appointment.status == 'cancelled':
                return Response({
                    'message': 'Appointment request is already cancelled',
                    'data': {
                        'par_id': appointment.par_id,
                        'status': appointment.status,
                        'cancelled_at': appointment.cancelled_at,
                        'reason': appointment.reason
                    }
                }, status=status.HTTP_200_OK)
            
            # Check if it can be cancelled (not already completed)
            if appointment.status == 'completed':
                return Response({
                    'error': 'Cannot cancel a completed appointment request'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Use the model's cancel method
            staff_id = request.data.get('staff_id')  # Optional staff who cancelled
            appointment.cancel(reason=reason if reason else None, staff=staff_id)
            
            logger.info(f"Successfully cancelled prenatal appointment request: {par_id}")
            
            return Response({
                'message': 'Prenatal appointment request cancelled successfully',
                'data': {
                    'par_id': appointment.par_id,
                    'status': appointment.status,
                    'cancelled_at': appointment.cancelled_at.strftime('%Y-%m-%d') if appointment.cancelled_at else None,
                    'reason': appointment.reason,
                    'was_approved_before_cancel': appointment.was_approved_before_cancel,
                    'rp_id': appointment.rp_id.rp_id if appointment.rp_id else None,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error cancelling prenatal appointment request: {str(e)}")
            return Response({
                'error': 'An error occurred while cancelling the appointment request',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrenatalAppointmentRequestCompleteView(generics.UpdateAPIView):
    """Mark a prenatal appointment request as completed"""
    serializer_class = PARequestConfirmSerializer
    queryset = PrenatalAppointmentRequest.objects.all()
    lookup_field = 'par_id'

    def update(self, request, *args, **kwargs):
        try:
            par_id = kwargs.get('par_id')
            logger.info(f"Attempting to complete prenatal appointment request: {par_id}")
            
            # Get the appointment request
            try:
                appointment = PrenatalAppointmentRequest.objects.get(par_id=par_id)
            except PrenatalAppointmentRequest.DoesNotExist:
                logger.error(f"Prenatal appointment request not found: {par_id}")
                return Response({
                    'error': 'Appointment request not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if already completed
            if appointment.status == 'completed':
                return Response({
                    'message': 'Appointment request is already completed',
                    'data': {
                        'par_id': appointment.par_id,
                        'status': appointment.status,
                        'completed_at': appointment.completed_at
                    }
                }, status=status.HTTP_200_OK)
            
            # Check if it can be completed (must be approved first)
            if appointment.status != 'approved':
                return Response({
                    'error': f'Cannot complete appointment request with status: {appointment.status}. Must be approved first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Use the model's complete method
            staff_id = request.data.get('staff_id')  # Optional staff who completed
            appointment.complete(staff=staff_id)
            
            logger.info(f"Successfully completed prenatal appointment request: {par_id}")
            
            return Response({
                'message': 'Prenatal appointment request completed successfully',
                'data': {
                    'par_id': appointment.par_id,
                    'status': appointment.status,
                    'completed_at': appointment.completed_at.strftime('%Y-%m-%d') if appointment.completed_at else None,
                    'rp_id': appointment.rp_id.rp_id if appointment.rp_id else None,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error completing prenatal appointment request: {str(e)}")
            return Response({
                'error': 'An error occurred while completing the appointment request',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrenatalAppointmentRequestMissedView(generics.UpdateAPIView):
    """Mark a prenatal appointment request as missed"""
    serializer_class = PARequestConfirmSerializer
    queryset = PrenatalAppointmentRequest.objects.all()
    lookup_field = 'par_id'

    def update(self, request, *args, **kwargs):
        try:
            par_id = kwargs.get('par_id')
            logger.info(f"Attempting to mark prenatal appointment request as missed: {par_id}")
            
            # Get the appointment request
            try:
                appointment = PrenatalAppointmentRequest.objects.get(par_id=par_id)
            except PrenatalAppointmentRequest.DoesNotExist:
                logger.error(f"Prenatal appointment request not found: {par_id}")
                return Response({
                    'error': 'Appointment request not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if already missed
            if appointment.status == 'missed':
                return Response({
                    'message': 'Appointment request is already marked as missed',
                    'data': {
                        'par_id': appointment.par_id,
                        'status': appointment.status,
                        'missed_at': appointment.missed_at
                    }
                }, status=status.HTTP_200_OK)
            
            # Check if it can be marked as missed (must be approved first)
            if appointment.status != 'approved':
                return Response({
                    'error': f'Cannot mark appointment request as missed with status: {appointment.status}. Must be approved first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Use the model's mark_as_missed method
            staff_id = request.data.get('staff_id')  # Optional staff who marked as missed
            appointment.mark_as_missed(staff=staff_id)
            
            logger.info(f"Successfully marked prenatal appointment request as missed: {par_id}")
            
            return Response({
                'message': 'Prenatal appointment request marked as missed successfully',
                'data': {
                    'par_id': appointment.par_id,
                    'status': appointment.status,
                    'missed_at': appointment.missed_at.strftime('%Y-%m-%d') if appointment.missed_at else None,
                    'rp_id': appointment.rp_id.rp_id if appointment.rp_id else None,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error marking prenatal appointment request as missed: {str(e)}")
            return Response({
                'error': 'An error occurred while marking the appointment request as missed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrenatalRecordsListView(generics.ListAPIView):
    """
    Optimized list view for prenatal records comparison table.
    Uses PrenatalFormCompleteViewSerializer with extensive query optimization.
    
    Query Parameters:
        - pat_id: Filter by patient ID
        - pregnancy_id: Filter by pregnancy ID
        - page: Page number for pagination
        - page_size: Number of records per page (max 100)
    """
    serializer_class = PrenatalFormCompleteViewSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        """
        Optimized queryset with select_related and prefetch_related to minimize queries.
        Reduces N+1 query problem from 1000+ queries to ~20-30 queries for large datasets.
        """
        # Get query parameters
        pat_id = self.request.query_params.get('pat_id', None)
        pregnancy_id = self.request.query_params.get('pregnancy_id', None)
        
        # Base queryset with comprehensive query optimization
        queryset = Prenatal_Form.objects.select_related(
            # Patient record chain
            'patrec_id',
            'patrec_id__pat_id',
            'patrec_id__pat_id__rp_id',
            'patrec_id__pat_id__rp_id__per',
            'patrec_id__pat_id__trans_id',
            'patrec_id__pat_id__trans_id__tradd_id',
            
            # Pregnancy
            'pregnancy_id',
            
            # Related models
            'vital_id',
            'spouse_id',
            'bm_id',
            'followv_id',
            'staff',
            'staff__rp',
            'staff__rp__per'
        ).prefetch_related(
            # Many-to-many and reverse foreign key relations
            'pf_previous_hospitalization',
            'pf_prenatal_care',
            'pf_anc_visit',
            'pf_checklist',
            'pf_birth_plan',
            'pf_obstetric_risk_code',
            
            # Laboratory results with images
            Prefetch(
                'lab_result',
                queryset=LaboratoryResult.objects.prefetch_related('lab_result_img')
            ),
            
            # TT Status for patient (optimized)
            Prefetch(
                'patrec_id__pat_id__tt_status',
                queryset=TT_Status.objects.order_by('-tts_date_given', '-tts_id'),
                to_attr='prefetched_tt_statuses'
            ),
            
            # Medical history with illness details
            Prefetch(
                'patrec_id__medical_history',
                queryset=MedicalHistory.objects.select_related('ill').order_by('-ill_date')
            ),
            
            # Previous pregnancy
            Prefetch(
                'patrec_id__previous_pregnancy',
                queryset=Previous_Pregnancy.objects.all()
            ),
            
            # Obstetrical history
            Prefetch(
                'patrec_id__obstetrical_history',
                queryset=Obstetrical_History.objects.all()
            ),
            
            # Personal address for Resident patients
            Prefetch(
                'patrec_id__pat_id__rp_id__per__personal_addresses',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_addresses'
            ),
            
            # Family composition for Resident patients
            Prefetch(
                'patrec_id__pat_id__rp_id__family_compositions',
                queryset=FamilyComposition.objects.select_related(
                    'fam',
                    'rp',
                    'rp__per'
                ),
                to_attr='prefetched_family_compositions'
            ),
        )
        
        # Apply filters if provided
        if pat_id:
            queryset = queryset.filter(patrec_id__pat_id__pat_id=pat_id)
            logger.info(f"Filtering prenatal records by patient ID: {pat_id}")
        
        if pregnancy_id:
            queryset = queryset.filter(pregnancy_id__pregnancy_id=pregnancy_id)
            logger.info(f"Filtering prenatal records by pregnancy ID: {pregnancy_id}")
        
        # Order by most recent first
        return queryset.order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """Custom list method with additional metadata"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            # Get total count before pagination
            total_count = queryset.count()
            
            # Paginate the queryset
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response = self.get_paginated_response(serializer.data)
                
                # Add custom metadata
                response.data['total_records'] = total_count
                response.data['message'] = 'Prenatal records retrieved successfully'
                
                logger.info(f"Retrieved {len(page)} prenatal records (page of {total_count} total)")
                return response
            
            # If pagination is disabled
            serializer = self.get_serializer(queryset, many=True)
            logger.info(f"Retrieved {total_count} prenatal records (no pagination)")
            
            return Response({
                'message': 'Prenatal records retrieved successfully',
                'total_records': total_count,
                'results': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving prenatal records: {str(e)}")
            return Response({
                'error': 'An error occurred while retrieving prenatal records',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)