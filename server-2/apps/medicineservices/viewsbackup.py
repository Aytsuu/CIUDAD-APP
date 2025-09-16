
from rest_framework import generics
# from dateutil.relativedelta import relativedelta
# from django.db.models.functions import TruncMonth
# from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import *
# from .utils import *
# from rest_framework.exceptions import ValidationError
# from django.db import transaction, IntegrityError
# from django.utils.timezone import now
# from apps.childhealthservices.models import ChildHealthSupplements,ChildHealth_History
# from apps.reports.models import *
# from apps.reports.serializers import *
from pagination import *
# from django.db.models import Q, Prefetch
# from utils import *  # Assuming you have this
from rest_framework.parsers import MultiPartParser, FormParser
# from django.core.files.storage import default_storage
# from django.conf import settings
# import os
# import uuid


# class PatientMedicineRecordsView(generics.ListAPIView):
#     serializer_class = PatientMedicineRecordSerializer
    
#     def get_queryset(self):
#         return Patient.objects.filter(
#             Q(patient_records__medicine_records__patrec_id__isnull=False) 
#         ).distinct()


        
   

# #=========== MEDICINE REQUEST WEB PROCESSING --REQ THROUGH DOCTORS END =========

# class MedicineRequestItemView(generics.ListCreateAPIView):
#     serializer_class = MedicineRequestItemSerializer
    
#     def get_queryset(self):
#         queryset = MedicineRequestItem.objects.all()
        
#         pat_id = self.request.query_params.get('pat_id', None)
#         rp_id = self.request.query_params.get('rp_id', None)
#         medreq_id = self.request.query_params.get('medreq_id', None)
        
#         # If no parameters are provided, return all items (for aggregation purposes)
#         if not medreq_id and not pat_id and not rp_id:
#             return queryset
        
#         # REMOVED THE VALIDATION THAT REQUIRES pat_id/rp_id WHEN medreq_id IS PROVIDED
#         # If medreq_id is provided, filter by it
#         if medreq_id:
#             queryset = queryset.filter(medreq_id=medreq_id)
        
#         # Filter by patient or resident ID if provided (optional)
#         if pat_id:
#             queryset = queryset.filter(medreq_id__pat_id=pat_id)
#         elif rp_id:
#             queryset = queryset.filter(medreq_id__rp_id=rp_id)
            
#         return queryset
    


# class UserPendingMedicineRequestItemsView(generics.ListAPIView):
#     serializer_class = MedicineRequestItemSerializer
#     pagination_class = StandardResultsPagination

#     def get_queryset(self):
#         # Get patient ID from query params OR try to get it from authenticated user
#         pat_id = self.request.query_params.get("pat_id")
        
#         # If no pat_id provided in query params, try to get it from authenticated user
#         if not pat_id:
#             # Check if user is authenticated
#             if not self.request.user.is_authenticated:
#                 return MedicineRequestItem.objects.none()
            
#             # Try to get patient ID from user profile
#             try:
#                 # Adjust this based on your actual model relationships
#                 if hasattr(self.request.user, 'patient'):
#                     pat_id = self.request.user.patient.pat_id
#                 elif hasattr(self.request.user, 'profile') and hasattr(self.request.user.profile, 'patient'):
#                     pat_id = self.request.user.profile.patient.pat_id
#                 else:
#                     return MedicineRequestItem.objects.none()
#             except AttributeError:
#                 return MedicineRequestItem.objects.none()

#         if not pat_id:
#             return MedicineRequestItem.objects.none()

#         return MedicineRequestItem.objects.filter(
#             medreq_id__pat_id=pat_id,
#             is_archived=False
#         ).order_by("-medreq_id__requested_at")


# class MedicineRequestCreateView(APIView):
#     @transaction.atomic
#     def post(self, request):
#         try:
#             # Extract data from request
#             pat_id = request.data.get('pat_id')
#             signature = request.data.get('signature')
#             medicines = request.data.get('medicines', [])
#             files = request.data.get('files', [])
#             staff_id = request.data.get('staff_id')
            
#             if not pat_id:
#                 return Response({"error": "pat_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
#             if not medicines:
#                 return Response({"error": "At least one medicine is required"}, status=status.HTTP_400_BAD_REQUEST)
            
#             # 1. Create patient record
#             patient_record = PatientRecord.objects.create(
#                 pat_id=pat_id,
#                 patrec_type="Medicine Request",
#                 staff_id=staff_id
#             )
            
#             # 2. Create medicine request
#             medicine_request = MedicineRequest.objects.create(
#                 medreq_status='completed',
#                 staff_id=staff_id,
#                 signature=signature
#             )
            
#             # 3. Process each medicine
#             medicine_records = []
#             for med_data in medicines:
#                 minv_id = med_data.get('minv_id')
#                 medrec_qty = med_data.get('medrec_qty')
#                 reason = med_data.get('reason', '')
#                 med_type = med_data.get('med_type', 'Over The Counter')
                
#                 if not minv_id or not medrec_qty:
#                     continue
                
#                 # Check medicine inventory
#                 try:
#                     medicine_inv = MedicineInventory.objects.get(minv_id=minv_id)
#                     if medicine_inv.minv_qty_avail < medrec_qty:
#                         raise Exception(f"Insufficient stock for medicine ID {minv_id}")
                    
#                     # Update inventory
#                     medicine_inv.minv_qty_avail -= medrec_qty
#                     medicine_inv.save()
                    
#                 except MedicineInventory.DoesNotExist:
#                     raise Exception(f"Medicine ID {minv_id} not found in inventory")
                
#                 # Create medicine record
#                 medicine_record = MedicineRecord.objects.create(
#                     medrec_qty=medrec_qty,
#                     reason=reason,
#                     signature=signature,
#                     requested_at=timezone.now(),
#                     fulfilled_at=timezone.now(),
#                     patrec_id=patient_record.patrec_id,
#                     minv_id=minv_id,
#                     medreq_id=medicine_request.medreq_id,
#                     staff_id=staff_id
#                 )
#                 medicine_records.append(medicine_record)
            
