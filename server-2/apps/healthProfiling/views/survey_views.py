from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from ..models import SurveyIdentification, Family
from ..serializers.survey_serializers import (
    SurveyIdentificationSerializer, 
    SurveyIdentificationListSerializer,
    SurveyIdentificationDetailSerializer
)
import logging

logger = logging.getLogger(__name__)


class SurveyIdentificationListView(ListAPIView):
    """List all survey identifications"""
    serializer_class = SurveyIdentificationListSerializer
    
    def get_queryset(self):
        queryset = SurveyIdentification.objects.select_related('fam', 'fam__hh').all()
        
        # Filter by family ID if provided
        fam_id = self.request.query_params.get('fam_id')
        if fam_id:
            queryset = queryset.filter(fam__fam_id=fam_id)
            
        return queryset.order_by('-si_created_at')


class SurveyIdentificationCreateView(CreateAPIView):
    """Create a new survey identification"""
    serializer_class = SurveyIdentificationSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                survey_identification = serializer.save()
                
                logger.info(f"Survey identification created: {survey_identification.si_id}")
                
                response_serializer = SurveyIdentificationDetailSerializer(survey_identification)
                return Response(
                    response_serializer.data, 
                    status=status.HTTP_201_CREATED
                )
                
        except Exception as e:
            logger.error(f"Error creating survey identification: {str(e)}")
            return Response(
                {'error': f'Failed to create survey identification: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class SurveyIdentificationDetailView(RetrieveAPIView):
    """Retrieve a specific survey identification by ID"""
    serializer_class = SurveyIdentificationDetailSerializer
    lookup_field = 'si_id'
    
    def get_queryset(self):
        return SurveyIdentification.objects.select_related('fam', 'fam__hh').all()


class SurveyIdentificationUpdateView(UpdateAPIView):
    """Update a specific survey identification"""
    serializer_class = SurveyIdentificationSerializer
    lookup_field = 'si_id'
    
    def get_queryset(self):
        return SurveyIdentification.objects.all()
    
    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                partial = kwargs.pop('partial', False)
                instance = self.get_object()
                serializer = self.get_serializer(instance, data=request.data, partial=partial)
                serializer.is_valid(raise_exception=True)
                survey_identification = serializer.save()
                
                logger.info(f"Survey identification updated: {survey_identification.si_id}")
                
                response_serializer = SurveyIdentificationDetailSerializer(survey_identification)
                return Response(response_serializer.data)
                
        except Exception as e:
            logger.error(f"Error updating survey identification: {str(e)}")
            return Response(
                {'error': f'Failed to update survey identification: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class SurveyIdentificationDeleteView(DestroyAPIView):
    """Delete a specific survey identification"""
    lookup_field = 'si_id'
    
    def get_queryset(self):
        return SurveyIdentification.objects.all()
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            si_id = instance.si_id
            
            with transaction.atomic():
                instance.delete()
                
            logger.info(f"Survey identification deleted: {si_id}")
            return Response(
                {'message': f'Survey identification {si_id} deleted successfully'}, 
                status=status.HTTP_204_NO_CONTENT
            )
            
        except Exception as e:
            logger.error(f"Error deleting survey identification: {str(e)}")
            return Response(
                {'error': f'Failed to delete survey identification: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class SurveyIdentificationByFamilyView(APIView):
    """Get survey identifications by family ID"""
    
    def get(self, request, fam_id):
        try:
            family = get_object_or_404(Family, fam_id=fam_id)
            survey_identifications = SurveyIdentification.objects.filter(fam=family).order_by('-si_created_at')
            
            serializer = SurveyIdentificationListSerializer(survey_identifications, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error retrieving survey identifications for family {fam_id}: {str(e)}")
            return Response(
                {'error': f'Failed to retrieve survey identifications: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class SurveyIdentificationDataView(APIView):
    """Get aggregated survey identification data for a household"""
    
    def get(self, request, hh_id):
        try:
            # Get all survey identifications for families in this household
            survey_identifications = SurveyIdentification.objects.filter(
                fam__hh__hh_id=hh_id
            ).select_related('fam').order_by('-si_created_at')
            
            if not survey_identifications.exists():
                return Response(
                    {'message': 'No survey identifications found for this household'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = SurveyIdentificationDetailSerializer(survey_identifications, many=True)
            
            return Response({
                'household_id': hh_id,
                'survey_identifications': serializer.data,
                'total_count': survey_identifications.count()
            })
            
        except Exception as e:
            logger.error(f"Error retrieving survey identification data for household {hh_id}: {str(e)}")
            return Response(
                {'error': f'Failed to retrieve survey identification data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
