from django.shortcuts import render
from rest_framework import generics
from django.db.models import Q, Count
from datetime import timedelta
from django.utils.timezone import now
import json
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
from pagination import *
from django.db.models import Q, Prefetch
from utils import *  # Assuming you have this
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.conf import settings
import os
import uuid

class MedicineRequestDetailUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = MedicineRequestSerializer # Use the same serializer as above
    queryset = MedicineRequest.objects.all()
    lookup_field = 'medreq_id'

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get('status')
        staff_id = request.data.get('staff_id') # Staff confirming/referring
        referral_reason = request.data.get('referral_reason') # Reason for referral/decline

        if not new_status:
            raise ValidationError({"error": "New status is required."})

        if new_status not in ['confirmed', 'referred', 'declined']:
            raise ValidationError({"error": "Invalid status. Must be 'confirmed', 'referred', or 'declined'."})

        if new_status == 'referred' and not referral_reason:
            raise ValidationError({"error": "Referral reason is required for 'referred' status."})

        staff_instance = None
        if staff_id:
            try:
                staff_instance = Staff.objects.get(staff_id=staff_id)
            except Staff.DoesNotExist:
                raise ValidationError({"error": f"Staff with ID {staff_id} not found."})

        # Update the main MedicineRequest status
        instance.status = new_status
        instance.save()

        # Process individual medicine records based on the new status
        for item_record in instance.medicine_records.all(): # Assuming related_name='medicine_records'
            if new_status == 'confirmed':
                # Deduct from inventory and update status for each item
                if item_record.minv_id.minv_qty_avail < item_record.medrec_qty:
                    # This should ideally be checked before confirming, but as a safeguard
                    raise ValidationError(f"Insufficient stock for {item_record.minv_id.med_id.med_name}. Cannot confirm.")

                item_record.minv_id.minv_qty_avail -= item_record.medrec_qty
                item_record.minv_id.save()

                # Create MedicineTransaction for deduction
                mdt_qty = f"{item_record.medrec_qty} {item_record.minv_id.minv_qty_unit or 'pcs'}"
                MedicineTransactions.objects.create(
                    mdt_qty=mdt_qty,
                    mdt_action="deducted",
                    staff=staff_instance,
                    minv_id=item_record.minv_id
                )
                item_record.status = 'fulfilled'
                item_record.fulfilled_at = timezone.now()

            elif new_status == 'referred':
                item_record.status = 'referred'
                # You might want to store the referral reason on the individual item too, or just on the main request
                # For now, let's assume the main request's referral_reason covers all items.
                # If you need to store it per item, add a 'referral_reason' field to MedicineRecord.
            elif new_status == 'declined':
                item_record.status = 'declined'
                # No inventory changes needed for decline

            item_record.save()

        # If referred, create a FindingsPlanTreatment entry for the doctor
        if new_status == 'referred':
            # You might need to create a 'Finding' first if it's not already linked
            # For simplicity, let's assume a generic Finding or create one if needed.
            # This part depends on how your 'Finding' and 'FindingsPlanTreatment' models are used.
            # If 'Finding' is a general medical finding, you might create one.
            # If it's specific to a patient's visit, you might link to an existing one.
            # For a doctor's referral, a new 'Finding' might be appropriate.

            # Example: Create a new Finding for the referral
            new_finding = Finding.objects.create(
                assessment_summary=f"Medicine request referred: {referral_reason}",
                obj_summary="Patient requested medicine.",
                subj_summary="Patient reported symptoms/reason for request.",
                plantreatment_summary="Referred to doctor for further assessment and prescription."
            )
            FindingsPlanTreatment.objects.create(
                medreq=instance,
                find=new_finding,
                # created_at is auto_now_add
            )

        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PatientMedicineRecordsView(generics.ListAPIView):
    serializer_class = PatientMedicineRecordSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(
            Q(patient_records__medicine_records__patrec_id__isnull=False) 
        ).distinct()


class IndividualMedicineRecordView(generics.ListCreateAPIView):
    serializer_class = MedicineRecordSerialzer
    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return MedicineRecord.objects.filter(
            patrec_id__pat_id=pat_id
        ).order_by('-fulfilled_at')  
        
        
# views.py (alternative approach)
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
                    'staff_name': f"{record.staff.first_name} {record.staff.last_name}" if record.staff else 'Unknown',
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
        