#             # 4. Handle file uploads if any
#             uploaded_files = []
#             if files:
#                 serializer = Medicine_FileSerializer(context={'request': request})
#                 try:
#                     # For each medicine record, check if it's a prescription before associating files
#                     for medicine_record in medicine_records:
#                         med_data = next((med for med in medicines if med.get('minv_id') == medicine_record.minv_id), {})
#                         med_type = med_data.get('med_type', 'Over The Counter')
                        
#                         # Only associate files with prescription medicines
#                         if med_type == 'Prescription':
#                             uploaded_files.extend(
#                                 serializer._upload_files(
#                                     files, 
#                                     medrec_id=medicine_record.medrec_id, 
#                                     medreq_id=medicine_request.medreq_id
#                                 )
#                             )
#                             break  # Associate files with the first prescription medicine found
                    
#                     # If no prescription medicines found, associate files only with medreq_id
#                     if not uploaded_files:
#                         uploaded_files = serializer._upload_files(
#                             files, 
#                             medrec_id=None,  # Don't associate with any medicine record
#                             medreq_id=medicine_request.medreq_id
#                         )
                        
#                 except Exception as e:
#                     return Response({"error": f"File upload failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            
#             return Response({
#                 "message": "Medicine request created successfully",
#                 "medreq_id": medicine_request.medreq_id,
#                 "patrec_id": patient_record.patrec_id,
#                 "uploaded_files_count": len(uploaded_files) if files else 0
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)









# class ChildServiceMedicineRecordView(generics.CreateAPIView):
#     """
#     API endpoint for creating medicine records for child health services
#     """
#     serializer_class = MedicineRecordSerialzer
#     queryset = MedicineRecord.objects.all()

#     def create(self, request, *args, **kwargs):
#         try:
#             return super().create(request, *args, **kwargs)
#         except ValidationError as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             return Response(
#                 {"error": "An unexpected error occurred"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def perform_create(self, serializer):
#         chhist_id = self.request.data.get('chhist')
        
#         if not chhist_id:
#             raise ValidationError({
#                 "chhist": "This field is required for child health medicine records"
#             })

#         try:
#             # Validate and save the medicine record
#             medrec = serializer.save()

#             # Verify the child health history exists
#             chhist = ChildHealth_History.objects.get(pk=chhist_id)
            
#             # Create the relationship record
#             ChildHealthSupplements.objects.create(
#                 chhist=chhist,
#                 medrec=medrec
#             )

#         except ChildHealth_History.DoesNotExist:
#             raise ValidationError({
#                 "chhist": "Invalid child health history ID provided"
#             })
#         except Exception as e:
#             raise ValidationError({
#                 "error": f"Failed to create record: {str(e)}"
#             })
            
            
# class FindingPlanTreatmentView(generics.CreateAPIView):
  
#     serializer_class = FindingPlanTreatmentSerializer
#     queryset = FindingsPlanTreatment.objects.all()
    
    
# class MedicineRequestCreateView(APIView):
#     @transaction.atomic
#     def post(self, request):
#         try:
#             # Extract data from request
#             pat_id = request.data.get('pat_id')
#             signature = request.data.get('signature')
#             medicines = request.data.get('medicines', [])
#             files = request.data.get('files', [])
#             staff_id = request.data.get('staff_id')
            
#             print(f"Received request data: pat_id={pat_id}, medicines={len(medicines)}, files={len(files)}")
            
#             if not pat_id:
#                 return Response({"error": "pat_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
#             if not medicines:
#                 return Response({"error": "At least one medicine is required"}, status=status.HTTP_400_BAD_REQUEST)
            
#             # 1. Get the Patient instance
#             try:
#                 patient = Patient.objects.get(pat_id=pat_id)
#             except Patient.DoesNotExist:
#                 return Response({"error": f"Patient with ID {pat_id} not found"}, status=status.HTTP_404_NOT_FOUND)
            
#             # 2. Get Staff instance if staff_id is provided
#             staff_instance = None
#             if staff_id:
#                 try:
#                     staff_instance = Staff.objects.get(staff_id=staff_id)
#                 except Staff.DoesNotExist:
#                     print(f"Staff with ID {staff_id} not found, continuing without staff")
            
#             # 3. Create patient record with Patient instance
#             patient_record = PatientRecord.objects.create(
#                 pat_id=patient,
#                 patrec_type="Medicine Request",
#             )
            
#             # 4. Process each medicine and track inventory changes for potential rollback
#             medicine_records = []
#             inventory_updates = {}  # Store original quantities for rollback
#             medicine_transactions = []  # Store medicine transactions
            
#             for med_data in medicines:
#                 minv_id = med_data.get('minv_id')
#                 medrec_qty = med_data.get('medrec_qty')
#                 reason = med_data.get('reason', '')
                
#                 if not minv_id or not medrec_qty:
#                     continue
                
#                 # Check medicine inventory
#                 try:
#                     medicine_inv = MedicineInventory.objects.get(minv_id=minv_id)
#                     if medicine_inv.minv_qty_avail < medrec_qty:
#                         # This will trigger transaction rollback
#                         raise Exception(f"Insufficient stock for medicine ID {minv_id}. Available: {medicine_inv.minv_qty_avail}, Requested: {medrec_qty}")
                    
#                     # Store original quantity for rollback
#                     inventory_updates[minv_id] = {
#                         'medicine_inv': medicine_inv,
#                         'original_qty': medicine_inv.minv_qty_avail
#                     }
                    
#                     # Update inventory
#                     medicine_inv.minv_qty_avail -= medrec_qty
#                     medicine_inv.save()
                    
