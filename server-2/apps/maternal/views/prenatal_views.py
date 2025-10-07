from rest_framework import generics, status
from rest_framework.response import Response
from apps.maternal.serializers.prenatal_serializer import *

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
                'rejected': queryset.filter(status='rejected').count()
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
                    'approved_at': appointment.approved_at.strftime('%Y-%m-%d') if appointment.approved_at else None,
                    'cancelled_at': appointment.cancelled_at.strftime('%Y-%m-%d') if appointment.cancelled_at else None,
                    'completed_at': appointment.completed_at.strftime('%Y-%m-%d') if appointment.completed_at else None,
                    'rejected_at': appointment.rejected_at.strftime('%Y-%m-%d') if appointment.rejected_at else None,
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


# prenatal appointment cancellation view
class PrenatalAppointmentCancellationView(generics.UpdateAPIView):
    serializer_class = PrenatalAppointmentCancellationSerializer
    queryset = PrenatalAppointmentRequest.objects.all()
    lookup_field = 'par_id'

    def update(self, request, *args, **kwargs):
        par_id = kwargs.get('par_id')
        logger.info(f"Attempting to cancel prenatal appointment with ID: {par_id}")

        try:
            appointment = self.get_object()

            if appointment.status in ['cancelled', 'completed', 'rejected']:
                logger.warning(f"Cannot cancel appointment with ID {par_id} as it is already {appointment.status}")
                return Response({
                    'error': f'Cannot cancel an appointment that is already {appointment.status}'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Update the appointment status to 'cancelled' and set the cancelled_at date
            appointment.status = 'cancelled'
            appointment.cancelled_at = request.data.get('cancelled_at')
            appointment.save()

            serializer = self.get_serializer(appointment)
            logger.info(f"Appointment with ID {par_id} cancelled successfully")

            return Response({
                'message': 'Prenatal appointment cancelled successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error cancelling prenatal appointment with ID {par_id}: {str(e)}")
            return Response({
                'error': 'An error occurred while cancelling the appointment',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)