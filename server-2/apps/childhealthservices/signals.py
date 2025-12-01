from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
import logging

from apps.childhealthservices.models import ChildHealth_History
from apps.patientrecords.models import FollowUpVisit
from utils.create_notification import NotificationQueries

logger = logging.getLogger(__name__)

# Initialize notification instance
notification = NotificationQueries()

# @receiver(post_save, sender=ChildHealth_History)
# def update_followups_on_history_save(sender, instance, created, **kwargs):
#     if not created:
#         return
#     print(f"[Signal] ChildHealth_History {instance.pk} saved. Checking FollowUpVisits…")

#     today = timezone.now().date()
#     history_created_date = instance.created_at.date()

#     visits = FollowUpVisit.objects.filter(patrec=instance.chrec.patrec)

#     for visit in visits:
#         if visit.followv_date == history_created_date:
#             visit.followv_status = "completed"
#             print(f"✅ Visit {visit.pk} marked as completed")
#         if visit.followv_date < today and visit.followv_status != "completed":
#             # missed visit if scheduled before today and not yet completed
#             days_diff = (today - visit.followv_date).days
#             visit.followv_status = "missed"
#             print(f"❌ Visit {visit.pk} marked as missed ({days_diff} days overdue)")
#         else:
#             # future visit — no action
#             print(f"ℹ️ Visit {visit.pk} is scheduled in the future — no action")

#         visit.save()


@receiver(pre_save, sender=ChildHealth_History)
def capture_previous_child_health_status(sender, instance, **kwargs):
    """Capture the previous status before saving"""
    if instance.pk:
        try:
            previous = ChildHealth_History.objects.get(pk=instance.pk)
            instance._previous_status = previous.status
            instance._previous_assigned_doc = previous.assigned_doc
            instance._previous_assigned_to = previous.assigned_to
        except ChildHealth_History.DoesNotExist:
            instance._previous_status = None
            instance._previous_assigned_doc = None
            instance._previous_assigned_to = None
    else:
        instance._previous_status = None
        instance._previous_assigned_doc = None
        instance._previous_assigned_to = None


@receiver(post_save, sender=ChildHealth_History)
def notify_staff_on_child_health_assignment(sender, instance, created, **kwargs):
    """
    Send notifications based on ChildHealth_History status:
    - 'check-up': Notify assigned_doc (medical consultation)
    - 'immunization': Notify assigned_to (immunization staff)
    """
    try:
        # Get previous status
        previous_status = getattr(instance, '_previous_status', None)
        current_status = instance.status.lower() if instance.status else None
        
        # Skip if status hasn't changed to check-up or immunization
        if not current_status or current_status not in ['check-up', 'immunization']:
            return
        
        # Skip if status was already the same before
        if previous_status and previous_status.lower() == current_status:
            logger.info(f"⏭️ ChildHealth {instance.chhist_id}: Status already {current_status}, skipping notification")
            return
        
        # Get patient name from ChildHealthrecord → PatientRecord → Patient
        patient_name = "Patient"
        try:
            if instance.chrec and hasattr(instance.chrec, 'patrec'):
                patrec = instance.chrec.patrec
                if hasattr(patrec, 'pat_id'):
                    patient = patrec.pat_id
                    
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
        
        # HANDLE CHECK-UP STATUS - Notify assigned_doc
        if current_status == 'check-up' and instance.assigned_doc:
            # Get the resident profile (rp) of the assigned doctor
            if not hasattr(instance.assigned_doc, 'rp') or not instance.assigned_doc.rp:
                logger.warning(f"⚠️ ChildHealth {instance.chhist_id}: Assigned doctor has no resident profile")
            else:
                staff_rp = instance.assigned_doc.rp
                staff_rp_id = staff_rp.rp_id
                
                # Get staff name from Personal model
                staff_name = "Staff"
                try:
                    if hasattr(staff_rp, 'per') and staff_rp.per:
                        personal = staff_rp.per
                        staff_name = f"{personal.per_fname} {personal.per_lname}".strip()
                except Exception as e:
                    logger.debug(f"Could not get staff name: {e}")
                
                # Create notification for check-up
                title = "New Patient Assigned"
                message = f"A child health check-up for {patient_name} has been assigned to you"
                
                success = notification.create_notification(
                    title=title,
                    message=message,
                    recipients=[staff_rp_id],
                    notif_type="reminder",
                    web_route="/referred-patients/pending-assessment",
                    web_params=None,
                    mobile_route=None,
                    mobile_params=None
                )
                
                if success:
                    logger.info(f"📩 Sent check-up notification to Doctor RP {staff_rp_id} ({staff_name}) for ChildHealth {instance.chhist_id}")
                else:
                    logger.error(f"❌ Failed to send check-up notification to Doctor RP {staff_rp_id}")
        
        # HANDLE IMMUNIZATION STATUS - Notify assigned_to
        elif current_status == 'immunization' and instance.assigned_to:
            # Get the resident profile (rp) of the assigned staff
            if not hasattr(instance.assigned_to, 'rp') or not instance.assigned_to.rp:
                logger.warning(f"⚠️ ChildHealth {instance.chhist_id}: Assigned staff has no resident profile")
            else:
                staff_rp = instance.assigned_to.rp
                staff_rp_id = staff_rp.rp_id
                
                # Get staff name from Personal model
                staff_name = "Staff"
                try:
                    if hasattr(staff_rp, 'per') and staff_rp.per:
                        personal = staff_rp.per
                        staff_name = f"{personal.per_fname} {personal.per_lname}".strip()
                except Exception as e:
                    logger.debug(f"Could not get staff name: {e}")
                
                # Create notification for immunization
                title = "New Child Immunization Assigned"
                message = f"A child immunization for {patient_name} has been assigned to you"
                
                success = notification.create_notification(
                    title=title,
                    message=message,
                    recipients=[staff_rp_id],
                    notif_type="reminder",
                    web_route="/forwarded-records/child-health-immunization",
                    web_params=None,
                    mobile_route=None,
                    mobile_params=None
                )
                
                if success:
                    logger.info(f"📩 Sent immunization notification to Staff RP {staff_rp_id} ({staff_name}) for ChildHealth {instance.chhist_id}")
                else:
                    logger.error(f"❌ Failed to send immunization notification to Staff RP {staff_rp_id}")
        
    except Exception as e:
        logger.error(f"❌ Error sending notification for ChildHealth {instance.chhist_id}: {e}", exc_info=True)




