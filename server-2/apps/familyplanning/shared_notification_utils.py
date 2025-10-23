# from django.utils import timezone
# from apps.administration.models import Staff
# from django.contrib.contenttypes.models import ContentType

# def create_fp_followup_notification(fp_record, followup_date, status, sender):
#     try:
#         # Import the local notification models
#         from apps.notification.models import Notification, Recipient
        
#         # Get all admin staff
#         admin_staff = Staff.objects.filter(pos__pos_title="ADMIN").select_related("rp")
        
#         recipients = [staff.rp for staff in admin_staff if staff.rp]
        
#         if not recipients:
#             print("No admin staff found to notify")
#             return False
        
#         # Get patient info for the message
#         patient = fp_record.pat
#         patient_name = "Unknown Patient"
        
#         if patient.pat_type == "Resident" and patient.rp_id and patient.rp_id.per:
#             personal = patient.rp_id.per
#             patient_name = f"{personal.per_lname}, {personal.per_fname}"
#         elif patient.pat_type == "Transient" and patient.trans_id:
#             transient = patient.trans_id
#             patient_name = f"{transient.tran_lname}, {transient.tran_fname}"
        
#         if status == 'today':
#             title = "Family Planning Follow-up Due Today"
#             message = f"Patient {patient_name} (ID: {patient.pat_id}) has a follow-up visit scheduled for today."
#         elif status == 'missed':
#             title = "Missed Family Planning Follow-up"
#             message = f"Patient {patient_name} (ID: {patient.pat_id}) missed their follow-up visit scheduled for {followup_date}."
#         else:
#             title = "Family Planning Follow-up Reminder"
#             message = f"Patient {patient_name} (ID: {patient.pat_id}) has an upcoming follow-up on {followup_date}."
        
#         # Create notification
#         notification_data = {
#             'notif_title': title,
#             'notif_message': message,
#             'notif_type': "MEDICAL_FOLLOWUP",
#         }
        
#         # Add generic relation if target object is provided
#         if fp_record:
#             notification_data['content_type'] = ContentType.objects.get_for_model(type(fp_record))
#             notification_data['object_id'] = fp_record.pk
        
#         # Add sender if available
#         if sender and hasattr(sender, 'acc_id'):
#             notification_data['sender_id'] = sender.acc_id
        
#         notification = Notification.objects.create(**notification_data)
        
#         # Create recipient entries
#         for rp in recipients:
#             Recipient.objects.create(
#                 notif=notification,
#                 rp_id=rp.rp_id,  # Use rp_id directly
#                 is_read=False
#             )
        
#         print(f"✅ Created FP follow-up notification: {title} (ID: {notification.notif_id})")
#         print(f"   → Sent to {len(recipients)} recipients")
#         return True
        
#     except Exception as e:
#         print(f"❌ Error creating FP follow-up notification: {e}")
#         import traceback
#         traceback.print_exc()
#         return False