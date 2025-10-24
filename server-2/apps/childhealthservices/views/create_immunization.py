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



      
      
# CHILD IMMUNIZAION  
class SaveImmunizationDataAPIView(APIView):
    
    def post(self, request):
        """
        Handle saving immunization data with rollback on error
        """
        try:
            data = request.data
            
            # Extract parameters
            form_data = data.get('data', {})
            vaccines = data.get('vaccines', [])
            existing_vaccines = data.get('existingVaccines', [])
            child_health_record = data.get('ChildHealthRecord', {})
            staff_id = data.get('staff_id')
            pat_id = data.get('pat_id')
            vital_id=data.get('vital_id')
            
            # Validation
            if not pat_id:
                return Response(
                    {"error": "Patient ID is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if there's anything to process
            has_vaccines = len(vaccines) > 0
            has_existing_vaccines = len(existing_vaccines) > 0
            has_notes = bool(form_data.get('notes', '').strip())
            has_follow_up = bool(form_data.get('followUpVisit', '').strip())
            
            if not (has_vaccines or has_existing_vaccines or has_notes or has_follow_up):
                return Response(
                    {"message": "No changes have been made"}, 
                    status=status.HTTP_200_OK
                )
            
            # Start transaction with savepoint
            with transaction.atomic():
                created_records = self.save_immunization_data(
                    form_data, vaccines, existing_vaccines, 
                    child_health_record, staff_id, pat_id,vital_id
                )
                
                return Response({
                    "message": "Immunization data saved successfully",
                    "created_records": created_records
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {"error": f"Failed to save immunization data: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def save_immunization_data(self, form_data, vaccines, existing_vaccines, child_health_record, staff_id, pat_id,vital_id):
        """
        Save immunization data with proper transaction handling
        """
        created_records = {
            'patrec_ids': [],
            'vacrec_ids': [],
            'vachist_ids': [],
            'imt_ids': [],
            'followv_ids': [],
            'antigen_transaction_ids': [],
            'notes_updated': False
        }
        
        # Get required data
        chhist_id = child_health_record.get('record', {}).get('chhist_id')
        patrec_id = child_health_record.get('record', {}).get('chrec_details', {}).get('patrec_details', {}).get('patrec_id')
        
        if not chhist_id:
            raise ValueError("Child health history ID is required")
        
        # Get staff instance if provided
        staff_instance = None
        if staff_id:
            try:
                staff_instance = Staff.objects.get(staff_id=staff_id)
            except Staff.DoesNotExist:
                raise ValueError(f"Staff with ID {staff_id} not found")
        
        # Get child health history instance
        try:
            chhist_instance = ChildHealth_History.objects.get(chhist_id=chhist_id)
        except ChildHealth_History.DoesNotExist:
            raise ValueError(f"Child health history with ID {chhist_id} not found")
        
        # Handle follow-up visit creation if needed
        followv_instance = None
        if form_data.get('followUpVisit', '').strip() or form_data.get('follov_description', '').strip():
            if not patrec_id:
                raise ValueError("Patient record ID is required for follow-up visit")
            
            try:
                patrec_instance = PatientRecord.objects.get(patrec_id=patrec_id)
                followv_instance = FollowUpVisit.objects.create(
                    followv_date=self.parse_date(form_data.get('followUpVisit')),
                    followv_description=form_data.get('follov_description', 'Vaccination Follow-up'),
                    patrec=patrec_instance,
                    followv_status='pending'
                )
                created_records['followv_ids'].append(followv_instance.followv_id)
            except PatientRecord.DoesNotExist:
                raise ValueError(f"Patient record with ID {patrec_id} not found")
        
        # Handle notes creation/update
        if form_data.get('notes', '').strip():
            self.handle_notes(
                chhist_instance, 
                form_data.get('notes'), 
                followv_instance, 
                staff_instance,
                created_records
            )
        
        # Process new vaccines
        for vaccine in vaccines:
            self.process_new_vaccine(
                vaccine, child_health_record, staff_instance, 
                pat_id, patrec_id, chhist_instance, created_records,vital_id
            )
        
        # Process existing vaccines
        for existing_vaccine in existing_vaccines:
            self.process_existing_vaccine(
                existing_vaccine, child_health_record, staff_instance, 
                pat_id, chhist_instance, created_records,vital_id
            )
        
        # Update child health history status
        chhist_instance.status = 'recorded'
        chhist_instance.save()
        
        return created_records
    
    def handle_notes(self, chhist_instance, notes_text, followv_instance, staff_instance, created_records):
        """
        Handle notes creation or update
        """
        # Check if notes already exist for this child health history
        existing_notes = ChildHealthNotes.objects.filter(chhist=chhist_instance).first()
        
        if existing_notes:
            # Update existing notes
            existing_notes.chn_notes = notes_text
            if followv_instance:
                existing_notes.followv = followv_instance
            if staff_instance:
                existing_notes.staff = staff_instance
            existing_notes.save()
            created_records['notes_updated'] = True
        else:
            # Create new notes
            ChildHealthNotes.objects.create(
                chn_notes=notes_text,
                chhist=chhist_instance,
                followv=followv_instance,
                staff=staff_instance
            )
    
    def process_new_vaccine(self, vaccine, child_health_record, staff_instance, pat_id, patrec_id, chhist_instance, created_records,vital_id):
        """
        Process a new vaccine administration
        """
        # Handle existing follow-up update if needed
        if vaccine.get('existingFollowvId'):
            try:
                existing_followv = FollowUpVisit.objects.get(followv_id=vaccine['existingFollowvId'])
                existing_followv.followv_status = 'completed'
                existing_followv.completed_at = date.today()
                existing_followv.save()
            except FollowUpVisit.DoesNotExist:
                pass
        
        # Get vaccine stock data
        vaccine_stock = None
        if vaccine.get('vacStck_id'):
            try:
                vaccine_stock = VaccineStock.objects.get(vacStck_id=vaccine['vacStck_id'])
            except VaccineStock.DoesNotExist:
                raise ValueError(f"Vaccine stock with ID {vaccine['vacStck_id']} not found")
        
        vaccine_type = vaccine_stock.vac_id.vac_type_choices if vaccine_stock else 'routine'
        current_dose = int(vaccine.get('dose', 1))
        total_doses = int(vaccine.get('totalDoses', 1))
        
        # Update vaccine stock if needed
        if vaccine_stock:
            if vaccine_stock.vacStck_qty_avail <= 0:
                raise ValueError(f"Insufficient vaccine stock for {vaccine_stock.vac_id.vac_name}")
            
            vaccine_stock.vacStck_qty_avail -= 1
            vaccine_stock.save()
            
            # Create antigen transaction
            antigen_transaction = AntigenTransaction.objects.create(
                antt_qty='1',
                antt_action='dispensed',
                vacStck_id=vaccine_stock,
                staff=staff_instance
            )
            created_records['antigen_transaction_ids'].append(antigen_transaction.antt_id)
        
        # Create new records if needed
        vacrec_id = vaccine.get('vacrec')
        if (vaccine_type != 'routine' and current_dose == 1) or not vacrec_id:
            # Create patient record
            patient_instance = get_object_or_404(Patient, pat_id=pat_id)
            patient_record = PatientRecord.objects.create(
                pat_id=patient_instance,
                patrec_type='Vaccination Record',
                # Note: staff field doesn't exist in PatientRecord model based on your schema
            )
            created_records['patrec_ids'].append(patient_record.patrec_id)
            
            # Create vaccination record
            vaccination_record = VaccinationRecord.objects.create(
                patrec_id=patient_record,
                vacrec_totaldose=total_doses
            )
            created_records['vacrec_ids'].append(vaccination_record.vacrec_id)
            vacrec_id = vaccination_record.vacrec_id
        else:
            vaccination_record = get_object_or_404(VaccinationRecord, vacrec_id=vacrec_id)
        
        # Handle follow-up for vaccine
        vaccine_followv_instance = None
        is_routine = vaccine_type == 'routine'
        is_last_dose = current_dose >= total_doses
        
        if vaccine.get('nextFollowUpDate') and (is_routine or not is_last_dose):
            if not patrec_id:
                raise ValueError("Patient record ID is required for vaccine follow-up")
            
            patrec_instance = get_object_or_404(PatientRecord, patrec_id=patrec_id)
            vaccine_followv_instance = FollowUpVisit.objects.create(
                followv_date=self.parse_date(vaccine.get('nextFollowUpDate')),
                followv_description=f"{vaccine.get('vac_name', 'Vaccine')} Follow-up",
                patrec=patrec_instance,
                followv_status='pending'
            )
            created_records['followv_ids'].append(vaccine_followv_instance.followv_id)
        
        # Get vital signs
        vital_instance = None
        vital_signs = vital_id
        if vital_signs :
            try:
                vital_instance = VitalSigns.objects.get(vital_id=vital_id)
            except VitalSigns.DoesNotExist:
                pass
        
        # Create vaccination history
        vaccination_history = VaccinationHistory.objects.create(
            vacrec=vaccination_record,
            vacStck_id=vaccine_stock,
            vachist_doseNo=current_dose,
            vachist_status='completed',
            vital=vital_instance,
            staff=staff_instance,
            followv=vaccine_followv_instance,
            date_administered=self.parse_date(vaccine.get('date')) or date.today()
        )
        created_records['vachist_ids'].append(vaccination_history.vachist_id)
        
        # Create immunization record
        immunization_record = ChildHealthImmunizationHistory.objects.create(
            vachist=vaccination_history,
            chhist=chhist_instance,
            hasExistingVaccination=False
        )
        created_records['imt_ids'].append(immunization_record.imt_id)
    
    def process_existing_vaccine(self, existing_vaccine, child_health_record, staff_instance, pat_id, chhist_instance, created_records,vital_id):
        """
        Process an existing vaccine record
        """
        vaccine_type = existing_vaccine.get('vaccineType', 'routine')
        current_dose = int(existing_vaccine.get('dose', 1))
        total_doses = int(existing_vaccine.get('totalDoses', 1))
        
        # Create new records if needed
        vacrec_id = existing_vaccine.get('vacrec')
        if (vaccine_type != 'routine' and current_dose == 1) or not vacrec_id:
            # Create patient record
            patient_instance = get_object_or_404(Patient, pat_id=pat_id)
            patient_record = PatientRecord.objects.create(
                pat_id=patient_instance,
                patrec_type='Vaccination Record'
            )
            created_records['patrec_ids'].append(patient_record.patrec_id)
            
            # Create vaccination record
            vaccination_record = VaccinationRecord.objects.create(
                patrec_id=patient_record,
                vacrec_totaldose=total_doses
            )
            created_records['vacrec_ids'].append(vaccination_record.vacrec_id)
            vacrec_id = vaccination_record.vacrec_id
        else:
            vaccination_record = get_object_or_404(VaccinationRecord, vacrec_id=vacrec_id)
        
        #
        
        # Get vaccine list instance
        vaccine_instance = None
        if existing_vaccine.get('vac_id'):
            try:
                from apps.inventory.models import VaccineList
                vaccine_instance = VaccineList.objects.get(vac_id=existing_vaccine['vac_id'])
            except:
                pass
        
        # Create vaccination history
        vaccination_history = VaccinationHistory.objects.create(
            vacrec=vaccination_record,
            vac=vaccine_instance,
            vachist_doseNo=current_dose,
            vachist_status='completed',
            vital=None,
            staff=staff_instance,
            followv=None,
            date_administered=self.parse_date(existing_vaccine.get('date')) or date.today()
        )
        created_records['vachist_ids'].append(vaccination_history.vachist_id)
        
        # Create immunization record
        immunization_record = ChildHealthImmunizationHistory.objects.create(
            vachist=vaccination_history,
            chhist=chhist_instance,
            hasExistingVaccination=True
        )
        created_records['imt_ids'].append(immunization_record.imt_id)
    
    def parse_date(self, date_string):
        """
        Parse date string to date object
        """
        if not date_string:
            return None
        
        try:
            if isinstance(date_string, str):
                return datetime.strptime(date_string, '%Y-%m-%d').date()
            return date_string
        except ValueError:
            return None