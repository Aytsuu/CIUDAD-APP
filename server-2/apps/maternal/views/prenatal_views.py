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