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
        # Get all records ordered by most recent first
        all_records = BodyMeasurement.objects.filter(
            pat_id=pat_id
        ).order_by('-created_at')
        
        # Iterate through records to find the first one with valid height/weight
        for record in all_records:
            # Check if this record has valid height/weight
            if record and record.height is not None and record.weight is not None:
                # Try to convert to float to validate they're numbers
                try:
                    height_val = float(record.height)
                    weight_val = float(record.weight)
                    
                    # Optional: Check if values are reasonable (positive numbers)
                    if height_val > 0 and weight_val > 0:
                        return {
                            'height': height_val,
                            'weight': weight_val,
                            'created_at': record.created_at
                        }
                    else:
                        print(f"Warning: Non-positive values for record ID {record.id}")
                        continue  # Continue searching if values are not positive
                        
                except (TypeError, ValueError):
                    # Handle the case where height/weight can't be converted to float
                    print(f"Error: Invalid height or weight value for record ID {record.id}")
                    continue  # Continue searching for valid record
            
        # If no valid record found after checking all
        print(f"No valid height/weight records found for patient {pat_id}")
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
            }
        else:
            return None
    except Exception as e:
        print("Error fetching vital signs:", e)
        return None

