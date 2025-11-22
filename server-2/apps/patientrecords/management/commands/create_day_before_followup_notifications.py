from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.patientrecords.models import FollowUpVisit
from apps.administration.models import Staff
from apps.healthProfiling.models import ResidentProfile
from utils.create_notification import NotificationQueries
import traceback


class Command(BaseCommand):
    help = 'Create reminder notifications for tomorrow\'s follow-up visits'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            help='Run in test mode with additional output',
        )
        parser.add_argument(
            '--force-resend',
            action='store_true',
            help='Resend notifications even for already notified follow-ups',
        )
    
    def handle(self, *args, **options):
        test_mode = options['test']
        force_resend = options.get('force_resend', False)
        notifier = NotificationQueries()
        tomorrow = timezone.now().date() + timedelta(days=1)
        
        if test_mode:
            self.stdout.write(f"🧪 TEST MODE: Checking for follow-up visits on {tomorrow}")
        
        # Get tomorrow's follow-up visits
        tomorrows_followups = FollowUpVisit.objects.filter(
            followv_date=tomorrow,
            followv_status__in=['pending', 'scheduled']
        ).select_related(
            'patrec',
            'patrec__pat_id',
            'patrec__pat_id__rp_id',
            'patrec__pat_id__rp_id__per'
        )
        
        self.stdout.write(f"📋 Found {tomorrows_followups.count()} follow-up visits for tomorrow")
        
        if not tomorrows_followups.exists():
            self.stdout.write(self.style.SUCCESS('✅ No follow-up visits for tomorrow'))
            return
        
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
        
        notification_count = 0
        
        for followup in tomorrows_followups:
            try:
                # 🚨 ADD DUPLICATE PREVENTION - Same as the other file
                if not force_resend and self.already_notified_today(followup, "tomorrow"):
                    if test_mode:
                        self.stdout.write(f"   ⏭️  Skipping tomorrow - already notified today: {followup.followv_id}")
                    continue
                
                # Get patient information
                patient = followup.patrec.pat_id
                patient_name = "Unknown Patient"
                patient_id = patient.pat_id
                patient_rp_id = None
                patient_age = None
                
                if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
                    personal = patient.rp_id.per
                    patient_name = f"{personal.per_fname} {personal.per_lname}"
                    patient_rp_id = str(patient.rp_id.rp_id) if patient.rp_id else None
                    
                    # Calculate patient age
                    if personal.per_dob:
                        today = timezone.now().date()
                        patient_age = today.year - personal.per_dob.year - (
                            (today.month, today.day) < 
                            (personal.per_dob.month, personal.per_dob.day)
                        )
                elif patient.pat_type == 'Transient' and patient.trans_id:
                    transient = patient.trans_id
                    patient_name = f"{transient.tran_fname} {transient.tran_lname}"
                    patient_rp_id = None
                
                # Get follow-up description
                followup_description = followup.followv_description
                description_text = f" - {followup_description}" if followup_description else ""
                
                if test_mode:
                    self.stdout.write(f"\n👤 Processing tomorrow: {patient_name} (ID: {patient_id})")
                    self.stdout.write(f"   📝 Follow-up description: {followup_description or 'No description'}")
                    self.stdout.write(f"   🎂 Age: {patient_age} years old")
                
                # Create notification for staff
                staff_success = notifier.create_notification(
                    title="Follow-Up Visit Tomorrow",
                    message=f"{description_text} is scheduled for tomorrow for {patient_name}",
                    recipients=staff_recipient_rp_ids,
                    notif_type="REMINDER",
                    web_route="",
                    web_params="",
                    mobile_route="",
                    mobile_params="",
                )
                
                if staff_success and test_mode:
                    self.stdout.write(
                        self.style.SUCCESS(f"   ✅ Created tomorrow notification for staff about {patient_name}")
                    )
                
                # Create notification for resident (if they have an RP ID)
                if patient_rp_id:
                    resident_success = notifier.create_notification(
                        title="Your Follow-Up Visit Tomorrow",
                        message=f"Your follow-up visit is scheduled for tomorrow{description_text}",
                        recipients=[patient_rp_id],
                        notif_type="REMINDER",
                        web_route="",
                        web_params="",
                        mobile_route="/(health)/my-schedules/my-schedules",
                        mobile_params="",
                    )
                    
                    if resident_success and test_mode:
                        self.stdout.write(
                            self.style.SUCCESS(f"   ✅ Created tomorrow notification for resident {patient_name}")
                        )
                
                # 🆕 NOTIFY PARENTS if patient is a dependent child below 6 years old
                if patient.pat_type == 'Resident' and patient.rp_id and patient_age is not None and patient_age < 6:
                    parent_notifications = self._notify_parents_for_child_followup(
                        patient, followup_description, test_mode
                    )
                    if test_mode and parent_notifications > 0:
                        self.stdout.write(
                            self.style.SUCCESS(f"   ✅ Created notifications for {parent_notifications} parent(s) of child {patient_name}")
                        )
                
                if staff_success:
                    notification_count += 1
                    # 🚨 MARK AS NOTIFIED TODAY - Same as the other file
                    self.mark_as_notified_today(followup, "tomorrow")
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"   💥 Error for tomorrow followup {followup.followv_id}: {str(e)}")
                )
                if test_mode:
                    self.stdout.write(traceback.format_exc())
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Successfully created {notification_count} reminder notifications for tomorrow\'s follow-up visits'
            )
        )
    
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
    
    def _notify_parents_for_child_followup(self, child_patient, followup_description, test_mode):
        """
        Notify parents (mother and father) if their dependent child (< 6 years) has a follow-up visit
        Returns count of parent notifications sent
        """
        from apps.healthProfiling.models import FamilyComposition
        from apps.patientrecords.models import Patient
        notifier = NotificationQueries()
        parent_notifications = 0
        
        try:
            if not child_patient.rp_id:
                return parent_notifications
            
            # Get child's family composition
            child_composition = FamilyComposition.objects.filter(
                rp=child_patient.rp_id
            ).order_by('-fam_id__fam_date_registered', '-fc_id').first()
            
            if not child_composition:
                if test_mode:
                    self.stdout.write(f"   ⚠️  No family composition found for child {child_patient.pat_id}")
                return parent_notifications
            
            # Get all family members in same family
            fam_id = child_composition.fam_id
            family_compositions = FamilyComposition.objects.filter(
                fam_id=fam_id
            ).select_related('rp', 'rp__per')
            
            # Find mother and father
            parent_rp_ids = []
            parent_names = []
            
            for composition in family_compositions:
                role = (composition.fc_role or '').strip().lower()
                
                if role in ['mother', 'father']:
                    parent_rp = composition.rp
                    
                    if parent_rp:
                        parent_rp_id = str(parent_rp.rp_id)
                        parent_rp_ids.append(parent_rp_id)
                        
                        # Get parent name
                        if parent_rp.per:
                            parent_name = f"{parent_rp.per.per_fname} {parent_rp.per.per_lname}"
                            parent_names.append(f"{parent_name} ({role.title()})")
                            
                            if test_mode:
                                self.stdout.write(f"   👨‍👩‍👧 Found {role}: {parent_name} (RP ID: {parent_rp_id})")
            
            # Send notification to parents if found
            if parent_rp_ids:
                child_name = f"{child_patient.rp_id.per.per_fname} {child_patient.rp_id.per.per_lname}"
                description_text = f" - {followup_description}" if followup_description else ""
                
                parent_success = notifier.create_notification(
                    title="Your Child's Follow-Up Visit Tomorrow",
                    message=f"Your child, {child_name}, has a follow-up visit scheduled for tomorrow{description_text}",
                    recipients=parent_rp_ids,
                    notif_type="REMINDER",
                    web_route="",
                    web_params="",
                    mobile_route="/(health)/my-schedules/my-schedules",
                    mobile_params="",
                )
                
                if parent_success:
                    parent_notifications = len(parent_rp_ids)
                    if test_mode:
                        self.stdout.write(
                            self.style.SUCCESS(f"   ✅ Sent notification to {', '.join(parent_names)}")
                        )
            else:
                if test_mode:
                    self.stdout.write(f"   ℹ️  No parents found in family composition for child {child_patient.pat_id}")
        
        except Exception as e:
            if test_mode:
                self.stdout.write(
                    self.style.ERROR(f"   ❌ Error notifying parents for child {child_patient.pat_id}: {str(e)}")
                )
                self.stdout.write(traceback.format_exc())
        
        return parent_notifications