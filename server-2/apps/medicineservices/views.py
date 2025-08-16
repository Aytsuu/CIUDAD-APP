from django.shortcuts import render
from rest_framework import generics
from django.db.models import Q, Count
from datetime import timedelta
from django.utils.timezone import now
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import *
from .utils import *
from rest_framework.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.utils.timezone import now
from apps.childhealthservices.models import ChildHealthSupplements,ChildHealth_History
from apps.reports.models import *
from apps.reports.serializers import *
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
            

            # serializer = self.get_serializer(medicine_request)
            # return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response({
            "success": True,
            "medreq_id": medicine_request.medreq_id,
            "message": "Medicine request created successfully"
             }, status=status.HTTP_201_CREATED)
            

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
    
    
            
class DeleteUpdateMedicineRequestView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MedicineRequestSerializer
    queryset = MedicineRequest.objects.all()
    lookup_field = "medreq_id"
    

 
class MedicineRequestItemDelete(generics.DestroyAPIView):
    serializer_class = MedicineRequestItemSerializer
    queryset = MedicineRequestItem.objects.all()
        
    def get_object(self):
        medreqitem_id = self.kwargs['medreqitem_id']
        return MedicineRequestItem.objects.get(medreqitem_id=medreqitem_id)



class ChildServiceMedicineRecordView(generics.CreateAPIView):
    """
    API endpoint for creating medicine records for child health services
    """
    serializer_class = MedicineRecordSerialzer
    queryset = MedicineRecord.objects.all()

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        chhist_id = self.request.data.get('chhist')
        
        if not chhist_id:
            raise ValidationError({
                "chhist": "This field is required for child health medicine records"
            })

        try:
            # Validate and save the medicine record
            medrec = serializer.save()

            # Verify the child health history exists
            chhist = ChildHealth_History.objects.get(pk=chhist_id)
            
            # Create the relationship record
            ChildHealthSupplements.objects.create(
                chhist=chhist,
                medrec=medrec
            )

        except ChildHealth_History.DoesNotExist:
            raise ValidationError({
                "chhist": "Invalid child health history ID provided"
            })
        except Exception as e:
            raise ValidationError({
                "error": f"Failed to create record: {str(e)}"
            })
            
            
class FindingPlanTreatmentView(generics.CreateAPIView):
  
    serializer_class = FindingPlanTreatmentSerializer
    queryset = FindingsPlanTreatment.objects.all()
    
    

class MedicineFileView(generics.ListCreateAPIView):
    serializer_class = MedicineFileCreateSerializer
    queryset = Medicine_File.objects.all()
 
