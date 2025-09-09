from django.urls import path
from apps.administration.views.staff_views import HealthStaffListView
from .views.recipeint_report_views import UpdateMonthlyRCPReportDetailView
from .views.childmasterlist_supplement_views import ChildHealthSupplementsMasterReport
from .views.choptmonthly_summary_views import MonthlyOPTSummaryDetailedReport, OPTSummaryAllMonths
from .views.chopt_formplus_views import MonthlyOPTChildHealthSummariesAPIView, MonthlyOPTChildHealthReportAPIView
from .views.chsemiannual_opt_views import YearlySemiOPTChildHealthSummariesAPIView,SemiAnnualOPTChildHealthReportAPIView
from .views.chyearly_opt_tracking_views import YearlyMonthlyOPTChildHealthReportAPIView, YearlyOPTChildHealthSummariesAPIView
from .views.chart_views import NutritionalStatusMonthlyChart
from .views.chnewchildren_views import MonthlyNewChildrenCountAPIView,MonthlyChildrenDetailAPIView
from .views.medicines_views import MonthlyMedicineSummariesAPIView, MonthlyMedicineRecordsDetailAPIView, MonthlyMedicineChart
from .views.inv_medicine_views import MonthlyMedicineRecordsDetailAPIView, MedicineSummaryMonthsAPIView, MedicineExpiredOutOfStockSummaryAPIView, MonthlyMedicineExpiredOutOfStockDetailAPIView


urlpatterns=[
        path('healthstaff/', HealthStaffListView.as_view(), name='healthstaff-list'),
        path('update/monthly_recipient_list_report/<int:monthlyrcplist_id>/', UpdateMonthlyRCPReportDetailView.as_view(), name='healthstaff-detail'),
        
        
        # CHILD HEALTH REPORTS
        path('supplements/report/',ChildHealthSupplementsMasterReport.as_view(), name='monthly-child-health-supplements'),
        # over all summary 
        path('opt-tracking/summary/', OPTSummaryAllMonths.as_view(), name='opt-tracking-monthlyoverall'),
        path('opt-tracking/summary/<str:month>/', MonthlyOPTSummaryDetailedReport.as_view(), name='opt-tracking-detail-overall'),   
        # form-plus opt 
        path('opt-tracking/monthly/summaries/', MonthlyOPTChildHealthSummariesAPIView.as_view(), name='opt-tracking-detail'),
        path('opt-tracking/reports/<str:month>/', MonthlyOPTChildHealthReportAPIView.as_view(), name='opt-tracking-detail'),
        # New semi-annual 24-71 mos URLs
        path('opt-tracking/yearly-summaries-semi-annual/', YearlySemiOPTChildHealthSummariesAPIView.as_view(), name='yearly-child-health-summaries'),
        path('opt-tracking/semi-annual-report/<str:year>/',SemiAnnualOPTChildHealthReportAPIView.as_view(),  name='semi-annual-child-health-report'),
        # yearl 0-23 mos jan-decemeber opt tracking
        path('opt-tracking/yearly-report/<str:year>/', YearlyMonthlyOPTChildHealthReportAPIView.as_view(), name='yearly-child-health-report'),
        path('opt-tracking/yearly-summaries/', YearlyOPTChildHealthSummariesAPIView.as_view(), name='yearly-child-health-summaries'),
        
        #CHARTS
        path('nutritional-status/monthly-detail/<str:month>/', NutritionalStatusMonthlyChart.as_view(), name='nutritional-status-monthly-detail'),
        
        
        # NEW CHILDREN LIST
          path('new-monthly-children/', MonthlyNewChildrenCountAPIView.as_view(), name='monthly-children-count'),
          path('new-monthly-children-details/<str:month>/', MonthlyChildrenDetailAPIView.as_view(), name='monthly-children-detail'),
          
        # MEDICINE SERVICES REPORTS
        path('medicine-records/monthly/', MonthlyMedicineSummariesAPIView.as_view(), name='monthly_medicine_records'),
        path('medicine-reports/<str:month>/', MonthlyMedicineRecordsDetailAPIView.as_view(), name='medicine-reports'),
        path('medicines-request/monthly/chart/<str:month>/',MonthlyMedicineChart.as_view(), name='medicines_list'),
        
        
        # INVENTORY MEDICINE REPORTS
       path('medicine/records/<str:month>/',MonthlyMedicineRecordsDetailAPIView.as_view(),name='medicine-monthly-records'),
      path('medicine/summaries/', MedicineSummaryMonthsAPIView.as_view(), name='medicine-summary-montly'),
      path('medicine-expired-out-of-stock-summary/', MedicineExpiredOutOfStockSummaryAPIView.as_view(), name='outofexpiredstocks-monthly-records'),
      path('medicine-expired-out-of-stock-detail/<str:month>/', MonthlyMedicineExpiredOutOfStockDetailAPIView.as_view(), name='outofexpiredstocks-chart'),

        # path('medicine/records/<str:month>/', MonthlyMedicineRecordsDetailAPIView.as_view(), name='medicine-monthly-records'),
]