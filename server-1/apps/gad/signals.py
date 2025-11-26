from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from apps.gad.models import GAD_Budget_Tracker
from django.db import transaction
from datetime import datetime, date
from zoneinfo import ZoneInfo
from django.utils import timezone
from .models import DevelopmentPlan

@receiver([post_save, post_delete], sender=GAD_Budget_Tracker)
def update_budget_year_totals(sender, instance, **kwargs):
    try:
        with transaction.atomic():
            budget_year = instance.gbudy
            if not budget_year:
                return

            expense_total = (
                GAD_Budget_Tracker.objects
                .filter(gbudy=budget_year, gbud_is_archive=False)
                .aggregate(total=Sum('gbud_actual_expense'))['total'] or 0
            )
            budget_year.gbudy_expenses = expense_total
            budget_year.save()
    except Exception as e:
        # Error updating budget year totals
        pass

# COMMENTED OUT: Archiving disabled
# def archive_passed_gad_plans():
#     """Automatically archive GAD development plans when their date has passed"""
#     local_tz = ZoneInfo("Asia/Manila")
#     now = timezone.now().astimezone(local_tz).date()
#     
#     plans = DevelopmentPlan.objects.filter(dev_archived=False, dev_date__isnull=False)
#     to_archive = []
#     
#     for plan in plans:
#         if plan.dev_date < now:
#             to_archive.append(plan.dev_id)
#     
#     if to_archive:
#         updated = DevelopmentPlan.objects.filter(dev_id__in=to_archive).update(dev_archived=True)
#         print(f"Archived {updated} GAD development plan(s)")
#         return updated
#     
#     return 0
