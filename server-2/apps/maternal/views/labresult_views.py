from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.maternal.models import Pregnancy
from apps.maternal.serializers.labresult_serializer import get_laboratory_results_by_pregnancy


@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_pregnancy_lab_results(request, pregnancy_id):
    """
    Fetch all laboratory results for a specific pregnancy.
    
    URL: /api/maternal/lab-results/?pregnancy_id=<pregnancy_id>
    or: /api/maternal/lab-results/<pregnancy_id>/
    
    Returns all lab results with images for all prenatal forms in this pregnancy.
    """
    try:
        # Verify the pregnancy exists
        pregnancy = Pregnancy.objects.get(pregnancy_id=pregnancy_id)
        
        # Get all lab results for this pregnancy
        lab_results = get_laboratory_results_by_pregnancy(pregnancy_id)
        
        return Response({
            'success': True,
            'pregnancy_id': pregnancy_id,
            'patient_id': pregnancy.pat_id.pat_id,
            'lab_results': lab_results,
            'count': len(lab_results)
        }, status=status.HTTP_200_OK)
    
    except Pregnancy.DoesNotExist:
        return Response({
            'success': False,
            'error': f'Pregnancy with ID {pregnancy_id} not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])  # Changed from IsAuthenticated to AllowAny
def list_lab_results_for_pregnancy(request):
    """
    Alternative endpoint using query parameters.
    
    URL: /api/maternal/pregnancy/lab-results/?pregnancy_id=<pregnancy_id>
    """
    pregnancy_id = request.query_params.get('pregnancy_id')
    
    if not pregnancy_id:
        return Response({
            'success': False,
            'error': 'pregnancy_id query parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    return get_pregnancy_lab_results(request, pregnancy_id)
