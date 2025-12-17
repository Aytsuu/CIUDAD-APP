
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.familyplanning.models import FP_Record, FollowUpVisit
from apps.patientrecords.models import PatientRecord
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Checks and updates FP follow-up visit statuses from pending to missed if overdue by 3 days'

    def handle(self, *args, **options):
        try:
            today = timezone.now().date()
            cutoff_date = today - timedelta(days=3)
            
            self.stdout.write(f"Checking FP follow-ups as of {today}")
            self.stdout.write(f"Marking as missed if no new FP record after: {cutoff_date}")
            
            # Get all pending follow-up visits for family planning
            pending_followups = FollowUpVisit.objects.filter(
                followv_status='pending',
                patrec__patrec_type='Family Planning'
            ).select_related('patrec')
            
            updated_count = 0
            
            for followup in pending_followups:
                patient_record = followup.patrec
                
                new_fp_record_same_patrec = FP_Record.objects.filter(
                    patrec=patient_record,
                    created_at__date__gt=followup.followv_date
                ).exists()
                
                # If no new record in same patrec, check for any new FP record for the same patient
                if not new_fp_record_same_patrec:
                    # Get all patient records for this patient
                    patient_records_for_patient = PatientRecord.objects.filter(
                        pat_id=patient_record.pat_id
                    )
                    
                    # Check for any new FP record in any of this patient's records
                    new_fp_record_any_patrec = FP_Record.objects.filter(
                        patrec__in=patient_records_for_patient,
                        created_at__date__gt=followup.followv_date
                    ).exists()
                    
                    has_new_fp_record = new_fp_record_any_patrec
                else:
                    has_new_fp_record = True
                
                # If no new FP record AND it's been more than 3 days since follow-up date
                if not has_new_fp_record and followup.followv_date < cutoff_date:
                    followup.followv_status = 'missed'
                    followup.save()
                    
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(
                            f"Marked follow-up {followup.followv_id} as missed "
                            f"(Follow-up date: {followup.followv_date}, "
                            f"Patient Record: {patient_record.patrec_id})"
                        )
                    )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully updated {updated_count} follow-up(s) to 'missed' status."
                )
            )
            
            # Log summary
            logger.info(f"FP Follow-up Check: Updated {updated_count} follow-ups to 'missed' status on {today}")
            
        except Exception as e:
            logger.error(f"Error in FP follow-up check: {str(e)}")
            self.stdout.write(
                self.style.ERROR(f"Error: {str(e)}")
            )