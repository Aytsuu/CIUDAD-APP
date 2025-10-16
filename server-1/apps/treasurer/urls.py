from django.urls import path
from .views import *


urlpatterns=[

    # Budget Plan and Budget Details URL
    path('budget-plan-analytics/', BudgetPlanAnalyticsView.as_view(), name='budget-plan-analytics'),
    path('budget-plan-active/', BudgetPlanActiveView.as_view(), name = 'budget-plan-active'),
    path('budget-plan-inactive/', BudgetPlanInactiveView.as_view(), name = 'budget-plan-inactive'),
    path('budget-plan-detail/', BudgetPlanDetailView.as_view(), name='treasurer-budget-plan-details'),
    path('budget-plan/<int:plan_id>/', DeleteRetrieveBudgetPlanAndDetails.as_view(), name='treasurer-manage-budget-plan'),
    path('update-budget-plan/<int:plan_id>/', UpdateBudgetPlan.as_view(), name='treasurer-update-budget-plan'),
    path('update-budget-details/<int:dtl_id>/', UpdateBudgetDetails.as_view(), name='treasurer-update-budget-details'),
    path('budget-plan-file/', BudgetPlanFileView.as_view(), name = 'budget-plan-file'),
    path('budget-plan-file/<int:plan_id>/', BudgetPlanFileRetrieveView.as_view(), name = 'budget-plan-file-records'),
    path('delete-budget-plan-file/<int:bpf_id>/', DeleteBudgetPlanFile.as_view(), name = 'delete-budget-plan-file'),
    path('budget-plan-history/', BudgetPlanHistoryView.as_view(), name='budget-plan-history'),
    path('budget-plan-history/<int:plan_id>/', BudgetPlanHistoryView.as_view(), name='budget-plan-history-record'),
    path('previous-budget-plan/', PreviousYearBudgetPlanView.as_view(), name='previous-budget-plan'),
    path('previous-budget-plan-details/', PreviousYearBudgetPlanDetailsView.as_view(), name='previous-budget-plan-details'),


    #Disbursement URL
    path('disbursement-vouchers/', DisbursementVoucherView.as_view(), name='disbursement-voucher-list-create'),
    path('disbursement-vouchers/<int:dis_num>/', DisbursementVoucherDetailView.as_view(), name='disbursement-voucher-detail'),
    path('disbursement-vouchers/<int:dis_num>/archive/', DisbursementVoucherArchiveView.as_view(), name='disbursement-voucher-archive'),
    path('disbursement-vouchers/<int:dis_num>/restore/', DisbursementVoucherRestoreView.as_view(), name='disbursement-voucher-restore'),
    path('disbursement-files/', DisbursementFileView.as_view(), name='disbursement-file-list-create'),
    path('disbursement-files/<int:disf_num>/', DisbursementFileDetailView.as_view(), name='disbursement-file-detail'),
    path('disbursement-files/<int:disf_num>/archive/', DisbursementFileArchiveView.as_view(), name='disbursement-file-archive'),
    path('disbursement-files/<int:disf_num>/restore/', DisbursementFileRestoreView.as_view(), name='disbursement-file-restore'),
    path('disbursement-vouchers/<int:dis_num>/files/', DisbursementFileCreateView.as_view(), name='disbursement-voucher-files'),
    path('disbursement-vouchers/years/', DisbursementVoucherYearsView.as_view(), name='disbursement-voucher-years'),
    
    #EXPENSE URL
    path('income-expense-tracking/', Income_Expense_TrackingView.as_view(), name = 'treasurer-income-expense-tracking'),
    path('update-income-expense-tracking/<int:iet_num>/', UpdateIncomeExpenseView.as_view(), name='treasurer-income-expense-tracking-update'),
    path('income-expense-tracking/<int:iet_num>/', DeleteIncomeExpenseView.as_view(), name = 'treasurer-income-expense-tracking-delete'),
    path('expense-particular/', ExpenseParticulartView.as_view(), name='treasurer-expense-particular'),
    path('get-expense_particular/', GetExpenseParticularsView.as_view(), name='current-year-expense-particular'),
    path('update-expense-particular/<int:year>/<int:exp_id>/', UpdateExpenseParticularView.as_view(), name = 'treasurer-update-expense-particular'),

    path('get-particular/', GetParticularsView.as_view(), name='current-year-budget-items'),
    path('update-budget-detail/<int:year>/<int:dtl_id>/', UpdateBudgetPlanDetailView.as_view(), name = 'treasurer-update-budget-plan-detail'),

    #EXPENSE LOG
    path('expense-log/', Expense_LogView.as_view(), name='expense-log-list'),

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
    path('annual-gross-sales-active/', Annual_Gross_SalesActiveView.as_view(), name='annual-gross-sales-active'),
    path('all-annual-gross-sales/', All_Annual_Gross_SalesView.as_view(), name='all-annual-gross-sales-'),
    path('delete-annual-gross-sales/<int:ags_id>/', DeleteUpdate_Annual_Gross_SalesView.as_view(), name='annual-gross-sales-delete'),
    path('purpose-and-rate/', Purpose_And_RatesView.as_view(), name='purpose-and-rate-add'),
    path('purpose-and-rate-personal-active/', Purpose_And_RatesPersonalActiveView.as_view(), name='purpose-and-rate-personal-active'),
    path('purpose-and-rate-all-personal/', Purpose_And_RatesAllPersonalView.as_view(), name='purpose-and-rate-all-personal'),
    path('purpose-and-rate-service-charge-active/', Purpose_And_RatesServiceChargeActiveView.as_view(), name='purpose-and-rate-service-charge-active'),
    path('purpose-and-rate-all-service-charge/', Purpose_And_RatesAllServiceChargeView.as_view(), name='purpose-and-rate-all-service-charge'),
    path('purpose-and-rate-barangay-permit-active/', Purpose_And_RatesBarangayPermitActiveView.as_view(), name='purpose-and-rate-barangay-permit-active'),
    path('purpose-and-rate-all-barangay-permit/', Purpose_And_RatesAllBarangayPermitView.as_view(), name='purpose-and-rate-all-barangay-permit'),
    path('delete-purpose-and-rate/<int:pr_id>/', DeleteUpdate_Purpose_And_RatesView.as_view(), name = 'purpose-and-rate-delete'),
    path('update-annual-gross-sales/<int:ags_id>/', DeleteUpdate_Annual_Gross_SalesView.as_view(), name = 'annual-gross-sales-update'),
    path('update-purpose-and-rate/<int:pr_id>/', DeleteUpdate_Purpose_And_RatesView.as_view(), name='update-purpose-and-rate'),
    path('purpose-rates/', PurposeAndRatesByPurposeView.as_view(), name='purpose-rates-by-purpose'),


    #RECEIPTS
    path('invoice/', InvoiceView.as_view(), name='invoice_tracking'),

    #CLEARANCE REQUESTS
    path('clearance-request/', ClearanceRequestListView.as_view(), name='clearance-request-list'),
    path('clearance-request/<str:cr_id>/', ClearanceRequestDetailView.as_view(), name='clearance-request-detail'),
    path('clearance-request/<str:cr_id>/payment-status/', UpdatePaymentStatusView.as_view(), name='update-payment-status'),
    path('clearance-request/payment-statistics/', PaymentStatisticsView.as_view(), name='payment-statistics'),
    path('resident-names/', ResidentNameListView.as_view(), name='resident-names')
]