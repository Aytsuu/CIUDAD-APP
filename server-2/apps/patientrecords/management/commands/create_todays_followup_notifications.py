# from django.core.management.base import BaseCommand
# from django.utils import timezone
# from datetime import timedelta
# from apps.patientrecords.models import FollowUpVisit
# from apps.administration.models import Staff
# from apps.healthProfiling.models import ResidentProfile
# from utils.create_notification import NotificationQueries
# import traceback


# class Command(BaseCommand):
#     help = 'Create notifications for today\'s follow-up visits via API call to server-1'
    
#     def handle(self, *args, **options):
#         notifier = NotificationQueries()
#         today = timezone.now().date()
        
#         self.stdout.write(f"🔍 Checking for follow-up visits on {today}")
        
#         # Get today's follow-up visits
#         todays_followups = FollowUpVisit.objects.filter(
#             followv_date=today,
#             followv_status__in=['pending', 'scheduled']
#         ).select_related(
#             'patrec',
#             'patrec__pat_id',
#             'patrec__pat_id__rp_id',
#             'patrec__pat_id__rp_id__per'
#         )
        
#         self.stdout.write(f"📋 Found {todays_followups.count()} follow-up visits for today")
        
#         if not todays_followups.exists():
#             self.stdout.write(self.style.SUCCESS('✅ No follow-up visits for today'))
#             return
        
#         # Get staff who should receive notifications
#         notification_staff = Staff.objects.filter(pos__pos_title="ADMIN").select_related('rp', 'pos')
        
#         if not notification_staff.exists():
#             self.stdout.write(self.style.WARNING('⚠️ No ADMIN staff found to receive notifications'))
#             return
        
#         self.stdout.write(f"👥 Found {notification_staff.count()} ADMIN staff to notify")
        
#         # Collect recipient rp_ids (as strings)
#         recipient_rp_ids = []
#         for staff in notification_staff:
#             if staff.rp:
#                 rp_id_str = str(staff.rp.rp_id)
#                 recipient_rp_ids.append(rp_id_str)
#                 self.stdout.write(f"   📨 Will notify: {staff.pos.pos_title} (RP ID: {rp_id_str})")
        
#         if not recipient_rp_ids:
#             self.stdout.write(self.style.WARNING('⚠️ No valid recipient rp_ids found'))
#             return
        
#         self.stdout.write(f"📬 Total recipients: {len(recipient_rp_ids)}")
        
#         # Set reminder time for 10:00 AM today (timezone-aware)
#         remind_time = timezone.now().replace(hour=10, minute=0, second=0, microsecond=0)
        
#         # If 10 AM has already passed today, schedule for tomorrow at 10 AM
#         if remind_time < timezone.now():
#             remind_time += timedelta(days=1)
        
#         self.stdout.write(f"⏰ Reminder scheduled for: {remind_time}")
        
#         notification_count = 0
        
#         for followup in todays_followups:
#             try:
#                 # Get patient information
#                 patient = followup.patrec.pat_id
#                 patient_name = "Unknown Patient"
#                 patient_id = patient.pat_id
                
#                 if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
#                     personal = patient.rp_id.per
#                     patient_name = f"{personal.per_fname} {personal.per_lname}"
#                 elif patient.pat_type == 'Transient' and patient.trans_id:
#                     transient = patient.trans_id
#                     patient_name = f"{transient.tran_fname} {transient.tran_lname}"

#                 # Get follow-up description
#                 followup_description = followup.followv_description
#                 description_text = f" - {followup_description}" if followup_description else ""
                
#                 self.stdout.write(f"\n👤 Processing: {patient_name} (ID: {patient_id})")
#                 self.stdout.write(f"   📝 Follow-up description: {followup_description or 'No description'}")
                
#                 # Create immediate notification via API call to server-1
#                 success = notifier.create_notification(
#                     title="Follow-Up Visit Today",
#                     message=f"A follow-up visit is scheduled for {patient_name}{description_text}",
#                     sender="00001250924",  # rp_id as string
#                     recipients=recipient_rp_ids,  # List of rp_id strings
#                     notif_type="REQUEST",
#                     target_obj=None,
#                     web_route="",
#                     web_params={"patient_id": str(patient_id)},
#                     mobile_route="",
#                     mobile_params={"patient_id": str(patient_id)},
#                 )
                
#                 if success:
#                     self.stdout.write(
#                         self.style.SUCCESS(f"   ✅ Created immediate notification for {patient_name}")
#                     )
                
#                 # Create reminder notification (timezone-aware datetime)
#                 # reminder_success = notifier.reminder_notification(
#                 #     title="Follow-Up Visit Reminder",
#                 #     message=f"Reminder: A follow-up visit is scheduled for {patient_name} (ID: {patient_id}){description_text}.",
#                 #     sender="00001250924",  # rp_id as string
#                 #     recipients=recipient_rp_ids,  # List of rp_id strings
#                 #     notif_type="reminder",
#                 #     remind_at=remind_time,  # Timezone-aware datetime
#                 #     target_obj=None,
#                 #     web_route="/services/familyplanning/record",
#                 #     web_params={"patient_id": str(patient_id)},
#                 #     mobile_route="screens/admin/admin-famplanning/",
#                 #     mobile_params={"patient_id": str(patient_id)},
#                 # )

#                 if reminder_success:
#                     notification_count += 1
#                     self.stdout.write(
#                         self.style.SUCCESS(f"   ✅ Created reminder notification for {patient_name}")
#                     )
#                 else:
#                     self.stdout.write(
#                         self.style.ERROR(f"   ❌ Failed to create reminder notification for {patient_name}")
#                     )
                
