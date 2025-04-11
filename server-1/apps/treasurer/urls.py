from django.urls import path
from .views import *


urlpatterns=[

    path('budget-plan/', Budget_HeaderView.as_view(), name = 'treasurer-budget-plan'),
    path('budget-plan-details/', Budget_Plan_DetailView.as_view(), name='treasurer-budget-plan-details'),
    path('budget-plan/<int:plan_id>/', Delete_Update_Retrieve_BudgetPlanView.as_view(), name='treasurer-manage-budget-plan'),
    # path('income-file/', Income_FileView.as_view(), name = 'treasurer-income-file'),
    # path('disbursement-file/', Disbursement_FileView.as_view(), name = 'treasurer-disbursement-file'),
    
    #EXPENSE URL
    path('income-expense-tracking/', Income_Expense_TrackingView.as_view(), name = 'treasurer-income-expense-tracking'),
    path('get-particular/', GetParticularsView.as_view(), name='current-year-budget-items'),
    path('update-income-expense-tracking/<int:iet_num>/', UpdateIncomeExpenseView.as_view(), name='treasurer-income-expense-tracking-update'),
    path('income-expense-tracking/<int:iet_num>/', DeleteIncomeExpenseView.as_view(), name = 'treasurer-income-expense-tracking-delete'),

    #INCOME URL
    path('income-tracking/', Income_TrackingView.as_view(), name = 'treasurer-income-tracking'),
    path('income-particular/', Income_ParticularView.as_view(), name = 'treasurer-income-particular'),
    path('update-income-tracking/<int:inc_num>/', UpdateIncomeTrackingView.as_view(), name='treasurer-income-tracking-update'),
    path('income-tracking/<int:inc_num>/', DeleteIncomeTrackingView.as_view(), name = 'treasurer-income-tracking-delete'),
    path('delete-income-particular/<int:incp_id>/', DeleteIncome_ParticularView.as_view(), name='treasurer-income-particular-delete')

]