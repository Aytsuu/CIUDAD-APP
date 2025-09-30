from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.patientrecords.models import FollowUpVisit # Absolute import corrected
from apps.familyplanning.models import FP_Record # Corrected import

class Command(BaseCommand):
    help = 'Checks for pending follow-up visits and updates their status to missed if no new FP record is created.'

    def handle(self, *args, **options):
        # Calculate the date three days ago
        three_days_ago = timezone.now().date() - timedelta(days=3)

        # Find all pending follow-up visits with a date more than 3 days ago
        pending_visits = FollowUpVisit.objects.filter(
            followv_status='pending',
            followv_date__lte=three_days_ago
        )

        updates_count = 0
        for visit in pending_visits:
            assessment_record = visit.fp_assessment_record_set.first() 
            
            if assessment_record is None:
                self.stdout.write(self.style.WARNING(
                    f'Skipping visit {visit.followv_id}: No related FP Assessment Record found.'
                ))
                continue
            
            patient = assessment_record.fprecord.pat
            current_fprecord_id = assessment_record.fprecord.fprecord_id # ID of the FP Record that created this visit


            # 2. CHECK: Does any *other* FP_Record exist for the patient after the follow-up date?
            new_record_exists = FP_Record.objects.filter(
                pat=patient, created_at__date__gt=visit.followv_date
            ).exclude(
                fprecord_id=current_fprecord_id 
            ).exists()

            # 3. If NO OTHER new record exists (the patient has not returned for service), mark as missed.
            if not new_record_exists:
                visit.followv_status = 'missed'
                visit.save()
                updates_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f'Updated follow-up visit {visit.followv_id} for patient {patient.pat_id} to "missed".'
                ))

        self.stdout.write(self.style.SUCCESS(
            f'Successfully checked all pending follow-ups. {updates_count} record(s) were updated to "missed".'
        ))