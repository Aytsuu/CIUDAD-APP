# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Complaint, ComplaintRecipient
# from .utils import create_notification

# @receiver(post_save, sender=Complaint)
# def handle_complaint_notification(sender, instance, created, **kwargs):
#     if created:
#         create_notification(
#             recipients=instance.cpnt.acc,
#             title="Complaint Filed",
#             message=f"Your complaint #{instance.comp_id} has been registered",
#             notif_type="success",
#             related_object=instance
#         )

# @receiver(post_save, sender=ComplaintRecipient)
# def handle_recipient_update(sender, instance, created, **kwargs):
#     if instance.status == 'reviewed':
#         create_notification(
#             sender=instance.recipient,
#             recipients=instance.comp_acc.comp.cpnt.acc,
#             title="Complaint Reviewed",
#             message=f"Your complaint #{instance.comp_acc.comp.comp_id} was reviewed",
#             notif_type="info",
#             related_object=instance.comp_acc.comp
#         )