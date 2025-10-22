from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.medicineservices.models import MedicineRecord


class GetMedRecordCountView(APIView):
    
    def get(self, request, pat_id):
        try:
            count = MedicineRecord.objects.filter(patrec_id__pat_id=pat_id).count()
            return Response({'pat_id': pat_id, 'medicinerecord_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

