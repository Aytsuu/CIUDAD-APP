# Standard library imports
from collections import defaultdict
from datetime import datetime, timedelta
import logging

# Django imports
from django.db.models import (
   OuterRef, Subquery, Q, Prefetch, Count, Subquery
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
from ..models import *
from ..serializers import *
from ..utils import *
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import * 
from apps.medicalConsultation.utils import apply_patient_type_filter
from apps.maternal.models import Pregnancy





# ======================================================
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
            
            # Validate all date fields before processing
            date_validation_errors = self._validate_date_fields(submitted_data)
            if date_validation_errors:
                return Response({
                    "error": "Invalid date format(s)",
                    "details": date_validation_errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
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
            import traceback
            error_traceback = traceback.format_exc()
            print(f"Error occurred: {str(e)}")
            print(f"Traceback: {error_traceback}")
            
            return Response({
                "error": f"An error occurred: {str(e)}",
                "traceback": error_traceback
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _validate_date_fields(self, submitted_data):
        """Validate all date fields in the submitted data"""
        errors = []
        
        # Check newborn_screening date
        newborn_screening = submitted_data.get('newborn_screening')
        if newborn_screening and self._is_invalid_date(newborn_screening):
            errors.append(f"newborn_screening: Invalid date format '{newborn_screening}'")
        
        # Check vital signs dates
        if submitted_data.get('vitalSigns'):
            for i, vital_sign in enumerate(submitted_data['vitalSigns']):
                # Check followUpVisit date
                follow_up_visit = vital_sign.get('followUpVisit')
                if follow_up_visit and self._is_invalid_date(follow_up_visit):
                    errors.append(f"vitalSigns[{i}].followUpVisit: Invalid date format '{follow_up_visit}'")
                
                # Check date field if exists
                date_field = vital_sign.get('date')
                if date_field and self._is_invalid_date(date_field):
                    errors.append(f"vitalSigns[{i}].date: Invalid date format '{date_field}'")
        
        # Check breastfeeding dates
        bf_dates = submitted_data.get('BFchecks', [])
        for i, date in enumerate(bf_dates):
            if self._is_invalid_date(date):
                errors.append(f"BFchecks[{i}]: Invalid date format '{date}'")
        
        # Check supplement status dates
        birthwt_data = submitted_data.get('birthwt', {})
        if birthwt_data:
            seen_date = birthwt_data.get('seen')
            given_iron_date = birthwt_data.get('given_iron')
            if seen_date and self._is_invalid_date(seen_date):
                errors.append(f"birthwt.seen: Invalid date format '{seen_date}'")
            if given_iron_date and self._is_invalid_date(given_iron_date):
                errors.append(f"birthwt.given_iron: Invalid date format '{given_iron_date}'")
        
        anemic_data = submitted_data.get('anemic', {})
        if anemic_data:
            seen_date = anemic_data.get('seen')
            given_iron_date = anemic_data.get('given_iron')
            if seen_date and self._is_invalid_date(seen_date):
                errors.append(f"anemic.seen: Invalid date format '{seen_date}'")
            if given_iron_date and self._is_invalid_date(given_iron_date):
                errors.append(f"anemic.given_iron: Invalid date format '{given_iron_date}'")
        
        return errors
    
    def _is_invalid_date(self, date_value):
        """Check if date value is invalid"""
        if not date_value or not isinstance(date_value, str):
            return False
        
        invalid_patterns = [
            "NaN-NaN-NaN",
            "Invalid Date",
            "null",
            "undefined"
        ]
        
        return any(pattern in date_value for pattern in invalid_patterns)
    
    def _clean_date_value(self, date_value):
        """Clean date value by converting invalid formats to None"""
        if self._is_invalid_date(date_value):
            return None
        return date_value
    
    def _handle_transient_update(self, submitted_data):
        """Handle transient patient information updates"""
        trans_id = submitted_data.get('trans_id')
        if not trans_id:
            return
        
        try:
            transient = Transient.objects.get(trans_id=trans_id)
            
            # Update transient information
            update_fields = [
                'tran_fname', 'tran_lname', 'tran_mname', 'tran_suffix', 'tran_dob',
                'tran_sex', 'tran_status', 'tran_ed_attainment', 'tran_religion', 'tran_contact',
                'mother_fname', 'mother_lname', 'mother_mname', 'mother_age', 'mother_dob',
                'father_fname', 'father_lname', 'father_mname', 'father_age', 'father_dob'
            ]
            
            for field in update_fields:
                if field in submitted_data:
                    # Clean date fields specifically
                    if field.endswith('_dob') and submitted_data.get(field):
                        cleaned_value = self._clean_date_value(submitted_data.get(field))
                        setattr(transient, field, cleaned_value)
                    else:
                        setattr(transient, field, submitted_data.get(field))
            
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
        
        # Clean newborn_screening date
        newborn_screening = self._clean_date_value(submitted_data.get('newborn_screening'))
        
        pregnancy_instance = None
        # Correct way
        # Get pregnancy instance if provided
        pregnancy_id = submitted_data.get('pregnancy_id')
        pregnancy = None
        if pregnancy_id:
            try:
                pregnancy = Pregnancy.objects.get(pregnancy_id=pregnancy_id)
            except Pregnancy.DoesNotExist:
                raise ValidationError(f"Pregnancy with id {pregnancy_id} does not exist.")

        # Create child health record
        child_health_record = ChildHealthrecord.objects.create(
            ufc_no=submitted_data.get('ufc_no', ''),
            family_no=submitted_data.get('family_no', ''),
            place_of_delivery_type=submitted_data.get('place_of_delivery_type'),
            pod_location=submitted_data.get('pod_location', ''),
            mother_occupation=submitted_data.get('mother_occupation', ''),
            father_occupation=submitted_data.get('father_occupation', ''),
            birth_order=submitted_data.get('birth_order', 0),
            newborn_screening=newborn_screening,
            staff=staff_instance,
            patrec=patient_record,  
            landmarks=submitted_data.get('landmarks'),
            nbscreening_result=submitted_data.get('nbscreening_result'), 
            newbornInitiatedbf=submitted_data.get('newbornInitiatedbf', False),
            pregnancy=pregnancy
        )   
        
        # Create child health history
        # Get the staff instance if selectedStaffId is provided
        # This code might need a check:
        assigned_staff = None
        selected_staff_id = submitted_data.get('selectedStaffId')
        if selected_staff_id:  # This checks for truthy values (not None, not empty string)
            try:
                assigned_staff = Staff.objects.get(staff_id=selected_staff_id)
            except Staff.DoesNotExist:
                print(f"Staff with ID {selected_staff_id} does not exist")
       
        # Create the child health history record
        child_health_history = ChildHealth_History.objects.create(
            chrec=child_health_record,
            status=submitted_data.get('status', 'recorded'),
            tt_status=submitted_data.get('tt_status'),
            assigned_to=assigned_staff
        )
        
        # Handle follow-up visit
        followv_id = None
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            vital_sign = submitted_data['vitalSigns'][0]
            follow_up_visit_date = self._clean_date_value(vital_sign.get('followUpVisit'))
            
            if follow_up_visit_date:
                follow_up_visit = FollowUpVisit.objects.create(
                    followv_date=follow_up_visit_date,
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
        if submitted_data.get('BFchecks'):
            self._handle_breastfeeding_dates(submitted_data['BFchecks'], child_health_history.chhist_id)
        
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
        
        for bf_data in bf_dates:
            # Extract the ebf_date and type_of_feeding from the object
            if isinstance(bf_data, dict):
                date_value = bf_data.get('ebf_date')
                type_of_feeding = bf_data.get('type_of_feeding')
            else:
                # Handle case where it might be just a date string
                date_value = bf_data
                type_of_feeding = None
            
            # Clean date before creating
            cleaned_date = self._clean_date_value(date_value)
            if cleaned_date:
                ExclusiveBFCheck.objects.create(
                    chhist=chhist,
                    ebf_date=cleaned_date,
                    type_of_feeding=type_of_feeding
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
        
        # Clean date fields
        seen_date = self._clean_date_value(status_data.get('seen'))
        given_iron_date = self._clean_date_value(status_data.get('given_iron'))
        
        ChildHealthSupplementsStatus.objects.create(
            status_type=status_type,
            date_seen=seen_date,
            date_given_iron=given_iron_date,
            chhist=chhist,
            birthwt=Decimal(str(weight)) if weight else None,
            date_completed=None
        )
