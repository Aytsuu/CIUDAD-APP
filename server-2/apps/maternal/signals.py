from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Prenatal_Form, PrenatalAppointmentRequest, PatientRecord
import logging

logger = logging.getLogger(__name__)

# Log when signals module is loaded
logger.info("Maternal signals loaded successfully")


@receiver(post_save, sender=Prenatal_Form)
def complete_prenatal_appointment(sender, instance, created, **kwargs):
    """
    Automatically complete a PrenatalAppointmentRequest when a Prenatal_Form 
    is created on the scheduled appointment date.
    
    This signal:
    1. Triggers when a new Prenatal_Form is created
    2. Finds approved appointments for the same patient on today's date
    3. Marks the appointment as completed
    """
    if not created:
        return
    
    # Get the patient ID from the PatientRecord
    if not instance.patrec_id:
        logger.debug("PrenatalForm has no patrec_id, skipping appointment completion")
        return
    
    pat_id = instance.patrec_id.pat_id
    if not pat_id:
        logger.debug("PatientRecord has no pat_id, skipping appointment completion")
        return
    
    # Get today's date
    today = timezone.now().date()
    
    # Find approved appointments for this patient scheduled for today
    appointments = PrenatalAppointmentRequest.objects.filter(
        pat_id=pat_id,
        status='approved',
        requested_date=today
    )
    
    if not appointments.exists():
        logger.debug(f"No approved appointments found for patient {pat_id} on {today}")
        return
    
    # Complete all matching appointments
    for appointment in appointments:
        appointment.complete()
        logger.info(
            f"✅ Auto-completed appointment {appointment.par_id} for patient {pat_id} "
            f"due to PrenatalForm {instance.pf_id} creation"
        )