#                     # Create medicine transaction record
#                     # Determine transaction quantity based on unit
#                     if medicine_inv.minv_qty_unit and medicine_inv.minv_qty_unit.lower() == 'boxes':
#                         mdt_qty = f"{medrec_qty } pcs"  # Convert boxes to pieces (3 pcs per box)
#                     else:
#                         # Use the original unit if not boxes
#                         unit = medicine_inv.minv_qty_unit or 'pcs'
#                         mdt_qty = f"{medrec_qty} {unit}"
                    
#                     # Create medicine transaction
#                     medicine_transaction = MedicineTransactions.objects.create(
#                         mdt_qty=mdt_qty,
#                         mdt_action="deducted",
#                         staff=staff_instance,
#                         minv_id=medicine_inv
#                     )
#                     medicine_transactions.append(medicine_transaction)
                    
#                 except MedicineInventory.DoesNotExist:
#                     # This will trigger transaction rollback
#                     raise Exception(f"Medicine ID {minv_id} not found in inventory")
                
#                 # Create medicine record
#                 medicine_record = MedicineRecord.objects.create(
#                     medrec_qty=medrec_qty,
#                     reason=reason,
#                     signature=signature,
#                     requested_at=timezone.now(),
#                     fulfilled_at=timezone.now(),
#                     patrec_id=patient_record,
#                     minv_id=medicine_inv,
#                     staff=staff_instance
#                 )
#                 medicine_records.append(medicine_record)
            
#             # 5. Handle file uploads - THIS MUST BE INSIDE THE TRANSACTION SCOPE
#             uploaded_files = []
#             if files and medicine_records:
#                 try:
#                     # Create a savepoint before file operations
#                     sid = transaction.savepoint()
                    
#                     serializer = Medicine_FileSerializer(context={'request': request})
#                     first_medrec = medicine_records[0]
#                     uploaded_files = serializer._upload_files(files, medrec_instance=first_medrec)
                    
#                     if not uploaded_files:
#                         print("No files were uploaded successfully")
#                         # If file upload is critical, you can raise an exception here:
#                         # raise Exception("File upload failed")
                    
#                     print(f"Successfully processed {len(uploaded_files)} files")
                    
#                 except Exception as e:
#                     print(f"File upload error: {str(e)}")
#                     # Rollback to savepoint if file upload fails
#                     transaction.savepoint_rollback(sid)
#                     # If file upload is critical, re-raise the exception to trigger full rollback:
#                     raise Exception(f"File upload failed: {str(e)}")
            
#             return Response({
#                 "message": "Medicine request created successfully",
#                 "patrec_id": patient_record.patrec_id,
#                 "medicine_records_created": len(medicine_records),
#                 "medicine_transactions_created": len(medicine_transactions),
#                 "uploaded_files_count": len(uploaded_files)
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             print(f"Unexpected error: {str(e)}")
#             # The @transaction.atomic decorator will automatically rollback
#             # all database changes if we reach here
            
#             # Manual inventory rollback (in case transaction doesn't cover everything)
#             try:
#                 for minv_id, update_info in inventory_updates.items():
#                     medicine_inv = update_info['medicine_inv']
#                     original_qty = update_info['original_qty']
#                     medicine_inv.minv_qty_avail = original_qty
#                     medicine_inv.save()
#                     print(f"Rolled back inventory for medicine {minv_id} to {original_qty}")
#             except Exception as rollback_error:
#                 print(f"Error during inventory rollback: {str(rollback_error)}")
            
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



 
# class MonthlyMedicineSummariesAPIView(APIView):
#     def get(self, request):
#         try:
#             queryset = MedicineRecord.objects.select_related(
#                 'minv_id', 
#                 'minv_id__inv_id', 
#                 'minv_id__med_id',  
#                 'patrec_id'
#             ).order_by('-fulfilled_at')

#             year_param = request.GET.get('year')  # '2025' or '2025-07'

#             if year_param and year_param != 'all':
#                 try:
#                     if '-' in year_param:
#                         year, month = map(int, year_param.split('-'))
#                         queryset = queryset.filter(
#                             fulfilled_at__year=year,
#                             fulfilled_at__month=month
#                         )
#                     else:
#                         year = int(year_param)
#                         queryset = queryset.filter(
#                             fulfilled_at__year=year
#                         )  
#                 except ValueError:
#                     return Response({
#                         'success': False,
#                         'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
#                     }, status=status.HTTP_400_BAD_REQUEST)

#             # Annotate and count records by month
#             monthly_data = queryset.annotate(
#                 month=TruncMonth('fulfilled_at')
#             ).values('month').annotate(
#                 record_count=Count('medrec_id')
#             ).order_by('-month')

#             formatted_data = []

#             for item in monthly_data:
#                 month_str = item['month'].strftime('%Y-%m')

#                 # Get or create report record for this month
#                 report_obj, created = MonthlyRecipientListReport.objects.get_or_create(
#                     month_year=month_str,
#                     rcp_type='Medicine'
#                 )

#                 report_data = MonthlyRCPReportSerializer(report_obj).data

#                 formatted_data.append({
#                     'month': month_str,
#                     'record_count': item['record_count'],
#                     'monthlyrcplist_id': report_obj.monthlyrcplist_id,
#                     'report': report_data
#                 })

#             return Response({
#                 'success': True,
#                 'data': formatted_data,
#                 'total_months': len(formatted_data)
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 'success': False,
#                 'error': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class MonthlyMedicineRecordsDetailAPIView(APIView):
#     def get(self, request, month):
#         try:
#             # Validate month format (YYYY-MM)
#             try:
#                 year, month_num = map(int, month.split('-'))
#                 if month_num < 1 or month_num > 12:
#                     raise ValueError
#             except ValueError:
#                 return Response({
#                     'success': False,
#                     'error': 'Invalid month format. Use YYYY-MM.'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Get records for the specified month
#             queryset = MedicineRecord.objects.select_related(
#                 'minv_id', 
#                 'minv_id__inv_id', 
#                 'minv_id__med_id',  
#                 'patrec_id'
#             ).filter(
#                 fulfilled_at__year=year,
#                 fulfilled_at__month=month_num
#             ).order_by('-fulfilled_at')

