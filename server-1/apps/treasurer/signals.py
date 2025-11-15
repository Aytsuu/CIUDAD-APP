# # signals.py
# from django.db.models.signals import post_save, pre_delete
# from django.dispatch import receiver
# from .models import Budget_Plan, Income_Expense_Main, Budget_Plan_Detail
# from django.apps import apps

# @receiver(post_save, sender='treasurer.Budget_Plan')
# def sync_income_expense_main(sender, instance, created, **kwargs):
#     Income_Expense_Main = apps.get_model('treasurer', 'Income_Expense_Main')

#     obj, _ = Income_Expense_Main.objects.get_or_create(
#         ie_main_year=instance.plan_year,
#         defaults={
#             'ie_main_tot_budget': instance.plan_budgetaryObligations,
#             'ie_main_inc': 0.0,
#             'ie_main_exp': 0.0,
#             'ie_is_archive': instance.plan_is_archive,
#             'ie_remaining_bal': instance.plan_budgetaryObligations
#         }
#     )

#     # Only update fields you want to modify
#     obj.ie_main_tot_budget = instance.plan_budgetaryObligations
#     obj.ie_is_archive = instance.plan_is_archive
#     obj.save(update_fields=['ie_main_tot_budget', 'ie_is_archive'])

# @receiver(post_save, sender='treasurer.Budget_Plan_Detail')
# def sync_gad_budget_year(sender, instance, **kwargs):
#     if instance.dtl_budget_item == 'GAD Program':
#         GAD_Budget_Year = apps.get_model('gad', 'GAD_Budget_Year')

#         is_archived = getattr(instance.plan, 'plan_is_archive', False)

#         obj, _ = GAD_Budget_Year.objects.get_or_create(
#             gbudy_year=instance.plan.plan_year,
#             defaults={
#                 'gbudy_budget': instance.dtl_proposed_budget,
#                 'gbudy_expenses': 0.00,
#                 'gbudy_is_archive': is_archived
#             }
#         )

#         # Only update budget and archive fields
#         obj.gbudy_budget = instance.dtl_proposed_budget
#         obj.gbudy_is_archive = is_archived
#         obj.save(update_fields=['gbudy_budget', 'gbudy_is_archive'])

# @receiver(post_save, sender='treasurer.Budget_Plan_Detail')
# def sync_expense_particular(sender, instance, created, **kwargs):
#     Expense_Particular = apps.get_model('treasurer', 'Expense_Particular')
    
#     defaults = {
#         'exp_proposed_budget': instance.dtl_proposed_budget
#     }
    
#     # Use get_or_create to handle both creation and updates
#     expense_particular, created = Expense_Particular.objects.get_or_create(
#         exp_budget_item=instance.dtl_budget_item,
#         plan=instance.plan,
#         defaults=defaults
#     )
    
#     # If it already existed, update it
#     if not created:
#         for key, value in defaults.items():
#             setattr(expense_particular, key, value)
#         expense_particular.save()


# @receiver(post_save, sender='treasurer.Budget_Plan')
# def sync_archive_status(sender, instance, **kwargs):
#     if hasattr(instance, 'plan_is_archive'):
#         Income_Expense_Main = apps.get_model('treasurer', 'Income_Expense_Main')
#         GAD_Budget_Year = apps.get_model('gad', 'GAD_Budget_Year')
        
#         # Update Income_Expense_Main archive status
#         Income_Expense_Main.objects.filter(
#             ie_main_year=instance.plan_year
#         ).update(ie_is_archive=instance.plan_is_archive)
        
#         # Update GAD_Budget_Year archive status
#         GAD_Budget_Year.objects.filter(
#             gbudy_year=instance.plan_year
#         ).update(gbudy_is_archive=instance.plan_is_archive)


# @receiver(pre_delete, sender='treasurer.Budget_Plan')  
# def delete_related_records(sender, instance, **kwargs):
#     # Lazy load models
#     Income_Expense_Main = apps.get_model('treasurer', 'Income_Expense_Main')
#     GAD_Budget_Year = apps.get_model('gad', 'GAD_Budget_Year')

#     # Delete Income_Expense_Main record
#     Income_Expense_Main.objects.filter(
#         ie_main_year=instance.plan_year
#     ).delete()  

#     # Delete GAD_Budget_Year record
#     GAD_Budget_Year.objects.filter(
#         gbudy_year=instance.plan_year
#     ).delete()

# signals.py

from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import Budget_Plan, Income_Expense_Main, Budget_Plan_Detail
from django.apps import apps

