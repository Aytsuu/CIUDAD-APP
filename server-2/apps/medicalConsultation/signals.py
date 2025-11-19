from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from apps.medicalConsultation.models import MedicalConsultation_Record
from utils.create_notification import NotificationQueries
import logging

logger = logging.getLogger(__name__)

# Initialize notification instance
notification = NotificationQueries()


@receiver(pre_save, sender=MedicalConsultation_Record)
def capture_previous_status(sender, instance, **kwargs):
    """Capture the previous status before saving"""
    if instance.pk:
        try:
            previous = MedicalConsultation_Record.objects.get(pk=instance.pk)
            instance._previous_status = previous.medrec_status
            instance._previous_assigned_to = previous.assigned_to
        except MedicalConsultation_Record.DoesNotExist:
            instance._previous_status = None
            instance._previous_assigned_to = None
    else:
        instance._previous_status = None
        instance._previous_assigned_to = None


@receiver(post_save, sender=MedicalConsultation_Record)
def notify_assigned_staff_on_pending_status(sender, instance, created, **kwargs):
    """
    Send notification to assigned_to staff's rp (web only) when medrec_status is updated to 'pending'
    and assigned_to staff is set
    """
    try:
        # Check if status was changed to 'pending'
        previous_status = getattr(instance, '_previous_status', None)
        current_status = instance.medrec_status.lower() if instance.medrec_status else None
        
        # Only proceed if status changed to 'pending' and assigned_to is set
        if current_status == 'pending' and instance.assigned_to:
            # Skip if it was already pending before (no change)
            if previous_status and previous_status.lower() == 'pending':
                logger.info(f"⏭️ MedConsult {instance.medrec_id}: Status already pending, skipping notification")
                return
            
            # Get the resident profile (rp) of the assigned staff
            if not hasattr(instance.assigned_to, 'rp') or not instance.assigned_to.rp:
                logger.warning(f"⚠️ MedConsult {instance.medrec_id}: Assigned staff has no resident profile")
                return
            
            staff_rp = instance.assigned_to.rp
            staff_rp_id = staff_rp.rp_id
            
            # Get staff name from Personal model through ResidentProfile
            staff_name = "Staff"
            try:
                if hasattr(staff_rp, 'per') and staff_rp.per:
                    personal = staff_rp.per
                    staff_name = f"{personal.per_fname} {personal.per_lname}".strip()
            except Exception as e:
                logger.debug(f"Could not get staff name: {e}")
            
            # Get patient name from Personal model through ResidentProfile → Patient → PatientRecord
            patient_name = "Patient"
            try:
                if instance.patrec and hasattr(instance.patrec, 'pat_id'):
                    patient = instance.patrec.pat_id
                    
                    # Check if patient is a Resident (has rp_id)
                    if patient.pat_type == 'Resident' and patient.rp_id:
                        patient_rp = patient.rp_id
                        if hasattr(patient_rp, 'per') and patient_rp.per:
                            personal = patient_rp.per
                            patient_name = f"{personal.per_fname} {personal.per_lname}".strip()
                    
                    # Check if patient is a Transient (has trans_id)
                    elif patient.pat_type == 'Transient' and patient.trans_id:
                        transient = patient.trans_id
                        patient_name = f"{transient.tran_fname} {transient.tran_lname}".strip()
            except Exception as e:
                logger.debug(f"Could not get patient name: {e}")
            
            # Create notification title and message
            title = "New Patient Assigned"
            message = f"A new patient, {patient_name}, has been assigned to you for medical consultation"
            # Send notification to the assigned staff's rp (web only)
            success = notification.create_notification(
                title=title,
                message=message,
                recipients=[staff_rp_id],  # Send to staff's resident profile ID
                notif_type="REMINDER",
                web_route="/medical-consultation",  # Web route for consultation page
                web_params={"medrec_id": instance.medrec_id},
                mobile_route=None,  # No mobile route (web only)
                mobile_params=None
            )
            
            if success:
                logger.info(f"📩 Sent web notification to Staff RP {staff_rp_id} ({staff_name}) for MedConsult {instance.medrec_id}")
            else:
                logger.error(f"❌ Failed to send notification to Staff RP {staff_rp_id} for MedConsult {instance.medrec_id}")
            
    except Exception as e:
        logger.error(f"❌ Error sending notification for MedConsult {instance.medrec_id}: {e}", exc_info=True)
