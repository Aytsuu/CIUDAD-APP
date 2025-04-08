from django.urls import path
from .views import *


urlpatterns=[
    path('budget-plan/', Budget_PlanView.as_view(), name = 'treasurer-budget-plan'),
    path('current-expenditure-personal/', Current_Expenditures_PersonalView.as_view(), name = 'treasurer-budget-plan-personal'),
    path('current-expenditure-maintenance/', Current_Expenditures_MaintenanceView.as_view(), name = 'treasurer-budget-plan-maintenance'),
    path('other-maintenance-and-operating-expense/', Other_Maint_And_Operating_ExpenseView.as_view(), name = 'treasurer-budget-plan-other-expense'),
    path('capital-outlays-and-nonoffice/', Capital_Outlays_And_Non_OfficeView.as_view(), name = 'treasurer-budget-plan-capital-and-nonoffice'),
    # path('income-file/', Income_FileView.as_view(), name = 'treasurer-income-file'),
    # path('disbursement-file/', Disbursement_FileView.as_view(), name = 'treasurer-disbursement-file'),
    # path('income-expense-tracking/', Income_Expense_TrackingView.as_view(), name = 'treasurer-income-expense-tracking'),
]