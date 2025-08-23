from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from apps.gad.models import GAD_Budget_Tracker, GAD_Budget_Year
from django.db import transaction

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
        print(f"Error updating budget year totals: {e}")