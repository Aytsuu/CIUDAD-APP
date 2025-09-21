from django.shortcuts import render
from rest_framework import generics,status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from rest_framework.views import APIView
# class AnimalbiteRecordsView(generics.ListCreateAPIView):
#     serializer_class = AnimalBiteRecordSerializer
#     queryset = AnimalBite_Record.objects.all()
    
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
    

class AnimalBiteReferralCountView(APIView):
    def get(self, request, pat_id=None):
        try:
            if pat_id:
                # Count referrals for a specific patient through patrec
                count = AnimalBite_Referral.objects.filter(patrec__pat_id=pat_id).count()
                return Response({
                    'count': count,
                    'pat_id': pat_id,
                    'message': f'Animal bite referrals for patient {pat_id}: {count}'
                }, status=status.HTTP_200_OK)
            else:
                # Count all referrals if no pat_id provided
                count = AnimalBite_Referral.objects.count()
                return Response({
                    'count': count,
                    'message': f'Total animal bite referrals: {count}'
                }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class AnimalbiteReferralView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteReferralSerializer
    queryset = AnimalBite_Referral.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class AnimalbiteDetailsView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteDetailsSerializer
    queryset = AnimalBite_Details.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
