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
        
        print("SubmittedData", submitted_data)
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
            
            # FIXED: Check if this is a same-day update using existing chhist_id and its creation date
            is_same_day_update = self._is_same_day_update(old_chhist, todays_historical_record)
            
            if is_same_day_update:
                print(f"Processing same-day update for chhist_id: {old_chhist}")
                result = self._handle_same_day_update(
                    submitted_data, staff_instance, todays_historical_record,
                    original_record, current_chhist_id, chnotes_id, chrec_id
                )
            else:
                print(f"Creating new record - not same day or no existing record")
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
    
    def _is_same_day_update(self, chhist_id, todays_historical_record):
        """
        FIXED: Check if we should update existing record instead of creating new one
        - Check if chhist_id exists and was created today (date only, ignore time)
        """
        if not chhist_id:
            return False
            
        try:
            # Check if the chhist record exists and was created today
            chhist_record = ChildHealth_History.objects.get(chhist_id=chhist_id)
            
            # Extract just the date part (ignore time)
            record_date = chhist_record.created_at.date()
            today = timezone.now().date()
            
            is_today = record_date == today
            print(f"Checking chhist_id {chhist_id}: record_date={record_date}, today={today}, is_same_day={is_today}")
            
            return is_today
            
        except ChildHealth_History.DoesNotExist:
            print(f"ChildHealth_History with id {chhist_id} does not exist")
            return False
        except Exception as e:
            print(f"Error checking same day update: {str(e)}")
            return False
    
    def _is_same_day(self, created_at_str):
        """
        DEPRECATED: This method is no longer used but kept for reference
        Check if the created_at date is the same as today
        """
        try:
            from datetime import datetime
            created_date = datetime.fromisoformat(created_at_str.replace('Z', '+00:00')).date()
            return created_date == timezone.now().date()
        except:
            return False
    
    def _handle_same_day_update(self, submitted_data, staff_instance, 
                        todays_historical_record, original_record, 
                        current_chhist_id, chnotes_id, chrec_id):
        """Handle updates for same-day records"""
        
        print(f"Handling same-day update for chhist_id: {current_chhist_id}")
        
        followv_id = None
        chvital_id = None
        bmi_id = None
        
        # NEW: Check if we should use PATCH for immunization status
        passed_status = submitted_data.get('passed_status')
        use_patch = passed_status == 'immunization'
        
        if use_patch:
            print("Using PATCH method for immunization status update")
            return self._handle_patch_update(
                submitted_data, staff_instance, todays_historical_record,
                original_record, current_chhist_id, chnotes_id, chrec_id
            )
        
        # Original same-day update logic (PUT method)
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            vital_sign = submitted_data['vitalSigns'][0]
            
            # Handle body measurements update
            existing_chvital_id = todays_historical_record.get('chvital_id')
            
            # Handle follow-up visit (existing logic)
            original_followv_id = todays_historical_record.get('followv_id')
            follow_up_date = vital_sign.get('followUpVisit')
            follow_up_description = vital_sign.get('follov_description')
            notes_content = vital_sign.get('notes', '').strip()
            
            # Check if there's actual follow-up data
            is_follow_up_data_present = follow_up_date or (follow_up_description and follow_up_description.strip())
            
            # Check if there's actual note content
            has_note_content = notes_content and notes_content != ''
            
            # Only proceed if there's actual content to save
            should_create_or_update_notes = has_note_content or is_follow_up_data_present
            
            if not should_create_or_update_notes:
                # No content to save, skip note creation/update
                print("No note content or follow-up data to save, skipping note operations")
            else:
                # Proceed with note operations only if there's actual content
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
                    
                    # Create child health notes only if there's actual content
                    if has_note_content or is_follow_up_data_present:
                        ChildHealthNotes.objects.create(
                            chn_notes=notes_content,
                            created_at=timezone.now(),
                            followv_id=followv_id,
                            chhist_id=current_chhist_id,
                            staff=staff_instance
                        )

                elif has_note_content and not is_follow_up_data_present and not chnotes_id:
                    # Only create notes if there's actual note content
                    ChildHealthNotes.objects.create(
                        chn_notes=notes_content,
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
                    
                    # Update existing child health notes only if there's content
                    try:
                        notes_instance = ChildHealthNotes.objects.get(chnotes_id=chnotes_id)
                        # Only update if there's actual content or meaningful changes
                        if has_note_content or is_follow_up_data_present:
                            notes_instance.chn_notes = notes_content
                            notes_instance.staff = staff_instance
                            notes_instance.followv_id = followv_id
                            notes_instance.save()  # This will trigger Simple History
                    except ChildHealthNotes.DoesNotExist:
                        # Fallback: create new notes only if there's actual content
                        if has_note_content or is_follow_up_data_present:
                            ChildHealthNotes.objects.create(
                                chn_notes=notes_content,
                                created_at=timezone.now(),
                                followv_id=followv_id,
                                chhist_id=current_chhist_id,
                                staff=staff_instance
                            )
            
                elif chnotes_id:
                    # Update existing notes only if there's meaningful content or changes
                    original_notes = todays_historical_record.get('notes', '').strip()
                    
                    # Check if there's a meaningful difference
                    content_changed = notes_content != original_notes
                    has_meaningful_content = has_note_content or is_follow_up_data_present
                    
                    if content_changed and has_meaningful_content:
                        try:
                            notes_instance = ChildHealthNotes.objects.get(chnotes_id=chnotes_id)
                            notes_instance.chn_notes = notes_content
                            notes_instance.staff = staff_instance
                            notes_instance.save()  # This will trigger Simple History
                            print(f"Updated existing notes: '{notes_content}'")
                        except ChildHealthNotes.DoesNotExist:
                            # Create new notes only if there's actual content
                            if has_meaningful_content:
                                ChildHealthNotes.objects.create(
                                    chn_notes=notes_content,
                                    created_at=timezone.now(),
                                    followv_id=followv_id,
                                    chhist_id=current_chhist_id,
                                    staff=staff_instance
                                )
                    elif not has_meaningful_content and chnotes_id:
                        # If there's no meaningful content but there's an existing note, 
                        # consider if you want to delete it or leave it as is
                        print("No meaningful content to update in existing notes")
        
        # Create child health history
        # Get the staff instance if selectedStaffId is provided
        assigned_staff = None
        selected_staff_id = submitted_data.get('selectedStaffId')
        if selected_staff_id:
            try:
                assigned_staff = Staff.objects.get(staff_id=selected_staff_id)
            except Staff.DoesNotExist:
                raise ValueError(f"Staff with ID {selected_staff_id} does not exist")

        
        # Update child health history status - DON'T CREATE NEW, JUST UPDATE
        ChildHealth_History.objects.filter(chhist_id=current_chhist_id).update(
            status=submitted_data.get('status', 'recorded'),
            assigned_to=assigned_staff
        )
        
        # Update the child health record timestamp
        ChildHealthrecord.objects.filter(chrec_id=chrec_id).update(updated_at=timezone.now())
        
        # Handle other updates (existing logic)
        self._handle_breastfeeding_dates(submitted_data, current_chhist_id, original_record)
        self._handle_medicines(submitted_data, staff_instance, current_chhist_id)
        self._handle_historical_supplement_statuses(submitted_data, original_record)
        
        return {
            "success": True,
            "chvital_id": chvital_id,
            "bmi_id": bmi_id,
            "followv_id": followv_id
        }

    def _handle_patch_update(self, submitted_data, staff_instance, 
                           todays_historical_record, original_record, 
                           current_chhist_id, chnotes_id, chrec_id):
        """Handle PATCH update specifically for immunization status"""
        print("Performing PATCH update for immunization status")
        
        # For PATCH updates, only update specific fields without creating new records
        update_fields = {}
        
        # Update status if provided
        if 'status' in submitted_data:
            update_fields['status'] = submitted_data['status']
        
        # Update assigned staff if provided
        assigned_staff = None
        selected_staff_id = submitted_data.get('selectedStaffId')
        if selected_staff_id:
            try:
                assigned_staff = Staff.objects.get(staff_id=selected_staff_id)
                update_fields['assigned_to'] = assigned_staff
            except Staff.DoesNotExist:
                print(f"Staff with ID {selected_staff_id} not found")
        
        # Only update if there are fields to update
        if update_fields:
            ChildHealth_History.objects.filter(chhist_id=current_chhist_id).update(**update_fields)
            print(f"PATCH updated ChildHealth_History {current_chhist_id} with fields: {list(update_fields.keys())}")
        
        # Update timestamp
        ChildHealthrecord.objects.filter(chrec_id=chrec_id).update(updated_at=timezone.now())
        
        # For PATCH updates, we only handle specific operations:
        # 1. Update supplement statuses if provided
        if 'historicalSupplementStatuses' in submitted_data:
            self._handle_historical_supplement_statuses(submitted_data, original_record)
        
        # 2. Update breastfeeding dates if provided  
        if 'BFchecks' in submitted_data:
            self._handle_breastfeeding_dates(submitted_data, current_chhist_id, original_record)
        
        # 3. Handle medicines if provided (immunization might involve medicine dispensing)
        if 'medicines' in submitted_data:
            self._handle_medicines(submitted_data, staff_instance, current_chhist_id)
        
        # Note: For PATCH, we skip creating new vital signs, notes, or follow-up visits
        # as these are typically not needed for immunization-only updates
        
        return {
            "success": True,
            "chvital_id": None,  # No new vital signs in PATCH
            "bmi_id": None,      # No new BMI in PATCH  
            "followv_id": None   # No new follow-up in PATCH
        }

    def _handle_new_record_creation(self, submitted_data, staff_instance, 
                                chrec_id, patrec_id, original_record):
        """Handle creation of new child health records"""
        # Create child health history
        # Get the staff instance if selectedStaffId is provided
        assigned_staff = None
        selected_staff_id = submitted_data.get('selectedStaffId')
        if selected_staff_id:
            try:
                assigned_staff = Staff.objects.get(staff_id=selected_staff_id)
            except Staff.DoesNotExist:
                raise ValueError(f"Staff with ID {selected_staff_id} does not exist")

        # Create new child health history
        new_chhist = ChildHealth_History.objects.create(
            created_at=timezone.now(),
            chrec_id=chrec_id,
            status=submitted_data.get('status', 'recorded'),
            tt_status=submitted_data.get('tt_status'),
            assigned_to=assigned_staff
        )
        current_chhist_id = new_chhist.chhist_id
        
        followv_id = None
        bmi_id = None
        chvital_id = None
        
        # Get notes and follow-up data
        notes_text = ""
        follow_up_date = None
        follow_up_description = None
        
        if (submitted_data.get('vitalSigns') and 
            len(submitted_data['vitalSigns']) > 0):
            vital_sign = submitted_data['vitalSigns'][0]
            notes_text = vital_sign.get('notes', '').strip()
            follow_up_date = vital_sign.get('followUpVisit')
            follow_up_description = vital_sign.get('follov_description', '').strip()
        
        # Handle follow-up visit if there's actual follow-up data
        has_follow_up_data = follow_up_date or follow_up_description
        if has_follow_up_data:
            follow_up = FollowUpVisit.objects.create(
                followv_date=follow_up_date or timezone.now().date(),
                created_at=timezone.now(),
                followv_description=follow_up_description or 'Follow Up for Child Health',
                patrec_id=patrec_id,
                followv_status="pending"
            )
            followv_id = follow_up.followv_id
        
        # Only create notes if there's actual content (notes or follow-up data)
        has_note_content = notes_text and notes_text != ''
        should_create_notes = has_note_content or has_follow_up_data
        
        if should_create_notes:
            ChildHealthNotes.objects.create(
                chn_notes=notes_text,
                created_at=timezone.now(),
                followv_id=followv_id,
                chhist_id=current_chhist_id,
                staff=staff_instance
            )
            print(f"Created notes with content: '{notes_text}' and follow-up: {bool(followv_id)}")
        else:
            print("No notes created - no meaningful content provided")
        
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
        
        # Handle vital signs creation and child vital sign relationship properly
        if (submitted_data.get('vitalSigns', [{}])[0].get('temp')):
            # Create vital signs
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
        

        
    def _handle_breastfeeding_dates(self, submitted_data, chhist_id, original_record=None):
        """
        Handle breastfeeding dates creation and updates
        - Creates new BF checks for newly added dates
        - Updates existing BF checks if they've changed
        """
        submitted_bf_checks = submitted_data.get('BFchecks', [])
        
        if not submitted_bf_checks:
            return
        
        print(f"Processing {len(submitted_bf_checks)} BF checks for chhist_id: {chhist_id}")
        
        # Process submitted BF checks
        for bf_check in submitted_bf_checks:
            ebf_id = bf_check.get('ebf_id')
            ebf_date = bf_check.get('ebf_date')
            chhist = bf_check.get('chhist')  # Note: using 'chhist' not 'chhist_id'
            type_of_feeding = bf_check.get('type_of_feeding')  
            if not ebf_date:
                print(f"Skipping BF check {ebf_id} - no ebf_date provided")
                continue
                
            if ebf_id:
                # This is an existing BF check - try to update it
                try:
                    # First check if the record exists and get current data
                    existing_bf = ExclusiveBFCheck.objects.filter(ebf_id=ebf_id).first()
                    
                    if existing_bf:
                        # Check if the date has actually changed
                        if existing_bf.ebf_date != ebf_date:
                            # Update the existing record
                            ExclusiveBFCheck.objects.filter(ebf_id=ebf_id).update(
                                ebf_date=ebf_date,
                                type_of_feeding=type_of_feeding
                            )
                            print(f"Updated BF check {ebf_id}: {existing_bf.ebf_date} -> {ebf_date}")
                        else:
                            print(f"BF check {ebf_id} date unchanged: {ebf_date}")
                   
                except Exception as e:
                    print(f"Error handling BF check {ebf_id}: {str(e)}")
                    continue
            else:
                # This is a new BF check - create it
                try:
                    # Check if a BF check with this date already exists for this chhist_id
                    existing_check = ExclusiveBFCheck.objects.filter(
                        chhist_id=chhist_id,
                        ebf_date=ebf_date,
                        type_of_feeding=type_of_feeding
                    ).first()
                    
                    if existing_check:
                        print(f"BF check for date {ebf_date} already exists with ID {existing_check.ebf_id}")
                    else:
                        new_bf_check = ExclusiveBFCheck.objects.create(
                            chhist_id=chhist_id,
                            ebf_date=ebf_date,
                            type_of_feeding=type_of_feeding
                            
                        )
                        print(f"Created new BF check {new_bf_check.ebf_id} with date: {ebf_date}")
                        
                except Exception as e:
                    print(f"Error creating new BF check for date {ebf_date}: {str(e)}")
                    continue

        
    def _handle_medicines(self, submitted_data, staff_instance, chhist_id):
        """Handle medicine processing using MedicineRequest and MedicineRequestItem"""
        medicines = submitted_data.get('medicines', [])
        if not medicines:
            return

        try:
            # Get patient
            patient = Patient.objects.get(pat_id=submitted_data['pat_id'])
        except Patient.DoesNotExist:
            print(f"Patient with ID {submitted_data['pat_id']} not found")
            return

        # Create PatientRecord
        patient_record = PatientRecord.objects.create(
            pat_id=patient,
            patrec_type="Medicine Request",
        )
        rp_id = patient.rp_id if patient.rp_id else None
        trans_id = patient.trans_id if patient.trans_id else None

        # Create MedicineRequest
        med_request = MedicineRequest.objects.create(
            mode='walk-in',
            signature=None,
            requested_at=timezone.now(),
            fulfilled_at=timezone.now(),
            patrec=patient_record,
            rp_id=rp_id,
            trans_id=trans_id,
        )

        # Group medicines by med_id (from MedicineInventory FK)
        medid_to_allocations = {}
        for med in medicines:
            minv_id = med.get('minv_id')
            if not minv_id:
                continue
            try:
                minv = MedicineInventory.objects.get(minv_id=minv_id)
                med_id = minv.med_id  # FK object, not string
            except MedicineInventory.DoesNotExist:
                print(f"Medicine inventory with ID {minv_id} not found")
                continue
            if med_id not in medid_to_allocations:
                medid_to_allocations[med_id] = []
            medid_to_allocations[med_id].append({
                'minv': minv,
                'medrec_qty': med.get('medrec_qty', 0),
                'reason': med.get('reason', ''),
            })

        # Create MedicineRequestItem and MedicineAllocation
        for med_obj, allocations in medid_to_allocations.items():
            reason = allocations[0].get('reason', 'Medicine allocation')
            medicine_item = MedicineRequestItem.objects.create(
                reason=reason,
                med=med_obj,
                medreq_id=med_request,
                status='completed',
                action_by=staff_instance,
                completed_by=staff_instance,
            )
            for alloc in allocations:
                minv = alloc['minv']
                medrec_qty = alloc['medrec_qty']
                if minv and medrec_qty > 0:
                    try:
                        self._update_medicine_inventory(
                            minv.minv_id,
                            medrec_qty,
                            staff_instance
                        )
                    except Exception as e:
                        print(f"Error updating inventory for {minv.minv_id}: {str(e)}")
                        continue
                    allocation = MedicineAllocation.objects.create(
                        medreqitem=medicine_item,
                        minv=minv,
                        allocated_qty=medrec_qty
                    )
                    # Link to child health supplements
                    ChildHealthSupplements.objects.create(
                        chhist_id=chhist_id,
                        medreqitem=medicine_item
                            )

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
     
     
        
      