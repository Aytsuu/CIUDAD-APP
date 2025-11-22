from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, datetime
from apps.patientrecords.models import FollowUpVisit, FamilyComposition
from apps.administration.models import Staff
from apps.healthProfiling.models import ResidentProfile
from utils.create_notification import NotificationQueries
import traceback
import logging


logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Create notifications for today\'s follow-up visits and missed follow-ups'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            help='Run in test mode with additional output',
        )
        parser.add_argument(
            '--missed-days',
            type=int,
            default=1,
            help='Number of days to check for missed follow-ups (default: 1)',
        )
        parser.add_argument(
            '--force-resend',
            action='store_true',
            help='Resend notifications even for already notified follow-ups',
        )
    
    def handle(self, *args, **options):
        test_mode = options['test']
        missed_days = options['missed_days']
        force_resend = options['force_resend']
        notifier = NotificationQueries()
        today = timezone.now().date()
        
        if test_mode:
            self.stdout.write(f"🧪 TEST MODE: Checking for follow-up visits on {today}")
        
        self.auto_close_old_followups(test_mode)
        
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
        
        # 🚨 FIXED: Use consistent days for query and notification
        MAX_MISSED_NOTIFICATION_DAYS = 2  # Stop notifying after 2 days
        missed_cutoff = today - timedelta(days=MAX_MISSED_NOTIFICATION_DAYS)
        
        missed_followups = FollowUpVisit.objects.filter(
            followv_date__lt=today,
            followv_date__gte=missed_cutoff,
            followv_status__in=['pending', 'scheduled']
        ).select_related(
            'patrec',
            'patrec__pat_id',
            'patrec__pat_id__rp_id',
            'patrec__pat_id__rp_id__per'
        )
        
        self.stdout.write(f"📋 Found {todays_followups.count()} follow-up visits for today")
        self.stdout.write(f"📋 Found {missed_followups.count()} missed follow-up visits (last {MAX_MISSED_NOTIFICATION_DAYS} days)")
        
        # Get staff who should receive notifications
        notification_staff = Staff.objects.filter(
            staff_type="HEALTH STAFF",
            pos__pos_title__in=["ADMIN", "BARANGAY HEALTH WORKERS"]
        ).select_related('rp', 'pos')
        
        if not notification_staff.exists():
            self.stdout.write(self.style.WARNING('⚠️ No ADMIN or BARANGAY HEALTH WORKER staff found to receive notifications'))
            return

        self.stdout.write(f"👥 Found {notification_staff.count()} ADMIN/BHW staff to notify")
        
        # Collect recipient rp_ids for staff
        staff_recipient_rp_ids = []
        for staff in notification_staff:
            if staff.rp:
                rp_id_str = str(staff.rp.rp_id)
                staff_recipient_rp_ids.append(rp_id_str)
                if test_mode:
                    self.stdout.write(f"   📨 Will notify staff: {staff.pos.pos_title} (RP ID: {rp_id_str})")
        
        if not staff_recipient_rp_ids:
            self.stdout.write(self.style.WARNING('⚠️ No valid staff recipient rp_ids found'))
            return
        
        self.stdout.write(f"📬 Total staff recipients: {len(staff_recipient_rp_ids)}")
        
        # Process today's follow-ups
        today_notification_count = self.process_followups(
            todays_followups, 
            staff_recipient_rp_ids, 
            notifier, 
            "today",
            test_mode,
            force_resend
        )
        
        # Process missed follow-ups
        missed_notification_count = self.process_followups(
            missed_followups, 
            staff_recipient_rp_ids, 
            notifier, 
            "missed",
            test_mode,
            force_resend
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Successfully created {today_notification_count} notifications for today\'s follow-up visits '
                f'and {missed_notification_count} notifications for missed follow-up visits'
            )
        )
    
    def auto_close_old_followups(self, test_mode=False):
        """Automatically close follow-ups that have been missed for too long"""
        from apps.patientrecords.models import FollowUpVisit
        
        AUTO_CLOSE_DAYS = 5  # Close after 5 days of being missed
        cutoff_date = timezone.now().date() - timedelta(days=AUTO_CLOSE_DAYS)
        
        old_missed_followups = FollowUpVisit.objects.filter(
            followv_date__lt=cutoff_date,
            followv_status__in=['pending', 'scheduled']
        )
        
        count_closed = old_missed_followups.update(followv_status='cancelled')
        
        if count_closed > 0:
            self.stdout.write(
                self.style.WARNING(f'🔄 Auto-closed {count_closed} follow-ups older than {AUTO_CLOSE_DAYS} days')
            )
        elif test_mode:
            self.stdout.write(f'   ✅ No follow-ups to auto-close (older than {AUTO_CLOSE_DAYS} days)')
    
    def process_followups(self, followups, staff_recipients, notifier, followup_type, test_mode, force_resend=False):
        """Process follow-ups and create notifications"""
        notification_count = 0
        
        for followup in followups:
            try:
                # 🚨 FIXED: Only one check for missed follow-ups
                if followup_type == "missed":
                    days_missed = (timezone.now().date() - followup.followv_date).days
                    MAX_MISSED_NOTIFICATION_DAYS = 3  # Stop notifying after 3 days
                    
                    # Skip if missed for too long (redundant but safe since query already filters)
                    if days_missed > MAX_MISSED_NOTIFICATION_DAYS:
                        if test_mode:
                            self.stdout.write(f"   ⏭️  Skipping - missed for {days_missed} days (notification period ended): {followup.followv_id}")
                        continue
                
                # 🚨 FIXED: Duplicate prevention
                if not force_resend and self.already_notified_today(followup, followup_type):
                    if test_mode:
                        self.stdout.write(f"   ⏭️  Skipping {followup_type} - already notified today: {followup.followv_id}")
                    continue
                
                # Get patient information
                patient = followup.patrec.pat_id
                patient_name = "Unknown Patient"
                patient_id = patient.pat_id
                
                if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
                    personal = patient.rp_id.per
                    patient_name = f"{personal.per_fname} {personal.per_lname}"
                    patient_rp_id = str(patient.rp_id.rp_id) if patient.rp_id else None
                elif patient.pat_type == 'Transient' and patient.trans_id:
                    transient = patient.trans_id
                    patient_name = f"{transient.tran_fname} {transient.tran_lname}"
                    patient_rp_id = None
                
                # Get follow-up description
                followup_description = followup.followv_description
                description_text = f" - {followup_description}" if followup_description else ""
                
                if test_mode:
                    self.stdout.write(f"\n👤 Processing {followup_type}: {patient_name} (ID: {patient_id})")
                    self.stdout.write(f"   📝 Follow-up description: {followup_description or 'No description'}")
                
                # Determine message based on followup type
                if followup_type == "today":
                    title_staff = "Follow-Up Visit Today"
                    message_staff = f"A follow-up visit is scheduled for {patient_name}{description_text}"
                    title_resident = "Your Follow-Up Visit Today"
                    message_resident = f"Your follow-up visit is scheduled for today{description_text}"
                elif followup_type == "missed":  # missed
                    days_missed = (timezone.now().date() - followup.followv_date).days
                    title_staff = "Missed Follow-Up Visit"
                    message_staff = f"Follow-up visit for {patient_name} was scheduled {days_missed} day(s) ago but is still pending{description_text}"
                    title_resident = "Missed Follow-Up Visit"
                    message_resident = f"Your follow-up visit scheduled {days_missed} day(s) ago is still pending{description_text}"
                
                # Create notification for staff
                staff_success = notifier.create_notification(
                    title=title_staff,
                    message=message_staff,
                    recipients=staff_recipients,
                    notif_type="REQUEST",
                    web_route="",
                    web_params="",
                    mobile_route="",
                    mobile_params="",
                )
                
                if staff_success and test_mode:
                    self.stdout.write(
                        self.style.SUCCESS(f"   ✅ Created {followup_type} notification for staff about {patient_name}")
                    )
                
                # Create notification for resident (if they have an RP ID)
                resident_success = False
                if patient_rp_id:
                    resident_success = notifier.create_notification(
                        title=title_resident,
                        message=message_resident,
                        recipients=[patient_rp_id],
                        notif_type="REMINDER",
                        web_route="",
                        web_params="",
                        mobile_route="/(health)/my-schedules/my-schedules",
                        mobile_params="",
                    )
                    
                    if resident_success and test_mode:
                        self.stdout.write(
                            self.style.SUCCESS(f"   ✅ Created {followup_type} notification for resident {patient_name}")
                        )
                
                # Notify parents if child is < 6 years old
                if patient.pat_type == 'Resident' and patient.rp_id:
                    try:
                        personal = patient.rp_id.per
                        if personal and personal.per_dob:
                            today_obj = timezone.now().date()
                            patient_age = today_obj.year - personal.per_dob.year - ((today_obj.month, today_obj.day) < (personal.per_dob.month, personal.per_dob.day))
                            
                            if patient_age < 6:
                                self._notify_parents_for_child_followup(
                                    patient, 
                                    followup_description, 
                                    followup_type,
                                    notifier,
                                    patient_name,
                                    test_mode
                                )
                    except Exception as e:
                        if test_mode:
                            self.stdout.write(
                                self.style.WARNING(f"   ⚠️ Could not notify parents: {str(e)}")
                            )
                
                if staff_success:
                    notification_count += 1
                    # Mark as notified today
                    self.mark_as_notified_today(followup, followup_type)
                
                logger.info(f"NOTIFICATION CREATED: {title_staff} | Patient: {patient_name} | Type: {followup_type} | Job: todays_morning")
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"   💥 Error for {followup_type} followup {followup.followv_id}: {str(e)}")
                )
                if test_mode:
                    self.stdout.write(traceback.format_exc())
        
        return notification_count
    
    def already_notified_today(self, followup, followup_type):
        """Check if this follow-up was already notified today"""
        from django.core.cache import cache
        from django.utils import timezone
        
        today = timezone.now().date().isoformat()
        cache_key = f"followup_notified_{followup.followv_id}_{followup_type}_{today}"
        return cache.get(cache_key, False)
    
    def mark_as_notified_today(self, followup, followup_type):
        """Mark this follow-up as notified today"""
        from django.core.cache import cache
        from django.utils import timezone
        
        today = timezone.now().date().isoformat()
        cache_key = f"followup_notified_{followup.followv_id}_{followup_type}_{today}"
        
        # Store until tomorrow (24 hours)
        cache.set(cache_key, True, 60 * 60 * 24)  # 24 hours
    
    def _notify_parents_for_child_followup(self, child_patient, followup_description, followup_type, notifier, child_name, test_mode):
        """Notify parents (mother and father) if their dependent child (< 6 years) has a follow-up visit"""
        try:
            parent_rp_ids = []
            child_composition = FamilyComposition.objects.filter(
                rp=child_patient.rp_id
            ).order_by('-fam_id__fam_date_registered', '-fc_id').first()
            
            if not child_composition:
                if test_mode:
                    self.stdout.write(f"   ℹ️  No family composition found for child")
                return
            
            family_compositions = FamilyComposition.objects.filter(
                fam_id=child_composition.fam_id
            ).select_related('rp', 'rp__per')
            
            for composition in family_compositions:
                role = (composition.fc_role or '').strip().lower()
                if role in ['mother', 'father'] and composition.rp:
                    parent_rp_ids.append(str(composition.rp.rp_id))
                    if test_mode:
                        self.stdout.write(f"   👨‍👩‍👧 Found parent: {composition.fc_role.upper()} (RP ID: {composition.rp.rp_id})")
            
            if parent_rp_ids:
                description_text = f" - {followup_description}" if followup_description else ""
                
                if followup_type == "today":
                    parent_title = "Your Child's Follow-Up Visit Today"
                    parent_message = f"Your child, {child_name}, has a follow-up visit scheduled for today{description_text}"
                elif followup_type == "missed":
                    parent_title = "Your Child's Missed Follow-Up Visit"
                    parent_message = f"Your child, {child_name}, has a missed follow-up visit that needs attention{description_text}"
                else:
                    parent_title = "Your Child's Follow-Up Visit"
                    parent_message = f"Your child, {child_name}, has a follow-up visit{description_text}"
                
                parent_success = notifier.create_notification(
                    title=parent_title,
                    message=parent_message,
                    recipients=parent_rp_ids,
                    notif_type="REMINDER",
                    web_route="",
                    web_params="",
                    mobile_route="/(health)/my-schedules/my-schedules",
                    mobile_params="",
                )
                
                if parent_success and test_mode:
                    self.stdout.write(
                        self.style.SUCCESS(f"   ✅ Created {followup_type} notification for {len(parent_rp_ids)} parent(s) about {child_name}")
                    )
                elif test_mode:
                    self.stdout.write(
                        self.style.WARNING(f"   ⚠️ Failed to create parent notification")
                    )
            else:
                if test_mode:
                    self.stdout.write(f"   ℹ️  No parents found in family composition")
        
        except Exception as e:
            if test_mode:
                self.stdout.write(
                    self.style.WARNING(f"   💥 Error notifying parents: {str(e)}")
                )
            logger.error(f"Error notifying parents for child {child_patient.pat_id}: {str(e)}")