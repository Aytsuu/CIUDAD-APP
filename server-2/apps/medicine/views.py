from django.shortcuts import render
from rest_framework import generics
from django.db.models import Q, Count
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import *
from .utils import *
from rest_framework.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.utils.timezone import now


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
            patrec_id__pat_id=pat_id
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

class MedicineRequestView(generics.ListCreateAPIView):
    serializer_class = MedicineRequestSerializer

    def get_queryset(self):
        return MedicineRequest.objects.filter(status='pending')
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            # Validate required fields
            if not request.data.get('pat_id') and not request.data.get('rp_id'):
                raise ValidationError("Either patient ID or resident ID must be provided")
            
            if not request.data.get('medicines') or len(request.data['medicines']) == 0:
                raise ValidationError("At least one medicine is required")

            # Handle patient reference
            pat_id = request.data.get('pat_id')
            patient = None
            if pat_id:
                try:
                    patient = Patient.objects.get(pat_id=pat_id)
                except Patient.DoesNotExist:
                    raise ValidationError(f"Patient with ID {pat_id} not found")

            # Handle resident reference
            rp_id = request.data.get('rp_id')
            resident = None
            if rp_id:
                try:
                    resident = ResidentProfile.objects.get(rp_id=rp_id)
                except ResidentProfile.DoesNotExist:
                    raise ValidationError(f"Resident with ID {rp_id} not found")

            # Create the medicine request
            medicine_request = MedicineRequest.objects.create(
                pat_id=patient,  # Pass the Patient instance
                rp_id=resident,  # Pass the ResidentProfile instance
                status='pending'
            )

            # Process medicine items
            request_items = []
            for med in request.data['medicines']:
                try:
                    medicine = MedicineInventory.objects.get(minv_id=med['minv_id'])
                except MedicineInventory.DoesNotExist:
                    raise ValidationError(f"Medicine with ID {med['minv_id']} not found")
                
                request_items.append(MedicineRequestItem(
                    medreq_id=medicine_request,
                    minv_id=medicine,
                    medreqitem_qty=med['medreqitem_qty'],
                    reason=med.get('reason', '')
                ))

            MedicineRequestItem.objects.bulk_create(request_items)

            serializer = self.get_serializer(medicine_request)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": "Internal server error", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        
class MedicineRequestItemView(generics.ListCreateAPIView):
    serializer_class = MedicineRequestItemSerializer
    
    def get_queryset(self):
        queryset = MedicineRequestItem.objects.all()
        
        pat_id = self.request.query_params.get('pat_id', None)
        rp_id = self.request.query_params.get('rp_id', None)
        medreq_id = self.request.query_params.get('medreq_id', None)
        
        # If no parameters are provided, return all items (for aggregation purposes)
        if not medreq_id and not pat_id and not rp_id:
            return queryset
        
        # If medreq_id is provided, it's required
        if medreq_id and not (pat_id or rp_id):
            raise ValidationError("Either pat_id or rp_id is required when medreq_id is specified")
        
        # If medreq_id is provided, filter by it
        if medreq_id:
            queryset = queryset.filter(medreq_id=medreq_id)
        
        # Filter by patient or resident ID if provided
        if pat_id:
            queryset = queryset.filter(medreq_id__pat_id=pat_id)
        elif rp_id:
            queryset = queryset.filter(medreq_id__rp_id=rp_id)
            
        return queryset
    
    
            
class UpdateMedicineRequestView(generics.UpdateAPIView):
    serializer_class = MedicineRequestSerializer
    queryset = MedicineRequest.objects.all()
    
    def get_object(self):
        medreq_id = self.kwargs['medreq_id']
        return MedicineRequest.objects.get(medreq_id=medreq_id)


 
class MedicineRequestItemDelete(generics.DestroyAPIView):
    serializer_class = MedicineRequestItemSerializer
    queryset = MedicineRequestItem.objects.all()
        
    def get_object(self):
        medreqitem_id = self.kwargs['medreqitem_id']
        return MedicineRequestItem.objects.get(medreqitem_id=medreqitem_id)

    
        