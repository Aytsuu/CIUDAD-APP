from apps.patientrecords.models import Spouse
from apps.patientrecords.serializers.patients_serializers import *
from apps.maternal.models import Pregnancy, Prenatal_Form
from apps.maternal.serializers.serializer import *
from apps.familyplanning.models import FP_Record


def check_medical_records_for_spouse(self, obj):
    try:
        # query Family Planning with spouse
        family_planning_with_spouse = FP_Record.objects.filter(
            patrec_id__pat_id=obj,
            spouse_id__isnull=False
        ).select_related('spouse_id').order_by('-created_at').first()
        
        if family_planning_with_spouse and family_planning_with_spouse.spouse_id:
            return {
                'spouse_exists': True,
                'spouse_source': 'familyplanning_record',
                'spouse_info': SpouseSerializer(family_planning_with_spouse.spouse_id, context=self.context).data
            }

        # query PostpartumRecord with spouse
        postpartum_with_spouse = PostpartumRecord.objects.filter(
            patrec_id__pat_id=obj,
            spouse_id__isnull=False
        ).select_related('spouse_id').order_by('-created_at').first()
        
        if postpartum_with_spouse and postpartum_with_spouse.spouse_id:
            return {
                'spouse_exists': True,
                'spouse_source': 'postpartum_record',
                'spouse_info': SpouseSerializer(postpartum_with_spouse.spouse_id, context=self.context).data
            }
        
        # query Prenatal_Form with spouse
        prental_with_spouse = Prenatal_Form.objects.filter(
            patrec_id__pat_id=obj,
            spouse_id__isnull=False
        ).select_related('spouse_id').order_by('-created_at').first()
        
        if prental_with_spouse and prental_with_spouse.spouse_id:
            return {
                'spouse_exists': True,
                'spouse_source': 'prenatal_form',
                'spouse_info': SpouseSerializer(prental_with_spouse.spouse_id, context=self.context).data
            }
        
        # No spouse found in medical records
        return {
            'spouse_exists': False,
            'allow_spouse_insertion': True,
            'reason': 'No spouse found in family composition or medical records'
        }

    except Exception as e:
        print(f"Error checking medical records for spouse: {str(e)}")
        return {
            'spouse_exists': False,
            'allow_spouse_insertion': True,
            'reason': f'Error in medical records check: {str(e)}'
        }


def handle_spouse_logic(patient, spouse_data):
    if not spouse_data:
        return None
    
    patient_serializer = PatientSerializer(patient)
    spouse_info = patient_serializer.get_spouse_info(patient)
    
    print(f"Spouse info for patient {patient.pat_id}: {spouse_info}")
    
    # check if spouse exists (either in family composition or medical records)
    if spouse_info.get('spouse_exists', False):
        spouse_source = spouse_info.get('spouse_source', '')
        existing_spouse_info = spouse_info.get('spouse_info', {})
        
        if spouse_source == 'family_composition':
            # if father exists in family composition, don't create spouse
            print("Father exists in family composition, not creating spouse")
            return None
        
        elif spouse_source in ['prenatal_form', 'postpartum_record']:
            # existing spouse in medical records
            spouse_id = existing_spouse_info.get('spouse_id')
            if spouse_id:
                existing_spouse = Spouse.objects.get(spouse_id=spouse_id)
                print(f"Using existing spouse from {spouse_source}: {existing_spouse.spouse_id}")
                return existing_spouse
    
    # check if spouse insertion is allowed
    if spouse_info.get('allow_spouse_insertion', False):
        print(f"Creating new spouse. Reason: {spouse_info.get('reason', 'Unknown')}")
        return Spouse.objects.create(**spouse_data)
    else:
        print("Spouse insertion not allowed")
        return None
    