#             # Get or create report record for this month
#             report_obj, created = MonthlyRecipientListReport.objects.get_or_create(
#                 month_year=month,
#                 rcp_type='Medicine'
#             )

#             report_data = MonthlyRCPReportSerializer(report_obj).data
#             serialized_records = [
#                 MedicineRecordSerialzer(record).data for record in queryset
#             ]

#             return Response({
#                 'success': True,
#                 'data': {
#                     'month': month,
#                     'record_count': len(serialized_records),
#                     'monthlyrcplist_id': report_obj.monthlyrcplist_id,
#                     'report': report_data,
#                     'records': serialized_records
#                 }
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 'success': False,
#                 'error': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# class MonthlyMedicineCountAPIView(APIView):
#     def get(self, request):
#         try:
#             today = now()
#             current_month_start = today.replace(day=1)
#             last_month_start = (current_month_start - relativedelta(months=1)).replace(day=1)
#             last_month_end = current_month_start - timedelta(days=1)

#             # Count records for current month
#             current_month_count = MedicineRecord.objects.filter(
#                 fulfilled_at__year=current_month_start.year,
#                 fulfilled_at__month=current_month_start.month
#             ).count()

#             # Count records for last month
#             last_month_count = MedicineRecord.objects.filter(
#                 fulfilled_at__year=last_month_start.year,
#                 fulfilled_at__month=last_month_start.month
#             ).count()

#             return Response({
#                 'success': True,
#                 'current_month': {
#                     'month': current_month_start.strftime('%Y-%m'),
#                     'total_records': current_month_count
#                 },
#                 'last_month': {
#                     'month': last_month_start.strftime('%Y-%m'),
#                     'total_records': last_month_count
#                 }
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 'success': False,
#                 'error': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

# class MonthlyMedicineChart(APIView):
#     def get(self, request, month):
#         try:
#             # Validate month format (YYYY-MM)
#             try:
#                 year, month_num = map(int, month.split('-'))
#                 if month_num < 1 or month_num > 12:
#                     raise ValueError
#             except ValueError:
#                 return Response({
#                     'success': False,
#                     'error': 'Invalid month format. Use YYYY-MM.'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Get medicine counts for the specified month
#             queryset = MedicineRecord.objects.filter(
#                 fulfilled_at__year=year,
#                 fulfilled_at__month=month_num
#             ).values(
#                 'minv_id__med_id__med_name'  # Assuming this is the path to medicine name
#             ).annotate(
#                 count=Count('minv_id__med_id')
#             ).order_by('-count')

#             # Convert to dictionary format {medicine_name: count}
#             medicine_counts = {
#                 item['minv_id__med_id__med_name']: item['count'] 
#                 for item in queryset
#             }

#             return Response({
#                 'success': True,
#                 'month': month,
#                 'medicine_counts': medicine_counts,
#                 'total_records': sum(medicine_counts.values())
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 'success': False,
#                 'error': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
 
# class MedicineTotalCountAPIView(APIView):
#     def get(self, request):
#         try:
#             # Count total medicine request items
#             total_records = MedicineRecord.objects.count()

#             # Count records grouped by medicine name
#             items_count = MedicineRecord.objects.values(
#                 'minv_id__med_id__med_name'  # Adjust this based on your actual model relationships
#             ).annotate(
#                 count=Count('medrec_id')
#             ).order_by('-count')
#             return Response({
#                 'success': True,
#                 'total_records': total_records,
#                 'items_count': items_count
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 'success': False,
#                 'error': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserMedicineRequestsView(generics.ListAPIView):
    serializer_class = MedicineRequestSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Get patient ID from query params
        pat_id = self.request.query_params.get('pat_id')
        rp_id = self.request.query_params.get('rp_id')

        if not pat_id and not rp_id:
            return MedicineRequest.objects.none()

        queryset = MedicineRequest.objects.select_related(
            'pat_id', 'rp_id'
        ).prefetch_related(
            Prefetch('items', queryset=MedicineRequestItem.objects.select_related(
                'minv_id', 'minv_id__med_id', 'med'
            ).all())  # Include all items
        ).order_by('-requested_at')

        if pat_id:
            queryset = queryset.filter(pat_id=pat_id)
        elif rp_id:
            queryset = queryset.filter(rp_id=rp_id)

        return queryset
    
    
# # class UserMedicineRequestsView(generics.ListAPIView):
# #     """Get medicine requests for the current user (patient or resident)"""
# #     serializer_class = MedicineRequestSerializer
# #     pagination_class = StandardResultsPagination
    
# #     def get_queryset(self):
# #         # Get patient ID from query params or user session
# #         pat_id = ('PR20030001')
# #         rp_id = self.request.query_params.get('rp_id')
        
# #         print(f"DEBUG: Received pat_id={pat_id}, rp_id={rp_id}")  # Debug log
        
# #         if not pat_id and not rp_id:
# #             print("DEBUG: No pat_id or rp_id provided")
# #             return MedicineRequest.objects.none()
        
# #         try:
# #             queryset = MedicineRequest.objects.select_related(
# #                 'pat_id', 'rp_id'
# #             ).prefetch_related(
# #                 Prefetch('items', queryset=MedicineRequestItem.objects.select_related(
# #                     'minv_id', 'minv_id__med_id', 'med'
# #                 ))
# #             ).order_by('-requested_at')
            
# #             if pat_id:
# #                 # Verify patient exists
# #                 try:
# #                     patient = Patient.objects.get(pat_id=pat_id)
# #                     queryset = queryset.filter(pat_id=patient)
# #                     print(f"DEBUG: Found patient {pat_id}, filtering requests")
# #                 except Patient.DoesNotExist:
# #                     print(f"DEBUG: Patient {pat_id} not found")
# #                     return MedicineRequest.objects.none()
                    
