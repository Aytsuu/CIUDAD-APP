from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from ..serializers import *
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from ..models import Account

class UserAccountListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Account.objects.all()
    serializer_class = UserAccountSerializer

class UserAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Account.objects.all()
    serializer_class = UserAccountSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ListOfExistingEmail(APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        accounts = Account.objects.all()
        return  Response([acc.email for acc in accounts])
    
class PhoneVerificationView(generics.ListCreateAPIView):
    serializer_class = PhoneVerificationBaseSerializer
    queryset = PhoneVerification.objects.all()

class UploadImageView(APIView):

    def post(self, request):
        try:
            supabase_user = getattr(request, 'supabase_user', None)
            if not supabase_user:
                return Response(
                    {'error': 'Unauthorized access'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

            image_url = request.data.get('image_url')
            if not image_url:
                return Response(
                    {'error': 'Image URL is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get the account tied to the Supabase ID
            account = Account.objects.filter(supabase_id=supabase_user.id).first()
            if not account:
                return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

            # Update profile image URL
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