class MonthlyMedicineSummariesAPIView(APIView):
    def get(self, request):
        try:
            queryset = MedicineRecord.objects.select_related(
                'minv_id', 
                'minv_id__inv_id', 
                'minv_id__med_id',  
                'patrec_id'
            ).order_by('-fulfilled_at')

            year_param = request.GET.get('year')  # '2025' or '2025-07'

            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        year, month = map(int, year_param.split('-'))
                        queryset = queryset.filter(
                            fulfilled_at__year=year,
                            fulfilled_at__month=month
                        )
                    else:
                        year = int(year_param)
                        queryset = queryset.filter(
                            fulfilled_at__year=year
                        )  
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Annotate and count records by month
            monthly_data = queryset.annotate(
                month=TruncMonth('fulfilled_at')
            ).values('month').annotate(
                record_count=Count('medrec_id')
            ).order_by('-month')

            formatted_data = []

            for item in monthly_data:
                month_str = item['month'].strftime('%Y-%m')

                # Get or create report record for this month
                report_obj, created = MonthlyRecipientListReport.objects.get_or_create(
                    month_year=month_str,
                    rcp_type='Medicine'
                )

                report_data = MonthlyRCPReportSerializer(report_obj).data

                formatted_data.append({
                    'month': month_str,
                    'record_count': item['record_count'],
                    'monthlyrcplist_id': report_obj.monthlyrcplist_id,
                    'report': report_data
                })

            return Response({
                'success': True,
                'data': formatted_data,
                'total_months': len(formatted_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MonthlyMedicineRecordsDetailAPIView(APIView):
    def get(self, request, month):
        try:
            # Validate month format (YYYY-MM)
            try:
                year, month_num = map(int, month.split('-'))
                if month_num < 1 or month_num > 12:
                    raise ValueError
            except ValueError:
                return Response({
                    'success': False,
                    'error': 'Invalid month format. Use YYYY-MM.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get records for the specified month
            queryset = MedicineRecord.objects.select_related(
                'minv_id', 
                'minv_id__inv_id', 
                'minv_id__med_id',  
                'patrec_id'
            ).filter(
                fulfilled_at__year=year,
                fulfilled_at__month=month_num
            ).order_by('-fulfilled_at')

            # Get or create report record for this month
            report_obj, created = MonthlyRecipientListReport.objects.get_or_create(
                month_year=month,
                rcp_type='Medicine'
            )

            report_data = MonthlyRCPReportSerializer(report_obj).data
            serialized_records = [
                MedicineRecordSerialzer(record).data for record in queryset
            ]

            return Response({
                'success': True,
                'data': {
                    'month': month,
                    'record_count': len(serialized_records),
                    'monthlyrcplist_id': report_obj.monthlyrcplist_id,
                    'report': report_data,
                    'records': serialized_records
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class MonthlyMedicineCountAPIView(APIView):
    def get(self, request):
        try:
            today = now()
            current_month_start = today.replace(day=1)
            last_month_start = (current_month_start - relativedelta(months=1)).replace(day=1)
            last_month_end = current_month_start - timedelta(days=1)

            # Count records for current month
            current_month_count = MedicineRecord.objects.filter(
                fulfilled_at__year=current_month_start.year,
                fulfilled_at__month=current_month_start.month
            ).count()

            # Count records for last month
            last_month_count = MedicineRecord.objects.filter(
                fulfilled_at__year=last_month_start.year,
                fulfilled_at__month=last_month_start.month
            ).count()

            return Response({
                'success': True,
                'current_month': {
                    'month': current_month_start.strftime('%Y-%m'),
                    'total_records': current_month_count
                },
                'last_month': {
                    'month': last_month_start.strftime('%Y-%m'),
                    'total_records': last_month_count
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

class MonthlyMedicineChart(APIView):
    def get(self, request, month):
        try:
            # Validate month format (YYYY-MM)
            try:
                year, month_num = map(int, month.split('-'))
                if month_num < 1 or month_num > 12:
                    raise ValueError
            except ValueError:
                return Response({
                    'success': False,
                    'error': 'Invalid month format. Use YYYY-MM.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get medicine counts for the specified month
            queryset = MedicineRecord.objects.filter(
                fulfilled_at__year=year,
                fulfilled_at__month=month_num
            ).values(
                'minv_id__med_id__med_name'  # Assuming this is the path to medicine name
            ).annotate(
                count=Count('minv_id__med_id')
            ).order_by('-count')

            # Convert to dictionary format {medicine_name: count}
            medicine_counts = {
                item['minv_id__med_id__med_name']: item['count'] 
                for item in queryset
            }

            return Response({
                'success': True,
                'month': month,
                'medicine_counts': medicine_counts,
                'total_records': sum(medicine_counts.values())
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
 
class MedicineTotalCountAPIView(APIView):
    def get(self, request):
        try:
            # Count total medicine request items
            total_records = MedicineRecord.objects.count()

            # Count records grouped by medicine name
            items_count = MedicineRecord.objects.values(
                'minv_id__med_id__med_name'  # Adjust this based on your actual model relationships
            ).annotate(
                count=Count('medrec_id')
            ).order_by('-count')
            return Response({
                'success': True,
                'total_records': total_records,
                'items_count': items_count
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