@receiver(post_save, sender='treasurer.Budget_Plan')
def sync_income_expense_main(sender, instance, created, **kwargs):
    Income_Expense_Main = apps.get_model('treasurer', 'Income_Expense_Main')

    # Get the existing record or create a new one
    obj, created = Income_Expense_Main.objects.get_or_create(
        ie_main_year=instance.plan_year,
        defaults={
            'ie_main_tot_budget': instance.plan_budgetaryObligations,
            'ie_main_inc': 0.0,
            'ie_main_exp': 0.0,
            'ie_is_archive': instance.plan_is_archive,
            'ie_remaining_bal': instance.plan_budgetaryObligations  
        }
    )

    if not created:
        # Calculate the difference in budgetary obligations
        old_budget = obj.ie_main_tot_budget
        new_budget = instance.plan_budgetaryObligations
        budget_difference = new_budget - old_budget
        
        # Update the remaining balance by adding the difference
        new_remaining_balance = obj.ie_remaining_bal + budget_difference
        
        if new_remaining_balance < 0:
            new_remaining_balance = 0
        
        # Update all fields
        obj.ie_main_tot_budget = new_budget
        obj.ie_remaining_bal = new_remaining_balance
        obj.ie_is_archive = instance.plan_is_archive
        obj.save(update_fields=['ie_main_tot_budget', 'ie_remaining_bal', 'ie_is_archive'])
    else:
        # For newly created records, just update archive status if needed
        obj.ie_is_archive = instance.plan_is_archive
        obj.save(update_fields=['ie_is_archive'])

@receiver(post_save, sender='treasurer.Budget_Plan_Detail')
@receiver(post_save, sender='treasurer.Budget_Plan_Detail')
def sync_gad_budget_year(sender, instance, **kwargs):
    if instance.dtl_budget_item == 'GAD Program':
        GAD_Budget_Year = apps.get_model('gad', 'GAD_Budget_Year')

        is_archived = getattr(instance.plan, 'plan_is_archive', False)

        # Get the existing record or create a new one
        obj, created = GAD_Budget_Year.objects.get_or_create(
            gbudy_year=instance.plan.plan_year,
            defaults={
                'gbudy_budget': instance.dtl_proposed_budget,
                'gbudy_expenses': 0.00,
                'gbudy_is_archive': is_archived
            }
        )

        if not created:
            # Get current values
            budget_from_plan = instance.dtl_proposed_budget
            current_gad_budget = obj.gbudy_budget
            current_gad_expenses = obj.gbudy_expenses
            
            # Calculate the current available GAD budget (budget - expenses)
            current_available_gad = current_gad_budget - current_gad_expenses
            
            # Calculate the adjustment needed (same logic as expense particular)
            adjustment_amount = budget_from_plan - current_available_gad    
            
            # Only update if adjustment is needed
            if adjustment_amount != 0:
                # Apply the adjustment to the GAD budget
                new_gad_budget = current_gad_budget + adjustment_amount
                
                # Ensure budget doesn't go negative
                if new_gad_budget < 0:
                    new_gad_budget = 0
                
                # Update the GAD budget
                obj.gbudy_budget = new_gad_budget
                obj.gbudy_is_archive = is_archived
                obj.save(update_fields=['gbudy_budget', 'gbudy_is_archive'])
                
        else:
            # For newly created records, just update archive status if needed
            obj.gbudy_is_archive = is_archived
            obj.save(update_fields=['gbudy_is_archive'])

# for updating
@receiver(post_save, sender='treasurer.Budget_Plan_Detail')
def sync_expense_particular(sender, instance, created, **kwargs):
    Expense_Particular = apps.get_model('treasurer', 'Expense_Particular')
    
    try:
        # Try to get existing expense particular
        expense_particular = Expense_Particular.objects.get(
            exp_budget_item=instance.dtl_budget_item,
            plan=instance.plan
        )
        
        # Calculate the difference between budget plan and expense particular
        budget_from_budget_plan = instance.dtl_proposed_budget
        current_expense_particular = expense_particular.exp_proposed_budget
        
        # Only update if there's a difference
        if budget_from_budget_plan != current_expense_particular:
            # Calculate the amount needed to adjust
            amount_needed = budget_from_budget_plan - current_expense_particular
            
            # Update by adding the difference
            expense_particular.exp_proposed_budget += amount_needed
            expense_particular.save(update_fields=['exp_proposed_budget'])

    except Expense_Particular.DoesNotExist:
        # Create new expense particular with the budget plan amount
        Expense_Particular.objects.create(
            exp_budget_item=instance.dtl_budget_item,
            exp_proposed_budget=instance.dtl_proposed_budget,
            plan=instance.plan
        )

# for archiving and deleting
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