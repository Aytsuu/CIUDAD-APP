from rest_framework import generics, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import NonCommunicableDisease, ResidentProfile, Family
from ..serializers.ncd_serializers import (
    NonCommunicableDiseaseSerializer,
    NonCommunicableDiseaseCreateSerializer,
    NonCommunicableDiseaseUpdateSerializer
)
import logging

logger = logging.getLogger(__name__)

class NCDListView(generics.ListAPIView):
    """List all NCD records"""
    serializer_class = NonCommunicableDiseaseSerializer
    queryset = NonCommunicableDisease.objects.select_related('rp__per').all()

class NCDCreateView(generics.CreateAPIView):
    """Create a new NCD record"""
    serializer_class = NonCommunicableDiseaseCreateSerializer
    queryset = NonCommunicableDisease.objects.all()
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                ncd_record = serializer.save()
                
                # Return the created record with full details
                response_serializer = NonCommunicableDiseaseSerializer(ncd_record)
                return Response({
                    'success': True,
                    'message': 'NCD record created successfully',
                    'data': response_serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'message': 'Validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error creating NCD record: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error creating NCD record: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NCDByResidentView(generics.ListAPIView):
    """Get NCD records by resident ID"""
    serializer_class = NonCommunicableDiseaseSerializer
    
    def get_queryset(self):
        rp_id = self.kwargs['rp_id']
        return NonCommunicableDisease.objects.filter(rp__rp_id=rp_id).select_related('rp__per')
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            return Response({
                'success': True,
                'message': 'NCD records retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving NCD records: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving NCD records: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NCDByFamilyView(generics.ListAPIView):
    """Get NCD records by family ID"""
    serializer_class = NonCommunicableDiseaseSerializer
    
    def get_queryset(self):
        fam_id = self.kwargs['fam_id']
        # Get all resident profiles that belong to this family
        family_members = ResidentProfile.objects.filter(
            family_compositions__fam__fam_id=fam_id
        ).values_list('rp_id', flat=True)
        
        return NonCommunicableDisease.objects.filter(
            rp__rp_id__in=family_members
        ).select_related('rp__per')
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            return Response({
                'success': True,
                'message': 'Family NCD records retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving family NCD records: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving family NCD records: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NCDUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """Update or delete an NCD record by ncd_id"""
    queryset = NonCommunicableDisease.objects.select_related('rp__per').all()
    lookup_field = 'ncd_id'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return NonCommunicableDiseaseUpdateSerializer
        return NonCommunicableDiseaseSerializer
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            
            if serializer.is_valid():
                serializer.save()
                
                # Return updated record with full details
                response_serializer = NonCommunicableDiseaseSerializer(instance)
                return Response({
                    'success': True,
                    'message': 'NCD record updated successfully',
                    'data': response_serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error updating NCD record: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error updating NCD record: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            ncd_id = instance.ncd_id
            instance.delete()
            
            return Response({
                'success': True,
                'message': f'NCD record {ncd_id} deleted successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error deleting NCD record: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error deleting NCD record: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