# MEDICINE REQUEST PENDING
class MedicineRequestPendingTableView(generics.ListCreateAPIView):
    serializer_class = MedicineRequestSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        # Get the search query and date filter from request parameters
        search_query = self.request.GET.get('search', '').strip()
        date_filter = self.request.GET.get('date_filter', 'all').strip()
        
        # Base queryset for pending medicine requests
        queryset = MedicineRequest.objects.filter(status='pending').select_related(
            'pat_id', 'rp_id', 'pat_id__rp_id', 'pat_id__trans_id',
            'pat_id__rp_id__per',  # Resident patient personal info
            'rp_id__per',  # Requesting physician personal info
        ).prefetch_related(
            'items',  # Medicine request items
            'items__minv_id',  # Medicine inventory
            'items__minv_id__med_id',  # Medicine details
            'items__med',  # Alternative medicine reference
            'pat_id__rp_id__per__personaladdress_set__add',  # Patient addresses
            'pat_id__rp_id__per__personaladdress_set__add__sitio',  # Patient sitios
            'rp_id__per__personaladdress_set__add',  # Physician addresses
            'rp_id__per__personaladdress_set__add__sitio',  # Physician sitios
        ).order_by('-requested_at')
        
        # Apply search filter if provided
        if search_query:
            queryset = queryset.filter(
                # Search by patient information (Resident)
                Q(pat_id__rp_id__per__per_lname__icontains=search_query) |
                Q(pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(pat_id__rp_id__per__per_mname__icontains=search_query) |
                Q(pat_id__rp_id__per__per_contact__icontains=search_query) |
                
                # Search by patient information (Transient)
                Q(pat_id__trans_id__tran_lname__icontains=search_query) |
                Q(pat_id__trans_id__tran_fname__icontains=search_query) |
                Q(pat_id__trans_id__tran_mname__icontains=search_query) |
                Q(pat_id__trans_id__tran_contact__icontains=search_query) |
                
                # Search by physician information
                Q(rp_id__per__per_lname__icontains=search_query) |
                Q(rp_id__per__per_fname__icontains=search_query) |
                Q(rp_id__per__per_mname__icontains=search_query) |
                Q(rp_id__per__per_contact__icontains=search_query) |
                
                # Search by IDs
                Q(medreq_id__icontains=search_query) |
                Q(pat_id__pat_id__icontains=search_query) |
                Q(rp_id__rp_id__icontains=search_query) |
                
                # Search by medicine names in items
                Q(items__minv_id__med_id__med_name__icontains=search_query) |
                Q(items__med__med_name__icontains=search_query) |
                
                # Search by patient address information
                Q(pat_id__rp_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(pat_id__rp_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |
                
                # Search by physician address information
                Q(rp_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(rp_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |
                
                # Search by household and family information
                Q(pat_id__rp_id__respondents_info__fam__fam_id__icontains=search_query) |
                Q(pat_id__rp_id__respondents_info__fam__hh__hh_id__icontains=search_query) |
                Q(rp_id__respondents_info__fam__fam_id__icontains=search_query) |
                Q(rp_id__respondents_info__fam__hh__hh_id__icontains=search_query)
            ).distinct()
        
        # Apply date filter if provided
        if date_filter != 'all':
            today = datetime.now().date()
            
            if date_filter == 'today':
                # Filter for today's requests
                queryset = queryset.filter(requested_at__date=today)
                
            elif date_filter == 'this-week':
                # Filter for this week's requests (Monday to Sunday)
                start_of_week = today - timedelta(days=today.weekday())
                queryset = queryset.filter(requested_at__date__gte=start_of_week)
                
            elif date_filter == 'this-month':
                # Filter for this month's requests
                start_of_month = today.replace(day=1)
                queryset = queryset.filter(requested_at__date__gte=start_of_month)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'success': True,
                'results': serializer.data,
                'count': len(serializer.data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': f'Error fetching medicine requests: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class MedicineRequestPendingItemsTableView(generics.ListAPIView):
    """
    Get medicine request items for a specific medicine request (by medreq_id)
    where the parent medicine request status is 'pending'
    with pagination and comprehensive search functionality
    """
    serializer_class = MedicineRequestItemSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        # Get the medicine request ID from URL parameters
        medreq_id = self.kwargs.get('medreq_id')
        
        # Get the search query from request parameters
        search_query = self.request.GET.get('search', '').strip()
        
        # Base queryset for medicine request items
        queryset = MedicineRequestItem.objects.all()
        
        # Filter by medicine request ID if provided
        if medreq_id:
            queryset = queryset.filter(medreq_id=medreq_id)
        else:
            # If no specific medreq_id provided, filter by pending status
            queryset = queryset.filter(medreq_id__status='pending')
        
        # Add select_related and prefetch_related for performance
        queryset = queryset.select_related(
            'minv_id', 'medreq_id', 'med', 'medreq_id__rp_id', 'medreq_id__pat_id',
            'medreq_id__rp_id__per',  # Add resident profile personal info
            'medreq_id__pat_id__per',  # Add patient personal info
        ).prefetch_related(
            'minv_id__med_id',
            'medreq_id__rp_id__per__personaladdress_set__add',  # Prefetch addresses
            'medreq_id__pat_id__per__personaladdress_set__add',  # Prefetch patient addresses
        ).order_by('-medreq_id__requested_at')
        
        # Apply search filter if provided
        if search_query:
            queryset = queryset.filter(
                # Search by patient personal information
                Q(medreq_id__pat_id__per__per_lname__icontains=search_query) |
                Q(medreq_id__pat_id__per__per_fname__icontains=search_query) |
                Q(medreq_id__pat_id__per__per_mname__icontains=search_query) |
                Q(medreq_id__pat_id__per__per_contact__icontains=search_query) |
                
                # Search by resident profile personal information
                Q(medreq_id__rp_id__per__per_lname__icontains=search_query) |
                Q(medreq_id__rp_id__per__per_fname__icontains=search_query) |
                Q(medreq_id__rp_id__per__per_mname__icontains=search_query) |
                Q(medreq_id__rp_id__per__per_contact__icontains=search_query) |
                
                # Search by resident profile ID
                Q(medreq_id__rp_id__rp_id__icontains=search_query) |
                
                # Search by patient ID
                Q(medreq_id__pat_id__pat_id__icontains=search_query) |
                
                # Search by medicine information
                Q(med__med_name__icontains=search_query) |
                Q(minv_id__med_id__med_name__icontains=search_query) |
                
                # Search by medicine request ID
                Q(medreq_id__medreq_id__icontains=search_query) |
                
                # Search by address information (patient)
                Q(medreq_id__pat_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(medreq_id__pat_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(medreq_id__pat_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(medreq_id__pat_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(medreq_id__pat_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(medreq_id__pat_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |
                
                # Search by address information (resident profile)
                Q(medreq_id__rp_id__per__personaladdress__add__add_province__icontains=search_query) |
                Q(medreq_id__rp_id__per__personaladdress__add__add_city__icontains=search_query) |
                Q(medreq_id__rp_id__per__personaladdress__add__add_barangay__icontains=search_query) |
                Q(medreq_id__rp_id__per__personaladdress__add__add_street__icontains=search_query) |
                Q(medreq_id__rp_id__per__personaladdress__add__sitio__sitio_name__icontains=search_query) |
                Q(medreq_id__rp_id__per__personaladdress__add__add_external_sitio__icontains=search_query) |
                
                # Search by household and family information
                Q(medreq_id__pat_id__respondents_info__fam__fam_id__icontains=search_query) |
                Q(medreq_id__pat_id__respondents_info__fam__hh__hh_id__icontains=search_query) |
                Q(medreq_id__rp_id__respondents_info__fam__fam_id__icontains=search_query) |
                Q(medreq_id__rp_id__respondents_info__fam__hh__hh_id__icontains=search_query)
            ).distinct()  # Use distinct to avoid duplicate results
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'success': True,
                'results': serializer.data,
                'count': len(serializer.data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error fetching medicine request items: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
     
#=========== MEDICINE REQUEST WEB PROCESSING --REQ THROUGH DOCTORS END =========
class MedicineRequestProcessingView(generics.ListCreateAPIView):
    serializer_class = MedicineRequestSerializer

    def get_queryset(self):
        return MedicineRequest.objects.filter(status='processing')
    
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
                status='processing'
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






class MedicineRequestCreateView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            # Extract data from request
            pat_id = request.data.get('pat_id')
            signature = request.data.get('signature')
            medicines = request.data.get('medicines', [])
            files = request.data.get('files', [])
            staff_id = request.data.get('staff_id')
            
            if not pat_id:
                return Response({"error": "pat_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not medicines:
                return Response({"error": "At least one medicine is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # 1. Create patient record
            patient_record = PatientRecord.objects.create(
                pat_id=pat_id,
                patrec_type="Medicine Request",
                staff_id=staff_id
            )
            
            # 2. Create medicine request
            medicine_request = MedicineRequest.objects.create(
                medreq_status='completed',
                staff_id=staff_id,
                signature=signature
            )
            
            # 3. Process each medicine
            medicine_records = []
            for med_data in medicines:
                minv_id = med_data.get('minv_id')
                medrec_qty = med_data.get('medrec_qty')
                reason = med_data.get('reason', '')
                med_type = med_data.get('med_type', 'Over The Counter')
                
                if not minv_id or not medrec_qty:
                    continue
                
                # Check medicine inventory
                try:
                    medicine_inv = MedicineInventory.objects.get(minv_id=minv_id)
                    if medicine_inv.minv_qty_avail < medrec_qty:
                        raise Exception(f"Insufficient stock for medicine ID {minv_id}")
                    
                    # Update inventory
                    medicine_inv.minv_qty_avail -= medrec_qty
                    medicine_inv.save()
                    
                except MedicineInventory.DoesNotExist:
                    raise Exception(f"Medicine ID {minv_id} not found in inventory")
                
                # Create medicine record
                medicine_record = MedicineRecord.objects.create(
                    medrec_qty=medrec_qty,
                    reason=reason,
                    signature=signature,
                    requested_at=timezone.now(),
                    fulfilled_at=timezone.now(),
                    patrec_id=patient_record.patrec_id,
                    minv_id=minv_id,
                    medreq_id=medicine_request.medreq_id,
                    staff_id=staff_id
                )
                medicine_records.append(medicine_record)
            
            # 4. Handle file uploads if any
            uploaded_files = []
            if files:
                serializer = Medicine_FileSerializer(context={'request': request})
                try:
                    # For each medicine record, check if it's a prescription before associating files
                    for medicine_record in medicine_records:
                        med_data = next((med for med in medicines if med.get('minv_id') == medicine_record.minv_id), {})
                        med_type = med_data.get('med_type', 'Over The Counter')
                        
                        # Only associate files with prescription medicines
                        if med_type == 'Prescription':
                            uploaded_files.extend(
                                serializer._upload_files(
                                    files, 
                                    medrec_id=medicine_record.medrec_id, 
                                    medreq_id=medicine_request.medreq_id
                                )
                            )
                            break  # Associate files with the first prescription medicine found
                    
                    # If no prescription medicines found, associate files only with medreq_id
                    if not uploaded_files:
                        uploaded_files = serializer._upload_files(
                            files, 
                            medrec_id=None,  # Don't associate with any medicine record
                            medreq_id=medicine_request.medreq_id
                        )
                        
                except Exception as e:
                    return Response({"error": f"File upload failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                "message": "Medicine request created successfully",
                "medreq_id": medicine_request.medreq_id,
                "patrec_id": patient_record.patrec_id,
                "uploaded_files_count": len(uploaded_files) if files else 0
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)









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
    
    
class MedicineRequestCreateView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            # Extract data from request
            pat_id = request.data.get('pat_id')
            signature = request.data.get('signature')
            medicines = request.data.get('medicines', [])
            files = request.data.get('files', [])
            staff_id = request.data.get('staff_id')
            
            print(f"Received request data: pat_id={pat_id}, medicines={len(medicines)}, files={len(files)}")
            
            if not pat_id:
                return Response({"error": "pat_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not medicines:
                return Response({"error": "At least one medicine is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # 1. Get the Patient instance
            try:
                patient = Patient.objects.get(pat_id=pat_id)
            except Patient.DoesNotExist:
                return Response({"error": f"Patient with ID {pat_id} not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # 2. Get Staff instance if staff_id is provided
            staff_instance = None
            if staff_id:
                try:
                    staff_instance = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {staff_id} not found, continuing without staff")
            
            # 3. Create patient record with Patient instance
            patient_record = PatientRecord.objects.create(
                pat_id=patient,
                patrec_type="Medicine Request",
            )
            
            # 4. Process each medicine and track inventory changes for potential rollback
            medicine_records = []
            inventory_updates = {}  # Store original quantities for rollback
            medicine_transactions = []  # Store medicine transactions
            
            for med_data in medicines:
                minv_id = med_data.get('minv_id')
                medrec_qty = med_data.get('medrec_qty')
                reason = med_data.get('reason', '')
                
                if not minv_id or not medrec_qty:
                    continue
                
                # Check medicine inventory
                try:
                    medicine_inv = MedicineInventory.objects.get(minv_id=minv_id)
                    if medicine_inv.minv_qty_avail < medrec_qty:
                        # This will trigger transaction rollback
                        raise Exception(f"Insufficient stock for medicine ID {minv_id}. Available: {medicine_inv.minv_qty_avail}, Requested: {medrec_qty}")
                    
                    # Store original quantity for rollback
                    inventory_updates[minv_id] = {
                        'medicine_inv': medicine_inv,
                        'original_qty': medicine_inv.minv_qty_avail
                    }
                    
                    # Update inventory
                    medicine_inv.minv_qty_avail -= medrec_qty
                    medicine_inv.save()
                    
                    # Create medicine transaction record
                    # Determine transaction quantity based on unit
                    if medicine_inv.minv_qty_unit and medicine_inv.minv_qty_unit.lower() == 'boxes':
                        mdt_qty = f"{medrec_qty } pcs"  # Convert boxes to pieces (3 pcs per box)
                    else:
                        # Use the original unit if not boxes
                        unit = medicine_inv.minv_qty_unit or 'pcs'
                        mdt_qty = f"{medrec_qty} {unit}"
                    
                    # Create medicine transaction
                    medicine_transaction = MedicineTransactions.objects.create(
                        mdt_qty=mdt_qty,
                        mdt_action="deducted",
                        staff=staff_instance,
                        minv_id=medicine_inv
                    )
                    medicine_transactions.append(medicine_transaction)
                    
                except MedicineInventory.DoesNotExist:
                    # This will trigger transaction rollback
                    raise Exception(f"Medicine ID {minv_id} not found in inventory")
                
                # Create medicine record
                medicine_record = MedicineRecord.objects.create(
                    medrec_qty=medrec_qty,
                    reason=reason,
                    signature=signature,
                    requested_at=timezone.now(),
                    fulfilled_at=timezone.now(),
                    patrec_id=patient_record,
                    minv_id=medicine_inv,
                    staff=staff_instance
                )
                medicine_records.append(medicine_record)
            
            # 5. Handle file uploads - THIS MUST BE INSIDE THE TRANSACTION SCOPE
            uploaded_files = []
            if files and medicine_records:
                try:
                    # Create a savepoint before file operations
                    sid = transaction.savepoint()
                    
                    serializer = Medicine_FileSerializer(context={'request': request})
                    first_medrec = medicine_records[0]
                    uploaded_files = serializer._upload_files(files, medrec_instance=first_medrec)
                    
                    if not uploaded_files:
                        print("No files were uploaded successfully")
                        # If file upload is critical, you can raise an exception here:
                        # raise Exception("File upload failed")
                    
                    print(f"Successfully processed {len(uploaded_files)} files")
                    
                except Exception as e:
                    print(f"File upload error: {str(e)}")
                    # Rollback to savepoint if file upload fails
                    transaction.savepoint_rollback(sid)
                    # If file upload is critical, re-raise the exception to trigger full rollback:
                    raise Exception(f"File upload failed: {str(e)}")
            
            return Response({
                "message": "Medicine request created successfully",
                "patrec_id": patient_record.patrec_id,
                "medicine_records_created": len(medicine_records),
                "medicine_transactions_created": len(medicine_transactions),
                "uploaded_files_count": len(uploaded_files)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            # The @transaction.atomic decorator will automatically rollback
            # all database changes if we reach here
            
            # Manual inventory rollback (in case transaction doesn't cover everything)
            try:
                for minv_id, update_info in inventory_updates.items():
                    medicine_inv = update_info['medicine_inv']
                    original_qty = update_info['original_qty']
                    medicine_inv.minv_qty_avail = original_qty
                    medicine_inv.save()
                    print(f"Rolled back inventory for medicine {minv_id} to {original_qty}")
            except Exception as rollback_error:
                print(f"Error during inventory rollback: {str(rollback_error)}")
            
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



 
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
            
            # # Log received data
            # print("Received data:", dict(data))
            # print("Received files:", files)
            # print("Medicines:", medicines)
            
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
            
            if not pat_id and not rp_id:
                return Response({"error": "Either patient ID or resident ID must be provided"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            medicine_request = MedicineRequest.objects.create(
                pat_id=Patient.objects.get(pat_id=pat_id) if pat_id else None,
                rp_id=ResidentProfile.objects.get(rp_id=rp_id) if rp_id else None,
                status='pending',
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
                    print(f"Processing minv_id: {minv_id}, med_id: {medicine_inv.med_id.pk}")
                    request_item = MedicineRequestItem(
                        medreq_id=medicine_request,
                        minv_id=medicine_inv,
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
            
            # Debug: Log request items
            for item in request_items:
                print(f"Creating MedicineRequestItem: medreq_id={item.medreq_id.medreq_id}, minv_id={item.minv_id.minv_id}, med_id={item.med.pk}")
            
            MedicineRequestItem.objects.bulk_create(request_items)
            
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


# Admin Management Views
class PendingMedicineRequestsView(generics.ListAPIView):
    serializer_class = MedicineRequestSerializer
    
    def get_queryset(self):
        return MedicineRequest.objects.filter(status='pending').prefetch_related(
            'items', 'items__minv_id', 'items__minv_id__med_id'
        ).order_by('-requested_at')


class MedicineRequestDetailView(generics.RetrieveAPIView):
    serializer_class = MedicineRequestSerializer
    queryset = MedicineRequest.objects.all()
    lookup_field = 'medreq_id'


class UpdateMedicineRequestStatusView(APIView):
    @transaction.atomic
    def patch(self, request, medreq_id):
        try:
            new_status = request.data.get('status')
            doctor_notes = request.data.get('doctor_notes', '')
            
            if not new_status:
                return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate status
            valid_statuses = ['pending', 'confirmed', 'referred_to_doctor', 'declined', 'ready_for_pickup', 'completed']
            if new_status not in valid_statuses:
                return Response({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Get the medicine request
            medicine_request = MedicineRequest.objects.get(medreq_id=medreq_id)
            
            # Update status
            medicine_request.status = new_status
            
            # If referred to doctor, add notes
            if new_status == 'referred_to_doctor' and doctor_notes:
                # You might want to store this in a separate model or add a field to MedicineRequest
                medicine_request.notes = doctor_notes
            
            medicine_request.save()
            
            # If confirmed, update inventory and create medicine records
            if new_status == 'confirmed':
                self._process_confirmed_request(medicine_request)
            
            return Response({
                "success": True,
                "message": f"Request status updated to {new_status}",
                "medreq_id": medreq_id
            }, status=status.HTTP_200_OK)
            
        except MedicineRequest.DoesNotExist:
            return Response({"error": "Medicine request not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Internal server error: {str(e)}"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _process_confirmed_request(self, medicine_request):
        """Process a confirmed medicine request by updating inventory and creating records"""
        # Get all items in this request
        request_items = medicine_request.items.all()
        
        for item in request_items:
            try:
                # Check if enough stock is available
                if item.minv_id.minv_qty_avail < item.medreqitem_qty:
                    raise Exception(f"Insufficient stock for {item.minv_id.med_id.med_name}. "
                                  f"Available: {item.minv_id.minv_qty_avail}, Requested: {item.medreqitem_qty}")
                
                # Update inventory
                item.minv_id.minv_qty_avail -= item.medreqitem_qty
                item.minv_id.save()
                
                # Create medicine transaction
                MedicineTransactions.objects.create(
                    mdt_qty=f"-{item.medreqitem_qty}",
                    mdt_action="request_fulfillment",
                    minv_id=item.minv_id,
                    staff=request.user.staff if hasattr(request.user, 'staff') else None
                )
                
                # Update item status to confirmed
                item.status = 'confirmed'
                item.save()
                
            except Exception as e:
                # Log error but continue with other items
                print(f"Error processing item {item.medreqitem_id}: {str(e)}")
                continue


# React Native Query Functions (for your frontend)
# These would be in your API service file, not in views.py

# For getting pending requests (admin)
class AdminMedicineRequestsView(generics.ListAPIView):
    serializer_class = MedicineRequestSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        status_filter = self.request.query_params.get('status', 'pending')
        search_query = self.request.query_params.get('search', '')
        
        queryset = MedicineRequest.objects.select_related(
            'pat_id', 'rp_id'
        ).prefetch_related(
            'items', 'items__minv_id', 'items__minv_id__med_id',
            'items__medicine_files'
        )
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if search_query:
            queryset = queryset.filter(
                Q(pat_id__pat_id__icontains=search_query) |
                Q(rp_id__rp_id__icontains=search_query) |
                Q(items__minv_id__med_id__med_name__icontains=search_query)
            ).distinct()
        
        return queryset.order_by('-requested_at')