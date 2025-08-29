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


def get_latest_height_weight(pat_id):
    try:
        latest = BodyMeasurement.objects.filter(
            patrec__pat_id=pat_id
        ).order_by('-created_at').first()

        if latest:
            return {
                'height': float(latest.height),
                'weight': float(latest.weight),
                'created_at': latest.created_at
            }
        else:
            return None
    except Exception as e:
        print("Error fetching height and weight:", e)
        return None


def get_latest_vital_signs(pat_id):
    try:
        latest = VitalSigns.objects.filter(
            patrec__pat_id=pat_id
        ).order_by('-created_at').first()

        if latest:
            return {
                'bp_systolic': latest.vital_bp_systolic,
                'bp_diastolic': latest.vital_bp_diastolic,
                'temperature': latest.vital_temp,
                'respiratory_rate': latest.vital_RR,
                'oxygen_saturation': latest.vital_o2,
                'pulse': latest.vital_pulse,
                'created_at': latest.created_at,
                'staff': latest.staff  # Include staff info if needed
            }
        else:
            return None
    except Exception as e:
        print("Error fetching vital signs:", e)
        return None