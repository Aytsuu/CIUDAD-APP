from django.db.models import Q
from apps.administration.models import Assignment, Staff

def waste_recipient():
  # General recipients for notification
  recipients = [
      assi.staff.rp
      for assi in Assignment.objects.filter(Q(feat__feat_name="WASTE"))
  ]

  # Only get BARANGAY STAFF with ADMIN position
  admins = Staff.objects.filter(Q(pos__pos_title="ADMIN") & Q(staff_type='BARANGAY STAFF'))

  for staff_data in admins:
    recipients.append(staff_data.rp)
  
  return recipients