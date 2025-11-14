from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db.models import Q
from .models import AcknowledgementReport, IncidentReport
from .serializers.incident_report_serializers import IRTableSerializer
from apps.notification.utils import create_notification
from apps.administration.models import Assignment, Staff
import json

@receiver(post_save, sender=AcknowledgementReport)
def handle_archive_ir(sender, instance, created, **kwargs):
  if hasattr(instance, 'ir') and instance.ir and instance.ar_status.lower() == "signed":
    if not created:
      instance.ir.ir_is_archive=True
      instance.ir.save()

@receiver(post_save, sender=IncidentReport)
def handle_ir_notif(sender, instance, created, **kwargs):
  recipients = [
    assi.staff.rp
    for assi in Assignment.objects.filter(Q(feat__feat_name="REPORT"))
  ]

  admins = Staff.objects.filter(Q(pos__pos_title="ADMIN") & Q(staff_type="BARANGAY STAFF"))
  for staff_data in admins:
      recipients.append(staff_data.rp)

  if not instance.ir_is_tracker:
    personal_info = instance.rp.per
    resident_name = f"{personal_info.per_fname}{f' {personal_info.per_mname[0]}.' if personal_info.per_mname else ''} {personal_info.per_lname}"
    json_data = json.dumps(
      IRTableSerializer(instance).data,
      default=str
    )

    create_notification(
      title="New Incident Report",
      message=(
          f"{resident_name} submitted an incident report. Check latest report updates."
      ),
      recipients=recipients,
      notif_type="REPORT",
      web_route=f"report/incident/view",
      web_params={"ir_id": instance.ir_id},
      mobile_route="/(report)/incident/details",
      mobile_params={"report": json_data},
    )
  else:
    create_notification(
      title="New Securado Report",
      message=(
          f"ALERT! New lost or stolen report from a securado tracker owner."
      ),
      recipients=recipients,
      notif_type="REPORT",
      web_route=f"report/incident/securado",
      web_params={"ir_id": instance.ir_id},
      mobile_route="/(report)/securado/map",
      mobile_params={},
    )