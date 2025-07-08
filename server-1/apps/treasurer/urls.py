from django.urls import path
from .views import *


urlpatterns=[

    # Budget Plan and Budget Details URL
    path('budget-plan/', BudgetPlanView.as_view(), name = 'treasurer-budget-plan'),
    path('budget-plan-detail/', BudgetPlanDetailView.as_view(), name='treasurer-budget-plan-details'),
    path('budget-plan/<int:plan_id>/', DeleteRetrieveBudgetPlanAndDetails.as_view(), name='treasurer-manage-budget-plan'),
    path('update-budget-plan/<int:plan_id>/', UpdateBudgetPlan.as_view(), name='treasurer-update-budget-plan'),
    path('update-budget-details/<int:dtl_id>/', UpdateBudgetDetails.as_view(), name='treasurer-update-budget-details'),
<<<<<<< HEAD
    path('budget-plan-file/', BudgetPlanFileView.as_view(), name = 'budget-plan-file'),
    path('budget-plan-file/<int:plan_id>/', BudgetPlanFileRetrieveView.as_view(), name = 'budget-plan-file-records'),
    path('delete-budget-plan-file/<int:bpf_id>/', DeleteBudgetPlanFile.as_view(), name = 'delete-budget-plan-file'),
    path('budget-plan-history/', BudgetPlanHistoryView.as_view(), name='budget-plan-history'),
    path('budget-plan-history/<int:plan_id>/', BudgetPlanHistoryView.as_view(), name='budget-plan-history-record'),
    path('previous-budget-plan/', PreviousYearBudgetPlanView.as_view(), name='previous-budget-plan'),
    path('previous-budget-plan-details/', PreviousYearBudgetPlanDetailsView.as_view(), name='previous-budget-plan-details'),
=======
    path('budget-plan/history/<int:plan_id>/', BudgetPlanHistoryView.as_view(), name='budget-plan-history'),
    path('budget-plan-and-detail/history/<int:plan_id>/', RetrieveBudgetPlanAndDetailHistoryView.as_view(), name='budget-plan-and-detail-history'),
>>>>>>> c1ea12edf (working personal clerance request)

    #Income and Disbursement URL
        # Income Folder URLs
    path('income-tab/folders/', IncomeFolderListView.as_view()),
    path('income-tab/folders/<int:inf_num>/', IncomeFolderDetailView.as_view()),
    path('income-tab/folders/<int:inf_num>/restore/', RestoreIncomeFolderView.as_view()),
        # Disbursement Folder URLs
    path('disbursement-tab/folders/', DisbursementFolderListView.as_view()),
    path('disbursement-tab/folders/<int:dis_num>/', DisbursementFolderDetailView.as_view()),
    path('disbursement-tab/folders/<int:dis_num>/restore/', RestoreDisbursementFolderView.as_view()),
        # Image URLs (shared for both archive/delete via query params)
    path('income-tab/images/', Income_ImageListView.as_view()),
    path('income-tab/images/<int:infi_num>/', Income_ImageView.as_view()),
    path('disbursement-tab/images/', Disbursement_ImageListView.as_view()),
    path('disbursement-tab/images/<int:disf_num>/', Disbursement_ImageView.as_view()),
    
    #EXPENSE URL
    path('income-expense-tracking/', Income_Expense_TrackingView.as_view(), name = 'treasurer-income-expense-tracking'),
    path('update-income-expense-tracking/<int:iet_num>/', UpdateIncomeExpenseView.as_view(), name='treasurer-income-expense-tracking-update'),
    path('income-expense-tracking/<int:iet_num>/', DeleteIncomeExpenseView.as_view(), name = 'treasurer-income-expense-tracking-delete'),
    path('expense-particular/', ExpenseParticulartView.as_view(), name='treasurer-expense-particular'),
    path('get-expense_particular/', GetExpenseParticularsView.as_view(), name='current-year-expense-particular'),
    path('update-expense-particular/<int:year>/<int:exp_id>/', UpdateExpenseParticularView.as_view(), name = 'treasurer-update-expense-particular'),

    path('get-particular/', GetParticularsView.as_view(), name='current-year-budget-items'),
    path('update-budget-detail/<int:year>/<int:dtl_id>/', UpdateBudgetPlanDetailView.as_view(), name = 'treasurer-update-budget-plan-detail'),

    #INCOME URL
    path('income-tracking/', Income_TrackingView.as_view(), name = 'treasurer-income-tracking'),
    path('income-particular/', Income_ParticularView.as_view(), name = 'treasurer-income-particular'),
    path('update-income-tracking/<int:inc_num>/', UpdateIncomeTrackingView.as_view(), name='treasurer-income-tracking-update'),
    path('income-tracking/<int:inc_num>/', DeleteIncomeTrackingView.as_view(), name = 'treasurer-income-tracking-delete'),
    path('delete-income-particular/<int:incp_id>/', DeleteIncome_ParticularView.as_view(), name='treasurer-income-particular-delete'),

    #INCOME EXPENSE MAIN
    path('income-expense-main/', Income_Expense_MainView.as_view(), name='income-expense-main-card'),
    path('update-income-expense-main/<int:ie_main_year>/', UpdateIncome_Expense_MainView.as_view(), name='income-expense-file-detail'),


    #INCOME EXPENSE FILE FOLDER
    path('inc-exp-file/', Income_Expense_FileView.as_view(), name='income-expense-main-file'),
    path('income-expense-files/', Income_Expense_FileView.as_view(), name='income-expense-files-list'),
    # delete in the update if the user decided to remove it in the form
    path('income-expense-file/<int:ief_id>/', IncomeExpenseFileDetailView.as_view(), name='income-expense-file-detail'),
    
    #RATES
    path('annual-gross-sales/', Annual_Gross_SalesView.as_view(), name='annual-gross-sales-add'),
    path('delete-annual-gross-sales/<int:ags_id>/', DeleteUpdate_Annual_Gross_SalesView.as_view(), name='annual-gross-sales-delete'),
    path('purpose-and-rate/', Purpose_And_RatesView.as_view(), name='purpose-and-rate-add'),
    path('delete-purpose-and-rate/<int:pr_id>/', DeleteUpdate_Purpose_And_RatesView.as_view(), name = 'purpose-and-rate-delete'),
    path('update-annual-gross-sales/<int:ags_id>/', DeleteUpdate_Annual_Gross_SalesView.as_view(), name = 'annual-gross-sales-update'),
    path('update-purpose-and-rate/<int:pr_id>/', DeleteUpdate_Purpose_And_RatesView.as_view(), name='update-purpose-and-rate'),


    #RECEIPTS
    path('invoice/', InvoiceView.as_view(), name='invoice_tracking'),
]