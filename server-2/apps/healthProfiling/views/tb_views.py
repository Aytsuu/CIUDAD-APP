from rest_framework import generics, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import TBsurveilance, ResidentProfile, Family
from ..serializers.tb_serializers import (
    TBSurveilanceSerializer,
    TBSurveilanceCreateSerializer,
    TBSurveilanceUpdateSerializer
)
from apps.patientrecords.utils import create_patient_and_record_for_health_profiling
import logging

logger = logging.getLogger(__name__)

class TBSurveilanceListView(generics.ListAPIView):
    """List all TB surveillance records"""
    serializer_class = TBSurveilanceSerializer
    queryset = TBsurveilance.objects.select_related('rp__per').all()

class TBSurveilanceCreateView(generics.CreateAPIView):
    """Create a new TB surveillance record"""
    serializer_class = TBSurveilanceCreateSerializer
    queryset = TBsurveilance.objects.all()
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                tb_record = serializer.save()
                
                # Automatically create Patient, PatientRecord, and MedicalHistory for health profiling
                if tb_record.rp:
                    # Use 'Tuberculosis' as the illness name for medical history
                    illness_name = 'Tuberculosis'
                    patient, patient_record, medical_history = create_patient_and_record_for_health_profiling(
                        tb_record.rp.rp_id, 
                        record_type='TB', 
                        illness_name=illness_name
                    )
                    if patient and patient_record:
                        logger.info(f"Patient, PatientRecord, and MedicalHistory created/found for TB record {tb_record.tb_id}: Patient {patient.pat_id}, Record {patient_record.patrec_id}, History {medical_history.medhist_id if medical_history else 'None'}")
                    else:
                        logger.warning(f"Failed to create/find Patient and PatientRecord for TB record {tb_record.tb_id}")
                
                # Return the created record with full details
                response_serializer = TBSurveilanceSerializer(tb_record)
                return Response({
                    'success': True,
                    'message': 'TB surveillance record created successfully',
                    'data': response_serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'message': 'Validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error creating TB surveillance record: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error creating TB surveillance record: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TBSurveilanceByResidentView(generics.ListAPIView):
    """Get TB surveillance records by resident ID"""
    serializer_class = TBSurveilanceSerializer
    
    def get_queryset(self):
        rp_id = self.kwargs['rp_id']
        return TBsurveilance.objects.filter(rp__rp_id=rp_id).select_related('rp__per')
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            return Response({
                'success': True,
                'message': 'TB surveillance records retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving TB surveillance records: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving TB surveillance records: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TBSurveilanceByFamilyView(generics.ListAPIView):
    """Get TB surveillance records by family ID"""
    serializer_class = TBSurveilanceSerializer
    
    def get_queryset(self):
        fam_id = self.kwargs['fam_id']
        # Get all resident profiles that belong to this family
        family_members = ResidentProfile.objects.filter(
            family_compositions__fam__fam_id=fam_id
        ).values_list('rp_id', flat=True)
        
        return TBsurveilance.objects.filter(
            rp__rp_id__in=family_members
        ).select_related('rp__per')
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            return Response({
                'success': True,
                'message': 'Family TB surveillance records retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving family TB surveillance records: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving family TB surveillance records: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TBSurveilanceUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """Update or delete a TB surveillance record by tb_id"""
    queryset = TBsurveilance.objects.select_related('rp__per').all()
    lookup_field = 'tb_id'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TBSurveilanceUpdateSerializer
        return TBSurveilanceSerializer
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            
            if serializer.is_valid():
                serializer.save()
                
                # Return updated record with full details
                response_serializer = TBSurveilanceSerializer(instance)
                return Response({
                    'success': True,
                    'message': 'TB surveillance record updated successfully',
                    'data': response_serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error updating TB surveillance record: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error updating TB surveillance record: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            tb_id = instance.tb_id
            instance.delete()
            
            return Response({
                'success': True,
                'message': f'TB surveillance record {tb_id} deleted successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error deleting TB surveillance record: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error deleting TB surveillance record: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