def calculate_missed_visits(pregnancy_id, current_aog_weeks=None, current_aog_days=0):
    """
    Calculate missed visits based on prenatal visit guidelines for a specific pregnancy
    
    Logic:
    1. Look at existing prenatal forms for this pregnancy
    2. Use their ORIGINAL AOG data to determine completed visits
    3. Use current AOG input only to determine how many visits should have happened by now
    4. DO NOT recalculate existing form AOGs
    """
    try:
        # Get specific pregnancy by ID
        pregnancy = Pregnancy.objects.get(pregnancy_id=pregnancy_id)
        
        # Get all prenatal forms for this specific pregnancy ordered by creation date
        prenatal_forms = Prenatal_Form.objects.filter(
            pregnancy_id=pregnancy
        ).select_related('followv_id').order_by('created_at')
        
        if not prenatal_forms.exists():
            return {
                'error': 'No prenatal forms found for this pregnancy',
                'missed_visits': 0,
                'expected_visits': 0,
                'actual_visits': 0,
                'visit_breakdown': [],
                'pregnancy_id': pregnancy_id
            }
        
        # Process prenatal forms - KEEP ORIGINAL AOG DATA
        processed_forms = process_prenatal_forms_preserve_original_aog(prenatal_forms)
        
        # Use current AOG input to determine expected visits (if provided)
        if current_aog_weeks and current_aog_weeks > 0:
            current_weeks = current_aog_weeks + (current_aog_days / 7)
        else:
            # Fallback: use highest AOG from existing forms
            max_aog_weeks = 0
            for form_data in processed_forms:
                if form_data['aog_weeks']:
                    max_aog_weeks = max(max_aog_weeks, form_data['aog_weeks'])
            current_weeks = max_aog_weeks + (current_aog_days / 7)
        
        if current_weeks == 0:
            return {
                'error': 'No AOG data available to calculate visits',
                'missed_visits': 0,
                'expected_visits': 0,
                'actual_visits': 0,
                'visit_breakdown': [],
                'pregnancy_id': pregnancy_id
            }
        
        # Calculate expected visits based on current AOG
        expected_visits = calculate_expected_visits_by_week(current_weeks)
        
        # Get detailed breakdown with actual visit tracking
        visit_breakdown = get_visit_breakdown_with_original_forms(
            current_weeks, 
            processed_forms
        )
        
        # Count actual completed visits from the breakdown
        actual_visits = len([visit for visit in visit_breakdown if visit['status'] == 'completed'])
        
        # Calculate missed visits
        missed_visits = max(0, expected_visits - actual_visits)
        
        # Get first visit info from original data
        first_form = processed_forms[0] if processed_forms else None
        first_visit_week = first_form['aog_weeks'] if first_form and first_form['aog_weeks'] else 0
        first_visit_month = get_pregnancy_month_at_week(first_visit_week) if first_visit_week else 0
        
        # Create JSON-safe debug data
        debug_forms = []
        for form_data in processed_forms:
            debug_forms.append({
                'pf_id': form_data['pf_id'],
                'created_at': form_data['created_at'].strftime('%Y-%m-%d'),
                'aog_weeks': form_data['aog_weeks'],
                'aog_days': form_data['aog_days'],
                'followup_status': form_data['followup_status']
            })
        
        return {
            'pregnancy_id': pregnancy_id,
            'patient_id': pregnancy.pat_id.pat_id,
            'current_aog_weeks': int(current_weeks),
            'current_aog_days': int((current_weeks % 1) * 7),
            'expected_visits': expected_visits,
            'actual_visits': actual_visits,
            'missed_visits': missed_visits,
            'visit_breakdown': visit_breakdown,
            'first_visit_month': first_visit_month,
            'first_visit_week': first_visit_week,
            'processed_forms_debug': debug_forms,
            'calculation_method': 'original_aog_preserved'
        }
        
    except Pregnancy.DoesNotExist:
        return {
            'error': f'Pregnancy with ID {pregnancy_id} not found',
            'missed_visits': 0,
            'expected_visits': 0,
            'actual_visits': 0,
            'visit_breakdown': [],
            'pregnancy_id': pregnancy_id
        }
    except Exception as e:
        return {
            'error': f'Error calculating missed visits: {str(e)}',
            'missed_visits': 0,
            'expected_visits': 0,
            'actual_visits': 0,
            'visit_breakdown': [],
            'pregnancy_id': pregnancy_id
        }


