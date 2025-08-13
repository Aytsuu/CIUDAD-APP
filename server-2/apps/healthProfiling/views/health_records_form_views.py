from rest_framework import generics, status
from rest_framework.response import Response
from django.db import transaction
from ..models import NonCommunicableDisease, TBsurveilance, ResidentProfile
from ..serializers.ncd_serializers import NonCommunicableDiseaseCreateSerializer
from ..serializers.tb_serializers import TBSurveilanceCreateSerializer
import logging

logger = logging.getLogger(__name__)

class HealthRecordsFormSubmitView(generics.CreateAPIView):
    """
    Combined endpoint for submitting NCD and TB surveillance records
    Accepts a payload with both NCD and TB surveillance data for multiple residents
    """
    
    def create(self, request, *args, **kwargs):
        try:
            data = request.data
            results = {
                'ncd_records': [],
                'tb_records': [],
                'errors': []
            }
            
            with transaction.atomic():
                # Process NCD records
                if 'ncd_records' in data and isinstance(data['ncd_records'], list):
                    for ncd_data in data['ncd_records']:
                        try:
                            ncd_serializer = NonCommunicableDiseaseCreateSerializer(data=ncd_data)
                            if ncd_serializer.is_valid():
                                ncd_record = ncd_serializer.save()
                                results['ncd_records'].append({
                                    'success': True,
                                    'ncd_id': ncd_record.ncd_id,
                                    'rp_id': ncd_record.rp.rp_id
                                })
                            else:
                                results['errors'].append({
                                    'type': 'ncd',
                                    'data': ncd_data,
                                    'errors': ncd_serializer.errors
                                })
                        except Exception as e:
                            results['errors'].append({
                                'type': 'ncd',
                                'data': ncd_data,
                                'error': str(e)
                            })
                
                # Process TB surveillance records
                if 'tb_records' in data and isinstance(data['tb_records'], list):
                    for tb_data in data['tb_records']:
                        try:
                            tb_serializer = TBSurveilanceCreateSerializer(data=tb_data)
                            if tb_serializer.is_valid():
                                tb_record = tb_serializer.save()
                                results['tb_records'].append({
                                    'success': True,
                                    'tb_id': tb_record.tb_id,
                                    'rp_id': tb_record.rp.rp_id
                                })
                            else:
                                results['errors'].append({
                                    'type': 'tb',
                                    'data': tb_data,
                                    'errors': tb_serializer.errors
                                })
                        except Exception as e:
                            results['errors'].append({
                                'type': 'tb',
                                'data': tb_data,
                                'error': str(e)
                            })
                
                # Determine response status
                has_successes = len(results['ncd_records']) > 0 or len(results['tb_records']) > 0
                has_errors = len(results['errors']) > 0
                
                if has_successes and not has_errors:
                    return Response({
                        'success': True,
                        'message': 'All health records submitted successfully',
                        'data': results
                    }, status=status.HTTP_201_CREATED)
                elif has_successes and has_errors:
                    return Response({
                        'success': True,
                        'message': 'Some health records submitted successfully, some failed',
                        'data': results
                    }, status=status.HTTP_207_MULTI_STATUS)
                else:
                    return Response({
                        'success': False,
                        'message': 'Failed to submit health records',
                        'data': results
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
        except Exception as e:
            logger.error(f"Error submitting health records form: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error submitting health records form: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HealthRecordsByFamilyView(generics.ListAPIView):
    """
    Get all health records (NCD and TB surveillance) for a family
    """
    
    def list(self, request, *args, **kwargs):
        try:
            fam_id = self.kwargs['fam_id']
            
            # Get all resident profiles that belong to this family
            family_members = ResidentProfile.objects.filter(
                family_compositions__fam__fam_id=fam_id
            ).values_list('rp_id', flat=True)
            
            # Get NCD records
            ncd_records = NonCommunicableDisease.objects.filter(
                rp__rp_id__in=family_members
            ).select_related('rp__per')
            
            # Get TB surveillance records
            tb_records = TBsurveilance.objects.filter(
                rp__rp_id__in=family_members
            ).select_related('rp__per')
            
            # Serialize the data
            from ..serializers.ncd_serializers import NonCommunicableDiseaseSerializer
            from ..serializers.tb_serializers import TBSurveilanceSerializer
            
            ncd_serializer = NonCommunicableDiseaseSerializer(ncd_records, many=True)
            tb_serializer = TBSurveilanceSerializer(tb_records, many=True)
            
            return Response({
                'success': True,
                'message': 'Family health records retrieved successfully',
                'data': {
                    'family_id': fam_id,
                    'ncd_records': ncd_serializer.data,
                    'tb_records': tb_serializer.data
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving family health records: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error retrieving family health records: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
