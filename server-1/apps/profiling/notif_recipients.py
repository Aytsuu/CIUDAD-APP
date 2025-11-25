from django.db.models import Q
from apps.administration.models import Assignment, Staff
from .models import FamilyComposition

def general_recipients(is_brgy_staff, staff_id):
  # General recipients for notification
  recipients = [
      assi.staff.rp
      for assi in Assignment.objects.filter(Q(feat__feat_name="PROFILING") & ~Q(staff=staff_id))
  ]

  if is_brgy_staff:
      admins = Staff.objects.filter(Q(pos__pos_title="ADMIN") & Q(staff_type='BARANGAY STAFF') & ~Q(staff_id=staff_id))
  else:
      admins = Staff.objects.filter(Q(pos__pos_title="ADMIN") & ~Q(staff_id=staff_id))

  for staff_data in admins:
    recipients.append(staff_data.rp)
  
  return recipients

def family_recipients(family):
  # Family recipients for notification
  recipients = []
  filtered_residents = FamilyComposition.objects.filter(fam=family)
  for res in filtered_residents:
      primary_fam = FamilyComposition.objects.filter(rp=res.rp).first()
      if primary_fam.fam == family:
        recipients.append(res.rp)
  
  return recipients