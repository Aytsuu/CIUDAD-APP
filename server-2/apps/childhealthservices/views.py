# Standard library imports
from collections import defaultdict
from datetime import datetime, timedelta

# Django imports
from django.db.models import (
    Case, When, F, CharField, Q, Prefetch, Count
)
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

# DRF imports
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

# Local app imports
from .models import *
from .serializers import *
from .utils import *
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import * 



class ChildHealthRecordsView(generics.ListCreateAPIView):
    queryset = ChildHealthrecord.objects.all()
    serializer_class = ChildHealthrecordSerializer


class ChildHealthHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealth_History.objects.all()
    serializer_class = ChildHealthHistorySerializer
    
class CheckUPChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer

    def get_queryset(self):
        return ChildHealth_History.objects.filter(status="check-up").order_by('-created_at')  # Filter by check-up and order by most recent first
    
class ChildHealthImmunizationStatusListView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer

    def get_queryset(self):
        return ChildHealth_History.objects.filter(status="immunization").order_by('-created_at')  # Filter by check-up and order by most recent first
    
class UpdateChildHealthHistoryView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealth_History.objects.all()
    serializer_class = ChildHealthHistorySerializer
    lookup_field = 'chhist_id'

class PendingMedConChildCountView(APIView):
    def get(self, request, *args, **kwargs):
        count = (
            ChildHealth_History.objects
            .filter(status="check-up")
            .count()
        )
        return Response({"count": count})