def process_prenatal_forms_preserve_original_aog(prenatal_forms):
    """
    Process prenatal forms but PRESERVE their original AOG data
    DO NOT recalculate or modify existing AOG values
    """
    processed_forms = []
    forms_list = list(prenatal_forms)
    
    # Convert forms to list with ORIGINAL data preserved
    for i, pf in enumerate(forms_list):
        processed_forms.append({
            'pf_id': pf.pf_id,
            'created_at': pf.created_at.date(),
            'aog_weeks': getattr(pf, 'pf_aog_weeks', None),  # Keep original AOG
            'aog_days': getattr(pf, 'pf_aog_days', None),   # Keep original AOG
            'followup_status': get_followup_status(pf),
        })
    
    return processed_forms


def get_followup_status(prenatal_form):
    """Get follow-up status from prenatal form"""
    try:
        if hasattr(prenatal_form, 'followv_id') and prenatal_form.followv_id:
            followup = prenatal_form.followv_id
            if hasattr(followup, 'followv_status'):
                return followup.followv_status.lower()
        return 'completed'  # Default if no follow-up record
    except:
        return 'completed'


def calculate_expected_visits_by_week(current_weeks):
    """
    Calculate expected number of visits based on current AOG weeks
    
    Fixed logic:
    - Months 1-6 (Weeks 4-28): Monthly visits = 6 visits total (weeks 4, 8, 12, 16, 20, 24)
    - Months 7-8 (Weeks 28+): Bi-weekly visits 
    """
    expected = 0
    
    if current_weeks >= 4:  # Prenatal care typically starts at week 4
        # Monthly visits (weeks 4-24): every 4 weeks = 6 visits
        if current_weeks <= 28:
            # Calculate how many 4-week intervals have passed since week 4
            weeks_since_start = current_weeks - 4
            expected = int(weeks_since_start // 4) + 1  # +1 for the visit at week 4
        else:
            # All monthly visits completed (6 total: weeks 4, 8, 12, 16, 20, 24)
            expected = 6
            
            # Bi-weekly visits start at week 28
            if current_weeks > 28:
                weeks_in_biweekly = current_weeks - 28
                biweekly_visits = int(weeks_in_biweekly // 2) + 1  # +1 for week 28 visit
                expected += biweekly_visits
                
                # Weekly visits (weeks 36-40): every week
                if current_weeks > 36:
                    weeks_in_weekly = min(current_weeks - 36, 5)  # Cap at 5 weeks max
                    weekly_visits = int(weeks_in_weekly)
                    expected += weekly_visits
    
    return expected


def get_visit_breakdown_with_original_forms(current_weeks, processed_forms):
    """
    Get detailed breakdown using ORIGINAL form AOG data
    """
    breakdown = []
    
    # Create a list of all expected visit weeks based on guidelines
    expected_visit_weeks = []
    
    # Monthly visits (weeks 4-24): every 4 weeks = 6 visits
    for week in range(4, min(int(current_weeks) + 1, 25), 4):  # Changed to 25 (up to week 24)
        expected_visit_weeks.append({
            'week': week,
            'period': 'Monthly',
            'month': get_pregnancy_month_at_week(week)
        })
    
    # Bi-weekly visits start at week 28 (if current weeks > 28)
    if current_weeks > 28:
        # Add week 28 as first bi-weekly visit
        expected_visit_weeks.append({
            'week': 28,
            'period': 'Bi-weekly',
            'month': get_pregnancy_month_at_week(28)
        })
        
        # Then continue with bi-weekly (every 2 weeks from week 30)
        for week in range(30, min(int(current_weeks) + 1, 37), 2):  
            expected_visit_weeks.append({
                'week': week,
                'period': 'Bi-weekly', 
                'month': get_pregnancy_month_at_week(week)
            })
    
    # Weekly visits (weeks 36-40): every week
    if current_weeks > 36:
        for week in range(37, min(int(current_weeks) + 1, 41)):  
            expected_visit_weeks.append({
                'week': week,
                'period': 'Weekly',
                'month': get_pregnancy_month_at_week(week)
            })
    
    # Now check each expected visit against ORIGINAL prenatal forms
    for expected_visit in expected_visit_weeks:
        visit_status = check_visit_status_with_original_aog(expected_visit, processed_forms)
        breakdown.append(visit_status)
    
    return breakdown


def check_visit_status_with_original_aog(expected_visit, processed_forms):
    """
    Check if an expected visit was completed using ORIGINAL form AOG data
    """
    expected_week = expected_visit['week']
    period = expected_visit['period']
    month = expected_visit['month']
    
    # Look for a processed form that matches this expected visit
    matching_visit = None
    tolerance_weeks = 2 if period == 'Monthly' else (1 if period == 'Bi-weekly' else 0.5)
    
    for form_data in processed_forms:
        # Only use forms that have ORIGINAL AOG data
        if form_data['aog_weeks'] is not None and form_data['aog_weeks'] > 0:
            # Check if this form's ORIGINAL AOG is within tolerance of expected visit week
            if abs(form_data['aog_weeks'] - expected_week) <= tolerance_weeks:
                matching_visit = form_data
                break
    
    if matching_visit:
        return {
            'period': period,
            'expected_week': expected_week,
            'expected_month': month,
            'actual_visit': {
                'pf_id': matching_visit['pf_id'],
                'date': matching_visit['created_at'].strftime('%Y-%m-%d'),
                'aog_weeks': matching_visit['aog_weeks'],
                'aog_days': matching_visit['aog_days'],
                'followup_status': matching_visit['followup_status']
            },
            'status': matching_visit['followup_status'] if matching_visit['followup_status'] in ['completed', 'missed', 'pending'] else 'completed'
        }
    else:
        # No matching prenatal form found - this visit was missed
        return {
            'period': period,
            'expected_week': expected_week,
            'expected_month': month,
            'actual_visit': None,
            'status': 'missed'
        }


def get_pregnancy_month_at_week(weeks):
    """
    Calculate which month of pregnancy based on weeks
    
    Pregnancy months are typically counted as:
    - Month 1: Weeks 1-4
    - Month 2: Weeks 5-8  
    - Month 3: Weeks 9-12
    - Month 4: Weeks 13-16
    - Month 5: Weeks 17-20
    - Month 6: Weeks 21-24
    - Month 7: Weeks 25-28
    - Month 8: Weeks 29-32
    - Month 9: Weeks 33-36
    - Month 10: Weeks 37-40
    """
    if weeks <= 0:
        return 1
    elif weeks <= 4:
        return 1
    elif weeks <= 8:
        return 2
    elif weeks <= 12:
        return 3
    elif weeks <= 16:
        return 4
    elif weeks <= 20:
        return 5
    elif weeks <= 24:
        return 6
    elif weeks <= 28:
        return 7
    elif weeks <= 32:
        return 8
    elif weeks <= 36:
        return 9
    else:
        return 10


# ========================================================================================
# LAB RESULTS UPDATE/CREATE LOGIC - Updates existing lab results instead of creating new ones
# ========================================================================================

def create_or_update_lab_results(patient, lab_results_data, prenatal_form=None, upload_image_callback=None):
    """
    Create or update laboratory results for a patient across all prenatal visits.
    
    Key Logic:
    - If a lab_type already exists for this patient → UPDATE it
    - If a lab_type is new → CREATE it
    - For images: APPEND new images to existing lab result (don't delete old ones)
    
    Args:
        patient (Patient): The patient instance
        lab_results_data (list): List of lab data dicts with keys: lab_type, result_date, images, remarks, etc.
        prenatal_form (Prenatal_Form, optional): The prenatal form being created. Used for backwards compatibility.
        upload_image_callback (callable, optional): Function to handle image upload (self._upload_lab_image)
    
    Returns:
        list: List of created/updated LaboratoryResult instances
    
    Example Flow:
        Visit 1: User checks urinalysis + cbc
        - urinalysis created with result_date, images, to_be_followed=True
        - cbc created with result_date, images, is_completed=True
        
        Visit 2: User modifies urinalysis (adds image) and adds date to cbc
        - urinalysis UPDATED: appends new image, updates result_date and remarks
        - cbc UPDATED: appends new image, sets is_completed=True
        
        Visit 3: User adds new lab type (e.g., blood_typing)
        - blood_typing CREATED as new record
        - existing labs stay updated with their latest data
    """
    from apps.maternal.models import LaboratoryResult, LaboratoryResultImg
    import logging
    
    logger = logging.getLogger(__name__)
    
    if not lab_results_data:
        logger.info("No lab results data provided")
        return []
    
    updated_labs = []
    
    try:
        for lab_data in lab_results_data:
            lab_type = lab_data.get('lab_type')
            if not lab_type:
                logger.warning("Skipping lab data - no lab_type specified")
                continue
            
            # Extract images before checking for existing record
            images_data = lab_data.pop('images', [])
            
            # STEP 1: Check if this lab_type already exists for this patient
            # Query across ALL prenatal forms for this patient to find existing lab of same type
            existing_lab = LaboratoryResult.objects.filter(
                pf_id__patrec_id__pat_id=patient,
                lab_type=lab_type
            ).order_by('-created_at').first()  # Get most recent if multiple exist
            
            if existing_lab:
                # UPDATE existing lab result
                logger.info(f"Updating existing lab result: lab_type={lab_type}, lab_id={existing_lab.lab_id}")
                
                # Update fields that might have changed
                if lab_data.get('result_date'):
                    existing_lab.result_date = lab_data['result_date']
                
                if 'is_completed' in lab_data:
                    existing_lab.is_completed = lab_data['is_completed']
                
                if 'to_be_followed' in lab_data:
                    existing_lab.to_be_followed = lab_data['to_be_followed']
                
                if lab_data.get('remarks'):
                    existing_lab.remarks = lab_data['remarks']
                
                if lab_data.get('document_path'):
                    existing_lab.document_path = lab_data['document_path']
                
                # Save updated record
                existing_lab.save()
                logger.info(f"Lab result updated: lab_type={lab_type}")
                
                lab_result = existing_lab
            else:
                # CREATE new lab result
                logger.info(f"Creating new lab result: lab_type={lab_type}")
                
                # Use provided prenatal_form, or get the latest one for this patient
                if prenatal_form:
                    pf = prenatal_form
                else:
                    pf = Prenatal_Form.objects.filter(
                        patrec_id__pat_id=patient
                    ).order_by('-created_at').first()
                
                if not pf:
                    logger.warning(f"Cannot create lab result - no prenatal form found for patient {patient.pat_id}")
                    continue
                
                lab_result = LaboratoryResult.objects.create(
                    pf_id=pf,
                    lab_type=lab_type,
                    result_date=lab_data.get('result_date'),
                    is_completed=lab_data.get('is_completed', False),
                    to_be_followed=lab_data.get('to_be_followed', False),
                    document_path=lab_data.get('document_path', ''),
                    remarks=lab_data.get('remarks', '')
                )
                logger.info(f"Lab result created: lab_type={lab_type}, lab_id={lab_result.lab_id}")
            
            # STEP 2: Handle images - APPEND new images (don't delete old ones)
            if images_data and upload_image_callback:
                logger.info(f"Processing {len(images_data)} image(s) for lab_type={lab_type}")
                
                for img_data in images_data:
                    try:
                        # Check if this image already exists (by image_name - not image_url, since base64 changes)
                        # We check by image_name because base64 encoding will be different on each submission
                        existing_img = LaboratoryResultImg.objects.filter(
                            lab_id=lab_result,
                            image_name=img_data.get('image_name', '')
                        ).exists()
                        
                        if existing_img:
                            logger.info(f"Image already exists: {img_data.get('image_name')} - skipping")
                            continue
                        
                        # Use the provided callback to upload image
                        # This should be self._upload_lab_image from the serializer
                        upload_image_callback(img_data, lab_result)
                        logger.info(f"Uploaded image: {img_data.get('image_name')}")
                    except Exception as e:
                        logger.error(f"Error uploading image {img_data.get('image_name')}: {str(e)}")
                        # Continue processing other images even if one fails
            
            updated_labs.append(lab_result)
        
        logger.info(f"Lab result processing complete: {len(updated_labs)} lab(s) updated/created")
        return updated_labs
    
    except Exception as e:
        logger.error(f"Error in create_or_update_lab_results: {str(e)}")
        import traceback
        traceback.print_exc()
        raise