from django.shortcuts import render
from rest_framework import generics
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import *
from .utils import *
class PatientMedicineRecordsView(generics.ListAPIView):
    serializer_class = PatientMedicineRecordSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(
        Q(patient_records__patrec_type__iexact='Medicine Request') ,
        ).distinct()

class IndividualMedicineRecordView(generics.ListCreateAPIView):
    serializer_class = MedicineRecordSerialzer
    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return MedicineRecord.objects.filter(
            patrec_id__pat_id=pat_id,
            status__in=['RECORDED', 'Recorded'],
            is_archived=False
        ).order_by('-fulfilled_at')  # Optional: latest first

class CreateMedicineRecordView(generics.CreateAPIView):
    serializer_class = MedicineRecordSerialzer
    queryset = MedicineRecord.objects.all()
    
    



class GetMedRecordCountView(APIView):
    
    def get(self, request, pat_id):
        try:
            count = get_medicine_record_count(pat_id)
            return Response({'pat_id': pat_id, 'medicinerecord_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        