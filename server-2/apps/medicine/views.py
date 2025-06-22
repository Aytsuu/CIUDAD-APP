from django.shortcuts import render
from rest_framework import generics
from django.db.models import Q, Count
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import *
from .utils import *

class PatientMedicineRecordsView(generics.ListAPIView):
    serializer_class = PatientMedicineRecordSerializer
    
    def get_queryset(self):
        pat_id = self.kwargs.get('pat_id')
        return Patient.objects.filter(
            Q(patient_records__medicine_records__patrec_id__isnull=False) 
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
        

class MonthlyFirstAidRecordsAPIView(APIView):
    def get(self, request):
        try:
            # Get base queryset with proper relationships
            queryset = MedicineRecord.objects.select_related(
                'minv_id',  # ForeignKey to FirstAidInventory
                'minv_id__inv_id',  # OneToOne to Inventory
                'minv_id__med_id',  # ForeignKey to FirstAidList
                'patrec_id'
            ).order_by('-fulfilled_at')
            
            # Filter by year if provided
            year = request.GET.get('year')
            if year and year != 'all':
                queryset = queryset.filter(fulfilled_at__year=year)
            
            # Group by month and get counts
            monthly_data = queryset.annotate(
                month=TruncMonth('fulfilled_at')
            ).values('month').annotate(
                record_count=Count('medrec_id')
            ).order_by('-month')
            
            # Format the response
            formatted_data = []
            for item in monthly_data:
                month_str = item['month'].strftime('%Y-%m')
                month_records = queryset.filter(
                    fulfilled_at__year=item['month'].year,
                    fulfilled_at__month=item['month'].month
                )
                
                # Serialize records
                serialized_records = []
                for record in month_records:
                    # Serialize record
                    serialized_record = MedicineRecordSerialzer(record).data
                    serialized_records.append(serialized_record)
                
                formatted_data.append({
                    'month': month_str,
                    'record_count': item['record_count'],
                    'records': serialized_records
                })
            
            return Response({
                'success': True,
                'data': formatted_data,
                'total_records': len(formatted_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
        