# from django.utils import timezone
# from apps.administration.models import Staff
# from apps.notification.models import Notification, Recipient
# from django.contrib.contenttypes.models import ContentType
# import requests
# import logging

# logger = logging.getLogger(__name__)

# SERVER_1_NOTIFICATION_API = "http://localhost:8000/api/notification/create/"  # Update with your server-1 URL
# # For production, use: "https://your-server-1-domain.com/api/notification/create/"

# def create_fp_followup_notification(fp_record, followup_date, status, sender):
#     try:
#         # Get all admin staff
#         admin_staff = Staff.objects.filter(pos__pos_title="ADMIN").select_related("rp")
#         print("ADMIN STAFF",admin_staff)
#         recipients = [staff.rp for staff in admin_staff if staff.rp]
        
#         if not recipients:
#             print("No ADMIN staff found to notify")
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
        
#         try:
#             recipient_rp_ids = [rp.rp_id for rp in recipients]
            
#             response = requests.post(
#                 SERVER_1_NOTIFICATION_API,
#                 json={
#                     'title': title,
#                     'message': message,
#                     'notif_type': 'MEDICAL_FOLLOWUP',
#                     'recipient_rp_ids': recipient_rp_ids
#                 },
#                 timeout=10
#             )
            
#             if response.status_code == 201:
#                 data = response.json()
#                 print(f"✓ Created FP follow-up notification: {title}")
#                 print(f"  Notification ID: {data.get('notification_id')}")
#                 print(f"  Recipients notified: {data.get('recipients_count')}")
#                 return True
#             else:
#                 print(f"Warning: Server-1 returned status {response.status_code}: {response.text}")
#                 # Fallback to local database creation
#                 return create_fp_followup_notification_fallback(
#                     fp_record, title, message, recipients
#                 )
                
#         except requests.exceptions.RequestException as e:
#             print(f"Warning: Could not reach server-1 notification API: {e}")
#             # Fallback to local database creation
#             return create_fp_followup_notification_fallback(
#                 fp_record, title, message, recipients
#             )
        
#     except Exception as e:
#         print(f"Error creating FP follow-up notification: {e}")
#         logger.error(f"Error in create_fp_followup_notification: {e}", exc_info=True)
#         return False


# def create_fp_followup_notification_fallback(fp_record, title, message, recipients):
#     """
#     Fallback notification creation if server-1 API is unavailable.
#     Creates notifications directly in the local database.
#     """
#     try:
#         notification_data = {
#             'notif_title': title,
#             'notif_message': message,
#             'sender': None,
#             'notif_type': "MEDICAL_FOLLOWUP"
#         }
        
#         # Add generic relation to FP record
#         if fp_record:
#             notification_data['content_type'] = ContentType.objects.get_for_model(fp_record)
#             notification_data['object_id'] = fp_record.pk
        
#         notification = Notification.objects.create(**notification_data)
        
#         # Create recipient entries for all admin staff
#         for rp in recipients:
#             Recipient.objects.create(
#                 notif=notification,
#                 rp=rp
#             )
        
#         print(f"✓ Created FP follow-up notification (fallback - local DB): {title}")
#         return True
        
#     except Exception as e:
#         print(f"Error in fallback notification creation: {e}")
#         logger.error(f"Error in create_fp_followup_notification_fallback: {e}", exc_info=True)
#         return False
