from apps.account.models import Account
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

class ForgotPasswordResetView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        user = request.user
        
        if not user.check_password(old_password):
            return Response({'error': "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save() 
        
        return Response({'message': "Succesfully changed password!"}, status=status.HTTP_200_OK)
        