# #             elif rp_id:
# #                 # Verify resident exists
# #                 try:
# #                     resident = ResidentProfile.objects.get(rp_id=rp_id)
# #                     queryset = queryset.filter(rp_id=resident)
# #                     print(f"DEBUG: Found resident {rp_id}, filtering requests")
# #                 except ResidentProfile.DoesNotExist:
# #                     print(f"DEBUG: Resident {rp_id} not found")
# #                     return MedicineRequest.objects.none()
            
# #             result_count = queryset.count()
# #             print(f"DEBUG: Found {result_count} requests")
# #             return queryset
            
# #         except Exception as e:
# #             print(f"DEBUG: Error in get_queryset: {str(e)}")
# #             return MedicineRequest.objects.none()
    
# #     def list(self, request, *args, **kwargs):
# #         try:
# #             return super().list(request, *args, **kwargs)
# #         except Exception as e:
# #             print(f"ERROR in UserMedicineRequestsView: {str(e)}")
# #             import traceback
# #             traceback.print_exc()
# #             return Response({
# #                 'success': False,
# #                 'error': f'Error fetching medicine requests: {str(e)}',
# #                 'results': [],
# #                 'count': 0,
# #                 'next': None,
# #                 'previous': None
# #             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
        
    # __________________________________________________________________________________________________________________________________________________

