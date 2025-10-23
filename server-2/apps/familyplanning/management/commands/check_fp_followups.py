# from django.core.management.base import BaseCommand
# from django.utils import timezone
# from apps.familyplanning.models import FP_Assessment_Record, FollowUpVisit
# from apps.familyplanning.shared_notification_utils import create_fp_followup_notification

# class Command(BaseCommand):
#     help = 'Check for today\'s family planning follow-ups and missed appointments'

#     def handle(self, *args, **options):
#         today = timezone.now().date()
#         self.stdout.write(f"🔍 Checking FP follow-ups for {today}")
        
#         # Check for today's follow-ups
#         todays_followups = FollowUpVisit.objects.filter(
#             followv_date=today,
#             followv_status__in=['scheduled', 'pending']  # Adjust based on your status values
#         )
        
#         today_count = 0
#         for followup in todays_followups:
#             # Get related FP assessment records
#             fp_assessments = FP_Assessment_Record.objects.filter(followv=followup)
            
#             for assessment in fp_assessments:
#                 self.stdout.write(f"📅 Today's follow-up found for FP record {assessment.fprecord.fprecord_id}")
#                 if create_fp_followup_notification(
#                     assessment.fprecord,
#                     followup.followv_date,
#                     'today',
#                     None  # system sender
#                 ):
#                     today_count += 1
        
#         # Check for missed follow-ups (past dates with pending status)
#         missed_followups = FollowUpVisit.objects.filter(
#             followv_date__lt=today,
#             followv_status__in=['scheduled', 'pending']  # statuses that indicate not completed
#         )
        
#         missed_count = 0
#         for followup in missed_followups:
#             fp_assessments = FP_Assessment_Record.objects.filter(followv=followup)
            
#             for assessment in fp_assessments:
#                 self.stdout.write(f"❌ Missed follow-up found for FP record {assessment.fprecord.fprecord_id} from {followup.followv_date}")
#                 if create_fp_followup_notification(
#                     assessment.fprecord,
#                     followup.followv_date,
#                     'missed',
#                     None
#                 ):
#                     missed_count += 1
        
#         self.stdout.write(
#             self.style.SUCCESS(
#                 f"✅ Successfully created {today_count} today notifications and {missed_count} missed notifications"
#             )
#         )
        
#         if today_count == 0 and missed_count == 0:
#             self.stdout.write("ℹ️ No follow-ups found that need notifications")