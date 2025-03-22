from django.urls import path
from .views import *


urlpatterns=[

    path('budget-plan/', Budget_PlanView.as_view(), name = 'treasurer-budget-plan'),
    path('budget-plan-details/', Budget_Plan_DetailView.as_view(), name='treasurer-budget-plan-details'),
    path('budget-plan/<int:plan_id>/', Delete_Update_Retrieve_BudgetPlanView.as_view(), name='treasurer-manage-budget-plan'),
    # path('income-file/', Income_FileView.as_view(), name = 'treasurer-income-file'),
    # path('disbursement-file/', Disbursement_FileView.as_view(), name = 'treasurer-disbursement-file'),
    path('income-expense-tracking/', Income_Expense_TrackingView.as_view(), name = 'treasurer-income-expense-tracking'),


    #------------------------------------------------- DELETE ---------------------------------------------------------------------------------------------------

    path('income-expense-tracking/<int:iet_num>/', DeleteIncomeExpenseView.as_view(), name = 'treasurer-income-expense-tracking-delete'),

    #------------------------------------------------- UPDATE ---------------------------------------------------------------------------------------------------

    path('update-income-expense-tracking/<int:iet_num>/', UpdateIncomeExpenseView.as_view(), name='treasurer-income-expense-tracking-update')
    

]