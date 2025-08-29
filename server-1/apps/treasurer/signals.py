# signals.py
from django.db.models.signals import post_save, pre_delete, pre_save
from django.dispatch import receiver
from .models import *
from django.apps import apps
from django.db import transaction

@receiver(post_save, sender='treasurer.Budget_Plan')
def sync_income_expense_main(sender, instance, created, **kwargs):
    Income_Expense_Main = apps.get_model('treasurer', 'Income_Expense_Main')

    obj, _ = Income_Expense_Main.objects.get_or_create(
        ie_main_year=instance.plan_year,
        defaults={
            'ie_main_tot_budget': instance.plan_budgetaryObligations,
            'ie_main_inc': 0.0,
            'ie_main_exp': 0.0,
            'ie_is_archive': instance.plan_is_archive
        }
    )

    # Only update fields you want to modify
    obj.ie_main_tot_budget = instance.plan_budgetaryObligations
    obj.ie_is_archive = instance.plan_is_archive
    obj.save(update_fields=['ie_main_tot_budget', 'ie_is_archive'])

@receiver(post_save, sender='treasurer.Budget_Plan_Detail')
def sync_gad_budget_year(sender, instance, **kwargs):
    if instance.dtl_budget_item == 'GAD Program':
        GAD_Budget_Year = apps.get_model('gad', 'GAD_Budget_Year')

        is_archived = getattr(instance.plan, 'plan_is_archive', False)

        obj, _ = GAD_Budget_Year.objects.get_or_create(
            gbudy_year=instance.plan.plan_year,
            defaults={
                'gbudy_budget': instance.dtl_proposed_budget,
                'gbudy_expenses': 0.00,
                'gbudy_is_archive': is_archived
            }
        )

        # Only update budget and archive fields
        obj.gbudy_budget = instance.dtl_proposed_budget
        obj.gbudy_is_archive = is_archived
        obj.save(update_fields=['gbudy_budget', 'gbudy_is_archive'])


@receiver(post_save, sender='treasurer.Budget_Plan')
def sync_archive_status(sender, instance, **kwargs):
    if hasattr(instance, 'plan_is_archive'):
        Income_Expense_Main = apps.get_model('treasurer', 'Income_Expense_Main')
        GAD_Budget_Year = apps.get_model('gad', 'GAD_Budget_Year')
        
        # Update Income_Expense_Main archive status
        Income_Expense_Main.objects.filter(
            ie_main_year=instance.plan_year
        ).update(ie_is_archive=instance.plan_is_archive)
        
        # Update GAD_Budget_Year archive status
        GAD_Budget_Year.objects.filter(
            gbudy_year=instance.plan_year
        ).update(gbudy_is_archive=instance.plan_is_archive)


@receiver(pre_delete, sender='treasurer.Budget_Plan')  
def delete_related_records(sender, instance, **kwargs):
    # Lazy load models
    Income_Expense_Main = apps.get_model('treasurer', 'Income_Expense_Main')
    GAD_Budget_Year = apps.get_model('gad', 'GAD_Budget_Year')

    # Delete Income_Expense_Main record
    Income_Expense_Main.objects.filter(
        ie_main_year=instance.plan_year
    ).delete()  

    # Delete GAD_Budget_Year record
    GAD_Budget_Year.objects.filter(
        gbudy_year=instance.plan_year
    ).delete()
