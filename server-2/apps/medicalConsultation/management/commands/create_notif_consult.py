
# from django.core.management.base import BaseCommand
# from django.utils import timezone
# from apps.medicalConsultation.models import MedConsultAppointment
# from apps.administration.models import Staff
# from apps.healthProfiling.models import ResidentProfile
# from utils.create_notification import NotificationQueries
# import traceback

# class Command(BaseCommand):
#     help = "Create notifications for today's medical consultation appointments"

#     def add_arguments(self, parser):
#         parser.add_argument('--test', action='store_true', help='Run in test mode')
#         parser.add_argument('--tomorrow', action='store_true', help='Check tomorrow\'s appointments')

#     def handle(self, *args, **options):
#         test_mode = options['test']
#         check_tomorrow = options['tomorrow']
#         notifier = NotificationQueries()
        
#         # ✅ FIXED: Philippines timezone
#         today = timezone.now().date()
#         now = timezone.now()
        
#         if check_tomorrow:
#             target_date = today + timezone.timedelta(days=1)
#             self.stdout.write(f"TOMORROW (PH Time): {target_date}")
#         else:
#             target_date = today
#             self.stdout.write(f"TODAY (PH Time): {target_date} | Current Time: {now.strftime('%Y-%m-%d %H:%M:%S %Z')}")

#         # Get appointments for target date
#         appointments = MedConsultAppointment.objects.filter(
#             scheduled_date=target_date,
#             status__in=['pending', 'confirmed', 'scheduled']  # Include confirmed status
#         ).select_related('rp', 'rp__per').order_by('meridiem', 'created_at')

#         count = appointments.count()
#         date_display = "tomorrow" if check_tomorrow else "today"
#         self.stdout.write(f"Found {count} appointment(s) for {date_display}")

#         if count == 0:
#             self.stdout.write(self.style.SUCCESS(f"No appointments for {date_display}"))
#             return

#         # Get medical staff (doctors, nurses, admins) - broader selection
#         medical_staff = Staff.objects.filter(
#             pos__pos_title__in=['ADMIN', 'DOCTOR', 'BARANGAY HEALTH WORKERS', 'MIDWIFE'],  
#         ).select_related('rp', 'pos')
        
#         self.stdout.write(f"Found {medical_staff.count()} medical staff members")
#         print("MED STAFF",medical_staff)
        
#         recipient_rp_ids = [
#             str(staff.rp.rp_id) for staff in medical_staff
#             if staff.rp and staff.rp.rp_id
#         ]

#         if not recipient_rp_ids:
#             self.stdout.write(self.style.WARNING("No valid medical staff RP IDs"))
#             return

#         self.stdout.write(f"Notifying {len(recipient_rp_ids)} staff member(s)")

#         resident_notification_count = 0
#         staff_notification_count = 0

#         for appt in appointments:
#             try:
#                 resident_name = "Unknown Resident"
#                 resident_rp_id = None

#                 if appt.rp and appt.rp.per:
#                     per = appt.rp.per
#                     fname = per.per_fname.title() if per.per_fname else ""
#                     lname = per.per_lname.title() if per.per_lname else ""
#                     resident_name = f"{fname} {lname}".strip()
#                     resident_rp_id = str(appt.rp.rp_id)
                
#                 time_slot = appt.meridiem
#                 complaint = appt.chief_complaint or "General Check-up"
#                 short_complaint = (complaint[:50] + '...') if len(complaint) > 50 else complaint

#                 if test_mode:
#                     self.stdout.write(f"\n👤 {resident_name} ({time_slot}) - {short_complaint}")

#                 # === 1. NOTIFY RESIDENT ===
#                 if resident_rp_id:
#                     # Different messages for today vs tomorrow
#                     if check_tomorrow:
#                         resident_title = "Appointment Reminder"
#                         resident_message = (
#                             f"You have a medical consultation tomorrow at {time_slot}.\n"
#                             f"Chief Complaint: {complaint}\n"
#                             "Please arrive on time at the health center."
#                         )
#                     else:
#                         resident_title = "Your Appointment Today"
#                         resident_message = (
#                             f"Your medical consultation is scheduled today at {time_slot}.\n"
#                             f"Chief Complaint: {complaint}\n"
#                             "Please proceed to the health center."
#                         )
                    
