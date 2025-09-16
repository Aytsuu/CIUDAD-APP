from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class LogoutView(APIView):
    def post(self, request):
        try: 
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                logger.info("Found refresh token, proceeding to logout")
            
            response = Response({
                "message": "Logout successful"
            }, status=status.HTTP_200_OK)
            
            # Clear the refresh token cookie
            response.delete_cookie(
                key="refresh_token",
                domain=None,
                samesite="Lax",
            )
            
            logger.info("User logged out successfully")
            return response
        except Exception as e:
            logger.error(f"Logout error: {str(e)}", exc_info=True)
            response =  Response(
                {'error': 'Logout failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            response.delete_cookie("refresh_token")
            return response