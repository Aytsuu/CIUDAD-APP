    from django.core.management.base import BaseCommand
    from django.utils import timezone
    from datetime import timedelta
    from django.db import transaction
    from django.db.models import Exists, OuterRef, Q
    import logging

    from apps.fp.models import FP_Record, FP_type, FP_Assessment_Record # Adjust app name if different
    from apps.patientrecords.models import FollowUpVisit, Patient # Adjust app name if different

    logger = logging.getLogger(__name__)

    def _check_and_update_dropouts_for_patient(patient_id):
        """
        Checks and updates the follow-up status for a given patient.
        This function is designed to be called by a scheduled task.
        """
        try:
            # Get the latest FP_Record for the patient
            latest_fp_record = FP_Record.objects.filter(pat_id=patient_id).order_by('-created_at').first()
            if not latest_fp_record:
                logger.debug(f"No FP records found for patient {patient_id}. Skipping status update.")
                return  # No records, skip

            # Get its FP_type
            fp_type = FP_type.objects.filter(fprecord=latest_fp_record).first()
            if not fp_type:
                logger.warning(f"No FP_type found for latest FP_Record {latest_fp_record.fprecord_id} of patient {patient_id}. Skipping status update.")
                return  # No type, skip

            # Get the latest pending FollowUpVisit via PatientRecord
            patient_record = latest_fp_record.patrec
            if not patient_record:
                logger.warning(f"No PatientRecord found for latest FP_Record {latest_fp_record.fprecord_id} of patient {patient_id}. Skipping status update.")
                return

            # Filter for pending follow-ups associated with this specific patient record
            pending_follow_up = patient_record.follow_up_visits.filter(
                followv_status="pending"
            ).order_by('-followv_date').first() # Get the latest pending one

            if not pending_follow_up:
                logger.debug(f"No pending follow-up found for patient {patient_id} (patrec_id: {patient_record.patrec_id}). Skipping status update.")
                return  # No pending follow-up, skip

            today = timezone.now().date()

            # Check if a new FP_Record (e.g., follow-up record) exists since the pending follow-up's date
            # This means a new FP_Record was created on or after the followv_date, implying the follow-up was addressed.
            has_new_record_since_followup_date = FP_Record.objects.filter(
                pat_id=patient_id,
                created_at__date__gte=pending_follow_up.followv_date
            ).exclude(fprecord_id=latest_fp_record.fprecord_id).exists() # Exclude the current latest record itself if it's the one being checked

            if has_new_record_since_followup_date:
                logger.info(f"Patient {patient_id} has a new FP_Record created since follow-up date {pending_follow_up.followv_date}. Marking follow-up {pending_follow_up.followv_id} as 'Completed'.")
                with transaction.atomic():
                    pending_follow_up.followv_status = "completed"
                    pending_follow_up.completed_at = today # Mark as completed today
                    pending_follow_up.save()
                return # Follow-up was addressed, no need to mark as missed/dropout

            # Calculate cutoff for dropout (followv_date + 3 days)
            cutoff_date_for_dropout = pending_follow_up.followv_date + timedelta(days=3)

            with transaction.atomic():
                if today > cutoff_date_for_dropout:
                    # Missed by more than 3 days -> Dropout
                    pending_follow_up.followv_status = "dropout"
                    pending_follow_up.completed_at = today # Mark completion date as today
                    pending_follow_up.save()
                    # Update FP_type subtype to reflect dropout
                    fp_type.fpt_subtype = "dropoutrestart" # Or "dropout" depending on your exact mapping
                    fp_type.save()
                    logger.info(f"Updated patient {patient_id} follow-up {pending_follow_up.followv_id} to 'Dropout' (missed by >3 days since {pending_follow_up.followv_date})")
                elif today > pending_follow_up.followv_date:
                    # Missed but within 3 days -> Missed
                    pending_follow_up.followv_status = "missed"
                    pending_follow_up.save()
                    # No change to fpt_subtype for 'missed' status, as it's a temporary state before dropout
                    logger.info(f"Updated patient {patient_id} follow-up {pending_follow_up.followv_id} to 'Missed' (missed on {pending_follow_up.followv_date})")
                else:
                    logger.debug(f"Follow-up {pending_follow_up.followv_id} for patient {patient_id} is still pending and not yet missed/dropout.")

        except Exception as e:
            logger.error(f"Error updating missed/dropout for patient {patient_id}: {e}", exc_info=True)


    class Command(BaseCommand):
        help = 'Checks for overdue Family Planning follow-up visits and updates their status to Missed or Dropout.'

        def handle(self, *args, **options):
            logger.info("Starting FP follow-up status update job.")
            
            # Get all patients who have at least one FP_Record
            # We need to get distinct patient IDs to avoid processing the same patient multiple times
            patient_ids_with_fp_records = FP_Record.objects.values_list('pat__pat_id', flat=True).distinct()

            if not patient_ids_with_fp_records.exists():
                self.stdout.write(self.style.SUCCESS("No patients with FP records found. Exiting."))
                logger.info("No patients with FP records found. Exiting FP follow-up status update job.")
                return

            self.stdout.write(f"Found {len(patient_ids_with_fp_records)} patients with FP records to check.")
            
            for patient_id in patient_ids_with_fp_records:
                _check_and_update_dropouts_for_patient(patient_id)
            
            self.stdout.write(self.style.SUCCESS("FP follow-up status update job completed successfully."))
            logger.info("FP follow-up status update job completed.")

    