class ChildHealthNotesView(generics.ListCreateAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer


class ChildHealthNotesUpdateView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer
 
    def get_object(self):
        chnotes_id = self.kwargs.get("chnotes_id")
        if not chnotes_id:
            raise NotFound(detail="Child health notes ID not provided", code=status.HTTP_400_BAD_REQUEST)
        return get_object_or_404(ChildHealthNotes, chnotes_id=chnotes_id)
class DeleteChildHealthNotesView(generics.DestroyAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer
    lookup_field = 'chnotes_id'

    
class ChildHealthSupplementsView(generics.ListCreateAPIView):
    queryset = ChildHealthSupplements.objects.all()
    serializer_class = ChildHealthSupplementsSerializer
    
class ChildHealthSupplementStatusView(generics.ListCreateAPIView):
    queryset = ChildHealthSupplementsStatus.objects.all()
    serializer_class = ChildHealthSupplementStatusSerializer


class UpdateChildHealthSupplementsStatusView(generics.RetrieveUpdateAPIView):
    def patch(self, request, *args, **kwargs):
        data = request.data  # Expecting a list of updates
        if not isinstance(data, list) or not data:
            return Response(
                {"detail": "Expected a non-empty list of updates."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated = []
        errors = []

        for item in data:
            chssupplementstat_id = item.get("chssupplementstat_id")
            date_completed = item.get("date_completed")

            if not chssupplementstat_id:
                errors.append(
                    {
                        "error": "Missing chssupplementstat_id",
                        "item": item,
                    }
                )
                continue

            try:
                instance = ChildHealthSupplementsStatus.objects.get(
                    pk=chssupplementstat_id
                )
            except ChildHealthSupplementsStatus.DoesNotExist:
                errors.append(
                    {
                        "error": f"Record with id {chssupplementstat_id} not found",
                    }
                )
                continue

            # Only include the allowed field(s)
            update_data = {}
            if date_completed is not None:
                update_data["date_completed"] = date_completed
           

            serializer = ChildHealthSupplementStatusSerializer(
                instance, data=update_data, partial=True
            )

            if serializer.is_valid():
                serializer.save()
                updated.append(serializer.data)
            else:
                errors.append(
                    {
                        "id": chssupplementstat_id,
                        "errors": serializer.errors,
                    }
                )

        return Response(
            {
                "updated": updated,
                "errors": errors,
            },
            status=status.HTTP_200_OK,
        )

    

class NutritionalStatusView(generics.ListCreateAPIView):
    serializer_class = NutritionalStatusSerializerBase
    
    def get_queryset(self):
        queryset = NutritionalStatus.objects.all()
        pat_id = self.kwargs.get('pat_id')
        
        if pat_id:
            queryset = queryset.filter(pat_id=pat_id)
        
        return queryset
    


class ChildHealthVitalSignsView(generics.ListCreateAPIView):
    queryset = ChildHealthVitalSigns.objects.all()
    serializer_class = ChildHealthVitalSignsSerializer
    
class UpdateChildHealthVitalSignsView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealthVitalSigns.objects.all()
    serializer_class = ChildHealthVitalSignsSerializer
    lookup_field = 'chvital_id'
    
    
class ChildHealthNutrionalStatusListView(APIView):
    def get(self, request, chrec_id):
        vitals = ChildHealthVitalSigns.objects.filter(
            chhist__chrec_id=chrec_id
        ).order_by('-created_at')

        if not vitals.exists():
            return Response(
                {"detail": "No vital signs found for this child."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ChildHealthVitalSignsSerializerFull(vitals, many=True)
        return Response(serializer.data)
    

class ExclusiveBFCheckView(generics.ListCreateAPIView):
    queryset = ExclusiveBFCheck.objects.all()
    serializer_class = ExclusiveBFCheckSerializer

    def create(self, request, *args, **kwargs):
        chhist_id = request.data.get("chhist")
        bf_dates = request.data.get("BFdates", [])

        if not chhist_id or not isinstance(bf_dates, list):
            return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

        instances = []
        for date in bf_dates:
            instances.append(ExclusiveBFCheck(ebf_date=date, chhist_id=chhist_id))

        ExclusiveBFCheck.objects.bulk_create(instances)

        serializer = self.get_serializer(instances, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChildHealthImmunizationHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealthImmunizationHistory.objects.all()
    serializer_class = ChildHealthImmunizationHistorySerializer
class DeleteChildHealthImmunizationHistoryView(generics.DestroyAPIView):
    queryset = ChildHealthImmunizationHistory.objects.all()
    serializer_class = ChildHealthImmunizationHistorySerializer
    lookup_field = 'imt_id'

class IndivChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer

    def get_queryset(self):
        chhist_id = self.kwargs['chhist_id']
        return ChildHealth_History.objects.filter(chhist_id=chhist_id, status="recorded").order_by('-created_at')  # Optional: most recent first
    
    
    

class IndivChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthrecordSerializerFull

    def get_queryset(self):
        chrec_id = self.kwargs['chrec_id']

        # Prefetch ChildHealth_History and its deep relations
        child_health_history_qs = (
            ChildHealth_History.objects
            .filter(status__in=["recorded", "immunization", "check-up"])
            .select_related('chrec')  # already implied, but safe
            .prefetch_related(
                'child_health_notes',
                'child_health_notes__followv',
                'child_health_notes__staff',
                'child_health_vital_signs',
                'child_health_vital_signs__vital',
                'child_health_vital_signs__bm',
                'child_health_vital_signs__find',
                'child_health_supplements',
                'child_health_supplements__medrec',
                'exclusive_bf_checks',
                'immunization_tracking',
                'immunization_tracking__vachist',
                'supplements_statuses',
            )
        )

        return (
            ChildHealthrecord.objects
            .filter(chrec_id=chrec_id)
            .select_related('patrec', 'staff')
            .prefetch_related(
                Prefetch(
                    'child_health_histories',
                    queryset=child_health_history_qs
                ),
                Prefetch('patrec__patient_disabilities')  # For disabilities
            )
        )
        
class GeChildHealthRecordCountView(APIView):
    def get(self, request, pat_id):
        try:
            count = get_childhealth_record_count(pat_id)
            return Response({'pat_id': pat_id, 'childhealthrecord_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ChildHealthRecordByPatIDView(APIView):
    def get(self, request, pat_id):
       
        try:
            chrec = ChildHealthrecord.objects.get(
                patrec__pat_id=pat_id,
                patrec__patrec_type="Child Health Record"
            )
        except ChildHealthrecord.DoesNotExist:
            return Response({"detail": "Child health record not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChildHealthrecordSerializerFull(chrec)
        return Response(serializer.data)
    

class ChildHealthImmunizationCountView(APIView):
    def get(self, request, *args, **kwargs):
        count = (
            ChildHealthrecord.objects
            .filter(child_health_histories__status="immunization")
            .distinct()
            .count()
        )
        return Response({"count": count})
   



class MonthlyNutritionalStatusViewChart(generics.ListAPIView):
    serializer_class = NutritionalStatusSerializerBase
    
    def get_queryset(self):
        """
        Get nutritional status records for a specific month
        Defaults to current month if no parameters provided
        """
        # Get month and year from query parameters
        month = self.request.query_params.get('month', None)
        year = self.request.query_params.get('year', None)
        
        # If no parameters provided, use current month
        if not month or not year:
            current_date = timezone.now()
            month = current_date.month
            year = current_date.year
        
        # Filter by month and year
        queryset = NutritionalStatus.objects.filter(
            created_at__month=month,
            created_at__year=year
        ).order_by('-created_at')
        
        return queryset
    
class ChildHealthTotalCountAPIView(APIView):
    def get(self, request):
        try:
            # Count total unique child health records
            total_records = ChildHealthrecord.objects.count()
            
            return Response({
                'success': True,
                'total_records': total_records
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompleteChildHealthRecordAPIView(APIView):
    """
    Comprehensive API endpoint that handles ALL child health record operations in one atomic transaction
    """
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            
            # Extract all necessary data
            submitted_data = data.get('submittedData', {})
            staff_id = data.get('staff')
            
            # Validate required fields
            if not submitted_data.get('pat_id'):
                return Response({"error": "Patient ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if submitted_data.get('residenceType') == "Transient" and not submitted_data.get('trans_id'):
                return Response({"error": "Transient ID is required for transient residents"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get staff instance if provided
            staff_instance = None
            if staff_id:
                try:
                    staff_instance = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {staff_id} not found")
            
            # Handle transient updates if needed
            if submitted_data.get('residenceType') == "Transient":
                self._handle_transient_update(submitted_data)
            
            return self._handle_new_record_creation(submitted_data, staff_instance)
                
        except Exception as e:
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _handle_transient_update(self, submitted_data):
        """Handle transient patient information updates"""
        trans_id = submitted_data.get('trans_id')
        if not trans_id:
            return
        
        try:
            transient = Transient.objects.get(trans_id=trans_id)
            
            # Update transient information
            update_fields = [
                'mother_fname', 'mother_lname', 'mother_mname', 'mother_age', 'mother_dob',
                'father_fname', 'father_lname', 'father_mname', 'father_age', 'father_dob'
            ]
            
            for field in update_fields:
                if submitted_data.get(field.replace('_', '').replace('dob', '_dob')):
                    setattr(transient, field, submitted_data.get(field.replace('_', '').replace('dob', '_dob')))
            
            transient.save()
            
        except Transient.DoesNotExist:
            raise Exception(f"Transient with ID {trans_id} not found")
    
    def _handle_new_record_creation(self, submitted_data, staff_instance):
        """Handle creation of completely new child health record"""
        
        # Get patient instance
        try:
            patient = Patient.objects.get(pat_id=submitted_data['pat_id'])
        except Patient.DoesNotExist:
            raise Exception(f"Patient with ID {submitted_data['pat_id']} not found")
        
        # Create patient record
        patient_record = PatientRecord.objects.create(
            pat_id=patient,
            patrec_type="Child Health Record"
        )
        
        # Create child health record
        child_health_record = ChildHealthrecord.objects.create(
            ufc_no=submitted_data.get('ufcNo', ''),
            family_no=submitted_data.get('familyNo', ''),
            place_of_delivery_type=submitted_data.get('placeOfDeliveryType'),
            pod_location=submitted_data.get('placeOfDeliveryLocation', ''),
            mother_occupation=submitted_data.get('motherOccupation', ''),
            type_of_feeding=submitted_data.get('type_of_feeding'),
            father_occupation=submitted_data.get('fatherOccupation', ''),
            birth_order=submitted_data.get('birth_order', 0),
            newborn_screening=submitted_data.get('dateNewbornScreening'),
            staff=staff_instance,
            patrec=patient_record,
            landmarks=submitted_data.get('landmarks')
        )
        
        # Create child health history
        child_health_history = ChildHealth_History.objects.create(
            chrec=child_health_record,
            status=submitted_data.get('status', 'recorded'),
            tt_status=submitted_data.get('tt_status')
        )
        
        # Handle follow-up visit
        followv_id = None
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            vital_sign = submitted_data['vitalSigns'][0]
            if vital_sign.get('followUpVisit'):
                follow_up_visit = FollowUpVisit.objects.create(
                    followv_date=vital_sign['followUpVisit'],
                    followv_description=vital_sign.get('follov_description', 'Follow Up for Child Health'),
                    patrec=patient_record,
                    followv_status="pending"
                )
                followv_id = follow_up_visit.followv_id
        
        # Create health notes
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            vital_sign = submitted_data['vitalSigns'][0]
            if vital_sign.get('notes'):
                ChildHealthNotes.objects.create(
                    chn_notes=vital_sign['notes'],
                    followv_id=followv_id,
                    chhist=child_health_history,
                    staff=staff_instance
                )
        
        # Create body measurements and vital signs
        bmi_id = None
        chvital_id = None
        
        if (submitted_data.get('vitalSigns') and 
            len(submitted_data['vitalSigns']) == 1 and 
            submitted_data['vitalSigns'][0].get('date') and
            submitted_data.get('nutritionalStatus')):
            
            vital_sign = submitted_data['vitalSigns'][0]
            nutritional_status = submitted_data['nutritionalStatus']
            
            # Create body measurement
            body_measurement = BodyMeasurement.objects.create(
                height=vital_sign.get('ht', Decimal('0.00')),
                weight=vital_sign.get('wt', Decimal('0.00')),
                wfa=nutritional_status.get('wfa', ''),
                lhfa=nutritional_status.get('lhfa', ''),
                wfl=nutritional_status.get('wfh', ''),
                muac=str(nutritional_status.get('muac', '')),
                muac_status=nutritional_status.get('muac_status', ''),
                edemaSeverity=submitted_data.get('edemaSeverity', 'none'),
                pat=patient,
                remarks=vital_sign.get('remarks', ''),
                is_opt=vital_sign.get('is_opt', False),
                patrec=patient_record,
                staff=staff_instance
            )
            bmi_id = body_measurement.bm_id
        
        # Create vital signs
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            vital_sign = submitted_data['vitalSigns'][0]
            vital_signs = VitalSigns.objects.create(
                vital_temp=vital_sign.get('temp', ''),
                staff=staff_instance,
                patrec=patient_record
            )
            
            # Create child health vital sign
            child_vital_sign = ChildHealthVitalSigns.objects.create(
                vital=vital_signs,
                bm_id=bmi_id,
                chhist=child_health_history
            )
            chvital_id = child_vital_sign.chvital_id
        
        # Handle breastfeeding dates
        if submitted_data.get('BFdates'):
            self._handle_breastfeeding_dates(submitted_data['BFdates'], child_health_history.chhist_id)
        
        # Handle supplement statuses (low birth weight and anemia)
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            weight = submitted_data['vitalSigns'][0].get('wt')
            if weight and float(weight) < 2.5 and submitted_data.get('birthwt'):
                self._create_supplement_status(
                    'birthwt', 
                    submitted_data['birthwt'], 
                    child_health_history.chhist_id, 
                    weight
                )
            
            if submitted_data.get('anemic', {}).get('is_anemic'):
                self._create_supplement_status(
                    'anemic', 
                    submitted_data['anemic'], 
                    child_health_history.chhist_id, 
                    weight
                )
        
        # Handle medicines
        if submitted_data.get('medicines'):
            self._handle_medicines(
                submitted_data['medicines'], 
                submitted_data['pat_id'], 
                child_health_history.chhist_id, 
                staff_instance
            )
        
        return Response({
            "success": True,
            "message": "Child health record created successfully",
            "patrec_id": patient_record.patrec_id,
            "chrec_id": child_health_record.chrec_id,
            "chhist_id": child_health_history.chhist_id,
            "chvital_id": chvital_id,
            "followv_id": followv_id
        }, status=status.HTTP_201_CREATED)
    
    def _handle_breastfeeding_dates(self, bf_dates, chhist_id):
        """Handle exclusive breastfeeding check dates"""
        chhist = ChildHealth_History.objects.get(chhist_id=chhist_id)
        for date in bf_dates:
            ExclusiveBFCheck.objects.create(
                chhist=chhist,
                ebf_date=date
            )
    
    def _handle_medicines(self, medicines, pat_id, chhist_id, staff_instance):
        """Handle medicine processing in bulk"""
        if not medicines:
            return
        
        # Get patient and child health history instances
        try:
            patient = Patient.objects.get(pat_id=pat_id)
            chhist = ChildHealth_History.objects.get(chhist_id=chhist_id)
        except (Patient.DoesNotExist, ChildHealth_History.DoesNotExist) as e:
            raise Exception(f"Required instance not found: {str(e)}")
        
        # Create single patient record for all medicines
        patient_record = PatientRecord.objects.create(
            pat_id=patient,
            patrec_type="Medicine Record"
        )
        
        # Process each medicine
        for med in medicines:
            minv_id = med.get('minv_id')
            medrec_qty = med.get('medrec_qty', 0)
            reason = med.get('reason', 'Child Health Supplement')
            
            if not minv_id or medrec_qty <= 0:
                continue
            
            try:
                # Get medicine inventory
                medicine_inv = MedicineInventory.objects.select_for_update().get(pk=minv_id)
                
                # Check stock
                if medicine_inv.minv_qty_avail < medrec_qty:
                    raise Exception(f"Insufficient stock for medicine {minv_id}")
                
                # Create medicine record
                medicine_record = MedicineRecord.objects.create(
                    patrec_id=patient_record,
                    minv_id=medicine_inv,
                    medrec_qty=medrec_qty,
                    reason=reason,
                    requested_at=timezone.now(),
                    fulfilled_at=timezone.now(),
                    staff=staff_instance
                )
                
                # Update inventory
                medicine_inv.minv_qty_avail -= medrec_qty
                medicine_inv.save()
                
                # Create transaction
                unit = medicine_inv.minv_qty_unit or 'pcs'
                if unit.lower() == 'boxes':
                    mdt_qty = f"{medrec_qty} pcs"
                else:
                    mdt_qty = f"{medrec_qty} {unit}"
                
                MedicineTransactions.objects.create(
                    mdt_qty=mdt_qty,
                    mdt_action="Deducted",
                    staff=staff_instance,
                    minv_id=medicine_inv
                )
                
                # Create child health supplement relationship
                ChildHealthSupplements.objects.create(
                    chhist=chhist,
                    medrec=medicine_record
                )
                
            except MedicineInventory.DoesNotExist:
                raise Exception(f"Medicine inventory {minv_id} not found")
    
    def _create_supplement_status(self, status_type, status_data, chhist_id, weight):
        """Create supplement status record"""
        chhist = ChildHealth_History.objects.get(chhist_id=chhist_id)
        
        ChildHealthSupplementsStatus.objects.create(
            status_type=status_type,
            date_seen=status_data.get('seen'),
            date_given_iron=status_data.get('given_iron'),
            chhist=chhist,
            birthwt=Decimal(str(weight)) if weight else None,
            date_completed=None
        )
        
        
        
        



class UpdateChildHealthRecordAPIView(APIView):
    """
    API endpoint for updating child health records with all related data
    """
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        data = request.data
        
        # Extract main parameters
        submitted_data = data.get('submittedData', {})
        staff_id = data.get('staff')
        todays_historical_record = data.get('todaysHistoricalRecord', {})
        original_record = data.get('originalRecord', {})
        
        try:
            # Validate required fields
            if not submitted_data.get('pat_id'):
                return Response(
                    {"error": "Patient ID is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if (submitted_data.get('residenceType') == 'Transient' and 
                not submitted_data.get('trans_id')):
                return Response(
                    {"error": "Transient ID is required for transient residents"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get staff instance
            staff_instance = None
            if staff_id:
                try:
                    staff_instance = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {staff_id} not found, continuing without staff")
            
            # Extract existing IDs
            original_chrec_details = original_record.get('chrec_details', {})
            original_patrec_details = original_chrec_details.get('patrec_details', {})
            
            old_chhist = original_record.get('chhist_id')
            old_chrec_id = original_chrec_details.get('chrec_id')
            old_patrec_id = original_patrec_details.get('patrec_id')
            chnotes_id = todays_historical_record.get('chnotes_id')
            
            # Initialize return variables
            patrec_id = old_patrec_id
            chrec_id = old_chrec_id
            current_chhist_id = old_chhist
            chvital_id = None
            followv_id = None
            bmi_id = None
            
            # Check if this is a same-day update or new record
            is_same_day_update = (
                submitted_data.get('created_at') and 
                self._is_same_day(submitted_data['created_at'])
            )
            
            if is_same_day_update:
                result = self._handle_same_day_update(
                    submitted_data, staff_instance, todays_historical_record,
                    original_record, current_chhist_id, chnotes_id,chrec_id
                )
            else:
                result = self._handle_new_record_creation(
                    submitted_data, staff_instance, chrec_id, patrec_id,
                    original_record
                )
                current_chhist_id = result['chhist_id']
                chvital_id = result.get('chvital_id')
                followv_id = result.get('followv_id')
                bmi_id = result.get('bmi_id')
            
            return Response({
                "success": True,
                "message": "Child health record updated successfully",
                "data": {
                    "patrec_id": patrec_id,
                    "chrec_id": chrec_id,
                    "chhist_id": current_chhist_id,
                    "chvital_id": chvital_id,
                    "followv_id": followv_id
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as error:
            print(f"Error updating child health record: {str(error)}")
            return Response({
                "error": f"Failed to update child health record: {str(error)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _is_same_day(self, created_at_str):
        """Check if the created_at date is the same as today"""
        try:
            from datetime import datetime
            created_date = datetime.fromisoformat(created_at_str.replace('Z', '+00:00')).date()
            return created_date == timezone.now().date()
        except:
            return False
    
    def _handle_same_day_update(self, submitted_data, staff_instance, 
                            todays_historical_record, original_record, 
                            current_chhist_id, chnotes_id,chrec_id):
        """Handle updates for same-day records"""
        
        followv_id = None
        
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            vital_sign = submitted_data['vitalSigns'][0]
            
            # Handle follow-up visit
            original_followv_id = todays_historical_record.get('followv_id')
            follow_up_date = vital_sign.get('followUpVisit')
            follow_up_description = vital_sign.get('follov_description')
            is_follow_up_data_present = follow_up_date or follow_up_description
            
            if not original_followv_id and is_follow_up_data_present and not chnotes_id:
                # Create new follow-up visit
                follow_up = FollowUpVisit.objects.create(
                    followv_date=follow_up_date or timezone.now().date(),
                    created_at=timezone.now(),
                    followv_description=follow_up_description or "Follow Up for Child Health",
                    patrec_id=original_record['chrec_details']['patrec_details']['patrec_id'],
                    followv_status="pending"
                )
                followv_id = follow_up.followv_id
                
                # Create child health notes
                ChildHealthNotes.objects.create(
                    chn_notes=vital_sign.get('notes', ''),
                    created_at=timezone.now(),
                    followv_id=followv_id,
                    chhist_id=current_chhist_id,
                    staff=staff_instance
                )

            elif not is_follow_up_data_present and not chnotes_id:
                ChildHealthNotes.objects.create(
                    chn_notes=vital_sign.get('notes', ''),
                    created_at=timezone.now(),
                    followv_id=followv_id,
                    chhist_id=current_chhist_id,
                    staff=staff_instance
                )
                
            elif not original_followv_id and is_follow_up_data_present and chnotes_id:
                # Create new follow-up visit
                follow_up = FollowUpVisit.objects.create(
                    followv_date=follow_up_date or timezone.now().date(),
                    created_at=timezone.now(),
                    followv_description=follow_up_description or "Follow Up for Child Health",
                    patrec_id=original_record['chrec_details']['patrec_details']['patrec_id'],
                    followv_status="pending"
                )
                followv_id = follow_up.followv_id
                
                # Update child health notes with new follow-up ID - FIXED for history tracking
                try:
                    notes_instance = ChildHealthNotes.objects.get(chnotes_id=chnotes_id)
                    notes_instance.chn_notes = vital_sign.get('notes', '')
                    notes_instance.staff = staff_instance
                    notes_instance.followv_id = followv_id
                    notes_instance.save()  # This will trigger Simple History
                except ChildHealthNotes.DoesNotExist:
                    # Fallback: create new notes if existing not found
                    ChildHealthNotes.objects.create(
                        chn_notes=vital_sign.get('notes', ''),
                        created_at=timezone.now(),
                        followv_id=followv_id,
                        chhist_id=current_chhist_id,
                        staff=staff_instance
                    )
        
            else:
                # Update existing notes if different - FIXED for history tracking
                original_notes = todays_historical_record.get('notes')
                submitted_notes = vital_sign.get('notes')
                
                if submitted_notes != original_notes and chnotes_id:
                    try:
                        notes_instance = ChildHealthNotes.objects.get(chnotes_id=chnotes_id)
                        if notes_instance.chn_notes != submitted_notes:
                            notes_instance.chn_notes = submitted_notes or ''
                            notes_instance.staff = staff_instance
                            notes_instance.save()  # This will trigger Simple History
                    except ChildHealthNotes.DoesNotExist:
                        # Create new notes if existing not found
                        ChildHealthNotes.objects.create(
                            chn_notes=submitted_notes or '',
                            created_at=timezone.now(),
                            followv_id=followv_id,
                            chhist_id=current_chhist_id,
                            staff=staff_instance
                        )
        
        # Update child health history status
        ChildHealth_History.objects.filter(chhist_id=current_chhist_id).update(
            status=submitted_data.get('status', 'recorded')
        )
        
        
     
        ChildHealthrecord.objects.filter(chrec_id=chrec_id).update(updated_at=timezone.now())
        self._handle_breastfeeding_dates(submitted_data, current_chhist_id)
        self._handle_medicines(submitted_data, staff_instance, current_chhist_id)
        self._handle_historical_supplement_statuses(submitted_data, original_record)
        return {"success": True}
    
    def _handle_new_record_creation(self, submitted_data, staff_instance, 
                                  chrec_id, patrec_id, original_record):
        """Handle creation of new child health records"""
        
        # Create new child health history
        new_chhist = ChildHealth_History.objects.create(
            created_at=timezone.now(),
            chrec_id=chrec_id,
            status=submitted_data.get('status', 'recorded'),
            tt_status=submitted_data.get('tt_status')
        )
        current_chhist_id = new_chhist.chhist_id
        
        followv_id = None
        bmi_id = None
        chvital_id = None
        
        # Handle follow-up visit if needed
        if (submitted_data.get('vitalSigns') and 
            len(submitted_data['vitalSigns']) > 0 and 
            submitted_data['vitalSigns'][0].get('followUpVisit')):
            
            vital_sign = submitted_data['vitalSigns'][0]
            follow_up = FollowUpVisit.objects.create(
                followv_date=vital_sign['followUpVisit'],
                created_at=timezone.now(),
                followv_description=vital_sign.get('follov_description', 'Follow Up for Child Health'),
                patrec_id=patrec_id,
                followv_status="pending"
            )
            followv_id = follow_up.followv_id
        
        # Create health notes
        notes_text = ""
        if (submitted_data.get('vitalSigns') and 
            len(submitted_data['vitalSigns']) > 0):
            notes_text = submitted_data['vitalSigns'][0].get('notes', '')
        
        ChildHealthNotes.objects.create(
            chn_notes=notes_text,
            created_at=timezone.now(),
            followv_id=followv_id,
            chhist_id=current_chhist_id,
            staff=staff_instance
        )
        
        # Handle vital signs and body measurements
        if (submitted_data.get('vitalSigns') and 
            len(submitted_data['vitalSigns']) == 1):
            
            vital = submitted_data['vitalSigns'][0]
            
            if (not vital.get('chvital_id') and 
                vital.get('date') and 
                submitted_data.get('nutritionalStatus')):
                
                # Create body measurements
                body_measurement = BodyMeasurement.objects.create(
                    height=Decimal(str(vital.get('ht', 0) or 0)),
                    weight=Decimal(str(vital.get('wt', 0) or 0)),
                    wfa=submitted_data['nutritionalStatus'].get('wfa', ''),
                    lhfa=submitted_data['nutritionalStatus'].get('lhfa', ''),
                    wfl=submitted_data['nutritionalStatus'].get('wfh', ''),
                    muac=str(submitted_data['nutritionalStatus'].get('muac', '')),
                    muac_status=submitted_data['nutritionalStatus'].get('muac_status', ''),
                    edemaSeverity=submitted_data.get('edemaSeverity', 'none'),
                    pat_id=submitted_data['pat_id'],
                    remarks=vital.get('remarks', ''),
                    is_opt=vital.get('is_opt', False),
                    staff=staff_instance
                )
                bmi_id = body_measurement.bm_id
        
        # Create vital signs
        if submitted_data.get('vitalSigns', [{}])[0].get('temp'):
            vital_signs = VitalSigns.objects.create(
                vital_temp=submitted_data['vitalSigns'][0]['temp'],
                staff=staff_instance,
                patrec_id=patrec_id
            )
        
        # Create child vital sign relationship
        child_vital = ChildHealthVitalSigns.objects.create(
            vital=vital_signs,
            bm_id=bmi_id,
            chhist_id=current_chhist_id
        )
        chvital_id = child_vital.chvital_id
        
        # Handle additional data
        self._handle_breastfeeding_dates(submitted_data, current_chhist_id)
        self._handle_low_birth_weight(submitted_data, current_chhist_id)
        self._handle_medicines(submitted_data, staff_instance, current_chhist_id)
        self._handle_anemia(submitted_data, current_chhist_id)
        self._handle_historical_supplement_statuses(submitted_data, original_record)
        
        return {
            "chhist_id": current_chhist_id,
            "chvital_id": chvital_id,
            "followv_id": followv_id,
            "bmi_id": bmi_id
        }
    
    def _handle_breastfeeding_dates(self, submitted_data, chhist_id):
        """Handle breastfeeding dates creation"""
        if submitted_data.get('BFdates'):
            for date in submitted_data['BFdates']:
                ExclusiveBFCheck.objects.create(
                    chhist_id=chhist_id,
                    ebf_date=date
                )
    
    def _handle_medicines(self, submitted_data, staff_instance, chhist_id):
        """Handle medicine processing"""
        if not submitted_data.get('medicines'):
            return
        
        for med in submitted_data['medicines']:
            try:
                # Get patient
                patient = Patient.objects.get(pat_id=submitted_data['pat_id'])
                
                # Create patient record
                patient_record = PatientRecord.objects.create(
                    pat_id=patient,
                    patrec_type="Medicine Record"
                )
                
                # Create medicine record
                medicine_record = MedicineRecord.objects.create(
                    patrec_id=patient_record,
                    minv_id_id=med['minv_id'],
                    medrec_qty=med['medrec_qty'],
                    reason=med.get('reason', ''),
                    requested_at=timezone.now(),
                    fulfilled_at=timezone.now(),
                    staff=staff_instance
                )
                
                # Update medicine inventory
                self._update_medicine_inventory(
                    med['minv_id'], 
                    med['medrec_qty'], 
                    staff_instance
                )
                
                # Create child health relationship
                ChildHealthSupplements.objects.create(
                    chhist_id=chhist_id,
                    medrec=medicine_record
                )
                
            except Exception as e:
                print(f"Error processing medicine {med.get('minv_id')}: {str(e)}")
                continue
    
    def _update_medicine_inventory(self, minv_id, quantity, staff_instance):
        """Update medicine inventory and create transaction"""
        try:
            medicine_inv = MedicineInventory.objects.select_for_update().get(pk=minv_id)
            
            if medicine_inv.minv_qty_avail < quantity:
                raise Exception(f"Insufficient stock for medicine {minv_id}")
            
            # Update inventory
            medicine_inv.minv_qty_avail -= quantity
            medicine_inv.save()
            
            # Create transaction record if you have this model
            # Uncomment if you have MedicineTransactions model
            # from apps.inventory.models import MedicineTransactions
            # 
            unit = medicine_inv.minv_qty_unit or 'pcs'
            if medicine_inv.minv_qty_unit and medicine_inv.minv_qty_unit.lower() == 'boxes':
                mdt_qty = f"{quantity} pcs"
            else:
                mdt_qty = f"{quantity} {unit}"
            
            MedicineTransactions.objects.create(
                mdt_qty=mdt_qty,
                mdt_action="Deducted",
                staff=staff_instance,
                minv_id=medicine_inv
            )
            
        except MedicineInventory.DoesNotExist:
            raise Exception(f"Medicine inventory {minv_id} not found")
    
    def _handle_low_birth_weight(self, submitted_data, chhist_id):
        """Handle low birth weight supplement status"""
        if not submitted_data.get('vitalSigns'):
            return
            
        vital_sign = submitted_data['vitalSigns'][0]
        weight = vital_sign.get('wt')
        
        if weight and float(weight) < 2.5:
            birthwt_data = submitted_data.get('birthwt', {})
            if birthwt_data.get('seen') or birthwt_data.get('given_iron'):
                ChildHealthSupplementsStatus.objects.create(
                    status_type='birthwt',
                    date_seen=birthwt_data.get('seen'),
                    date_given_iron=birthwt_data.get('given_iron'),
                    chhist_id=chhist_id,
                    created_at=timezone.now(),
                    birthwt=Decimal(str(weight)),
                    date_completed=None
                )
    
    def _handle_anemia(self, submitted_data, chhist_id):
        """Handle anemia supplement status"""
        anemic_data = submitted_data.get('anemic', {})
        
        if anemic_data.get('is_anemic'):
            weight = 0
            if (submitted_data.get('vitalSigns') and 
                len(submitted_data['vitalSigns']) > 0):
                weight = submitted_data['vitalSigns'][0].get('wt', 0)
            
            ChildHealthSupplementsStatus.objects.create(
                status_type='anemic',
                date_seen=anemic_data.get('seen'),
                date_given_iron=anemic_data.get('given_iron'),
                chhist_id=chhist_id,
                created_at=timezone.now(),
                birthwt=Decimal(str(weight)) if weight else None,
                date_completed=None
            )
    
    def _handle_historical_supplement_statuses(self, submitted_data, original_record):
        """Handle historical supplement status updates"""
        historical_statuses = submitted_data.get('historicalSupplementStatuses', [])
        if not historical_statuses:
            return
        
        original_statuses = original_record.get('supplements_statuses', [])
        
        updates_to_process = []
        
        for status in historical_statuses:
            if not status.get('chssupplementstat_id'):
                continue
            
            # Find original status for comparison
            original_status = next(
                (s for s in original_statuses 
                 if s.get('chssupplementstat_id') == status['chssupplementstat_id']),
                None
            )
            
            # Check if update is needed
            is_new_record = not original_status
            original_date = original_status.get('date_completed') if original_status else None
            submitted_date = status.get('date_completed')
            
            has_changed = (
                original_date != submitted_date and 
                not (original_date is None and submitted_date is None)
            )
            
            if is_new_record or has_changed:
                updates_to_process.append({
                    'chssupplementstat_id': status['chssupplementstat_id'],
                    'date_completed': submitted_date
                })
        
        # Bulk update
        if updates_to_process:
            try:
                for update in updates_to_process:
                    ChildHealthSupplementsStatus.objects.filter(
                        chssupplementstat_id=update['chssupplementstat_id']
                    ).update(
                        date_completed=update['date_completed']
                    )
                    
                print(f"Successfully updated {len(updates_to_process)} supplement status records")
            except Exception as e:
                print(f"Supplement status update failed: {str(e)}")
                raise Exception(f"Failed to update supplement statuses: {str(e)}")