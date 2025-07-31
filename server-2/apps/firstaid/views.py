from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from apps.patientrecords.models import *
from apps.patientrecords.serializers import *
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import *
class PatientFirstaidRecordsView(generics.ListAPIView):
    serializer_class = PatientFirstaidRecordSerializer

    def get_queryset(self):
        return Patient.objects.filter(
            # Q(patient_records__patrec_type__iexact='Firstaid Request'),
            # Q(patient_records__first_aid_records__status__iexact='RECORDED'),
            Q(patient_records__first_aid_records__patrec_id__isnull=False)
        ).distinct()

class IndividualFirstaidRecordView(generics.ListCreateAPIView):
    serializer_class = FirstaidRecordSerializer

    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return FirstAidRecord.objects.filter(
            patrec_id__pat_id=pat_id,
            is_archived=False
        ).order_by('-created_at')  # Optional: latest first
        
class CreateFirstaidRecordView(generics.CreateAPIView):
    serializer_class = FirstaidRecordSerializer
    queryset = FirstAidRecord.objects.all()
    

class ArchiveFirstaidRecordView(APIView):
    def patch(self, request, farec_id):
        try:
            record = FirstAidRecord.objects.get(farec_id=farec_id)
            record.is_archived = True
            record.save()
            return Response({"message": "First aid record archived successfully"}, status=status.HTTP_200_OK)
        except FirstAidRecord.DoesNotExist:
            return Response({"error": "Record not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
class GetFirstaidRecordCountView(APIView):
    def get(self, request, pat_id):
        try:
            count = get_firstaid_record_count(pat_id)
            return Response({'pat_id': pat_id, 'firstaidrecord_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class MonthlyFirstAidRecordsAPIView(APIView):
    def get(self, request):
        try:
            # Get base queryset with proper relationships
            queryset = FirstAidRecord.objects.select_related(
                'finv',  # ForeignKey to FirstAidInventory
                'finv__inv_id',  # OneToOne to Inventory
                'finv__fa_id',  # ForeignKey to FirstAidList
                'patrec'
            ).order_by('-created_at')
            
            # Filter by year if provided
            year = request.GET.get('year')
            if year and year != 'all':
                queryset = queryset.filter(created_at__year=year)
            
            # Group by month and get counts
            monthly_data = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                record_count=Count('farec_id')
            ).order_by('-month')
            
            # Format the response
            formatted_data = []
            for item in monthly_data:
                month_str = item['month'].strftime('%Y-%m')
                month_records = queryset.filter(
                    created_at__year=item['month'].year,
                    created_at__month=item['month'].month
                )
                
                # Serialize records
                serialized_records = []
                for record in month_records:
                    # Serialize record
                    serialized_record = FirstaidRecordSerializer(record).data
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
