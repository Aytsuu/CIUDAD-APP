from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from apps.medicalConsultation.models import MedicalConsultation_Record, MedConsultAppointment
from utils.create_notification import NotificationQueries
import logging
import django.db.models as models
from apps.administration.models import Staff
logger = logging.getLogger(__name__)

# Initialize notification instance
notification = NotificationQueries()

def get_health_staff_recipients():
    """Get all staff members with DOCTOR position - return their RP IDs"""
    try:
        health_staffs = Staff.objects.filter(
            models.Q(pos__pos_title__in=['DOCTOR'])
        ).select_related('rp', 'pos').distinct()
        
        # Use RP ID instead of staff_id for notifications
        recipient_ids = []
        for staff in health_staffs:
            if staff.rp:  # Only include staff with resident profiles
                recipient_ids.append(str(staff.rp.rp_id))
                logger.info(f"👨‍⚕️ Added doctor: {staff.staff_id} -> RP ID: {staff.rp.rp_id}")
            else:
                logger.warning(f"⚠️ Staff {staff.staff_id} has no resident profile")
        
        logger.info(f"Found {len(recipient_ids)} health staff recipients with RP IDs: {recipient_ids}")
        return recipient_ids
    except Exception as e:
        logger.error(f"Error getting health staff recipients: {e}")
        return []

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


@receiver(pre_save, sender=MedConsultAppointment)
def capture_previous_appointment_status(sender, instance, **kwargs):
    """Capture the previous status before saving"""
    if instance.pk:
        try:
            previous = MedConsultAppointment.objects.get(pk=instance.pk)
            instance._previous_status = previous.status
            logger.info(f"🔍 Pre-save capture - Appointment {instance.id}: Previous status = {previous.status}")
        except MedConsultAppointment.DoesNotExist:
            instance._previous_status = None
            logger.warning(f"⚠️ Appointment {instance.id} not found in pre_save")
    else:
        instance._previous_status = None
        logger.info(f"ℹ️ New appointment being created (no pk)")


@receiver(post_save, sender=MedConsultAppointment)
def notify_doctors_on_appointment_confirmation(sender, instance, created, **kwargs):
    """
    Send notification to all doctors when appointment status is changed to 'confirmed'
    """
    try:
        logger.info(f"🔔 Post-save signal triggered for Appointment {instance.id}")
        logger.info(f"📊 Current status: {instance.status}, Created: {created}")
        
        # Check if status was changed to 'confirmed'
        previous_status = getattr(instance, '_previous_status', None)
        current_status = instance.status.lower() if instance.status else None
        
        logger.info(f"📌 Status comparison - Previous: {previous_status}, Current: {current_status}")

        # Only proceed if status changed to 'confirmed'
        if current_status == 'confirmed':
            logger.info(f"✅ Status is 'confirmed', proceeding with notification")
            
            # Skip if it was already confirmed before (no change)
            if previous_status and previous_status.lower() == 'confirmed':
                logger.info(f"⏭️ Appointment {instance.id}: Status already confirmed, skipping notification")
                return

            # Get patient name from ResidentProfile
            patient_name = "Patient"
            try:
                if instance.rp and hasattr(instance.rp, 'per') and instance.rp.per:
                    personal = instance.rp.per
                    patient_name = f"{personal.per_fname} {personal.per_lname}".strip()
                    logger.info(f"👤 Patient name retrieved: {patient_name}")
            except Exception as e:
                logger.debug(f"Could not get patient name: {e}")

            # Get appointment details
            scheduled_date = instance.scheduled_date.strftime("%B %d, %Y") if instance.scheduled_date else "Unknown date"
            meridiem = instance.meridiem if instance.meridiem else ""
            chief_complaint = instance.chief_complaint or "No chief complaint provided"
            
            logger.info(f"📅 Appointment details - Date: {scheduled_date}, Meridiem: {meridiem}, Complaint: {chief_complaint}")

            # Get all doctor recipients
            doctor_recipient_ids = get_health_staff_recipients()

            if not doctor_recipient_ids:
                logger.warning(f"⚠️ No doctor recipients found for appointment {instance.id}")
                return

            # Create notification title and message
            title = "New Upcoming Appointment"
            message = f"Patient {patient_name} has an upcoming appointment on {scheduled_date} {meridiem}. Chief complaint: {chief_complaint}"

            logger.info(f"📨 Preparing to send notification to {len(doctor_recipient_ids)} doctors")

            # Send notification to all doctors
            success = notification.create_notification(
                title=title,
                message=message,
                recipients=doctor_recipient_ids,  # Send to all doctors
                notif_type="REMINDER",
                web_route="/referred-patients/upcoming-consultations",  # Web route for consultation page
                web_params="",
                mobile_route="",  # Mobile route if available
                mobile_params=""
            )

            if success:
                logger.info(f"📩 Sent appointment confirmation notification to {len(doctor_recipient_ids)} doctors for Appointment {instance.id}")
            else:
                logger.error(f"❌ Failed to send notification for Appointment {instance.id}")
        else:
            logger.info(f"ℹ️ Status is '{current_status}', not 'confirmed' - skipping notification")

    except Exception as e:
        logger.error(f"❌ Error sending appointment notification for Appointment {instance.id}: {e}", exc_info=True)