#                     resident_success = notifier.create_notification(
#                         title=resident_title,
#                         message=resident_message,
#                         recipients=[resident_rp_id],  # ✅ FIXED: removed extra space
#                         notif_type="APPOINTMENT_REMINDER",
#                         web_route="/services/medical-consultation/my-appointments",
#                         web_params={"appointment_id": str(appt.id)},
#                         mobile_route="/(health)/medconsultation/my-records",
#                         mobile_params={
#                             "appointment_id": str(appt.id),
#                             "pat_id": resident_rp_id,  # ✅ Add patient ID
#                             "mode": "user",  # ✅ Specify this is user mode
#                             "focus_tab": "consultations"  # ✅ Optional: specify which tab to focus on
#                         },
#                     )
#                     if resident_success:
#                         resident_notification_count += 1
#                         self.stdout.write(self.style.SUCCESS("   ✅ Resident notified"))
#                     else:
#                         self.stdout.write(self.style.ERROR("   ❌ Resident notification failed"))

#                 # === 2. NOTIFY MEDICAL STAFF ===
#                 if check_tomorrow:
#                     staff_title = "Tomorrow's Appointments"
#                     staff_message = f"Reminder: {resident_name} has appointment tomorrow ({time_slot}): {short_complaint}"
#                     staff_notif_type = "APPOINTMENT_REMINDER_STAFF"
#                 else:
#                     staff_title = "Today's Appointments"
#                     staff_message = f"{resident_name} has appointment today ({time_slot}): {short_complaint}"
#                     staff_notif_type = "APPOINTMENT_TODAY_STAFF"
                
#                 admin_success = notifier.create_notification(
#                     title=staff_title,
#                     message=staff_message,
#                     recipients=recipient_rp_ids,
#                     notif_type=staff_notif_type,
#                     web_route="/services/medical-consultation/appointments/confirmed",
#                     web_params={"date_filter": "today" if not check_tomorrow else "tomorrow"},
#                     mobile_route="/(health)/medconsultation/my-records",
#                     mobile_params={
#                         "appointment_id": str(appt.id),
#                         "pat_id": resident_rp_id,  # ✅ Add patient ID
#                         "mode": "user",  # ✅ Specify this is user mode
#                         "focus_tab": "consultations"  # ✅ Optional: specify which tab to focus on
#                     },
#                 )
                
#                 if admin_success:
#                     staff_notification_count += 1
#                     self.stdout.write(self.style.SUCCESS("   ✅ Staff notified"))
#                 else:
#                     self.stdout.write(self.style.ERROR("   ❌ Staff notification failed"))

           
#                 # === 3. REMINDER: Only if before 9 AM ===
#                 # if now.hour < 9:  # Only schedule reminder if before 9 AM
#                 #     remind_time = now.replace(hour=8, minute=30, second=0, microsecond=0)
                    
#                 #     # ✅ FIXED: Convert datetime to ISO string
#                 #     remind_time_iso = remind_time.isoformat()
                    
#                 #     reminder_success = notifier.reminder_notification(
#                 #         title="Appointment Reminder (Admin)",
#                 #         message=f"Reminder: {resident_name} is scheduled today at {time_slot}.",
#                 #         sender="00001250924",
#                 #         recipients=recipient_rp_ids,
#                 #         notif_type="reminder",
#                 #         remind_at=None,  # ✅ ISO STRING, not datetime object
#                 #         target_obj=None,
#                 #         web_route="/admin/consultation/appointments",
#                 #         web_params={"appointment_id": str(appt.id)},
#                 #         mobile_route="/(admin)/appointment-detail",
#                 #         mobile_params={"appointment_id": str(appt.id)},
#                 #     )
                    
#                 #     if reminder_success:
#                 #         notification_count += 1
#                 #         self.stdout.write(self.style.SUCCESS(f"   ⏰ Reminder scheduled: {remind_time_iso}"))
#                 #     else:
#                 #         self.stdout.write(self.style.ERROR("   ❌ Reminder failed"))
#                 # else:
#                 #     self.stdout.write(self.style.WARNING("   ⏰ Skipped reminder (after 9 AM)"))

#             except Exception as e:
#                 self.stdout.write(self.style.ERROR(f"   💥 Error for appt {appt.id}: {e}"))
#                 if test_mode:
#                     self.stdout.write(traceback.format_exc())

#         self.stdout.write(
#             self.style.SUCCESS(
#                 f"\n🎉 Successfully created {resident_notification_count} resident and {staff_notification_count} staff notifications for {date_display}"
#             )
#         )