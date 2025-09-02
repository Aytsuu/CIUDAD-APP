from .models import *

 
# utils/patient_utils.py
def get_completed_followup_visits(pat_id):

    try:
        # Get all patient records for this patient
        patient_records = PatientRecord.objects.filter(pat_id__pat_id=pat_id)
        
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

        # Check if a record was found AND if it has valid height/weight
        if latest and latest.height is not None and latest.weight is not None:
            # Optional: Check if values are positive numbers
            try:
                height_val = float(latest.height)
                weight_val = float(latest.weight)
                # If conversion is successful, return the data
                return {
                    'height': height_val,
                    'weight': weight_val,
                    'created_at': latest.created_at
                }
            except (TypeError, ValueError):
                # Handle the case where height/weight are strings that can't be converted (e.g., "")
                print(f"Error: Invalid height or weight value for record ID {latest.id}")
                return None
        else:
            # Return None if no record found, or record has null height/weight
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
                'pat_id': pat_id,
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

