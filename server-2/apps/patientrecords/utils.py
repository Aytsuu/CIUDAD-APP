from .models import *



    
# utils/patient_utils.py

def get_completed_followup_visits(pat_id):
  
    try:
        # Get all patient records for this patient
        patient_records = PatientRecord.objects.filter(pat_id=pat_id)
        
        # Get only completed follow-up visits associated with these patient records
        completed_visits = FollowUpVisit.objects.filter(
            patrec__in=patient_records,
            followv_status__iexact='completed'  # Case-insensitive match
        ).order_by('-followv_date')  # Order by most recent first
        
        return completed_visits
    except Exception as e:
        # Log the error if needed
        print(f"Error fetching completed follow-up visits: {e}")
        return FollowUpVisit.objects.none()  # Return empty queryset on error
    
    

def get_pending_followup_visits(pat_id):
  
    try:
        # Get all patient records for this patient
        patient_records = PatientRecord.objects.filter(pat_id=pat_id)
        
        # Get only completed follow-up visits associated with these patient records
        pending_visits = FollowUpVisit.objects.filter(
            patrec__in=patient_records,
            followv_status__iexact='pending'  # Case-insensitive match
        ).order_by('-followv_date')  # Order by most recent first
        
        return pending_visits
    except Exception as e:
        # Log the error if needed
        print(f"Error fetching completed follow-up visits: {e}")
        return FollowUpVisit.objects.none()  # Return empty queryset on error
    

def get_previous_height_weight(pat_id):
    try:
        # Get all body measurements for the patient, ordered by newest first
        records = BodyMeasurement.objects.filter(
            patrec__pat_id=pat_id
        ).order_by('-created_at')

        # Return the second most recent record (i.e., the previous one)
        if records.count() >= 2:
            previous = records[1]
            return {
                'height': previous.height,
                'weight': previous.weight
            }
        else:
            # Not enough records to get a previous measurement
            return None
    except Exception as e:
        print("Error fetching previous height/weight:", e)
        return None    