from apps.account.models import Account
from rest_framework.views import APIView    
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging

logger = logging.getLogger(__name__)

class UploadImageView(APIView):

    def post(self, request):
        try:
            image_url = request.data.get('image_url')
            logger.info(f"Received image URL: {image_url}")
            # Update profile image 
            account = request.user
            account.profile_image = image_url
            account.save()

            return Response({
                'message': 'Profile image updated successfully',
                'image_url': image_url
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"UploadImageView error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Image update failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )