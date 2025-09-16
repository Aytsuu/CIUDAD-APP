from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from ..models import SurveyIdentification, Family
from ..serializers.survey_serializers import SurveyIdentificationSerializer, SurveyIdentificationDetailSerializer
import logging

logger = logging.getLogger(__name__)


class SurveyIdentificationFormSubmitView(APIView):
    """Submit survey identification form data"""
    
    def post(self, request):
        try:
            with transaction.atomic():
                data = request.data
                
                # Validate required data
                if not data.get('fam_id'):
                    return Response(
                        {'error': 'Family ID is required'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                fam_id = data.get('fam_id')
                
                # Check if family exists
                try:
                    family = Family.objects.get(fam_id=fam_id)
                except Family.DoesNotExist:
                    return Response(
                        {'error': f'Family with ID {fam_id} does not exist'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Prepare survey identification data
                survey_data = {
                    'fam_id': fam_id,
                    'si_filled_by': data.get('filledBy', ''),
                    'si_informant': data.get('informant', ''),
                    'si_checked_by': data.get('checkedBy', ''),
                    'si_date': data.get('date'),
                    'si_signature': data.get('signature', '')
                }
                
                # Create or update survey identification
                existing_survey = SurveyIdentification.objects.filter(fam=family).first()
                
                if existing_survey:
                    # Update existing survey
                    serializer = SurveyIdentificationSerializer(existing_survey, data=survey_data, partial=True)
                    action = 'updated'
                else:
                    # Create new survey
                    serializer = SurveyIdentificationSerializer(data=survey_data)
                    action = 'created'
                
                serializer.is_valid(raise_exception=True)
                survey_identification = serializer.save()
                
                logger.info(f"Survey identification {action}: {survey_identification.si_id}")
                
                # Return detailed response
                response_serializer = SurveyIdentificationDetailSerializer(survey_identification)
                
                return Response({
                    'message': f'Survey identification {action} successfully',
                    'survey_identification': response_serializer.data,
                    'action': action
                }, status=status.HTTP_201_CREATED if action == 'created' else status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error submitting survey identification form: {str(e)}")
            return Response(
                {'error': f'Failed to submit survey identification form: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def get(self, request):
        """Get survey identification form data by family ID"""
        try:
            fam_id = request.query_params.get('fam_id')
            
            if not fam_id:
                return Response(
                    {'error': 'Family ID parameter is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                family = Family.objects.get(fam_id=fam_id)
            except Family.DoesNotExist:
                return Response(
                    {'error': f'Family with ID {fam_id} does not exist'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            survey_identification = SurveyIdentification.objects.filter(fam=family).first()
            
            if not survey_identification:
                return Response(
                    {'message': 'No survey identification found for this family'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = SurveyIdentificationDetailSerializer(survey_identification)
            
            # Transform data to match frontend format
            form_data = {
                'filledBy': survey_identification.si_filled_by,
                'informant': survey_identification.si_informant,
                'checkedBy': survey_identification.si_checked_by,
                'date': survey_identification.si_date,
                'signature': survey_identification.si_signature
            }
            
            return Response({
                'survey_identification': serializer.data,
                'form_data': form_data
            })
            
        except Exception as e:
            logger.error(f"Error retrieving survey identification form data: {str(e)}")
            return Response(
                {'error': f'Failed to retrieve survey identification form data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
