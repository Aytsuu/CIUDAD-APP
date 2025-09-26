from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.maternal.serializers.pregnancy_serializer import *

class CompletePregnancyView(APIView):
    def post(self, request):
        pat_id = request.data.get('pat_id')
        pregnancy_id = request.data.get('pregnancy_id')
        try:
            pregnancy = Pregnancy.objects.get(pregnancy_id=pregnancy_id, pat_id=pat_id)
        except Pregnancy.DoesNotExist:
            return Response({'error': f'Pregnancy with ID {pregnancy_id} does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PregnancyCompleteStatusSerializer(pregnancy, data=request.data, partial=True)
        if serializer.is_valid():
            updated_pregnancy = serializer.update(pregnancy, serializer.validated_data)
            return Response({
                'message': 'Pregnancy marked as completed',
                'pregnancy_id': updated_pregnancy.pregnancy_id,
                'status': updated_pregnancy.status, 
                'prenatal_end_date': updated_pregnancy.prenatal_end_date
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class PregLossPregnancyView(APIView):
    def post(self, request):
        pat_id = request.data.get('pat_id')
        pregnancy_id = request.data.get('pregnancy_id')
        try:
            pregnancy = Pregnancy.objects.get(pregnancy_id=pregnancy_id, pat_id=pat_id)
        except Pregnancy.DoesNotExist:
            return Response({'error': f'Pregnancy with ID {pregnancy_id} does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PregnancyPregLossStatusSerializer(pregnancy, data=request.data, partial=True)
        if serializer.is_valid():
            updated_pregnancy = serializer.update(pregnancy, serializer.validated_data)
            return Response({
                'message': 'Pregnancy marked as pregnancy loss',
                'pregnancy_id': updated_pregnancy.pregnancy_id,
                'status': updated_pregnancy.status, 
                'prenatal_end_date': updated_pregnancy.prenatal_end_date
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)