#             except Exception as e:
#                 self.stdout.write(
#                     self.style.ERROR(f"   💥 Error for followup {followup.followv_id}: {str(e)}")
#                 )
#                 self.stdout.write(traceback.format_exc())
        
#         self.stdout.write(
#             self.style.SUCCESS(
#                 f'\n🎉 Successfully created {notification_count}/{todays_followups.count()} notifications for today\'s follow-up visits'
#             )
#         )



from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.patientrecords.models import FollowUpVisit
from apps.administration.models import Staff
from apps.healthProfiling.models import ResidentProfile
from utils.create_notification import NotificationQueries
import traceback


class Command(BaseCommand):
    help = 'Create notifications for today\'s follow-up visits via API call to server-1'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            help='Run in test mode with additional output',
        )
    
    def handle(self, *args, **options):
        test_mode = options['test']
        notifier = NotificationQueries()
        today = timezone.now().date()
        
        if test_mode:
            self.stdout.write(f"🧪 TEST MODE: Checking for follow-up visits on {today}")
        
        # Get today's follow-up visits
        todays_followups = FollowUpVisit.objects.filter(
            followv_date=today,
            followv_status__in=['pending', 'scheduled']
        ).select_related(
            'patrec',
            'patrec__pat_id',
            'patrec__pat_id__rp_id',
            'patrec__pat_id__rp_id__per'
        )
        
        self.stdout.write(f"📋 Found {todays_followups.count()} follow-up visits for today")
        
        if not todays_followups.exists():
            self.stdout.write(self.style.SUCCESS('✅ No follow-up visits for today'))
            return
        
        # Get staff who should receive notifications
        notification_staff = Staff.objects.filter(pos__pos_title="ADMIN").select_related('rp', 'pos')
        
        if not notification_staff.exists():
            self.stdout.write(self.style.WARNING('⚠️ No ADMIN staff found to receive notifications'))
            return
        
        self.stdout.write(f"👥 Found {notification_staff.count()} ADMIN staff to notify")
        
        # Collect recipient rp_ids (as strings)
        recipient_rp_ids = []
        for staff in notification_staff:
            if staff.rp:
                rp_id_str = str(staff.rp.rp_id)
                recipient_rp_ids.append(rp_id_str)
                if test_mode:
                    self.stdout.write(f"   📨 Will notify: {staff.pos.pos_title} (RP ID: {rp_id_str})")
        
        if not recipient_rp_ids:
            self.stdout.write(self.style.WARNING('⚠️ No valid recipient rp_ids found'))
            return
        
        self.stdout.write(f"📬 Total recipients: {len(recipient_rp_ids)}")
        
        # Set reminder time for 10:00 AM today (timezone-aware)
        remind_time = timezone.now().replace(hour=10, minute=0, second=0, microsecond=0)
        
        # If 10 AM has already passed today, schedule for tomorrow at 10 AM
        if remind_time < timezone.now():
            remind_time += timedelta(days=1)
        
        self.stdout.write(f"⏰ Reminder scheduled for: {remind_time}")
        
        notification_count = 0
        
        for followup in todays_followups:
            try:
                # Get patient information
                patient = followup.patrec.pat_id
                patient_name = "Unknown Patient"
                patient_id = patient.pat_id
                
                if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
                    personal = patient.rp_id.per
                    patient_name = f"{personal.per_fname} {personal.per_lname}"
                elif patient.pat_type == 'Transient' and patient.trans_id:
                    transient = patient.trans_id
                    patient_name = f"{transient.tran_fname} {transient.tran_lname}"
                
                # Get follow-up description
                followup_description = followup.followv_description
                description_text = f" - {followup_description}" if followup_description else ""
                
                if test_mode:
                    self.stdout.write(f"\n👤 Processing: {patient_name} (ID: {patient_id})")
                    self.stdout.write(f"   📝 Follow-up description: {followup_description or 'No description'}")
                
                # Create immediate notification via API call to server-1
                success = notifier.create_notification(
                    title="Follow-Up Visit Today",
                    message=f"A follow-up visit is scheduled for {patient_name}{description_text}",
                    sender="00001250924",
                    recipients=recipient_rp_ids,
                    notif_type="REQUEST",
                    target_obj=None,
                    web_route="/services/familyplanning/record",
                    web_params={"patient_id": str(patient_id)},
                    mobile_route="screens/admin/admin-famplanning/",
                    mobile_params={"patient_id": str(patient_id)},
                )
                
                if success and test_mode:
                    self.stdout.write(
                        self.style.SUCCESS(f"   ✅ Created immediate notification for {patient_name}")
                    )
                
                # Create reminder notification (timezone-aware datetime)
                reminder_success = notifier.reminder_notification(
                    title="Follow-Up Visit Reminder",
                    message=f"Reminder: A follow-up visit is scheduled for {patient_name} (ID: {patient_id}){description_text}.",
                    sender="00001250924",
                    recipients=recipient_rp_ids,
                    notif_type="reminder",
                    remind_at=remind_time,
                    target_obj=None,
                    web_route="/services/familyplanning/record",
                    web_params={"patient_id": str(patient_id)},
                    mobile_route="screens/admin/admin-famplanning/",
                    mobile_params={"patient_id": str(patient_id)},
                )

                if reminder_success:
                    notification_count += 1
                    if test_mode:
                        self.stdout.write(
                            self.style.SUCCESS(f"   ✅ Created reminder notification for {patient_name}")
                        )
                else:
                    self.stdout.write(
                        self.style.ERROR(f"   ❌ Failed to create reminder notification for {patient_name}")
                    )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"   💥 Error for followup {followup.followv_id}: {str(e)}")
                )
                if test_mode:
                    self.stdout.write(traceback.format_exc())
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Successfully created {notification_count}/{todays_followups.count()} notifications for today\'s follow-up visits'
            )
        )