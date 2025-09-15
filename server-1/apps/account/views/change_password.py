from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.account.models import Account
import logging

logger = logging.getLogger(__name__)

class ChangePasswordView(APIView):
    
    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        
        user = request.user
        
        if not user.check_password(old_password):
            return Response({"error": "Old password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)