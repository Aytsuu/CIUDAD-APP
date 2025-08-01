from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from apps.childhealthservices.models import ChildHealth_History
from apps.patientrecords.models import FollowUpVisit

@receiver(post_save, sender=ChildHealth_History)
def update_followups_on_history_save(sender, instance, created, **kwargs):
    if not created:
        return

    print(f"[Signal] ChildHealth_History {instance.pk} saved. Checking FollowUpVisits…")

    today = timezone.now().date()
    history_created_date = instance.created_at.date()

    visits = FollowUpVisit.objects.filter(patrec=instance.chrec.patrec)

    for visit in visits:
        if visit.followv_date == history_created_date:
            visit.followv_status = "completed"
            visit.followv_description = "Visit completed on scheduled date"
            print(f"✅ Visit {visit.pk} marked as completed")
        elif visit.followv_date < today and visit.followv_status != "completed":
            # missed visit if scheduled before today and not yet completed
            days_diff = (today - visit.followv_date).days
            visit.followv_status = "missed"
            visit.followv_description = f"Missed — {days_diff} days overdue"
            print(f"❌ Visit {visit.pk} marked as missed ({days_diff} days overdue)")
        else:
            # future visit — no action
            print(f"ℹ️ Visit {visit.pk} is scheduled in the future — no action")

        visit.save()