class CheckPendingMedicineRequestView(APIView):
    def get(self, request, pat_id, med_id):
        try:
            try:
                patient = Patient.objects.get(pat_id=pat_id)
                print(f"DEBUG: Found patient: {patient.pat_id}")
                
                # Check pending requests for this patient
                pending_requests = MedicineRequest.objects.filter(
                    Q(pat_id=patient.pat_id) | Q(rp_id=patient.rp_id.rp_id if patient.rp_id else None),
                    # status='pending'
                )
                
                # print(f"DEBUG: Found {pending_requests.count()} pending requests")
                
                # List all medicines in all pending requests
                all_medicines_in_requests = set()
                for request in pending_requests:
                    # print(f"\nDEBUG: Request {request.medreq_id} - Status: {request.status}")
                    
                    for item in request.items.all():
                        medicine_id = None
                        medicine_name = None
                        
                        # SAFELY check both possible ways medicine can be stored
                        try:
                            # Check if medicine is linked through inventory
                            if hasattr(item, 'minv_id') and item.minv_id and hasattr(item.minv_id, 'med_id') and item.minv_id.med_id:
                                medicine_id = item.minv_id.med_id.med_id
                                medicine_name = item.minv_id.med_id.med_name
                                # print(f"  - Via Inventory: {medicine_id} - {medicine_name}")
                        except Exception as e:
                            print(f"  - Error accessing minv_id: {e}")
                        
                        try:
                            # Check if medicine is linked directly
                            if hasattr(item, 'med') and item.med:
                                medicine_id = item.med.med_id
                                medicine_name = item.med.med_name
                                # print(f"  - Direct Medicine: {medicine_id} - {medicine_name}")
                        except Exception as e:
                            print(f"  - Error accessing med: {e}")
                        
                        if medicine_id:
                            all_medicines_in_requests.add(f"{medicine_id} - {medicine_name}")
                            
                            # Check if this matches our search
                            if str(medicine_id) == str(med_id):
                                # print(f"  *** MATCH FOUND ***")
                                return Response({'has_pending_request': True}, status=status.HTTP_200_OK)
                        else:
                            print(f"  - No medicine ID found for this item")
                
                # print(f"\nDEBUG: All medicines found in pending requests:")
                # for medicine in sorted(all_medicines_in_requests):
                #     print(f"  - {medicine}")
                
                # print(f"DEBUG: No pending requests found with medicine {med_id}")
                return Response({'has_pending_request': False}, status=status.HTTP_200_OK)
                
            except Patient.DoesNotExist:
                # print(f"DEBUG: Patient {pat_id} not found")
                return Response({'has_pending_request': False}, status=status.HTTP_200_OK)
                    
        except Exception as e:
            print(f"ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


class IndividualMedicineRecordView(generics.ListCreateAPIView):
    serializer_class = MedicineRecordSerialzer
    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return MedicineRecord.objects.filter(
            patrec_id__pat_id=pat_id
        ).order_by('-fulfilled_at')  
        
        
class UserAllMedicineRequestItemsView(generics.ListAPIView):
    serializer_class = MedicineRequestItemSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Handle rp_id (residents) or pat_id (patients)
        rp_id = self.request.query_params.get('rp_id')
        pat_id = self.request.query_params.get('pat_id')
        
        if not rp_id and not pat_id:
            raise ValidationError({"error": "Either rp_id or pat_id is required"})
        
        queryset = MedicineRequestItem.objects
        
        if rp_id:
            queryset = queryset.filter(medreq_id__rp_id=rp_id)
        elif pat_id:
            queryset = queryset.filter(medreq_id__pat_id=pat_id)
        
        # Optional: Filter by include_archived param (default: True for "all")
        include_archived = self.request.query_params.get('include_archived', 'true').lower() == 'true'
        if not include_archived:
            queryset = queryset.filter(is_archived=False)   
        
        # Optimize with selects/prefetches
        return queryset.select_related(
            'minv_id', 'minv_id__med_id', 'medreq_id'
        ).prefetch_related(
            # 'medicine_files'
        ).order_by('-created_at').distinct()

    

class MedicineRequestItemCancel(APIView):
    def patch(self, request, medreqitem_id):
        try:
            item = MedicineRequestItem.objects.get(medreqitem_id=medreqitem_id)
            archive_reason = request.data.get('archive_reason')
            if not archive_reason:
                return Response({"error": "Archive reason is required"}, status=status.HTTP_400_BAD_REQUEST)
            item.status = 'cancelled'
            item.is_archived = True
            item.archive_reason = archive_reason
            item.save()
            return Response({"success": True, "message": "Item cancelled successfully"}, status=status.HTTP_200_OK)
        except MedicineRequestItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
# class MedicineRequestDetailUpdateView(generics.RetrieveUpdateAPIView):
#     serializer_class = MedicineRequestSerializer
#     queryset = MedicineRequest.objects.all()
#     lookup_field = 'medreq_id'

#     @transaction.atomic
#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         new_status = request.data.get('status')
#         staff_id = request.data.get('staff_id')
#         referral_reason = request.data.get('referral_reason')

#         if not new_status:
#             raise ValidationError({"error": "New status is required."})

#         if new_status not in ['confirmed', 'referred', 'declined']:
#             raise ValidationError({"error": "Invalid status. Must be 'confirmed', 'referred', or 'declined'."})

#         if new_status == 'referred' and not referral_reason:
#             raise ValidationError({"error": "Referral reason is required for 'referred' status."})

#         staff_instance = None
#         if staff_id:
#             try:
#                 staff_instance = Staff.objects.get(staff_id=staff_id)
#             except Staff.DoesNotExist:
#                 raise ValidationError({"error": f"Staff with ID {staff_id} not found."})

#         # Process each MedicineRequestItem
#         for item_record in instance.items.all():  # Changed from medicine_records to items
#             if new_status == 'confirmed':
#                 if item_record.minv_id and item_record.minv_id.minv_qty_avail < item_record.medreqitem_qty:
#                     raise ValidationError(f"Insufficient stock for {item_record.med.med_name}. Cannot confirm.")

#                 if item_record.minv_id:
#                     item_record.minv_id.minv_qty_avail -= item_record.medreqitem_qty
#                     item_record.minv_id.save()

#                     # Create MedicineTransaction
#                     mdt_qty = f"{item_record.medreqitem_qty} {item_record.minv_id.minv_qty_unit or 'pcs'}"
#                     MedicineTransactions.objects.create(
#                         mdt_qty=mdt_qty,
#                         mdt_action="deducted",
#                         staff=staff_instance,
#                         minv_id=item_record.minv_id
#                     )

#                 item_record.status = 'fulfilled'
#                 # Create MedicineRecord for fulfilled item
#                 MedicineRecord.objects.create(
#                     medrec_qty=item_record.medreqitem_qty,
#                     reason=item_record.reason,
#                     fulfilled_at=timezone.now(),
#                     patrec_id=instance.pat_id.patient_records.first() if instance.pat_id else None,
#                     minv_id=item_record.minv_id,
#                     medreq_id=instance,
#                     staff=staff_instance
#                 )

#             elif new_status == 'referred':
#                 item_record.status = 'referred'
#                 item_record.archive_reason = referral_reason  # Store reason in item

#             elif new_status == 'declined':
#                 item_record.status = 'declined'
#                 item_record.archive_reason = referral_reason or "Declined by staff"

#             item_record.save()

#         # Create FindingsPlanTreatment for referred items
#         if new_status == 'referred':
#             new_finding = Finding.objects.create(
#                 assessment_summary=f"Medicine request referred: {referral_reason}",
#                 obj_summary="Patient requested medicine.",
#                 subj_summary="Patient reported symptoms/reason for request.",
#                 plantreatment_summary="Referred to doctor for further assessment and prescription."
#             )
#             FindingsPlanTreatment.objects.create(
#                 medreq=instance,
#                 find=new_finding,
#             )

#         serializer = self.get_serializer(instance)
#         return Response(serializer.data, status=status.HTTP_200_OK)
    

class MedicineRequestItemsByRequestView(generics.ListAPIView):
    """Get medicine request items for a specific medicine request"""
    serializer_class = MedicineRequestItemSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        medreq_id = self.kwargs.get('medreq_id')
        
        if not medreq_id:
            return MedicineRequestItem.objects.none()
            
        return MedicineRequestItem.objects.filter(
            medreq_id=medreq_id
        ).select_related(
            'minv_id', 'medreq_id', 'med', 'medreq_id__rp_id', 'medreq_id__pat_id',
            'medreq_id__rp_id__per',  # Add resident profile personal info
            'medreq_id__pat_id__per',  # Add patient personal info
        ).prefetch_related(
            'minv_id__med_id',
            'medreq_id__rp_id__per__personaladdress_set__add',  # Prefetch addresses
            'medreq_id__pat_id__per__personaladdress_set__add',  # Prefetch patient addresses
        ).order_by('-medreq_id__requested_at')
        
class SubmitMedicineRequestView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    
    @transaction.atomic
    def post(self, request):
        try:
            data = request.data
            # Handle medicines as array or single string
            medicines_data = data.get('medicines', '[]')
            if isinstance(medicines_data, list):
                print("Warning: medicines received as array, taking first element")
                medicines_data = medicines_data[0]
            medicines = json.loads(medicines_data)
            files = request.FILES.getlist('files', [])
            
            if not medicines:
                return Response({"error": "At least one medicine is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            requires_prescription = any(med.get('med_type', '') == 'Prescription' for med in medicines)
            if requires_prescription and not files:
                return Response({"error": "Prescription document is required for prescription medicines"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            pat_id = data.get('pat_id')
            if isinstance(pat_id, list):
                print("Warning: pat_id received as array, taking first element")
                pat_id = pat_id[0]
            rp_id = data.get('rp_id')
            if isinstance(rp_id, list):
                print("Warning: rp_id received as array, taking first element")
                rp_id = rp_id[0]
                
            print(f"Received pat_id: {pat_id}, rp_id: {rp_id}")
                
            if not pat_id and not rp_id:
                return Response({"error": "Either patient ID or resident ID must be provided"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            if pat_id and rp_id:
            # Both provided: Prioritize pat_id (user is a patient linked to resident)
                print("Prioritizing pat_id over rp_id")
                rp_id = None  # Ignore rp_id
            elif not pat_id and not rp_id:
                return Response({"error": "Either patient ID (pat_id) or resident ID (rp_id) must be provided"},
                            status=status.HTTP_400_BAD_REQUEST)
            elif pat_id:
                print("Using pat_id only")
            else:
                print("Using rp_id only")
            
            pat_instance = None
            
            if pat_id:
                try:
                    pat_instance = Patient.objects.get(pat_id=pat_id)
                    print(f"Validated pat_id: {pat_id} -> Patient {pat_instance}")
                except Patient.DoesNotExist:
                    return Response({"error": f"Patient with ID {pat_id} not found"}, status=status.HTTP_404_NOT_FOUND)

            rp_instance = None
            if rp_id:
                try:
                    rp_instance = ResidentProfile.objects.get(rp_id=rp_id)
                    print(f"Validated rp_id: {rp_id} -> Resident {rp_instance}")
                except ResidentProfile.DoesNotExist:
                    return Response({"error": f"Resident with ID {rp_id} not found"}, status=status.HTTP_404_NOT_FOUND)
                
            medicine_request = MedicineRequest.objects.create(
                pat_id=pat_instance,
                rp_id=rp_instance,
                mode='app'
            )
            
            request_items = []
            for med in medicines:
                if 'minv_id' not in med:
                    return Response({"error": f"minv_id is required for each medicine"}, 
                                  status=status.HTTP_400_BAD_REQUEST)
                try:
                    minv_id = int(med['minv_id'])
                    medicine_inv = MedicineInventory.objects.get(minv_id=minv_id)
                    # print(f"Processing minv_id: {minv_id}, med_id: {medicine_inv.med_id.pk}")
                    request_item = MedicineRequestItem(
                        medreq_id=medicine_request,
                        minv_id=None,
                        med=medicine_inv.med_id,  # Assign Medicinelist object
                        medreqitem_qty=med['quantity'],
                        reason=med.get('reason', ''),
                        status='pending'
                    )
                    request_items.append(request_item)
                except ValueError:
                    return Response({"error": f"Invalid minv_id: {med['minv_id']} must be a number"}, 
                                  status=status.HTTP_400_BAD_REQUEST)
                except MedicineInventory.DoesNotExist:
                    return Response({"error": f"Medicine with minv_id {med['minv_id']} not found"}, 
                                  status=status.HTTP_404_NOT_FOUND)
            
            # # Debug: Log request items
            # for item in request_items:
            #     print(f"Creating MedicineRequestItem: medreq_id={item.medreq_id.medreq_id}, minv_id={item.minv_id.minv_id}, med_id={item.med.pk}")
            
            MedicineRequestItem.objects.bulk_create(request_items)
            print(f"Created request at: {medicine_request.requested_at}")
            uploaded_files = []
            if files:
                try:
                    # Convert Django file objects to the format expected by the serializer
                    file_data_list = []
                    for file in files:
                        # Read file content and convert to base64 data URL format
                        file_content = file.read()
                        import base64
                        base64_content = base64.b64encode(file_content).decode('utf-8')
                        data_url = f"data:{file.content_type};base64,{base64_content}"
                        
                        file_data_list.append({
                            'name': file.name,
                            'type': file.content_type,
                            'file': data_url
                        })
                    
                    # Use the Medicine_FileSerializer to upload files to Supabase
                    serializer = Medicine_FileSerializer(context={'request': request})
                    uploaded_files = serializer._upload_files(
                        file_data_list, 
                        medreq_instance=medicine_request  # Associate with the medicine request, not the item
                    )
                    
                    print(f"Successfully uploaded {len(uploaded_files)} files to Supabase")
                    
                except Exception as e:
                    print(f"Error uploading files to Supabase: {str(e)}")
                    # If file upload fails, we might want to roll back the transaction
                    raise Exception(f"File upload failed: {str(e)}")
            
            return Response({
                "success": True,
                "medreq_id": medicine_request.medreq_id,
                "message": "Medicine request submitted successfully",
                "files_uploaded": len(uploaded_files)
            }, status=status.HTTP_201_CREATED)
            
        except (Patient.DoesNotExist, ResidentProfile.DoesNotExist) as e:
            return Response({"error": "Patient or resident not found"}, 
                          status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Internal server error: {str(e)}")
            return Response({"error": f"Internal server error: {str(e)}"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class SubmitMedicineRequestView(APIView):
#     parser_classes = (MultiPartParser, FormParser)

#     @transaction.atomic
#     def post(self, request, *args, **kwargs):
#         try:
#             print("Received data keys:", request.data.keys())
#             print("Request data:", dict(request.data))
            
#             rp_id = request.data.get('rp_id')
#             print(f"Extracted rp_id: {rp_id}")
            
#             # The medicines data is sent as a JSON string and must be parsed
#             medicines_json = request.data.get('medicines', '[]')
#             print(f"Medicines JSON: {medicines_json}")
#             medicines = json.loads(medicines_json)

#             mode = request.data.get('mode', 'app')

#             # Validate required data
#             if not rp_id:
#                 raise ValidationError("'rp_id' is required for a new request.")
#             if not medicines:
#                 raise ValidationError("At least one medicine is required.")

#             # Get resident profile instance
#             try:
#                 resident_instance = ResidentProfile.objects.get(rp_id=rp_id)
#             except ResidentProfile.DoesNotExist:
#                 raise ValidationError(f"Resident with ID {rp_id} not found.")
            
#             # Create the main MedicineRequest instance
#             medicine_request = MedicineRequest.objects.create(
#                 rp_id=resident_instance,
#                 mode=mode,
#                 status='pending'
#             )
            
#             # Process and create MedicineRequestItem for each medicine
#             request_items = []
#             for med_data in medicines:
#                 minv_id = med_data.get('minv_id')
#                 medreqitem_qty = med_data.get('medreqitem_qty', 1)
#                 reason = med_data.get('reason', '')

#                 if not minv_id:
#                     continue

#                 try:
#                     medicine_inventory = MedicineInventory.objects.get(minv_id=minv_id)
#                 except MedicineInventory.DoesNotExist:
#                     raise ValidationError(f"Medicine with inventory ID {minv_id} not found.")
                
#                 # Check stock availability
#                 if medicine_inventory.minv_qty_avail < medreqitem_qty:
#                      raise ValidationError(
#                          f"Insufficient stock ({medicine_inventory.minv_qty_avail}) "
#                          f"for medicine ID {minv_id}. Requested: {medreqitem_qty}"
#                      )

#                 request_items.append(MedicineRequestItem(
#                     medreq_id=medicine_request,
#                     minv_id=medicine_inventory,
#                     medreqitem_qty=medreqitem_qty,
#                     reason=reason,
#                     status='pending'
#                 ))
            
#             MedicineRequestItem.objects.bulk_create(request_items)

#             # Handle file uploads if any
#             files = request.FILES.getlist('files', [])
#             uploaded_files = []
#             if files:
#                 try:
#                     serializer = Medicine_FileSerializer(context={'request': request})
#                     uploaded_files = serializer._upload_files(files, medreq_instance=medicine_request)
#                 except Exception as e:
#                     print(f"File upload error: {str(e)}")
#                     # Consider whether to fail the entire request or continue without files

#             return Response({
#                 "success": True,
#                 "message": "Medicine request submitted successfully.",
#                 "medreq_id": medicine_request.medreq_id,
#                 "uploaded_files_count": len(uploaded_files)
#             }, status=status.HTTP_201_CREATED)

#         except ValidationError as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             return Response({"error": "An internal server error occurred.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# Admin Management Views
# class PendingMedicineRequestsView(generics.ListAPIView):
#     serializer_class = MedicineRequestSerializer
    
#     def get_queryset(self):
#         return MedicineRequest.objects.filter(status='pending').prefetch_related(
#             'items', 'items__minv_id', 'items__minv_id__med_id'
#         ).order_by('-requested_at')


# class MedicineRequestDetailView(generics.RetrieveAPIView):
#     serializer_class = MedicineRequestSerializer
#     queryset = MedicineRequest.objects.all()
#     lookup_field = 'medreq_id'


# class UpdateMedicineRequestStatusView(APIView):
#     @transaction.atomic
#     def patch(self, request, medreq_id):
#         try:
#             new_status = request.data.get('status')
#             doctor_notes = request.data.get('doctor_notes', '')

#             if not new_status:
#                 return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

#             valid_statuses = ['pending', 'confirmed', 'referred_to_doctor', 'declined', 'ready_for_pickup', 'completed']
#             if new_status not in valid_statuses:
#                 return Response({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}, 
#                               status=status.HTTP_400_BAD_REQUEST)

#             try:
#                 medicine_request = MedicineRequest.objects.get(medreq_id=medreq_id)
#             except MedicineRequest.DoesNotExist:
#                 return Response({"error": "Medicine request not found"}, status=status.HTTP_404_NOT_FOUND)

#             # Process each item
#             request_items = medicine_request.items.all()
#             for item in request_items:
#                 try:
#                     if new_status == 'confirmed':
#                         if item.minv_id and item.minv_id.minv_qty_avail < item.medreqitem_qty:
#                             raise Exception(f"Insufficient stock for {item.med.med_name}. "
#                                           f"Available: {item.minv_id.minv_qty_avail}, Requested: {item.medreqitem_qty}")
                        
#                         if item.minv_id:
#                             item.minv_id.minv_qty_avail -= item.medreqitem_qty
#                             item.minv_id.save()
                            
#                             MedicineTransactions.objects.create(
#                                 mdt_qty=f"-{item.medreqitem_qty}",
#                                 mdt_action="request_fulfillment",
#                                 minv_id=item.minv_id,
#                                 staff=request.user.staff if hasattr(request.user, 'staff') else None
#                             )
                        
#                         item.status = 'confirmed'
#                         MedicineRecord.objects.create(
#                             medrec_qty=item.medreqitem_qty,
#                             reason=item.reason,
#                             fulfilled_at=timezone.now(),
#                             patrec_id=medicine_request.pat_id.patient_records.first() if medicine_request.pat_id else None,
#                             minv_id=item.minv_id,
#                             medreq_id=medicine_request,
#                             staff=request.user.staff if hasattr(request.user, 'staff') else None
#                         )
                    
#                     elif new_status == 'referred_to_doctor':
#                         item.status = 'referred_to_doctor'
#                         item.archive_reason = doctor_notes or "Referred to doctor"
                    
#                     elif new_status == 'declined':
#                         item.status = 'declined'
#                         item.archive_reason = doctor_notes or "Declined by staff"
                    
#                     elif new_status == 'ready_for_pickup':
#                         item.status = 'ready_for_pickup'
                    
#                     elif new_status == 'completed':
#                         item.status = 'completed'
                    
#                     item.save()

#                 except Exception as e:
#                     print(f"Error processing item {item.medreqitem_id}: {str(e)}")
#                     continue

#             return Response({
#                 "success": True,
#                 "message": f"Request items status updated to {new_status}",
#                 "medreq_id": medreq_id
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"error": f"Internal server error: {str(e)}"}, 
#                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# React Native Query Functions (for your frontend)
# These would be in your API service file, not in views.py

# For getting pending requests (admin)
# class AdminMedicineRequestsView(generics.ListAPIView):
#     serializer_class = MedicineRequestSerializer
#     pagination_class = StandardResultsPagination
    
#     def get_queryset(self):
#         status_filter = self.request.query_params.get('status', 'pending')
#         search_query = self.request.query_params.get('search', '')
        
#         queryset = MedicineRequest.objects.select_related(
#             'pat_id', 'rp_id'
#         ).prefetch_related(
#             'items', 'items__minv_id', 'items__minv_id__med_id',
#             'items__medicine_files'
#         )
        
#         if status_filter:
#             queryset = queryset.filter(status=status_filter)
        
#         if search_query:
#             queryset = queryset.filter(
#                 Q(pat_id__pat_id__icontains=search_query) |
#                 Q(rp_id__rp_id__icontains=search_query) |
#                 Q(items__minv_id__med_id__med_name__icontains=search_query)
#             ).distinct()
        
#         return queryset.order_by('-requested_at')