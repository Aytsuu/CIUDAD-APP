from django.shortcuts import render
from rest_framework import generics,status
from django.db.models import Q, Count, Sum
from datetime import timedelta
from django.utils.timezone import now
import json
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError


from ..serializers import *
from django.db import transaction, IntegrityError
from django.utils.timezone import now
from apps.childhealthservices.models import ChildHealthSupplements,ChildHealth_History
from apps.reports.models import *
from apps.reports.serializers import *
from pagination import *
from django.db.models import Q, Prefetch
from utils import * 



class PatientMedicineRecordsTableView(generics.ListAPIView):
    serializer_class = PatientMedicineRecordSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(
            Q(patient_records__medicine_records__patrec_id__isnull=False) 
        ).distinct()

        
class MedicineRecordTableView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request, pat_id):
        try:
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            # Get medicine records for the patient with prefetch for better performance
            medicine_records = MedicineRecord.objects.select_related(
                'minv_id',
                'minv_id__med_id',
                'staff'
            ).prefetch_related(
                'minv_id__med_id__cat',
                'medicine_files'
            ).filter(
                patrec_id__pat_id=pat_id
            ).order_by('-fulfilled_at')
            
            # Apply search filter if provided
            if search_query:
                medicine_records = medicine_records.filter(
                    Q(minv_id__med_id__med_name__icontains=search_query) |
                    Q(reason__icontains=search_query) |
                    Q(medrec_id__icontains=search_query) |
                    Q(status__icontains=search_query) |
                    Q(minv_id__med_id__cat__cat_name__icontains=search_query)
                )
            
            # Prepare response data
            records_data = []
            
            for record in medicine_records:
                # Get associated files using the related name
                file_data = [
                    {
                        'medf_id': file.medf_id,
                        'medf_name': file.medf_name,
                        'medf_type': file.medf_type,
                        'medf_url': file.medf_url,
                        'created_at': file.created_at
                    }
                    for file in record.medicine_files.all()
                ]
                
                # Get category name safely
                category_name = 'N/A'
                if (hasattr(record.minv_id, 'med_id') and 
                    record.minv_id.med_id and 
                    hasattr(record.minv_id.med_id, 'cat') and 
                    record.minv_id.med_id.cat):
                    category_name = record.minv_id.med_id.cat.cat_name
                
                record_data = {
                    'medrec_id': record.medrec_id,
                    'medrec_qty': record.medrec_qty,
                    'reason': record.reason,
                    'requested_at': record.requested_at,
                    'fulfilled_at': record.fulfilled_at,
                    'signature': record.signature,
                    'minv_id': record.minv_id.minv_id if record.minv_id else None,
                    'medicine_name': record.minv_id.med_id.med_name if record.minv_id and record.minv_id.med_id else 'Unknown',
                    'medicine_category': category_name,
                    'dosage': f"{record.minv_id.minv_dsg} {record.minv_id.minv_dsg_unit}" if record.minv_id else 'N/A',
                    'form': record.minv_id.minv_form if record.minv_id else 'N/A',
                    'files': file_data,
                    'status': 'Fulfilled' if record.fulfilled_at else 'Pending'
                }
                
                records_data.append(record_data)
            
            # Apply pagination
            paginator = self.pagination_class()
            paginator.page_size = page_size
            page_data = paginator.paginate_queryset(records_data, request)
            
            if page_data is not None:
                response = paginator.get_paginated_response(page_data)
                return Response(response.data)
            
            return Response({
                'success': True,
                'results': records_data,
                'count': len(records_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': f'Error fetching medicine records: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


